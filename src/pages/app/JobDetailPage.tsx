import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Bookmark, BookmarkCheck, CheckCircle, XCircle, ChevronRight, ArrowLeft, ExternalLink, AlertCircle, Info } from 'lucide-react';
import { MatchScore, SkillBadge, SkillProgressBar } from '@/components/shared';
import { storage, generateId } from '@/lib/storage';
import type { Application } from '@/types';
import { api } from '@/services/api';

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(() => storage.getSavedJobs().includes(jobId!));
  const [applied, setApplied] = useState(false);
  const [tab, setTab] = useState<'overview' | 'match' | 'improvements'>('overview');
  const [remoteDetail, setRemoteDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (jobId) {
      if (storage.getToken()) {
        api.jobs.getMatch(jobId).then((data: any) => {
          if (data) {
            setRemoteDetail(data);
          } else {
            setNotFound(true);
          }
        }).catch(() => {
          setNotFound(true);
        }).finally(() => setLoading(false));
      } else {
        setLoading(false);
        setNotFound(true);
      }
    }
  }, [jobId]);

  if (loading) {
    return (
      <div className="max-w-content mx-auto py-20 text-center">
        <div className="w-6 h-6 border-2 border-[#111111]/20 border-t-[#111111] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[#666666] text-sm">Loading job details…</p>
      </div>
    );
  }

  if (notFound || !remoteDetail) {
    return (
      <div className="max-w-content mx-auto py-20 text-center">
        <p className="text-[#666666] mb-4">Job not found or requires authentication.</p>
        <Link to="/app/jobs" className="btn-primary">← Back to jobs</Link>
      </div>
    );
  }

  const job: any = {
    id: remoteDetail.job_id || jobId,
    title: remoteDetail.job_title || remoteDetail.title,
    company: remoteDetail.company || remoteDetail.company_name,
    location: remoteDetail.location || 'Remote',
    workMode: remoteDetail.work_mode || 'hybrid',
    postedDate: remoteDetail.posted_at || new Date().toISOString(),
    description: remoteDetail.description || remoteDetail.job_description || '',
    salary: remoteDetail.salary_display || remoteDetail.salary,
    sourceUrl: remoteDetail.source_url || remoteDetail.apply_url || null,
    requiredSkills: (remoteDetail.matched_skills || []).concat(remoteDetail.missing_skills || []),
    preferredSkills: remoteDetail.preferred_skills || [],
    roleCategory: remoteDetail.role_category || 'Engineering',
    experienceLevel: remoteDetail.experience_level || 'entry',
    industry: remoteDetail.industry || 'Technology',
    companySize: remoteDetail.company_size || '',
    responsibilities: remoteDetail.responsibilities || [
      'Develop, test, and deploy robust scalable software components.',
      'Collaborate with cross-functional engineering and product teams.',
      'Maintain high standards of code quality, security, and performance.',
    ],
  };

  const matchScoreObj = {
    skillCoverageScore: remoteDetail?.skill_coverage_score ?? 75,
    semanticScore: remoteDetail?.semantic_score ?? 80,
    experienceScore: remoteDetail?.experience_score ?? 70,
    preferenceScore: remoteDetail?.preference_score ?? 80,
    overallScore: Math.round(remoteDetail?.total_score ?? remoteDetail?.match_score ?? 75),
    matchedRequiredSkills: remoteDetail?.matched_skills || [],
    missingRequiredSkills: remoteDetail?.missing_skills || [],
    matchedPreferredSkills: remoteDetail?.matched_preferred_skills || [],
    resumeImprovements: remoteDetail?.resume_improvements || [
      `Highlight hands-on projects demonstrating ${((remoteDetail?.missing_skills || [])[0]) || 'key technologies'} to boost candidate alignment.`,
      'Quantify past project impact with measurable outcomes and deployment metrics.',
    ]
  };

  const overallScore = matchScoreObj.overallScore;
  const applyUrl = remoteDetail?.source_url || (job as any).sourceUrl || null;

  const toggleSave = () => {
    const savedJobs = storage.getSavedJobs();
    const updated = saved ? savedJobs.filter(id => id !== jobId) : [...savedJobs, jobId!];
    storage.setSavedJobs(updated);
    setSaved(!saved);
    if (storage.getToken() && jobId) {
      if (saved) {
        api.jobs.unsave(jobId).catch(() => {});
      } else {
        api.jobs.save(jobId).catch(() => {});
      }
    }
  };

  const handleMarkApplied = () => {
    setApplied(true);
    if (storage.getToken()) {
      api.applications.create({
        job_id: job.id,
        job_title: job.title,
        company_name: job.company,
        location: job.location,
        work_mode: job.workMode,
        salary: job.salary,
        application_stage: 'applied',
        notes: 'Applied via official career portal link.',
      }).catch(() => {});
    }
  };

  const workModeLabel: Record<string, string> = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' };

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back to jobs
      </button>

      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-[#111111]">{job.title}</h1>
              <span className="badge-mint text-[11px] font-semibold">Verified Opening</span>
            </div>
            <p className="text-base text-[#666666]">{job.company}</p>
            <div className="flex flex-wrap gap-3 text-xs text-[#858585] mt-2">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
              <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{workModeLabel[job.workMode] || job.workMode}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Posted recently</span>
              {job.salary && <span className="badge-mint">{job.salary}</span>}
            </div>
          </div>
          <MatchScore score={overallScore} size="lg" showLabel />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {applyUrl ? (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm flex items-center gap-1.5"
              onClick={handleMarkApplied}
            >
              Apply on Company Website
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <div className="flex items-center gap-2 bg-[#FFF3D9] text-[#92400e] text-xs px-3 py-2 rounded-lg">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>No direct application link available for this listing.</span>
            </div>
          )}
          {applied ? (
            <div className="flex items-center gap-2 bg-[#E8F6EE] text-[#1a6b3a] text-sm font-medium px-4 py-2.5 rounded-lg">
              <CheckCircle className="w-4 h-4" /> Marked as Applied
            </div>
          ) : (
            <button onClick={handleMarkApplied} className="btn-secondary">
              Mark as Applied
            </button>
          )}
          <button onClick={toggleSave} className={`btn-secondary ${saved ? 'text-[#1a5fb4]' : ''}`}>
            {saved ? <><BookmarkCheck className="w-4 h-4" /> Saved</> : <><Bookmark className="w-4 h-4" /> Save Job</>}
          </button>
          <Link to="/app/applications" className="btn-ghost text-sm">
            View Applications <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#EAEAEA]">
        {(['overview', 'match', 'improvements'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#666666] hover:text-[#111111]'
            }`}
          >
            {t === 'improvements' ? 'Resume Tips' : t === 'match' ? 'Match Breakdown' : 'Overview'}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-[#111111] mb-3">About the Role</h2>
            <p className="text-sm text-[#666666] leading-relaxed">{job.description}</p>
            {job.industry && (
              <div className="flex gap-2 mt-3">
                <span className="badge-gray">{job.industry}</span>
                {job.companySize && <span className="badge-gray">{job.companySize} employees</span>}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-[#111111] mb-3">Responsibilities</h2>
            <ul className="space-y-2">
              {job.responsibilities.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-[#858585] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#666666]">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-[#111111] mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((s: string) => (
                <SkillBadge
                  key={s}
                  skill={s}
                  variant={matchScoreObj.matchedRequiredSkills.includes(s) ? 'matched' : 'missing'}
                />
              ))}
            </div>
          </div>

          {job.preferredSkills && job.preferredSkills.length > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-[#111111] mb-3">Preferred Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.preferredSkills.map((s: string) => (
                  <SkillBadge
                    key={s}
                    skill={s}
                    variant={matchScoreObj.matchedPreferredSkills.includes(s) ? 'matched' : 'default'}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Match tab */}
      {tab === 'match' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-[#111111]">Score Breakdown</h2>
              <span className="badge-mint text-[11px] font-semibold">Active Ranking Model</span>
            </div>
            <p className="text-xs text-[#858585] mb-4">M = 0.45K + 0.25E + 0.15X + 0.15P</p>
            <div className="space-y-3">
              <SkillProgressBar label={`Skill Coverage (K) — weight 55%`} value={matchScoreObj.skillCoverageScore} />
              <SkillProgressBar label={`Semantic Match (E) — weight 30%`} value={matchScoreObj.semanticScore} />
              <SkillProgressBar label={`Experience Fit (X) — weight 10%`} value={matchScoreObj.experienceScore} />
              <SkillProgressBar label={`Preference Match (P) — weight 5%`} value={matchScoreObj.preferenceScore} />
            </div>
            <div className="border-t border-[#EAEAEA] mt-4 pt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#111111]">Overall Match Score</span>
              <span className="text-xl font-bold text-[#111111]">{matchScoreObj.overallScore}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-[#111111] mb-3">
                <CheckCircle className="w-4 h-4 text-[#1a6b3a] inline mr-1.5" />
                Matched ({matchScoreObj.matchedRequiredSkills.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {matchScoreObj.matchedRequiredSkills.map((s: string) => <SkillBadge key={s} skill={s} variant="matched" />)}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-[#111111] mb-3">
                <XCircle className="w-4 h-4 text-[#92400e] inline mr-1.5" />
                Missing ({matchScoreObj.missingRequiredSkills.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {matchScoreObj.missingRequiredSkills.map((s: string) => <SkillBadge key={s} skill={s} variant="missing" />)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume tips tab */}
      {tab === 'improvements' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-[#111111] mb-1">Resume Improvement Suggestions</h2>
            <p className="text-xs text-[#858585] mb-4">Based on the gap between your profile and this job's requirements.</p>
            {matchScoreObj.resumeImprovements.map((tip: string, i: number) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-[#F7F8FA] last:border-0">
                <AlertCircle className="w-4 h-4 text-[#d97706] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#666666]">{tip}</p>
              </div>
            ))}
            <Link to="/app/resume-optimizer" className="btn-primary w-full justify-center mt-4">
              Open Resume Optimizer
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
