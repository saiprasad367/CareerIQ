"""
CareerIQ — Career Role Recommendation Service.
Computes role suitability based on candidate skills vs. role skill taxonomy.
"""
from __future__ import annotations

from typing import List, Set
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.career_role import CareerRole, RoleSkill
from app.models.skill import CandidateSkill, Skill
from app.schemas.career_role import CareerRoleRecommendation


class RoleRecommendationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_candidate_skill_names(self, user_id: str) -> Set[str]:
        stmt = (
            select(Skill.canonical_name)
            .join(CandidateSkill, CandidateSkill.skill_id == Skill.id)
            .where(CandidateSkill.user_id == user_id)
        )
        skills = (await self.db.execute(stmt)).scalars().all()
        return {s.lower() for s in skills}

    async def get_recommendations(self, user_id: str) -> List[CareerRoleRecommendation]:
        cand_skills = await self.get_candidate_skill_names(user_id)

        # Load all active career roles with their skills
        stmt = (
            select(CareerRole)
            .where(CareerRole.is_active == True)
            .options(selectinload(CareerRole.role_skills).selectinload(RoleSkill.skill))
        )
        roles = (await self.db.execute(stmt)).scalars().all()

        recommendations: List[CareerRoleRecommendation] = []

        for role in roles:
            required_skills = [rs for rs in role.role_skills if rs.requirement_type == "required"]
            preferred_skills = [rs for rs in role.role_skills if rs.requirement_type == "preferred"]

            matched_req = []
            missing_req = []

            for rs in required_skills:
                skill_name = rs.skill.canonical_name if rs.skill else "Skill"
                if skill_name.lower() in cand_skills:
                    matched_req.append(skill_name)
                else:
                    missing_req.append(skill_name)

            matched_pref = []
            for rs in preferred_skills:
                skill_name = rs.skill.canonical_name if rs.skill else "Skill"
                if skill_name.lower() in cand_skills:
                    matched_pref.append(skill_name)

            total_req = len(required_skills)
            req_coverage = (len(matched_req) / total_req * 100.0) if total_req > 0 else 100.0
            pref_coverage = (len(matched_pref) / len(preferred_skills) * 100.0) if preferred_skills else 100.0

            # 70% weight on required, 30% weight on preferred
            match_percentage = round((0.70 * req_coverage) + (0.30 * pref_coverage), 1)

            if match_percentage >= 70.0:
                readiness = "High"
            elif match_percentage >= 40.0:
                readiness = "Moderate"
            else:
                readiness = "Developing"

            recommendations.append(
                CareerRoleRecommendation(
                    role_id=role.id,
                    slug=role.slug,
                    title=role.title,
                    description=role.description,
                    category=role.category,
                    match_percentage=match_percentage,
                    matched_skills=matched_req + matched_pref,
                    missing_critical_skills=missing_req,
                    readiness_level=readiness,
                )
            )

        # Sort descending by match percentage
        recommendations.sort(key=lambda r: r.match_percentage, reverse=True)
        return recommendations
