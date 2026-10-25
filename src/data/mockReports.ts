import type { CareerReport } from '@/types';

export const mockReports: CareerReport[] = [
  {
    id: 'REP001',
    type: 'career-recommendations',
    title: 'Career Role Recommendations',
    generatedAt: '2026-10-24T14:30:00Z',
    roleTitle: 'Backend Developer',
    summary: 'Based on your resume analysis, you are best aligned with Backend Developer and Machine Learning Engineer roles. Your Python proficiency, FastAPI experience, and PostgreSQL knowledge are strong signals.',
    keyStrengths: [
      'Advanced Python with 2+ projects demonstrating production-level usage',
      'FastAPI and PostgreSQL experience from internship',
      'NLP and scikit-learn from academic research',
      'Full-stack capability through React and Node.js projects',
    ],
    skillGaps: [
      'Redis caching — no evidence in current profile',
      'Docker — only beginner-level evidence',
      'Unit testing — not mentioned in projects',
      'CI/CD experience — no evidence',
    ],
    jobCompatibility: 78,
    recommendedNextSteps: [
      'Add a Redis caching layer to your Expense Tracker API project',
      'Dockerize the AI Research Platform and document the setup',
      'Add pytest coverage to your Python projects',
      'Set up a GitHub Actions workflow for one of your repositories',
    ],
  },
  {
    id: 'REP002',
    type: 'resume-analysis',
    title: 'Resume Analysis Report',
    generatedAt: '2026-10-24T14:00:00Z',
    summary: 'Your resume is well-structured with clear sections, strong project descriptions, and quantified internship achievements. Improvement areas: add Docker and testing evidence, and list your GCP certification more prominently.',
    keyStrengths: [
      'Clear education section with CGPA',
      'Quantified internship achievement (35% query time reduction)',
      'Three diverse projects covering AI/ML and web development',
      'Clean chronological experience format',
    ],
    skillGaps: [
      'No mention of testing frameworks used in projects',
      'Docker listed but no project demonstrates it in depth',
      'GCP certification buried at the bottom',
    ],
    recommendedNextSteps: [
      'Move certifications above projects or add a Relevant Coursework section',
      'Add "Containerized with Docker" to the AI Research Platform project',
      'Mention pytest or any testing tool used in any project',
    ],
  },
  {
    id: 'REP003',
    type: 'skill-gap',
    title: 'Skill Gap Analysis — Backend Developer',
    generatedAt: '2026-10-24T15:00:00Z',
    roleTitle: 'Backend Developer',
    summary: 'You match 6 out of 8 required skills for Backend Developer. The two critical gaps are Redis and in-depth Docker usage. Filling these within 3–4 weeks could significantly improve your job-match scores for this role.',
    keyStrengths: [
      'Python (advanced)',
      'FastAPI (advanced)',
      'PostgreSQL (intermediate)',
      'REST APIs (advanced)',
      'SQL (intermediate)',
      'Git (intermediate)',
    ],
    skillGaps: ['Redis', 'Docker (needs advancement beyond beginner)'],
    jobCompatibility: 82,
    recommendedNextSteps: [
      'Complete Redis University free course (6 hours)',
      'Add Redis caching to your Expense Tracker API as a portfolio project',
      'Docker multi-container setup tutorial — 4 hours',
    ],
  },
  {
    id: 'REP004',
    type: 'learning-progress',
    title: 'Learning Progress Summary',
    generatedAt: '2026-10-25T09:00:00Z',
    summary: 'You have started 2 learning tasks and completed 0 so far. Your roadmap has 12 tasks across 3 phases. At your current pace, the fundamentals phase would be complete in approximately 3 weeks.',
    keyStrengths: [
      'Roadmap is personalized for Backend Developer role',
      'All high-priority items are identified',
    ],
    skillGaps: [],
    recommendedNextSteps: [
      'Start with the Docker course — the most impactful first step',
      'Complete the Redis fundamentals course next',
      'Add a GitHub Actions CI/CD file to any existing repository',
    ],
  },
];
