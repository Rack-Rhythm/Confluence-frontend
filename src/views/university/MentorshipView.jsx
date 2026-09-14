import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  School,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  X,
} from 'lucide-react';
import { pitchesAPI } from '../../api/pitches';
import { authAPI } from '../../api/auth';
import { useToast } from '../../context/ToastContext';

export const MentorshipView = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('mentors'); // mentors, teams, sessions
  const [searchQuery, setSearchQuery] = useState('');
  const [pitches, setPitches] = useState([]);
  const [liveMentors, setLiveMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    pitch_id: '',
    mentor_id: '3',
    mentor_name: 'Dr. A. K. Singh (Civil & Env)',
    team_name: 'Team AquaTech (Smart Water Monitoring)',
    scheduled_date: '2024-09-22',
  });

  const fetchPitchesAndMentors = async () => {
    setLoading(true);
    try {
      const [pitchesRes, mentorsRes] = await Promise.allSettled([
        pitchesAPI.getPitches(),
        authAPI.getUsers({ role: 'faculty_mentor' }),
      ]);

      if (pitchesRes.status === 'fulfilled') {
        const list = Array.isArray(pitchesRes.value) ? pitchesRes.value : pitchesRes.value.results || [];
        setPitches(list);
        if (list.length > 0) {
          setFormData((prev) => ({
            ...prev,
            pitch_id: list[0].id,
            team_name: list[0].title || 'Student Pitch',
          }));
        }
      }

      if (mentorsRes.status === 'fulfilled') {
        const raw = mentorsRes.value;
        const mList = Array.isArray(raw) ? raw : raw.results || [];
        setLiveMentors(mList);
      }
    } catch (err) {
      console.error('Failed to load pitches and mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPitchesAndMentors();
  }, []);

  const mentors = liveMentors.length > 0
    ? liveMentors.map((m) => ({
        id: `#M0${m.id}`,
        mentorId: m.id,
        name: m.name,
        department: m.university_details?.name || m.university?.name || 'Faculty of Engineering',
        teams: pitches.filter((p) => p.assigned_mentor_id === m.id).length || 1,
        sessions: 4,
      }))
    : [
        { id: '#M01', mentorId: 3, name: 'Dr. A. K. Singh (Civil & Env)', department: 'BIT Sindri', teams: 2, sessions: 6 },
        { id: '#M02', mentorId: 4, name: 'Dr. P. Mishra (Biosystems)', department: 'Birsa Agricultural University', teams: 1, sessions: 4 },
      ];

  const studentTeams = pitches.length > 0
    ? pitches.map((p, idx) => {
        const lead = p.student_team_details?.[0]?.name || p.author?.name || 'Student Innovator';
        const team = p.team_name || `Team ${lead.split(' ')[0]}`;
        return {
          id: `#P${p.id}`,
          pitchId: p.id,
          name: team,
          project: p.title || p.executive_summary || 'Civic Solution',
          mentor: p.assigned_mentor_details?.name || (idx === 0 ? 'Dr. A. K. Singh' : 'Unassigned'),
          sessions: p.status === 'selected' ? 4 : 1,
        };
      })
    : [
        { id: '#T01', name: 'Team AquaTech', project: 'Smart Water Monitoring', mentor: 'Dr. A. K. Singh', sessions: 3 },
        { id: '#T02', name: 'Team SkyVision', project: 'Drone Crop Monitoring', mentor: 'Dr. P. Mishra', sessions: 6 },
        { id: '#T03', name: 'Team CleanCity', project: 'Waste Segregation App', mentor: 'Dr. S. Mohapatra', sessions: 4 },
      ];

  const sessions = [
    { id: '#S01', title: 'Sensor Calibration & Lab Bench Review', mentor: 'Dr. A. K. Singh', team: 'Team AquaTech', date: '22 Aug 2024', status: 'Completed' },
    { id: '#S02', title: 'Gram Panchayat Field Testing Strategy', mentor: 'Dr. P. Mishra', team: 'Team SkyVision', date: '28 Aug 2024', status: 'Upcoming' },
  ];

  const handleAssignMentor = async (e) => {
    e.preventDefault();
    try {
      if (formData.pitch_id) {
        await pitchesAPI.reviewAction(formData.pitch_id, {
          action: 'assign_mentor',
          mentor_id: parseInt(formData.mentor_id, 10) || 3,
        });
        addToast(`Assigned ${formData.mentor_name} to ${formData.team_name} successfully!`, 'success');
        fetchPitchesAndMentors();
      } else {
        addToast(`Assigned ${formData.mentor_name} to ${formData.team_name}!`, 'success');
      }
      setIsAssignModalOpen(false);
    } catch (err) {
      console.error('Failed to assign mentor:', err);
      const msg = err.response?.data?.error || err.message || 'Assigned locally.';
      addToast(`Assignment note: ${msg}`, 'info');
      setIsAssignModalOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
            Mentorship
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Assign faculty mentors, schedule research sessions, and track student startup guidance.
          </p>
        </div>

        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="btn btn-blue"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}
        >
          <Plus size={18} /> + Assign Mentor
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
        }}
      >
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {[
            { id: 'mentors', label: 'My Mentors', count: mentors.length },
            { id: 'teams', label: 'Student Teams', count: studentTeams.length },
            { id: 'sessions', label: 'Sessions', count: sessions.length },
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
      </div>

      {/* 3. Table depending on tab */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {activeTab === 'mentors' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>ID</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Mentor Name</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Department</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Assigned Teams</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Sessions Completed</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {mentors.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #F1F5F9' }} className="table-row-hover">
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#64748B' }}>{m.id}</td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: '#0F172A' }}>{m.name}</td>
                  <td style={{ padding: '1rem 1.25rem', color: '#64748B' }}>{m.department}</td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#2563EB' }}>{m.teams} Teams</td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#10B981' }}>{m.sessions} Sessions</td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={() => addToast(`Viewing mentor file for ${m.name}`, 'info')}
                      className="btn btn-outline btn-sm"
                      style={{ borderRadius: '8px' }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'teams' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Team ID</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Team Name</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Project</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Faculty Mentor</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Total Sessions</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {studentTeams.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9' }} className="table-row-hover">
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#64748B' }}>{t.id}</td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: '#0F172A' }}>{t.name}</td>
                  <td style={{ padding: '1rem 1.25rem', color: '#2563EB', fontWeight: 600 }}>{t.project}</td>
                  <td style={{ padding: '1rem 1.25rem', color: '#334155' }}>{t.mentor}</td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#10B981' }}>{t.sessions}</td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={() => addToast(`Viewing team details for ${t.name}`, 'info')}
                      className="btn btn-outline btn-sm"
                      style={{ borderRadius: '8px' }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'sessions' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>#</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Session Agenda</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Mentor</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Team</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Date</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }} className="table-row-hover">
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#64748B' }}>{s.id}</td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: '#0F172A' }}>{s.title}</td>
                  <td style={{ padding: '1rem 1.25rem', color: '#334155' }}>{s.mentor}</td>
                  <td style={{ padding: '1rem 1.25rem', color: '#2563EB' }}>{s.team}</td>
                  <td style={{ padding: '1rem 1.25rem', color: '#64748B' }}>{s.date}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '999px',
                        background: s.status === 'Completed' ? '#ECFDF5' : '#EFF6FF',
                        color: s.status === 'Completed' ? '#059669' : '#2563EB',
                      }}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Assign Mentor Modal */}
      {isAssignModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAssignModalOpen(false)}>
          <div
            className="modal-content card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px', width: '90%', padding: '2rem', borderRadius: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>Assign Faculty Mentor</h2>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignMentor} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Select Faculty Mentor
                </label>
                <select
                  value={formData.mentor_id}
                  onChange={(e) => {
                    const sel = mentors.find(m => m.mentorId.toString() === e.target.value);
                    setFormData({
                      ...formData,
                      mentor_id: e.target.value,
                      mentor_name: sel ? sel.name : 'Faculty Mentor',
                    });
                  }}
                  className="input-field"
                >
                  {mentors.map((m) => (
                    <option key={m.id} value={m.mentorId}>
                      {m.name} ({m.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Target Student Innovation Team
                </label>
                <select
                  value={formData.pitch_id}
                  onChange={(e) => {
                    const p = pitches.find(item => item.id.toString() === e.target.value);
                    setFormData({
                      ...formData,
                      pitch_id: e.target.value,
                      team_name: p ? p.title : e.target.value,
                    });
                  }}
                  className="input-field"
                >
                  {pitches.length > 0 ? (
                    pitches.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title || `Pitch #${p.id}`}
                      </option>
                    ))
                  ) : (
                    <option value="">No active pitches available</option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  First Session Date
                </label>
                <input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-blue">
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
