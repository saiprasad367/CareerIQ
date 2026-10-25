// ============================================================
// CareerIQ — Shared TypeScript Types
// ============================================================

export interface Candidate {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  headline?: string;
  education: Education[];
  experience: Experience[];
  skills: CandidateSkill[];
  projects: Project[];
  certifications: Certification[];
  targetRoles: string[];
  preferredLocations: string[];
  workMode: 'remote' | 'hybrid' | 'onsite' | 'any';
  experienceLevel: 'entry' | 'mid' | 'senior';
  careerGoal?: string;
  createdAt: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  gpa?: string;
  current?: boolean;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description: string;
  skills: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  skills: string[];
  url?: string;
  year?: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year?: number;
  url?: string;
}

export interface CandidateSkill {
  skillId: string;
  name: string;
  category: SkillCategory;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  evidenceType: 'resume' | 'project' | 'certification' | 'self-reported';
}

export type SkillCategory =
  | 'programming'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'ai-ml'
  | 'cloud'
  | 'tools'
  | 'soft-skills'
  | 'other';

export interface Skill {
  id: string;
  canonicalName: string;
  aliases: string[];
  category: SkillCategory;
  relatedSkills: string[];
  demandScore?: number; // 0-100
}

export interface CareerRole {
  id: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: RoleSkill[];
  preferredSkills: RoleSkill[];
  avgSalaryINR?: string;
  growthOutlook?: 'low' | 'moderate' | 'high' | 'very-high';
  typicalExperience?: string;
}

export interface RoleSkill {
  skillId: string;
  skillName: string;
  importance: number; // 0-1
  requiredLevel: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: 'remote' | 'hybrid' | 'onsite';
  experienceLevel: 'entry' | 'mid' | 'senior';
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  salary?: string;
  postedDate: string;
  roleCategory: string;
  companySize?: string;
  industry?: string;
  sourceUrl?: string;
}

export interface JobMatch {
  jobId: string;
  job: Job;
  overallScore: number; // 0-100, illustrative
  skillCoverageScore: number; // K
  semanticScore: number; // E
  experienceScore: number; // X
  preferenceScore: number; // P
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchedPreferredSkills: string[];
  resumeImprovements: string[];
}

export interface SkillGap {
  skillId: string;
  skillName: string;
  category: SkillCategory;
  importance: number; // 0-1
  status: 'missing' | 'partial' | 'matched';
  prerequisites: string[];
  learningPriority: 'critical' | 'high' | 'medium' | 'low';
  estimatedHours: number;
  resources: LearningResource[];
  suggestedProjects: ProjectResource[];
}

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  url: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  skillsCovered: string[];
  type: 'course' | 'documentation' | 'book' | 'tutorial' | 'video';
  isFree: boolean;
}

export interface ProjectResource {
  id: string;
  title: string;
  description: string;
  skillsCovered: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedHours: number;
  prerequisites?: string[];
}

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  skillCovered: string;
  phase: 'fundamentals' | 'applied' | 'portfolio';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedHours: number;
  prerequisites: string[];
  resource?: LearningResource;
  status: 'not-started' | 'in-progress' | 'completed';
  isCustom?: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  appliedDate: string;
  status: 'saved' | 'applied' | 'assessment' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  nextAction?: string;
  followUpDate?: string;
  notes?: string;
  salary?: string;
  workMode?: string;
}

export type ApplicationStatus = Application['status'];

export interface ResumeAnalysis {
  id: string;
  candidateId: string;
  fileName?: string;
  analyzedAt: string;
  candidate: Candidate;
  suggestedRoles: string[];
  missingInfo: string[];
  overallReadabilityScore: number;
  sectionScores: {
    education: number;
    experience: number;
    skills: number;
    projects: number;
    certifications: number;
  };
  rawJsonPayload?: any;
}

export interface ATSAnalysis {
  jobId: string;
  roleTitle: string;
  overallScore: number; // A = 0.60R + 0.25T + 0.15F
  requiredSkillScore: number; // R (0-100)
  keywordScore: number; // T (0-100)
  formatScore: number; // F (0-100)
  matchedSkills: string[];
  missingSkills: string[];
  missingKeywords: string[];
  sectionChecks: SectionCheck[];
  bulletImprovements: BulletImprovement[];
}

export interface SectionCheck {
  section: string;
  present: boolean;
  quality: 'good' | 'needs-improvement' | 'missing';
  suggestion?: string;
}

export interface BulletImprovement {
  original: string;
  improved: string;
  explanation: string;
}

export interface CareerReport {
  id: string;
  type: 'resume-analysis' | 'career-recommendations' | 'skill-gap' | 'job-match' | 'learning-progress';
  title: string;
  generatedAt: string;
  roleTitle?: string;
  summary: string;
  keyStrengths: string[];
  skillGaps: string[];
  jobCompatibility?: number;
  recommendedNextSteps: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}
