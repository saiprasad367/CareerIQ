# Complete Project Blueprint: AI-Powered Career Intelligence Platform

B.Tech Final-Year Major Project · CSE (AI & ML) · Academic Year 2026–27

Your project is AI-Powered Career Intelligence, Skill Gap Analysis and Personalized Job Recommendation System. This blueprint covers the problem statement, proposed solution, complete feature set, end-to-end working, AI/ML algorithms, dataset requirements, database design, credentials, APIs, security, evaluation, and deployment.

The starting point is your uploaded CMR College project abstract. I will distinguish its stated objectives from the additional implementation recommendations needed to turn it into a complete working system.&#x20;

new abstract 2026.pdf



## 1. Project overview

[Career App Design Projects :: Photos, videos, logos, illustrations and branding :: Behance](https://images.openai.com/static-rsc-4/epbVwoOdX9RBkOpdrBplfLDBJxbiwgf_K4ZFDSAtnqS4FU2zxzG53jBYXp32DaWN7lrdpkA3tPVTjBJMi4_6W7oBUShoMQDX4ZbKRXuo6wxOAy17ptrMsRYAko_VzdwfYeDOuQ1d7Jt4nB1wx_r8d4tq1G2EZvDtr8bH0jq6w2M?purpose=inline)

Project category: Artificial Intelligence, Machine Learning, NLP and full-stack web development.

Target users: College students, fresh graduates, job seekers and career counselors.

Primary objective: Convert a candidate's resume and career preferences into explainable career recommendations, job matches, skill-gap reports and a personalized learning plan.

Input

Resume, education, projects, skills and target job descriptions.

Processing

NLP extraction, ML classification, semantic matching and ranking.

Analysis

Career fit, skill gaps, ATS indicators and readiness scoring.

Output

Ranked jobs, learning roadmaps, projects and reports.

## 2. Problem statement

### Existing problem

Students and fresh graduates frequently face five interconnected problems:

1. Unclear career direction: They may know several technologies but not which job roles fit their current skills and experience.
2. Limited feedback: A resume may list technologies without showing whether they match a specific job description.
3. Hidden skill gaps: Candidates often do not know which required skills they lack or which skills they should learn first.
4. Generic job recommendations: Job listings may be shown without considering a candidate's projects, skills, education or experience in sufficient detail.
5. Disconnected career preparation: Resume improvement, job discovery, skill development and project recommendations are often handled by separate tools.

The abstract identifies these issues and proposes an intelligent, personalized career-guidance platform using AI and ML.&#x20;

new abstract 2026.pdf



### Formal problem statement

To develop an AI-powered web application that extracts structured information from resumes, predicts suitable career roles, compares candidate profiles with job descriptions, identifies missing skills, evaluates resume compatibility and generates personalized job and learning recommendations through an interactive dashboard.

The system should provide explainable, data-driven recommendations, not promise guaranteed placement or claim that a numerical score predicts hiring success.

## 3. Proposed solution

The solution is a unified career-intelligence workflow with a single candidate profile.

### 01

Candidate registration

Create profile and set career preferences

### 02

Resume intelligence

Extract and normalize education, skills, projects and experience

### 03

Career-role prediction

Rank suitable roles using profile features and ML

### 04

Job matching

Compare the candidate with available job descriptions

### 05

Skill-gap analysis

Identify missing, matched and partially matched skills

### 06

Personalized action plan

Recommend learning resources, projects and resume improvements

### 07

Dashboard and tracking

Save results, track progress and generate reports

The pipeline should be modular. For example, job matching should still work if the optional generative-AI service is unavailable.

# 4. Complete feature specification

The following is the proposed complete product scope. Features marked as core align with your abstract; advanced features are recommended extensions.

| ID  | Feature                            | What it does                                         | Priority    |
| --- | ---------------------------------- | ---------------------------------------------------- | ----------- |
| F01 | Registration and login             | Secure user accounts and profile management          | Core        |
| F02 | Resume upload                      | Accept PDF/DOCX with validation                      | Core        |
| F03 | Resume parser                      | Extract education, skills, experience and projects   | Core        |
| F04 | Profile editor                     | Correct extraction errors and add missing details    | Core        |
| F05 | Skill normalization                | Map aliases such as JS → JavaScript                  | Core        |
| F06 | Career-role prediction             | Rank relevant job roles                              | Core        |
| F07 | Job-description analysis           | Extract required and preferred skills                | Core        |
| F08 | Semantic job matching              | Rank jobs by profile relevance                       | Core        |
| F09 | Skill-gap analysis                 | Identify missing and partially matched skills        | Core        |
| F10 | ATS compatibility analysis         | Assess keyword and structural alignment              | Core        |
| F11 | Course recommendations             | Suggest learning resources                           | Core        |
| F12 | Project recommendations            | Suggest projects to demonstrate missing skills       | Core        |
| F13 | Career-readiness assessment        | Explain strengths and development priorities         | Core        |
| F14 | Dashboard                          | Show career and skill analytics                      | Core        |
| F15 | Saved jobs                         | Bookmark jobs                                        | Recommended |
| F16 | Application tracker                | Track applied, interview and rejected statuses       | Recommended |
| F17 | Resume improvement assistant       | Rewrite bullets and suggest relevant keywords        | Recommended |
| F18 | Learning progress                  | Record completed courses and projects                | Recommended |
| F19 | PDF report generation              | Export career and ATS analysis                       | Recommended |
| F20 | AI career chatbot                  | Answer questions using the candidate's profile       | Advanced    |
| F21 | Live job integration               | Retrieve listings from authorized sources            | Advanced    |
| F22 | Skill-demand analytics             | Summarize demand from collected job postings         | Advanced    |
| F23 | Historical trend analysis          | Compare demand across time periods                   | Advanced    |
| F24 | Admin dashboard                    | Manage datasets, roles and system health             | Advanced    |
| F25 | Explainability and fairness checks | Explain rankings and audit performance across groups | Advanced    |

A good final-year implementation does not need 25 independent AI models. One reusable resume pipeline, one skill taxonomy, a role-ranking module and a semantic matching engine can support many of these features.

# 5. End-to-end system working

## Stage 1 — Candidate registration and profile creation

The user registers, enters education and career preferences, and uploads a resume.

Example input:

- Education: B.Tech in Computer Science
- Skills: Java, Python, React, Node.js, SQL
- Projects: AI-based research platform and full-stack web application
- Experience: internship or project experience
- Preferences: entry-level roles, preferred cities and remote work

The system stores profile information securely and associates it with the user's account.

## Stage 2 — Resume parsing and NLP

The backend extracts text from the uploaded document, cleans it and identifies relevant sections.

Uploaded resume

PDF/DOCX parser → text cleaning → section identification

Skill extraction → entity normalization → structured candidate profile

For example, the parser may identify `Python`, `FastAPI`, `PostgreSQL`, `REST APIs` and `Docker` from a resume's skills and project descriptions.

Important implementation details:

- Preserve the original extracted text for debugging.
- Detect scanned PDFs and optionally use OCR.
- Normalize equivalent terms without incorrectly merging different technologies.
- Ask the user to confirm ambiguous experience or skills.
- Never treat a skill as proven merely because it appears in an unrelated sentence.

## Stage 3 — Career-role prediction

The system compares the candidate's features against known career-role profiles.

Possible roles include:

- Backend Developer
- Full-Stack Developer
- Software Engineer
- Data Analyst
- Machine Learning Engineer
- Cloud/DevOps Engineer
- QA Automation Engineer

For a first implementation, use TF-IDF or structured skill features with a classifier such as Logistic Regression. Later, compare it with an embedding-based ranking model.

The output should contain:

- Recommended role
- Match score
- Supporting skills
- Missing skills
- Explanation of why the role was recommended

If the classifier is trained on labeled resumes, it can learn role patterns. If you only have role-to-skill mappings, call the result a role suitability ranking, not a trained prediction model.

## Stage 4 — Job-description processing

The system imports job descriptions from a dataset or permitted job source.

For every job, store the title, company, description, location, experience level, required skills, preferred skills, source URL and date collected.

The NLP pipeline extracts the requirements and normalizes them to the same skill vocabulary used for resumes.

This common representation is essential: matching `Node.js` in a resume with `Node` in a job description should be handled consistently, while unrelated technologies should not be treated as equivalent.

## Stage 5 — Semantic job matching

Two complementary methods should be used.

Method A: Keyword and skill matching

Compare normalized candidate skills with required job skills.

\\[ \text{Skill Coverage} = \frac{\text{Matched Required Skills}} {\text{Total Required Skills}}\times100 \\]

Method B: Semantic similarity

Convert the candidate profile and job description into embedding vectors. Compare the vectors using cosine similarity:

\\[ \operatorname{cos}(A,B)= \frac{A\cdot B}{\\|A\\|\\|B\\|} \\]

Semantic similarity helps recognize related language, but it does not replace explicit skill checks. A resume and job description may be linguistically similar while having different mandatory requirements.

A combined ranking score could be:

\\[ S=0.55K+0.30E+0.10X+0.05P \\]

Where:

- \\(K\\): required-skill coverage
- \\(E\\): semantic similarity mapped to a calibrated 0–100 scale
- \\(X\\): experience-level compatibility
- \\(P\\): preference compatibility, such as location or work mode

These weights are proposed starting values, not validated optimal weights. Tune them against labeled evaluation examples. Keep hard eligibility requirements separate from soft preferences.

## Stage 6 — Skill-gap analysis

For each selected role, the engine compares required skills with the candidate's verified skills.

## Example: Backend Developer

Java

Strong match

SQL

Strong match

REST APIs

Partial match

Docker

Needs development

Redis

Needs development

Illustrative data only. These percentages represent example coverage states, not measured proficiency.

A practical gap-analysis algorithm should:

1. Identify required and preferred skills.
2. Match them to the candidate's verified skill inventory.
3. Assign importance weights.
4. Identify prerequisite relationships.
5. Rank missing skills by importance and feasibility.
6. Recommend a course, documentation or project for each priority.
7. Recalculate after the candidate updates their profile or completes learning tasks.

A skill gap should mean that evidence is missing from the profile, not necessarily that the candidate is incapable of the skill.

## Stage 7 — ATS compatibility analysis

The ATS module should compare a resume against a specific job description.

It should evaluate:

- Required-skill coverage.
- Relevant terminology and keyword coverage.
- Resume section completeness.
- Readability and extraction quality.
- Evidence of relevant projects or experience.
- Relevance and clarity of bullet points.

An illustrative score:

\\[ A=0.60R+0.25T+0.15F \\]

Where \\(R\\) is required-skill coverage, \\(T\\) is relevant keyword coverage and \\(F\\) is formatting/section quality, all scaled to 0–100.

This is a project-defined compatibility score, not a score generated by a real employer's ATS and not a guarantee of selection. Different applicant-tracking systems use different rules.

## Stage 8 — Personalized learning and project recommendations

The recommendation engine maps missing skills to learning resources and practical projects.

Example:

| Gap              | Learning recommendation       | Project recommendation        |
| ---------------- | ----------------------------- | ----------------------------- |
| Docker           | Containerization fundamentals | Dockerize a REST API          |
| Redis            | Caching and data structures   | Add caching to a backend      |
| SQL optimization | Indexing and query plans      | Optimize a reporting database |
| Testing          | Unit and integration testing  | Add tests to a full-stack app |

Resources should be selected from a maintained catalog, with title, provider, URL, level, skills taught and verification date.

The system can rank recommendations by relevance, prerequisites, estimated effort and user preference. Course links and availability must be checked rather than fabricated.

## Stage 9 — Dashboard, tracking and reports

The final dashboard should show:

- Career-role recommendations.
- Best-matching job listings.
- Job-specific skill-gap analysis.
- ATS compatibility reports.
- Recommended learning roadmap.
- Saved jobs and application status.
- Progress over time.
- Exportable PDF reports.

Each result should be traceable to the input resume, job record, dataset version and scoring method used.

# 6. Dataset requirements — the most important part of the AI project

Your project will only be as reliable as its data. One dataset will not usually provide everything needed for resume parsing, role prediction, job matching, skill gaps and course recommendations.

The recommended solution is to build a multi-source dataset, keeping each source's purpose and license documented.

## 6.1 Required datasets

| Dataset                      | Required fields                                               | Used for                                         |
| ---------------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| Resume dataset               | Resume text, sections, skills and role labels where available | Resume extraction evaluation and role prediction |
| Job-description dataset      | Job title, description, role family, location, experience     | Job matching and job recommendations             |
| Job-skill dataset            | Job ID, required skills, preferred skills, importance         | Skill matching and gap analysis                  |
| Occupation-skill taxonomy    | Occupation, skill, synonyms, related occupations              | Role mapping and skill normalization             |
| Candidate-role labels        | Profile ID, suitable role or verified role labels             | Supervised role prediction                       |
| Job-profile relevance labels | Candidate/job pair, relevance rating, reason                  | Training and evaluation of ranking               |
| Course/resource catalog      | Skill, resource title, URL, level, prerequisites              | Learning recommendations                         |
| Project catalog              | Project, skills covered, difficulty, estimated effort         | Project recommendations                          |
| Historical job snapshots     | Job ID, collection date, skills, role and source              | Skill-demand trends over time                    |

### 6.2 Useful public dataset sources

These are real starting points discovered through web research. Review the dataset license, collection method, geographic coverage and suitability before incorporating them.

[PPT - ESCO: A Tool for Seamless Skills Matching in Europe PowerPoint Presentation - ID:9633226](https://images.openai.com/static-rsc-4/aLdX8ry6ZUtTjaHFCpmFyTu6yrNqKcIEv4D-9I2IsQZzD9g7gDWwP4iVw2mX0DwKelhEKnZyxuT6YCLyJHz51dw2bgI4ZPVX9AcdkeF1k5ETI76YSzqwpYWkgUjDDKECKW7voyTUzVSretx_y-VJrzyEXaQ2GdXlBD37u1ix844?purpose=inline)

1\. ESCO — occupation and skill taxonomy

Best for: normalized skill names, occupation profiles and mappings between skills and occupations.

ESCO provides downloadable classification data and APIs designed for applications including job matching and career guidance.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://esco.ec.europa.eu\&sz=32)

esco.ec.europa.eu

+2



[Official ESCO data and downloads](https://esco.ec.europa.eu/en/use-esco?utm_source=chatgpt.com)

[Career Resource Center | Westmont College](https://images.openai.com/static-rsc-4/6cgFB4VYOAWALor79s8uxir_18zl3bmD5EofAKFwjLRTOLXe0U5erEk3EYA2NhYbu1FD9cide1Kjp3Sy04TBM7Z3vHey-I7IuSu8Nragy6VZOjhp-CWfRp3zrmN7G0TJSe0N4_xQtqyeIkSrVqChnFccYUuD6-XBR3mY09Zfp10?purpose=inline)

2\. O\*NET — role requirements

Best for: occupational skills, tasks, knowledge, education and technology requirements.

O\*NET provides downloadable occupational data and web services. Its coverage is primarily oriented to the US labor market, so supplement it with India-specific job data for this project.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.onetonline.org\&sz=32)

onetonline.org

+1



[Official O\*NET database](https://www.onetcenter.org/database.html?utm_source=chatgpt.com)

[Datasets · Hugging Face](https://images.openai.com/static-rsc-4/NZ2DMP3QVbI1nCJNPWkQFxp2lW4a4iaFs19Fn2QFphesHFEbQ6FOxXXa05EpzqR_Xuz4jj2RMADOoqDP9o1p7_HhCiVqREC024I8vBIdK_J7smyBtHv15tPisxEnNRXvCz0dQACugAAZvXp_4j5E-AkEcK7EYnMW66ghs5Bhv5I?purpose=inline)

3\. Role Radar — Job-Profile Matching Dataset

Best for: prototyping candidate-job ranking.

The published dataset page describes 2,500 India-focused job postings, 640 candidate profiles, 22,465 profile-job pairs and 108 human-reviewed evaluation pairs. Some profiles are synthetic and some labels are generated or rule-based, so do not treat all labels as independent ground truth.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://huggingface.co\&sz=32)

Datasets at Hugging Face

+1



[Inspect dataset and license](https://huggingface.co/datasets/oksomu/role-radar-dataset?utm_source=chatgpt.com)

[What is Hugging Face? The ML Platform For Building AI-Powered Apps | Scalable Path](https://images.openai.com/static-rsc-4/b284b2CpxW82L1izupJedchdVeHDmqaf33s5irbp5Pz7uEqHk3Q7E4hoLevfqukaC8vz_2h6EM21BzOT77cak-eKsr4Ix2qxq_Cr3w1nIofJNlvPIEs5FhkrZ7gZdsxhhEIza64HCk6aoW8YS_Kq9LJLirjRAoehpfuFt77d-hI?purpose=inline)

4\. Resume Skill Extractor Dataset

Best for: experimenting with job-description skill extraction.

The published dataset page describes 3,050 job descriptions with summaries and extracted required skills. It is a job-description dataset, not a substitute for a representative, manually labeled resume corpus.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://huggingface.co\&sz=32)

Datasets at Hugging Face



[Inspect dataset and license](https://huggingface.co/datasets/keerthanshetty/resume-skill-extractor-dataset?utm_source=chatgpt.com)

## 6.3 Recommended dataset plan for your project

For an undergraduate project focused on students and entry-level technology jobs in India, use this initial target.

| Data component                    | Suggested initial target | Purpose                                     |
| --------------------------------- | ------------------------ | ------------------------------------------- |
| Job descriptions                  | 2,000–5,000              | Job recommendation and demand analysis      |
| Role-to-skill mappings            | 30–60 roles              | Career suitability and gap analysis         |
| Canonical skills and aliases      | 500–1,500 entries        | Skill normalization                         |
| Manually reviewed resume examples | 100–300, if available    | Validate extraction and role classification |
| Candidate-job relevance labels    | 300–1,000 reviewed pairs | Evaluate job-ranking quality                |
| Learning resources                | 100–300                  | Course recommendations                      |
| Project templates                 | 50–100                   | Project recommendations                     |

These are planning targets, not universal minimums. You can build a functioning prototype with less data, but claims about predictive accuracy and generalization require stronger evaluation.

Do not collect real resumes without appropriate permission and privacy safeguards. Synthetic resumes can be useful for testing; they are not enough by themselves to establish real-world model accuracy.

## 6.4 Exact data schemas

A job dataset could use the following CSV structure:

```
job_id,title,company,location,description,experience_level,job_type,source_url,collected_at,required_skills,preferred_skills
J001,Backend Developer,ExampleCo,Hyderabad,Build REST APIs...,Entry-level,Full-time,https://example.com/job,2026-10-20,"Python;SQL;REST APIs","Docker;Redis"
```

Use genuine records and valid source URLs in the actual dataset. The row above is illustrative.

A role-skill mapping:

```
role_id,role_name,skill_name,importance,required_level,prerequisites
R001,Backend Developer,SQL,1.0,Intermediate,
R001,Backend Developer,REST APIs,0.9,Intermediate,HTTP
R001,Backend Developer,Docker,0.6,Beginner,Linux basics
```

A skill taxonomy:

```
skill_id,canonical_name,aliases,category,related_skills
S001,JavaScript,"JS;ECMAScript",Programming,
S002,Node.js,"NodeJS;Node",Backend,"JavaScript"
S003,PostgreSQL,"Postgres",Database,"SQL"
```

A candidate-job relevance dataset:

```
pair_id,candidate_id,job_id,relevance_label,review_reason
P001,C001,J001,2,Relevant entry-level skills
P002,C001,J002,0,Required skills not supported by profile
```

Define a consistent label scale, for example `0 = not relevant`, `1 = partially relevant`, and `2 = highly relevant`. Reviewers must use written guidelines rather than guess.

## 6.5 Data preprocessing pipeline

Every imported dataset should pass through these stages:

1. Ingestion: Load CSV, JSON, Excel or approved API data.
2. Schema validation: Check mandatory columns and data types.
3. Cleaning: Remove empty descriptions, malformed records and unusable rows.
4. Deduplication: Detect duplicate job postings and near-identical descriptions.
5. Normalization: Standardize job titles, skills, locations and experience levels.
6. Label verification: Review a representative sample of skill and role labels.
7. Split: Separate training, validation and test data before model fitting.
8. Versioning: Record source, collection date, license and preprocessing version.

Avoid data leakage: near-duplicate resumes or job descriptions must not appear across both training and test splits. Otherwise, your evaluation may look better than the actual model performance.

# 7. AI/ML algorithms and model design

Your abstract mentions NLP, ML, BERT, TF-IDF and cosine similarity.&#x20;

new abstract 2026.pdf

&#x20;The following is a practical implementation strategy.



| Task                      | Baseline model                      | Optional advanced model                         |
| ------------------------- | ----------------------------------- | ----------------------------------------------- |
| Resume section extraction | Section headings and rules          | Layout-aware document models                    |
| Skill extraction          | Dictionary matching and spaCy       | Fine-tuned token classification                 |
| Career-role prediction    | TF-IDF + Logistic Regression        | Fine-tuned transformer classifier               |
| Semantic matching         | TF-IDF + cosine similarity          | Sentence Transformers embeddings                |
| Job ranking               | Weighted scoring                    | Learning-to-rank model                          |
| Skill-gap analysis        | Required-versus-known skills        | Skill graph and prerequisite ranking            |
| ATS analysis              | Weighted keyword and section checks | Context-aware terminology matching              |
| Course recommendations    | Rule-based resource mapping         | Hybrid content-based recommender                |
| Future demand             | Aggregated skill counts             | Time-series forecasting with sufficient history |

Important: BERT is not mandatory for every module. A smaller local embedding model and a well-designed skill taxonomy may be more practical than fine-tuning a large model on a small student dataset.

# 8. Database design

Use PostgreSQL as the primary database. Supabase is one convenient option because it offers managed PostgreSQL and authentication, but a local PostgreSQL installation can also work.

Recommended tables:

| Table                    | Important columns                                     |
| ------------------------ | ----------------------------------------------------- |
| `users`                  | id, email, created_at                                 |
| `candidate_profiles`     | user_id, education, experience, preferences           |
| `resumes`                | id, user_id, file_path, extracted_text, version       |
| `candidate_skills`       | user_id, skill_id, evidence, proficiency              |
| `skills`                 | id, canonical_name, category, aliases                 |
| `career_roles`           | id, title, description, role_family                   |
| `role_skills`            | role_id, skill_id, importance, required_level         |
| `jobs`                   | id, title, company, description, location, source_url |
| `job_skills`             | job_id, skill_id, requirement_type, importance        |
| `career_recommendations` | user_id, role_id, score, explanation                  |
| `job_matches`            | user_id, job_id, score, scoring_version               |
| `skill_gap_reports`      | user_id, role_id, missing_skills, created_at          |
| `learning_resources`     | id, title, URL, provider, level                       |
| `project_resources`      | id, title, skills_covered, difficulty                 |
| `learning_progress`      | user_id, resource_id, status, completed_at            |
| `saved_jobs`             | user_id, job_id, saved_at                             |
| `applications`           | user_id, job_id, status, updated_at                   |
| `analysis_runs`          | user_id, input_version, model_version, created_at     |

Use separate normalized records for skills and relationships rather than storing all skill information in one large text field. JSON columns can still be useful for flexible analysis metadata.

## Recommended API endpoints

| Method | Endpoint                    | Purpose                                  |
| ------ | --------------------------- | ---------------------------------------- |
| POST   | `/api/resumes`              | Upload a resume                          |
| GET    | `/api/resumes/{id}`         | Retrieve parsed resume information       |
| PATCH  | `/api/profiles/me`          | Update the candidate profile             |
| POST   | `/api/careers/recommend`    | Generate career-role rankings            |
| GET    | `/api/jobs`                 | Search available job records             |
| POST   | `/api/jobs/match`           | Match profile against a job or job set   |
| POST   | `/api/skills/gap-analysis`  | Analyze missing skills for a role        |
| POST   | `/api/resumes/ats-analysis` | Analyze resume against a job description |
| GET    | `/api/resources`            | Retrieve learning recommendations        |
| POST   | `/api/reports`              | Generate a report                        |
| GET    | `/api/dashboard`            | Retrieve dashboard data                  |
| PATCH  | `/api/applications/{id}`    | Update application status                |

Protect endpoints with authentication and user-level authorization. A user must not be able to retrieve another candidate's resume or analysis by changing an ID.

# 9. Complete credentials and environment configuration

Here is the final practical checklist of what the development team should prepare.

## 9.1 Required for a basic working prototype

- Python 3.x and a virtual environment.
- Node.js and npm for a React frontend.
- Git and a source repository.
- A local PostgreSQL database or a managed database.
- Resume parsing and NLP libraries.
- A local skill taxonomy, role-skill mappings and sample job dataset.
- A local embedding model or TF-IDF implementation.
- Environment configuration for database access and application secrets.

These components do not require a paid AI API key.

## 9.2 Optional external services

| Service           | Credentials/configuration                                               | Required when                                      |
| ----------------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| Supabase          | Project URL, publishable key, protected server-side secret where needed | Using managed database/auth                        |
| Gemini            | API key                                                                 | Using Gemini for explanations or conversational AI |
| Job-data provider | API key or OAuth credentials if required                                | Fetching live job listings                         |
| Email provider    | API key and verified sender configuration                               | Sending account or application notifications       |
| Hosting platform  | Project configuration and deployment secrets                            | Deploying the application                          |
| OCR provider      | API credentials, if applicable                                          | Using paid cloud OCR instead of local OCR          |

For local model inference, you do not need a hosted embedding API. For local database access, you do not need a Supabase account. For a static course catalog, you do not need a course-provider API.

## 9.3 Example `.env.example`

Use placeholders only in the committed example file:

```
APP_ENV=development
FRONTEND_URL=http://localhost:5173
API_BASE_URL=http://localhost:8000

DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME

SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

GEMINI_API_KEY=

JOB_PROVIDER_API_KEY=

EMAIL_PROVIDER_API_KEY=
EMAIL_FROM=

RESUME_MAX_SIZE_MB=10
```

Adjust these names to match the actual implementation. Do not commit a real `.env` file, passwords, service-role keys, API tokens or private credentials to GitHub. Never expose a database password, Supabase secret key or LLM API key through frontend variables.

## 9.4 Credentials setup order

1. Start with local parsing, skill mapping and a sample dataset.
2. Configure the database.
3. Add authentication if user accounts are required.
4. Add an LLM provider only if needed.
5. Integrate an external job source after checking its terms and limits.
6. Configure hosting and deployment secrets.
7. Test the deployed system without exposing credentials.

Keep a record of each service's purpose, account owner, billing status, rate limits and key-rotation procedure.

# 10. Security and privacy requirements

Because resumes contain personal information, privacy is a core system requirement.

- Accept only supported file types and enforce upload limits.
- Validate the actual file content, not just the filename extension.
- Store uploads outside publicly accessible directories.
- Use private object storage and short-lived access URLs if using cloud storage.
- Enforce user-specific access policies.
- Avoid logging full resume text, tokens or passwords.
- Allow users to delete uploaded resumes and their stored analysis.
- Define retention periods for raw files and extracted text.
- Do not send personal resume content to an external AI provider without appropriate disclosure and safeguards.
- Keep external API calls limited to the data required for the task.
- Use HTTPS, server-side validation, rate limits and dependency updates.

For the college demonstration, use synthetic or permissioned resumes whenever possible.

# 11. How to evaluate whether the AI actually works

A polished interface is not enough for an AI/ML major project. You should demonstrate that the underlying modules produce useful results.

| Module                 | Evaluation metric                           | What it measures                                          |
| ---------------------- | ------------------------------------------- | --------------------------------------------------------- |
| Resume extraction      | Precision, recall, F1                       | Correctly extracted fields and skills                     |
| Career-role prediction | Accuracy, macro-F1                          | Quality of predicted role labels                          |
| Job recommendations    | Precision\@K, Recall\@K, NDCG\@K            | Relevance and ordering of recommended jobs                |
| Skill-gap analysis     | Precision, recall, F1                       | Correct identification of missing required skills         |
| Semantic matching      | Human relevance ratings and ranking metrics | Whether similar scores reflect relevant jobs              |
| ATS analysis           | Agreement with a manually defined rubric    | Whether the report correctly identifies job-specific gaps |
| Course recommendations | Relevance ratings and completion feedback   | Usefulness of suggested learning resources                |

Use a held-out test set. For ranking, collect human judgments of candidate-job relevance and compare the model's ranked list with those judgments. Report the dataset size, split method, limitations and measured results.

Do not claim 95% accuracy, a guaranteed ATS score or better placement outcomes without evidence.

# 12. Deployment architecture

User's browser

React + TypeScript dashboard

Backend service

FastAPI · authentication · validation · application logic

AI services

Parsing, NLP, ranking and recommendations

PostgreSQL

Profiles, jobs, skills and reports

Optional: private file storage, LLM API and approved job-data provider

For the first release, a React frontend, FastAPI backend, PostgreSQL database and local NLP models are sufficient. A frontend host and a Python-compatible backend host can be used when deploying. Confirm current plan limits and file-storage capabilities before choosing a provider.

# 13. Development roadmap

This is a proposed six-week implementation plan, assuming the project starts with no existing implementation. Actual timing depends on team availability and dataset preparation.

Week 1

Foundation and data

Finalize requirements, design schema, prepare skill taxonomy and job dataset, create frontend/backend projects.

Week 2

Resume intelligence

Build PDF/DOCX upload, parsing, skill extraction, profile editing and validation.

Week 3

Career intelligence

Implement role ranking, job-description processing, semantic matching and skill-gap analysis.

Week 4

Recommendations and ATS

Add ATS compatibility reports, course/project recommendations and career-readiness calculations.

Week 5

Dashboard and reports

Build dashboard, saved jobs, application tracker, PDF exports and user authentication.

Week 6

Testing and final deployment

Evaluate ML results, fix bugs, secure APIs, deploy, document architecture and prepare the demonstration.

# 14. Final deliverables for your major project

Your final submission should ideally include:

- Full-stack web application.
- Resume extraction and skill-normalization pipeline.
- ML role-prediction or role-ranking model.
- Job matching and skill-gap engine.
- ATS compatibility analysis.
- Course and project recommendation engine.
- Dataset files, sources and license documentation.
- Database schema and API documentation.
- Evaluation results and testing report.
- System architecture and data-flow diagrams.
- Project report, abstract, methodology and limitations.
- Demonstration dataset with synthetic or permissioned resumes.
- Deployment instructions and `.env.example`.
- A working demonstration of the entire candidate journey.

# 15. Decisions to finalize before implementation

The following choices determine which datasets, APIs and credentials you actually need.

1\. Backend framework

Python FastAPI — recommended for AI/ML

Python Flask — simpler alternative

Node.js backend with a separate Python ML service

2\. Database and authentication

Supabase PostgreSQL + authentication

Local PostgreSQL

Firebase for authentication and data storage

3\. AI model strategy

Local NLP and embedding models — no paid AI API required

Local ML + Gemini API for explanations and chatbot

External AI APIs wherever useful

4\. Job data source

Curated dataset first — easiest for reliable testing

Live jobs from approved APIs or feeds

Dataset plus live job integration

5\. Deployment target

Run locally for the first demonstration

Deploy frontend and backend to the cloud

6\. Implementation scope

Core academic project features first

Complete polished platform, including recommended extensions

Finalize project architecture

My overall recommendation: build the core system around reliable resume parsing, a reusable skill taxonomy, explainable career ranking, job-specific skill-gap analysis and measurable semantic job matching. Those capabilities directly address your approved abstract. Add the chatbot and live-job integration after the core workflow works end to end.

The one thing still needed for a true code-level audit is your actual source repository or project ZIP. This blueprint defines the complete proposed system; it does not imply that any of these features or credentials have already been implemented.