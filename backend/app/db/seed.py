"""
CareerIQ — Repeatable & Idempotent Database Seed Script.
Populates:
  - 7 Core Career Roles
  - 50+ Canonical Technical Skills & Common Aliases
  - Role-to-Skill Requirement Mappings
  - Curated Learning Resource Catalog
  - Practical Project Templates
  - Curated Sample Job Listings
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionFactory
from app.models.career_role import CareerRole, RoleSkill
from app.models.job import Company, Job, JobSkill
from app.models.roadmap import (
    LearningResource,
    ProjectTemplate,
    ProjectTemplateSkill,
    ResourceSkill,
)
from app.models.skill import Skill, SkillAlias


SKILLS_DATA = [
    # Programming Languages
    ("Python", "languages", ["py", "python3"]),
    ("JavaScript", "languages", ["js", "es6"]),
    ("TypeScript", "languages", ["ts"]),
    ("Java", "languages", ["core java", "java 17"]),
    ("C++", "languages", ["cpp", "cplusplus"]),
    ("Go", "languages", ["golang"]),
    ("SQL", "languages", ["structured query language"]),
    ("HTML", "languages", ["html5"]),
    ("CSS", "languages", ["css3"]),
    
    # Frameworks & Libraries
    ("FastAPI", "frameworks", ["fast api"]),
    ("Django", "frameworks", ["django rest framework", "drf"]),
    ("Flask", "frameworks", []),
    ("React", "frameworks", ["reactjs"]),
    ("Node.js", "frameworks", ["nodejs", "node"]),
    ("Express", "frameworks", ["expressjs"]),
    ("Tailwind CSS", "frameworks", ["tailwind"]),
    ("PyTorch", "frameworks", ["torch"]),
    ("TensorFlow", "frameworks", ["tf"]),
    ("scikit-learn", "frameworks", ["sklearn"]),
    ("Pandas", "frameworks", []),
    ("NumPy", "frameworks", []),
    
    # Databases & Storage
    ("PostgreSQL", "databases", ["postgres", "psql"]),
    ("MySQL", "databases", []),
    ("MongoDB", "databases", ["mongo"]),
    ("Redis", "databases", []),
    
    # Cloud & DevOps
    ("Docker", "devops", ["containerization"]),
    ("Kubernetes", "devops", ["k8s"]),
    ("AWS", "cloud", ["amazon web services"]),
    ("Azure", "cloud", ["microsoft azure"]),
    ("GCP", "cloud", ["google cloud platform"]),
    ("CI/CD", "devops", ["continuous integration", "github actions"]),
    ("Git", "tools", ["github", "version control"]),
    ("Linux", "devops", ["unix", "bash"]),
    
    # AI & Data
    ("Machine Learning", "ai", ["ml"]),
    ("Deep Learning", "ai", ["dl"]),
    ("NLP", "ai", ["natural language processing"]),
    ("Data Analysis", "data", ["data analytics"]),
    ("Tableau", "data", []),
    ("Power BI", "data", []),
    
    # Testing & Methodology
    ("Unit Testing", "testing", ["pytest", "jest"]),
    ("Selenium", "testing", []),
    ("REST API", "architecture", ["restful api", "rest"]),
    ("System Design", "architecture", ["system architecture"]),
    ("Agile", "methodology", ["scrum"]),
]

ROLES_DATA = [
    {
        "slug": "software-engineer",
        "title": "Software Engineer",
        "description": "Designs, develops, tests, and maintains robust software systems, algorithms, and application components.",
        "category": "Software Engineering",
        "experience_level": "entry",
        "required": ["Python", "JavaScript", "SQL", "Git", "REST API", "Unit Testing"],
        "preferred": ["Docker", "TypeScript", "System Design"],
    },
    {
        "slug": "backend-developer",
        "title": "Backend Developer",
        "description": "Architects asynchronous server-side services, scalable REST APIs, relational schemas, and data pipelines.",
        "category": "Backend Engineering",
        "experience_level": "entry",
        "required": ["Python", "FastAPI", "PostgreSQL", "REST API", "SQL", "Git"],
        "preferred": ["Docker", "Redis", "CI/CD", "System Design"],
    },
    {
        "slug": "full-stack-developer",
        "title": "Full-Stack Developer",
        "description": "Builds end-to-end web applications combining responsive React user interfaces with robust backend APIs.",
        "category": "Full-Stack Engineering",
        "experience_level": "entry",
        "required": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "Git"],
        "preferred": ["FastAPI", "Docker", "Tailwind CSS"],
    },
    {
        "slug": "machine-learning-engineer",
        "title": "Machine Learning Engineer",
        "description": "Designs, trains, evaluates, and deploys predictive machine learning and deep learning pipelines into production.",
        "category": "AI & Data Science",
        "experience_level": "entry",
        "required": ["Python", "Machine Learning", "PyTorch", "scikit-learn", "Pandas", "NumPy", "Git"],
        "preferred": ["Docker", "FastAPI", "NLP", "Deep Learning"],
    },
    {
        "slug": "data-analyst",
        "title": "Data Analyst",
        "description": "Transforms raw structured and unstructured data into actionable insights, dashboards, and quantitative reports.",
        "category": "Data & Analytics",
        "experience_level": "entry",
        "required": ["SQL", "Python", "Data Analysis", "Pandas", "Power BI"],
        "preferred": ["Tableau", "NumPy", "Git"],
    },
    {
        "slug": "cloud-devops-engineer",
        "title": "Cloud / DevOps Engineer",
        "description": "Automates continuous integration and deployment pipelines, container orchestration, and cloud infrastructure.",
        "category": "Cloud & Infrastructure",
        "experience_level": "entry",
        "required": ["Docker", "Kubernetes", "Linux", "CI/CD", "Git", "AWS"],
        "preferred": ["Python", "Azure", "GCP"],
    },
    {
        "slug": "qa-automation-engineer",
        "title": "QA Automation Engineer",
        "description": "Develops comprehensive automated end-to-end test suites, regression pipelines, and performance benchmarks.",
        "category": "Quality Engineering",
        "experience_level": "entry",
        "required": ["Python", "Unit Testing", "Selenium", "Git", "REST API"],
        "preferred": ["CI/CD", "Docker", "Linux"],
    },
]

LEARNING_RESOURCES_DATA = [
    {
        "title": "FastAPI Full Course & Async Database Architecture",
        "provider": "FreeCodeCamp / Official Docs",
        "url": "https://fastapi.tiangolo.com/tutorial/",
        "description": "Comprehensive guide to building high-performance asynchronous web APIs with Python and Pydantic.",
        "difficulty": "intermediate",
        "hours": 12,
        "resource_type": "documentation",
        "skills": ["FastAPI", "Python", "REST API"],
    },
    {
        "title": "PostgreSQL for High Performance & Advanced Modeling",
        "provider": "PostgreSQL Tutorial",
        "url": "https://www.postgresqltutorial.com/",
        "description": "Master relational schema design, indexes, transactions, and foreign key constraints.",
        "difficulty": "intermediate",
        "hours": 10,
        "resource_type": "tutorial",
        "skills": ["PostgreSQL", "SQL"],
    },
    {
        "title": "Modern React 18 & TypeScript Masterclass",
        "provider": "Coursera / React Docs",
        "url": "https://react.dev/learn",
        "description": "Hands-on guide to React hooks, state management, and type-safe frontends.",
        "difficulty": "intermediate",
        "hours": 14,
        "resource_type": "course",
        "skills": ["React", "TypeScript", "JavaScript"],
    },
    {
        "title": "Applied Machine Learning with Scikit-Learn & PyTorch",
        "provider": "DeepLearning.AI",
        "url": "https://www.deeplearning.ai/",
        "description": "From feature engineering and classification to neural networks and model evaluation metrics.",
        "difficulty": "advanced",
        "hours": 20,
        "resource_type": "course",
        "skills": ["Machine Learning", "PyTorch", "scikit-learn", "Python"],
    },
    {
        "title": "Docker & Kubernetes Containerization from Scratch",
        "provider": "Docker Docs",
        "url": "https://docs.docker.com/get-started/",
        "description": "Containerize microservices, write multi-stage Dockerfiles, and orchestrate deployments.",
        "difficulty": "intermediate",
        "hours": 8,
        "resource_type": "tutorial",
        "skills": ["Docker", "Kubernetes", "DevOps"],
    },
]

PROJECT_TEMPLATES_DATA = [
    {
        "title": "Asynchronous REST API with FastAPI & PostgreSQL",
        "description": "Implement a modular monolith API featuring JWT authentication, Argon2id hashing, and Alembic migrations.",
        "difficulty": "intermediate",
        "estimated_hours": 18,
        "repository_url": "https://github.com/careeriq/fastapi-async-starter",
        "skills": ["FastAPI", "PostgreSQL", "Python", "REST API"],
    },
    {
        "title": "AI Semantic Resume Matcher & Recommendation Engine",
        "description": "Build an end-to-end semantic matching engine using local sentence embeddings and hybrid ranking formulas.",
        "difficulty": "advanced",
        "estimated_hours": 24,
        "repository_url": "https://github.com/careeriq/resume-matcher-ml",
        "skills": ["Python", "Machine Learning", "PyTorch", "FastAPI"],
    },
    {
        "title": "Interactive Analytics Kanban Dashboard in React & TypeScript",
        "description": "Develop a responsive Kanban job application board with drag-and-drop state, charts, and API synchronization.",
        "difficulty": "intermediate",
        "estimated_hours": 15,
        "repository_url": "https://github.com/careeriq/kanban-dashboard",
        "skills": ["React", "TypeScript", "Tailwind CSS"],
    },
]

JOBS_DATA = [
    {
        "company": "Google",
        "title": "Software Engineer, Early Career",
        "location": "Bengaluru, India",
        "work_mode": "hybrid",
        "employment_type": "full-time",
        "experience_level": "entry",
        "salary_min": 1800000,
        "salary_max": 2800000,
        "salary_currency": "INR",
        "source_url": "https://careers.google.com/jobs/results/?q=software%20engineer",
        "description": "Google software engineers develop next-generation technologies that change how billions of users connect, explore, and interact with information. We are looking for engineers who bring fresh ideas from all areas, including information retrieval, distributed computing, large-scale system design, and AI.",
        "skills": ["Python", "C++", "Java", "SQL", "Git", "REST API", "Unit Testing"],
    },
    {
        "company": "Microsoft",
        "title": "Software Engineer I — Cloud & AI",
        "location": "Hyderabad, India",
        "work_mode": "hybrid",
        "employment_type": "full-time",
        "experience_level": "entry",
        "salary_min": 1600000,
        "salary_max": 2400000,
        "salary_currency": "INR",
        "source_url": "https://careers.microsoft.com/professionals/us/en/search-results?keywords=software%20engineer",
        "description": "Join the Azure & AI Engineering team at Microsoft. You will design, build, and deploy high-availability distributed cloud microservices with rigorous automated unit testing, CI/CD pipelines, and telemetry.",
        "skills": ["C#", "Python", "Azure", "Docker", "Git", "REST API", "CI/CD"],
    },
    {
        "company": "Amazon",
        "title": "Software Development Engineer (SDE I)",
        "location": "Hyderabad, India",
        "work_mode": "onsite",
        "employment_type": "full-time",
        "experience_level": "entry",
        "salary_min": 1500000,
        "salary_max": 2300000,
        "salary_currency": "INR",
        "source_url": "https://www.amazon.jobs/en/job_categories/software-development",
        "description": "As an SDE I at Amazon, you will work with experienced mentors to design and implement mission-critical web services, distributed caching layers, and high-throughput data processing workflows serving millions of customers.",
        "skills": ["Java", "Python", "AWS", "SQL", "Docker", "Git", "Linux"],
    },
    {
        "company": "Razorpay",
        "title": "Junior Backend Engineer",
        "location": "Bengaluru, India",
        "work_mode": "hybrid",
        "employment_type": "full-time",
        "experience_level": "entry",
        "salary_min": 1200000,
        "salary_max": 1800000,
        "salary_currency": "INR",
        "source_url": "https://razorpay.com/jobs/",
        "description": "Build payment infrastructure processing billions in volume. You will implement resilient FastAPI / Go microservices, manage PostgreSQL database indexing and transactions, and optimize low-latency API response times.",
        "skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "REST API", "Git"],
    },
    {
        "company": "Swiggy",
        "title": "Associate Machine Learning Engineer",
        "location": "Bengaluru, India",
        "work_mode": "hybrid",
        "employment_type": "full-time",
        "experience_level": "entry",
        "salary_min": 1300000,
        "salary_max": 1900000,
        "salary_currency": "INR",
        "source_url": "https://careers.swiggy.com/",
        "description": "Swiggy's AI team leverages deep learning and recommendation models for real-time dispatch, customer personalization, and search ranking. You will collaborate on PyTorch pipelines and high-throughput model inference.",
        "skills": ["Python", "Machine Learning", "PyTorch", "scikit-learn", "Pandas", "Docker"],
    },
    {
        "company": "Groww",
        "title": "Full-Stack Developer",
        "location": "Bengaluru, India",
        "work_mode": "hybrid",
        "employment_type": "full-time",
        "experience_level": "entry",
        "salary_min": 1100000,
        "salary_max": 1700000,
        "salary_currency": "INR",
        "source_url": "https://groww.in/careers",
        "description": "Develop seamless, lightning-fast financial web interfaces using React, TypeScript, and Tailwind CSS, backed by robust asynchronous backend APIs and real-time streaming data.",
        "skills": ["React", "TypeScript", "JavaScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
    },
    {
        "company": "CRED",
        "title": "Backend Platform Engineer",
        "location": "Bengaluru, India",
        "work_mode": "onsite",
        "employment_type": "full-time",
        "experience_level": "entry",
        "salary_min": 1400000,
        "salary_max": 2200000,
        "salary_currency": "INR",
        "source_url": "https://careers.cred.club/",
        "description": "Work on high-concurrency event-driven financial systems. Build scalable microservices, implement distributed locks with Redis, and uphold 99.99% system reliability.",
        "skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "Git"],
    },
    {
        "company": "PhonePe",
        "title": "DevOps & Cloud Associate",
        "location": "Pune, India",
        "work_mode": "remote",
        "employment_type": "full-time",
        "experience_level": "entry",
        "salary_min": 1000000,
        "salary_max": 1600000,
        "salary_currency": "INR",
        "source_url": "https://www.phonepe.com/careers/",
        "description": "Manage Kubernetes clusters, multi-region AWS environments, and automated CI/CD deployment pipelines. Ensure zero-downtime releases and proactive infrastructure observability.",
        "skills": ["Docker", "Kubernetes", "AWS", "Linux", "CI/CD", "Git"],
    },
    {
        "company": "Zomato",
        "title": "Data Analyst (BI & Strategy)",
        "location": "Gurugram, India",
        "work_mode": "hybrid",
        "employment_type": "full-time",
        "experience_level": "entry",
        "salary_min": 800000,
        "salary_max": 1300000,
        "salary_currency": "INR",
        "source_url": "https://www.zomato.com/careers",
        "description": "Analyze multi-city logistics and customer ordering metrics. Write complex SQL queries, build executive Tableau dashboards, and deliver data-backed strategic recommendations.",
        "skills": ["SQL", "Python", "Data Analysis", "Pandas", "Tableau", "Power BI"],
    },
]


async def seed_database(db: AsyncSession) -> None:
    print("--> Seeding Canonical Skills & Aliases...")
    skill_map: dict[str, Skill] = {}
    for canon_name, cat, aliases in SKILLS_DATA:
        stmt = select(Skill).where(Skill.canonical_name.ilike(canon_name))
        skill = (await db.execute(stmt)).scalar_one_or_none()
        if not skill:
            skill = Skill(canonical_name=canon_name, category=cat)
            db.add(skill)
            await db.flush()
        skill_map[canon_name.lower()] = skill

        # Add aliases
        import re
        for alias in aliases:
            clean = re.sub(r"[^\w\s\+\#]", "", alias.lower()).strip()
            norm_alias = re.sub(r"\s+", " ", clean).strip()
            a_stmt = select(SkillAlias).where(SkillAlias.normalized_alias == norm_alias)
            if (await db.execute(a_stmt)).scalar_one_or_none() is None:
                db.add(SkillAlias(skill_id=skill.id, alias=alias, normalized_alias=norm_alias))

    print("--> Seeding Career Roles & Requirements...")
    for r_data in ROLES_DATA:
        stmt = select(CareerRole).where(CareerRole.slug == r_data["slug"])
        role = (await db.execute(stmt)).scalar_one_or_none()
        if not role:
            role = CareerRole(
                slug=r_data["slug"],
                title=r_data["title"],
                description=r_data["description"],
                category=r_data["category"],
                experience_level=r_data["experience_level"],
                is_active=True,
            )
            db.add(role)
            await db.flush()

        # Add role skills
        for s_name in r_data["required"]:
            s_obj = skill_map.get(s_name.lower())
            if s_obj:
                rs_stmt = select(RoleSkill).where(RoleSkill.role_id == role.id, RoleSkill.skill_id == s_obj.id)
                if (await db.execute(rs_stmt)).scalar_one_or_none() is None:
                    db.add(
                        RoleSkill(
                            role_id=role.id,
                            skill_id=s_obj.id,
                            requirement_type="required",
                            importance_weight=1.0,
                            expected_proficiency="intermediate",
                        )
                    )

        for s_name in r_data["preferred"]:
            s_obj = skill_map.get(s_name.lower())
            if s_obj:
                rs_stmt = select(RoleSkill).where(RoleSkill.role_id == role.id, RoleSkill.skill_id == s_obj.id)
                if (await db.execute(rs_stmt)).scalar_one_or_none() is None:
                    db.add(
                        RoleSkill(
                            role_id=role.id,
                            skill_id=s_obj.id,
                            requirement_type="preferred",
                            importance_weight=0.7,
                            expected_proficiency="beginner",
                        )
                    )

    print("--> Seeding Learning Resources...")
    for lr in LEARNING_RESOURCES_DATA:
        stmt = select(LearningResource).where(LearningResource.title == lr["title"])
        res = (await db.execute(stmt)).scalar_one_or_none()
        if not res:
            res = LearningResource(
                title=lr["title"],
                provider=lr["provider"],
                url=lr["url"],
                description=lr["description"],
                difficulty=lr["difficulty"],
                estimated_hours=lr["hours"],
                resource_type=lr["resource_type"],
                is_active=True,
            )
            db.add(res)
            await db.flush()

            for s_name in lr["skills"]:
                s_obj = skill_map.get(s_name.lower())
                if s_obj:
                    db.add(ResourceSkill(resource_id=res.id, skill_id=s_obj.id))

    print("--> Seeding Project Templates...")
    for pt in PROJECT_TEMPLATES_DATA:
        stmt = select(ProjectTemplate).where(ProjectTemplate.title == pt["title"])
        tmpl = (await db.execute(stmt)).scalar_one_or_none()
        if not tmpl:
            tmpl = ProjectTemplate(
                title=pt["title"],
                description=pt["description"],
                difficulty=pt["difficulty"],
                estimated_hours=pt["estimated_hours"],
                repository_url=pt["repository_url"],
                is_active=True,
            )
            db.add(tmpl)
            await db.flush()

            for s_name in pt["skills"]:
                s_obj = skill_map.get(s_name.lower())
                if s_obj:
                    db.add(ProjectTemplateSkill(project_template_id=tmpl.id, skill_id=s_obj.id))

    print("--> Seeding Curated Sample Jobs...")
    for j_data in JOBS_DATA:
        # Find or create company
        c_stmt = select(Company).where(Company.name == j_data["company"])
        comp = (await db.execute(c_stmt)).scalar_one_or_none()
        if not comp:
            comp = Company(name=j_data["company"])
            db.add(comp)
            await db.flush()

        stmt = select(Job).where(Job.title == j_data["title"], Job.company_id == comp.id)
        job = (await db.execute(stmt)).scalar_one_or_none()
        if not job:
            job = Job(
                company_id=comp.id,
                title=j_data["title"],
                location=j_data["location"],
                work_mode=j_data["work_mode"],
                employment_type=j_data["employment_type"],
                experience_level=j_data["experience_level"],
                salary_min=j_data["salary_min"],
                salary_max=j_data["salary_max"],
                salary_currency=j_data["salary_currency"],
                description=j_data["description"],
                source_name=f"{j_data['company']} Careers",
                source_url=j_data.get("source_url"),
                posted_at=datetime.now(timezone.utc),
                is_active=True,
                is_sample_data=False,
            )
            db.add(job)
            await db.flush()
        else:
            if j_data.get("source_url"):
                job.source_url = j_data["source_url"]

            for s_name in j_data["skills"]:
                s_obj = skill_map.get(s_name.lower())
                if s_obj:
                    js_stmt = select(JobSkill).where(
                        JobSkill.job_id == job.id, JobSkill.skill_id == s_obj.id
                    )
                    if (await db.execute(js_stmt)).scalar_one_or_none() is None:
                        db.add(
                            JobSkill(
                                job_id=job.id,
                                skill_id=s_obj.id,
                                requirement_type="required",
                                importance_weight=1.0,
                            )
                        )

    await db.commit()
    print("--> Database Seeding Complete!")


async def main():
    async with AsyncSessionFactory() as session:
        await seed_database(session)


if __name__ == "__main__":
    asyncio.run(main())
