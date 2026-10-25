"""
CareerIQ — Job Matching & Recommendation Service.
Computes hybrid score M = 0.45K + 0.25E + 0.15X + 0.15P for jobs.
"""
from __future__ import annotations

import json
from typing import List, Optional, Set, Tuple
from sqlalchemy import select, delete, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import NotFoundError
from app.ml.embeddings import compute_semantic_similarity
from app.ml.ranking import calculate_job_match
from app.models.job import Company, Job, JobMatch, JobSkill, SavedJob
from app.models.profile import CandidateProfile
from app.models.skill import CandidateSkill, Skill
from app.schemas.job import (
    JobFilterParams,
    JobMatchDetail,
    JobResponse,
    MatchScoreBreakdown,
    SavedJobResponse,
)


class JobMatchingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _get_candidate_context(self, user_id: str) -> Tuple[Set[str], CandidateProfile]:
        # Candidate skills
        stmt = (
            select(Skill.canonical_name)
            .join(CandidateSkill, CandidateSkill.skill_id == Skill.id)
            .where(CandidateSkill.user_id == user_id)
        )
        skills = set((await self.db.execute(stmt)).scalars().all())

        # Profile
        prof_stmt = select(CandidateProfile).where(CandidateProfile.user_id == user_id)
        profile = (await self.db.execute(prof_stmt)).scalar_one_or_none()
        if not profile:
            profile = CandidateProfile(user_id=user_id, full_name="Candidate", experience_level="entry")

        return skills, profile

    async def search_and_rank_jobs(
        self, user_id: str, params: JobFilterParams
    ) -> Tuple[List[JobResponse], int]:
        cand_skills, profile = await self._get_candidate_context(user_id)
        cand_skills_lower = {s.lower() for s in cand_skills}

        # Query active jobs
        stmt = (
            select(Job)
            .where(Job.is_active == True)
            .options(
                selectinload(Job.company),
                selectinload(Job.job_skills).selectinload(JobSkill.skill),
            )
        )

        if params.location:
            stmt = stmt.where(Job.location.ilike(f"%{params.location}%"))
        if params.work_mode:
            stmt = stmt.where(Job.work_mode == params.work_mode)
        if params.experience_level:
            stmt = stmt.where(Job.experience_level == params.experience_level)
        if params.employment_type:
            stmt = stmt.where(Job.employment_type == params.employment_type)
        if params.query:
            q = f"%{params.query}%"
            stmt = stmt.where(Job.title.ilike(q) | Job.description.ilike(q))

        jobs = (await self.db.execute(stmt)).scalars().all()

        # Query user's saved job IDs
        saved_stmt = select(SavedJob.job_id).where(SavedJob.user_id == user_id)
        saved_job_ids = set((await self.db.execute(saved_stmt)).scalars().all())

        # Preferred locations
        pref_locations = []
        if profile.preferred_locations:
            try:
                pref_locations = json.loads(profile.preferred_locations)
            except Exception:
                pref_locations = [profile.preferred_locations]

        # Score all candidates
        ranked: List[Tuple[Job, float]] = []
        candidate_summary_text = f"{profile.headline or ''} {' '.join(cand_skills)}"

        for job in jobs:
            required_skills = {
                js.skill.canonical_name.lower()
                for js in job.job_skills
                if js.requirement_type == "required" and js.skill
            }
            if not required_skills:
                # If no skills specified in job_skills, parse from description
                required_skills = {s.lower() for s in cand_skills_lower if s.lower() in job.description.lower()}

            # Semantic similarity
            e_score = compute_semantic_similarity(candidate_summary_text, job.description)

            # Match calculation M = 0.45K + 0.25E + 0.15X + 0.15P
            match_res = calculate_job_match(
                candidate_skills=cand_skills_lower,
                required_skills=required_skills,
                semantic_similarity=e_score,
                candidate_level=profile.experience_level,
                job_level=job.experience_level,
                candidate_work_mode=profile.work_mode,
                candidate_locations=pref_locations,
                job_work_mode=job.work_mode,
                job_location=job.location,
            )
            score = match_res["score"]

            if params.min_match_score is None or score >= params.min_match_score:
                ranked.append((job, score))

        # Sort descending by match score
        ranked.sort(key=lambda x: x[1], reverse=True)

        total = len(ranked)
        # Apply pagination
        start = (params.page - 1) * params.page_size
        paginated_slice = ranked[start : start + params.page_size]

        job_responses: List[JobResponse] = []
        for job, score in paginated_slice:
            skill_names = [js.skill.canonical_name for js in job.job_skills if js.skill]
            job_responses.append(
                JobResponse(
                    id=job.id,
                    company_id=job.company_id,
                    company_name=job.company.name if job.company else "Tech Company",
                    title=job.title,
                    description=job.description,
                    location=job.location,
                    work_mode=job.work_mode,
                    employment_type=job.employment_type,
                    experience_level=job.experience_level,
                    salary_min=job.salary_min,
                    salary_max=job.salary_max,
                    salary_currency=job.salary_currency,
                    source_name=job.source_name,
                    source_url=job.source_url,
                    posted_at=job.posted_at,
                    skills=skill_names,
                    match_score=score,
                    is_saved=job.id in saved_job_ids,
                )
            )

        return job_responses, total

    async def get_job_match_detail(self, user_id: str, job_id: str) -> JobMatchDetail:
        cand_skills, profile = await self._get_candidate_context(user_id)
        cand_skills_lower = {s.lower() for s in cand_skills}

        stmt = (
            select(Job)
            .where(Job.id == job_id)
            .options(
                selectinload(Job.company),
                selectinload(Job.job_skills).selectinload(JobSkill.skill),
            )
        )
        job = (await self.db.execute(stmt)).scalar_one_or_none()
        if not job:
            raise NotFoundError("Job not found.")

        required_skills = {
            js.skill.canonical_name
            for js in job.job_skills
            if js.requirement_type == "required" and js.skill
        }
        req_lower = {s.lower() for s in required_skills}

        matched = [s for s in required_skills if s.lower() in cand_skills_lower]
        missing = [s for s in required_skills if s.lower() not in cand_skills_lower]

        pref_locations = []
        if profile.preferred_locations:
            try:
                pref_locations = json.loads(profile.preferred_locations)
            except Exception:
                pref_locations = [profile.preferred_locations]

        candidate_summary = f"{profile.headline or ''} {' '.join(cand_skills)}"
        e_score = compute_semantic_similarity(candidate_summary, job.description)

        res = calculate_job_match(
            candidate_skills=cand_skills_lower,
            required_skills=req_lower,
            semantic_similarity=e_score,
            candidate_level=profile.experience_level,
            job_level=job.experience_level,
            candidate_work_mode=profile.work_mode,
            candidate_locations=pref_locations,
            job_work_mode=job.work_mode,
            job_location=job.location,
        )

        breakdown = MatchScoreBreakdown(
            required_skill_coverage=res["required_skill_coverage"],
            semantic_similarity=res["semantic_similarity"],
            experience_compatibility=res["experience_compatibility"],
            preference_compatibility=res["preference_compatibility"],
        )

        sal_str = None
        if job.salary_min and job.salary_max:
            sal_str = f"₹{job.salary_min//100000}L - ₹{job.salary_max//100000}L / yr"
        elif job.salary_display:
            sal_str = job.salary_display

        return JobMatchDetail(
            job_id=job.id,
            job_title=job.title,
            company=job.company.name if job.company else "Company",
            location=job.location or "Remote",
            work_mode=job.work_mode,
            employment_type=job.employment_type or "full-time",
            description=job.description or "",
            salary_display=sal_str,
            source_url=job.source_url or f"https://www.google.com/search?q={job.title}+{job.company.name if job.company else ''}+careers",
            total_score=res["score"],
            breakdown=breakdown,
            matched_skills=matched,
            missing_skills=missing,
            experience_assessment=f"Candidate {profile.experience_level} vs Job {job.experience_level}",
            preference_assessment=f"Work mode: {profile.work_mode} matches {job.work_mode}",
            recommendation_summary=(
                "Strong fit for your current skill profile."
                if res["score"] >= 75
                else "Moderate match. Review missing skills to boost your candidacy."
            ),
        )

    # --- Saved Jobs ---
    async def save_job(self, user_id: str, job_id: str) -> None:
        job = await self.db.get(Job, job_id)
        if not job:
            raise NotFoundError("Job not found.")
        stmt = select(SavedJob).where(SavedJob.user_id == user_id, SavedJob.job_id == job_id)
        existing = (await self.db.execute(stmt)).scalar_one_or_none()
        if not existing:
            saved = SavedJob(user_id=user_id, job_id=job_id)
            self.db.add(saved)
            await self.db.commit()

    async def unsave_job(self, user_id: str, job_id: str) -> None:
        stmt = delete(SavedJob).where(SavedJob.user_id == user_id, SavedJob.job_id == job_id)
        await self.db.execute(stmt)
        await self.db.commit()

    async def get_saved_jobs(self, user_id: str) -> List[SavedJobResponse]:
        stmt = (
            select(SavedJob, Job)
            .join(Job, SavedJob.job_id == Job.id)
            .where(SavedJob.user_id == user_id)
            .options(selectinload(Job.company), selectinload(Job.job_skills).selectinload(JobSkill.skill))
            .order_by(SavedJob.created_at.desc())
        )
        rows = (await self.db.execute(stmt)).all()
        results = []
        for sj, job in rows:
            skill_names = [js.skill.canonical_name for js in job.job_skills if js.skill]
            results.append(
                SavedJobResponse(
                    job_id=job.id,
                    saved_at=sj.created_at,
                    job=JobResponse(
                        id=job.id,
                        company_id=job.company_id,
                        company_name=job.company.name if job.company else "Company",
                        title=job.title,
                        description=job.description,
                        location=job.location,
                        work_mode=job.work_mode,
                        employment_type=job.employment_type,
                        experience_level=job.experience_level,
                        salary_min=job.salary_min,
                        salary_max=job.salary_max,
                        salary_currency=job.salary_currency,
                        source_name=job.source_name,
                        source_url=job.source_url,
                        posted_at=job.posted_at,
                        skills=skill_names,
                        is_saved=True,
                    ),
                )
            )
        return results
