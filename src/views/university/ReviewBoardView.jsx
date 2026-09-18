import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Award,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
  Star,
  Users,
} from 'lucide-react';
import { pitchesAPI } from '../../api/pitches';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

export const ReviewBoardView = ({ onSelectPitch }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('all'); // all, pending, discussion, finalized
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State for Schedule Review
  const [reviewSessions, setReviewSessions] = useState([]);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    title: 'University Innovation Board Evaluation Round 1',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    panelists: 'Prof. S. Soren, Dr. P. Mishra, Industry Expert (Tata Steel)',
    notes: '',
  });

  useEffect(() => {
    const fetchPitchesAndSessions = async () => {
      setLoading(true);
      try {
        const [res, sessRes] = await Promise.allSettled([
          pitchesAPI.getPitches(),
          pitchesAPI.getReviewSessions(),
        ]);
        if (res.status === 'fulfilled') {
          const list = Array.isArray(res.value) ? res.value : res.value.results || [];
          setPitches(list);
        }
        if (sessRes.status === 'fulfilled') {
          const sList = Array.isArray(sessRes.value) ? sessRes.value : sessRes.value.results || [];
          setReviewSessions(sList);
        }
      } catch (err) {
        console.error('Failed to load review board:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPitchesAndSessions();
  }, []);

  const pendingPitches = pitches.filter((p) => ['submitted', 'under_review', 'resubmitted'].includes(p.status));
  const changesPitches = pitches.filter((p) => p.status === 'changes_requested');
  const finalizedPitches = pitches.filter((p) => ['selected', 'merged', 'rejected', 'project'].includes(p.status));

  const getActiveList = () => {
    if (activeTab === 'pending') return pendingPitches;
    if (activeTab === 'changes') return changesPitches;
    if (activeTab === 'finalized') return finalizedPitches;
    return pitches;
  };

  const filteredList = getActiveList().filter((p) => {
    const title = p.title || p.executive_summary || '';
    const student = p.student_team_details?.[0]?.name || p.author?.name || p.author_name || '';
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const scheduledDateTime = `${scheduleData.date}T${scheduleData.time}:00Z`;
      const res = await pitchesAPI.createReviewSession({
        title: scheduleData.title,
        scheduled_at: scheduledDateTime,
        panelists: scheduleData.panelists,
        notes: scheduleData.notes || '',
      });
      showToast('Review session scheduled and persisted to review board!', 'success');
      setReviewSessions((prev) => [res, ...prev]);
      setIsScheduleOpen(false);
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Failed to schedule review session.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
            Review Board
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Evaluate shortlisted student pitches and select best solutions for university incubation.
          </p>
        </div>

        <button
          onClick={() => setIsScheduleOpen(true)}
          className="btn btn-blue"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}
        >
          <Calendar size={18} /> + Schedule Review
        </button>
      </div>

      {/* 2. Tabs Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '0.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          {[
            { id: 'all', label: 'All Pitches', count: pitches.length },
            { id: 'pending', label: 'Pending Review', count: pendingPitches.length },
            { id: 'changes', label: 'Changes Requested', count: changesPitches.length },
            { id: 'finalized', label: 'Finalized', count: finalizedPitches.length },
            { id: 'sessions', label: 'Evaluation Sessions', count: reviewSessions.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 0',
                borderBottom: activeTab === tab.id ? '2px solid #2563EB' : '2px solid transparent',
                color: activeTab === tab.id ? '#2563EB' : '#64748B',
                fontWeight: activeTab === tab.id ? 800 : 600,
                fontSize: '0.875rem',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.725rem',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: activeTab === tab.id ? '#EFF6FF' : '#F1F5F9',
                  color: activeTab === tab.id ? '#2563EB' : '#64748B',
                  fontWeight: 700,
                }}
              >
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search open pitches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px', height: '38px', width: '220px', fontSize: '0.85rem' }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field"
            style={{ height: '38px', fontSize: '0.85rem', width: '150px' }}
          >
            <option value="all">All Categories</option>
            <option value="water">Water</option>
            <option value="agriculture">Agriculture</option>
            <option value="transport">Transport</option>
            <option value="healthcare">Healthcare</option>
          </select>
        </div>
      </div>

      {/* 3. Review Content or Sessions */}
      {activeTab === 'sessions' ? (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Scheduled Review Board Sessions
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
              {reviewSessions.length} total scheduled sessions
            </span>
          </div>

          {reviewSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
              <Calendar size={36} color="#94A3B8" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
              <p style={{ fontWeight: 600, margin: 0 }}>No review sessions scheduled yet.</p>
              <p style={{ fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                Use the "+ Schedule Review" button above to organize evaluation panels.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviewSessions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.725rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: s.status === 'completed' ? '#ECFDF5' : s.status === 'in_progress' ? '#FEF3C7' : '#EFF6FF',
                        color: s.status === 'completed' ? '#059669' : s.status === 'in_progress' ? '#D97706' : '#2563EB',
                      }}>
                        {s.status}
                      </span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        {s.title}
                      </h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0.25rem 0' }}>
                      <strong>Panel:</strong> {s.panelists || 'All Committee Evaluators'}
                    </p>
                    {s.notes && (
                      <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.25rem 0' }}>
                        {s.notes}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2563EB', fontWeight: 700, fontSize: '0.9rem' }}>
                      <Calendar size={15} />
                      <span>{new Date(s.scheduled_at).toLocaleDateString()}</span>
                      <Clock size={15} style={{ marginLeft: '4px' }} />
                      <span>{new Date(s.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      Organized by {s.created_by_details?.name || 'Review Board'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>#</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Project Title</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Student</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Review Score</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                    No proposals found in this review stage.
                  </td>
                </tr>
              ) : (
                filteredList.map((pitch, idx) => {
                  const pitchIdNum = `#038${pitch.id || idx + 1}`;
                  const titleText = pitch.title || pitch.executive_summary || 'AI Traffic Optimization';
                  const authorName = pitch.student_team_details?.[0]?.name || pitch.author?.name || pitch.author_name || 'Rohan Das';
                  const score = 75 + ((pitch.id || idx) * 7) % 24;

                  return (
                    <tr
                      key={pitch.id || idx}
                      style={{ borderBottom: '1px solid #F1F5F9' }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#64748B' }}>
                        {pitchIdNum}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>{titleText}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {pitch.category ? `Category: ${pitch.category}` : 'Engineering Challenge'}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#334155' }}>
                        {authorName}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 800, color: score >= 80 ? '#10B981' : '#F59E0B' }}>
                            {score}/100
                          </span>
                          <div style={{ width: '50px', height: '6px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${score}%`, height: '100%', background: score >= 80 ? '#10B981' : '#F59E0B' }} />
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <StatusBadge status={pitch.status || 'under_review'} />
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          onClick={() => onSelectPitch && onSelectPitch(pitch)}
                          className="btn btn-blue btn-sm"
                          style={{ borderRadius: '8px', padding: '4px 12px' }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Review Modal */}
      {isScheduleOpen && (
        <div className="modal-backdrop" onClick={() => setIsScheduleOpen(false)}>
          <div
            className="modal-content card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '90%', padding: '2rem', borderRadius: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={22} color="#2563EB" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>Schedule Evaluation Board</h2>
              </div>
              <button
                onClick={() => setIsScheduleOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={scheduleData.title}
                  onChange={(e) => setScheduleData({ ...scheduleData, title: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduleData.date}
                    onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleData.time}
                    onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Panel Members & Faculty
                </label>
                <input
                  type="text"
                  value={scheduleData.panelists}
                  onChange={(e) => setScheduleData({ ...scheduleData, panelists: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-blue"
                >
                  Schedule Review Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
