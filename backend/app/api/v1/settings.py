"""
CareerIQ — User Settings, Preferences, and Privacy API.
"""
from __future__ import annotations

from typing import Annotated, Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.profile import CandidateProfile
from app.models.report import UserPreference
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.report import UserPreferencesResponse, UserPreferencesUpdate
from app.services.notification_service import NotificationService
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/settings", tags=["Settings & Preferences"])


@router.get("", response_model=UserPreferencesResponse)
async def get_settings(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = NotificationService(db)
    pref = await service.get_preferences(current_user.id)
    return UserPreferencesResponse.model_validate(pref)


@router.patch("", response_model=UserPreferencesResponse)
async def update_settings(
    data: UserPreferencesUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = NotificationService(db)
    pref = await service.update_preferences(current_user.id, data)
    return UserPreferencesResponse.model_validate(pref)


@router.get("/privacy/data-export")
async def export_account_data(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Dict[str, Any]:
    """Returns a full JSON bundle of all candidate data stored for this user."""
    prof_svc = ProfileService(db)
    profile = await prof_svc.get_profile(current_user.id)
    educations = await prof_svc.get_educations(current_user.id)
    experiences = await prof_svc.get_experiences(current_user.id)
    projects = await prof_svc.get_projects(current_user.id)

    from app.services.skill_taxonomy_service import SkillTaxonomyService
    skills = await SkillTaxonomyService(db).get_candidate_skills(current_user.id)

    return {
        "user": {"id": current_user.id, "email": current_user.email, "role": current_user.role},
        "profile": {
            "full_name": profile.full_name,
            "headline": profile.headline,
            "experience_level": profile.experience_level,
            "work_mode": profile.work_mode,
        },
        "education": [e.__dict__ for e in educations if hasattr(e, "__dict__")],
        "experience": [e.__dict__ for e in experiences if hasattr(e, "__dict__")],
        "projects": [p.__dict__ for p in projects if hasattr(p, "__dict__")],
        "skills": [s.model_dump() for s in skills],
    }


@router.delete("/privacy/account", response_model=MessageResponse)
async def delete_account(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Permanently deletes candidate account and cascading records."""
    await db.delete(current_user)
    await db.commit()
    return MessageResponse(message="Account and all personal records have been permanently deleted.")
