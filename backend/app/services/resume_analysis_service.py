"""
CareerIQ — Resume Analysis Service.
Coordinates storage, parsing, ATS scoring, candidate skill updates, and history tracking.
"""
from __future__ import annotations

import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import BadRequestError, NotFoundError
from app.models.profile import CandidateProfile
from app.models.resume import ResumeAnalysis, ResumeAnalysisSkill, ResumeDocument
from app.models.skill import CandidateSkill, Skill
from app.services.resume_parser import ResumeParser
from app.storage import get_storage_provider


class ResumeAnalysisService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.storage = get_storage_provider()

    async def upload_and_process_resume(
        self,
        user_id: str,
        filename: str,
        file_bytes: bytes,
        content_type: str,
    ) -> ResumeAnalysis:
        # 1. Validation
        if len(file_bytes) == 0:
            raise BadRequestError("Uploaded file is empty.")

        checksum = hashlib.sha256(file_bytes).hexdigest()
        storage_key = f"resumes/{user_id}/{uuid.uuid4()}_{filename}"

        # 2. Store file privately
        await self.storage.upload(file_bytes, storage_key, content_type)

        # 3. Create ResumeDocument record
        resume_doc = ResumeDocument(
            user_id=user_id,
            original_filename=filename,
            storage_key=storage_key,
            content_type=content_type,
            file_size_bytes=len(file_bytes),
            checksum_sha256=checksum,
            parsing_status="parsing",
        )
        self.db.add(resume_doc)
        await self.db.flush()

        # 4. Extract text
        raw_text, is_scanned = ResumeParser.extract_text(file_bytes, filename)
        if is_scanned:
            resume_doc.parsing_status = "failed"
            analysis = ResumeAnalysis(
                resume_id=resume_doc.id,
                user_id=user_id,
                parsed_payload={"error": "Document appears to be a scanned image. OCR is required."},
                analysis_status="ocr_required",
                error_code="SCANNED_DOCUMENT_OCR_UNAVAILABLE",
            )
            self.db.add(analysis)
            await self.db.commit()
            return analysis

        # 5. Load canonical skills for extraction matching
        all_skills = (await self.db.execute(select(Skill.canonical_name))).scalars().all()
        parsed_data = ResumeParser.parse_structured_data(raw_text, canonical_skills_catalog=list(all_skills))

        # 6. Readability score calculation
        word_count = len(raw_text.split())
        readability = min(96.0, max(55.0, 68.0 + (10.0 if word_count > 200 else -10.0) + (10.0 if "@" in raw_text else 0.0)))

        # 7. Dynamic ATS score computation
        contact_pts = 0.0
        if parsed_data.get("email"): contact_pts += 7.5
        if parsed_data.get("phone"): contact_pts += 7.5
        if parsed_data.get("linkedin_url") or parsed_data.get("github_url"): contact_pts += 10.0

        skills_count = len(parsed_data.get("extracted_skills", []))
        skills_pts = min(35.0, skills_count * 3.0)

        sections_pts = 0.0
        if parsed_data.get("education"): sections_pts += 10.0
        if parsed_data.get("experience"): sections_pts += 10.0
        if parsed_data.get("projects"): sections_pts += 5.0
        if parsed_data.get("certifications"): sections_pts += 5.0

        readability_pts = (readability / 100.0) * 10.0

        computed_ats = round(min(98.0, max(45.0, contact_pts + skills_pts + sections_pts + readability_pts)), 1)

        section_scores = {
            "education": 95 if parsed_data.get("education") else 30,
            "experience": 92 if parsed_data.get("experience") else 50,
            "skills": min(100, max(40, skills_count * 4)),
            "projects": 95 if parsed_data.get("projects") else 40,
            "certifications": 90 if parsed_data.get("certifications") else 45,
        }

        # 8. Create ResumeAnalysis record
        analysis = ResumeAnalysis(
            resume_id=resume_doc.id,
            user_id=user_id,
            raw_text_reference=storage_key,
            parsed_payload=parsed_data,
            readability_score=round(readability, 1),
            ats_score=computed_ats,
            section_scores=section_scores,
            analysis_status="completed",
            completed_at=datetime.now(timezone.utc),
        )
        self.db.add(analysis)
        resume_doc.parsing_status = "completed"
        await self.db.flush()

        # 9. Record extracted skills in resume_analysis_skills & update candidate_skills
        for item in parsed_data.get("extracted_skills", []):
            skill_name = item["skill_name"]
            stmt = select(Skill).where(Skill.canonical_name.ilike(skill_name))
            skill = (await self.db.execute(stmt)).scalar_one_or_none()
            if not skill:
                skill = Skill(canonical_name=skill_name, category=item.get("category", "technical"))
                self.db.add(skill)
                await self.db.flush()

            ras = ResumeAnalysisSkill(
                analysis_id=analysis.id,
                skill_id=skill.id,
                evidence_text=item.get("evidence_text"),
                confidence=item.get("confidence", 0.85),
                evidence_section="skills",
            )
            self.db.add(ras)

            cs_stmt = select(CandidateSkill).where(
                CandidateSkill.user_id == user_id, CandidateSkill.skill_id == skill.id
            )
            if (await self.db.execute(cs_stmt)).scalar_one_or_none() is None:
                cand_skill = CandidateSkill(
                    user_id=user_id,
                    skill_id=skill.id,
                    proficiency="intermediate",
                    evidence_source="resume",
                    evidence_reference=f"resume:{resume_doc.id}",
                    confidence=item.get("confidence", 0.85),
                )
                self.db.add(cand_skill)

        # 10. Synchronize candidate profile fields from resume
        profile = (
            await self.db.execute(select(CandidateProfile).where(CandidateProfile.user_id == user_id))
        ).scalar_one_or_none()
        if profile:
            if parsed_data.get("full_name") and parsed_data["full_name"].strip().lower() not in ("candidate", "resume", "cv"):
                profile.full_name = parsed_data["full_name"].strip()
            if parsed_data.get("phone"):
                profile.phone = parsed_data["phone"].strip()
            if parsed_data.get("location"):
                profile.location = parsed_data["location"].strip()
            if parsed_data.get("linkedin_url"):
                profile.linkedin_url = parsed_data["linkedin_url"].strip()
            if parsed_data.get("github_url"):
                profile.github_url = parsed_data["github_url"].strip()
            if parsed_data.get("headline"):
                profile.headline = parsed_data["headline"].strip()[:280]
            elif parsed_data.get("summary"):
                profile.headline = parsed_data["summary"].strip()[:280]
            if parsed_data.get("experience_level"):
                profile.experience_level = parsed_data["experience_level"].strip()

            # Format education summary
            if parsed_data.get("education") and len(parsed_data["education"]) > 0:
                edu_item = parsed_data["education"][0]
                profile.education_summary = f"{edu_item.get('degree', 'Degree')} from {edu_item.get('institution', 'University')}"

        await self.db.commit()
        await self.db.refresh(analysis)
        return analysis

    async def get_latest_analysis(self, user_id: str) -> Optional[ResumeAnalysis]:
        stmt = (
            select(ResumeAnalysis)
            .where(ResumeAnalysis.user_id == user_id)
            .order_by(ResumeAnalysis.created_at.desc())
            .limit(1)
        )
        return (await self.db.execute(stmt)).scalar_one_or_none()

    async def get_analysis_by_id(self, user_id: str, analysis_id: str) -> ResumeAnalysis:
        stmt = select(ResumeAnalysis).where(
            ResumeAnalysis.id == analysis_id, ResumeAnalysis.user_id == user_id
        )
        res = (await self.db.execute(stmt)).scalar_one_or_none()
        if not res:
            raise NotFoundError("Resume analysis not found.")
        return res
