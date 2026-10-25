// ============================================================
// CareerIQ — Local Storage Persistence Utilities
// ============================================================

const KEYS = {
  USER: 'careeriq_user',
  CANDIDATE: 'careeriq_candidate',
  APPLICATIONS: 'careeriq_applications',
  SAVED_JOBS: 'careeriq_saved_jobs',
  ROADMAP_TASKS: 'careeriq_roadmap_tasks',
  ROADMAP_STATUSES: 'careeriq_roadmap_statuses',
  CUSTOM_TASKS: 'careeriq_custom_tasks',
  CHAT_HISTORY: 'careeriq_chat',
  ONBOARDING_DONE: 'careeriq_onboarded',
  RESUME_ANALYSIS: 'careeriq_resume_analysis',
  SKILL_OVERRIDES: 'careeriq_skill_overrides',
  NOTIFICATIONS: 'careeriq_notifications',
} as const;

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export const storage = {
  // User session & Token
  getUser: () => safeGet<{ name: string; email: string } | null>(KEYS.USER, null),
  setUser: (user: { name: string; email: string }) => safeSet(KEYS.USER, user),
  clearUser: () => {
    localStorage.removeItem(KEYS.USER);
    localStorage.removeItem('careeriq_access_token');
  },
  getToken: () => localStorage.getItem('careeriq_access_token'),
  setToken: (token: string) => localStorage.setItem('careeriq_access_token', token),

  // Candidate profile overrides
  getCandidateOverrides: () => safeGet<Partial<Record<string, unknown>>>(KEYS.CANDIDATE, {}),
  setCandidateOverrides: (data: Partial<Record<string, unknown>>) => safeSet(KEYS.CANDIDATE, data),

  // Applications
  getApplications: <T>() => safeGet<T[]>(KEYS.APPLICATIONS, []),
  setApplications: <T>(apps: T[]) => safeSet(KEYS.APPLICATIONS, apps),

  // Saved jobs
  getSavedJobs: () => safeGet<string[]>(KEYS.SAVED_JOBS, []),
  setSavedJobs: (ids: string[]) => safeSet(KEYS.SAVED_JOBS, ids),

  // Roadmap tasks
  getRoadmapTasks: <T>() => safeGet<T[]>(KEYS.ROADMAP_TASKS, []),
  setRoadmapTasks: <T>(tasks: T[]) => safeSet(KEYS.ROADMAP_TASKS, tasks),

  // Chat history
  getChatHistory: <T>() => safeGet<T[]>(KEYS.CHAT_HISTORY, []),
  setChatHistory: <T>(msgs: T[]) => safeSet(KEYS.CHAT_HISTORY, msgs),
  clearChatHistory: () => localStorage.removeItem(KEYS.CHAT_HISTORY),

  // Onboarding
  isOnboarded: () => safeGet<boolean>(KEYS.ONBOARDING_DONE, false),
  setOnboarded: (val: boolean) => safeSet(KEYS.ONBOARDING_DONE, val),

  // Resume analysis cache
  getResumeAnalysis: <T>() => safeGet<T | null>(KEYS.RESUME_ANALYSIS, null),
  setResumeAnalysis: <T>(analysis: T) => safeSet(KEYS.RESUME_ANALYSIS, analysis),

  // Skill overrides (user-marked skills)
  getSkillOverrides: () => safeGet<string[]>(KEYS.SKILL_OVERRIDES, []),
  setSkillOverrides: (ids: string[]) => safeSet(KEYS.SKILL_OVERRIDES, ids),

  // Roadmap task statuses
  getRoadmapStatuses: () => safeGet<Record<string, string>>(KEYS.ROADMAP_STATUSES, {}),
  setRoadmapStatuses: (statuses: Record<string, string>) => safeSet(KEYS.ROADMAP_STATUSES, statuses),

  // Custom tasks
  getCustomTasks: <T>() => safeGet<T[]>(KEYS.CUSTOM_TASKS, []),
  setCustomTasks: <T>(tasks: T[]) => safeSet(KEYS.CUSTOM_TASKS, tasks),

  // Clear all demo data
  clearAll: () => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  },
};

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateString);
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}
