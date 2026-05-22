"""
Watermark Scanner — The Venture Republic
Scans all articles in MongoDB via Gemini Vision and deletes watermarked ones.
Run: python3 watermark_scan.py
"""

import asyncio
import base64
import json
import aiohttp
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

MONGO_URL = "mongodb+srv://admin:sscBnar6pLNqaaL7@cluster0.tuk1rfj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "venture_republic"
GEMINI_KEY = "AIzaSyCiNXpR7YG2TZK0nHZUzOUIWIYb0-RMUio"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_KEY}"
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36"}

WATERMARK_PROMPT = (
    "Look at this news article image. Does it contain any of the following: "
    "a publication logo watermark, an 'ET Rise' logo, 'Economic Times' branding, "
    "'ET Tech' branding, 'YourStory' logo overlay, 'Inc42' logo overlay, "
    "any news outlet logo embedded IN the image, or promotional/editorial branding "
    "overlaid on the photo? Respond with JSON only: "
    '{\"has_watermark\": true/false, \"reason\": \"brief reason\"}'
)

# Known bad image patterns (URL-based fast check)
BAD_URL_PATTERNS = [
    "editionshow.jpg",
    "overlay-et",
    "overlay-rise",
    "et-rise",
    "etrise",
    "logo-et",
    "et-logo",
]

def url_looks_watermarked(url: str) -> bool:
    u = url.lower()
    return any(p in u for p in BAD_URL_PATTERNS)

async def fetch_image(session, url: str):
    try:
        async with session.get(url, headers=HEADERS, timeout=aiohttp.ClientTimeout(total=20), ssl=False) as r:
            if r.status == 200:
                data = await r.read()
                ct = r.content_type or "image/jpeg"
                if "svg" in ct or len(data) < 5000:
                    return None, None
                return base64.b64encode(data).decode(), ct
    except Exception as e:
        pass
    return None, None

async def check_watermark(session, img_b64: str, ct: str) -> tuple[bool, str]:
    payload = {
        "contents": [{"parts": [
            {"text": WATERMARK_PROMPT},
            {"inline_data": {"mime_type": ct, "data": img_b64}},
        ]}],
        "generationConfig": {
            "temperature": 0,
            "maxOutputTokens": 200,
        },
    }
    try:
        async with session.post(
            GEMINI_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=aiohttp.ClientTimeout(total=30),
            ssl=False,
        ) as r:
            if r.status != 200:
                text = await r.text()
                return False, f"Gemini HTTP {r.status}"
            body = await r.json()
            raw = body["candidates"][0]["content"]["parts"][0]["text"].strip()
            # Strip markdown fences if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            result = json.loads(raw)
            return bool(result.get("has_watermark", False)), result.get("reason", "")
    except json.JSONDecodeError as e:
        return False, f"JSON parse error: {e}"
    except Exception as e:
        return False, f"Error: {e}"

async def scan_group(group_id: int, articles: list, col, sem: asyncio.Semaphore, results: dict):
    """Scan a group of articles for watermarks."""
    deleted = []
    skipped = []
    clean = []

    async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=False, limit=5)) as session:
        for art in articles:
            art_id = art["id"]
            url = art["image"]
            title = art["title"][:55]
            source = art["source"]

            # Fast URL check
            if url_looks_watermarked(url):
                async with sem:
                    await col.update_one({"id": art_id}, {"$set": {"is_active": False}})
                deleted.append(art_id)
                print(f"  [G{group_id}] 🗑️  URL-flagged [{source}] {title}")
                continue

            # Fetch image
            async with sem:
                img_b64, ct = await fetch_image(session, url)

            if not img_b64:
                skipped.append(art_id)
                print(f"  [G{group_id}] ⚠️  no-img [{source}] {title}")
                continue

            # Gemini Vision check
            has_wm, reason = await check_watermark(session, img_b64, ct)

            if has_wm:
                await col.update_one({"id": art_id}, {"$set": {"is_active": False}})
                deleted.append(art_id)
                print(f"  [G{group_id}] 🗑️  WATERMARK [{source}] {title} → {reason}")
            else:
                clean.append(art_id)
                print(f"  [G{group_id}] ✅  clean [{source}] {title}")

            await asyncio.sleep(0.3)  # Rate limit

    results[group_id] = {"deleted": deleted, "skipped": skipped, "clean": clean}
    print(f"\n  [G{group_id}] DONE — {len(deleted)} deleted, {len(clean)} clean, {len(skipped)} skipped\n")

async def main():
    print(f"\n{'='*60}")
    print(f"  THE VENTURE REPUBLIC — Watermark Scanner")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    col = db.news

    # Fetch all active articles
    articles = []
    async for doc in col.find(
        {"is_active": True, "image": {"$exists": True, "$ne": ""}},
        {"id": 1, "image": 1, "source": 1, "title": 1}
    ):
        articles.append({
            "id": str(doc.get("id", "")),
            "image": str(doc.get("image", "")),
            "source": str(doc.get("source", "")),
            "title": str(doc.get("title", ""))[:60],
        })

    total = len(articles)
    print(f"  Articles to scan: {total}\n")

    if not articles:
        print("  No articles found.")
        client.close()
        return

    # Split into 10 groups
    NUM_GROUPS = 10
    group_size = (total + NUM_GROUPS - 1) // NUM_GROUPS
    groups = [articles[i:i+group_size] for i in range(0, total, group_size)]
    print(f"  Groups: {len(groups)} × ~{group_size} articles\n")
    print(f"{'─'*60}\n")

    sem = asyncio.Semaphore(10)
    results = {}

    # Launch all groups concurrently
    tasks = [
        scan_group(i+1, group, col, sem, results)
        for i, group in enumerate(groups)
    ]
    await asyncio.gather(*tasks)

    # Final summary
    total_deleted = sum(len(r["deleted"]) for r in results.values())
    total_clean = sum(len(r["clean"]) for r in results.values())
    total_skipped = sum(len(r["skipped"]) for r in results.values())

    remaining = await col.count_documents({"is_active": True})

    print(f"\n{'='*60}")
    print(f"  SCAN COMPLETE")
    print(f"  Scanned  : {total}")
    print(f"  🗑️  Deleted : {total_deleted}  (set is_active=False)")
    print(f"  ✅ Clean   : {total_clean}")
    print(f"  ⚠️  Skipped : {total_skipped}  (image unavailable)")
    print(f"  📰 Remaining active: {remaining}")
    print(f"{'='*60}\n")

    if total_deleted > 0:
        print("  Deleted article IDs:")
        for r in results.values():
            for did in r["deleted"]:
                print(f"    - {did}")

    client.close()

asyncio.run(main())
