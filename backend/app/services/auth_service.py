"""
CareerIQ — Authentication Service: registration, login, refresh rotation, revocation.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import AuthenticationError, ConflictError, NotFoundError
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.models.profile import CandidateProfile
from app.models.report import UserPreference
from app.models.user import RefreshToken, User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.settings = get_settings()

    async def register(self, req: RegisterRequest) -> Tuple[User, str, str]:
        """
        Registers a new user, hashes password with Argon2id,
        initializes candidate profile & user preferences, and returns (user, access_token, refresh_token).
        """
        normalized_email = req.email.strip().lower()

        # Check existing user
        existing = await self.db.execute(select(User).where(User.email == normalized_email))
        if existing.scalar_one_or_none() is not None:
            raise ConflictError(f"An account with email '{normalized_email}' already exists.")

        hashed_pw = hash_password(req.password)
        user = User(
            email=normalized_email,
            password_hash=hashed_pw,
            role=req.role if req.role in ("candidate", "admin") else "candidate",
            is_active=True,
        )
        self.db.add(user)
        await self.db.flush()

        # Create candidate profile
        profile = CandidateProfile(
            user_id=user.id,
            full_name=req.full_name.strip(),
            onboarding_completed=False,
        )
        self.db.add(profile)

        # Create default preferences
        pref = UserPreference(user_id=user.id)
        self.db.add(pref)

        # Generate tokens
        access_token, raw_refresh = await self._issue_tokens(user)
        await self.db.commit()
        await self.db.refresh(user)

        return user, access_token, raw_refresh

    async def login(self, req: LoginRequest, ip_address: Optional[str] = None) -> Tuple[User, str, str]:
        """
        Authenticates user with Argon2id, rotates refresh token, returns (user, access_token, refresh_token).
        """
        normalized_email = req.email.strip().lower()
        stmt = select(User).where(User.email == normalized_email)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user or not user.is_active:
            raise AuthenticationError("Invalid email or password.")

        if not verify_password(req.password, user.password_hash):
            raise AuthenticationError("Invalid email or password.")

        user.last_login_at = datetime.now(timezone.utc)
        access_token, raw_refresh = await self._issue_tokens(user, ip_address=ip_address)
        await self.db.commit()
        await self.db.refresh(user)

        return user, access_token, raw_refresh

    async def refresh(self, raw_refresh_token: str) -> Tuple[User, str, str]:
        """
        Rotates refresh token: revokes old one, issues new pair.
        """
        hashed = hash_refresh_token(raw_refresh_token)
        now = datetime.now(timezone.utc)

        stmt = select(RefreshToken).where(
            RefreshToken.token_hash == hashed,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > now,
        )
        result = await self.db.execute(stmt)
        token_record = result.scalar_one_or_none()

        if not token_record:
            raise AuthenticationError("Invalid or expired refresh token.")

        # Revoke old token
        token_record.revoked_at = now

        # Fetch user
        user = await self.db.get(User, token_record.user_id)
        if not user or not user.is_active:
            raise AuthenticationError("User is no longer active.")

        # Issue new pair
        access_token, new_raw_refresh = await self._issue_tokens(user)
        await self.db.commit()

        return user, access_token, new_raw_refresh

    async def logout(self, raw_refresh_token: Optional[str]) -> None:
        """Revokes the refresh token on logout."""
        if not raw_refresh_token:
            return
        hashed = hash_refresh_token(raw_refresh_token)
        stmt = (
            update(RefreshToken)
            .where(RefreshToken.token_hash == hashed)
            .values(revoked_at=datetime.now(timezone.utc))
        )
        await self.db.execute(stmt)
        await self.db.commit()

    async def _issue_tokens(self, user: User, ip_address: Optional[str] = None) -> Tuple[str, str]:
        access_token = create_access_token(user_id=user.id, role=user.role, email=user.email)
        raw_refresh, token_hash = generate_refresh_token()
        expires_at = datetime.now(timezone.utc) + timedelta(days=self.settings.REFRESH_TOKEN_EXPIRE_DAYS)

        token_entry = RefreshToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            ip_address=ip_address,
        )
        self.db.add(token_entry)
        return access_token, raw_refresh
