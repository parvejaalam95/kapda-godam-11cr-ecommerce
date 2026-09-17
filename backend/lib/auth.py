import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request

from lib.db import db

ADMIN_USERNAME = "owner@kapdagodam.in"
ADMIN_PASSWORD = "Kapda@123"
SESSION_COOKIE = "kg_admin_session"


def password_hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


async def require_admin(request: Request) -> dict:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Admin login required")
    session = await db.admin_sessions.find_one({"token": token})
    expires_at = session.get("expires_at") if session else None
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if not session or not expires_at or expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Admin session expired")
    return {"username": session["username"]}


async def create_session(username: str) -> str:
    token = secrets.token_urlsafe(32)
    await db.admin_sessions.insert_one(
        {
            "token": token,
            "username": username,
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=12),
        }
    )
    return token


async def remove_session(token: str | None) -> None:
    if token:
        await db.admin_sessions.delete_one({"token": token})
