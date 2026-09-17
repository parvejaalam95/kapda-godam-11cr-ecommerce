from typing import Literal, Optional
from pydantic import BaseModel, Field


class InquiryCreate(BaseModel):
    name: str = Field(min_length=2)
    business_name: Optional[str] = None
    phone: str = Field(min_length=7)
    email: Optional[str] = None
    message: str = Field(min_length=5)
    inquiry_type: Literal["wholesale", "contact"] = "wholesale"


class Inquiry(InquiryCreate):
    id: str
    created_at: str
