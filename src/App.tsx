import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';

// ── Marketing pages ──
import { LandingPage } from '@/pages/LandingPage';
import { FeaturesPage } from '@/pages/FeaturesPage';
import { HowItWorksPage } from '@/pages/HowItWorksPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// ── App pages ──
import { DashboardPage } from '@/pages/app/DashboardPage';
import { ResumeAnalyzerPage } from '@/pages/app/ResumeAnalyzerPage';
import { CareerPathsPage } from '@/pages/app/CareerPathsPage';
import { JobsPage } from '@/pages/app/JobsPage';
import { JobDetailPage } from '@/pages/app/JobDetailPage';
import { SkillGapsPage } from '@/pages/app/SkillGapsPage';
import { ResumeOptimizerPage } from '@/pages/app/ResumeOptimizerPage';
import { LearningRoadmapPage } from '@/pages/app/LearningRoadmapPage';
import { ApplicationsPage } from '@/pages/app/ApplicationsPage';
import { AssistantPage } from '@/pages/app/AssistantPage';
import { ReportsPage } from '@/pages/app/ReportsPage';
import { SettingsPage } from '@/pages/app/SettingsPage';

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-2 h-2 rounded-full bg-[#EAEAEA] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing / public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* App routes (authenticated shell) */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="resume-analyzer" element={<ResumeAnalyzerPage />} />
          <Route path="career-paths" element={<CareerPathsPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:jobId" element={<JobDetailPage />} />
          <Route path="skill-gaps" element={<SkillGapsPage />} />
          <Route path="resume-optimizer" element={<ResumeOptimizerPage />} />
          <Route path="learning-roadmap" element={<LearningRoadmapPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
