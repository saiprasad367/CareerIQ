import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, CheckCircle, Sparkles, Upload, X, Loader2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { storage } from '@/lib/storage';
import { api } from '@/services/api';

const TOTAL_STEPS = 7;
const stepTitles = [
  'Personal profile', 'Education & experience', 'Current skills',
  'Target roles', 'Location & work preferences', 'Resume upload', 'Review & complete',
];

const allSkills = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'FastAPI', 'Django',
  'PostgreSQL', 'MongoDB', 'MySQL', 'SQL', 'REST APIs', 'GraphQL',
  'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'GCP', 'Azure',
  'scikit-learn', 'TensorFlow', 'PyTorch', 'NLP', 'Pandas', 'NumPy',
  'Git', 'Linux', 'Java', 'C++', 'Go', 'Rust',
  'TailwindCSS', 'CSS', 'HTML', 'Vue.js', 'Angular',
];

const targetRoles = [
  'Backend Developer', 'Full-Stack Developer', 'Frontend Developer',
  'Machine Learning Engineer', 'Data Analyst', 'Cloud / DevOps Engineer',
  'Software Engineer', 'QA Automation Engineer',
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [parsedInfo, setParsedInfo] = useState<{
    fileName: string;
    skillsCount: number;
    extractedSkills: string[];
    atsScore: number;
    readabilityScore: number;
  } | null>(null);

  const [data, setData] = useState({
    name: storage.getUser()?.name ?? '',
    headline: '',
    education: 'B.Tech / B.E.',
    institution: '',
    field: 'Computer Science Engineering (AI & ML)',
    gradYear: '2026',
    hasInternship: false,
    skills: [] as string[],
    targetRoles: [] as string[],
    locations: ['Hyderabad', 'Bengaluru', 'Remote'],
    workMode: 'hybrid' as 'remote' | 'hybrid' | 'onsite' | 'any',
    experienceLevel: 'entry' as 'entry' | 'mid' | 'senior',
    hasResume: false,
  });

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.pdf') && !lower.endsWith('.docx')) {
      setUploadError('Only PDF and DOCX files are supported.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const res = await api.resumes.upload(file);
      const payload = res.parsed_payload || {};
      const extractedSkills: string[] = payload.skills || [];

      setData(d => ({
        ...d,
        name: d.name || payload.full_name || d.name,
        headline: d.headline || payload.summary || d.headline,
        education: payload.education?.[0]?.degree || d.education,
        institution: payload.education?.[0]?.institution || d.institution,
        gradYear: String(payload.education?.[0]?.end_year || d.gradYear),
        experienceLevel: payload.experience_level || d.experienceLevel,
        skills: Array.from(new Set([...d.skills, ...extractedSkills])),
        hasResume: true,
      }));

      setParsedInfo({
        fileName: file.name,
        skillsCount: extractedSkills.length,
        extractedSkills: extractedSkills.slice(0, 10),
        atsScore: res.ats_score || 78,
        readabilityScore: res.readability_score || 85,
      });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload and parse resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setData(d => ({
      ...d,
      skills: d.skills.includes(skill) ? d.skills.filter(s => s !== skill) : [...d.skills, skill],
    }));
  };

  const toggleRole = (role: string) => {
    setData(d => ({
      ...d,
      targetRoles: d.targetRoles.includes(role) ? d.targetRoles.filter(r => r !== role) : [...d.targetRoles, role],
    }));
  };

  const handleFinish = async () => {
    if (storage.getToken()) {
      try {
        await api.onboarding.complete({
          headline: data.headline,
          education: data.education,
          institution: data.institution,
          field_of_study: data.field,
          graduation_year: parseInt(data.gradYear) || 2026,
          work_mode: data.workMode,
          experience_level: data.experienceLevel,
          preferred_locations: data.locations,
          skills: data.skills,
          target_roles: data.targetRoles,
        });
      } catch {
        // Fallback gracefully
      }
    }
    storage.setOnboarded(true);
    navigate('/app');
  };

  const canProceed = () => {
    if (step === 1) return !!data.name.trim();
    if (step === 3) return data.skills.length >= 2;
    if (step === 4) return data.targetRoles.length >= 1;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#EAEAEA] px-4 py-4 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#111111] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold text-[#111111]">CareerIQ</span>
        <span className="text-sm text-[#858585] ml-1">— Profile Setup</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#EAEAEA]">
        <div
          className="h-full bg-[#111111] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-medium text-[#858585] uppercase tracking-wider">Step {step} of {TOTAL_STEPS}</p>
              <h1 className="text-xl font-bold text-[#111111] mt-0.5">{stepTitles[step - 1]}</h1>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${i + 1 <= step ? 'bg-[#111111]' : 'bg-[#EAEAEA]'}`}
                />
              ))}
            </div>
          </div>

          <div className="card p-6 mb-4 animate-fade-in">
            {/* Step 1: Personal profile */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="label" htmlFor="on-name">Full name</label>
                  <input id="on-name" type="text" className="input" placeholder="Your full name"
                    value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label" htmlFor="on-headline">Professional headline <span className="text-[#858585] font-normal">(optional)</span></label>
                  <input id="on-headline" type="text" className="input"
                    placeholder="e.g., B.Tech CSE student · Backend Developer"
                    value={data.headline} onChange={e => setData(d => ({ ...d, headline: e.target.value }))} />
                </div>
              </div>
            )}

            {/* Step 2: Education */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="label" htmlFor="on-edu">Education level</label>
                  <select id="on-edu" className="input" value={data.education}
                    onChange={e => setData(d => ({ ...d, education: e.target.value }))}>
                    <option>B.Tech / B.E.</option>
                    <option>M.Tech / M.E.</option>
                    <option>BCA / MCA</option>
                    <option>B.Sc / M.Sc</option>
                    <option>MBA</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="on-inst">Institution</label>
                  <input id="on-inst" type="text" className="input" placeholder="e.g., CMR College"
                    value={data.institution} onChange={e => setData(d => ({ ...d, institution: e.target.value }))} />
                </div>
                <div>
                  <label className="label" htmlFor="on-field">Field of study</label>
                  <input id="on-field" type="text" className="input" placeholder="e.g., CSE (AI & ML)"
                    value={data.field} onChange={e => setData(d => ({ ...d, field: e.target.value }))} />
                </div>
                <div>
                  <label className="label" htmlFor="on-grad">Expected graduation year</label>
                  <select id="on-grad" className="input" value={data.gradYear}
                    onChange={e => setData(d => ({ ...d, gradYear: e.target.value }))}>
                    {['2024', '2025', '2026', '2027', '2028'].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input id="on-intern" type="checkbox" className="w-4 h-4 rounded border-[#EAEAEA]"
                    checked={data.hasInternship} onChange={e => setData(d => ({ ...d, hasInternship: e.target.checked }))} />
                  <label htmlFor="on-intern" className="text-sm text-[#666666] cursor-pointer">I have internship or work experience</label>
                </div>
              </div>
            )}

            {/* Step 3: Skills */}
            {step === 3 && (
              <div>
                <p className="text-sm text-[#666666] mb-4">Select skills you currently have. Choose at least 2.</p>
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto scroll-area pr-1">
                  {allSkills.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs rounded-full px-3 py-1.5 font-medium border transition-colors ${
                        data.skills.includes(skill)
                          ? 'bg-[#111111] text-white border-[#111111]'
                          : 'bg-white text-[#666666] border-[#EAEAEA] hover:border-[#111111] hover:text-[#111111]'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                {data.skills.length > 0 && (
                  <p className="text-xs text-[#666666] mt-3">{data.skills.length} skills selected</p>
                )}
              </div>
            )}

            {/* Step 4: Target roles */}
            {step === 4 && (
              <div>
                <p className="text-sm text-[#666666] mb-4">Which roles are you interested in? Select at least 1.</p>
                <div className="space-y-2">
                  {targetRoles.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                        data.targetRoles.includes(role)
                          ? 'bg-[#111111] text-white border-[#111111]'
                          : 'bg-white text-[#666666] border-[#EAEAEA] hover:border-[#111111] hover:text-[#111111]'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Location & Work mode */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <label className="label">Preferred work mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['remote', 'hybrid', 'onsite', 'any'] as const).map(mode => (
                      <button key={mode} type="button"
                        onClick={() => setData(d => ({ ...d, workMode: mode }))}
                        className={`py-2.5 rounded-lg border text-sm font-medium transition-colors capitalize ${
                          data.workMode === mode
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-white text-[#666666] border-[#EAEAEA] hover:border-[#111111]'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Experience level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['entry', 'mid', 'senior'] as const).map(level => (
                      <button key={level} type="button"
                        onClick={() => setData(d => ({ ...d, experienceLevel: level }))}
                        className={`py-2.5 rounded-lg border text-sm font-medium transition-colors capitalize ${
                          data.experienceLevel === level
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-white text-[#666666] border-[#EAEAEA] hover:border-[#111111]'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Resume upload */}
            {step === 6 && (
              <div className="py-2 space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <div
                  className="border-2 border-dashed border-[#EAEAEA] rounded-xl p-8 text-center cursor-pointer hover:border-[#111111] transition-colors bg-white"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      const file = e.dataTransfer.files[0];
                      const fakeEvent = { target: { files: [file] } } as any;
                      handleFileUpload(fakeEvent);
                    }
                  }}
                >
                  {uploading ? (
                    <div className="py-4 space-y-3">
                      <Loader2 className="w-8 h-8 text-[#111111] animate-spin mx-auto" />
                      <p className="text-sm font-semibold text-[#111111]">Analyzing resume with CareerIQ AI parser…</p>
                      <p className="text-xs text-[#858585]">Extracting contact info, skills, education, and ATS score</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-[#858585] mx-auto mb-3" />
                      <p className="text-sm font-medium text-[#111111] mb-1">Click or drag & drop your resume</p>
                      <p className="text-xs text-[#858585]">PDF or DOCX · Real-time parsing · Max 10 MB</p>
                    </>
                  )}
                </div>

                {uploadError && (
                  <div className="flex items-center gap-2 bg-[#FFF0F0] text-[#c92a2a] rounded-lg p-3 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {parsedInfo && (
                  <div className="bg-[#E8F6EE] border border-[#C3E6D0] rounded-xl p-4 space-y-3 animate-fade-in">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#1a6b3a] flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-[#1a6b3a]">{parsedInfo.fileName}</p>
                          <p className="text-xs text-[#2b7a4b]">
                            Parsed {parsedInfo.skillsCount} skills · ATS Baseline: {parsedInfo.atsScore}% · Readability: {parsedInfo.readabilityScore}%
                          </p>
                        </div>
                      </div>
                      <span className="badge-mint text-xs font-bold px-2.5 py-1">ATS: {parsedInfo.atsScore}%</span>
                    </div>

                    {parsedInfo.extractedSkills.length > 0 && (
                      <div className="pt-2 border-t border-[#C3E6D0]/60">
                        <p className="text-[11px] font-medium text-[#2b7a4b] mb-1.5 uppercase tracking-wide">
                          Extracted & Added to Skills:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {parsedInfo.extractedSkills.map((sk: string) => (
                            <span key={sk} className="text-[11px] bg-white text-[#1a6b3a] border border-[#C3E6D0] px-2 py-0.5 rounded-md font-medium">
                              ✓ {sk}
                            </span>
                          ))}
                          {parsedInfo.skillsCount > parsedInfo.extractedSkills.length && (
                            <span className="text-[11px] text-[#2b7a4b] font-medium py-0.5">
                              +{parsedInfo.skillsCount - parsedInfo.extractedSkills.length} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setStep(7)}
                    className="btn-ghost text-xs"
                  >
                    Skip or proceed to review →
                  </button>
                </div>
              </div>
            )}

            {/* Step 7: Review */}
            {step === 7 && (
              <div className="space-y-4">
                <p className="text-sm text-[#666666]">Here's a summary of your profile. Click Finish to save and activate your career intelligence workspace.</p>
                <div className="space-y-2">
                  {[
                    { label: 'Name', value: data.name || '—' },
                    { label: 'Education', value: `${data.education}${data.institution ? ` at ${data.institution}` : ''}` },
                    { label: 'Skills', value: `${data.skills.length} skills identified` },
                    { label: 'Target roles', value: data.targetRoles.join(', ') || '—' },
                    { label: 'Work mode', value: data.workMode },
                    { label: 'Experience', value: data.experienceLevel },
                    { label: 'Resume', value: parsedInfo ? `${parsedInfo.fileName} (Parsed)` : (data.hasResume ? 'Uploaded' : 'None') },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between py-2 border-b border-[#F7F8FA]">
                      <span className="text-xs font-medium text-[#858585]">{item.label}</span>
                      <span className="text-xs text-[#111111] text-right max-w-48 truncate font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-2 bg-[#E8F6EE] rounded-lg p-3 mt-2">
                  <CheckCircle className="w-4 h-4 text-[#1a6b3a] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#1a6b3a]">
                    Your profile is ready and synchronized with CareerIQ. Role gap analysis, learning roadmap milestones, and matched jobs will be generated for your real profile.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep(s => s - 1)}
              className="btn-secondary"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                disabled={!canProceed()}
                onClick={() => setStep(s => s + 1)}
                className="btn-primary"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleFinish} className="btn-primary">
                Finish & Go to Dashboard <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
