import os as _os
try:
    from dotenv import load_dotenv as _lde; _lde()
except ImportError:
    pass
"""
Full Image Audit — The Venture Republic
For EVERY active article image (regardless of URL):
  1. Download image
  2. Gemini Vision: does it have a publication logo?
  3. If YES → zoom-crop 17% from all 4 sides
  4. Re-check cropped image with Gemini
  5. If logo STILL present → deactivate the article (rule: can't remove = don't post)
  6. If clean (never had logo or crop removed it) → save to /uploads/ + update DB
Run: python3 full_image_audit.py
"""

import asyncio, base64, io, json, os, re, subprocess
import aiohttp
from motor.motor_asyncio import AsyncIOMotorClient
from PIL import Image
from datetime import datetime

MONGO_URL   = "mongodb+srv://admin:sscBnar6pLNqaaL7@cluster0.tuk1rfj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME     = "venture_republic"
GEMINI_KEY  = _os.getenv("GEMINI_API_KEY", "")
GEMINI_URL  = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_KEY}"
HEADERS     = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
GITHUB_RAW  = "https://raw.githubusercontent.com/devsharkify/the-venture-republic/main/backend/uploads"

ZOOM_CROP   = 0.17   # 17% from each edge — aggressive enough to kill most corner logos

LOGO_PROMPT = (
    "Does this image contain a publication/media brand logo, watermark, or outlet name text "
    "(e.g. YourStory, Inc42, Entrackr, Mint, Economic Times, ET, Bloomberg, TechCrunch, "
    "StartupTalky, The Tech Panda, VCCircle, Moneycontrol, NDTV, Forbes, Reuters, BBC)? "
    "Answer ONLY with JSON (no markdown): "
    '{"has_logo": true/false, "position": "top-right|top-left|bottom-right|bottom-left|center|none", '
    '"confidence": "high|medium|low"}'
)

os.makedirs(UPLOADS_DIR, exist_ok=True)

# ─── helpers ───────────────────────────────────────────────────────────────────

async def fetch_image(session: aiohttp.ClientSession, url: str):
    try:
        async with session.get(url, headers=HEADERS, timeout=aiohttp.ClientTimeout(total=25), ssl=False) as r:
            if r.status == 200:
                data = await r.read()
                ct   = r.content_type or "image/jpeg"
                if "svg" in ct or len(data) < 4000:
                    return None, None, None
                return data, base64.b64encode(data).decode(), ct
    except Exception:
        pass
    return None, None, None

async def gemini_has_logo(session: aiohttp.ClientSession, img_b64: str, ct: str) -> dict:
    payload = {
        "contents": [{"parts": [
            {"text": LOGO_PROMPT},
            {"inline_data": {"mime_type": ct, "data": img_b64}},
        ]}],
        "generationConfig": {"temperature": 0, "maxOutputTokens": 200},
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
                return {"has_logo": False}
            body = await r.json()
            raw = body["candidates"][0]["content"]["parts"][0]["text"].strip()
            raw = re.sub(r"^```json?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            return json.loads(raw)
    except Exception as e:
        print(f"    Gemini err: {e}")
        return {"has_logo": False}

def zoom_crop(img_bytes: bytes, z: float = ZOOM_CROP):
    try:
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        w, h = img.size
        left   = int(w * z)
        top    = int(h * z)
        right  = w - int(w * z)
        bottom = h - int(h * z)
        left   = max(0, min(left, w - 1))
        top    = max(0, min(top, h - 1))
        right  = max(left + 10, min(right, w))
        bottom = max(top + 10, min(bottom, h))
        cropped = img.crop((left, top, right, bottom))
        buf = io.BytesIO()
        cropped.save(buf, format="JPEG", quality=88, optimize=True)
        return buf.getvalue()
    except Exception as e:
        print(f"    Crop err: {e}")
        return None

def save_upload(art_id: str, data: bytes) -> str:
    fname = f"{art_id}.jpg"
    path  = os.path.join(UPLOADS_DIR, fname)
    with open(path, "wb") as f:
        f.write(data)
    return f"{GITHUB_RAW}/{fname}"

# ─── per-article processing ────────────────────────────────────────────────────

async def process_article(worker_id: int, art: dict, col, session: aiohttp.ClientSession, sem: asyncio.Semaphore, stats: dict):
    art_id = art["id"]
    url    = art["image"]
    title  = art["title"][:52]
    source = art.get("source", "")

    # Skip Pexels / our already-uploaded images that came from a previous audit run
    # (identified by the art_id.jpg naming pattern already saved locally)
    local_path = os.path.join(UPLOADS_DIR, f"{art_id}.jpg")
    if os.path.exists(local_path) and "raw.githubusercontent.com" in url and art_id in url:
        stats["skipped"] += 1
        return

    async with sem:
        raw_bytes, img_b64, ct = await fetch_image(session, url)

    if not img_b64:
        stats["fetch_fail"] += 1
        print(f"  [W{worker_id}] ⚠️  no-fetch [{source}] {title}")
        await asyncio.sleep(0.1)
        return

    # ── Step 1: initial logo check ──────────────────────────────────────────────
    async with sem:
        result = await gemini_has_logo(session, img_b64, ct)
    await asyncio.sleep(0.15)

    if not result.get("has_logo"):
        # No logo — just save locally if not already local
        new_url = save_upload(art_id, raw_bytes)
        await col.update_one({"id": art_id}, {"$set": {"image": new_url}})
        stats["clean"] += 1
        print(f"  [W{worker_id}] ✅ no-logo  [{source}] {title}")
        return

    position   = result.get("position", "?")
    confidence = result.get("confidence", "?")
    print(f"  [W{worker_id}] 🔍 logo@{position}/{confidence} [{source}] {title}")

    # ── Step 2: zoom-crop to remove logo ───────────────────────────────────────
    cropped = zoom_crop(raw_bytes)
    if not cropped:
        # Crop failed — deactivate to be safe
        await col.update_one({"id": art_id}, {"$set": {"is_active": False}})
        stats["deactivated"] += 1
        print(f"  [W{worker_id}] ❌ DEACTIVATED (crop-fail) [{source}] {title}")
        return

    # ── Step 3: re-check cropped image ─────────────────────────────────────────
    cropped_b64 = base64.b64encode(cropped).decode()
    async with sem:
        result2 = await gemini_has_logo(session, cropped_b64, "image/jpeg")
    await asyncio.sleep(0.15)

    if result2.get("has_logo") and result2.get("confidence") in ("high", "medium"):
        # Logo still visible after crop → deactivate
        await col.update_one({"id": art_id}, {"$set": {"is_active": False}})
        stats["deactivated"] += 1
        print(f"  [W{worker_id}] ❌ DEACTIVATED (logo-remains) [{source}] {title}")
        return

    # Logo removed by crop — save and update
    new_url = save_upload(art_id, cropped)
    await col.update_one({"id": art_id}, {"$set": {"image": new_url}})
    stats["cropped"] += 1
    print(f"  [W{worker_id}] ✂️  CROPPED+SAVED [{source}] {title}")
    print(f"  [W{worker_id}]    → {new_url}")

# ─── main ──────────────────────────────────────────────────────────────────────

async def main():
    print(f"\n{'='*65}")
    print(f"  TVR Full Image Audit — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*65}\n")

    client = AsyncIOMotorClient(MONGO_URL)
    db     = client[DB_NAME]
    col    = db.news

    articles = []
    async for doc in col.find(
        {"is_active": True, "image": {"$exists": True, "$ne": ""}},
        {"id": 1, "image": 1, "source": 1, "title": 1}
    ):
        articles.append({
            "id":     str(doc.get("id", "")),
            "image":  str(doc.get("image", "")),
            "source": str(doc.get("source", "")),
            "title":  str(doc.get("title", ""))[:60],
        })

    total = len(articles)
    print(f"  Active articles : {total}")
    print(f"  Uploads dir     : {UPLOADS_DIR}\n")

    # 8 parallel workers to stay within Gemini rate limits
    NUM_WORKERS = 8
    group_size  = max(1, (total + NUM_WORKERS - 1) // NUM_WORKERS)
    groups      = [articles[i:i+group_size] for i in range(0, total, group_size)]
    print(f"  Workers: {len(groups)}, ~{group_size} articles each\n{'─'*65}\n")

    sem   = asyncio.Semaphore(8)
    stats = {"clean": 0, "cropped": 0, "deactivated": 0, "fetch_fail": 0, "skipped": 0}

    async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=False, limit=10)) as session:
        async def run_worker(worker_id: int, group: list):
            for art in group:
                await process_article(worker_id, art, col, session, sem, stats)

        await asyncio.gather(*[run_worker(i + 1, grp) for i, grp in enumerate(groups)])

    client.close()

    print(f"\n{'='*65}")
    print(f"  AUDIT COMPLETE")
    print(f"  ✅ Clean (no logo)   : {stats['clean']}")
    print(f"  ✂️  Cropped & saved   : {stats['cropped']}")
    print(f"  ❌ Deactivated        : {stats['deactivated']}")
    print(f"  ⚠️  Fetch failed       : {stats['fetch_fail']}")
    print(f"  ⏭️  Skipped (cached)   : {stats['skipped']}")
    print(f"{'='*65}\n")

    saved = stats['clean'] + stats['cropped']
    if saved > 0:
        print(f"  {saved} images saved to {UPLOADS_DIR}")
        print(f"  → Commit uploads/ and push to git so GitHub CDN serves them.\n")

asyncio.run(main())
