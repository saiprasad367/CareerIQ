// ============================================================
// CareerIQ — Mock Service Layer
// These functions simulate AI/ML analysis results using local
// mock data. No external API calls are made.
// ============================================================

import type {
  Candidate, JobMatch, SkillGap, RoadmapTask,
  Application, CareerReport, ResumeAnalysis, ATSAnalysis,
} from '@/types';
import { mockCandidate } from '@/data/mockUser';
import { mockJobs } from '@/data/mockJobs';
import { mockCareerRoles } from '@/data/mockCareerRoles';
import { mockCourses } from '@/data/mockCourses';
import { mockProjects } from '@/data/mockProjects';
import { mockApplications } from '@/data/mockApplications';
import { mockReports } from '@/data/mockReports';
import { computeJobMatchScore, computeSkillCoverage, computeATSScore } from '@/lib/scoring';
import { storage, generateId } from '@/lib/storage';
import { api } from '@/services/api';

export { api };

// ─── Candidate ───────────────────────────────────────────────
export function getCandidateProfile(): Candidate {
  return mockCandidate;
}

export function updateCandidateProfile(updates: Partial<Candidate>): Candidate {
  // Sync to backend if logged in
  if (storage.getToken()) {
    api.profile.update(updates).catch(() => {});
  }
  return { ...mockCandidate, ...updates };
}

// ─── Resume Analysis ─────────────────────────────────────────
export async function analyzeResumeDemo(fileOrName?: string | File): Promise<ResumeAnalysis> {
  // If an actual File object was provided and user has access token, upload to backend
  if (fileOrName instanceof File && storage.getToken()) {
    try {
      const res = await api.resumes.upload(fileOrName);
      if (res && res.parsed_payload) {
        const payload = res.parsed_payload;
        const analysis: ResumeAnalysis = {
          id: res.analysis_id || generateId(),
          candidateId: mockCandidate.id,
          fileName: fileOrName.name,
          analyzedAt: res.created_at || new Date().toISOString(),
          candidate: {
            ...mockCandidate,
            name: payload.full_name || storage.getUser()?.name || mockCandidate.name,
            email: payload.email || storage.getUser()?.email || mockCandidate.email,
            skills: (payload.skills || []).map((s: string, idx: number) => ({
              id: `SK_${idx}`,
              name: s,
              category: 'technical',
              proficiency: 'intermediate',
              source: 'resume',
              isVerified: true,
            })),
          },
          suggestedRoles: ['Backend Developer', 'Software Engineer', 'Full-Stack Developer'],
          missingInfo: payload.missing_info || [],
          overallReadabilityScore: res.readability_score || 85,
          sectionScores: {
            education: 90,
            experience: 88,
            skills: 85,
            projects: 92,
            certifications: 75,
          },
        };
        storage.setResumeAnalysis(analysis);
        return analysis;
      }
    } catch {
      // Fallback
    }
  }

  await delay(800);
  const currentUserName = storage.getUser()?.name || 'Candidate';
  const fileName = typeof fileOrName === 'string' ? fileOrName : fileOrName?.name || 'Candidate_Resume.pdf';
  const analysis: ResumeAnalysis = {
    id: generateId(),
    candidateId: mockCandidate.id,
    fileName,
    analyzedAt: new Date().toISOString(),
    candidate: {
      ...mockCandidate,
      name: currentUserName,
      email: storage.getUser()?.email || 'candidate@example.com',
    },
    suggestedRoles: ['Backend Developer', 'Machine Learning Engineer', 'Full-Stack Developer'],
    missingInfo: [
      'GitHub profile URL not found',
      'No mention of testing frameworks used',
      'LinkedIn profile URL not found',
    ],
    overallReadabilityScore: 84,
    sectionScores: {
      education: 90,
      experience: 88,
      skills: 80,
      projects: 92,
      certifications: 72,
    },
  };
  storage.setResumeAnalysis(analysis);
  return analysis;
}

// ─── Career Recommendations ──────────────────────────────────
export function getCareerRecommendations(): Array<{
  role: typeof mockCareerRoles[0];
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
}> {
  const candidateSkillNames = new Set(mockCandidate.skills.map(s => s.name.toLowerCase()));

  return mockCareerRoles.map(role => {
    const required = role.requiredSkills;
    const matched = required.filter(rs =>
      candidateSkillNames.has(rs.skillName.toLowerCase())
    );
    const missing = required.filter(rs =>
      !candidateSkillNames.has(rs.skillName.toLowerCase())
    );

    const K = computeSkillCoverage(matched.length, required.length);
    const E = Math.round(55 + Math.random() * 25); // illustrative semantic score
    const X = mockCandidate.experienceLevel === 'entry' ? 80 : 60;
    const P = 75; // illustrative preference match
    const score = computeJobMatchScore(K, E, X, P);

    return {
      role,
      score,
      matchedSkills: matched.map(r => r.skillName),
      missingSkills: missing.map(r => r.skillName),
    };
  }).sort((a, b) => b.score - a.score);
}

// ─── Job Matches ─────────────────────────────────────────────
export function getJobMatches(): JobMatch[] {
  const candidateSkillNames = new Set(mockCandidate.skills.map(s => s.name.toLowerCase()));

  return mockJobs.map(job => {
    const matched = job.requiredSkills.filter(s =>
      candidateSkillNames.has(s.toLowerCase())
    );
    const missing = job.requiredSkills.filter(s =>
      !candidateSkillNames.has(s.toLowerCase())
    );
    const matchedPref = job.preferredSkills.filter(s =>
      candidateSkillNames.has(s.toLowerCase())
    );

    const K = computeSkillCoverage(matched.length, job.requiredSkills.length);
    const E = Math.round(50 + Math.random() * 35);
    const X = job.experienceLevel === 'entry' ? 85 : 50;
    const P = job.workMode === mockCandidate.workMode ||
      mockCandidate.workMode === 'any' ||
      job.workMode === 'remote' ? 90 : 60;

    const score = computeJobMatchScore(K, E, X, P);

    return {
      jobId: job.id,
      job,
      overallScore: score,
      skillCoverageScore: K,
      semanticScore: E,
      experienceScore: X,
      preferenceScore: P,
      matchedRequiredSkills: matched,
      missingRequiredSkills: missing,
      matchedPreferredSkills: matchedPref,
      resumeImprovements: getResumeImprovements(missing),
    };
  }).sort((a, b) => b.overallScore - a.overallScore);
}

export function getJobMatch(jobId: string): JobMatch | undefined {
  return getJobMatches().find(jm => jm.jobId === jobId);
}

export function getJobs() {
  return mockJobs;
}

// ─── Skill Gaps ───────────────────────────────────────────────
export function getSkillGaps(roleId: string = 'R002'): SkillGap[] {
  const role = mockCareerRoles.find(r => r.id === roleId) ?? mockCareerRoles[1];
  const candidateSkillNames = new Set(mockCandidate.skills.map(s => s.name.toLowerCase()));

  return role.requiredSkills.map((rs): SkillGap => {
    const matched = candidateSkillNames.has(rs.skillName.toLowerCase());
    const candidateSkill = mockCandidate.skills.find(
      s => s.name.toLowerCase() === rs.skillName.toLowerCase()
    );
    const isPartial = matched && candidateSkill?.proficiency === 'beginner' && rs.requiredLevel !== 'beginner';

    const relatedCourses = mockCourses.filter(c =>
      c.skillsCovered.some(sc => sc.toLowerCase() === rs.skillName.toLowerCase())
    );
    const relatedProjectsList = mockProjects.filter(p =>
      p.skillsCovered.some(sc => sc.toLowerCase() === rs.skillName.toLowerCase())
    );

    const priority: SkillGap['learningPriority'] =
      rs.importance >= 0.9 ? 'critical' :
      rs.importance >= 0.7 ? 'high' :
      rs.importance >= 0.5 ? 'medium' : 'low';

    return {
      skillId: rs.skillId,
      skillName: rs.skillName,
      category: 'backend',
      importance: rs.importance,
      status: matched && !isPartial ? 'matched' : isPartial ? 'partial' : 'missing',
      prerequisites: rs.prerequisites ?? [],
      learningPriority: priority,
      estimatedHours: matched ? 0 : Math.round(4 + rs.importance * 16),
      resources: relatedCourses.slice(0, 2),
      suggestedProjects: relatedProjectsList.slice(0, 1),
    };
  });
}

// ─── Learning Roadmap ────────────────────────────────────────
export function getLearningRoadmap(roleId: string = 'R002'): RoadmapTask[] {
  const gaps = getSkillGaps(roleId).filter(g => g.status !== 'matched');
  const savedTasks = storage.getRoadmapTasks<RoadmapTask>();

  const tasks: RoadmapTask[] = gaps.map((gap, idx): RoadmapTask => {
    const existing = savedTasks.find(t => t.id === `RT_${gap.skillId}`);
    const resource = gap.resources[0];
    const phase: RoadmapTask['phase'] =
      gap.learningPriority === 'critical' || gap.learningPriority === 'high'
        ? 'fundamentals'
        : gap.suggestedProjects.length > 0
        ? 'portfolio'
        : 'applied';

    return {
      id: `RT_${gap.skillId}`,
      title: `Learn ${gap.skillName}`,
      description: resource
        ? `Complete "${resource.title}" on ${resource.provider} to build ${gap.skillName} proficiency.`
        : `Study ${gap.skillName} through documentation and hands-on practice.`,
      skillCovered: gap.skillName,
      phase,
      difficulty: gap.estimatedHours <= 6 ? 'easy' : gap.estimatedHours <= 12 ? 'medium' : 'hard',
      estimatedHours: gap.estimatedHours,
      prerequisites: gap.prerequisites,
      resource,
      status: existing?.status ?? 'not-started',
      isCustom: false,
    };
  });

  // Sort: fundamentals → applied → portfolio; then by importance
  tasks.sort((a, b) => {
    const phaseOrder = { fundamentals: 0, applied: 1, portfolio: 2 };
    return phaseOrder[a.phase] - phaseOrder[b.phase];
  });

  return tasks;
}

// ─── Applications ─────────────────────────────────────────────
export function getApplications(): Application[] {
  const saved = storage.getApplications<Application>();
  return saved.length > 0 ? saved : mockApplications;
}

export function updateApplicationStatus(id: string, status: Application['status']): Application[] {
  const apps = getApplications();
  const updated = apps.map(a => a.id === id ? { ...a, status } : a);
  storage.setApplications(updated);
  if (storage.getToken()) {
    api.applications.updateStatus(id, status).catch(() => {});
  }
  return updated;
}

export function addApplication(app: Application): Application[] {
  const apps = getApplications();
  const updated = [app, ...apps];
  storage.setApplications(updated);
  if (storage.getToken()) {
    api.applications.create({
      job_title: app.jobTitle,
      company: app.company,
      location: app.location,
      work_mode: app.workMode,
      salary: app.salary,
      status: app.status,
      applied_date: app.appliedDate,
      notes: app.notes,
    }).catch(() => {});
  }
  return updated;
}

export function deleteApplication(id: string): Application[] {
  const apps = getApplications().filter(a => a.id !== id);
  storage.setApplications(apps);
  if (storage.getToken()) {
    api.applications.delete(id).catch(() => {});
  }
  return apps;
}

// ─── ATS Analysis ────────────────────────────────────────────
export async function getATSAnalysis(jobId: string): Promise<ATSAnalysis> {
  await delay(1400);
  const job = mockJobs.find(j => j.id === jobId) ?? mockJobs[0];
  const candidateSkillNames = new Set(mockCandidate.skills.map(s => s.name.toLowerCase()));

  const matched = job.requiredSkills.filter(s => candidateSkillNames.has(s.toLowerCase()));
  const missing = job.requiredSkills.filter(s => !candidateSkillNames.has(s.toLowerCase()));
  const R = computeSkillCoverage(matched.length, job.requiredSkills.length);
  const T = Math.round(60 + Math.random() * 25);
  const F = 82;
  const score = computeATSScore(R, T, F);

  return {
    jobId: job.id,
    roleTitle: job.title,
    overallScore: score,
    requiredSkillScore: R,
    keywordScore: T,
    formatScore: F,
    matchedSkills: matched,
    missingSkills: missing,
    missingKeywords: missing.slice(0, 3).map(s => s + ' experience'),
    sectionChecks: [
      { section: 'Contact Information', present: true, quality: 'good' },
      { section: 'Education', present: true, quality: 'good' },
      { section: 'Work Experience', present: true, quality: 'good' },
      { section: 'Skills', present: true, quality: 'needs-improvement', suggestion: 'Add proficiency levels or organize skills by category' },
      { section: 'Projects', present: true, quality: 'good' },
      { section: 'Certifications', present: true, quality: 'needs-improvement', suggestion: 'Move certifications higher and add the credential URL' },
      { section: 'LinkedIn / GitHub', present: false, quality: 'missing', suggestion: 'Add your GitHub profile URL — employers check this for backend roles' },
    ],
    bulletImprovements: [
      {
        original: 'Developed REST APIs using FastAPI and PostgreSQL.',
        improved: 'Designed and deployed 8+ REST API endpoints using FastAPI and PostgreSQL, supporting the internal HR automation tool used by 150+ employees.',
        explanation: 'Adding scale, context, and ownership transforms a task description into an achievement.',
      },
      {
        original: 'Reduced query response time by 35%.',
        improved: 'Reduced average PostgreSQL query response time by 35% through strategic index creation and query plan analysis, improving p95 API latency from 420ms to 270ms.',
        explanation: 'Replacing a bare percentage with a before/after measurement shows engineering rigor.',
      },
      {
        original: 'Collaborated with the frontend team.',
        improved: 'Partnered with a 3-person React frontend team to align API contract design, reducing integration bugs by an estimated 60% in the final sprint.',
        explanation: 'Vague collaboration statements become credible when you state the team size and measurable outcome.',
      },
    ],
  };
}

// ─── Reports ─────────────────────────────────────────────────
export function getReports(): CareerReport[] {
  return mockReports;
}

// ─── Helpers ─────────────────────────────────────────────────
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getResumeImprovements(missingSkills: string[]): string[] {
  if (missingSkills.length === 0) return ['Your resume already covers the key requirements for this role.'];
  return missingSkills.slice(0, 3).map(s =>
    `Add evidence of ${s} to your resume — mention it in a project description or certifications.`
  );
}
