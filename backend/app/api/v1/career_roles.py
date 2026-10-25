"""
CareerIQ — Career Roles & Recommendations API.
"""
from __future__ import annotations

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.core.errors import NotFoundError
from app.db.session import get_db
from app.models.career_role import CareerRole, RoleSkill
from app.models.user import User
from app.schemas.career_role import (
    CareerRoleRecommendation,
    CareerRoleResponse,
    RoleSkillItem,
)
from app.schemas.skill import SkillGapResponse
from app.services.role_recommendation_service import RoleRecommendationService
from app.services.skill_gap_service import SkillGapService

router = APIRouter(prefix="/career-roles", tags=["Career Roles"])


@router.get("", response_model=List[CareerRoleResponse])
async def list_career_roles(
    db: Annotated[AsyncSession, Depends(get_db)],
    category: Optional[str] = None,
):
    stmt = select(CareerRole).where(CareerRole.is_active == True).options(
        selectinload(CareerRole.role_skills).selectinload(RoleSkill.skill)
    )
    if category:
        stmt = stmt.where(CareerRole.category.ilike(f"%{category}%"))

    roles = (await db.execute(stmt)).scalars().all()
    results = []
    for r in roles:
        skills = [
            RoleSkillItem(
                skill_id=rs.skill_id,
                skill_name=rs.skill.canonical_name if rs.skill else "Skill",
                requirement_type=rs.requirement_type,
                importance_weight=rs.importance_weight,
                expected_proficiency=rs.expected_proficiency,
            )
            for rs in r.role_skills
        ]
        results.append(
            CareerRoleResponse(
                id=r.id,
                slug=r.slug,
                title=r.title,
                description=r.description,
                category=r.category,
                experience_level=r.experience_level,
                responsibilities=r.responsibilities,
                is_active=r.is_active,
                skills=skills,
            )
        )
    return results


@router.get("/recommendations", response_model=List[CareerRoleRecommendation])
async def get_career_recommendations(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = RoleRecommendationService(db)
    return await service.get_recommendations(current_user.id)


@router.get("/{role_id}", response_model=CareerRoleResponse)
async def get_career_role(
    role_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    stmt = (
        select(CareerRole)
        .where(CareerRole.id == role_id)
        .options(selectinload(CareerRole.role_skills).selectinload(RoleSkill.skill))
    )
    r = (await db.execute(stmt)).scalar_one_or_none()
    if not r:
        raise NotFoundError("Career role not found.")

    skills = [
        RoleSkillItem(
            skill_id=rs.skill_id,
            skill_name=rs.skill.canonical_name if rs.skill else "Skill",
            requirement_type=rs.requirement_type,
            importance_weight=rs.importance_weight,
            expected_proficiency=rs.expected_proficiency,
        )
        for rs in r.role_skills
    ]
    return CareerRoleResponse(
        id=r.id,
        slug=r.slug,
        title=r.title,
        description=r.description,
        category=r.category,
        experience_level=r.experience_level,
        responsibilities=r.responsibilities,
        is_active=r.is_active,
        skills=skills,
    )


@router.get("/{role_id}/gaps", response_model=SkillGapResponse)
async def get_role_skill_gaps(
    role_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = SkillGapService(db)
    return await service.analyze_gaps(current_user.id, role_id=role_id)
