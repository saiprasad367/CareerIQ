import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Clock, Bookmark, BookmarkCheck, Filter, SlidersHorizontal, RefreshCw, Globe, AlertCircle } from 'lucide-react';
import { PageHeader, MatchScore, SkillBadge, EmptyState } from '@/components/shared';
import { storage } from '@/lib/storage';
import { api } from '@/services/api';
import { formatRelativeDate } from '@/lib/storage';
import { cn } from '@/lib/utils';

const ROLES = ['All Roles', 'Backend Developer', 'Full-Stack Developer', 'Machine Learning Engineer', 'Data Analyst', 'Cloud / DevOps Engineer', 'Software Engineer', 'QA Automation Engineer'];
const LOCATIONS = ['Any Location', 'Hyderabad', 'Bengaluru', 'Chennai', 'Gurugram', 'Pune', 'Remote'];
const WORK_MODES = ['Any', 'remote', 'hybrid', 'onsite'];
const EXP_LEVELS = ['Any', 'entry', 'mid', 'senior'];

export function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>(storage.getSavedJobs());
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All Roles');
  const [location, setLocation] = useState('Any Location');
  const [workMode, setWorkMode] = useState('Any');
  const [expLevel, setExpLevel] = useState('Any');
  const [minScore, setMinScore] = useState(0);
  const [sort, setSort] = useState<'score' | 'date'>('score');
  const [showFilters, setShowFilters] = useState(false);

  const fetchRemoteJobs = () => {
    if (storage.getToken()) {
      setJobsLoading(true);
      api.jobs.search({ page: 1, page_size: 50 }).then(res => {
        if (res && res.items && res.items.length > 0) {
          const mapped = res.items.map((j: any) => ({
            jobId: j.id,
            overallScore: Math.round(j.match_score ?? 75),
            matchedRequiredSkills: j.skills?.slice(0, 4) || j.matched_skills?.slice(0, 4) || [],
            missingRequiredSkills: j.skills?.slice(4, 6) || j.missing_skills?.slice(0, 2) || [],
            job: {
              id: j.id,
              title: j.title,
              company: j.company_name || j.company,
              location: j.location || 'Remote',
              workMode: j.work_mode || 'hybrid',
              experienceLevel: j.experience_level || 'entry',
              roleCategory: j.role_category || 'Software Engineer',
              postedDate: j.posted_at || new Date().toISOString(),
              salary: j.salary_min && j.salary_max
                ? `₹${Math.floor(j.salary_min / 100000)}L - ₹${Math.floor(j.salary_max / 100000)}L / yr`
                : j.salary_display || 'Competitive',
              sourceUrl: j.source_url || j.apply_url || null,
            }
          }));
          setJobs(mapped);
          setJobsError(null);
        } else {
          setJobs([]);
        }
      }).catch((err: any) => {
        setJobsError(err.message || 'Failed to load jobs.');
      }).finally(() => setJobsLoading(false));
    } else {
      setJobsLoading(false);
      setJobsError('Please log in to view job matches.');
    }
  };

  useEffect(() => {
    fetchRemoteJobs();
    if (storage.getToken()) {
      api.jobs.getSaved().then(remoteSaved => {
        if (Array.isArray(remoteSaved) && remoteSaved.length > 0) {
          const ids = remoteSaved.map((s: any) => s.job_id || s.id);
          setSaved(ids);
          storage.setSavedJobs(ids);
        }
      }).catch(() => {});
    }
  }, []);

  const allMatches = jobs;

  const filtered = useMemo(() => {
    let list = allMatches;
    if (search) list = list.filter(j =>
      j.job.title.toLowerCase().includes(search.toLowerCase()) ||
      j.job.company.toLowerCase().includes(search.toLowerCase())
    );
    if (role !== 'All Roles') list = list.filter(j => j.job.roleCategory === role);
    if (location !== 'Any Location') list = list.filter(j =>
      j.job.location.toLowerCase().includes(location.toLowerCase()) ||
      (location === 'Remote' && j.job.workMode === 'remote')
    );
    if (workMode !== 'Any') list = list.filter(j => j.job.workMode === workMode);
    if (expLevel !== 'Any') list = list.filter(j => j.job.experienceLevel === expLevel);
    if (minScore > 0) list = list.filter(j => j.overallScore >= minScore);
    if (sort === 'date') list = [...list].sort((a, b) =>
      new Date(b.job.postedDate).getTime() - new Date(a.job.postedDate).getTime()
    );
    return list;
  }, [allMatches, search, role, location, workMode, expLevel, minScore, sort]);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const updated = saved.includes(id) ? saved.filter(s => s !== id) : [...saved, id];
    setSaved(updated);
    storage.setSavedJobs(updated);
    if (storage.getToken()) {
      if (saved.includes(id)) {
        api.jobs.unsave(id).catch(() => {});
      } else {
        api.jobs.save(id).catch(() => {});
      }
    }
  };

  const handleSyncLive = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.jobs.syncLive(15);
      setSyncMessage(res.message || 'Live internet jobs synchronized successfully.');
      fetchRemoteJobs();
    } catch (err: any) {
      setSyncMessage('Failed to fetch live internet jobs.');
    } finally {
      setSyncing(false);
    }
  };

  const workModeLabel: Record<string, string> = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' };
  const expLabel: Record<string, string> = { entry: 'Entry-level', mid: 'Mid-level', senior: 'Senior' };

  return (
    <div className="max-w-content mx-auto space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Job Matches</h1>
          <p className="text-sm text-[#666666] mt-1">
            {jobsLoading ? 'Loading jobs…' : jobsError ? jobsError : `${filtered.length} verified tech openings scored by your candidate compatibility formula.`}
          </p>
        </div>
        <button
          onClick={handleSyncLive}
          disabled={syncing}
          className="btn-secondary text-xs flex items-center gap-1.5 self-start"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", syncing && "animate-spin")} />
          {syncing ? 'Syncing Live Jobs…' : 'Sync Live Jobs'}
        </button>
      </div>

      {syncMessage && (
        <div className="bg-[#E8F6EE] text-[#1a6b3a] text-xs px-3 py-2 rounded-lg flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Search + filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858585]" />
            <input className="input pl-9" placeholder="Search jobs or companies…" value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary sm:w-auto">
            <SlidersHorizontal className="w-4 h-4" />
            Filters {showFilters ? '▲' : '▼'}
          </button>
          <select className="input sm:w-36" value={sort} onChange={e => setSort(e.target.value as 'score' | 'date')}>
            <option value="score">By Match Score</option>
            <option value="date">By Date</option>
          </select>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-[#EAEAEA]">
            <select className="input text-xs" value={role} onChange={e => setRole(e.target.value)}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
            <select className="input text-xs" value={location} onChange={e => setLocation(e.target.value)}>
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>
            <select className="input text-xs" value={workMode} onChange={e => setWorkMode(e.target.value)}>
              {WORK_MODES.map(m => <option key={m}>{m === 'Any' ? 'Any work mode' : m}</option>)}
            </select>
            <select className="input text-xs" value={expLevel} onChange={e => setExpLevel(e.target.value)}>
              {EXP_LEVELS.map(l => <option key={l}>{l === 'Any' ? 'Any experience' : l}</option>)}
            </select>
            <div>
              <label className="text-xs text-[#858585] block mb-1">Min score: {minScore}%</label>
              <input type="range" min={0} max={90} step={10} value={minScore}
                onChange={e => setMinScore(+e.target.value)} className="w-full" />
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching jobs"
          description="Try adjusting your filters."
          action={<button onClick={() => { setSearch(''); setRole('All Roles'); setLocation('Any Location'); setWorkMode('Any'); setExpLevel('Any'); setMinScore(0); }} className="btn-secondary">Reset filters</button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(jm => (
            <Link key={jm.jobId} to={`/app/jobs/${jm.jobId}`} className="card p-4 md:p-5 card-hover block">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-[#111111]">{jm.job.title}</h3>
                    {saved.includes(jm.jobId) && <BookmarkCheck className="w-4 h-4 text-[#1a5fb4] flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-[#666666] mb-2">{jm.job.company}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-[#858585] mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{jm.job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{workModeLabel[jm.job.workMode]}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatRelativeDate(jm.job.postedDate)}</span>
                    <span className="badge-gray">{expLabel[jm.job.experienceLevel]}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {jm.matchedRequiredSkills.slice(0, 4).map((s: any) => <SkillBadge key={typeof s === 'string' ? s : s?.name} skill={typeof s === 'string' ? s : s?.name} variant="matched" size="sm" />)}
                    {jm.missingRequiredSkills.slice(0, 2).map((s: any) => <SkillBadge key={typeof s === 'string' ? s : s?.name} skill={typeof s === 'string' ? s : s?.name} variant="missing" size="sm" />)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <MatchScore score={jm.overallScore} size="sm" />
                  <button
                    onClick={e => toggleSave(jm.jobId, e)}
                    className="btn-ghost p-2"
                    aria-label={saved.includes(jm.jobId) ? 'Unsave job' : 'Save job'}
                  >
                    {saved.includes(jm.jobId)
                      ? <BookmarkCheck className="w-4 h-4 text-[#1a5fb4]" />
                      : <Bookmark className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
