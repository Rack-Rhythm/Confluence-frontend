import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Sparkles,
  Lightbulb,
  Building2,
  FileText,
  Send,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { StatusBadge, CategoryPill } from '../../components/common/StatusBadge';
import { useParams, useNavigate } from 'react-router-dom';
import { issuesAPI } from '../../api/issues';
import { useToast } from '../../context/ToastContext';

export const ProblemDetailStudent = ({ problem, onBack, onSubmitPitch }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentProblem, setCurrentProblem] = useState(problem || null);
  const [loading, setLoading] = useState(!problem && !!id);
  const [activeTab, setActiveTab] = useState('overview');
  const [nominationRationale, setNominationRationale] = useState('');
  const [showNominateModal, setShowNominateModal] = useState(false);
  const [nominating, setNominating] = useState(false);

  useEffect(() => {
    if (!problem && id) {
      setLoading(true);
      issuesAPI
        .getIssue(id)
        .then((res) => setCurrentProblem(res))
        .catch((err) => console.error('Failed to load student problem:', err))
        .finally(() => setLoading(false));
    } else if (problem) {
      setCurrentProblem(problem);
    }
  }, [id, problem]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748B' }}>
        Loading societal challenge #{id}...
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
          Problem Not Found
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
          The requested problem challenge could not be found or has been archived.
        </p>
        <button onClick={() => (onBack ? onBack() : navigate(-1))} className="btn btn-primary" style={{ borderRadius: '8px' }}>
          Back to Explore
        </button>
      </div>
    );
  }

  problem = currentProblem;

  const handleNominate = async (e) => {
    e.preventDefault();
    setNominating(true);
    try {
      await issuesAPI.nominateIssue(problem.id, nominationRationale);
      showToast('Issue nominated for your university review board!', 'success');
      setShowNominateModal(false);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to nominate issue. You may have already nominated it.';
      showToast(msg, 'error');
    } finally {
      setNominating(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#2563EB',
          width: 'fit-content',
        }}
      >
        <ArrowLeft size={16} /> Back to Explore
      </button>

      {/* Main Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
            {problem.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#64748B' }}>
            <span>📍 {problem.district}, {problem.address || 'India'}</span>
            <span>•</span>
            <span>Reported on {new Date(problem.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <StatusBadge status={problem.status} />
      </div>

      {/* Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 0.85fr', gap: '1.5rem' }}>
        {/* Left column: Tabs + Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Main Photo */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <img
              src={problem.photo_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800'}
              alt={problem.title}
              style={{ width: '100%', height: '320px', objectFit: 'cover' }}
            />
          </div>

          {/* Tab Navigation */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #E2E8F0',
                gap: '1.5rem',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {['overview', 'location', 'attachments'].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    paddingBottom: '0.5rem',
                    color: activeTab === t ? '#2563EB' : '#64748B',
                    borderBottom: activeTab === t ? '2px solid #2563EB' : 'none',
                    textTransform: 'capitalize',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Problem Description
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {problem.description}
                </p>

                {problem.expected_outcome && (
                  <>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                      Target Outcome
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>
                      {problem.expected_outcome}
                    </p>
                  </>
                )}
              </div>
            )}

            {activeTab === 'location' && (
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Geographic Context
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                  District: <strong>{problem.district}</strong>
                </p>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                  Specific Address: {problem.address || 'Block area / rural settlement'}
                </p>
                {problem.latitude && problem.longitude && (
                  <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.5rem' }}>
                    GPS Coordinates: {problem.latitude}, {problem.longitude}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'attachments' && (
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Attached Documents & Photographs
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <FileText size={20} color="#2563EB" />
                  <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>Field_Report_Survey.pdf (Verified Citizen Submission)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Quick Info & Primary CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem' }}>
              Quick Info
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}>
                  CATEGORY
                </div>
                <CategoryPill category={problem.category} />
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}>
                  IMPACT LEVEL
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#EF4444', fontWeight: 700 }}>
                  <Sparkles size={14} /> High Impact ({Math.round((problem.ai_confidence || 0.94) * 100)}% AI Confidence)
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}>
                  STATUS
                </div>
                <StatusBadge status={problem.status} />
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}>
                  REPORTED DATE
                </div>
                <div style={{ fontWeight: 600, color: '#0F172A' }}>
                  {new Date(problem.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => onSubmitPitch(problem)}
                className="btn btn-blue btn-lg"
                style={{ width: '100%', borderRadius: '10px' }}
              >
                <Lightbulb size={18} /> Submit a Solution / Pitch
              </button>

              <button
                onClick={() => setShowNominateModal(true)}
                className="btn btn-outline"
                style={{ width: '100%', borderRadius: '10px' }}
              >
                <Building2 size={16} /> Nominate for My University
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nominate Modal */}
      {showNominateModal && (
        <div className="modal-overlay" onClick={() => setShowNominateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
              Nominate Problem for University Adoption
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Provide a brief rationale explaining why your department / university has the domain expertise to solve this problem.
            </p>

            <form onSubmit={handleNominate}>
              <div className="form-group">
                <label className="form-label">Rationale / Expertise *</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="e.g. Our Chemical & Environmental department has a dedicated lab for nanomaterial membrane synthesis..."
                  value={nominationRationale}
                  onChange={(e) => setNominationRationale(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowNominateModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={nominating}
                  className="btn btn-primary"
                >
                  {nominating ? 'Submitting...' : 'Submit Nomination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
