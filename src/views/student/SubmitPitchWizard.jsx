import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Globe,
  Users,
  FileCode,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { pitchesAPI } from '../../api/pitches';
import { useToast } from '../../context/ToastContext';

export const SubmitPitchWizard = ({ selectedProblem, onBack, onSuccess }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(selectedProblem?.category || 'water');
  const [publicSummary, setPublicSummary] = useState('');
  const [confidentialPackage, setConfidentialPackage] = useState('');
  const [teamEmails, setTeamEmails] = useState('student2@bitsindri.ac.in');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !publicSummary || !confidentialPackage) {
      showToast('Please fill in all mandatory fields.', 'error');
      return;
    }

    const payload = {
      issue: selectedProblem?.id || 1,
      title,
      public_summary: publicSummary,
      confidential_package: confidentialPackage,
      team_member_ids: [],
    };

    setLoading(true);
    try {
      const created = await pitchesAPI.createPitch(payload);
      showToast('Pitch submitted successfully! SHA-256 Prior-Art Hash generated.', 'success');
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

            {selectedProblem && (
              <div
                style={{
                  background: '#F8FAFC',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '2px' }}>
                  TARGET PROBLEM
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                  {selectedProblem.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  📍 {selectedProblem.district}
                </div>
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

            <div className="form-group">
              <label className="form-label">Collaborating Student Team Member Emails</label>
              <input
                type="text"
                className="form-input"
                placeholder="student2@bitsindri.ac.in, teammate@bitsindri.ac.in"
                value={teamEmails}
                onChange={(e) => setTeamEmails(e.target.value)}
              />
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
