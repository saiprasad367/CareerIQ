"""
CareerIQ — Onboarding API endpoints.
"""
from __future__ import annotations

from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.profile import (
    CandidateProfileResponse,
    OnboardingRequest,
    OnboardingStatusResponse,
)
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


@router.get("/status", response_model=OnboardingStatusResponse)
async def get_onboarding_status(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProfileService(db)
    profile = await service.get_profile(current_user.id)
    return OnboardingStatusResponse(
        completed=profile.onboarding_completed,
        step=4 if profile.onboarding_completed else 1,
        total_steps=4,
        profile=CandidateProfileResponse.model_validate(profile),
    )


@router.post("/complete", response_model=CandidateProfileResponse)
async def complete_onboarding(
    data: OnboardingRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProfileService(db)
    return await service.complete_onboarding(current_user.id, data)
