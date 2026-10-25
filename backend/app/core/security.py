"""
CareerIQ — Security utilities: password hashing, JWT issuance and validation.
"""
from __future__ import annotations

import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()

# ---------------------------------------------------------------------------
# Password hashing — Argon2id via passlib
# ---------------------------------------------------------------------------
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    argon2__type="ID",          # Argon2id
    argon2__time_cost=2,
    argon2__memory_cost=65536,  # 64 MB
    argon2__parallelism=2,
    argon2__hash_len=32,
    argon2__salt_len=16,
)


def hash_password(plain: str) -> str:
    """Hash a plaintext password using Argon2id."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against its Argon2id hash."""
    return pwd_context.verify(plain, hashed)


# ---------------------------------------------------------------------------
# JWT access tokens
# ---------------------------------------------------------------------------
def create_access_token(
    subject: Optional[str] = None,
    role: str = "candidate",
    extra: Optional[dict[str, Any]] = None,
    user_id: Optional[str] = None,
    email: Optional[str] = None,
) -> str:
    """Create a short-lived JWT access token."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    sub = str(subject or user_id)
    payload: dict[str, Any] = {
        "sub": sub,
        "role": role,
        "iat": now,
        "exp": expire,
        "type": "access",
    }
    if email:
        payload["email"] = email
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict[str, Any]]:
    """
    Decode and validate a JWT access token.
    Returns payload dict on success, None on error.
    """
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("type") != "access":
            return None
        return payload
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Refresh tokens — opaque random bytes, stored as hashed identifier
# ---------------------------------------------------------------------------
REFRESH_TOKEN_BYTES = 64


def generate_refresh_token() -> tuple[str, str]:
    """
    Generate a refresh token.
    Returns (raw_token, hashed_token) — store only the hash.
    """
    raw = secrets.token_urlsafe(REFRESH_TOKEN_BYTES)
    hashed = _hash_token(raw)
    return raw, hashed


def hash_refresh_token(raw: str) -> str:
    return _hash_token(raw)


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()
