import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle, Circle, Clock, BookOpen, Code2, Layers,
  Plus, Trash2, ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react';
import { PageHeader, SkillBadge, EmptyState } from '@/components/shared';
import { storage, generateId } from '@/lib/storage';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import type { RoadmapTask } from '@/types';

const PHASE_META: Record<string, any> = {
  fundamentals: { label: 'Phase 1: Fundamentals', icon: BookOpen, color: 'bg-[#EAF3FF]', iconColor: 'text-[#1a5fb4]' },
  applied: { label: 'Phase 2: Applied Skills', icon: Code2, color: 'bg-[#E8F6EE]', iconColor: 'text-[#1a6b3a]' },
  portfolio: { label: 'Phase 3: Portfolio Projects', icon: Layers, color: 'bg-[#F0EDFF]', iconColor: 'text-[#4c1d95]' },
};

const STATUS_NEXT: Record<RoadmapTask['status'], RoadmapTask['status']> = {
  'not-started': 'in-progress',
  'in-progress': 'completed',
  'completed': 'not-started',
};

export function LearningRoadmapPage() {
  const [roles, setRoles] = useState<{ id: string; title: string }[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', estimatedHours: '', phase: 'fundamentals' as RoadmapTask['phase'] });

  // Load roles
  useEffect(() => {
    api.roles.getRecommendations().then(recs => {
      if (Array.isArray(recs) && recs.length > 0) {
        const mapped = recs.map((r: any) => ({ id: r.role_id, title: r.role_title }));
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

  // Fetch roadmap
  const fetchRoadmap = (roleId?: string) => {
    setLoading(true);
    api.roadmap.get().then(res => {
      if (res && Array.isArray(res.tasks) && res.tasks.length > 0) {
        const mapped: RoadmapTask[] = res.tasks.map((t: any) => {
          const rawPhase = (t.phase || 'fundamentals').toLowerCase();
          const phase = rawPhase.includes('core') || rawPhase.includes('applied') ? 'applied' :
            (rawPhase.includes('capstone') || rawPhase.includes('portfolio') ? 'portfolio' : 'fundamentals');
          const status = t.status === 'completed' ? 'completed' : (t.status === 'in_progress' ? 'in-progress' : 'not-started');
          return {
            id: t.id,
            title: t.title,
            description: t.description || '',
            skillCovered: t.skill_name || 'Engineering',
            phase,
            difficulty: (t.difficulty || 'medium') as any,
            estimatedHours: t.estimated_hours || 4,
            prerequisites: [],
            status,
            isCustom: !!t.is_custom,
          };
        });
        setTasks(mapped);
      } else if (roleId) {
        api.roadmap.generate(roleId).then(genRes => {
          if (genRes && Array.isArray(genRes.tasks)) {
            const mapped: RoadmapTask[] = genRes.tasks.map((t: any) => {
              const rawPhase = (t.phase || 'fundamentals').toLowerCase();
              const phase = rawPhase.includes('core') || rawPhase.includes('applied') ? 'applied' :
                (rawPhase.includes('capstone') || rawPhase.includes('portfolio') ? 'portfolio' : 'fundamentals');
              const status = t.status === 'completed' ? 'completed' : (t.status === 'in_progress' ? 'in-progress' : 'not-started');
              return {
                id: t.id,
                title: t.title,
                description: t.description || '',
                skillCovered: t.skill_name || 'Engineering',
                phase,
                difficulty: (t.difficulty || 'medium') as any,
                estimatedHours: t.estimated_hours || 4,
                prerequisites: [],
                status,
                isCustom: !!t.is_custom,
              };
            });
            setTasks(mapped);
          }
        }).catch(() => {});
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    if (selectedRole) {
      fetchRoadmap(selectedRole);
    }
  }, [selectedRole]);

  const allTasks = tasks;

  const phases = (['fundamentals', 'applied', 'portfolio'] as const);
  const totalCompleted = allTasks.filter(t => t.status === 'completed').length;
  const progressPct = allTasks.length > 0 ? Math.round((totalCompleted / allTasks.length) * 100) : 0;

  const updateStatus = (id: string, status: RoadmapTask['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    const dbStatus = status === 'completed' ? 'completed' : (status === 'in-progress' ? 'in_progress' : 'todo');
    api.roadmap.updateStatus(id, dbStatus).catch(() => {});
  };

  const cycleStatus = (task: RoadmapTask) => {
    const next = STATUS_NEXT[task.status];
    updateStatus(task.id, next);
  };

  const deleteCustomTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    api.roadmap.deleteTask(id).catch(() => {});
  };

  const addCustomTask = async () => {
    if (!newTask.title.trim()) return;
    const taskPayload = {
      title: newTask.title,
      description: newTask.description || '',
      phase: newTask.phase,
      difficulty: 'medium',
      estimated_hours: +newTask.estimatedHours || 4,
      status: 'todo',
      is_custom: true,
    };
    try {
      const created = await api.roadmap.createTask(taskPayload);
      const task: RoadmapTask = {
        id: created.id || `CUSTOM_${generateId()}`,
        title: created.title || newTask.title,
        description: created.description || newTask.description,
        skillCovered: 'Custom',
        phase: newTask.phase,
        difficulty: 'medium',
        estimatedHours: +newTask.estimatedHours || 4,
        prerequisites: [],
        status: 'not-started',
        isCustom: true,
      };
      setTasks(prev => [...prev, task]);
    } catch {
      const task: RoadmapTask = {
        id: `CUSTOM_${generateId()}`,
        title: newTask.title,
        description: newTask.description,
        skillCovered: 'Custom',
        phase: newTask.phase,
        difficulty: 'medium',
        estimatedHours: +newTask.estimatedHours || 4,
        prerequisites: [],
        status: 'not-started',
        isCustom: true,
      };
      setTasks(prev => [...prev, task]);
    }
    setNewTask({ title: '', description: '', estimatedHours: '', phase: 'fundamentals' });
    setShowAdd(false);
  };

  const statusIcon = (status: RoadmapTask['status']) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-[#1a6b3a]" />;
    if (status === 'in-progress') return <Clock className="w-5 h-5 text-[#1a5fb4]" />;
    return <Circle className="w-5 h-5 text-[#EAEAEA]" />;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Learning Roadmap"
        description="A structured plan to close your skill gaps and prepare for your target role."
        badge="Personalized Skill Milestones"
        actions={
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        }
      />

      {/* Role selector */}
      <div className="card p-4 flex items-center gap-4">
        <label className="text-xs font-medium text-[#858585] flex-shrink-0">Target Role</label>
        <select className="input flex-1" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
          {roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
        </select>
      </div>

      {/* Progress overview */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#111111]">Overall Progress</h2>
          <span className="text-sm font-bold text-[#111111]">{totalCompleted} / {allTasks.length} tasks</span>
        </div>
        <div className="h-2 bg-[#EAEAEA] rounded-full overflow-hidden mb-3">
          <div className="h-full bg-[#1a6b3a] rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(['not-started', 'in-progress', 'completed'] as const).map(s => (
            <div key={s} className="text-center bg-[#F7F8FA] rounded-lg p-3">
              <p className="text-lg font-bold text-[#111111]">{allTasks.filter(t => t.status === s).length}</p>
              <p className="text-[10px] text-[#858585] capitalize">{s.replace('-', ' ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add custom task */}
      {showAdd && (
        <div className="card p-5 border-2 border-dashed border-[#EAEAEA] animate-slide-up">
          <h3 className="text-sm font-semibold text-[#111111] mb-4">Add Custom Task</h3>
          <div className="space-y-3">
            <input className="input" placeholder="Task title*" value={newTask.title}
              onChange={e => setNewTask(n => ({ ...n, title: e.target.value }))} />
            <textarea className="input resize-none" rows={2} placeholder="Description (optional)"
              value={newTask.description}
              onChange={e => setNewTask(n => ({ ...n, description: e.target.value }))} />
            <div className="flex gap-3">
              <input className="input flex-1" type="number" placeholder="Hours (e.g. 4)" min={1}
                value={newTask.estimatedHours}
                onChange={e => setNewTask(n => ({ ...n, estimatedHours: e.target.value }))} />
              <select className="input flex-1" value={newTask.phase}
                onChange={e => setNewTask(n => ({ ...n, phase: e.target.value as RoadmapTask['phase'] }))}>
                <option value="fundamentals">Fundamentals</option>
                <option value="applied">Applied</option>
                <option value="portfolio">Portfolio</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={addCustomTask} className="btn-primary text-sm">Add Task</button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Phases */}
      {phases.map(phase => {
        const phaseTasks = allTasks.filter(t => t.phase === phase);
        if (phaseTasks.length === 0) return null;
        const meta = PHASE_META[phase];
        const isCollapsed = collapsed[phase];
        const phaseCompleted = phaseTasks.filter(t => t.status === 'completed').length;

        return (
          <div key={phase} className="card overflow-hidden">
            {/* Phase header */}
            <button
              onClick={() => setCollapsed(c => ({ ...c, [phase]: !c[phase] }))}
              className="w-full flex items-center justify-between p-5 hover:bg-[#F7F8FA] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', meta.color)}>
                  <meta.icon className={cn('w-4 h-4', meta.iconColor)} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">{meta.label}</p>
                  <p className="text-xs text-[#858585]">{phaseCompleted}/{phaseTasks.length} completed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-20 h-1.5 bg-[#EAEAEA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1a6b3a] rounded-full"
                    style={{ width: `${phaseTasks.length > 0 ? (phaseCompleted / phaseTasks.length) * 100 : 0}%` }}
                  />
                </div>
                {isCollapsed ? <ChevronDown className="w-4 h-4 text-[#858585]" /> : <ChevronUp className="w-4 h-4 text-[#858585]" />}
              </div>
            </button>

            {/* Task list */}
            {!isCollapsed && (
              <div className="divide-y divide-[#F7F8FA] border-t border-[#EAEAEA]">
                {phaseTasks.map(task => (
                  <div key={task.id} className="flex items-start gap-4 p-4 hover:bg-[#F7F8FA] transition-colors">
                    <button
                      onClick={() => cycleStatus(task)}
                      className="mt-0.5 flex-shrink-0"
                      aria-label="Toggle status"
                    >
                      {statusIcon(task.status)}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={cn('text-sm font-medium', task.status === 'completed' ? 'text-[#858585] line-through' : 'text-[#111111]')}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-[#666666] mt-0.5 leading-relaxed line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {task.estimatedHours > 0 && <span className="text-[10px] text-[#858585]">~{task.estimatedHours}h</span>}
                            {task.difficulty && <span className="text-[10px] text-[#858585] capitalize">{task.difficulty}</span>}
                            {task.isCustom && <span className="badge-lavender text-[10px]">Custom</span>}
                            {task.resource && (
                              <a href={task.resource.url} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] text-[#1a5fb4] hover:underline flex-shrink-0">
                                {task.resource.provider} ↗
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium',
                            task.status === 'completed' ? 'bg-[#E8F6EE] text-[#1a6b3a]' :
                            task.status === 'in-progress' ? 'bg-[#EAF3FF] text-[#1a5fb4]' :
                            'bg-[#F7F8FA] text-[#858585]'
                          )}>
                            {task.status.replace('-', ' ')}
                          </span>
                          {task.isCustom && (
                            <button onClick={() => deleteCustomTask(task.id)} className="btn-ghost p-1.5 text-[#858585]">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
