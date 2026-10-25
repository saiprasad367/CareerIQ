import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Sparkles, Info, CheckCircle } from 'lucide-react';
import { storage } from '@/lib/storage';
import { api } from '@/services/api';

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    education: '', careerGoal: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.includes('@')) errs.email = 'Enter a valid email.';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (!form.education.trim()) errs.education = 'Education is required.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);

    try {
      await api.auth.register({
        email: form.email,
        password: form.password,
        full_name: form.name,
      });
      setSuccess(true);
      setTimeout(() => navigate('/onboarding'), 1200);
    } catch (err: any) {
      setErrors({ email: err.message || 'Registration failed. Email may already be in use.' });
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ id, label, type = 'text', placeholder, value, error, onChange }: {
    id: string; label: string; type?: string; placeholder?: string;
    value: string; error?: string; onChange: (v: string) => void;
  }) => (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input
        id={id} type={type} className={`input ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
        placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-[#111111] flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold text-[#111111]">CareerIQ</span>
        </div>

        <div className="card p-6 sm:p-8">
          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-[#1a6b3a] mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-[#111111] mb-1">Account created!</h2>
              <p className="text-sm text-[#666666]">Taking you to onboarding…</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-[#111111] mb-1">Create your profile</h1>
              <p className="text-sm text-[#666666] mb-5">Start your career intelligence journey</p>

              <div className="flex items-start gap-2 bg-[#E8F6EE] rounded-lg p-3 mb-5">
                <CheckCircle className="w-4 h-4 text-[#1a6b3a] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#1a6b3a]">
                  Account registration creates your candidate record in the live CareerIQ database.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field id="name" label="Full name" placeholder="Arjun Mehta" value={form.name} error={errors.name}
                  onChange={v => setForm(f => ({ ...f, name: v }))} />
                <Field id="email" label="Email address" type="email" placeholder="you@example.com" value={form.email}
                  error={errors.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
                <div>
                  <label className="label" htmlFor="password">Password</label>
                  <div className="relative">
                    <input id="password" type={showPass ? 'text' : 'password'}
                      className={`input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                      placeholder="At least 6 characters" value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858585]">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                </div>
                <Field id="confirm" label="Confirm password" type={showPass ? 'text' : 'password'}
                  placeholder="Repeat password" value={form.confirmPassword} error={errors.confirmPassword}
                  onChange={v => setForm(f => ({ ...f, confirmPassword: v }))} />
                <div>
                  <label className="label" htmlFor="education">Current education</label>
                  <select id="education" className="input" value={form.education}
                    onChange={e => setForm(f => ({ ...f, education: e.target.value }))}>
                    <option value="">Select level…</option>
                    <option>B.Tech / B.E.</option>
                    <option>M.Tech / M.E.</option>
                    <option>BCA / MCA</option>
                    <option>B.Sc / M.Sc</option>
                    <option>MBA</option>
                    <option>Other</option>
                  </select>
                  {errors.education && <p className="text-xs text-red-600 mt-1">{errors.education}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="goal">Career goal <span className="text-[#858585] font-normal">(optional)</span></label>
                  <input id="goal" type="text" className="input" placeholder="e.g., Backend Developer at a tech startup"
                    value={form.careerGoal} onChange={e => setForm(f => ({ ...f, careerGoal: e.target.value }))} />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Creating profile…
                    </span>
                  ) : (
                    <>Create profile <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className="text-sm text-[#666666] text-center mt-5">
                Already have an account?{' '}
                <Link to="/login" className="text-[#111111] font-medium hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
        <p className="text-xs text-center text-[#858585] mt-4">
          <Link to="/" className="hover:text-[#111111]">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
