import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { MarketingNavbar } from '@/components/navigation/MarketingNavbar';
import { MarketingFooter } from '@/components/navigation/MarketingFooter';

const steps = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Register with your name, email, and secure password. Establish your candidate profile in the CareerIQ database.',
    detail: 'Secured with JWT authentication and Argon2id password hashing.',
    href: '/signup',
    label: 'Create Profile',
  },
  {
    number: '02',
    title: 'Upload and parse your resume',
    description: 'Upload your PDF or DOCX file. CareerIQ extracts candidate contacts, technical skills, education history, and computes an ATS readability baseline.',
    detail: 'Private storage with PyMuPDF, pdfplumber, and optional Google Gemini LLM parser.',
    href: '/app/resume-analyzer',
    label: 'Resume Analyzer',
  },
  {
    number: '03',
    title: 'Discover career paths',
    description: 'Explore technology career roles with suitability scores based on your extracted skills. Compare roles side by side.',
    detail: 'Scores use the hybrid ranking formula: M = 0.45K + 0.25E + 0.15X + 0.15P.',
    href: '/app/career-paths',
    label: 'Career Paths',
  },
  {
    number: '04',
    title: 'Match with real job openings',
    description: 'Browse verified tech job openings filtered by role, location, and work mode. Each listing includes direct company career apply URLs.',
    detail: 'Real-time job compatibility scoring with direct links to company application portals.',
    href: '/app/jobs',
    label: 'Job Matches',
  },
  {
    number: '05',
    title: 'Analyze your skill gaps',
    description: 'Select a target role and see a prioritized list of missing skills, with importance weights, prerequisites, estimated learning hours, and course links.',
    detail: 'Mark skills as learned to dynamically update your readiness score.',
    href: '/app/skill-gaps',
    label: 'Skill Gaps',
  },
  {
    number: '06',
    title: 'Optimize your resume for ATS',
    description: 'Analyze keyword alignment against specific job descriptions. View section audits and actionable bullet improvements.',
    detail: 'ATS Compatibility Formula: A = 0.50R + 0.30T + 0.20F.',
    href: '/app/resume-optimizer',
    label: 'Resume Optimizer',
  },
  {
    number: '07',
    title: 'Follow your learning roadmap',
    description: 'A structured plan built from your skill gaps. Organized into Fundamentals, Applied Skills, and Portfolio Projects.',
    detail: 'Progress synchronizes with the database across devices.',
    href: '/app/learning-roadmap',
    label: 'Learning Roadmap',
  },
  {
    number: '08',
    title: 'Track applications with Kanban',
    description: 'Move applied jobs through review, interview, and offer stages. Add interview notes and follow-up deadlines.',
    detail: 'Real-time application state synchronization.',
    href: '/app/applications',
    label: 'Applications',
  },
  {
    number: '09',
    title: 'Consult the AI career assistant',
    description: 'Ask career questions with natural language prompts. The assistant responds using your candidate profile and skills context.',
    detail: 'Powered by contextual career intelligence with optional Gemini generative AI.',
    href: '/app/assistant',
    label: 'Career Assistant',
  },
  {
    number: '10',
    title: 'Export analytics reports',
    description: 'Review generated career intelligence reports and print or export them as PDF documents.',
    detail: 'Reports cover resume analysis, career recommendations, skill gaps, and learning milestones.',
    href: '/app/reports',
    label: 'Reports',
  },
];

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNavbar />
      <div className="max-w-content mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-[#111111] tracking-tight mb-4">
            The complete candidate journey
          </h1>
          <p className="text-lg text-[#666666] max-w-xl mx-auto leading-relaxed">
            CareerIQ guides you from profile creation to a personalized career action plan in ten connected steps.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-[#EAEAEA] hidden md:block" />

          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex gap-6 md:gap-8">
                {/* Step indicator */}
                <div className="flex-shrink-0 hidden md:flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#111111] text-white flex items-center justify-center text-sm font-bold z-10">
                    {idx + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-8">
                  <div className="card p-5 card-hover">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="md:hidden w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <h3 className="text-base font-semibold text-[#111111]">{step.title}</h3>
                        </div>
                        <p className="text-sm text-[#666666] leading-relaxed mb-2">{step.description}</p>
                        <p className="text-xs text-[#858585] italic">{step.detail}</p>
                      </div>
                      <Link
                        to={step.href}
                        className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0 self-start"
                      >
                        {step.label} <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-[#858585] mb-6">Ready to start your career journey?</p>
          <Link to="/signup" className="btn-primary py-3 px-8">
            Create Your Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <MarketingFooter />
    </div>
  );
}
