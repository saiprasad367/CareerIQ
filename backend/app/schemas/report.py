"""
CareerIQ — Career readiness reports and user preferences schemas.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel


class CareerReportCreate(BaseModel):
    report_type: str = "comprehensive_readiness"  # readiness, skill_gap, ats, learning
    title: Optional[str] = None


class CareerReportResponse(BaseModel):
    id: str
    user_id: str
    report_type: str
    title: str
    report_payload: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class UserPreferencesBase(BaseModel):
    default_role_id: Optional[str] = None
    score_threshold: int = 70
    show_demo_badges: bool = True
    show_formulas: bool = True
    job_alerts: bool = True
    roadmap_reminders: bool = True
    application_followups: bool = True
    weekly_digest: bool = False


class UserPreferencesUpdate(BaseModel):
    default_role_id: Optional[str] = None
    score_threshold: Optional[int] = None
    show_demo_badges: Optional[bool] = None
    show_formulas: Optional[bool] = None
    job_alerts: Optional[bool] = None
    roadmap_reminders: Optional[bool] = None
    application_followups: Optional[bool] = None
    weekly_digest: Optional[bool] = None


class UserPreferencesResponse(UserPreferencesBase):
    user_id: str
    updated_at: datetime

    class Config:
        from_attributes = True
