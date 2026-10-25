"""
CareerIQ — Profile, Education, Experience, Project, and Onboarding schemas.
"""
from __future__ import annotations

from typing import List, Optional
from datetime import date
from pydantic import BaseModel, Field


# --- Candidate Profile ---
class CandidateProfileBase(BaseModel):
    full_name: str
    headline: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    education_summary: Optional[str] = None
    experience_level: str = "entry"
    target_salary: Optional[str] = None
    target_role_id: Optional[str] = None
    work_mode: str = "hybrid"
    preferred_locations: Optional[str] = None
    career_goal: Optional[str] = None
    target_roles_json: Optional[str] = None


class CandidateProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    headline: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    education_summary: Optional[str] = None
    experience_level: Optional[str] = None
    target_salary: Optional[str] = None
    target_role_id: Optional[str] = None
    work_mode: Optional[str] = None
    preferred_locations: Optional[str] = None
    career_goal: Optional[str] = None
    target_roles_json: Optional[str] = None


class CandidateProfileResponse(CandidateProfileBase):
    id: str
    user_id: str
    onboarding_completed: bool

    class Config:
        from_attributes = True


# --- Onboarding ---
class OnboardingRequest(BaseModel):
    full_name: str
    headline: Optional[str] = None
    experience_level: str = "entry"
    work_mode: str = "hybrid"
    preferred_locations: Optional[List[str]] = None
    career_goal: Optional[str] = None
    target_roles: Optional[List[str]] = None
    target_salary: Optional[str] = None
    skills: Optional[List[str]] = None


class OnboardingStatusResponse(BaseModel):
    completed: bool
    step: int = 1
    total_steps: int = 4
    profile: Optional[CandidateProfileResponse] = None


# --- Education ---
class EducationBase(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    grade_or_gpa: Optional[str] = None
    description: Optional[str] = None


class EducationCreate(EducationBase):
    pass


class EducationUpdate(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    grade_or_gpa: Optional[str] = None
    description: Optional[str] = None


class EducationResponse(EducationBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True


# --- Experience ---
class ExperienceBase(BaseModel):
    company: str
    role_title: str
    employment_type: str = "full-time"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    is_current: bool = False


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    company: Optional[str] = None
    role_title: Optional[str] = None
    employment_type: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    is_current: Optional[bool] = None


class ExperienceResponse(ExperienceBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True


# --- Project ---
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    skills_used: Optional[List[str]] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    skills_used: Optional[List[str]] = None


class ProjectResponse(ProjectBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True
