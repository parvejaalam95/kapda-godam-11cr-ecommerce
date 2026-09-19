from datetime import datetime, timezone
from typing import Literal, Optional
import uuid

from pydantic import BaseModel, Field, ConfigDict

OrderStatus = Literal[
    "Pending",
    "Confirmed",
    "Processing",
    "Ready for Dispatch",
    "Dispatched",
    "Delivered",
    "Cancelled",
]


class OrderItemInput(BaseModel):
    product_id: str
    quantity: int = Field(gt=0)


class WholesaleOrderCreate(BaseModel):
    customer_name: str = Field(min_length=2)
    business_name: str = Field(min_length=2)
    mobile: str = Field(min_length=7)
    whatsapp: str = Field(min_length=7)
    email: str
    address: str = Field(min_length=5)
    city: str = Field(min_length=2)
    state: str = Field(min_length=2)
    pincode: str = Field(min_length=4)
    gst_number: Optional[str] = None
    notes: Optional[str] = None
    items: list[OrderItemInput] = Field(min_length=1)


class OrderItem(BaseModel):
    product_id: str
    brand: str = "11 CR"
    name: str
    sku: str
    quantity: int
    unit_price: float
    line_total: float


class WholesaleOrder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    customer_name: str
    business_name: str
    mobile: str
    whatsapp: str
    email: str
    address: str
    city: str
    state: str
    pincode: str
    gst_number: Optional[str] = None
    notes: Optional[str] = None
    items: list[OrderItem]
    total_estimate: float
    status: OrderStatus = "Pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
