from fastapi import APIRouter, Request, Response, Depends
from pydantic import BaseModel

from lib.auth import ADMIN_PASSWORD, ADMIN_USERNAME, SESSION_COOKIE, create_session, password_hash, remove_session, require_admin
from lib.db import db

router = APIRouter(prefix="/admin", tags=["admin-auth"])


class AdminLogin(BaseModel):
    username: str
    password: str


@router.post("/login")
async def login(payload: AdminLogin, response: Response):
    admin = await db.admins.find_one({"username": payload.username})
    if not admin or admin["password_hash"] != password_hash(payload.password) or payload.username != ADMIN_USERNAME or payload.password != ADMIN_PASSWORD:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    token = await create_session(payload.username)
    response.set_cookie(SESSION_COOKIE, token, httponly=True, samesite="lax", max_age=43200)
    return {"username": payload.username, "name": admin.get("name", "Kapda Godam Owner")}


@router.get("/me")
async def me(admin: dict = Depends(require_admin)):
    return admin


@router.post("/logout", status_code=204)
async def logout(request: Request, response: Response):
    await remove_session(request.cookies.get(SESSION_COOKIE))
    response.delete_cookie(SESSION_COOKIE)
