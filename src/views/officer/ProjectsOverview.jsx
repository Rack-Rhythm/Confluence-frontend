import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Award,
  Users,
  GitMerge,
  UserCheck,
  XCircle,
  Sparkles,
  Lock,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { pitchesAPI } from '../../api/pitches';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

export const ProjectsOverview = () => {
  const { showToast } = useToast();
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPitch, setSelectedPitch] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [reviewNote, setReviewNote] = useState('');
  const [mentorId, setMentorId] = useState('4');
  const [mergePitchId, setMergePitchId] = useState('');

  const loadPitches = async () => {
    setLoading(true);
    try {
      const data = await pitchesAPI.getPitches();
      setPitches(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to load review pitches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPitches();
  }, []);

  const handleReviewAction = async (pitchId, action) => {
    setActionLoading(true);
    try {
      const payload = {
        action,
        review_feedback: reviewNote || 'Approved by University Innovation Review Board.',
        mentor_id: action === 'assign_mentor' ? parseInt(mentorId) : undefined,
        merge_with_pitch_id: action === 'merge_pitches' ? parseInt(mergePitchId) : undefined,
      };

      const res = await pitchesAPI.reviewAction(pitchId, payload);
      showToast(res.message || `Review action "${action}" executed!`, 'success');

      if (action === 'select_winner' || action === 'merge_pitches') {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }

      loadPitches();
      setSelectedPitch(null);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Action failed.';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          University Review Board & Solution Selection
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Evaluate competing student technical pitches, merge complementary innovations, assign faculty mentors, and authorize field deployment.
        </p>
      </div>

      {/* Grid of Pitches awaiting Review */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, color: '#0F172A' }}>Submitted Student Pitches for Adopted Issues</span>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Dual-Package Protected IP Access Active</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94A3B8' }}>
            Loading pitches for review...
          </div>
        ) : pitches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>
            No student pitches found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.75rem' }}>
            {pitches.map((pitch) => (
              <div
                key={pitch.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '999px' }}>
                        PITCH #{pitch.id}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        University: {pitch.university?.name || 'BIT Sindri'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                      {pitch.title}
                    </h3>
                  </div>

                  <StatusBadge status={pitch.status} />
                </div>

                <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                  <strong>Public Summary:</strong> {pitch.public_summary}
                </p>

                {/* Confidential Package (Visible to coordinator/mentor) */}
                <div
                  style={{
                    background: '#F5F3FF',
                    border: '1px solid #DDD6FE',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    fontSize: '0.8rem',
                    color: '#5B21B6',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, marginBottom: '2px' }}>
                    <Lock size={13} /> PROTECTED TECHNICAL IP PACKAGE:
                  </div>
                  <div>{pitch.confidential_package}</div>
                </div>

                {/* SHA-256 Hash */}
                <div style={{ fontSize: '0.725rem', color: '#64748B', fontFamily: 'monospace' }}>
                  SHA-256 Prior-Art Hash: {pitch.submission_hash}
                </div>

                {/* Review Actions if under review or submitted */}
                {pitch.status === 'submitted' || pitch.status === 'under_review' ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleReviewAction(pitch.id, 'select_winner')}
                      className="btn btn-primary btn-sm"
                      style={{ background: '#10B981', borderRadius: '8px' }}
                    >
                      <Award size={15} /> Select as Winning Solution
                    </button>

                    <button
                      disabled={actionLoading}
                      onClick={() => {
                        const targetId = prompt('Enter the other Pitch ID to merge this solution with:');
                        if (targetId) {
                          setMergePitchId(targetId);
                          handleReviewAction(pitch.id, 'merge_pitches');
                        }
                      }}
                      className="btn btn-blue btn-sm"
                      style={{ borderRadius: '8px' }}
                    >
                      <GitMerge size={15} /> Merge Teams
                    </button>

                    <button
                      disabled={actionLoading}
                      onClick={() => handleReviewAction(pitch.id, 'assign_mentor')}
                      className="btn btn-outline btn-sm"
                      style={{ borderRadius: '8px' }}
                    >
                      <UserCheck size={15} /> Assign Mentor
                    </button>

                    <button
                      disabled={actionLoading}
                      onClick={() => handleReviewAction(pitch.id, 'reject')}
                      className="btn btn-outline btn-sm"
                      style={{ borderRadius: '8px', color: '#EF4444' }}
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
                    ✓ Review Decision Finalized ({pitch.status.toUpperCase()})
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
