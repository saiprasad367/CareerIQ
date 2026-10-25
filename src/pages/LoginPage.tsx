import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Sparkles, Info, CheckCircle } from 'lucide-react';
import { storage } from '@/lib/storage';

import { api } from '@/services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);

    try {
      const res = await api.auth.login({ email: form.email, password: form.password });
      if (res.onboarding_completed) {
        navigate('/app');
      } else {
        navigate('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials or use Demo Mode.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    storage.setUser({ name: 'Arjun Mehta', email: 'arjun.mehta@example.com' });
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-[#111111] flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold text-[#111111]">CareerIQ</span>
        </div>

        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-bold text-[#111111] mb-1">Welcome back</h1>
          <p className="text-sm text-[#666666] mb-6">Sign in to your career workspace</p>

          {/* Connected Backend status */}
          <div className="flex items-center gap-2 bg-[#E8F6EE] rounded-lg p-3 mb-5">
            <CheckCircle className="w-4 h-4 text-[#1a6b3a] flex-shrink-0" />
            <p className="text-xs text-[#1a6b3a]">
              Connected to CareerIQ backend server and live database.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0" htmlFor="password">Password</label>
                <button type="button" className="text-xs text-[#858585] hover:text-[#111111] transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858585] hover:text-[#111111]"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-[#EAEAEA]"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              <label htmlFor="remember" className="text-sm text-[#666666] cursor-pointer">Remember me</label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-sm text-[#666666] text-center mt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#111111] font-medium hover:underline">Create one</Link>
          </p>
        </div>

        <p className="text-xs text-center text-[#858585] mt-4">
          <Link to="/" className="hover:text-[#111111]">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
