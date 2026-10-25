"""
CareerIQ — Application tracker schemas.
"""
from __future__ import annotations

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ApplicationBase(BaseModel):
    job_id: Optional[str] = None
    job_title: str
    company: str
    location: Optional[str] = None
    work_mode: Optional[str] = None
    salary: Optional[str] = None
    status: str = Field(default="Applied")  # Saved, Applied, Assessment, Interview, Offer, Rejected, Withdrawn
    applied_date: Optional[str] = None
    follow_up_date: Optional[str] = None
    notes: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    job_title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    salary: Optional[str] = None
    status: Optional[str] = None
    applied_date: Optional[str] = None
    follow_up_date: Optional[str] = None
    notes: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., description="Target status: Saved, Applied, Assessment, Interview, Offer, Rejected, Withdrawn")


class ApplicationResponse(ApplicationBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
