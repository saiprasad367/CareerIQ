import pytest
from app.services.resume_parser import ResumeParser
from app.services.job_scraper_service import JobScraperService


def test_resume_parser_rule_based():
    sample_resume = """
    Rohan Sharma
    rohan.sharma@example.com | +91 9876543210 | Bengaluru, India
    https://linkedin.com/in/rohan-sharma | https://github.com/rohan-sharma

    Professional Summary:
    Results-driven Software Engineer with strong experience in Python, FastAPI, and PostgreSQL.

    Education:
    B.Tech in Computer Science & Engineering (AI & ML)
    National Institute of Technology (2021 - 2025)

    Experience:
    Backend Engineering Intern at Tech Corp (2024)
    - Developed high-performance REST APIs in FastAPI and integrated Docker containers.
    - Optimized database queries in PostgreSQL and Redis.

    Projects:
    CareerIQ Career Portal
    - Built resume parsing and ATS recommendation system using Python and React.

    Technical Skills:
    Languages: Python, TypeScript, SQL, Java
    Frameworks: FastAPI, React, Django, Node.js
    Databases: PostgreSQL, Redis, MongoDB
    Tools: Docker, Kubernetes, Git, Linux
    """

    parsed = ResumeParser.parse_structured_data(sample_resume)
    assert parsed["full_name"] == "Rohan Sharma"
    assert parsed["email"] == "rohan.sharma@example.com"
    assert parsed["phone"] is not None
    assert parsed["linkedin_url"] is not None
    assert parsed["github_url"] is not None
    assert len(parsed["extracted_skills"]) >= 5
    skill_names = [s["skill_name"].lower() for s in parsed["extracted_skills"]]
    assert "python" in skill_names
    assert "fastapi" in skill_names
    assert "postgresql" in skill_names


@pytest.mark.asyncio
async def test_job_scraper_service_structure(test_db):
    scraper = JobScraperService(test_db)
    res = await scraper.sync_live_jobs_from_internet(limit=3)
    assert "success" in res
    assert "ingested_count" in res
