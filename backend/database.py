from motor.motor_asyncio import AsyncIOMotorClient
from imagekitio import ImageKit
from pathlib import Path
from dotenv import load_dotenv
import os
import logging

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# API Keys
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
AUTHKEY_API_KEY = os.environ.get('AUTHKEY_API_KEY', '')

# ImageKit
imagekit = ImageKit(private_key=os.environ.get('IMAGEKIT_PRIVATE_KEY', ''))
IMAGEKIT_PUBLIC_KEY = os.environ.get('IMAGEKIT_PUBLIC_KEY', '')

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Categories
CATEGORIES = {
    "local": {"en": "Local - Dammaiguda", "te": "\u0C38\u0C4D\u0C25\u0C3E\u0C28\u0C3F\u0C15 - \u0C26\u0C2E\u0C4D\u0C2E\u0C3E\u0C2F\u0C3F\u0C17\u0C42\u0C21"},
    "city": {"en": "City - Hyderabad", "te": "\u0C28\u0C17\u0C30\u0C02 - \u0C39\u0C48\u0C26\u0C30\u0C3E\u0C2C\u0C3E\u0C26\u0C4D"},
    "state": {"en": "State - Telangana", "te": "\u0C30\u0C3E\u0C37\u0C4D\u0C1F\u0C4D\u0C30\u0C02 - \u0C24\u0C46\u0C32\u0C02\u0C17\u0C3E\u0C23"},
    "national": {"en": "National - India", "te": "\u0C1C\u0C3E\u0C24\u0C40\u0C2F - \u0C2D\u0C3E\u0C30\u0C24\u0C26\u0C47\u0C36\u0C02"},
    "international": {"en": "International", "te": "\u0C05\u0C02\u0C24\u0C30\u0C4D\u0C1C\u0C3E\u0C24\u0C40\u0C2F"},
    "sports": {"en": "Sports", "te": "\u0C15\u0C4D\u0C30\u0C40\u0C21\u0C32\u0C41"},
    "entertainment": {"en": "Entertainment", "te": "\u0C35\u0C3F\u0C28\u0C4B\u0C26\u0C02"},
    "tech": {"en": "Technology", "te": "\u0C1F\u0C46\u0C15\u0C4D\u0C28\u0C3E\u0C32\u0C1C\u0C40"},
    "health": {"en": "Health", "te": "\u0C06\u0C30\u0C4B\u0C17\u0C4D\u0C2F\u0C02"},
    "business": {"en": "Business", "te": "\u0C35\u0C4D\u0C2F\u0C3E\u0C2A\u0C3E\u0C30\u0C02"},
}
