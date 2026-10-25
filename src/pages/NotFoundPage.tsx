import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, SearchX } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#EAEAEA] flex items-center justify-center mx-auto mb-6">
          <SearchX className="w-8 h-8 text-[#858585]" />
        </div>
        <h1 className="text-5xl font-bold text-[#111111] mb-2">404</h1>
        <h2 className="text-lg font-semibold text-[#111111] mb-2">Page not found</h2>
        <p className="text-sm text-[#666666] mb-8 leading-relaxed">
          This page doesn't exist. You may have followed a broken link or typed an incorrect URL.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <Link to="/app" className="btn-primary">
            <Home className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
