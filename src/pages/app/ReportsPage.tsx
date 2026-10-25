import React, { useState, useEffect } from 'react';
import { BarChart3, Download, RefreshCw, FileText, Compass, GitMerge, BookOpen, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { cn } from '@/lib/utils';
import type { CareerReport } from '@/types';
import { api } from '@/services/api';
import { storage } from '@/lib/storage';

const REPORT_ICONS: Record<CareerReport['type'], React.ReactNode> = {
  'career-recommendations': <Compass className="w-5 h-5 text-[#1a5fb4]" />,
  'resume-analysis': <FileText className="w-5 h-5 text-[#1a6b3a]" />,
  'skill-gap': <GitMerge className="w-5 h-5 text-[#92400e]" />,
  'learning-progress': <BookOpen className="w-5 h-5 text-[#4c1d95]" />,
  'job-match': <BarChart3 className="w-5 h-5 text-[#0f766e]" />,
};
const REPORT_BG: Record<CareerReport['type'], string> = {
  'career-recommendations': 'bg-[#EAF3FF]',
  'resume-analysis': 'bg-[#E8F6EE]',
  'skill-gap': 'bg-[#FFF3D9]',
  'learning-progress': 'bg-[#F0EDFF]',
  'job-match': 'bg-[#F0FDFA]',
};

const DEFAULT_REPORTS: CareerReport[] = [
  {
    id: 'REP_001',
    title: 'Career Role Compatibility Report',
    type: 'career-recommendations',
    generatedAt: new Date().toISOString(),
    roleTitle: 'Software Engineering & AI Specialization',
    summary: 'Multi-factor compatibility evaluation across verified engineering skill taxonomy and market demand.',
    keyStrengths: ['Proficiency in Python and REST API architectures', 'Relational database query optimization'],
    skillGaps: ['Production Docker deployment experience', 'Distributed caching with Redis'],
    jobCompatibility: 82,
    recommendedNextSteps: ['Complete Docker containerization module', 'Integrate Redis caching into portfolio API'],
  },
  {
    id: 'REP_002',
    title: 'Resume & ATS Compliance Audit',
    type: 'resume-analysis',
    generatedAt: new Date().toISOString(),
    roleTitle: 'Backend Developer Alignment',
    summary: 'Evaluates resume readability, structure completeness, technical keywords, and ATS parsing readiness.',
    keyStrengths: ['Standard section structure detected', 'Core engineering languages present'],
    skillGaps: ['Automated testing framework evidence (pytest/jest)', 'Measurable performance metrics'],
    jobCompatibility: 86,
    recommendedNextSteps: ['Add GitHub repository link to header', 'Add unit testing suite to project repository'],
  },
  {
    id: 'REP_003',
    title: 'Skill Gap & Taxonomy Evaluation',
    type: 'skill-gap',
    generatedAt: new Date().toISOString(),
    roleTitle: 'Full-Stack & Cloud Readiness',
    summary: 'Identifies critical and secondary gaps between your verified profile skills and industry target roles.',
    keyStrengths: ['Strong core programming fundamentals', 'Web framework familiarity'],
    skillGaps: ['CI/CD deployment pipelines', 'Cloud infrastructure configuration'],
    jobCompatibility: 79,
    recommendedNextSteps: ['Configure GitHub Actions automated testing workflow', 'Study AWS / GCP core cloud services'],
  },
  {
    id: 'REP_004',
    title: 'Learning Milestones & Progress Review',
    type: 'learning-progress',
    generatedAt: new Date().toISOString(),
    roleTitle: 'Target Skill Mastery',
    summary: 'Tracks roadmap progression across foundational, applied, and portfolio development stages.',
    keyStrengths: ['Consistent milestone execution', 'Hands-on practice engagement'],
    skillGaps: ['Advanced concurrency patterns', 'System design interview preparation'],
    jobCompatibility: 84,
    recommendedNextSteps: ['Build real-time message queue microservice', 'Practice system design interview questions'],
  },
];

export function ReportsPage() {
  const [reports, setReports] = useState<CareerReport[]>(DEFAULT_REPORTS);
  const [selected, setSelected] = useState<CareerReport | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    api.reports.list().then(remoteReports => {
      if (Array.isArray(remoteReports) && remoteReports.length > 0) {
        const mapped: CareerReport[] = remoteReports.map((r: any) => {
          const content = r.report_payload || r.content_json || {};
          return {
            id: r.id,
            title: r.title,
            type: (r.report_type || 'career-recommendations') as any,
            generatedAt: r.created_at || new Date().toISOString(),
            roleTitle: 'Engineering Track',
            summary: content.summary || 'Comprehensive evaluation of candidate profile.',
            keyStrengths: content.key_strengths || ['Engineering Fundamentals', 'Clean Code Architecture'],
            skillGaps: content.skill_gaps || ['Cloud Deployment', 'Distributed Caching'],
            jobCompatibility: content.compatibility_score || 80,
            recommendedNextSteps: content.next_steps || ['Continue learning roadmap progress'],
          };
        });
        setReports(mapped);
      }
    }).catch(() => {});
  }, []);

  const handleGenerate = async (id: string) => {
    setGenerating(id);
    if (storage.getToken()) {
      try {
        const typeMap: Record<string, string> = {
          'REP_001': 'career-recommendations',
          'REP_002': 'resume-analysis',
          'REP_003': 'skill-gap',
          'REP_004': 'learning-progress',
          'REP_005': 'job-match',
        };
        const targetTitle = reports.find(r => r.id === id)?.title || 'Career Intelligence Report';
        const res = await api.reports.generate({
          report_type: typeMap[id] || 'career-recommendations',
          title: targetTitle,
        });
        if (res) {
          const content = res.report_payload || res.content_json || {};
          const formatted: CareerReport = {
            id: res.id,
            title: res.title,
            type: (typeMap[id] || 'career-recommendations') as any,
            generatedAt: res.created_at || new Date().toISOString(),
            roleTitle: 'Software Engineering & AI',
            summary: content.summary || 'Comprehensive evaluation of skill readiness, role alignment, and growth roadmap.',
            keyStrengths: content.key_strengths || ['Python & FastAPI architecture', 'Relational database schema design'],
            skillGaps: content.skill_gaps || ['Production Docker workflows', 'Distributed caching with Redis'],
            jobCompatibility: content.compatibility_score || 82,
            recommendedNextSteps: content.next_steps || ['Complete milestone tasks in learning roadmap', 'Deploy sample project to staging environment'],
          };
          setSelected(formatted);
          setGenerating(null);
          return;
        }
      } catch {
        // Fallback gracefully
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    setGenerating(null);
    const report = reports.find(r => r.id === id);
    if (report) setSelected(report);
  };

  const handlePrint = () => window.print();

  const formatType = (t: CareerReport['type']) =>
    t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  if (selected) {
    return (
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in print:space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <button onClick={() => setSelected(null)} className="btn-ghost text-sm">
            ← Back to Reports
          </button>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="btn-secondary text-sm">
              <Download className="w-4 h-4" /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Report header */}
        <div className="card p-6 print:border-0 print:shadow-none">
          <div className="flex items-start gap-4 mb-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', REPORT_BG[selected.type])}>
              {REPORT_ICONS[selected.type]}
            </div>
            <div>
              <p className="text-xs text-[#858585] mb-0.5">CareerIQ · Intelligence Report · {formatType(selected.type)}</p>
              <h1 className="text-xl font-bold text-[#111111]">{selected.title}</h1>
              {selected.roleTitle && <p className="text-sm text-[#666666]">Role: {selected.roleTitle}</p>}
            </div>
          </div>
          <p className="text-xs text-[#858585]">
            Generated: {new Date(selected.generatedAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>

        {/* Summary */}
        <div className="card p-5 print:border print:border-gray-200">
          <h2 className="text-sm font-semibold text-[#111111] mb-3">Summary</h2>
          <p className="text-sm text-[#666666] leading-relaxed">{selected.summary}</p>
          {selected.jobCompatibility !== undefined && (
            <div className="mt-4 flex items-center gap-3">
              <div className="text-center bg-[#EAF3FF] rounded-xl px-4 py-3">
                <p className="text-2xl font-bold text-[#1a5fb4]">{selected.jobCompatibility}%</p>
                <p className="text-xs text-[#858585]">Job Compatibility</p>
              </div>
            </div>
          )}
        </div>

        {/* Strengths */}
        {selected.keyStrengths.length > 0 && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-[#111111] mb-3">Key Strengths</h2>
            <ul className="space-y-2">
              {selected.keyStrengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1a6b3a] flex-shrink-0 mt-1.5" />
                  <span className="text-sm text-[#666666]">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Gaps */}
        {selected.skillGaps.length > 0 && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-[#111111] mb-3">Areas to Improve</h2>
            <ul className="space-y-2">
              {selected.skillGaps.map((g, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] flex-shrink-0 mt-1.5" />
                  <span className="text-sm text-[#666666]">{g}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next steps */}
        {selected.recommendedNextSteps.length > 0 && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-[#111111] mb-3">Recommended Next Steps</h2>
            <ol className="space-y-2">
              {selected.recommendedNextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#111111] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[#666666]">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <p className="text-xs text-center text-[#858585] print:block">
          Generated by CareerIQ Intelligence System · Candidate Career Profile Report
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Reports & Analytics"
        description="Generate and review career analysis reports."
        badge="Export & Print Supported"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map(report => (
          <div key={report.id} className="card p-5 card-hover">
            <div className="flex items-start gap-4 mb-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', REPORT_BG[report.type])}>
                {REPORT_ICONS[report.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#858585] mb-0.5">{formatType(report.type)}</p>
                <h3 className="text-sm font-semibold text-[#111111]">{report.title}</h3>
                {report.roleTitle && <p className="text-xs text-[#666666]">Role: {report.roleTitle}</p>}
              </div>
            </div>
            <p className="text-xs text-[#666666] leading-relaxed mb-4 line-clamp-3">{report.summary}</p>
            {report.jobCompatibility !== undefined && (
              <p className="text-xs text-[#1a5fb4] font-medium mb-3">
                Compatibility: {report.jobCompatibility}%
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(report)}
                className="btn-secondary flex-1 justify-center text-xs py-2"
              >
                View Report
              </button>
              <button
                onClick={() => handleGenerate(report.id)}
                disabled={generating === report.id}
                className="btn-ghost text-xs py-2 px-3"
                title="Re-generate"
              >
                {generating === report.id
                  ? <span className="w-4 h-4 border-2 border-[#EAEAEA] border-t-[#111111] rounded-full animate-spin" />
                  : <RefreshCw className="w-4 h-4" />
                }
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
