from datetime import datetime, timezone
import uuid

from lib.auth import ADMIN_USERNAME, password_hash
from lib.db import db, ensure_indexes

JEANS_IMAGE = "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=85"
JEANS_IMAGE_2 = "https://images.unsplash.com/photo-1714729382668-7bc3bb261662?auto=format&fit=crop&w=1200&q=85"
SHIRT_IMAGE = "https://images.unsplash.com/photo-1621096029176-9dbb22a56808?auto=format&fit=crop&w=1200&q=85"
SHIRT_IMAGE_2 = "https://images.pexels.com/photos/19793807/pexels-photo-19793807.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200"

PRODUCTS = [
    {"name": "Men's Regular Fit Jeans", "sku": "KG-JN-101", "category": "jeans", "sizes": ["28", "30", "32", "34", "36", "38"], "colors": ["Dark Indigo", "Black"], "fabric": "98% cotton, 2% elastane · 11.5 oz denim", "price": 425, "moq": 30, "stock": 480, "images": [JEANS_IMAGE, JEANS_IMAGE_2], "description": "Reliable regular-fit denim batch with a clean finish for everyday retail shelves.", "availability_status": "Ready to dispatch", "featured": True},
    {"name": "Men's Slim Fit Jeans", "sku": "KG-JN-108", "category": "jeans", "sizes": ["28", "30", "32", "34", "36"], "colors": ["Mid Blue", "Grey Wash"], "fabric": "Stretch cotton denim · 11 oz", "price": 455, "moq": 30, "stock": 320, "images": [JEANS_IMAGE_2, JEANS_IMAGE], "description": "A dependable slim silhouette in commercial washes, packed for wholesale replenishment.", "availability_status": "Ready to dispatch", "featured": True},
    {"name": "Men's Straight Fit Jeans", "sku": "KG-JN-114", "category": "jeans", "sizes": ["30", "32", "34", "36", "38"], "colors": ["Light Blue", "Dark Indigo"], "fabric": "Comfort cotton denim · 11.8 oz", "price": 440, "moq": 40, "stock": 260, "images": [JEANS_IMAGE, JEANS_IMAGE_2], "description": "Classic straight-fit proportions made for broad store assortments and repeat orders.", "availability_status": "In stock"},
    {"name": "Men's Baggy Jeans", "sku": "KG-JN-121", "category": "jeans", "sizes": ["30", "32", "34", "36"], "colors": ["Stone Wash", "Black"], "fabric": "Heavyweight rigid denim · 12 oz", "price": 495, "moq": 30, "stock": 180, "images": [JEANS_IMAGE_2, JEANS_IMAGE], "description": "Contemporary baggy cut with structured drape for high-volume youthwear counters.", "availability_status": "Limited stock"},
    {"name": "Men's Casual Shirt", "sku": "KG-SH-201", "category": "shirts", "sizes": ["M", "L", "XL", "XXL"], "colors": ["White", "Navy", "Olive"], "fabric": "100% cotton · 60s poplin", "price": 285, "moq": 50, "stock": 620, "images": [SHIRT_IMAGE, SHIRT_IMAGE_2], "description": "Versatile cotton casual shirt, ideal for dependable multi-size wholesale bundles.", "availability_status": "Ready to dispatch", "featured": True},
    {"name": "Men's Denim Shirt", "sku": "KG-SH-208", "category": "shirts", "sizes": ["M", "L", "XL", "XXL"], "colors": ["Mid Blue", "Dark Blue"], "fabric": "6.5 oz cotton denim", "price": 335, "moq": 40, "stock": 290, "images": [SHIRT_IMAGE_2, SHIRT_IMAGE], "description": "Workwear-inspired denim shirt with a consistent commercial finish.", "availability_status": "In stock", "featured": True},
    {"name": "Men's Checked Shirt", "sku": "KG-SH-214", "category": "shirts", "sizes": ["M", "L", "XL", "XXL"], "colors": ["Rust Check", "Blue Check"], "fabric": "Cotton twill · 58 GSM", "price": 305, "moq": 50, "stock": 410, "images": [SHIRT_IMAGE, SHIRT_IMAGE_2], "description": "Easy-moving checked assortment with retailer-friendly size coverage.", "availability_status": "Ready to dispatch"},
    {"name": "Men's Plain Shirt", "sku": "KG-SH-220", "category": "shirts", "sizes": ["M", "L", "XL", "XXL"], "colors": ["Black", "Sky Blue", "White"], "fabric": "Cotton blend · wrinkle resistant", "price": 265, "moq": 50, "stock": 760, "images": [SHIRT_IMAGE_2, SHIRT_IMAGE], "description": "Clean plain-shirt program designed for repeat bulk orders and daily wear.", "availability_status": "In stock"},
]


async def ensure_seed_data() -> None:
    if await db.products.count_documents({}) == 0:
        now = datetime.now(timezone.utc)
        await db.products.insert_many([{**product, "id": str(uuid.uuid4()), "created_at": now} for product in PRODUCTS])
    else:
        # Early preview boots may have inserted the first demo rows before the
        # string-id field was added. Backfill them once so list/detail URLs agree.
        async for product in db.products.find({"id": {"$exists": False}}, {"_id": 1}):
            await db.products.update_one({"_id": product["_id"]}, {"$set": {"id": str(uuid.uuid4())}})
    if not await db.admins.find_one({"username": ADMIN_USERNAME}):
        await db.admins.insert_one({"username": ADMIN_USERNAME, "password_hash": password_hash("Kapda@123"), "name": "Kapda Godam Owner"})
    await ensure_indexes()
