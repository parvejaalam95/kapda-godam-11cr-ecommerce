from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from lib.auth import require_admin
from lib.db import db
from models.catalog import Category, Product, ProductCreate, ProductUpdate

router = APIRouter(tags=["products"])


def product_from_doc(doc: dict) -> Product:
    doc.pop("_id", None)
    return Product(**doc)


@router.get("/products", response_model=list[Product])
async def list_products(category: Optional[str] = None, search: Optional[str] = None, size: Optional[str] = None, color: Optional[str] = None, min_price: Optional[float] = Query(default=None, ge=0), max_price: Optional[float] = Query(default=None, ge=0), featured: Optional[bool] = None):
    query: dict = {}
    if category in {"jeans", "shirts"}:
        query["category"] = category
    if search:
        query["$or"] = [{"name": {"$regex": search, "$options": "i"}}, {"sku": {"$regex": search, "$options": "i"}}]
    if size:
        query["sizes"] = size
    if color:
        query["colors"] = {"$regex": color, "$options": "i"}
    if min_price is not None or max_price is not None:
        query["price"] = {**({"$gte": min_price} if min_price is not None else {}), **({"$lte": max_price} if max_price is not None else {})}
    if featured is not None:
        query["featured"] = featured
    docs = await db.products.find(query).sort("created_at", -1).to_list(200)
    return [product_from_doc(doc) for doc in docs]


@router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    doc = await db.products.find_one({"id": product_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_from_doc(doc)


@router.get("/categories", response_model=list[Category])
async def list_categories():
    result = []
    for slug, name in [("jeans", "Men's Jeans"), ("shirts", "Men's Shirts")]:
        result.append(Category(id=slug, name=name, slug=slug, product_count=await db.products.count_documents({"category": slug})))
    return result


@router.post("/products", response_model=Product)
async def create_product(payload: ProductCreate, _: dict = Depends(require_admin)):
    product = Product(**payload.model_dump())
    await db.products.insert_one(product.model_dump())
    return product


@router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, payload: ProductUpdate, _: dict = Depends(require_admin)):
    current = await db.products.find_one({"id": product_id})
    if not current:
        raise HTTPException(status_code=404, detail="Product not found")
    values = payload.model_dump(exclude_none=True)
    if values:
        await db.products.update_one({"id": product_id}, {"$set": values})
    updated = await db.products.find_one({"id": product_id})
    return product_from_doc(updated)


@router.delete("/products/{product_id}", status_code=204)
async def delete_product(product_id: str, _: dict = Depends(require_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
