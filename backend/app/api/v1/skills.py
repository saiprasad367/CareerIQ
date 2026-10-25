"""
CareerIQ — Skills Taxonomy and Normalization API.
"""
from __future__ import annotations

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.skill import (
    SkillGapResponse,
    SkillNormalizeRequest,
    SkillNormalizeResponse,
    SkillResponse,
)
from app.services.skill_gap_service import SkillGapService
from app.services.skill_taxonomy_service import SkillTaxonomyService

router = APIRouter(prefix="/skills", tags=["Skills & Taxonomy"])


@router.get("/taxonomy", response_model=List[SkillResponse])
async def get_skill_taxonomy(
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = SkillTaxonomyService(db)
    return await service.get_all_canonical_skills()


@router.get("/search", response_model=List[SkillResponse])
async def search_skills(
    q: str = Query(..., min_length=1),
    db: Annotated[AsyncSession, Depends(get_db)] = None,
):
    service = SkillTaxonomyService(db)
    return await service.search_skills(q)


@router.post("/normalize", response_model=SkillNormalizeResponse)
async def normalize_skills(
    req: SkillNormalizeRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = SkillTaxonomyService(db)
    return await service.normalize_skills(req.raw_skills)


@router.get("/gaps", response_model=SkillGapResponse)
async def get_skill_gaps(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    role_id: Optional[str] = None,
):
    service = SkillGapService(db)
    return await service.analyze_gaps(current_user.id, role_id=role_id)


@router.post("/{skill_id}/mark-learned", response_model=MessageResponse)
async def mark_skill_learned(
    skill_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = SkillGapService(db)
    await service.mark_skill_learned(current_user.id, skill_id)
    return MessageResponse(message="Skill successfully added to profile as learned.")
