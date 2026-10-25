import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, BookOpen, ArrowRight, ChevronDown } from 'lucide-react';
import { PageHeader, SkillBadge, SkillProgressBar, EmptyState } from '@/components/shared';
import { storage } from '@/lib/storage';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { computeSkillCoverage } from '@/lib/scoring';

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-[#F7F8FA] text-[#858585]',
};

export function SkillGapsPage() {
  const [roles, setRoles] = useState<{ id: string; title: string }[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [gaps, setGaps] = useState<any[]>([]);
  const [coverageScore, setCoverageScore] = useState<number>(75);
  const [learnedSkills, setLearnedSkills] = useState<string[]>(storage.getSkillOverrides());
  const [filterStatus, setFilterStatus] = useState<'all' | 'missing' | 'partial' | 'matched'>('all');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'priority' | 'importance'>('priority');
  const [loading, setLoading] = useState(true);

  // Load available roles
  useEffect(() => {
    api.roles.getRecommendations().then(recs => {
      if (Array.isArray(recs) && recs.length > 0) {
        const mapped = recs.map((r: any) => ({
          id: r.role_id,
          title: r.role_title,
        }));
        setRoles(mapped);
        setSelectedRole(mapped[0].id);
      } else {
        api.roles.list().then(list => {
          if (Array.isArray(list) && list.length > 0) {
            setRoles(list.map((r: any) => ({ id: r.id, title: r.title })));
            setSelectedRole(list[0].id);
          }
        }).catch(() => {});
      }
    }).catch(() => {
      api.roles.list().then(list => {
        if (Array.isArray(list) && list.length > 0) {
          setRoles(list.map((r: any) => ({ id: r.id, title: r.title })));
          setSelectedRole(list[0].id);
        }
      }).catch(() => {});
    });
  }, []);

  // Load gaps when selectedRole changes
  useEffect(() => {
    if (!selectedRole) return;
    setLoading(true);
    api.roles.getGaps(selectedRole).then(gapRes => {
      if (gapRes && Array.isArray(gapRes.gaps)) {
        const mappedGaps = gapRes.gaps.map((g: any, i: number) => {
          const status = !g.is_missing ? 'matched' : (g.user_proficiency ? 'partial' : 'missing');
          const priority = g.importance_weight >= 0.9 ? 'critical' : (g.importance_weight >= 0.7 ? 'high' : 'medium');
          return {
            skillId: `gap-${i}-${g.skill_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            skillName: g.skill_name,
            category: g.category || 'Engineering',
            status,
            learningPriority: priority,
            importance: g.importance_weight || 0.8,
            estimatedHours: 6,
            prerequisites: [],
            resources: (g.recommended_resources || []).map((r: any, idx: number) => ({
              id: `res-${idx}`,
              title: r.title || `Mastering ${g.skill_name}`,
              estimatedHours: r.estimated_hours || 4,
              url: r.url || 'https://developer.mozilla.org',
            })),
          };
        });
        setGaps(mappedGaps);
        setCoverageScore(Math.round(gapRes.overall_match_percentage ?? 75));
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [selectedRole]);

  const activeRoleObj = roles.find(r => r.id === selectedRole) || { id: selectedRole, title: 'Target Role' };

  const filtered = useMemo(() => {
    let list = gaps.map(g => ({
      ...g,
      status: learnedSkills.includes(g.skillId) ? 'matched' as const : g.status,
    }));
    if (filterStatus !== 'all') list = list.filter(g => g.status === filterStatus);
    if (filterCategory !== 'All') list = list.filter(g => g.category === filterCategory);
    if (sortBy === 'importance') list = [...list].sort((a, b) => b.importance - a.importance);
    else list = [...list].sort((a, b) => PRIORITY_ORDER[a.learningPriority] - PRIORITY_ORDER[b.learningPriority]);
    return list;
  }, [gaps, filterStatus, filterCategory, sortBy, learnedSkills]);

  const toggleLearned = (skillId: string) => {
    const updated = learnedSkills.includes(skillId)
      ? learnedSkills.filter(id => id !== skillId)
      : [...learnedSkills, skillId];
    setLearnedSkills(updated);
    storage.setSkillOverrides(updated);
  };

  const matchedCount = gaps.filter(g => g.status === 'matched').length + learnedSkills.filter(id => gaps.find(g => g.skillId === id && g.status !== 'matched')).length;

  return (
    <div className="max-w-content mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Skill Gap Analysis"
        description="See which skills you need for your target role and how to fill the gaps."
        badge="Active Skill Taxonomy"
      />

      {/* Role selector */}
      <div className="card p-4">
        <label className="text-xs font-medium text-[#858585] uppercase tracking-wider block mb-2">Target Role</label>
        <select
          className="input max-w-sm"
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
        >
          {roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
        </select>
      </div>

      {/* Coverage overview */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[#111111]">Skill Coverage — {activeRoleObj.title}</h2>
            <p className="text-xs text-[#858585] mt-0.5">{matchedCount} of {gaps.length} skills analyzed</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#111111]">{coverageScore}%</p>
              <p className="text-xs text-[#858585]">Coverage</p>
            </div>
          </div>
        </div>
        <div className="h-2 bg-[#EAEAEA] rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700', coverageScore >= 80 ? 'bg-[#1a6b3a]' : coverageScore >= 60 ? 'bg-[#1a5fb4]' : 'bg-[#d97706]')}
            style={{ width: `${coverageScore}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {(['matched', 'partial', 'missing'] as const).map(status => {
            const count = gaps.filter(g =>
              learnedSkills.includes(g.skillId) ? status === 'matched' : g.status === status
            ).length;
            return (
              <div key={status} className="text-center bg-[#F7F8FA] rounded-lg p-3">
                <p className="text-lg font-bold text-[#111111]">{count}</p>
                <p className="text-xs text-[#858585] capitalize">{status}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1">
          {(['all', 'missing', 'partial', 'matched'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn('text-xs px-3 py-1.5 rounded-full border font-medium transition-colors capitalize',
                filterStatus === s ? 'bg-[#111111] text-white border-[#111111]' : 'border-[#EAEAEA] text-[#666666] hover:border-[#111111]'
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <select className="input w-auto text-xs" value={sortBy} onChange={e => setSortBy(e.target.value as 'priority' | 'importance')}>
          <option value="priority">Sort by Priority</option>
          <option value="importance">Sort by Importance</option>
        </select>
      </div>

      {/* Skill list */}
      <div className="space-y-3">
        {filtered.map(gap => {
          const isLearned = learnedSkills.includes(gap.skillId);
          const effectiveStatus = isLearned ? 'matched' : gap.status;

          return (
            <div key={gap.skillId} className={cn('card p-4 md:p-5 transition-opacity', isLearned && 'opacity-70')}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-[#111111]">{gap.skillName}</h3>
                    <span className={cn('badge text-[10px]', PRIORITY_COLORS[gap.learningPriority])}>
                      {gap.learningPriority}
                    </span>
                    <span className={cn('badge text-[10px]',
                      effectiveStatus === 'matched' ? 'badge-mint' :
                      effectiveStatus === 'partial' ? 'badge-lavender' : 'badge-amber'
                    )}>
                      {effectiveStatus}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-[#858585] mb-3">
                    <span>Importance: {Math.round(gap.importance * 100)}%</span>
                    {gap.estimatedHours > 0 && <span>~{gap.estimatedHours}h to learn</span>}
                    {gap.prerequisites.length > 0 && <span>Prerequisites: {gap.prerequisites.join(', ')}</span>}
                  </div>

                  {gap.resources.length > 0 && effectiveStatus !== 'matched' && (
                    <div className="space-y-1.5">
                      {gap.resources.slice(0, 1).map((r: any) => (
                        <div key={r.id} className="flex items-center gap-2 bg-[#F7F8FA] rounded-lg px-3 py-2">
                          <BookOpen className="w-3.5 h-3.5 text-[#858585] flex-shrink-0" />
                          <span className="text-xs text-[#666666] flex-1 truncate">{r.title}</span>
                          <span className="text-[10px] text-[#858585]">{r.estimatedHours}h</span>
                          <a href={r.url} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] text-[#1a5fb4] hover:underline flex-shrink-0">
                            Open
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleLearned(gap.skillId)}
                    className={cn('text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors',
                      isLearned
                        ? 'bg-[#E8F6EE] text-[#1a6b3a] border-[#E8F6EE]'
                        : 'border-[#EAEAEA] text-[#666666] hover:border-[#111111]'
                    )}
                  >
                    {isLearned ? <><CheckCircle className="w-3.5 h-3.5 inline mr-1" />Learned</> : 'Mark Learned'}
                  </button>
                  {effectiveStatus !== 'matched' && (
                    <Link to="/app/learning-roadmap" className="text-xs px-3 py-1.5 rounded-lg border border-[#EAEAEA] text-[#666666] hover:border-[#111111] transition-colors text-center">
                      + Roadmap
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState title="No gaps to show" description="All skills matched, or adjust filters." />
      )}

      <Link to="/app/learning-roadmap" className="btn-primary w-full justify-center">
        Open Learning Roadmap <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
