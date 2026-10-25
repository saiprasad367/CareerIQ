"""
CareerIQ — Resume upload, parsing, and ATS analysis schemas.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel


class ResumeUploadResponse(BaseModel):
    resume_id: str
    original_filename: str
    file_size_bytes: int
    content_type: str
    parsing_status: str  # uploaded, parsing, completed, failed
    message: str


class ExtractedSkillItem(BaseModel):
    skill_name: str
    category: str = "general"
    confidence: float = 0.8
    evidence_text: Optional[str] = None


class ResumeParsedData(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    leetcode_url: Optional[str] = None
    headline: Optional[str] = None
    summary: Optional[str] = None
    experience_level: Optional[str] = None
    skills: List[str] = []
    extracted_skills: List[ExtractedSkillItem] = []
    education: List[dict] = []
    experience: List[dict] = []
    projects: List[dict] = []
    certifications: List[Any] = []
    ats_recommendations: List[str] = []
    raw_text: Optional[str] = None

    class Config:
        extra = "allow"


class ResumeAnalysisResponse(BaseModel):
    analysis_id: str
    resume_id: str
    analysis_status: str
    parsed_payload: ResumeParsedData
    ats_score: Optional[float] = None
    readability_score: Optional[float] = None
    section_scores: Optional[Dict[str, Any]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


class ATSAnalysisRequest(BaseModel):
    resume_id: Optional[str] = None
    job_id: Optional[str] = None
    job_description: Optional[str] = None


class ATSScoreBreakdown(BaseModel):
    required_skill_coverage: float   # R (50%)
    relevant_keyword_coverage: float # T (30%)
    formatting_completeness: float   # F (20%)
    formula: str = "A = 0.50R + 0.30T + 0.20F"


class ATSAnalysisResponse(BaseModel):
    overall_score: float
    breakdown: ATSScoreBreakdown
    matched_skills: List[str]
    missing_skills: List[str]
    keyword_matches: List[str]
    missing_keywords: List[str]
    formatting_checks: Dict[str, bool]
    improvement_suggestions: List[str]
    limitations_disclaimer: str = (
        "This score is an automated heuristic estimation and does not represent any specific employer's proprietary ATS."
    )


class ResumeOptimizeRequest(BaseModel):
    target_role_title: str
    target_job_description: Optional[str] = None


class BulletOptimization(BaseModel):
    original: str
    improved: str
    impact_reason: str


class ResumeOptimizeResponse(BaseModel):
    target_role: str
    suggested_skills_to_add: List[str]
    bullet_improvements: List[BulletOptimization]
    keyword_recommendations: List[str]
