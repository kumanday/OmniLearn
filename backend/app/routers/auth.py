from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, decode_access_token, get_current_user
from app.db.session import get_db
from app.models.user import User, UserProgress
from app.services.oauth.google import GoogleTokenVerifier


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


@router.post("/google")
async def google_login(payload: GoogleAuthPayload, response: Response, db: Session = Depends(get_db)):
    verifier = GoogleTokenVerifier(settings.GOOGLE_CLIENT_ID)
    google_user = await verifier.verify(payload.id_token)
    if not google_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token")

    # Upsert user
    user = db.query(User).filter((User.email == google_user.email) | (User.google_sub == google_user.sub)).first()
    if not user:
        user = User(
            email=google_user.email,
            name=google_user.name or google_user.email.split("@")[0],
            google_sub=google_user.sub,
            picture_url=google_user.picture,
            hashed_password="",
        )
        db.add(user)
        db.flush()
        progress = UserProgress(user_id=user.id, completed_subsections=[], scores={})
        db.add(progress)
    else:
        user.google_sub = user.google_sub or google_user.sub
        user.name = google_user.name or user.name
        user.picture_url = google_user.picture or user.picture_url

    db.commit()
    db.refresh(user)

    token = create_access_token(subject=str(user.id))
    set_auth_cookie(response, token)
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "picture_url": user.picture_url,
    }


@router.get("/me")
async def get_me(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get(settings.COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_access_token(token)
    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "picture_url": user.picture_url,
    }


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        domain=settings.COOKIE_DOMAIN,
        path="/",
    )
    return {"ok": True}


