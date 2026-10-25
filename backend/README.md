# CareerIQ — Backend, Database & AI/ML Service

B.Tech Final-Year Major Project (CSE AI & ML):
**AI-Powered Career Intelligence, Skill Gap Analysis and Personalized Job Recommendation System**

---

## 1. Architecture Overview

CareerIQ is built as a production-grade modular monolith providing:
- **FastAPI** asynchronous REST API running under `/api/v1`
- **SQLAlchemy 2.0** ORM with async connection pooling and UUID primary keys
- **PostgreSQL** relational schema with Alembic version-controlled migrations
- **Argon2id** password hashing and cryptographic JWT tokens with refresh-token rotation
- **Document Processing**: multi-format PDF and Word (.docx) extraction, contact parsing, and skill detection
- **Scoring & ML Engine**:
  - Hybrid Job Matching Formula: $M = 0.45K + 0.25E + 0.15X + 0.15P$
  - ATS Compatibility Formula: $A = 0.50R + 0.30T + 0.20F$
  - Local semantic sentence embeddings (`all-MiniLM-L6-v2`) with cosine similarity and TF-IDF fallback
- **Private File Storage**: local filesystem storage with path-traversal prevention, or S3/Supabase private storage

---

## 2. Directory Structure

```text
backend/
├── alembic/                  # Database migration scripts and environment
│   └── versions/             # Migration revisions (001_initial_schema.py)
├── app/
│   ├── api/                  # FastAPI routers and dependency injection
│   │   ├── deps.py           # JWT auth dependencies, DB session, admin guard
│   │   └── v1/               # Domain routers (auth, profile, resumes, jobs, etc.)
│   ├── core/                 # Config (pydantic-settings), Argon2id security, logging, errors
│   ├── db/                   # Async session maker, Declarative Base, and seed script
│   ├── models/               # SQLAlchemy 2 ORM relational models
│   ├── schemas/              # Pydantic v2 request/response contracts
│   ├── services/             # Core business logic services
│   ├── ml/                   # Scoring formulas (M and A) and semantic embeddings
│   ├── storage/              # Private storage abstraction (Local & S3)
│   └── tests/                # Automated pytest test suites
├── datasets/csv/             # Canonical taxonomy CSVs (career roles, skills, jobs)
├── requirements.txt          # Pinned Python dependencies
├── .env.example              # Environment variables template
└── Dockerfile                # Production container specification
```

---

## 3. Quickstart & Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or local SQLite for zero-config demo development)

### Step 1: Python Environment & Dependencies
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the database URL and generate a 64-byte JWT secret:
```bash
python -c "import secrets; print(secrets.token_hex(64))"
```

### Step 3: Database Migrations & Seeding
```bash
# Run Alembic migrations
alembic upgrade head

# Seed 7 career roles, 50+ canonical skills, sample jobs and learning catalog
python -m app.db.seed
```

### Step 4: Start Backend Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`
- Readiness check: `http://localhost:8000/ready`

### Step 5: Start React Frontend
In the root directory:
```bash
npm install
npm run dev
```
Open `http://localhost:5173`.

---

## 4. Running Automated Tests

Run the test suite verifying formulas, authentication, and multi-user privacy:
```bash
# From workspace root:
set PYTHONPATH=backend
python -m pytest backend/app/tests/ -v
```

---

## 5. Scoring Algorithms Specification

### A. Hybrid Job Matching Formula
$$M = 0.45K + 0.25E + 0.15X + 0.15P$$
- **$K$ (Required-Skill Coverage, 45%)**: Matched required skills divided by total required skills $\times 100$.
- **$E$ (Semantic Similarity, 25%)**: Cosine similarity between candidate profile representation and job description normalized to $[0, 100]$.
- **$X$ (Experience Compatibility, 15%)**: Alignment between candidate seniority and job requirement.
- **$P$ (Preference Compatibility, 15%)**: Work mode and geographic preference alignment.

### B. ATS Compatibility Formula
$$A = 0.50R + 0.30T + 0.20F$$
- **$R$ (Required Skill Coverage, 50%)**: Proportion of required skills detected in resume.
- **$T$ (Relevant Keyword Coverage, 30%)**: Domain keyword frequency match.
- **$F$ (Formatting Completeness, 20%)**: Structural completeness of Contact, Skills, Experience, and Education sections.
