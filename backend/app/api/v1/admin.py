"""
CareerIQ — Admin Endpoints for system metrics and dataset management.
Requires admin role authorization.
"""
from __future__ import annotations

from typing import Annotated, Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.application import Application
from app.models.career_role import CareerRole
from app.models.job import Job
from app.models.resume import ResumeAnalysis
from app.models.skill import Skill
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/overview")
async def get_admin_overview(
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Dict[str, Any]:
    total_users = (await db.execute(select(func.count(User.id)))).scalar_one()
    total_jobs = (await db.execute(select(func.count(Job.id)))).scalar_one()
    total_skills = (await db.execute(select(func.count(Skill.id)))).scalar_one()
    total_roles = (await db.execute(select(func.count(CareerRole.id)))).scalar_one()
    total_resumes = (await db.execute(select(func.count(ResumeAnalysis.id)))).scalar_one()
    total_applications = (await db.execute(select(func.count(Application.id)))).scalar_one()

    return {
        "metrics": {
            "total_candidates": total_users,
            "total_active_jobs": total_jobs,
            "canonical_skills": total_skills,
            "career_roles": total_roles,
            "resumes_analyzed": total_resumes,
            "applications_tracked": total_applications,
        },
        "system_status": "healthy",
    }
