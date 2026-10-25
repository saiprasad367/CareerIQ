"""
CareerIQ — Job Search, Matching & Saved Jobs API.
"""
from __future__ import annotations

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import MessageResponse, PaginatedResponse, PaginationParams
from app.schemas.job import (
    JobFilterParams,
    JobMatchDetail,
    JobResponse,
    SavedJobResponse,
)
from app.services.job_matching_service import JobMatchingService

router = APIRouter(prefix="/jobs", tags=["Jobs & Matching"])


@router.get("", response_model=PaginatedResponse[JobResponse])
async def search_jobs(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    query: Optional[str] = None,
    location: Optional[str] = None,
    work_mode: Optional[str] = None,
    experience_level: Optional[str] = None,
    employment_type: Optional[str] = None,
    min_match_score: Optional[float] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    params = JobFilterParams(
        query=query,
        location=location,
        work_mode=work_mode,
        experience_level=experience_level,
        employment_type=employment_type,
        min_match_score=min_match_score,
        page=page,
        page_size=page_size,
    )
    service = JobMatchingService(db)
    items, total = await service.search_and_rank_jobs(current_user.id, params)
    return PaginatedResponse.create(items, total, PaginationParams(page=page, page_size=page_size))


@router.get("/recommendations", response_model=List[JobResponse])
async def get_job_recommendations(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = 6,
):
    params = JobFilterParams(page=1, page_size=limit, min_match_score=60.0)
    service = JobMatchingService(db)
    items, _ = await service.search_and_rank_jobs(current_user.id, params)
    return items


@router.get("/saved", response_model=List[SavedJobResponse])
async def get_saved_jobs(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = JobMatchingService(db)
    return await service.get_saved_jobs(current_user.id)


@router.post("/{job_id}/save", response_model=MessageResponse)
async def save_job(
    job_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = JobMatchingService(db)
    await service.save_job(current_user.id, job_id)
    return MessageResponse(message="Job saved successfully.")


@router.delete("/{job_id}/save", response_model=MessageResponse)
async def unsave_job(
    job_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = JobMatchingService(db)
    await service.unsave_job(current_user.id, job_id)
    return MessageResponse(message="Job removed from saved jobs.")


@router.get("/{job_id}/match", response_model=JobMatchDetail)
async def get_job_match_breakdown(
    job_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = JobMatchingService(db)
    return await service.get_job_match_detail(current_user.id, job_id)


@router.post("/sync-live")
async def sync_live_jobs(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(20, ge=1, le=50),
):
    from app.services.job_scraper_service import JobScraperService
    scraper = JobScraperService(db)
    result = await scraper.sync_live_jobs_from_internet(limit=limit)
    return result
