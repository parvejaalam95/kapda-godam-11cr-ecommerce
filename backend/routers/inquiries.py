from datetime import datetime, timezone
import uuid

from fastapi import APIRouter

from lib.db import db
from models.inquiries import InquiryCreate

router = APIRouter(tags=["inquiries"])


@router.post("/inquiries")
async def create_inquiry(payload: InquiryCreate):
    inquiry = {"id": str(uuid.uuid4()), **payload.model_dump(), "created_at": datetime.now(timezone.utc).isoformat()}
    await db.inquiries.insert_one(inquiry)
    return {"message": "Inquiry received", "id": inquiry["id"]}
