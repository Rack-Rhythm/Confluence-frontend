import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  FileCode,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { pitchesAPI } from '../../api/pitches';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

export const MyProjects = () => {
  const { showToast } = useToast();
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLifecycle, setSelectedLifecycle] = useState(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await pitchesAPI.getPitches({ mine: 1 });
      const raw = Array.isArray(data) ? data : data.results || [];
      // Filter pitches that have lifecycle or are selected
      const selected = raw.filter((p) => p.status === 'selected' || p.status === 'merged' || p.project_lifecycle || p.lifecycle);
      setPitches(selected);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleMilestoneToggle = async (pitch, milestoneId) => {
    const currentLifecycle = pitch.project_lifecycle || pitch.lifecycle;
    if (!currentLifecycle || !currentLifecycle.milestones) return;

    const updatedMilestones = currentLifecycle.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );

    const allDone = updatedMilestones.every((m) => m.completed);

    try {
      if (currentLifecycle.id) {
        await pitchesAPI.updateLifecycle(currentLifecycle.id, {
          milestones: updatedMilestones,
          outcome_status: allDone ? 'deployed' : 'in_progress',
        });
      }

      showToast('Milestone status updated on live backend!', 'success');
      if (allDone) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        showToast('All milestones completed! Project marked as Field Deployed 🎉', 'success');
      }
      loadProjects();
    } catch (err) {
      showToast('Failed to update milestone.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          My Projects & Lifecycles
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Track engineering milestones, prototype test results, IP filings, and field deployment sign-offs.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94A3B8' }}>
          Loading your active projects...
        </div>
      ) : pitches.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748B' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
            No assigned project lifecycles yet
          </div>
          <p style={{ fontSize: '0.85rem' }}>
            Once the University Review Board selects your pitch, a full engineering project lifecycle will be initialized here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pitches.map((pitch) => {
            const lc = pitch.project_lifecycle || pitch.lifecycle;
            const hasMilestones = lc && Array.isArray(lc.milestones) && lc.milestones.length > 0;
            const completedCount = hasMilestones ? lc.milestones.filter((m) => m.completed).length : 0;
            const progressPct = hasMilestones ? Math.round((completedCount / lc.milestones.length) * 100) : 0;

            return (
              <div key={pitch.id} className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: hasMilestones ? '#10B981' : '#F59E0B', background: hasMilestones ? '#ECFDF5' : '#FFFBEB', padding: '3px 10px', borderRadius: '999px' }}>
                      {hasMilestones ? '● ACTIVE LIFECYCLE' : '● PENDING LIFECYCLE INITIALIZATION'}
                    </span>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginTop: '0.5rem' }}>
                      {pitch.title}
                    </h2>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      Assigned Mentor: {pitch.assigned_mentor_details?.name || pitch.assigned_mentor?.name || 'Pending mentor allocation'}
                    </div>
                  </div>

                  {hasMilestones && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563EB' }}>
                        {progressPct}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Milestones Complete</div>
                    </div>
                  )}
                </div>

                {hasMilestones ? (
                  <>
                    {/* Progress bar */}
                    <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden', marginBottom: '1.75rem' }}>
                      <div style={{ width: `${progressPct}%`, height: '100%', background: '#2563EB', transition: 'width 0.4s ease' }} />
                    </div>

                    {/* Milestones Checklist */}
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
                      Engineering Milestones
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      {lc.milestones.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => handleMilestoneToggle(pitch, m.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.85rem 1rem',
                            borderRadius: '12px',
                            border: m.completed ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                            background: m.completed ? '#F0FDF4' : '#FFFFFF',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '6px',
                                border: m.completed ? 'none' : '2px solid #CBD5E1',
                                background: m.completed ? '#10B981' : 'transparent',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                              }}
                            >
                              {m.completed && '✓'}
                            </div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: m.completed ? '#065F46' : '#0F172A', textDecoration: m.completed ? 'line-through' : 'none' }}>
                              {m.title}
                            </span>
                          </div>

                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            Target: {m.due_date}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Deliverables & Test Results details */}
                    <div className="grid-responsive-2" style={{ gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.8rem'  }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#64748B', marginBottom: '2px' }}>DELIVERABLES</div>
                        <div style={{ color: '#0F172A', fontWeight: 600 }}>{lc.deliverables || 'Pending submission'}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#64748B', marginBottom: '2px' }}>TEST RESULTS</div>
                        <div style={{ color: '#0F172A', fontWeight: 600 }}>{lc.test_results || 'Testing in progress'}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '12px', border: '1px dashed #CBD5E1', textAlign: 'center', marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                      Lifecycle not yet initialized by your university coordinator. Once milestones and deliverables are assigned, you can track them here.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
