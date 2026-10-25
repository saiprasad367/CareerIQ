import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, FileText, Compass, Briefcase, GitMerge,
  FileSearch, BookOpen, CheckCircle, Shield, Sparkles,
  TrendingUp, Target, BarChart3, Users
} from 'lucide-react';
import { MarketingNavbar } from '@/components/navigation/MarketingNavbar';
import { MarketingFooter } from '@/components/navigation/MarketingFooter';

const features = [
  { icon: FileText, title: 'Resume Intelligence', description: 'Extract skills, education, and experience from your resume automatically.', color: 'bg-[#EAF3FF]', iconColor: 'text-[#1a5fb4]' },
  { icon: Compass, title: 'Career Path Discovery', description: 'Discover which roles align with your current skills and experience.', color: 'bg-[#E8F6EE]', iconColor: 'text-[#1a6b3a]' },
  { icon: Briefcase, title: 'Job Matching', description: 'Get ranked job matches with a detailed breakdown of why each role fits.', color: 'bg-[#F0EDFF]', iconColor: 'text-[#4c1d95]' },
  { icon: GitMerge, title: 'Skill-Gap Analysis', description: 'See exactly which skills you need and how to prioritize learning them.', color: 'bg-[#FFF3D9]', iconColor: 'text-[#92400e]' },
];

const steps = [
  { number: '01', title: 'Build your profile', description: 'Upload your resume or enter your skills, projects, and education.' },
  { number: '02', title: 'Get career intelligence', description: 'The system analyzes your profile and maps you to suitable career roles.' },
  { number: '03', title: 'Act on your roadmap', description: 'Follow your personalized plan to close skill gaps and land your next role.' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNavbar />

      {/* Hero */}
      <section className="max-w-content mx-auto px-4 sm:px-6 pt-16 md:pt-24 pb-12 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-[#858585] uppercase tracking-widest mb-5">
            Career Intelligence, Reimagined
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#111111] tracking-tight leading-tight mb-6 text-balance">
            Build a career that<br />moves you forward.
          </h1>
          <p className="text-lg text-[#666666] leading-relaxed mb-8 max-w-xl mx-auto">
            Understand your strengths, discover the roles that fit your profile, and turn missing skills into a clear plan for growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup" className="btn-primary py-3 px-6 text-sm">
              Analyze My Resume <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/features" className="btn-secondary py-3 px-6 text-sm">
              Explore the Platform
            </Link>
          </div>
          <p className="text-xs text-[#858585] mt-4">
            AI-Powered Career Intelligence · Real-time Resume Parsing & Live Job Matching
          </p>
        </div>

        {/* Product preview card */}
        <div className="mt-14 max-w-2xl mx-auto">
          <div className="card p-6 text-left">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-[#858585] mb-1">Candidate Readiness Profile</p>
                <p className="text-xl font-bold text-[#111111]">Candidate Profile</p>
                <p className="text-xs text-[#666666]">B.Tech CSE (AI & ML)</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border-4 border-[#1a5fb4] flex items-center justify-center">
                  <span className="text-lg font-bold text-[#1a5fb4]">78</span>
                </div>
                <p className="text-[10px] text-[#858585] mt-1">Readiness</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Best Match', value: 'Backend Developer', accent: 'bg-[#EAF3FF] text-[#1a5fb4]' },
                { label: 'Match Score', value: '82%', accent: 'bg-[#E8F6EE] text-[#1a6b3a]' },
                { label: 'Skills Found', value: '18 skills', accent: 'bg-[#F0EDFF] text-[#4c1d95]' },
                { label: 'Job Matches', value: '12 relevant', accent: 'bg-[#FFF3D9] text-[#92400e]' },
              ].map(item => (
                <div key={item.label} className="bg-[#F7F8FA] rounded-lg p-3">
                  <p className="text-xs text-[#858585] mb-0.5">{item.label}</p>
                  <p className={`text-sm font-semibold ${item.accent.split(' ')[1]}`}>{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-medium text-[#111111] mb-2">Recommended next steps</p>
              {[
                'Complete Docker Fundamentals course — 4 hours',
                'Add Redis caching to your backend project',
                'Apply to Groww Backend Developer role — 82% match',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#1a6b3a] flex-shrink-0" />
                  <span className="text-xs text-[#666666]">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-[#858585] mt-2 text-center">Real-time candidate profile visualization</p>
        </div>
      </section>

      {/* Problem section */}
      <section className="bg-[#F7F8FA] py-16 md:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-[#111111] tracking-tight mb-4">
              Career planning is fragmented. It doesn't have to be.
            </h2>
            <p className="text-base text-[#666666] leading-relaxed">
              Students often have skills, projects, and qualifications — but lack clarity on which roles fit, how resumes align with specific jobs, and what to learn next. CareerIQ brings it all together.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(f => (
              <div key={f.title} className="card p-5">
                <div className={`w-9 h-9 rounded-lg ${f.color} flex items-center justify-center mb-3`}>
                  <f.icon className={`w-4.5 h-4.5 ${f.iconColor}`} />
                </div>
                <h3 className="text-sm font-semibold text-[#111111] mb-1.5">{f.title}</h3>
                <p className="text-xs text-[#666666] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#111111] tracking-tight mb-3">
              Three steps to career clarity
            </h2>
            <p className="text-base text-[#666666]">From profile to personalized plan in minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {steps.map((step, idx) => (
              <div key={step.number} className="relative">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#111111] mb-1">{step.title}</h3>
                    <p className="text-sm text-[#666666] leading-relaxed">{step.description}</p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-full w-full h-px bg-[#EAEAEA] -translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy section */}
      <section className="bg-[#F7F8FA] py-12">
        <div className="max-w-content mx-auto px-4 sm:px-6 text-center">
          <Shield className="w-8 h-8 text-[#858585] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#111111] mb-2">Privacy and transparency</h3>
          <p className="text-sm text-[#666666] max-w-lg mx-auto leading-relaxed">
            Private and secure file processing. Resumes are stored securely in backend storage and parsed on your server without third-party tracking. Mathematical models provide explainable role compatibility metrics.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-[#111111] tracking-tight mb-4">
            Ready to explore?
          </h2>
          <p className="text-base text-[#666666] mb-8 max-w-md mx-auto">
            Create your candidate profile and explore the complete career intelligence workspace.
          </p>
          <Link to="/signup" className="btn-primary py-3 px-8 text-sm">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
