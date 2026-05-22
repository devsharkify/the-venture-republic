import os as _os
# Load .env if running locally
try:
    from dotenv import load_dotenv as _lde; _lde()
except ImportError:
    pass
"""
Re-rephrase all existing articles — The Venture Republic
- Strips source publication names from summaries and titles
- Rewrites as TVR original reporting
- 10 parallel workers via asyncio
Run: python3 rephrase_all.py
"""
import asyncio, json
import aiohttp
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

MONGO_URL  = "mongodb+srv://admin:sscBnar6pLNqaaL7@cluster0.tuk1rfj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
GEMINI_KEY  = _os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_KEY}"

TITLE_PROMPT = """You are an editor at The Venture Republic, India's top startup magazine.
Rephrase this headline to be punchy and engaging. Keep all facts exact (company names, numbers).
Max 100 characters. No quotes. Write like Forbes/Bloomberg.
RULES:
- Do NOT use em-dashes (—). Use a colon or comma instead.
- Do NOT mention any publication name (YourStory, Inc42, Entrackr, ET, Mint, TechCrunch, etc.)
Return ONLY the rephrased headline, nothing else.

Original: {title}"""

SUMMARY_PROMPT = """You are a journalist at The Venture Republic, India's top startup magazine.
Rewrite this article summary as original TVR reporting. Keep all facts accurate. 3-4 paragraphs, ~180 words.
RULES:
- Do NOT use em-dashes (—). Use commas, colons, or periods.
- NEVER mention any source publication (YourStory, Inc42, Entrackr, Economic Times, ET, Mint, TechCrunch, Moneycontrol, NDTV, The Tech Panda, StartupTalky, etc.)
- Do NOT start with "YourStory reports", "According to", "ET Tech says", etc.
- Write as if The Venture Republic independently reported this story.
- Start directly with the key news fact.
Return ONLY the rewritten summary.

Original: {summary}"""

async def call_gemini(session: aiohttp.ClientSession, prompt: str, max_tokens: int = 600):
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": max_tokens},
    }
    try:
        async with session.post(
            GEMINI_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=aiohttp.ClientTimeout(total=35),
            ssl=False,
        ) as r:
            body = await r.json()
            if r.status != 200:
                print(f"    Gemini {r.status}: {body.get('error',{}).get('message','?')[:80]}")
                return None
            return body["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        print(f"    Gemini exc: {e}")
        return None

SOURCE_NAMES = [
    "yourstory", "your story", "inc42", "entrackr", "economic times",
    "et tech", "et startups", "et rise", "mint", "livemint", "moneycontrol",
    "techcrunch", "the tech panda", "startuptalky", "ndtv profit", "vccircle",
    "business standard", "according to", "reports say", "as per",
]

def has_source_mention(text: str) -> bool:
    t = text.lower()
    return any(s in t for s in SOURCE_NAMES)

async def process_article(worker_id: int, art: dict, col, session: aiohttp.ClientSession, sem: asyncio.Semaphore, stats: dict):
    art_id  = art["id"]
    title   = art.get("title", "")
    summary = art.get("summary", "")

    title_needs  = has_source_mention(title)
    summary_needs = has_source_mention(summary) or (summary and len(summary) > 60)

    if not title_needs and not summary_needs:
        stats["skipped"] += 1
        return

    updates = {}

    # Rephrase title if it mentions a source
    if title_needs and title:
        async with sem:
            new_title = await call_gemini(session, TITLE_PROMPT.format(title=title), max_tokens=120)
        if new_title and 5 < len(new_title) < 200:
            updates["title"] = new_title
            updates["og_title"] = new_title
            print(f"  [W{worker_id}] 📝 title: {new_title[:65]}")

    # Always rephrase summary (remove source mentions + improve quality)
    if summary_needs and summary and len(summary) > 60:
        async with sem:
            new_summary = await call_gemini(session, SUMMARY_PROMPT.format(summary=summary[:1500]), max_tokens=600)
        if new_summary and len(new_summary) > 50:
            updates["summary"] = new_summary
            updates["og_description"] = new_summary[:300]

    if updates:
        updates["updated_at"] = datetime.utcnow().isoformat()
        await col.update_one({"id": art_id}, {"$set": updates})
        stats["updated"] += 1
        print(f"  [W{worker_id}] ✅ [{art.get('source','')}] {title[:55]}")
    else:
        stats["skipped"] += 1

    await asyncio.sleep(0.25)

async def main():
    print(f"\n{'='*60}")
    print(f"  TVR Re-Rephrase Agent  —  {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*60}\n")

    client = AsyncIOMotorClient(MONGO_URL)
    db = client["venture_republic"]
    col = db.news

    articles = []
    async for doc in col.find(
        {"is_active": True},
        {"id": 1, "title": 1, "summary": 1, "source": 1}
    ):
        articles.append({
            "id":      str(doc.get("id", "")),
            "title":   str(doc.get("title", "")),
            "summary": str(doc.get("summary", "")),
            "source":  str(doc.get("source", "")),
        })

    total = len(articles)
    print(f"  Articles to process: {total}\n")

    NUM_WORKERS = 10
    group_size  = (total + NUM_WORKERS - 1) // NUM_WORKERS
    groups      = [articles[i:i+group_size] for i in range(0, total, group_size)]

    sem   = asyncio.Semaphore(10)
    stats = {"updated": 0, "skipped": 0}

    async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=False, limit=12)) as session:
        async def run_worker(worker_id, group):
            for art in group:
                await process_article(worker_id, art, col, session, sem, stats)

        await asyncio.gather(*[
            run_worker(i + 1, grp)
            for i, grp in enumerate(groups)
        ])

    print(f"\n{'='*60}")
    print(f"  DONE — {stats['updated']} rephrased, {stats['skipped']} skipped (already clean)")
    print(f"{'='*60}\n")

    client.close()

asyncio.run(main())
