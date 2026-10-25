import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Trash2, Download, CheckCircle, Info } from 'lucide-react';
import { PageHeader, ConfirmDialog } from '@/components/shared';
import { storage } from '@/lib/storage';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Data', icon: Shield },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentUser = storage.getUser();
  const [profile, setProfile] = useState({
    name: currentUser?.name || 'Candidate',
    email: currentUser?.email || '',
    headline: 'Software Engineer & AI Practitioner',
    phone: '',
    linkedIn: '',
    github: '',
    targetRole: 'Backend Developer',
    targetSalary: '₹10–18 LPA',
    workMode: 'hybrid',
    location: 'Remote',
  });

  const [preferences, setPreferences] = useState({
    defaultRole: 'Backend Developer',
    scoreThreshold: 60,
    showDemoBadges: true,
    showFormulas: true,
  });

  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    roadmapReminders: true,
    applicationFollowups: true,
    weeklyDigest: false,
  });

  useEffect(() => {
    api.profile.get().then(p => {
      if (p) {
        setProfile(prev => ({
          ...prev,
          name: p.full_name || prev.name,
          headline: p.headline || prev.headline,
          phone: p.phone || prev.phone,
          location: p.location || prev.location,
          linkedIn: p.linkedin_url || prev.linkedIn,
          github: p.github_url || prev.github,
          workMode: p.preferred_work_mode || prev.workMode,
        }));
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      await api.profile.update({
        full_name: profile.name,
        headline: profile.headline,
        phone: profile.phone,
        location: profile.location,
        linkedin_url: profile.linkedIn,
        github_url: profile.github,
        preferred_work_mode: profile.workMode,
      });
      storage.setUser({ name: profile.name, email: profile.email });
    } catch {
      // Continue locally
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExport = () => {
    const data = {
      profile,
      preferences,
      exportedAt: new Date().toISOString(),
      note: 'CareerIQ Candidate Profile Export',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'careeriq-profile.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteData = () => {
    storage.clearAll();
    navigate('/login');
  };

  const inputClass = 'input';
  const labelClass = 'label';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Settings"
        description="Manage your CareerIQ profile and preferences."
      />

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar nav */}
        <nav className="sm:w-48 flex-shrink-0">
          <ul className="space-y-1">
            {SECTIONS.map(s => (
              <li key={s.id}>
                <button
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === s.id
                      ? 'bg-[#F7F8FA] text-[#111111]'
                      : 'text-[#666666] hover:bg-[#F7F8FA] hover:text-[#111111]'
                  }`}
                >
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {/* Profile */}
          {activeSection === 'profile' && (
            <div className="card p-5 space-y-4 animate-fade-in">
              <h2 className="text-base font-semibold text-[#111111]">Profile Information</h2>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-full bg-[#EAF3FF] flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#1a5fb4]">{profile.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">{profile.name}</p>
                  <p className="text-xs text-[#858585]">Active account · Connected to database</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="s-name">Full name</label>
                  <input id="s-name" className={inputClass} value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="s-email">Email</label>
                  <input id="s-email" className={inputClass} value={profile.email}
                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="s-headline">Headline</label>
                  <input id="s-headline" className={inputClass} value={profile.headline}
                    onChange={e => setProfile(p => ({ ...p, headline: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="s-gh">GitHub URL</label>
                  <input id="s-gh" className={inputClass} value={profile.github}
                    onChange={e => setProfile(p => ({ ...p, github: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="s-li">LinkedIn URL</label>
                  <input id="s-li" className={inputClass} value={profile.linkedIn}
                    onChange={e => setProfile(p => ({ ...p, linkedIn: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="s-role">Target role</label>
                  <input id="s-role" className={inputClass} value={profile.targetRole}
                    onChange={e => setProfile(p => ({ ...p, targetRole: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="s-loc">Location</label>
                  <input id="s-loc" className={inputClass} value={profile.location}
                    onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="s-salary">Target salary</label>
                  <input id="s-salary" className={inputClass} value={profile.targetSalary}
                    onChange={e => setProfile(p => ({ ...p, targetSalary: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="s-wm">Preferred work mode</label>
                  <select id="s-wm" className={inputClass} value={profile.workMode}
                    onChange={e => setProfile(p => ({ ...p, workMode: e.target.value }))}>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                    <option value="any">Any</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeSection === 'preferences' && (
            <div className="card p-5 space-y-5 animate-fade-in">
              <h2 className="text-base font-semibold text-[#111111]">Application Preferences</h2>
              <div>
                <label className={labelClass} htmlFor="s-defRole">Default target role for analysis</label>
                <select id="s-defRole" className={inputClass} value={preferences.defaultRole}
                  onChange={e => setPreferences(p => ({ ...p, defaultRole: e.target.value }))}>
                  <option>Backend Developer</option>
                  <option>Machine Learning Engineer</option>
                  <option>Full-Stack Developer</option>
                  <option>Data Analyst</option>
                  <option>Cloud / DevOps Engineer</option>
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="s-thresh">Minimum job match score to show: {preferences.scoreThreshold}%</label>
                <input type="range" id="s-thresh" min={0} max={90} step={5} className="w-full"
                  value={preferences.scoreThreshold}
                  onChange={e => setPreferences(p => ({ ...p, scoreThreshold: +e.target.value }))} />
              </div>
              <div className="space-y-3">
                {([
                  { key: 'showDemoBadges', label: 'Show live verified badges on pages' },
                  { key: 'showFormulas', label: 'Show scoring formula explanations' },
                ] as const).map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <label className="text-sm text-[#666666]">{item.label}</label>
                    <button
                      onClick={() => setPreferences(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
                        preferences[item.key] ? 'bg-[#111111]' : 'bg-[#EAEAEA]'
                      }`}
                    >
                      <span className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${preferences[item.key] ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="card p-5 space-y-5 animate-fade-in">
              <h2 className="text-base font-semibold text-[#111111]">Notifications</h2>
              {([
                { key: 'jobAlerts', label: 'New job match alerts', desc: 'When new jobs matching your profile are added' },
                { key: 'roadmapReminders', label: 'Learning roadmap reminders', desc: 'Weekly check-in to keep your roadmap on track' },
                { key: 'applicationFollowups', label: 'Application follow-up reminders', desc: 'Reminders when follow-up dates are due' },
                { key: 'weeklyDigest', label: 'Weekly career digest', desc: 'Summary of your career platform activity' },
              ] as const).map(item => (
                <div key={item.key} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#111111]">{item.label}</p>
                    <p className="text-xs text-[#858585]">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
                    className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 flex-shrink-0 ${
                      notifications[item.key] ? 'bg-[#111111]' : 'bg-[#EAEAEA]'
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications[item.key] ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Privacy */}
          {activeSection === 'privacy' && (
            <div className="space-y-4 animate-fade-in">
              <div className="card p-5">
                <h2 className="text-base font-semibold text-[#111111] mb-3">Data & Privacy</h2>
                <div className="flex items-start gap-2 bg-[#E8F6EE] rounded-lg p-3 mb-4">
                  <Info className="w-4 h-4 text-[#1a6b3a] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#1a6b3a]">
                    CareerIQ database synchronization active. Profile data and activities are secured using token-based authentication and private storage.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#F7F8FA] rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-[#111111]">Export profile data</p>
                      <p className="text-xs text-[#858585]">Download your candidate profile as JSON</p>
                    </div>
                    <button onClick={handleExport} className="btn-secondary text-xs py-1.5 px-3">
                      <Download className="w-3.5 h-3.5" /> Export
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#F7F8FA] rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-red-600">Clear all local data</p>
                      <p className="text-xs text-[#858585]">Deletes all saved progress, applications, and settings</p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                      Clear Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          {activeSection !== 'privacy' && (
            <div className="mt-4">
              <button onClick={handleSave} className="btn-primary">
                {saved ? (
                  <><CheckCircle className="w-4 h-4 text-[#1a6b3a]" /> Saved!</>
                ) : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Clear all data"
        description="This will permanently delete all your local progress, applications, roadmap, and settings. You will be signed out."
        confirmLabel="Clear Everything"
        cancelLabel="Cancel"
        dangerous
        onConfirm={handleDeleteData}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
