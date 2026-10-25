"""
CareerIQ — Career Readiness Reports API.
"""
from __future__ import annotations

from typing import Annotated, List
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.report import CareerReportCreate, CareerReportResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Career Reports"])


@router.get("", response_model=List[CareerReportResponse])
async def list_reports(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ReportService(db)
    return await service.get_user_reports(current_user.id)


@router.post("", response_model=CareerReportResponse, status_code=status.HTTP_201_CREATED)
async def generate_report(
    data: CareerReportCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ReportService(db)
    return await service.generate_report(current_user.id, data)


@router.get("/{report_id}", response_model=CareerReportResponse)
async def get_report(
    report_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ReportService(db)
    return await service.get_report_by_id(current_user.id, report_id)


@router.get("/{report_id}/export")
async def export_report(
    report_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ReportService(db)
    file_bytes = await service.export_report_pdf(current_user.id, report_id)
    return Response(
        content=file_bytes,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename=careeriq_report_{report_id[:8]}.txt"},
    )
