import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function MarketingFooter() {
  return (
    <footer className="bg-white border-t border-[#EAEAEA]">
      <div className="max-w-content mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#111111] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-[#111111]">CareerIQ</span>
            </Link>
            <p className="text-sm text-[#666666] leading-relaxed">
              AI-powered career intelligence for students and fresh graduates. Built as a B.Tech final-year project.
            </p>
            <p className="text-xs text-[#858585] mt-3">
              Demo product. Not for commercial use.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2">
              {[
                { label: 'Features', href: '/features' },
                { label: 'How It Works', href: '/how-it-works' },
                { label: 'Analyze Resume', href: '/app/resume-analyzer' },
                { label: 'Job Matches', href: '/app/jobs' },
              ].map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-[#666666] hover:text-[#111111] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider mb-3">Tools</h4>
            <ul className="space-y-2">
              {[
                { label: 'Skill Gap Analysis', href: '/app/skill-gaps' },
                { label: 'Resume Optimizer', href: '/app/resume-optimizer' },
                { label: 'Learning Roadmap', href: '/app/learning-roadmap' },
                { label: 'Career Assistant', href: '/app/assistant' },
              ].map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-[#666666] hover:text-[#111111] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider mb-3">Account</h4>
            <ul className="space-y-2">
              {[
                { label: 'Sign Up', href: '/signup' },
                { label: 'Sign In', href: '/login' },
                { label: 'Dashboard', href: '/app' },
                { label: 'Settings', href: '/app/settings' },
              ].map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-[#666666] hover:text-[#111111] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#EAEAEA] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#858585]">
            © 2026 CareerIQ — AI-Powered Career Intelligence, Skill Gap Analysis & Personalized Job Recommendation System.
          </p>
          <p className="text-xs text-[#858585]">
            Powered by live API services, real-time resume parsing, and Google Gemini AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
