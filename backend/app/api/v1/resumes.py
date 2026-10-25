"""
CareerIQ — Resumes and Document Processing API.
"""
from __future__ import annotations

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.errors import BadRequestError, NotFoundError
from app.db.session import get_db
from app.models.resume import ResumeAnalysis, ResumeDocument
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.resume import (
    ResumeAnalysisResponse,
    ResumeOptimizeRequest,
    ResumeOptimizeResponse,
    ResumeUploadResponse,
)
from app.services.ats_service import ATSService
from app.services.resume_analysis_service import ResumeAnalysisService
from app.storage import get_storage_provider

router = APIRouter(prefix="/resumes", tags=["Resumes & Parsing"])


@router.post("/upload", response_model=ResumeAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
):
    settings = get_settings()

    from pathlib import Path

    # Sanitize and validate file extension
    filename = Path(file.filename or "resume.pdf").name
    lower_name = filename.lower()
    if not (lower_name.endswith(".pdf") or lower_name.endswith(".docx")):
        raise BadRequestError("Only PDF (.pdf) and Word (.docx) documents are supported.")

    file_bytes = await file.read()
    if len(file_bytes) > settings.max_upload_size_bytes:
        raise BadRequestError(f"File size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB}MB.")

    # Validate file magic signatures
    if lower_name.endswith(".pdf") and not file_bytes.startswith(b"%PDF"):
        raise BadRequestError("Uploaded file signature does not match standard PDF document format.")
    if lower_name.endswith(".docx") and not file_bytes.startswith(b"PK\x03\x04"):
        raise BadRequestError("Uploaded file signature does not match standard Word (.docx) document format.")

    service = ResumeAnalysisService(db)
    analysis = await service.upload_and_process_resume(
        user_id=current_user.id,
        filename=filename,
        file_bytes=file_bytes,
        content_type=file.content_type or "application/octet-stream",
    )

    return ResumeAnalysisResponse(
        analysis_id=analysis.id,
        resume_id=analysis.resume_id,
        analysis_status=analysis.analysis_status,
        parsed_payload=analysis.parsed_payload or {},
        ats_score=analysis.ats_score,
        readability_score=analysis.readability_score,
        section_scores=analysis.section_scores,
        created_at=analysis.created_at,
        completed_at=analysis.completed_at,
    )


@router.get("/latest/analysis", response_model=ResumeAnalysisResponse)
async def get_latest_resume_analysis(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ResumeAnalysisService(db)
    analysis = await service.get_latest_analysis(current_user.id)
    if not analysis:
        raise NotFoundError("No resume analysis found. Please upload a resume first.")

    return ResumeAnalysisResponse(
        analysis_id=analysis.id,
        resume_id=analysis.resume_id,
        analysis_status=analysis.analysis_status,
        parsed_payload=analysis.parsed_payload or {},
        ats_score=analysis.ats_score,
        readability_score=analysis.readability_score,
        section_scores=analysis.section_scores,
        created_at=analysis.created_at,
        completed_at=analysis.completed_at,
    )


@router.get("/{resume_id}/analysis", response_model=ResumeAnalysisResponse)
async def get_resume_analysis(
    resume_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    stmt = select(ResumeAnalysis).where(
        ResumeAnalysis.resume_id == resume_id, ResumeAnalysis.user_id == current_user.id
    )
    analysis = (await db.execute(stmt)).scalar_one_or_none()
    if not analysis:
        raise NotFoundError("Resume analysis not found.")

    return ResumeAnalysisResponse(
        analysis_id=analysis.id,
        resume_id=analysis.resume_id,
        analysis_status=analysis.analysis_status,
        parsed_payload=analysis.parsed_payload or {},
        ats_score=analysis.ats_score,
        readability_score=analysis.readability_score,
        section_scores=analysis.section_scores,
        created_at=analysis.created_at,
        completed_at=analysis.completed_at,
    )


@router.delete("/{resume_id}", response_model=MessageResponse)
async def delete_resume(
    resume_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    stmt = select(ResumeDocument).where(
        ResumeDocument.id == resume_id, ResumeDocument.user_id == current_user.id
    )
    doc = (await db.execute(stmt)).scalar_one_or_none()
    if not doc:
        raise NotFoundError("Resume not found.")

    # Delete from storage
    storage = get_storage_provider()
    await storage.delete(doc.storage_key)

    await db.delete(doc)
    await db.commit()
    return MessageResponse(message="Resume and associated analysis successfully deleted.")


@router.post("/{resume_id}/optimize", response_model=ResumeOptimizeResponse)
async def optimize_resume(
    resume_id: str,
    req: ResumeOptimizeRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ATSService(db)
    return await service.optimize_resume(current_user.id, req)
