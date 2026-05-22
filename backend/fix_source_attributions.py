"""
Fix article summaries and titles that start with source publication name attributions.
Handles:
  1. "<Source> reports/says/brings/covers/..." — strip up to first period/newline
  2. "<Source>'s latest ... reveals/shows..." — strip up to first period/newline
  3. "According to <Source>," — strip the phrase
  4. "<Source>:" attribution prefix
  5. "This is a Mint Premium article gifted to you.Subscribe to enjoy similar stories." — strip
  6. "Listen to this article in summarized format (...)" — strip
"""
import asyncio
import re
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb+srv://admin:sscBnar6pLNqaaL7@cluster0.tuk1rfj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "venture_republic"
COLLECTION = "news"

SOURCES = [
    "YourStory", "Inc42", "Entrackr", "ET Tech", "Economic Times",
    "Mint", "According to", "Moneycontrol", "NDTV", "StartupTalky",
    "The Tech Panda", "TechCrunch", "Rest of World", "Business Standard",
    "Fortune India",
]

SOURCES_SORTED = sorted(SOURCES, key=len, reverse=True)
SOURCE_ALT = "|".join(re.escape(s) for s in SOURCES_SORTED)

# Ordered list of summary strip patterns (applied one at a time, first match wins)
SUMMARY_STRIP_PATTERNS = [
    # "This is a Mint Premium article gifted to you.Subscribe to enjoy similar stories."
    re.compile(
        r"^This is a Mint Premium article gifted to you\.\s*Subscribe to enjoy similar stories\.\s*",
        re.IGNORECASE
    ),
    # "Listen to this article in summarized format (...)"
    re.compile(
        r"^Listen to this article in summarized format\s*(?:\([^)]*\))?\s*",
        re.IGNORECASE
    ),
    # "According to Source[, some detail]," — strip phrase
    re.compile(
        r"^According\s+to\s+(?:" + SOURCE_ALT + r")[^,\n]*,\s*",
        re.IGNORECASE
    ),
    # "Source's <noun> <verb> ..." — strip up to and including first period or newline
    re.compile(
        r"^(?:" + SOURCE_ALT + r")'s\s+[^.\n]+[.\n]\s*",
        re.IGNORECASE
    ),
    # "Source reports/says/brings/covers/writes/notes/... [that]..." — strip to first period/newline
    re.compile(
        r"^(?:" + SOURCE_ALT + r")\s+(?:reports?|says?|notes?|writes?|brings?|covers?|explains?|reveals?|highlights?|states?|has\s+reported|has\s+said|has\s+noted|has\s+written|has\s+revealed)\s+[^.\n]*[.\n]\s*",
        re.IGNORECASE
    ),
    # "Source: " attribution
    re.compile(
        r"^(?:" + SOURCE_ALT + r")\s*:\s*",
        re.IGNORECASE
    ),
]

# For titles: strip leading "Source: " or "Source | "
TITLE_STRIP_PATTERNS = [
    re.compile(
        r"^(?:" + SOURCE_ALT + r")\s*[:|]\s*",
        re.IGNORECASE
    ),
]


def clean_text(text: str, patterns: list) -> str:
    if not text:
        return text
    cleaned = text
    for pattern in patterns:
        new = pattern.sub("", cleaned, count=1)
        if new != cleaned:
            cleaned = new.strip()
            break  # Only apply the first matching pattern
    return cleaned


def build_mongo_regex() -> str:
    """Build a broad start-of-string regex to fetch candidates from MongoDB."""
    alts = [re.escape(s) for s in SOURCES_SORTED]
    # Also include paywall patterns
    alts += [
        r"This is a Mint Premium article",
        r"Listen to this article in summarized format",
    ]
    return "^(" + "|".join(alts) + ")"


async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    collection = db[COLLECTION]

    mongo_regex = build_mongo_regex()

    # Query: active articles where summary OR title starts with a recognized pattern
    query = {
        "is_active": True,
        "$or": [
            {"summary": {"$regex": mongo_regex, "$options": "i"}},
            {"title": {"$regex": mongo_regex, "$options": "i"}},
        ]
    }

    cursor = collection.find(query, {"_id": 1, "title": 1, "summary": 1, "source": 1})
    articles = await cursor.to_list(length=None)

    print(f"Candidates fetched from MongoDB: {len(articles)}\n")
    print("=" * 80)

    fixed_count = 0
    summary_fixed = 0
    title_fixed = 0

    for article in articles:
        _id = article["_id"]
        original_title = article.get("title", "") or ""
        original_summary = article.get("summary", "") or ""
        source = article.get("source", "")

        new_title = clean_text(original_title, TITLE_STRIP_PATTERNS)
        new_summary = clean_text(original_summary, SUMMARY_STRIP_PATTERNS)

        title_changed = new_title != original_title
        summary_changed = new_summary != original_summary

        if not title_changed and not summary_changed:
            print(f"[SKIP] ID: {_id} | source: {source}")
            print(f"  Summary not matched by any pattern: {original_summary[:120]}")
            continue

        update_doc = {}
        if title_changed:
            update_doc["title"] = new_title
            title_fixed += 1
        if summary_changed:
            update_doc["summary"] = new_summary
            summary_fixed += 1

        await collection.update_one({"_id": _id}, {"$set": update_doc})
        fixed_count += 1

        print(f"[FIXED] Article ID: {_id} | source: {source}")
        if title_changed:
            print(f"  TITLE BEFORE : {original_title[:120]}")
            print(f"  TITLE AFTER  : {new_title[:120]}")
        if summary_changed:
            print(f"  SUMMARY BEFORE: {original_summary[:200]}")
            print(f"  SUMMARY AFTER : {new_summary[:200]}")
        print("-" * 80)

    print(f"\nTotal articles fixed : {fixed_count}")
    print(f"  Summaries cleaned  : {summary_fixed}")
    print(f"  Titles cleaned     : {title_fixed}")

    client.close()


if __name__ == "__main__":
    asyncio.run(main())
