"""
CareerIQ Backend — Application Configuration
Validates all settings at startup using pydantic-settings.
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal, List

from pydantic import AnyHttpUrl, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    _backend_env = Path(__file__).resolve().parents[2] / ".env"
    model_config = SettingsConfigDict(
        env_file=(_backend_env if _backend_env.exists() else ".env", ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    APP_ENV: Literal["development", "staging", "production"] = "development"
    APP_NAME: str = "CareerIQ"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://careeriq_user:careeriq_pass@localhost:5432/careeriq_db"
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://careeriq_user:careeriq_pass@localhost:5432/careeriq_db"

    # JWT / Auth
    JWT_SECRET_KEY: str = "careeriq_super_secure_jwt_signing_key_at_least_64_bytes_long_random_development_secret_2025"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS — comma-separated list
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    # File Storage
    STORAGE_BACKEND: Literal["local", "s3", "supabase"] = "local"
    LOCAL_STORAGE_DIR: Path = Path("./storage_data")
    MAX_UPLOAD_SIZE_MB: int = 10

    @property
    def max_upload_size_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    # S3 / Supabase (optional)
    S3_BUCKET_NAME: str = ""
    S3_ENDPOINT_URL: str = ""
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""
    S3_REGION: str = "us-east-1"

    # LLM (optional)
    LLM_PROVIDER: str = ""
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = ""

    @property
    def llm_enabled(self) -> bool:
        return bool(self.LLM_PROVIDER and self.GEMINI_API_KEY)

    # Email (optional)
    EMAIL_PROVIDER: str = ""
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@careeriq.dev"

    @property
    def email_enabled(self) -> bool:
        return bool(self.EMAIL_PROVIDER and self.SMTP_HOST and self.SMTP_USER)

    # Logging
    LOG_LEVEL: str = "INFO"

    # Rate Limiting
    AUTH_RATE_LIMIT: str = "20/minute"

    @model_validator(mode="after")
    def _validate_required_secrets(self) -> "Settings":
        if len(self.JWT_SECRET_KEY) < 32:
            raise ValueError(
                "JWT_SECRET_KEY must be at least 32 characters. "
                "Generate with: python -c \"import secrets; print(secrets.token_hex(64))\""
            )
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL is required.")

        # Normalize postgres driver for SQLAlchemy asyncpg
        if self.DATABASE_URL.startswith("postgres://"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
        elif self.DATABASE_URL.startswith("postgresql://") and not self.DATABASE_URL.startswith("postgresql+"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

        if self.DATABASE_URL_SYNC.startswith("postgres://"):
            self.DATABASE_URL_SYNC = self.DATABASE_URL_SYNC.replace("postgres://", "postgresql+psycopg2://", 1)
        elif self.DATABASE_URL_SYNC.startswith("postgresql://") and not self.DATABASE_URL_SYNC.startswith("postgresql+"):
            self.DATABASE_URL_SYNC = self.DATABASE_URL_SYNC.replace("postgresql://", "postgresql+psycopg2://", 1)

        return self


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
