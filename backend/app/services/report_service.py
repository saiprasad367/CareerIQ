"""
CareerIQ — Career Report Service.
Generates comprehensive career intelligence summaries and exports.
"""
from __future__ import annotations

import io
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.models.profile import CandidateProfile
from app.models.report import CareerReport
from app.models.resume import ResumeAnalysis
from app.models.skill import CandidateSkill, Skill
from app.schemas.report import CareerReportCreate, CareerReportResponse


class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_report(self, user_id: str, data: CareerReportCreate) -> CareerReport:
        # Load user profile
        prof_stmt = select(CandidateProfile).where(CandidateProfile.user_id == user_id)
        profile = (await self.db.execute(prof_stmt)).scalar_one_or_none()

        # Load skills
        skills_stmt = (
            select(Skill.canonical_name)
            .join(CandidateSkill, CandidateSkill.skill_id == Skill.id)
            .where(CandidateSkill.user_id == user_id)
        )
        skills = list((await self.db.execute(skills_stmt)).scalars().all())

        # Load latest resume analysis
        res_stmt = (
            select(ResumeAnalysis)
            .where(ResumeAnalysis.user_id == user_id)
            .order_by(ResumeAnalysis.created_at.desc())
            .limit(1)
        )
        latest_analysis = (await self.db.execute(res_stmt)).scalar_one_or_none()

        payload = {
            "candidate_name": profile.full_name if profile else "Candidate",
            "headline": profile.headline if profile else "Software Engineer",
            "experience_level": profile.experience_level if profile else "entry",
            "skills_count": len(skills),
            "skills": skills,
            "overall_readiness_score": 78.0,
            "ats_compatibility_score": latest_analysis.ats_score if latest_analysis else 75.0,
            "recommended_focus_areas": [
                "Async system architectures and database indexing",
                "Automated testing with pytest & CI/CD",
                "Cloud infrastructure deployment",
            ],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

        title = data.title or f"Career Readiness Assessment — {datetime.now(timezone.utc).strftime('%b %Y')}"
        report = CareerReport(
            user_id=user_id,
            report_type=data.report_type,
            title=title,
            report_payload=payload,
        )
        self.db.add(report)
        await self.db.commit()
        await self.db.refresh(report)
        return report

    async def get_user_reports(self, user_id: str) -> List[CareerReport]:
        stmt = select(CareerReport).where(CareerReport.user_id == user_id).order_by(CareerReport.created_at.desc())
        return list((await self.db.execute(stmt)).scalars().all())

    async def get_report_by_id(self, user_id: str, report_id: str) -> CareerReport:
        stmt = select(CareerReport).where(CareerReport.id == report_id, CareerReport.user_id == user_id)
        report = (await self.db.execute(stmt)).scalar_one_or_none()
        if not report:
            raise NotFoundError("Report not found.")
        return report

    async def export_report_pdf(self, user_id: str, report_id: str) -> bytes:
        report = await self.get_report_by_id(user_id, report_id)
        # Generate clean plain text / formatted PDF bytes
        payload = report.report_payload or {}
        text_content = (
            f"====================================================\n"
            f"          CAREERIQ INTELLIGENCE REPORT              \n"
            f"====================================================\n\n"
            f"Title: {report.title}\n"
            f"Candidate: {payload.get('candidate_name', 'N/A')}\n"
            f"Experience Level: {payload.get('experience_level', 'N/A')}\n"
            f"Overall Readiness Score: {payload.get('overall_readiness_score', 'N/A')}%\n"
            f"ATS Compatibility Score: {payload.get('ats_compatibility_score', 'N/A')}%\n\n"
            f"Skills Verified ({payload.get('skills_count', 0)}):\n"
            f"  {', '.join(payload.get('skills', []))}\n\n"
            f"Recommended Focus Areas:\n"
            + "\n".join(f"  - {f}" for f in payload.get("recommended_focus_areas", []))
            + f"\n\nGenerated on: {report.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
        )
        return text_content.encode("utf-8")
