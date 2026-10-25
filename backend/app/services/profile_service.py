"""
CareerIQ — Profile, Onboarding, Education, Experience, and Project Service.
"""
from __future__ import annotations

import json
from typing import List, Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import NotFoundError, PermissionDeniedError
from app.models.education import Education, Experience, Project
from app.models.profile import CandidateProfile
from app.models.skill import CandidateSkill, Skill
from app.schemas.profile import (
    CandidateProfileResponse,
    CandidateProfileUpdate,
    EducationCreate,
    EducationResponse,
    EducationUpdate,
    ExperienceCreate,
    ExperienceResponse,
    ExperienceUpdate,
    OnboardingRequest,
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)


class ProfileService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_profile(self, user_id: str) -> CandidateProfile:
        stmt = select(CandidateProfile).where(CandidateProfile.user_id == user_id)
        result = await self.db.execute(stmt)
        profile = result.scalar_one_or_none()
        if not profile:
            raise NotFoundError("Candidate profile not found.")
        return profile

    async def update_profile(self, user_id: str, update_data: CandidateProfileUpdate) -> CandidateProfile:
        profile = await self.get_profile(user_id)
        for key, val in update_data.model_dump(exclude_unset=True).items():
            setattr(profile, key, val)
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def complete_onboarding(self, user_id: str, req: OnboardingRequest) -> CandidateProfile:
        profile = await self.get_profile(user_id)
        profile.full_name = req.full_name.strip()
        if req.headline:
            profile.headline = req.headline.strip()
        profile.experience_level = req.experience_level
        profile.work_mode = req.work_mode
        if req.preferred_locations:
            profile.preferred_locations = json.dumps(req.preferred_locations)
        if req.career_goal:
            profile.career_goal = req.career_goal.strip()
        if req.target_roles:
            profile.target_roles_json = json.dumps(req.target_roles)
        if req.target_salary:
            profile.target_salary = req.target_salary.strip()
        profile.onboarding_completed = True

        # Save initial skills if provided
        if req.skills:
            for skill_name in req.skills:
                clean_name = skill_name.strip()
                if not clean_name:
                    continue
                # Find or create skill
                skill_stmt = select(Skill).where(Skill.canonical_name.ilike(clean_name))
                res = await self.db.execute(skill_stmt)
                skill = res.scalar_one_or_none()
                if not skill:
                    skill = Skill(canonical_name=clean_name, category="general")
                    self.db.add(skill)
                    await self.db.flush()

                # Check existing candidate skill
                cs_stmt = select(CandidateSkill).where(
                    CandidateSkill.user_id == user_id, CandidateSkill.skill_id == skill.id
                )
                if (await self.db.execute(cs_stmt)).scalar_one_or_none() is None:
                    cand_skill = CandidateSkill(
                        user_id=user_id,
                        skill_id=skill.id,
                        proficiency="intermediate",
                        evidence_source="user_entered",
                    )
                    self.db.add(cand_skill)

        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    # --- Education CRUD ---
    async def get_educations(self, user_id: str) -> List[Education]:
        stmt = select(Education).where(Education.user_id == user_id).order_by(Education.end_year.desc().nullslast())
        return list((await self.db.execute(stmt)).scalars().all())

    async def add_education(self, user_id: str, data: EducationCreate) -> Education:
        edu = Education(user_id=user_id, **data.model_dump())
        self.db.add(edu)
        await self.db.commit()
        await self.db.refresh(edu)
        return edu

    async def update_education(self, user_id: str, edu_id: str, data: EducationUpdate) -> Education:
        edu = await self.db.get(Education, edu_id)
        if not edu or edu.user_id != user_id:
            raise NotFoundError("Education record not found.")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(edu, k, v)
        await self.db.commit()
        await self.db.refresh(edu)
        return edu

    async def delete_education(self, user_id: str, edu_id: str) -> bool:
        edu = await self.db.get(Education, edu_id)
        if not edu or edu.user_id != user_id:
            raise NotFoundError("Education record not found.")
        await self.db.delete(edu)
        await self.db.commit()
        return True

    # --- Experience CRUD ---
    async def get_experiences(self, user_id: str) -> List[Experience]:
        stmt = select(Experience).where(Experience.user_id == user_id).order_by(Experience.is_current.desc())
        return list((await self.db.execute(stmt)).scalars().all())

    async def add_experience(self, user_id: str, data: ExperienceCreate) -> Experience:
        exp = Experience(user_id=user_id, **data.model_dump())
        self.db.add(exp)
        await self.db.commit()
        await self.db.refresh(exp)
        return exp

    async def update_experience(self, user_id: str, exp_id: str, data: ExperienceUpdate) -> Experience:
        exp = await self.db.get(Experience, exp_id)
        if not exp or exp.user_id != user_id:
            raise NotFoundError("Experience record not found.")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(exp, k, v)
        await self.db.commit()
        await self.db.refresh(exp)
        return exp

    async def delete_experience(self, user_id: str, exp_id: str) -> bool:
        exp = await self.db.get(Experience, exp_id)
        if not exp or exp.user_id != user_id:
            raise NotFoundError("Experience record not found.")
        await self.db.delete(exp)
        await self.db.commit()
        return True

    # --- Project CRUD ---
    async def get_projects(self, user_id: str) -> List[Project]:
        stmt = select(Project).where(Project.user_id == user_id)
        return list((await self.db.execute(stmt)).scalars().all())

    async def add_project(self, user_id: str, data: ProjectCreate) -> Project:
        payload = data.model_dump()
        skills = payload.pop("skills_used", None)
        proj = Project(user_id=user_id, **payload)
        if skills:
            proj.skills_json = json.dumps(skills)
        self.db.add(proj)
        await self.db.commit()
        await self.db.refresh(proj)
        return proj

    async def update_project(self, user_id: str, proj_id: str, data: ProjectUpdate) -> Project:
        proj = await self.db.get(Project, proj_id)
        if not proj or proj.user_id != user_id:
            raise NotFoundError("Project record not found.")
        payload = data.model_dump(exclude_unset=True)
        if "skills_used" in payload:
            skills = payload.pop("skills_used")
            proj.skills_json = json.dumps(skills) if skills is not None else None
        for k, v in payload.items():
            setattr(proj, k, v)
        await self.db.commit()
        await self.db.refresh(proj)
        return proj

    async def delete_project(self, user_id: str, proj_id: str) -> bool:
        proj = await self.db.get(Project, proj_id)
        if not proj or proj.user_id != user_id:
            raise NotFoundError("Project record not found.")
        await self.db.delete(proj)
        await self.db.commit()
        return True
