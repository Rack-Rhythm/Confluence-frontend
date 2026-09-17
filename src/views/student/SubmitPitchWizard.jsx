import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Globe,
  Users,
  FileCode,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { pitchesAPI } from '../../api/pitches';
import { issuesAPI } from '../../api/issues';
import { authAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const SubmitPitchWizard = ({ selectedProblem, onBack, onSuccess }) => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [problem, setProblem] = useState(selectedProblem || null);
  const [adoptedList, setAdoptedList] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [step, setStep] = useState(1);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(selectedProblem?.category || 'water');
  const [publicSummary, setPublicSummary] = useState('');
  const [confidentialPackage, setConfidentialPackage] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [documentationUrl, setDocumentationUrl] = useState('');
  const [teamEmails, setTeamEmails] = useState('student2@bitsindri.ac.in');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const univId = user?.university_id || user?.university?.id;
    if (univId) {
      authAPI.getUniversityStudents(univId)
        .then((students) => {
          const list = Array.isArray(students) ? students : students?.results || [];
          setAvailableStudents(list.filter((s) => s.id !== user?.id));
        })
        .catch((err) => console.error('Failed to load university students:', err));
    }
  }, [user]);

  useEffect(() => {
    if (!selectedProblem && problemId) {
      issuesAPI.getIssue(problemId)
        .then((data) => {
          setProblem(data);
          if (data.category) setCategory(data.category);
        })
        .catch((err) => console.error('Failed to load problem for pitch:', err));
    } else if (selectedProblem) {
      setProblem(selectedProblem);
      if (selectedProblem.category) setCategory(selectedProblem.category);
    } else {
      issuesAPI.getIssues({ status: 'adopted,assigned' })
        .then((res) => {
          const list = Array.isArray(res) ? res : res.results || [];
          setAdoptedList(list);
          if (list.length > 0) {
            setProblem(list[0]);
            if (list[0].category) setCategory(list[0].category);
          }
        })
        .catch((err) => console.error('Failed to load adopted problems for pitch:', err));
    }
  }, [problemId, selectedProblem]);

  const enteredEmails = teamEmails
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const resolvedMembers = availableStudents.filter((s) =>
    enteredEmails.includes((s.email || '').toLowerCase())
  );

  const unresolvedEmails = enteredEmails.filter(
    (email) => !availableStudents.some((s) => (s.email || '').toLowerCase() === email)
  );

  const handleSubmit = async () => {
    if (!title || !publicSummary || !confidentialPackage) {
      showToast('Please fill in all mandatory fields.', 'error');
      return;
    }

    const resolvedIssueId = problem?.id || (problemId ? parseInt(problemId, 10) : null);
    if (!resolvedIssueId) {
      showToast('Please select a valid problem statement before submitting.', 'error');
      return;
    }

    const payload = {
      issue: resolvedIssueId,
      title,
      public_summary: publicSummary,
      confidential_package: confidentialPackage,
      repository_url: repositoryUrl,
      demo_url: demoUrl,
      documentation_url: documentationUrl,
      team_member_ids: resolvedMembers.map((m) => m.id),
    };

    setLoading(true);
    try {
      const created = await pitchesAPI.createPitch(payload);
      showToast('Solution proposal submitted successfully! SHA-256 Prior-Art Hash generated.', 'success');
      if (onSuccess) onSuccess(created);
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Failed to submit pitch. Ensure the issue has been adopted by a university.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          onClick={onBack}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>
            Submit Pitch / Solution
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Dual-Package submission: Public community summary + Protected confidential IP package.
          </p>
        </div>
      </div>

      {/* Stepper Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          background: '#FFFFFF',
          padding: '1rem 1.5rem',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { num: 1, title: 'Basic Info' },
          { num: 2, title: 'Public Summary' },
          { num: 3, title: 'Protected IP' },
          { num: 4, title: 'Review & Submit' },
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => s.num < step && setStep(s.num)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: s.num < step ? 'pointer' : 'default',
              opacity: step === s.num ? 1 : step > s.num ? 0.8 : 0.4,
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: step === s.num ? '#2563EB' : step > s.num ? '#10B981' : '#E2E8F0',
                color: step >= s.num ? '#FFFFFF' : '#64748B',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {step > s.num ? '✓' : s.num}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="card" style={{ padding: '2rem' }}>
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem' }}>
              Step 1: Problem & Pitch Overview
            </h3>

            {problem ? (
              <div
                style={{
                  background: '#F8FAFC',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
                    TARGET PROBLEM
                  </div>
                  {adoptedList.length > 1 && (
                    <select
                      value={problem.id}
                      onChange={(e) => {
                        const sel = adoptedList.find((i) => i.id === parseInt(e.target.value, 10));
                        if (sel) {
                          setProblem(sel);
                          if (sel.category) setCategory(sel.category);
                        }
                      }}
                      style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
                    >
                      {adoptedList.map((iss) => (
                        <option key={iss.id} value={iss.id}>
                          Change: {iss.title.slice(0, 35)}...
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                  {problem.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  📍 {problem.district} • {problem.category?.toUpperCase()}
                </div>
              </div>
            ) : (
              <div style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', marginBottom: '1.25rem', color: '#DC2626', fontSize: '0.85rem' }}>
                No active open call problem selected. Please browse open calls from the explore page.
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Solution Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. JalShuddhi: Activated Alumina Dual-Bed Nano Filter"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="water">Water & Sanitation</option>
                <option value="agriculture">Agriculture</option>
                <option value="education">Education</option>
                <option value="urban_infra">Infrastructure</option>
                <option value="environment">Environment</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  if (!title) {
                    showToast('Please enter a solution title.', 'error');
                    return;
                  }
                  setStep(2);
                }}
                className="btn btn-primary"
                style={{ background: '#2563EB', borderRadius: '10px' }}
              >
                Next: Public Summary <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Public Summary */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <Globe size={20} color="#2563EB" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                Step 2: Public Summary (Citizen Visible)
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              This summary is visible to the public and grassroots citizens so they can provide real-world feedback without exposing your intellectual property.
            </p>

            <div className="form-group">
              <label className="form-label">Public Abstract / Layman Summary *</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="Explain what the solution is, how it works in plain language, how it is powered, and how community members will operate or benefit from it..."
                value={publicSummary}
                onChange={(e) => setPublicSummary(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-outline"
                style={{ borderRadius: '10px' }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!publicSummary) {
                    showToast('Please provide a public summary.', 'error');
                    return;
                  }
                  setStep(3);
                }}
                className="btn btn-primary"
                style={{ background: '#2563EB', borderRadius: '10px' }}
              >
                Next: Confidential IP <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confidential IP */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <Lock size={20} color="#8B5CF6" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                Step 3: Confidential Technical IP Package
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Protected under server-side RBAC. Visible ONLY to your team, university coordinator, assigned faculty mentor, and approved industry partners.
            </p>

            <div className="form-group">
              <label className="form-label">Proprietary Technical Specifications, Architecture & Formulation *</label>
              <textarea
                className="form-textarea"
                rows={6}
                placeholder="Detailed technical specification: CAD commit URLs, chemical formulations (rGO / nano-alumina ratios), circuit PCB schematics, microcontrollers (ESP32/STM32), GSM telemetry..."
                value={confidentialPackage}
                onChange={(e) => setConfidentialPackage(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">GitHub / Repository URL (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/team/smart-filtration"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Live Prototype / Demo URL (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://demo.jalshuddhi.org"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Architecture / Documentation URL (Optional)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://docs.jalshuddhi.org/architecture.pdf"
                value={documentationUrl}
                onChange={(e) => setDocumentationUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Collaborating Student Team Member Emails</span>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                  (Must be students from your university)
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. teammate1@bitsindri.ac.in, teammate2@bitsindri.ac.in"
                value={teamEmails}
                onChange={(e) => setTeamEmails(e.target.value)}
              />

              {availableStudents.length > 0 && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Quick Add:</span>
                  {availableStudents.slice(0, 5).map((stud) => {
                    const isAdded = enteredEmails.includes((stud.email || '').toLowerCase());
                    return (
                      <button
                        key={stud.id}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            const remaining = enteredEmails.filter((e) => e !== (stud.email || '').toLowerCase());
                            setTeamEmails(remaining.join(', '));
                          } else {
                            const updated = [...enteredEmails, stud.email.toLowerCase()];
                            setTeamEmails(updated.join(', '));
                          }
                        }}
                        style={{
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          border: isAdded ? '1px solid #2563EB' : '1px solid #CBD5E1',
                          background: isAdded ? '#EFF6FF' : '#FFFFFF',
                          color: isAdded ? '#1D4ED8' : '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        {isAdded ? '✓ ' : '+ '}{stud.name || stud.email}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Resolved Teammate Badges */}
              {resolvedMembers.length > 0 && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
                    ✓ Confirmed Student Teammates ({resolvedMembers.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {resolvedMembers.map((m) => (
                      <span
                        key={m.id}
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: '#DCFCE7',
                          color: '#15803D',
                          fontWeight: 600,
                        }}
                      >
                        {m.name} ({m.email})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Unresolved warning */}
              {unresolvedEmails.length > 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#D97706' }}>
                  ⚠️ Not found in your university student roster: {unresolvedEmails.join(', ')}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn btn-outline"
                style={{ borderRadius: '10px' }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!confidentialPackage) {
                    showToast('Please provide your technical IP package.', 'error');
                    return;
                  }
                  setStep(4);
                }}
                className="btn btn-primary"
                style={{ background: '#2563EB', borderRadius: '10px' }}
              >
                Next: Review & Submit <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <ShieldCheck size={22} color="#10B981" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                Step 4: Prior-Art Review & Submission
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Upon submission, an immutable SHA-256 cryptographic hash will be stamped as proof of prior art.
            </p>

            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>SOLUTION TITLE</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>{title}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>TEAM MEMBERS</div>
                <div style={{ fontSize: '0.85rem', color: '#0F172A', display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#EFF6FF', color: '#1D4ED8', fontWeight: 600 }}>
                    {user?.name || user?.email || 'You'} (Lead)
                  </span>
                  {resolvedMembers.map((m) => (
                    <span key={m.id} style={{ padding: '2px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#334155', fontWeight: 500 }}>
                      {m.name} ({m.email})
                    </span>
                  ))}
                  {resolvedMembers.length === 0 && (
                    <span style={{ color: '#64748B', fontStyle: 'italic' }}>Individual / Solo Submission</span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>PUBLIC SUMMARY</div>
                <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.4 }}>{publicSummary}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>PROTECTED IP</div>
                <div style={{ fontSize: '0.85rem', color: '#6D28D9', fontFamily: 'monospace' }}>
                  {confidentialPackage.substring(0, 100)}... [Encrypted & Salted with Submission Timestamp]
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn btn-outline"
                style={{ borderRadius: '10px' }}
              >
                Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="btn btn-primary"
                style={{ background: '#10B981', borderRadius: '10px', padding: '0.75rem 2rem' }}
              >
                {loading ? 'Submitting & Generating Hash...' : '✓ Submit Pitch Final'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
