"""
CareerIQ — Central API v1 Router.
Mounts all domain route modules under /api/v1.
"""
from fastapi import APIRouter

from app.api.v1.admin import router as admin_router
from app.api.v1.applications import router as applications_router
from app.api.v1.assistant import router as assistant_router
from app.api.v1.auth import router as auth_router
from app.api.v1.career_roles import router as career_roles_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.onboarding import router as onboarding_router
from app.api.v1.profile import router as profile_router
from app.api.v1.reports import router as reports_router
from app.api.v1.resumes import router as resumes_router
from app.api.v1.roadmap import router as roadmap_router
from app.api.v1.settings import router as settings_router
from app.api.v1.skills import router as skills_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(profile_router)
api_v1_router.include_router(onboarding_router)
api_v1_router.include_router(resumes_router)
api_v1_router.include_router(career_roles_router)
api_v1_router.include_router(jobs_router)
api_v1_router.include_router(skills_router)
api_v1_router.include_router(roadmap_router)
api_v1_router.include_router(applications_router)
api_v1_router.include_router(assistant_router)
api_v1_router.include_router(reports_router)
api_v1_router.include_router(settings_router)
api_v1_router.include_router(admin_router)
