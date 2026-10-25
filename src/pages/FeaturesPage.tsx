import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Compass, Briefcase, GitMerge, FileSearch,
  BookOpen, ClipboardList, MessageSquare, BarChart3,
  Shield, ArrowRight, CheckCircle
} from 'lucide-react';
import { MarketingNavbar } from '@/components/navigation/MarketingNavbar';
import { MarketingFooter } from '@/components/navigation/MarketingFooter';

const features = [
  {
    icon: FileText, title: 'Resume Intelligence', href: '/app/resume-analyzer',
    color: 'bg-[#EAF3FF]', iconColor: 'text-[#1a5fb4]',
    description: 'Upload a PDF or DOCX resume. The system extracts education, skills, projects, experience, and certifications. You can review, correct, and save the result.',
    bullets: ['Automatic skill extraction and normalization', 'Section completeness check', 'Missing information detection', 'Support for PDF and DOCX'],
  },
  {
    icon: Compass, title: 'Career Path Discovery', href: '/app/career-paths',
    color: 'bg-[#E8F6EE]', iconColor: 'text-[#1a6b3a]',
    description: 'Discover which of seven technology career roles match your current profile. Compare roles side by side and explore detailed requirements.',
    bullets: ['Role suitability scores for 7 tech roles', 'Side-by-side role comparison', 'Strengths and gaps per role', 'Suggested projects per role'],
  },
  {
    icon: Briefcase, title: 'Job Matching', href: '/app/jobs',
    color: 'bg-[#F0EDFF]', iconColor: 'text-[#4c1d95]',
    description: 'Browse real-time job listings and verified openings with detailed profile-to-job match breakdowns. Filter by role, location, work mode, and match score.',
    bullets: ['Hybrid skill + semantic matching', 'Matched and missing skill breakdown', 'Filter by role, location, work mode', 'Save jobs and track applications'],
  },
  {
    icon: GitMerge, title: 'Skill-Gap Analysis', href: '/app/skill-gaps',
    color: 'bg-[#FFF3D9]', iconColor: 'text-[#92400e]',
    description: 'Understand exactly which skills you need for your target role, how important they are, and what to learn first — with resource links.',
    bullets: ['Priority-ordered skill gaps', 'Importance and effort estimates', 'Prerequisite relationships', 'One-click add to learning roadmap'],
  },
  {
    icon: FileSearch, title: 'ATS Compatibility', href: '/app/resume-optimizer',
    color: 'bg-[#EAF3FF]', iconColor: 'text-[#1a5fb4]',
    description: 'Analyze how well your resume aligns with a specific job description using a documented formula. See keyword gaps and section quality.',
    bullets: ['Formula: A = 0.60R + 0.25T + 0.15F', 'Keyword and skill gap analysis', 'Section completeness audit', 'Bullet improvement suggestions'],
  },
  {
    icon: BookOpen, title: 'Personalized Learning', href: '/app/learning-roadmap',
    color: 'bg-[#E8F6EE]', iconColor: 'text-[#1a6b3a]',
    description: 'A structured roadmap built from your skill gaps — organized into fundamentals, applied skills, and portfolio projects.',
    bullets: ['3-phase roadmap structure', 'Task progress tracking', 'Curated resource links', 'Add custom learning tasks'],
  },
  {
    icon: ClipboardList, title: 'Application Tracking', href: '/app/applications',
    color: 'bg-[#F0EDFF]', iconColor: 'text-[#4c1d95]',
    description: 'Track every job application from saved to offer. Use list or kanban view, add notes, set follow-up dates, and update statuses.',
    bullets: ['7 status stages', 'List and kanban board views', 'Notes and follow-up dates', 'Persistent local state'],
  },
  {
    icon: MessageSquare, title: 'Career Assistant', href: '/app/assistant',
    color: 'bg-[#FFF3D9]', iconColor: 'text-[#92400e]',
    description: 'A simulated career assistant that responds to your questions using your candidate profile. Uses local mock responses — no external AI calls.',
    bullets: ['Profile-aware responses', 'Suggested question prompts', 'Clean chat interface', 'Conversation history'],
  },
  {
    icon: BarChart3, title: 'Reports and Analytics', href: '/app/reports',
    color: 'bg-[#E8F6EE]', iconColor: 'text-[#1a6b3a]',
    description: 'Generate and review career analysis reports. Export them using the browser\'s print-to-PDF function.',
    bullets: ['Resume analysis report', 'Career recommendation report', 'Skill-gap summary', 'Learning progress summary'],
  },
];

export function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNavbar />
      <div className="max-w-content mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-[#111111] tracking-tight mb-4">
            Every tool you need in one workspace
          </h1>
          <p className="text-lg text-[#666666] max-w-xl mx-auto leading-relaxed">
            CareerIQ covers the complete career-intelligence journey — from resume parsing to a personalized action plan.
          </p>
        </div>

        <div className="space-y-12">
          {features.map((f, idx) => (
            <div
              key={f.title}
              className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-start`}
            >
              <div className="flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h2 className="text-2xl font-bold text-[#111111] mb-3">{f.title}</h2>
                <p className="text-base text-[#666666] leading-relaxed mb-4">{f.description}</p>
                <ul className="space-y-2 mb-5">
                  {f.bullets.map(b => (
                    <li key={b} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#1a6b3a] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#666666]">{b}</span>
                    </li>
                  ))}
                </ul>
                <Link to={f.href} className="btn-primary text-sm py-2 px-4">
                  Open {f.title} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`card p-5 ${f.color}/20`}>
                  <div className="h-32 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-16 h-16 rounded-2xl ${f.color} flex items-center justify-center`}>
                        <f.icon className={`w-8 h-8 ${f.iconColor}`} />
                      </div>
                      <p className="text-xs text-[#858585] text-center max-w-36">{f.title} workspace</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center border-t border-[#EAEAEA] pt-12">
          <Shield className="w-8 h-8 text-[#858585] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#111111] mb-2">Security and privacy assurance</h3>
          <p className="text-sm text-[#666666] max-w-xl mx-auto leading-relaxed">
            Your career data is stored privately and secured using Argon2id password hashing and JWT authorization. Resumes are parsed securely on your dedicated backend server without third-party data tracking. Scoring formulas are fully explainable and deterministic.
          </p>
        </div>
      </div>
      <MarketingFooter />
    </div>
  );
}
