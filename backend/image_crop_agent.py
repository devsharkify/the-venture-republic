"""
Image Crop Agent — The Venture Republic
Detects publication logos in corners of article images via Gemini Vision,
crops them out with Pillow, saves to /uploads/, and updates MongoDB.
Run: python3 image_crop_agent.py
"""

import asyncio, base64, json, io, os, uuid as _uuid
import aiohttp
from motor.motor_asyncio import AsyncIOMotorClient
from PIL import Image
from datetime import datetime

MONGO_URL   = "mongodb+srv://admin:sscBnar6pLNqaaL7@cluster0.tuk1rfj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME     = "venture_republic"
GEMINI_KEY  = "AIzaSyCiNXpR7YG2TZK0nHZUzOUIWIYb0-RMUio"
GEMINI_URL  = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_KEY}"
HEADERS     = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
BASE_URL    = "https://www.theventurerepublic.in/uploads"

# How many rows/columns to crop per position (fraction of image dimension)
CROP_FRACTIONS = {
    "bottom-right": {"bottom": 0.13, "right":  0.0},  # crop bottom 13%
    "bottom-left":  {"bottom": 0.13, "left":   0.0},
    "top-right":    {"top":    0.10, "right":  0.0},
    "top-left":     {"top":    0.10, "left":   0.0},
    "bottom":       {"bottom": 0.13},
    "top":          {"top":    0.10},
    "right":        {"right":  0.12},
    "left":         {"left":   0.12},
}

POSITION_PROMPT = (
    "Does this image contain a publication logo, watermark, or media outlet branding "
    "(e.g. YS, YourStory, Inc42, Entrackr, Mint, ET, Bloomberg, TechCrunch)? "
    "If yes, where exactly is it positioned? "
    "Respond ONLY with JSON (no markdown): "
    '{"has_logo": true/false, "position": "bottom-right|bottom-left|top-right|top-left|bottom|top|center|none", '
    '"size": "tiny|small|medium|large"}'
)

os.makedirs(UPLOADS_DIR, exist_ok=True)

# ── helpers ────────────────────────────────────────────────────────────────────

async def fetch_image_bytes(session, url: str):
    try:
        async with session.get(url, headers=HEADERS, timeout=aiohttp.ClientTimeout(total=20), ssl=False) as r:
            if r.status == 200:
                data = await r.read()
                ct   = r.content_type or "image/jpeg"
                if "svg" in ct or len(data) < 5000:
                    return None, None, None
                return data, base64.b64encode(data).decode(), ct
    except Exception:
        pass
    return None, None, None

async def ask_gemini_position(session, img_b64: str, ct: str):
    payload = {
        "contents": [{"parts": [
            {"text": POSITION_PROMPT},
            {"inline_data": {"mime_type": ct, "data": img_b64}},
        ]}],
        "generationConfig": {"temperature": 0, "maxOutputTokens": 300},
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
                return None
            body = await r.json()
            raw  = body["candidates"][0]["content"]["parts"][0]["text"].strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            return json.loads(raw)
    except Exception as e:
        print(f"    Gemini error: {e}")
        return None

def crop_image(img_bytes: bytes, position: str, size: str):
    """Crop the logo area from the image and return new JPEG bytes."""
    try:
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        w, h = img.size

        # Increase crop fraction slightly for larger logos
        scale = 1.0 if size in ("tiny", "small") else 1.5 if size == "medium" else 2.0

        fracs = CROP_FRACTIONS.get(position)
        if not fracs:
            return None  # unknown/center — can't easily crop

        left   = int(w * fracs.get("left",   0) * scale)
        top    = int(h * fracs.get("top",    0) * scale)
        right  = w - int(w * fracs.get("right",  0) * scale)
        bottom = h - int(h * fracs.get("bottom", 0) * scale)

        # Clamp to valid bounds
        left   = max(0, min(left,   w - 1))
        top    = max(0, min(top,    h - 1))
        right  = max(left + 1, min(right,  w))
        bottom = max(top + 1,  min(bottom, h))

        cropped = img.crop((left, top, right, bottom))
        buf = io.BytesIO()
        cropped.save(buf, format="JPEG", quality=88, optimize=True)
        return buf.getvalue()
    except Exception as e:
        print(f"    Crop error: {e}")
        return None

def save_image(art_id: str, img_bytes: bytes) -> str:
    """Save image to uploads/ and return the public URL."""
    fname = f"{art_id}.jpg"
    path  = os.path.join(UPLOADS_DIR, fname)
    with open(path, "wb") as f:
        f.write(img_bytes)
    return f"{BASE_URL}/{fname}"

# ── main ───────────────────────────────────────────────────────────────────────

async def process_group(group_id: int, articles: list, col, sem: asyncio.Semaphore, results: dict):
    cropped  = []
    skipped  = []
    no_logo  = []

    async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=False, limit=5)) as session:
        for art in articles:
            art_id = art["id"]
            url    = art["image"]
            title  = art["title"][:52]
            source = art["source"]

            # Skip already-local images (already cropped)
            if "theventurerepublic.in/uploads" in url:
                no_logo.append(art_id)
                continue

            async with sem:
                raw_bytes, img_b64, ct = await fetch_image_bytes(session, url)

            if not img_b64:
                skipped.append(art_id)
                print(f"  [G{group_id}] ⚠️  no-fetch [{source}] {title}")
                continue

            # Ask Gemini for logo position
            result = await ask_gemini_position(session, img_b64, ct)

            if not result or not result.get("has_logo"):
                no_logo.append(art_id)
                print(f"  [G{group_id}] ✅  no-logo  [{source}] {title}")
                await asyncio.sleep(0.2)
                continue

            position = result.get("position", "none")
            size     = result.get("size", "small")
            print(f"  [G{group_id}] 🔍  logo={position}/{size} [{source}] {title}")

            if position in ("none", "center"):
                no_logo.append(art_id)
                print(f"  [G{group_id}]    → center/none — skipping crop")
                await asyncio.sleep(0.2)
                continue

            # Crop the logo area
            new_bytes = crop_image(raw_bytes, position, size)
            if not new_bytes:
                skipped.append(art_id)
                print(f"  [G{group_id}]    → crop failed")
                await asyncio.sleep(0.2)
                continue

            # Save and update DB
            new_url = save_image(art_id, new_bytes)
            await col.update_one({"id": art_id}, {"$set": {"image": new_url}})
            cropped.append({"id": art_id, "source": source, "position": position})
            print(f"  [G{group_id}] ✂️   CROPPED  [{source}] {title}")
            print(f"  [G{group_id}]    → {new_url}")

            await asyncio.sleep(0.3)

    results[group_id] = {"cropped": cropped, "skipped": skipped, "no_logo": no_logo}
    print(f"\n  [G{group_id}] DONE — {len(cropped)} cropped, {len(no_logo)} clean, {len(skipped)} skipped\n")

async def main():
    print(f"\n{'='*62}")
    print(f"  TVR Image Crop Agent  —  {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*62}\n")

    client = AsyncIOMotorClient(MONGO_URL)
    db     = client[DB_NAME]
    col    = db.news

    articles = []
    async for doc in col.find(
        {"is_active": True, "image": {"$exists": True, "$ne": ""}},
        {"id": 1, "image": 1, "source": 1, "title": 1}
    ):
        articles.append({
            "id":     str(doc.get("id",     "")),
            "image":  str(doc.get("image",  "")),
            "source": str(doc.get("source", "")),
            "title":  str(doc.get("title",  ""))[:60],
        })

    total = len(articles)
    print(f"  Active articles : {total}")
    print(f"  Uploads dir     : {UPLOADS_DIR}\n")

    NUM_GROUPS = 10
    group_size = (total + NUM_GROUPS - 1) // NUM_GROUPS
    groups     = [articles[i:i+group_size] for i in range(0, total, group_size)]
    print(f"  Splitting into {len(groups)} groups × ~{group_size} articles\n{'─'*62}\n")

    sem     = asyncio.Semaphore(10)
    results = {}

    await asyncio.gather(*[
        process_group(i + 1, grp, col, sem, results)
        for i, grp in enumerate(groups)
    ])

    total_cropped = sum(len(r["cropped"]) for r in results.values())
    total_clean   = sum(len(r["no_logo"]) for r in results.values())
    total_skipped = sum(len(r["skipped"]) for r in results.values())

    print(f"\n{'='*62}")
    print(f"  CROP AGENT COMPLETE")
    print(f"  ✂️  Cropped  : {total_cropped}")
    print(f"  ✅ Clean    : {total_clean}")
    print(f"  ⚠️  Skipped  : {total_skipped}")
    print(f"{'='*62}\n")

    if total_cropped:
        print("  Cropped articles:")
        for r in results.values():
            for c in r["cropped"]:
                print(f"    [{c['source']}] {c['position']} → {c['id']}")

    client.close()

asyncio.run(main())
