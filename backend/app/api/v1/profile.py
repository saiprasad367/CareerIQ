"""
CareerIQ — Profile, Skills, Education, Experience, and Projects API.
"""
from __future__ import annotations

from typing import Annotated, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.profile import (
    CandidateProfileResponse,
    CandidateProfileUpdate,
    EducationCreate,
    EducationResponse,
    EducationUpdate,
    ExperienceCreate,
    ExperienceResponse,
    ExperienceUpdate,
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)
from app.schemas.skill import (
    CandidateSkillCreate,
    CandidateSkillResponse,
    CandidateSkillUpdate,
)
from app.services.profile_service import ProfileService
from app.services.skill_taxonomy_service import SkillTaxonomyService

router = APIRouter(prefix="/profile", tags=["Candidate Profile"])


@router.get("", response_model=CandidateProfileResponse)
async def get_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProfileService(db)
    return await service.get_profile(current_user.id)


@router.put("", response_model=CandidateProfileResponse)
@router.patch("", response_model=CandidateProfileResponse)
async def update_profile(
    data: CandidateProfileUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProfileService(db)
    return await service.update_profile(current_user.id, data)


# --- Candidate Skills ---
@router.get("/skills", response_model=List[CandidateSkillResponse])
async def get_candidate_skills(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = SkillTaxonomyService(db)
    return await service.get_candidate_skills(current_user.id)


@router.post("/skills", response_model=CandidateSkillResponse, status_code=status.HTTP_201_CREATED)
async def add_candidate_skill(
    data: CandidateSkillCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = SkillTaxonomyService(db)
    return await service.add_candidate_skill(current_user.id, data)


@router.delete("/skills/{skill_id}", response_model=MessageResponse)
async def delete_candidate_skill(
    skill_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = SkillTaxonomyService(db)
    await service.delete_candidate_skill(current_user.id, skill_id)
    return MessageResponse(message="Skill removed from candidate inventory.")


# --- Education ---
@router.get("/education", response_model=List[EducationResponse])
async def get_educations(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProfileService(db)
    return await service.get_educations(current_user.id)


@router.post("/education", response_model=EducationResponse, status_code=status.HTTP_201_CREATED)
async def add_education(
    data: EducationCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProfileService(db)
    return await service.add_education(current_user.id, data)


@router.patch("/education/{education_id}", response_model=EducationResponse)
async def update_education(
    education_id: str,
    data: EducationUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProfileService(db)
    return await service.update_education(current_user.id, education_id, data)


@router.delete("/education/{education_id}", response_model=MessageResponse)
async def delete_education(
    education_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProfileService(db)
    await service.delete_education(current_user.id, education_id)
    return MessageResponse(message="Education entry deleted.")


# --- Experience ---
@router.get("/experience", response_model=List[ExperienceResponse])
async def get_experiences(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProfileService(db)
    return await service.get_experiences(current_user.id)


@router.post("/experience", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
async def add_experience(
    data: ExperienceCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProfileService(db)
    return await service.add_experience(current_user.id, data)


@router.patch("/experience/{experience_id}", response_model=ExperienceResponse)
async def update_experience(
    experience_id: str,
    data: ExperienceUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProfileService(db)
    return await service.update_experience(current_user.id, experience_id, data)


@router.delete("/experience/{experience_id}", response_model=MessageResponse)
async def delete_experience(
    experience_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProfileService(db)
    await service.delete_experience(current_user.id, experience_id)
    return MessageResponse(message="Experience entry deleted.")


# --- Projects ---
@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProfileService(db)
    return await service.get_projects(current_user.id)


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def add_project(
    data: ProjectCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProfileService(db)
    return await service.add_project(current_user.id, data)


@router.patch("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    data: ProjectUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProfileService(db)
    return await service.update_project(current_user.id, project_id, data)


@router.delete("/projects/{project_id}", response_model=MessageResponse)
async def delete_project(
    project_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProfileService(db)
    await service.delete_project(current_user.id, project_id)
    return MessageResponse(message="Project entry deleted.")
