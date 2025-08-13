from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests


class GoogleUser(BaseModel):
    sub: str
    email: str
    name: str | None = None
    picture: str | None = None


class GoogleTokenVerifier:
    def __init__(self, client_id: str) -> None:
        self.client_id = client_id

    async def verify(self, token: str) -> GoogleUser | None:
        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), self.client_id)
            return GoogleUser(
                sub=idinfo.get("sub"),
                email=idinfo.get("email"),
                name=idinfo.get("name"),
                picture=idinfo.get("picture"),
            )
        except Exception:
            return None







