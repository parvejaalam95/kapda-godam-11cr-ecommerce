from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query

from lib.auth import require_admin
from lib.db import db
from models.orders import OrderStatusUpdate, WholesaleOrder, WholesaleOrderCreate

router = APIRouter(tags=["orders"])


def order_from_doc(doc: dict) -> WholesaleOrder:
    doc.pop("_id", None)
    return WholesaleOrder(**doc)


@router.post("/orders", response_model=WholesaleOrder)
async def create_order(payload: WholesaleOrderCreate):
    if len({item.product_id for item in payload.items}) != len(payload.items):
        raise HTTPException(status_code=422, detail="Each product may only appear once in an order")
    order_items = []
    for item in payload.items:
        product = await db.products.find_one({"id": item.product_id})
        if not product:
            raise HTTPException(status_code=404, detail="One of the selected products was not found")
        if item.quantity < product["moq"]:
            raise HTTPException(status_code=422, detail=f"{product['name']} requires a minimum of {product['moq']} pieces")
        if item.quantity > product["stock"]:
            raise HTTPException(status_code=422, detail=f"Only {product['stock']} pieces available for {product['name']}")
        order_items.append({"product_id": product["id"], "name": product["name"], "sku": product["sku"], "quantity": item.quantity, "unit_price": product["price"], "line_total": item.quantity * product["price"]})
    order = WholesaleOrder(id=str(uuid.uuid4()), order_id=f"KG-{datetime.now(timezone.utc).strftime('%y%m%d')}-{uuid.uuid4().hex[:5].upper()}", **payload.model_dump(exclude={"items"}), items=order_items, total_estimate=sum(item["line_total"] for item in order_items))
    await db.orders.insert_one(order.model_dump())
    return order


@router.get("/orders/{order_id}", response_model=WholesaleOrder)
async def get_order(order_id: str):
    doc = await db.orders.find_one({"$or": [{"id": order_id}, {"order_id": order_id}]})
    if not doc:
        raise HTTPException(status_code=404, detail="Order not found")
    return order_from_doc(doc)


@router.get("/admin/orders", response_model=list[WholesaleOrder])
async def list_orders(status: str | None = Query(default=None), search: str | None = Query(default=None), _: dict = Depends(require_admin)):
    query: dict = {}
    if status:
        query["status"] = status
    if search:
        query["$or"] = [{"order_id": {"$regex": search, "$options": "i"}}, {"customer_name": {"$regex": search, "$options": "i"}}, {"business_name": {"$regex": search, "$options": "i"}}]
    docs = await db.orders.find(query).sort("created_at", -1).to_list(500)
    return [order_from_doc(doc) for doc in docs]


@router.patch("/admin/orders/{order_id}/status", response_model=WholesaleOrder)
async def update_order_status(order_id: str, payload: OrderStatusUpdate, _: dict = Depends(require_admin)):
    doc = await db.orders.find_one({"$or": [{"id": order_id}, {"order_id": order_id}]})
    if not doc:
        raise HTTPException(status_code=404, detail="Order not found")
    await db.orders.update_one({"id": doc["id"]}, {"$set": {"status": payload.status}})
    return order_from_doc(await db.orders.find_one({"id": doc["id"]}))
