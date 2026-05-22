import asyncio
import re
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb+srv://admin:sscBnar6pLNqaaL7@cluster0.tuk1rfj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "venture_republic"
COLLECTION = "news"

ET_PATTERNS = ["overlay-et", "editionshow", "overlay-rise", "et-rise", "etrise"]


async def main():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION]

    # Build case-insensitive regex for all patterns
    pattern = re.compile("|".join(ET_PATTERNS), re.IGNORECASE)

    query = {
        "is_active": True,
        "image": {"$regex": pattern}
    }

    cursor = collection.find(query, {"title": 1, "image": 1, "_id": 1})
    docs = await cursor.to_list(length=None)

    if not docs:
        print("No matching articles found.")
        client.close()
        return

    print(f"Found {len(docs)} article(s) to deactivate:\n")
    for doc in docs:
        title = doc.get("title", "N/A")
        image_url = doc.get("image", "N/A")
        print(f"  Title     : {title}")
        print(f"  Image URL : {image_url}")
        print()

    ids = [doc["_id"] for doc in docs]
    result = await collection.update_many(
        {"_id": {"$in": ids}},
        {"$set": {"is_active": False}}
    )

    print(f"Deactivated {result.modified_count} article(s) successfully.")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
