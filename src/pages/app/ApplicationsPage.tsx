import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, Trash2, Edit3, Calendar, MapPin, Briefcase,
  ChevronRight, LayoutGrid, List, MoreHorizontal, X, Check,
  Clock
} from 'lucide-react';
import { PageHeader, EmptyState, ConfirmDialog } from '@/components/shared';
import { generateId, storage } from '@/lib/storage';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import type { Application } from '@/types';

const STATUSES: Application['status'][] = ['saved', 'applied', 'assessment', 'interview', 'offer', 'rejected', 'withdrawn'];
const STATUS_LABELS: Record<Application['status'], string> = {
  saved: 'Saved', applied: 'Applied', assessment: 'Assessment',
  interview: 'Interview', offer: 'Offer', rejected: 'Rejected', withdrawn: 'Withdrawn',
};
const STATUS_COLORS: Record<Application['status'], string> = {
  saved: 'bg-[#F7F8FA] text-[#858585]',
  applied: 'bg-[#EAF3FF] text-[#1a5fb4]',
  assessment: 'bg-[#F0EDFF] text-[#4c1d95]',
  interview: 'bg-[#FFF3D9] text-[#92400e]',
  offer: 'bg-[#E8F6EE] text-[#1a6b3a]',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-[#F7F8FA] text-[#858585]',
};

export function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>(() => storage.getApplications());
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [filter, setFilter] = useState<Application['status'] | 'all'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newApp, setNewApp] = useState({
    jobTitle: '', company: '', location: '', status: 'applied' as Application['status'],
    salary: '', workMode: 'hybrid', notes: '',
  });

  useEffect(() => {
    api.applications.list().then(remoteApps => {
      if (Array.isArray(remoteApps)) {
        const mapped: Application[] = remoteApps.map((a: any) => ({
          id: a.id,
          jobId: a.job_id || '',
          jobTitle: a.job_title || 'Software Role',
          company: a.company_name || a.company || 'Company',
          location: a.location || 'Remote',
          appliedDate: a.applied_at ? a.applied_at.split('T')[0] : new Date().toISOString().split('T')[0],
          status: a.status as Application['status'],
          workMode: a.work_mode || 'hybrid',
          salary: a.notes,
          notes: a.notes,
        }));
        setApps(mapped);
        storage.setApplications(mapped);
      }
    }).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const list = filter === 'all' ? apps : apps.filter(a => a.status === filter);
    return list.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
  }, [apps, filter]);

  const handleStatusChange = (id: string, status: Application['status']) => {
    setApps(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, status } : a);
      storage.setApplications(updated);
      return updated;
    });
    api.applications.updateStatus(id, status).catch(() => {});
  };

  const handleDelete = (id: string) => {
    setApps(prev => {
      const updated = prev.filter(a => a.id !== id);
      storage.setApplications(updated);
      return updated;
    });
    setDeleteId(null);
    api.applications.delete(id).catch(() => {});
  };

  const handleAdd = async () => {
    if (!newApp.jobTitle.trim() || !newApp.company.trim()) return;
    const appPayload = {
      job_title: newApp.jobTitle,
      company_name: newApp.company,
      location: newApp.location || 'Remote',
      status: newApp.status,
      work_mode: newApp.workMode,
      notes: newApp.salary ? `Salary: ${newApp.salary}. ${newApp.notes}` : newApp.notes,
    };
    try {
      const created = await api.applications.create(appPayload);
      const newEntry: Application = {
        id: created.id || generateId(),
        jobId: created.job_id || '',
        jobTitle: created.job_title || newApp.jobTitle,
        company: created.company_name || newApp.company,
        location: created.location || newApp.location,
        appliedDate: new Date().toISOString().split('T')[0],
        status: newApp.status,
        workMode: newApp.workMode,
        salary: newApp.salary,
        notes: newApp.notes,
      };
      setApps(prev => {
        const updated = [newEntry, ...prev];
        storage.setApplications(updated);
        return updated;
      });
    } catch {
      const newEntry: Application = {
        id: generateId(),
        jobId: '',
        jobTitle: newApp.jobTitle,
        company: newApp.company,
        location: newApp.location,
        appliedDate: new Date().toISOString().split('T')[0],
        status: newApp.status,
        workMode: newApp.workMode,
        salary: newApp.salary,
        notes: newApp.notes,
      };
      setApps(prev => {
        const updated = [newEntry, ...prev];
        storage.setApplications(updated);
        return updated;
      });
    }
    setShowAdd(false);
    setNewApp({ jobTitle: '', company: '', location: '', status: 'applied', salary: '', workMode: 'hybrid', notes: '' });
  };

  const statusCounts = useMemo(() =>
    STATUSES.reduce((acc, s) => ({ ...acc, [s]: apps.filter(a => a.status === s).length }), {} as Record<string, number>)
  , [apps]);

  const AppCard = ({ app }: { app: Application }) => (
    <div className="card p-4 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[#111111] truncate">{app.jobTitle}</h3>
          <p className="text-xs text-[#666666]">{app.company}</p>
        </div>
        <select
          value={app.status}
          onChange={e => handleStatusChange(app.id, e.target.value as Application['status'])}
          className={cn('text-[10px] font-medium px-2 py-1 rounded-full border-0 outline-none cursor-pointer', STATUS_COLORS[app.status])}
        >
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-[#858585] mb-2">
        {app.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.location}</span>}
        {app.salary && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{app.salary}</span>}
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{app.appliedDate}</span>
      </div>
      {app.nextAction && (
        <p className="text-xs text-[#666666] bg-[#F7F8FA] rounded px-2 py-1.5 mb-2">
          → {app.nextAction}
        </p>
      )}
      {app.notes && <p className="text-xs text-[#858585] italic">{app.notes}</p>}
      <div className="flex justify-end mt-2">
        <button onClick={() => setDeleteId(app.id)} className="btn-ghost p-1.5 text-[#858585]">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-content mx-auto space-y-5 animate-fade-in">
      <PageHeader
        title="My Applications"
        description="Track every job application from first look to final offer."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setView('list')} className={cn('btn-ghost p-2', view === 'list' && 'bg-[#F7F8FA]')}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setView('kanban')} className={cn('btn-ghost p-2', view === 'kanban' && 'bg-[#F7F8FA]')}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Add Application
            </button>
          </div>
        }
      />

      {/* Status pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('all')}
          className={cn('text-xs px-3 py-1.5 rounded-full border flex-shrink-0 font-medium transition-colors',
            filter === 'all' ? 'bg-[#111111] text-white border-[#111111]' : 'border-[#EAEAEA] text-[#666666] hover:border-[#111111]'
          )}
        >
          All ({apps.length})
        </button>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn('text-xs px-3 py-1.5 rounded-full border flex-shrink-0 font-medium transition-colors',
              filter === s ? 'bg-[#111111] text-white border-[#111111]' : 'border-[#EAEAEA] text-[#666666] hover:border-[#111111]'
            )}
          >
            {STATUS_LABELS[s]} ({statusCounts[s] || 0})
          </button>
        ))}
      </div>

      {/* Add application form */}
      {showAdd && (
        <div className="card p-5 border-2 border-dashed border-[#EAEAEA] animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#111111]">New Application</h3>
            <button onClick={() => setShowAdd(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="label" htmlFor="app-title">Job Title*</label>
              <input id="app-title" className="input" placeholder="e.g. Backend Developer"
                value={newApp.jobTitle} onChange={e => setNewApp(n => ({ ...n, jobTitle: e.target.value }))} /></div>
            <div><label className="label" htmlFor="app-company">Company*</label>
              <input id="app-company" className="input" placeholder="e.g. Groww"
                value={newApp.company} onChange={e => setNewApp(n => ({ ...n, company: e.target.value }))} /></div>
            <div><label className="label" htmlFor="app-location">Location</label>
              <input id="app-location" className="input" placeholder="e.g. Bengaluru"
                value={newApp.location} onChange={e => setNewApp(n => ({ ...n, location: e.target.value }))} /></div>
            <div><label className="label" htmlFor="app-status">Status</label>
              <select id="app-status" className="input" value={newApp.status}
                onChange={e => setNewApp(n => ({ ...n, status: e.target.value as Application['status'] }))}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select></div>
            <div><label className="label" htmlFor="app-salary">Salary</label>
              <input id="app-salary" className="input" placeholder="e.g. ₹12–18 LPA"
                value={newApp.salary} onChange={e => setNewApp(n => ({ ...n, salary: e.target.value }))} /></div>
            <div><label className="label" htmlFor="app-mode">Work Mode</label>
              <select id="app-mode" className="input" value={newApp.workMode}
                onChange={e => setNewApp(n => ({ ...n, workMode: e.target.value }))}>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
              </select></div>
            <div className="sm:col-span-2"><label className="label" htmlFor="app-notes">Notes</label>
              <textarea id="app-notes" className="input resize-none" rows={2}
                value={newApp.notes} onChange={e => setNewApp(n => ({ ...n, notes: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} className="btn-primary text-sm">Add Application</button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        filtered.length === 0
          ? <EmptyState title="No applications" description="Add your first application to start tracking." action={<button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Application</button>} />
          : <div className="space-y-3">{filtered.map(app => <AppCard key={app.id} app={app} />)}</div>
      )}

      {/* Kanban view */}
      {view === 'kanban' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-x-auto">
          {(['applied', 'assessment', 'interview', 'offer'] as Application['status'][]).map(col => (
            <div key={col} className="min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className={cn('text-xs font-semibold px-2 py-1 rounded-full', STATUS_COLORS[col])}>
                  {STATUS_LABELS[col]}
                </span>
                <span className="text-xs text-[#858585]">{statusCounts[col] || 0}</span>
              </div>
              <div className="space-y-2">
                {apps.filter(a => a.status === col).map(app => (
                  <div key={app.id} className="card p-3 text-xs">
                    <p className="font-semibold text-[#111111] truncate">{app.jobTitle}</p>
                    <p className="text-[#666666]">{app.company}</p>
                    {app.nextAction && <p className="text-[#858585] mt-1 line-clamp-2">→ {app.nextAction}</p>}
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {STATUSES.filter(s => s !== col).map(s => (
                        <button key={s} onClick={() => handleStatusChange(app.id, s)}
                          className="text-[9px] px-1.5 py-0.5 rounded border border-[#EAEAEA] text-[#858585] hover:bg-[#F7F8FA]">
                          → {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete application"
        description="This will permanently remove this application record."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        dangerous
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
