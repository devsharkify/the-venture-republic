#!/usr/bin/env python3
"""
Generate URL slugs for all news articles that don't have one.
"""

import asyncio
import re
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb+srv://admin:sscBnar6pLNqaaL7@cluster0.tuk1rfj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "venture_republic"
COLLECTION = "news"

REMOVE_CHARS = re.compile(r'[\[\](){}₹$#@!%^&*,.;:"\'|<>?/\\]')
NON_WORD = re.compile(r'[^\w\s-]')


def make_slug(title: str) -> str:
    """Generate a slug from a title: lowercase, first 9 words, alphanumeric+hyphens only."""
    text = title.lower()
    text = REMOVE_CHARS.sub('', text)
    text = NON_WORD.sub('', text)
    words = text.split()
    words = words[:9]
    slug = '-'.join(words)
    # Collapse multiple hyphens and strip leading/trailing hyphens
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug


def unique_slug(base: str, seen: set) -> str:
    """Return a unique slug, appending -2, -3, etc. on collision."""
    if base not in seen:
        return base
    counter = 2
    while f"{base}-{counter}" in seen:
        counter += 1
    return f"{base}-{counter}"


async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    col = db[COLLECTION]

    # Load all existing slugs to avoid collisions
    existing_slugs = set()
    async for doc in col.find({"slug": {"$exists": True}}, {"slug": 1}):
        if doc.get("slug"):
            existing_slugs.add(doc["slug"])

    print(f"Found {len(existing_slugs)} existing slugs.")

    # Find all documents without a slug
    cursor = col.find({"slug": {"$exists": False}}, {"_id": 1, "title": 1})
    docs = await cursor.to_list(length=None)

    print(f"Found {len(docs)} documents without a slug.\n")

    seen = set(existing_slugs)
    updated = 0

    for doc in docs:
        title = doc.get("title", "")
        if not title:
            print(f"  [SKIP] _id={doc['_id']} — no title")
            continue

        base = make_slug(title)
        if not base:
            print(f"  [SKIP] _id={doc['_id']} — slug empty after processing title: {title!r}")
            continue

        slug = unique_slug(base, seen)
        seen.add(slug)

        await col.update_one({"_id": doc["_id"]}, {"$set": {"slug": slug}})
        print(f"  {doc['_id']}  ->  {slug}")
        updated += 1

    # Create sparse index on slug field.
    # If a non-unique index with the same name already exists, drop it first
    # so we can recreate it as unique.
    try:
        index_name = await col.create_index("slug", sparse=True, unique=True)
        print(f"\nSparse unique index created: {index_name}")
    except Exception as e:
        if "IndexKeySpecsConflict" in str(e) or "index" in str(e).lower():
            print(f"\nExisting non-unique index detected — dropping and recreating as unique...")
            await col.drop_index("slug_1")
            index_name = await col.create_index("slug", sparse=True, unique=True)
            print(f"Sparse unique index recreated: {index_name}")
        else:
            raise
    print(f"\nDone. {updated} documents updated with slugs.")

    client.close()


if __name__ == "__main__":
    asyncio.run(main())
