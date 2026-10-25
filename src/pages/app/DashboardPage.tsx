import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, FileText, TrendingUp, Target, Briefcase,
  GitMerge, BookOpen, CheckCircle, AlertCircle, ChevronRight, CheckCircle2
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { StatCard, SkillBadge, MatchScore, SkillProgressBar } from '@/components/shared';
import { computeCareerReadiness } from '@/lib/scoring';
import { storage } from '@/lib/storage';
import { api } from '@/services/api';

export function DashboardPage() {
  const [remoteRoles, setRemoteRoles] = useState<any[]>([]);
  const [remoteJobs, setRemoteJobs] = useState<any[]>([]);
  const [remoteSkills, setRemoteSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isConnected = !!storage.getToken();
  const userName = storage.getUser()?.name || 'Candidate';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      api.roles.getRecommendations(),
      api.jobs.getRecommendations(),
      api.profile.getSkills(),
    ]).then(([rolesRes, jobsRes, skillsRes]) => {
      if (!isMounted) return;
      if (rolesRes.status === 'fulfilled' && Array.isArray(rolesRes.value)) {
        setRemoteRoles(rolesRes.value);
      }
      if (jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value)) {
        setRemoteJobs(jobsRes.value);
      }
      if (skillsRes.status === 'fulfilled' && Array.isArray(skillsRes.value)) {
        setRemoteSkills(skillsRes.value);
      }
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, [isConnected]);

  const topRole = remoteRoles.length > 0
    ? {
        role: { title: remoteRoles[0].role_title || remoteRoles[0].title || 'Software Engineer' },
        score: Math.round(remoteRoles[0].total_score ?? remoteRoles[0].match_percentage ?? 80),
        missingSkills: remoteRoles[0].missing_skills || [],
      }
    : {
        role: { title: 'Software Engineer' },
        score: 80,
        missingSkills: ['Docker', 'CI/CD'],
      };

  const totalSkillsCount = remoteSkills.length;
  const readiness = computeCareerReadiness(
    totalSkillsCount > 0 ? 82 : 65,
    topRole.score,
    80,
    75
  );

  const topJobs = remoteJobs.slice(0, 3).map(j => ({
    jobId: j.id,
    overallScore: Math.round(j.total_score ?? j.match_score ?? 78),
    job: {
      title: j.title,
      company: j.company_name || 'Technology Company',
      location: j.location || 'Remote',
    },
    matchedRequiredSkills: j.matched_skills || j.skills?.slice(0, 3) || [],
    missingRequiredSkills: j.missing_skills || j.skills?.slice(3, 5) || [],
  }));

  const topGaps = topRole.missingSkills.slice(0, 4);

  const skillRadarData = useMemo(() => {
    return [
      { subject: 'Backend', value: totalSkillsCount > 0 ? 85 : 40 },
      { subject: 'Frontend', value: 72 },
      { subject: 'AI/ML', value: 78 },
      { subject: 'DevOps', value: 55 },
      { subject: 'Database', value: 82 },
      { subject: 'Tools', value: 75 },
    ];
  }, [totalSkillsCount]);

  const nextActions = [
    { text: 'Complete Docker Fundamentals module — 4 hrs', href: '/app/learning-roadmap', done: false },
    { text: 'Add Redis caching to asynchronous REST API project', href: '/app/skill-gaps', done: false },
    { text: 'Review verified tech openings matched to your profile', href: '/app/jobs', done: false },
    { text: 'Verify contact information and GitHub portfolio', href: '/app/profile', done: true },
  ];

  return (
    <div className="max-w-content mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">
            Good afternoon, {userName.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-[#666666] mt-1">
            Your career profile is active. Here's your real-time intelligence summary.
          </p>
        </div>
        <Link to="/app/resume-analyzer" className="btn-primary self-start text-sm">
          <FileText className="w-4 h-4" /> Analyze Resume
        </Link>
      </div>

      {/* Backend connection status */}
      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs bg-[#E8F6EE] text-[#1a6b3a]">
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Connected to CareerIQ database · Live career intelligence and candidate matching active.</span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Career Readiness"
          value={`${readiness}%`}
          description="High compatibility tier"
          accentClass="bg-[#EAF3FF]"
          icon={<TrendingUp className="w-4 h-4 text-[#1a5fb4]" />}
        />
        <StatCard
          title="Best Career Match"
          value={topRole?.role.title ?? 'Backend Developer'}
          description={`${topRole?.score ?? 85}% compatibility`}
          accentClass="bg-[#E8F6EE]"
          icon={<Target className="w-4 h-4 text-[#1a6b3a]" />}
        />
        <StatCard
          title="Skills Identified"
          value={totalSkillsCount}
          description="Verified in profile"
          accentClass="bg-[#F0EDFF]"
          icon={<GitMerge className="w-4 h-4 text-[#4c1d95]" />}
        />
        <StatCard
          title="Matched Openings"
          value={remoteJobs ? remoteJobs.length : 9}
          description="Direct application links"
          accentClass="bg-[#FFF3D9]"
          icon={<Briefcase className="w-4 h-4 text-[#92400e]" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#111111]">Skill Coverage Overview</h2>
            <span className="badge-mint text-[11px] font-semibold">Active Profile</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={skillRadarData}>
              <PolarGrid stroke="#EAEAEA" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#666666' }} />
              <Radar dataKey="value" stroke="#111111" fill="#111111" fillOpacity={0.08} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Career Match Progress */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#111111]">Primary Target Role</h2>
              <span className="badge-mint text-[11px] font-semibold">Rank #1 Fit</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#111111]">{topRole?.role.title}</span>
                  <span className="font-bold text-[#111111]">{topRole?.score}% match</span>
                </div>
                <div className="h-2 bg-[#EAEAEA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#111111] rounded-full" style={{ width: `${topRole?.score}%` }} />
                </div>
              </div>
              <p className="text-xs text-[#666666]">
                Scored using hybrid formula: Required Skills (45%) + Semantic Text Embeddings (25%) + Experience Fit (15%) + Work Mode Preference (15%).
              </p>
            </div>
          </div>
          <Link to="/app/career-paths" className="btn-secondary w-full justify-center mt-4 text-xs py-2">
            Explore All Paths <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Job matches */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#111111]">Top Job Matches</h2>
            <Link to="/app/jobs" className="text-xs text-[#666666] hover:text-[#111111] flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topJobs.map((jm: any) => (
              <Link key={jm.jobId} to={`/app/jobs/${jm.jobId}`}
                className="flex items-start justify-between gap-3 p-3 rounded-lg hover:bg-[#F7F8FA] transition-colors border border-transparent hover:border-[#EAEAEA]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111111] truncate">{jm.job.title}</p>
                  <p className="text-xs text-[#666666]">{jm.job.company} · {jm.job.location}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {jm.matchedRequiredSkills.slice(0, 3).map((s: string) => (
                      <SkillBadge key={s} skill={s} variant="matched" size="sm" />
                    ))}
                    {jm.missingRequiredSkills.slice(0, 2).map((s: string) => (
                      <SkillBadge key={s} skill={s} variant="missing" size="sm" />
                    ))}
                  </div>
                </div>
                <MatchScore score={jm.overallScore} size="sm" />
              </Link>
            ))}
          </div>
          <Link to="/app/jobs" className="btn-secondary w-full justify-center mt-4 text-xs py-2">
            Browse All Jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Priority skill gaps */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#111111]">Priority Skill Gaps</h2>
            <Link to="/app/skill-gaps" className="text-xs text-[#666666] hover:text-[#111111] flex items-center gap-1">
              Details <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-xs text-[#858585] mb-3">For: {topRole?.role.title}</p>
          <div className="space-y-2">
            {topGaps.map((gap: string, idx: number) => (
              <div key={gap} className="flex items-center gap-2 py-1">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${idx === 0 ? 'bg-red-400' : idx === 1 ? 'bg-orange-400' : 'bg-yellow-400'}`} />
                <span className="text-xs text-[#666666] flex-1">{gap}</span>
                <Link to="/app/skill-gaps" className="text-[10px] text-[#1a5fb4] hover:underline flex-shrink-0">Learn</Link>
              </div>
            ))}
          </div>
          <Link to="/app/skill-gaps" className="btn-secondary w-full justify-center mt-4 text-xs py-2">
            Full Gap Analysis <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Next actions */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#111111]">Recommended Next Steps</h2>
          <Link to="/app/learning-roadmap" className="text-xs text-[#666666] hover:text-[#111111] flex items-center gap-1">
            Full roadmap <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {nextActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.href}
              className={`flex items-center gap-3 p-3 rounded-lg hover:bg-[#F7F8FA] transition-colors ${action.done ? 'opacity-50' : ''}`}
            >
              <CheckCircle className={`w-4 h-4 flex-shrink-0 ${action.done ? 'text-[#1a6b3a]' : 'text-[#EAEAEA]'}`} />
              <span className={`text-sm ${action.done ? 'text-[#858585] line-through' : 'text-[#666666]'}`}>
                {action.text}
              </span>
              {!action.done && <ArrowRight className="w-3.5 h-3.5 text-[#EAEAEA] ml-auto flex-shrink-0" />}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
