import os
from typing import Any, Dict, List, Optional

from pydantic import PostgresDsn, field_validator, FieldValidationInfo
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "OmniLearn"
    
    # Auth / Security
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "CHANGE_ME_IN_PRODUCTION")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))
    COOKIE_NAME: str = os.getenv("COOKIE_NAME", "ol_session")
    COOKIE_DOMAIN: Optional[str] = os.getenv("COOKIE_DOMAIN")
    SECURE_COOKIES: bool = os.getenv("SECURE_COOKIES", "false").lower() == "true"
    
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "omnilearn")
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    def assemble_db_connection(cls, v: Optional[str], info: FieldValidationInfo) -> Any:
        if isinstance(v, str) and v:
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            username=info.data.get("POSTGRES_USER"),
            password=info.data.get("POSTGRES_PASSWORD"),
            host=info.data.get("POSTGRES_SERVER"),
            path=f"/{info.data.get('POSTGRES_DB') or ''}",
        )

    # AI Provider Settings
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "openrouter")  # openai, openrouter, gemini
    AI_MODEL: str = os.getenv("AI_MODEL", "qwen/qwen-2.5-72b-instruct")
    
    # API Keys for different providers
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Provider-specific settings
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    
    ENABLE_MULTIMEDIA: bool = os.getenv("ENABLE_MULTIMEDIA", "false").lower() == "true"
    
    # CORS Settings
    FRONTEND_ORIGIN: Optional[str] = os.getenv("FRONTEND_ORIGIN")
    BACKEND_CORS_ORIGINS: List[str] = []
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def set_cors_origins(cls, v: Optional[List[str]], info: FieldValidationInfo) -> Any:
        frontend_origin = info.data.get("FRONTEND_ORIGIN")
        if frontend_origin:
            return [frontend_origin]
        return ["http://localhost:3000"]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")


settings = Settings()