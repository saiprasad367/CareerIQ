// ============================================================
// CareerIQ — Centralized Typed Backend API Client
// Connects React frontend directly to FastAPI REST Backend
// ============================================================

import { storage } from '@/lib/storage';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  code: string;
  statusCode: number;
  field?: string;

  constructor(message: string, statusCode: number, code: string = 'api_error', field?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('careeriq_access_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (res.status === 401) {
      // Clear token on authentication expiration
      localStorage.removeItem('careeriq_access_token');
    }

    if (!res.ok) {
      let errPayload: any = null;
      try {
        errPayload = await res.json();
      } catch {
        // Plain text error
      }
      const message = errPayload?.error?.message || errPayload?.detail || `Request failed with status ${res.status}`;
      const code = errPayload?.error?.code || 'error';
      const field = errPayload?.error?.field;
      throw new ApiError(message, res.status, code, field);
    }

    // Check if response is JSON or blob
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await res.json()) as T;
    }
    return (await res.text()) as unknown as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      err instanceof Error ? err.message : 'Network error connecting to backend service.',
      0,
      'network_error'
    );
  }
}

export const api = {
  // --- Auth ---
  auth: {
    register: async (payload: { email: string; password: string; full_name: string; role?: string }) => {
      const res = await request<{ access_token: string; email: string; full_name: string; user_id: string; onboarding_completed: boolean }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify(payload) }
      );
      if (res.access_token) {
        localStorage.setItem('careeriq_access_token', res.access_token);
        storage.setUser({ name: res.full_name, email: res.email });
      }
      return res;
    },
    login: async (payload: { email: string; password: string }) => {
      const res = await request<{ access_token: string; email: string; full_name: string; user_id: string; onboarding_completed: boolean }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify(payload) }
      );
      if (res.access_token) {
        localStorage.setItem('careeriq_access_token', res.access_token);
        storage.setUser({ name: res.full_name, email: res.email });
      }
      return res;
    },
    logout: async () => {
      try {
        await request('/auth/logout', { method: 'POST' });
      } finally {
        localStorage.removeItem('careeriq_access_token');
        storage.clearUser();
      }
    },
    getMe: () => request<{ id: string; email: string; role: string; full_name?: string; onboarding_completed: boolean }>('/auth/me'),
  },

  // --- Profile & Onboarding ---
  profile: {
    get: () => request<any>('/profile'),
    update: (data: any) => request<any>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
    getSkills: () => request<any[]>('/profile/skills'),
    addSkill: (data: { skill_name: string; proficiency?: string; evidence_source?: string }) =>
      request<any>('/profile/skills', { method: 'POST', body: JSON.stringify(data) }),
    deleteSkill: (skillId: string) => request<any>(`/profile/skills/${skillId}`, { method: 'DELETE' }),
    getEducation: () => request<any[]>('/profile/education'),
    addEducation: (data: any) => request<any>('/profile/education', { method: 'POST', body: JSON.stringify(data) }),
    getExperience: () => request<any[]>('/profile/experience'),
    addExperience: (data: any) => request<any>('/profile/experience', { method: 'POST', body: JSON.stringify(data) }),
    getProjects: () => request<any[]>('/profile/projects'),
    addProject: (data: any) => request<any>('/profile/projects', { method: 'POST', body: JSON.stringify(data) }),
  },

  onboarding: {
    getStatus: () => request<any>('/onboarding/status'),
    complete: (data: any) => request<any>('/onboarding/complete', { method: 'POST', body: JSON.stringify(data) }),
  },

  // --- Resumes & ATS ---
  resumes: {
    upload: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return request<any>('/resumes/upload', {
        method: 'POST',
        body: formData,
      });
    },
    getLatestAnalysis: () => request<any>('/resumes/latest/analysis'),
    optimize: (resumeId: string, payload: { target_role_title: string; target_job_description?: string }) =>
      request<any>(`/resumes/${resumeId}/optimize`, { method: 'POST', body: JSON.stringify(payload) }),
  },

  // --- Career Roles ---
  roles: {
    list: (category?: string) => request<any[]>(`/career-roles${category ? `?category=${category}` : ''}`),
    getRecommendations: () => request<any[]>('/career-roles/recommendations'),
    getGaps: (roleId: string) => request<any>(`/career-roles/${roleId}/gaps`),
  },

  // --- Jobs ---
  jobs: {
    search: (params?: Record<string, any>) => {
      const query = params ? new URLSearchParams(params as any).toString() : '';
      return request<any>(`/jobs${query ? `?${query}` : ''}`);
    },
    getRecommendations: () => request<any[]>('/jobs/recommendations'),
    getMatch: (jobId: string) => request<any>(`/jobs/${jobId}/match`),
    getSaved: () => request<any[]>('/jobs/saved'),
    save: (jobId: string) => request<any>(`/jobs/${jobId}/save`, { method: 'POST' }),
    unsave: (jobId: string) => request<any>(`/jobs/${jobId}/save`, { method: 'DELETE' }),
    syncLive: (limit: number = 20) => request<any>(`/jobs/sync-live?limit=${limit}`, { method: 'POST' }),
  },

  // --- Skills ---
  skills: {
    taxonomy: () => request<any[]>('/skills/taxonomy'),
    search: (q: string) => request<any[]>(`/skills/search?q=${encodeURIComponent(q)}`),
    normalize: (rawSkills: string[]) => request<any>('/skills/normalize', { method: 'POST', body: JSON.stringify({ raw_skills: rawSkills }) }),
    markLearned: (skillId: string) => request<any>(`/skills/${skillId}/mark-learned`, { method: 'POST' }),
  },

  // --- Roadmap ---
  roadmap: {
    get: () => request<any>('/roadmap'),
    generate: (roleId?: string) => request<any>(`/roadmap/generate${roleId ? `?role_id=${roleId}` : ''}`, { method: 'POST' }),
    updateStatus: (taskId: string, status: string) =>
      request<any>(`/roadmap/tasks/${taskId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    createTask: (task: any) => request<any>('/roadmap/tasks', { method: 'POST', body: JSON.stringify(task) }),
    deleteTask: (taskId: string) => request<any>(`/roadmap/tasks/${taskId}`, { method: 'DELETE' }),
    getResources: (skill?: string) => request<any[]>(`/roadmap/resources${skill ? `?skill=${skill}` : ''}`),
    getProjectTemplates: () => request<any[]>('/roadmap/project-templates'),
  },

  // --- Applications ---
  applications: {
    list: () => request<any[]>('/applications'),
    create: (app: any) => request<any>('/applications', { method: 'POST', body: JSON.stringify(app) }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    delete: (id: string) => request<any>(`/applications/${id}`, { method: 'DELETE' }),
  },

  // --- Assistant ---
  assistant: {
    getSessions: () => request<any[]>('/assistant/sessions'),
    chat: (message: string, sessionId?: string) =>
      request<any>('/assistant/chat', { method: 'POST', body: JSON.stringify({ message, session_id: sessionId }) }),
    deleteSession: (sessionId: string) => request<any>(`/assistant/sessions/${sessionId}`, { method: 'DELETE' }),
  },

  // --- Reports ---
  reports: {
    list: () => request<any[]>('/reports'),
    generate: (data: { report_type?: string; title?: string }) =>
      request<any>('/reports', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => request<any>(`/reports/${id}`),
    exportUrl: (id: string) => `${API_BASE_URL}/reports/${id}/export`,
  },

  // --- Settings ---
  settings: {
    get: () => request<any>('/settings'),
    update: (data: any) => request<any>('/settings', { method: 'PATCH', body: JSON.stringify(data) }),
    exportData: () => request<any>('/settings/privacy/data-export'),
    deleteAccount: () => request<any>('/settings/privacy/account', { method: 'DELETE' }),
  },
};
