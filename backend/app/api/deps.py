"""
CareerIQ — FastAPI API dependencies: Authentication, DB session, authorization.
"""
from __future__ import annotations

from typing import Annotated, AsyncGenerator, Optional
from fastapi import Cookie, Depends, Header, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AuthenticationError, PermissionDeniedError
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    db: Annotated[AsyncSession, Depends(get_db)],
    token_auth: Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)] = None,
    access_token_cookie: Annotated[Optional[str], Cookie()] = None,
) -> User:
    """
    Validates JWT access token from Bearer header or cookie.
    Never trusts user_id in body/params.
    """
    raw_token = None
    if token_auth and token_auth.credentials:
        raw_token = token_auth.credentials
    elif access_token_cookie:
        raw_token = access_token_cookie

    if not raw_token:
        raise AuthenticationError("Authentication required. Please log in.")

    payload = decode_access_token(raw_token)
    if not payload:
        raise AuthenticationError("Invalid or expired session token. Please re-authenticate.")

    user_id = payload.get("sub")
    if not user_id:
        raise AuthenticationError("Malformed token.")

    user = await db.get(User, user_id)
    if not user or not user.is_active:
        raise AuthenticationError("User account not found or has been deactivated.")

    return user


async def require_admin(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Enforces that the current authenticated user has role == 'admin'."""
    if current_user.role != "admin":
        raise PermissionDeniedError("Admin privileges are required for this action.")
    return current_user
