"""
CareerIQ — Authentication Endpoints: register, login, refresh, logout, me.
"""
from __future__ import annotations

from typing import Annotated, Optional
from fastapi import APIRouter, Cookie, Depends, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.errors import BadRequestError
from app.db.session import get_db
from app.models.profile import CandidateProfile
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.schemas.common import MessageResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    req: RegisterRequest,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = AuthService(db)
    user, access_token, raw_refresh = await service.register(req)

    # Set secure HttpOnly cookie for refresh token
    settings = get_settings()
    response.set_cookie(
        key="refresh_token",
        value=raw_refresh,
        httponly=True,
        secure=settings.APP_ENV == "production",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user.id,
        email=user.email,
        role=user.role,
        full_name=req.full_name,
        onboarding_completed=False,
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    req: LoginRequest,
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = AuthService(db)
    user, access_token, raw_refresh = await service.login(req, ip_address=request.client.host if request.client else None)

    settings = get_settings()
    response.set_cookie(
        key="refresh_token",
        value=raw_refresh,
        httponly=True,
        secure=settings.APP_ENV == "production",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )

    # Fetch profile
    from sqlalchemy import select
    prof = (await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == user.id))).scalar_one_or_none()

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user.id,
        email=user.email,
        role=user.role,
        full_name=prof.full_name if prof else "User",
        onboarding_completed=prof.onboarding_completed if prof else False,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    body: Optional[RefreshRequest] = None,
    refresh_token_cookie: Annotated[Optional[str], Cookie(alias="refresh_token")] = None,
):
    raw_token = (body.refresh_token if body and body.refresh_token else None) or refresh_token_cookie
    if not raw_token:
        raise BadRequestError("No refresh token provided.")

    service = AuthService(db)
    user, access_token, new_raw_refresh = await service.refresh(raw_token)

    settings = get_settings()
    response.set_cookie(
        key="refresh_token",
        value=new_raw_refresh,
        httponly=True,
        secure=settings.APP_ENV == "production",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )

    from sqlalchemy import select
    prof = (await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == user.id))).scalar_one_or_none()

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user.id,
        email=user.email,
        role=user.role,
        full_name=prof.full_name if prof else "User",
        onboarding_completed=prof.onboarding_completed if prof else False,
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    body: Optional[RefreshRequest] = None,
    refresh_token_cookie: Annotated[Optional[str], Cookie(alias="refresh_token")] = None,
):
    raw_token = (body.refresh_token if body and body.refresh_token else None) or refresh_token_cookie
    service = AuthService(db)
    await service.logout(raw_token)
    response.delete_cookie("refresh_token")
    return MessageResponse(message="Successfully logged out.")


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    from sqlalchemy import select
    prof = (await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == current_user.id))).scalar_one_or_none()
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        full_name=prof.full_name if prof else None,
        onboarding_completed=prof.onboarding_completed if prof else False,
    )
