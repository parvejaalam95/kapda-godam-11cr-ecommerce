from datetime import datetime, timezone
from typing import Optional
import uuid

from pydantic import BaseModel, Field, ConfigDict


class ProductBase(BaseModel):
    brand: str = Field(default="11 CR", min_length=1)
    name: str = Field(min_length=2)
    sku: str = Field(min_length=2)
    category: str = Field(pattern="^(jeans|shirts)$")
    sizes: list[str] = Field(min_length=1)
    colors: list[str] = Field(min_length=1)
    fabric: str
    price: float = Field(gt=0)
    moq: int = Field(gt=0)
    stock: int = Field(ge=0)
    images: list[str] = Field(min_length=1)
    description: str
    availability_status: str = "In stock"
    featured: bool = False


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    brand: Optional[str] = Field(default=None, min_length=1)
    name: Optional[str] = Field(default=None, min_length=2)
    sku: Optional[str] = Field(default=None, min_length=2)
    category: Optional[str] = Field(default=None, pattern="^(jeans|shirts)$")
    sizes: Optional[list[str]] = None
    colors: Optional[list[str]] = None
    fabric: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    moq: Optional[int] = Field(default=None, gt=0)
    stock: Optional[int] = Field(default=None, ge=0)
    images: Optional[list[str]] = None
    description: Optional[str] = None
    availability_status: Optional[str] = None
    featured: Optional[bool] = None


class Product(ProductBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Category(BaseModel):
    id: str
    name: str
    slug: str
    product_count: int
