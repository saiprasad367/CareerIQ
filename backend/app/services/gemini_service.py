"""
CareerIQ — Gemini Generative AI Service.
Provides LLM-assisted resume parsing, contextual career advice, and live job discovery.
Automatically falls back to deterministic NLP logic when the key is not configured.
"""
from __future__ import annotations

import json
import os
import re
from typing import Any, Dict, List, Optional
import structlog

from app.core.config import get_settings

logger = structlog.get_logger(__name__)


class GeminiService:
    """Unified service for Google Gemini Generative AI operations."""

    def __init__(self, api_key: Optional[str] = None):
        settings = get_settings()
        self.api_key = (
            api_key
            or settings.GEMINI_API_KEY
            or os.environ.get("GEMINI_API_KEY")
            or ""
        ).strip()
        self.is_configured = bool(self.api_key and len(self.api_key) > 10)
        self._genai = None

        if self.is_configured:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._genai = genai
            except Exception as e:
                logger.warning("gemini_init_failed", error=str(e))
                self.is_configured = False

    def _get_model(self):
        """Returns a configured GenerativeModel with preferred model priority."""
        if not self._genai:
            return None

        # Prioritized candidate models compatible with modern Gemini API
        models_to_try = [
            "gemini-2.5-flash",
            "gemini-flash-latest",
            "gemini-2.5-pro",
            "gemini-pro-latest",
        ]
        for m_name in models_to_try:
            try:
                return self._genai.GenerativeModel(m_name)
            except Exception:
                continue
        return None

    def parse_resume(self, resume_text: str) -> Optional[Dict[str, Any]]:
        """
        Uses Gemini to extract structured profile information from raw resume text.
        Returns parsed dictionary in strict sectioned JSON format.
        """
        if not self.is_configured:
            return None

        try:
            prompt = (
                "You are an expert technical resume parser for CareerIQ. "
                "Analyze the following resume text and convert it into a VALID, WELL-STRUCTURED JSON object. "
                "Output ONLY the JSON object, with no markdown formatting or commentary.\n\n"
                "JSON Schema:\n"
                "{\n"
                '  "full_name": "Full name of candidate",\n'
                '  "email": "candidate email or null",\n'
                '  "phone": "candidate phone number or null",\n'
                '  "location": "City, State/Country or null",\n'
                '  "linkedin_url": "LinkedIn profile URL or null",\n'
                '  "github_url": "GitHub profile URL or null",\n'
                '  "portfolio_url": "Portfolio or personal website URL or null",\n'
                '  "summary": "Professional summary or objective statement",\n'
                '  "headline": "Professional title or role headline",\n'
                '  "experience_level": "entry, mid, or senior",\n'
                '  "skills": ["Python", "FastAPI", "React", ...],\n'
                '  "extracted_skills": [\n'
                '    {"skill_name": "Python", "category": "languages", "confidence": 0.95, "evidence_text": "context snippet"}\n'
                '  ],\n'
                '  "education": [\n'
                '    {\n'
                '      "institution": "College or University Name",\n'
                '      "degree": "Degree name (e.g. B.Tech, M.S., B.S.)",\n'
                '      "field_of_study": "Branch / Major (e.g. Computer Science)",\n'
                '      "start_year": 2023,\n'
                '      "end_year": 2027,\n'
                '      "gpa": "CGPA or percentage if mentioned"\n'
                '    }\n'
                '  ],\n'
                '  "experience": [\n'
                '    {\n'
                '      "company": "Company Name",\n'
                '      "role_title": "Job Title (e.g. Software Engineer Intern)",\n'
                '      "start_date": "Start date/year",\n'
                '      "end_date": "End date/year or Present",\n'
                '      "description": "Responsibilities and achievements",\n'
                '      "is_current": false\n'
                '    }\n'
                '  ],\n'
                '  "projects": [\n'
                '    {\n'
                '      "name": "Project Name",\n'
                '      "tech_stack": ["Python", "FastAPI"],\n'
                '      "description": "What the project does and key features"\n'
                '    }\n'
                '  ],\n'
                '  "certifications": [\n'
                '    {\n'
                '      "name": "Certificate title",\n'
                '      "issuer": "Issuing organization",\n'
                '      "year": 2024\n'
                '    }\n'
                '  ],\n'
                '  "ats_recommendations": [\n'
                '    "Concrete resume improvement suggestion 1",\n'
                '    "Concrete resume improvement suggestion 2"\n'
                '  ]\n'
                "}\n\n"
                f"Resume Content:\n{resume_text[:14000]}"
            )

            models_to_try = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-pro", "gemini-pro-latest"]
            res = None
            for m_name in models_to_try:
                try:
                    m = self._genai.GenerativeModel(m_name)
                    res = m.generate_content(prompt)
                    if res and res.text:
                        break
                except Exception:
                    continue
            if not res or not res.text:
                return None

            raw_content = res.text.strip()
            # Clean markdown code fences if returned
            if raw_content.startswith("```"):
                raw_content = re.sub(r"^```(?:json)?\s*", "", raw_content)
                raw_content = re.sub(r"\s*```$", "", raw_content)

            parsed = json.loads(raw_content)
            if isinstance(parsed, dict):
                # Ensure extracted_skills is populated
                if "skills" in parsed and not parsed.get("extracted_skills"):
                    parsed["extracted_skills"] = [
                        {"skill_name": s, "category": "technical", "confidence": 0.95, "evidence_text": f"Extracted skill: {s}"}
                        for s in parsed["skills"]
                    ]
                return parsed
        except Exception as e:
            logger.warning("gemini_resume_parsing_error", error=str(e))

        return None

    def generate_assistant_reply(
        self, prompt: str, candidate_context: Dict[str, Any]
    ) -> Optional[str]:
        """Generates conversational career advice with candidate context."""
        if not self.is_configured:
            return None

        try:
            model = self._get_model()
            if not model:
                return None

            system_instruction = (
                f"You are CareerIQ AI, an elite career intelligence and hiring advisor. "
                f"Candidate Name: {candidate_context.get('name', 'Candidate')}\n"
                f"Experience Level: {candidate_context.get('experience_level', 'entry')}\n"
                f"Skills: {', '.join(candidate_context.get('skills', []))}\n"
                f"Work Mode Preference: {candidate_context.get('work_mode', 'hybrid')}\n\n"
                f"Provide actionable, specific engineering advice. Cite relevant technologies, "
                f"practical project recommendations, and interview preparation tactics. Keep formatting clean with bullet points."
            )

            res = model.generate_content(f"{system_instruction}\n\nUser Question: {prompt}")
            return res.text.strip()
        except Exception as e:
            logger.warning("gemini_assistant_reply_error", error=str(e))
            return None
