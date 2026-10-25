import type { Candidate } from '@/types';

export const mockCandidate: Candidate = {
  id: 'C001',
  name: 'Arjun Mehta',
  email: 'arjun.mehta@example.com',
  headline: 'B.Tech CSE (AI & ML) Student · Full-Stack & Backend Developer',
  education: [
    {
      id: 'E001',
      institution: 'CMR College of Engineering and Technology',
      degree: 'Bachelor of Technology',
      field: 'Computer Science Engineering (AI & ML)',
      startYear: 2022,
      endYear: 2026,
      gpa: '8.4 / 10.0',
      current: true,
    },
  ],
  experience: [
    {
      id: 'X001',
      company: 'TechSpark Solutions',
      role: 'Backend Developer Intern',
      startDate: '2025-05',
      endDate: '2025-08',
      current: false,
      description:
        'Developed REST APIs using FastAPI and PostgreSQL for an internal HR automation tool. Reduced query response time by 35% through query optimization and indexing. Collaborated with the frontend team to integrate API endpoints.',
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'REST APIs', 'Docker'],
    },
    {
      id: 'X002',
      company: 'CMR Research Lab',
      role: 'Student Research Assistant',
      startDate: '2024-09',
      endDate: '2025-04',
      current: false,
      description:
        'Assisted in building a natural language processing pipeline for academic paper summarization. Implemented text classification models using scikit-learn and fine-tuned a BERT-based model for domain-specific entity extraction.',
      skills: ['Python', 'NLP', 'scikit-learn', 'BERT', 'Pandas'],
    },
  ],
  projects: [
    {
      id: 'P001',
      name: 'AI-Powered Research Platform',
      description:
        'Full-stack web application that aggregates and semantically indexes academic papers, allowing researchers to query literature using natural language. Built with React, FastAPI, and a sentence-transformer embedding pipeline.',
      skills: ['React', 'FastAPI', 'Python', 'PostgreSQL', 'Sentence Transformers', 'TailwindCSS'],
      year: 2025,
    },
    {
      id: 'P002',
      name: 'Expense Tracker API',
      description:
        'RESTful API service for personal finance tracking with JWT authentication, category management, recurring transaction support, and monthly PDF report generation.',
      skills: ['Node.js', 'Express', 'MongoDB', 'JWT', 'REST APIs'],
      year: 2024,
    },
    {
      id: 'P003',
      name: 'ML Resume Classifier',
      description:
        'Machine learning model that classifies resumes into job categories using TF-IDF features and a Logistic Regression classifier. Achieved 87% accuracy on the test split.',
      skills: ['Python', 'scikit-learn', 'NLP', 'TF-IDF', 'Pandas'],
      year: 2025,
    },
  ],
  certifications: [
    {
      id: 'CERT001',
      name: 'Python for Data Science and Machine Learning',
      issuer: 'Udemy',
      year: 2024,
    },
    {
      id: 'CERT002',
      name: 'Google Cloud Fundamentals: Core Infrastructure',
      issuer: 'Coursera (Google)',
      year: 2025,
    },
  ],
  skills: [
    { skillId: 'SK001', name: 'Python', category: 'programming', proficiency: 'advanced', evidenceType: 'project' },
    { skillId: 'SK002', name: 'JavaScript', category: 'programming', proficiency: 'intermediate', evidenceType: 'project' },
    { skillId: 'SK003', name: 'TypeScript', category: 'programming', proficiency: 'intermediate', evidenceType: 'project' },
    { skillId: 'SK004', name: 'React', category: 'frontend', proficiency: 'intermediate', evidenceType: 'project' },
    { skillId: 'SK005', name: 'FastAPI', category: 'backend', proficiency: 'advanced', evidenceType: 'resume' },
    { skillId: 'SK006', name: 'Node.js', category: 'backend', proficiency: 'intermediate', evidenceType: 'project' },
    { skillId: 'SK007', name: 'PostgreSQL', category: 'database', proficiency: 'intermediate', evidenceType: 'resume' },
    { skillId: 'SK008', name: 'MongoDB', category: 'database', proficiency: 'beginner', evidenceType: 'project' },
    { skillId: 'SK009', name: 'REST APIs', category: 'backend', proficiency: 'advanced', evidenceType: 'resume' },
    { skillId: 'SK010', name: 'Docker', category: 'devops', proficiency: 'beginner', evidenceType: 'resume' },
    { skillId: 'SK011', name: 'scikit-learn', category: 'ai-ml', proficiency: 'intermediate', evidenceType: 'project' },
    { skillId: 'SK012', name: 'NLP', category: 'ai-ml', proficiency: 'intermediate', evidenceType: 'project' },
    { skillId: 'SK013', name: 'Pandas', category: 'ai-ml', proficiency: 'intermediate', evidenceType: 'project' },
    { skillId: 'SK014', name: 'SQL', category: 'database', proficiency: 'intermediate', evidenceType: 'resume' },
    { skillId: 'SK015', name: 'Git', category: 'tools', proficiency: 'intermediate', evidenceType: 'project' },
    { skillId: 'SK016', name: 'Linux', category: 'tools', proficiency: 'beginner', evidenceType: 'self-reported' },
    { skillId: 'SK017', name: 'TailwindCSS', category: 'frontend', proficiency: 'intermediate', evidenceType: 'project' },
    { skillId: 'SK018', name: 'BERT / Transformers', category: 'ai-ml', proficiency: 'beginner', evidenceType: 'project' },
  ],
  targetRoles: ['Backend Developer', 'Full-Stack Developer', 'Machine Learning Engineer'],
  preferredLocations: ['Hyderabad', 'Bengaluru', 'Remote'],
  workMode: 'hybrid',
  experienceLevel: 'entry',
  careerGoal: 'Secure a backend or full-stack engineering role at a growth-stage tech company, contribute to AI-powered products, and grow into a senior engineer within 3 years.',
  createdAt: '2026-10-01T09:00:00Z',
};
