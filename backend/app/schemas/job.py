"""
CareerIQ — Job, JobMatching, and SavedJob schemas.
"""
from __future__ import annotations

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class JobSkillRequirement(BaseModel):
    skill_name: str
    requirement_type: str = "required"
    importance_weight: float = 1.0


class JobBase(BaseModel):
    title: str
    company_name: str
    description: str
    location: str
    work_mode: str = "hybrid"
    employment_type: str = "full-time"
    experience_level: str = "entry"
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: Optional[str] = "INR"
    source_name: str = "CareerIQ Curated"
    source_url: Optional[str] = None


class JobResponse(JobBase):
    id: str
    company_id: Optional[str] = None
    posted_at: Optional[datetime] = None
    skills: List[str] = []
    match_score: Optional[float] = None
    is_saved: Optional[bool] = False

    class Config:
        from_attributes = True


class JobFilterParams(BaseModel):
    query: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    experience_level: Optional[str] = None
    employment_type: Optional[str] = None
    min_match_score: Optional[float] = None
    page: int = 1
    page_size: int = 20


class MatchScoreBreakdown(BaseModel):
    required_skill_coverage: float  # K
    semantic_similarity: float      # E
    experience_compatibility: float # X
    preference_compatibility: float # P
    formula: str = "M = 0.45K + 0.25E + 0.15X + 0.15P"


class JobMatchDetail(BaseModel):
    job_id: str
    job_title: str
    company: str
    location: str
    work_mode: str
    employment_type: Optional[str] = "full-time"
    description: Optional[str] = None
    salary_display: Optional[str] = None
    source_url: Optional[str] = None
    total_score: float
    breakdown: MatchScoreBreakdown
    matched_skills: List[str]
    missing_skills: List[str]
    experience_assessment: str
    preference_assessment: str
    recommendation_summary: str


class SavedJobResponse(BaseModel):
    job_id: str
    saved_at: datetime
    job: JobResponse
