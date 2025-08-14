from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    decode_access_token,
    get_current_user,
    verify_password,
    get_password_hash,
)
from app.db.session import get_db
from app.models.user import User, UserProgress
from app.services.auth import AuthService


class GoogleAuthPayload(BaseModel):
    id_token: str


router = APIRouter()


def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite="none" if settings.SECURE_COOKIES else "lax",
        domain=settings.COOKIE_DOMAIN,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )


class RegisterPayload(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


def _jwt_response(user: User) -> dict:
    """Build unified auth response with JWT and basic profile."""
    token = create_access_token(subject=str(user.id))
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "picture_url": user.picture_url,
        },
    }


@router.post("/google")
async def google_login(payload: GoogleAuthPayload, response: Response, service: AuthService = Depends()):
    auth = await service.login_with_google(payload.id_token)
    set_auth_cookie(response, auth["access_token"])  # keep cookie for browser flows
    return auth


@router.post("/register")
async def register(data: RegisterPayload, service: AuthService = Depends()):
    """Register a new user with email/password. Fails on duplicate email."""
    return service.register(email=data.email, name=data.name, password=data.password)


@router.post("/login")
async def login(data: LoginPayload, response: Response, service: AuthService = Depends()):
    """Login with email/password and return a JWT."""
    auth = service.login(email=data.email, password=data.password)
    set_auth_cookie(response, auth["access_token"])  # optional: also set cookie
    return auth


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the current authenticated user profile using JWT from header or cookie."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "picture_url": current_user.picture_url,
    }


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        domain=settings.COOKIE_DOMAIN,
        path="/",
    )
    return {"ok": True}


