from typing import Optional, Dict, Any

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.db.session import get_db
from app.models.user import User, UserProgress
from app.services.oauth.google import GoogleTokenVerifier


class AuthService:
    def __init__(self, db: Session = Depends(get_db)) -> None:
        self.db = db

    def _build_auth_response(self, user: User) -> Dict[str, Any]:
        """Build a unified authentication response with JWT and basic user profile."""
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

    async def login_with_google(self, id_token: str) -> Dict[str, Any]:
        """Validate a Google ID token, upsert the user record, and return a JWT payload."""
        verifier = GoogleTokenVerifier(settings.GOOGLE_CLIENT_ID)
        google_user = await verifier.verify(id_token)
        if not google_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token")

        user = (
            self.db.query(User)
            .filter((User.email == google_user.email) | (User.google_sub == google_user.sub))
            .first()
        )
        if not user:
            user = User(
                email=google_user.email,
                name=google_user.name or google_user.email.split("@")[0],
                google_sub=google_user.sub,
                picture_url=google_user.picture,
                hashed_password="",
            )
            self.db.add(user)
            self.db.flush()
            progress = UserProgress(user_id=user.id, completed_subsections=[], scores={})
            self.db.add(progress)
        else:
            user.google_sub = user.google_sub or google_user.sub
            user.name = google_user.name or user.name
            user.picture_url = google_user.picture or user.picture_url

        self.db.commit()
        self.db.refresh(user)
        return self._build_auth_response(user)

    def register(self, *, email: str, name: str, password: str) -> Dict[str, Any]:
        """Register a new user with email and password, returning a JWT payload.

        Raises 400 if a user with the same email already exists.
        """
        existing = self.db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(status_code=400, detail="User already exists")

        user = User(
            email=email,
            name=name,
            hashed_password=get_password_hash(password),
        )
        self.db.add(user)
        self.db.flush()
        progress = UserProgress(user_id=user.id, completed_subsections=[], scores={})
        self.db.add(progress)
        self.db.commit()
        self.db.refresh(user)
        return self._build_auth_response(user)

    def login(self, *, email: str, password: str) -> Dict[str, Any]:
        """Authenticate a user by email and password, returning a JWT payload.

        Raises 401 if credentials are invalid.
        """
        user = self.db.query(User).filter(User.email == email).first()
        if not user or not user.hashed_password or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        return self._build_auth_response(user)


