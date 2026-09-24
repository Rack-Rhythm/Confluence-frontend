import React, { useState, useEffect } from 'react';
import { Lightbulb, Hash, ShieldCheck, MessageSquare, User, Clock, ArrowRight, Sparkles, AlertTriangle, ChevronRight } from 'lucide-react';
import { pitchesAPI } from '../../api/pitches';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

export const MyPitches = ({ onNavigate, onSelectPitch }) => {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const loadPitches = async () => {
    setLoading(true);
    try {
      const data = await pitchesAPI.getPitches({ mine: 1 });
      setPitches(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to load pitches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPitches();
  }, []);

  const changesRequestedPitches = pitches.filter((p) => p.status === 'changes_requested');
  const underReviewPitches = pitches.filter((p) => p.status === 'submitted' || p.status === 'under_review' || p.status === 'resubmitted');
  const selectedPitches = pitches.filter((p) => p.status === 'selected');
  const notSelectedPitches = pitches.filter((p) => p.status === 'rejected' || p.status === 'merged');

  const getFiltered = () => {
    if (activeTab === 'changes_requested') return changesRequestedPitches;
    if (activeTab === 'under_review') return underReviewPitches;
    if (activeTab === 'selected') return selectedPitches;
    if (activeTab === 'not_selected') return notSelectedPitches;
    return pitches;
  };

  const filtered = getFiltered();

  const handlePitchClick = (pitch) => {
    if (onSelectPitch) {
      onSelectPitch(pitch);
    } else if (onNavigate) {
      onNavigate('pitch_detail', pitch.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
            My Pitches & Innovation Proposals
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Track your innovation pitches, address evaluator revision requests, and manage cryptographic prior art stamps.
          </p>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('explore_problems')}
          className="btn btn-blue"
          style={{ borderRadius: '10px' }}
        >
          <Lightbulb size={18} /> Submit New Pitch
        </button>
      </div>

      {/* Action Required Banner if changes requested */}
      {changesRequestedPitches.length > 0 && activeTab !== 'changes_requested' && (
        <div
          onClick={() => setActiveTab('changes_requested')}
          style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '1px solid #FCD34D',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#D97706', color: '#FFFFFF', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#92400E', fontSize: '0.95rem' }}>
                Action Required: {changesRequestedPitches.length} Pitch{changesRequestedPitches.length > 1 ? 'es' : ''} Require Revision
              </div>
              <div style={{ fontSize: '0.825rem', color: '#B45309' }}>
                University reviewers requested updates on your technical proposals. Click here to review feedback and resubmit.
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#92400E', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View Revisions <ChevronRight size={16} />
          </span>
        </div>
      )}

      {/* Metric Tabs */}
      <div className="pitches-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { id: 'all', count: pitches.length, label: 'Total Pitches', color: '#2563EB', bg: '#EFF6FF' },
          { id: 'changes_requested', count: changesRequestedPitches.length, label: 'Action Required', color: '#D97706', bg: '#FEF3C7' },
          { id: 'under_review', count: underReviewPitches.length, label: 'Under Review', color: '#F59E0B', bg: '#FFFBEB' },
          { id: 'selected', count: selectedPitches.length, label: 'Selected & Won', color: '#10B981', bg: '#ECFDF5' },
          { id: 'not_selected', count: notSelectedPitches.length, label: 'Merged / Other', color: '#64748B', bg: '#F8FAFC' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pitch-stat-card ${isActive ? "active" : ""}`} style={{
                background: isActive ? tab.bg : '#FFFFFF',
                borderRadius: '14px',
                border: isActive ? `2px solid ${tab.color}` : '1px solid #E2E8F0',
                padding: '1rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
            >
              {tab.id === 'changes_requested' && tab.count > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#DC2626',
                    color: '#FFFFFF',
                    borderRadius: '999px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                  }}
                >
                  NEW
                </span>
              )}
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: tab.color }}>
                {tab.count}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                {tab.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* List of Pitches */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94A3B8' }}>
          Loading your submitted pitches...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 1rem',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            color: '#64748B',
          }}
        >
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
            No pitches found in this tab
          </div>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Explore open problems and submit your technical solutions.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('explore_problems')}
            className="btn btn-blue btn-sm"
            style={{ borderRadius: '8px' }}
          >
            Explore Problems
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((pitch) => (
            <div
              key={pitch.id}
              className="card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                border: pitch.status === 'changes_requested' ? '1.5px solid #FCD34D' : '1px solid #E2E8F0',
                background: pitch.status === 'changes_requested' ? '#FFFCF5' : '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '999px' }}>
                      PITCH #{pitch.id} (v{pitch.version || 1})
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      • Submitted on {new Date(pitch.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3
                    onClick={() => handlePitchClick(pitch)}
                    style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}
                  >
                    {pitch.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StatusBadge status={pitch.status} />
                  <button
                    onClick={() => handlePitchClick(pitch)}
                    className="btn btn-outline btn-sm"
                    style={{ borderRadius: '8px', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Public Summary */}
              <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                {pitch.public_summary}
              </p>

              {/* Revision Request Highlight if changes_requested */}
              {pitch.status === 'changes_requested' && (
                <div
                  style={{
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#B45309', fontWeight: 700, fontSize: '0.85rem' }}>
                      <AlertTriangle size={16} /> Revisions Requested by University Review Board
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#92400E', background: '#FEF3C7', padding: '0.65rem 0.85rem', borderRadius: '8px', lineHeight: 1.5 }}>
                    <strong>Feedback / Requirements:</strong> {pitch.review_feedback || 'Please update your pitch details according to reviewer feedback and submit a new revision.'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                    <button
                      onClick={() => handlePitchClick(pitch)}
                      className="btn btn-primary btn-sm"
                      style={{
                        background: '#D97706',
                        borderColor: '#D97706',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontWeight: 700,
                      }}
                    >
                      <Sparkles size={15} /> Review Feedback & Submit Revision (v{(pitch.version || 1) + 1})
                    </button>
                  </div>
                </div>
              )}

              {/* SHA-256 Prior Art Stamp */}
              <div
                style={{
                  background: '#F8FAFC',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: '#475569',
                  overflowX: 'auto',
                }}
              >
                <ShieldCheck size={16} color="#10B981" style={{ flexShrink: 0 }} />
                <span>SHA-256: {pitch.submission_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</span>
              </div>

              {/* Mentor Notes / Review feedback for non-changes_requested statuses */}
              {pitch.status !== 'changes_requested' && pitch.review_feedback && (
                <div
                  style={{
                    background: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    fontSize: '0.8rem',
                    color: '#92400E',
                  }}
                >
                  <strong>Review Board Note:</strong> {pitch.review_feedback}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
