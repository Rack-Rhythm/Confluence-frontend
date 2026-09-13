import React, { useState, useEffect } from 'react';
import { Lightbulb, Hash, ShieldCheck, MessageSquare, User, Clock, ArrowRight, Sparkles } from 'lucide-react';
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

  const underReviewPitches = pitches.filter((p) => p.status === 'submitted' || p.status === 'under_review');
  const selectedPitches = pitches.filter((p) => p.status === 'selected');
  const notSelectedPitches = pitches.filter((p) => p.status === 'rejected' || p.status === 'merged');

  const getFiltered = () => {
    if (activeTab === 'under_review') return underReviewPitches;
    if (activeTab === 'selected') return selectedPitches;
    if (activeTab === 'not_selected') return notSelectedPitches;
    return pitches;
  };

  const filtered = getFiltered();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
            My Pitches
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Track your innovation pitches, cryptographically secured prior art, and mentor evaluations.
          </p>
        </div>

        <button
          onClick={() => onNavigate('explore_problems')}
          className="btn btn-blue"
          style={{ borderRadius: '10px' }}
        >
          <Lightbulb size={18} /> Submit New Pitch
        </button>
      </div>

      {/* Metric Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { id: 'all', count: pitches.length, label: 'Total Pitches', color: '#2563EB', bg: '#EFF6FF' },
          { id: 'under_review', count: underReviewPitches.length, label: 'Under Review', color: '#F59E0B', bg: '#FFFBEB' },
          { id: 'selected', count: selectedPitches.length, label: 'Selected & Won', color: '#10B981', bg: '#ECFDF5' },
          { id: 'not_selected', count: notSelectedPitches.length, label: 'Merged / Not Selected', color: '#64748B', bg: '#F8FAFC' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? tab.bg : '#FFFFFF',
                borderRadius: '14px',
                border: isActive ? `2px solid ${tab.color}` : '1px solid #E2E8F0',
                padding: '1rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
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
            onClick={() => onNavigate('explore_problems')}
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
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '999px' }}>
                      PITCH #{pitch.id}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      • Submitted on {new Date(pitch.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                    {pitch.title}
                  </h3>
                </div>

                <StatusBadge status={pitch.status} />
              </div>

              {/* Public Summary */}
              <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                {pitch.public_summary}
              </p>

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

              {/* Mentor Notes / Review feedback */}
              {pitch.review_feedback && (
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
