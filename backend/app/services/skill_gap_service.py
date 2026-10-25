"""
CareerIQ — Skill Gap Analysis Service.
Performs gap detection against target career roles and matches learning resources.
"""
from __future__ import annotations

from typing import Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import NotFoundError
from app.models.career_role import CareerRole, RoleSkill
from app.models.profile import CandidateProfile
from app.models.roadmap import LearningResource, ResourceSkill
from app.models.skill import CandidateSkill, Skill
from app.schemas.skill import SkillGapItem, SkillGapResponse


class SkillGapService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def analyze_gaps(self, user_id: str, role_id: Optional[str] = None) -> SkillGapResponse:
        # 1. Resolve role
        target_role = None
        if role_id:
            target_role = await self.db.get(
                CareerRole, role_id, options=[selectinload(CareerRole.role_skills).selectinload(RoleSkill.skill)]
            )
        if not target_role:
            # Check user target role
            prof_stmt = select(CandidateProfile).where(CandidateProfile.user_id == user_id)
            profile = (await self.db.execute(prof_stmt)).scalar_one_or_none()
            if profile and profile.target_role_id:
                target_role = await self.db.get(
                    CareerRole, profile.target_role_id, options=[selectinload(CareerRole.role_skills).selectinload(RoleSkill.skill)]
                )

        if not target_role:
            # Pick the default first active role
            stmt = (
                select(CareerRole)
                .where(CareerRole.is_active == True)
                .options(selectinload(CareerRole.role_skills).selectinload(RoleSkill.skill))
                .limit(1)
            )
            target_role = (await self.db.execute(stmt)).scalar_one_or_none()

        if not target_role:
            raise NotFoundError("No career roles available for analysis.")

        # 2. Candidate skills lookup
        cs_stmt = (
            select(CandidateSkill, Skill)
            .join(Skill, CandidateSkill.skill_id == Skill.id)
            .where(CandidateSkill.user_id == user_id)
        )
        cand_rows = (await self.db.execute(cs_stmt)).all()
        cand_map = {skill.canonical_name.lower(): (cs.proficiency, skill) for cs, skill in cand_rows}

        # 3. Analyze each role requirement
        gap_items: List[SkillGapItem] = []
        matched_count = 0
        req_count = 0
        missing_req_count = 0
        missing_pref_count = 0

        for rs in target_role.role_skills:
            skill = rs.skill
            if not skill:
                continue

            s_name = skill.canonical_name
            is_req = rs.requirement_type == "required"
            if is_req:
                req_count += 1

            in_cand = s_name.lower() in cand_map

            if in_cand:
                matched_count += 1
                user_prof = cand_map[s_name.lower()][0]
                gap_items.append(
                    SkillGapItem(
                        skill_name=s_name,
                        category=skill.category,
                        requirement_type=rs.requirement_type,
                        importance_weight=rs.importance_weight,
                        is_missing=False,
                        user_proficiency=user_prof,
                        expected_proficiency=rs.expected_proficiency,
                    )
                )
            else:
                if is_req:
                    missing_req_count += 1
                else:
                    missing_pref_count += 1

                # Lookup learning resources for this missing skill
                res_stmt = (
                    select(LearningResource)
                    .join(ResourceSkill, ResourceSkill.resource_id == LearningResource.id)
                    .where(ResourceSkill.skill_id == skill.id)
                    .limit(2)
                )
                rec_resources = (await self.db.execute(res_stmt)).scalars().all()
                res_dicts = [
                    {"title": r.title, "provider": r.provider, "url": r.url, "difficulty": r.difficulty}
                    for r in rec_resources
                ]

                gap_items.append(
                    SkillGapItem(
                        skill_name=s_name,
                        category=skill.category,
                        requirement_type=rs.requirement_type,
                        importance_weight=rs.importance_weight,
                        is_missing=True,
                        user_proficiency=None,
                        expected_proficiency=rs.expected_proficiency,
                        recommended_resources=res_dicts if res_dicts else None,
                    )
                )

        # Sort missing items first by importance
        gap_items.sort(key=lambda item: (not item.is_missing, -item.importance_weight))

        overall_match = round((matched_count / req_count * 100.0) if req_count > 0 else 100.0, 1)

        return SkillGapResponse(
            role_id=target_role.id,
            role_title=target_role.title,
            overall_match_percentage=overall_match,
            required_skills_count=req_count,
            matched_skills_count=matched_count,
            missing_required_count=missing_req_count,
            missing_preferred_count=missing_pref_count,
            gaps=gap_items,
        )

    async def mark_skill_learned(self, user_id: str, skill_id: str) -> None:
        """Adds or updates skill to intermediate upon candidate marking it as learned."""
        skill = await self.db.get(Skill, skill_id)
        if not skill:
            raise NotFoundError("Skill not found.")

        stmt = select(CandidateSkill).where(
            CandidateSkill.user_id == user_id, CandidateSkill.skill_id == skill.id
        )
        existing = (await self.db.execute(stmt)).scalar_one_or_none()
        if existing:
            existing.proficiency = "intermediate"
            existing.evidence_source = "user_entered"
        else:
            new_cs = CandidateSkill(
                user_id=user_id,
                skill_id=skill.id,
                proficiency="intermediate",
                evidence_source="user_entered",
            )
            self.db.add(new_cs)
        await self.db.commit()
