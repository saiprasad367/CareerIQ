import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, ChevronDown, Star, GitCompare, X, Check } from 'lucide-react';
import { PageHeader, MatchScore, SkillBadge, EmptyState } from '@/components/shared';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { storage } from '@/lib/storage';

const categories = ['All', 'Engineering', 'AI & Machine Learning', 'Data & Analytics', 'Infrastructure & DevOps', 'Quality Assurance'];

export function CareerPathsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [projectTemplates, setProjectTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      api.roles.getRecommendations(),
      api.roles.list(),
      api.roadmap.getResources(),
      api.roadmap.getProjectTemplates(),
    ]).then(([recRes, listRes, resRes, projRes]) => {
      if (!isMounted) return;

      if (resRes.status === 'fulfilled' && Array.isArray(resRes.value)) {
        setResources(resRes.value);
      }
      if (projRes.status === 'fulfilled' && Array.isArray(projRes.value)) {
        setProjectTemplates(projRes.value);
      }

      if (recRes.status === 'fulfilled' && Array.isArray(recRes.value) && recRes.value.length > 0) {
        const mapped = recRes.value.map((r: any) => ({
          role: {
            id: r.role_id,
            title: r.role_title,
            category: r.category || 'Engineering',
            description: r.description || `${r.role_title} specialization focusing on scalable development and industry best practices.`,
            averageSalary: r.average_salary || '₹12,00,000 / yr',
            growthOutlook: r.growth_outlook || 'high',
            marketDemand: r.market_demand || 'High',
            requiredSkills: (r.matched_skills || []).concat(r.missing_skills || []),
            skillWeights: {},
          },
          score: Math.round(r.total_score ?? 75),
          fitScore: Math.round(r.total_score ?? 75),
          matchedSkills: r.matched_skills || [],
          missingSkills: r.missing_skills || [],
          criticalMissingSkills: (r.missing_skills || []).slice(0, 3),
          suitabilityReason: `Matched ${(r.matched_skills || []).length} verified skills with high market demand.`,
        }));
        setRecommendations(mapped);
      } else if (listRes.status === 'fulfilled' && Array.isArray(listRes.value) && listRes.value.length > 0) {
        const mapped = listRes.value.map((r: any) => ({
          role: {
            id: r.id,
            title: r.title,
            category: r.category || 'Engineering',
            description: r.description || '',
            averageSalary: '₹12,00,000 / yr',
            growthOutlook: 'high',
            marketDemand: 'High',
            requiredSkills: (r.skills || []).map((s: any) => s.skill_name || s),
            skillWeights: {},
          },
          score: 80,
          fitScore: 80,
          matchedSkills: (r.skills || []).slice(0, 3).map((s: any) => s.skill_name || s),
          missingSkills: (r.skills || []).slice(3).map((s: any) => s.skill_name || s),
          criticalMissingSkills: (r.skills || []).slice(3, 5).map((s: any) => s.skill_name || s),
          suitabilityReason: 'Direct career track opportunity aligned with modern engineering requirements.',
        }));
        setRecommendations(mapped);
      }
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<'score' | 'title'>('score');
  const [selected, setSelected] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const filtered = useMemo(() => {
    let list = recommendations;
    if (search) list = list.filter(r => r.role.title.toLowerCase().includes(search.toLowerCase()));
    if (category !== 'All') list = list.filter(r => r.role.category === category);
    if (sort === 'title') list = [...list].sort((a, b) => a.role.title.localeCompare(b.role.title));
    return list;
  }, [recommendations, search, category, sort]);

  const toggleCompare = (id: string) => {
    setCompareIds(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : ids.length < 3 ? [...ids, id] : ids
    );
  };

  const selectedRec = selected ? recommendations.find(r => r.role.id === selected) : null;
  const compareRecs = compareIds.map(id => recommendations.find(r => r.role.id === id)).filter(Boolean) as typeof recommendations;

  const growthColor = (g?: string) => {
    if (g === 'very-high') return 'badge-mint';
    if (g === 'high') return 'badge-blue';
    if (g === 'moderate') return 'badge-amber';
    return 'badge-gray';
  };

  if (showCompare && compareRecs.length >= 2) {
    return (
      <div className="max-w-content mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Role Comparison</h1>
          <button onClick={() => setShowCompare(false)} className="btn-secondary">
            <X className="w-4 h-4" /> Close Comparison
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#EAEAEA]">
                <th className="text-left py-3 pr-4 text-xs font-semibold text-[#858585] uppercase w-40">Attribute</th>
                {compareRecs.map(rec => (
                  <th key={rec.role.id} className="text-left py-3 px-3 text-sm font-semibold text-[#111111]">
                    {rec.role.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              <tr>
                <td className="py-3 pr-4 text-xs text-[#858585]">Match Score</td>
                {compareRecs.map(rec => <td key={rec.role.id} className="py-3 px-3"><MatchScore score={rec.score} size="sm" /></td>)}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-xs text-[#858585]">Category</td>
                {compareRecs.map(rec => <td key={rec.role.id} className="py-3 px-3 text-sm text-[#666666]">{rec.role.category}</td>)}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-xs text-[#858585]">Growth Outlook</td>
                {compareRecs.map(rec => (
                  <td key={rec.role.id} className="py-3 px-3">
                    <span className={growthColor(rec.role.growthOutlook)}>{rec.role.growthOutlook?.replace('-', ' ')}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-xs text-[#858585]">Avg Salary (India)</td>
                {compareRecs.map(rec => <td key={rec.role.id} className="py-3 px-3 text-sm text-[#666666]">{rec.role.avgSalaryINR ?? '—'}</td>)}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-xs text-[#858585]">Matched Skills</td>
                {compareRecs.map(rec => (
                  <td key={rec.role.id} className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {rec.matchedSkills.slice(0, 3).map((s: string) => <SkillBadge key={s} skill={s} variant="matched" size="sm" />)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-xs text-[#858585]">Missing Skills</td>
                {compareRecs.map(rec => (
                  <td key={rec.role.id} className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {rec.missingSkills.slice(0, 3).map((s: string) => <SkillBadge key={s} skill={s} variant="missing" size="sm" />)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-xs text-[#858585]">Required Skills</td>
                {compareRecs.map(rec => (
                  <td key={rec.role.id} className="py-3 px-3 text-sm text-[#666666]">
                    {rec.role.requiredSkills.length} required
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (selected && selectedRec) {
    const role = selectedRec.role;
    const relatedCourses = resources.filter(c =>
      (c.skills_covered || c.skillsCovered || []).some((s: string) => selectedRec.missingSkills.includes(s))
    ).slice(0, 3);
    const relatedProjects = projectTemplates.filter(p =>
      (p.skills_covered || p.skillsCovered || []).some((s: string) => selectedRec.missingSkills.includes(s))
    ).slice(0, 3);

    return (
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <button onClick={() => setSelected(null)} className="btn-ghost text-sm -ml-2">
          ← Back to all roles
        </button>
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <span className="badge-blue mb-2 inline-block">{role.category}</span>
              <h1 className="text-2xl font-bold text-[#111111]">{role.title}</h1>
              <p className="text-sm text-[#666666] mt-1">{role.description}</p>
            </div>
            <MatchScore score={selectedRec.score} size="lg" showLabel />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-[#F7F8FA] rounded-lg p-3 text-center">
              <p className="text-xs text-[#858585]">Growth</p>
              <p className="text-sm font-semibold text-[#111111] capitalize mt-0.5">{role.growthOutlook?.replace('-', ' ')}</p>
            </div>
            <div className="bg-[#F7F8FA] rounded-lg p-3 text-center">
              <p className="text-xs text-[#858585]">Avg Salary</p>
              <p className="text-sm font-semibold text-[#111111] mt-0.5">{role.avgSalaryINR ?? '—'}</p>
            </div>
            <div className="bg-[#F7F8FA] rounded-lg p-3 text-center">
              <p className="text-xs text-[#858585]">Experience</p>
              <p className="text-sm font-semibold text-[#111111] mt-0.5">{role.typicalExperience}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[#111111] mb-3">Your Strengths</h3>
            <div className="flex flex-wrap gap-2">
              {selectedRec.matchedSkills.map((s: string) => <SkillBadge key={s} skill={s} variant="matched" />)}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[#111111] mb-3">Skill Gaps ({selectedRec.missingSkills.length})</h3>
            <div className="flex flex-wrap gap-2">
              {selectedRec.missingSkills.map((s: string) => <SkillBadge key={s} skill={s} variant="missing" />)}
            </div>
          </div>
        </div>

        {relatedCourses.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[#111111] mb-3">Recommended Learning</h3>
            <div className="space-y-3">
              {relatedCourses.map((c: any) => (
                <div key={c.id} className="flex items-start justify-between gap-3 p-3 bg-[#F7F8FA] rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-[#111111]">{c.title}</p>
                    <p className="text-xs text-[#666666]">{c.provider} · {c.estimated_hours || c.estimatedHours || 4}h</p>
                    <div className="flex gap-1 mt-1">{(c.skills_covered || c.skillsCovered || []).slice(0,2).map((s: string) => <SkillBadge key={s} skill={s} size="sm" />)}</div>
                  </div>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0">
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedProjects.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[#111111] mb-3">Suggested Projects</h3>
            <div className="space-y-3">
              {relatedProjects.map(p => (
                <div key={p.id} className="p-3 bg-[#F7F8FA] rounded-lg">
                  <p className="text-sm font-medium text-[#111111]">{p.title}</p>
                  <p className="text-xs text-[#666666] mt-1">{p.description}</p>
                  <p className="text-xs text-[#858585] mt-1">{p.difficulty} · ~{p.estimatedHours}h</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link to="/app/jobs" className="btn-primary w-full justify-center">
          View Matching Jobs <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Career Paths"
        description="Explore technology career roles and see how well each fits your current profile."
        badge="Active Roles & Fit Ranking"
        actions={
          compareIds.length >= 2 ? (
            <button onClick={() => setShowCompare(true)} className="btn-primary text-sm">
              <GitCompare className="w-4 h-4" /> Compare ({compareIds.length})
            </button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858585]" />
          <input
            className="input pl-9"
            placeholder="Search roles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="input w-auto" value={sort} onChange={e => setSort(e.target.value as 'score' | 'title')}>
          <option value="score">Sort by Match</option>
          <option value="title">Sort by Name</option>
        </select>
      </div>

      {compareIds.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#858585]">Comparing:</span>
          {compareIds.map(id => {
            const rec = recommendations.find(r => r.role.id === id);
            return (
              <span key={id} className="flex items-center gap-1 badge-blue">
                {rec?.role.title}
                <button onClick={() => toggleCompare(id)}><X className="w-3 h-3" /></button>
              </span>
            );
          })}
          {compareIds.length >= 2 && (
            <button onClick={() => setShowCompare(true)} className="btn-primary text-xs py-1 px-3">
              Compare <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Role cards */}
      {filtered.length === 0 ? (
        <EmptyState title="No roles found" description="Try a different search term or category." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(rec => (
            <div key={rec.role.id} className="card p-5 card-hover flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <span className={cn('badge mb-2 inline-block', growthColor(rec.role.growthOutlook) as string)}>
                    {rec.role.growthOutlook?.replace('-', ' ')} demand
                  </span>
                  <h3 className="text-base font-semibold text-[#111111] leading-snug">{rec.role.title}</h3>
                  <p className="text-xs text-[#858585]">{rec.role.category}</p>
                </div>
                <MatchScore score={rec.score} size="sm" />
              </div>

              <p className="text-xs text-[#666666] leading-relaxed mb-3 flex-1">{rec.role.description}</p>

              <div className="mb-3">
                <p className="text-xs font-medium text-[#111111] mb-1.5">Matched skills</p>
                <div className="flex flex-wrap gap-1">
                  {rec.matchedSkills.slice(0, 4).map((s: string) => <SkillBadge key={s} skill={s} variant="matched" size="sm" />)}
                  {rec.matchedSkills.length > 4 && <span className="text-[10px] text-[#858585]">+{rec.matchedSkills.length - 4}</span>}
                </div>
              </div>

              {rec.missingSkills.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-[#111111] mb-1.5">Missing skills</p>
                  <div className="flex flex-wrap gap-1">
                    {rec.missingSkills.slice(0, 3).map((s: string) => <SkillBadge key={s} skill={s} variant="missing" size="sm" />)}
                    {rec.missingSkills.length > 3 && <span className="text-[10px] text-[#858585]">+{rec.missingSkills.length - 3}</span>}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => setSelected(rec.role.id)}
                  className="btn-primary flex-1 justify-center text-xs py-2"
                >
                  Explore Role
                </button>
                <button
                  onClick={() => toggleCompare(rec.role.id)}
                  className={cn(
                    'btn-secondary text-xs py-2 px-3 flex-shrink-0',
                    compareIds.includes(rec.role.id) && 'bg-[#111111] text-white border-[#111111]'
                  )}
                  title="Add to comparison"
                  disabled={!compareIds.includes(rec.role.id) && compareIds.length >= 3}
                >
                  {compareIds.includes(rec.role.id) ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
