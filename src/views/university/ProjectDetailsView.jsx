import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Circle,
  FileText,
  Users,
  Calendar,
  Layers,
  Building2,
  TrendingUp,
  Download,
  Plus,
  X,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ProjectDetailsView = ({ project, onBack }) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview'); // overview, milestones, team, resources, reports
  const [progress, setProgress] = useState(project?.progress || 45);
  const [milestones, setMilestones] = useState([
    { id: 1, title: 'Hardware Architecture & Schematic Verification', status: 'completed', date: '10 Aug 2024' },
    { id: 2, title: 'Sensor Integration & Edge AI Firmware Flashing', status: 'in_progress', date: '25 Aug 2024' },
    { id: 3, title: 'Field Pilot Testing with Gram Panchayat / District Agronomist', status: 'pending', date: '15 Sep 2024' },
    { id: 4, title: 'Final Deployment & Public Verification Dashboard Handover', status: 'pending', date: '30 Oct 2024' },
  ]);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateNotes, setUpdateNotes] = useState('');

  if (!project) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#64748B' }}>No project selected.</p>
        <button onClick={onBack} className="btn btn-outline" style={{ marginTop: '1rem' }}>
          Back to Projects
        </button>
      </div>
    );
  }

  const handleToggleMilestone = (id) => {
    const updated = milestones.map((m) => {
      if (m.id === id) {
        const nextStatus = m.status === 'completed' ? 'in_progress' : m.status === 'in_progress' ? 'completed' : 'in_progress';
        return { ...m, status: nextStatus };
      }
      return m;
    });
    setMilestones(updated);

    // Recalculate progress percentage dynamically
    const completedCount = updated.filter((m) => m.status === 'completed').length;
    const newProgress = Math.round((completedCount / updated.length) * 100);
    setProgress(newProgress);
    addToast('Milestone status updated and project progress synced!', 'success');
  };

  const handleUpdateProgressSubmit = (e) => {
    e.preventDefault();
    setIsUpdateModalOpen(false);
    addToast('Project progress log saved successfully!', 'success');
  };

  const title = project.title || project.executive_summary || 'Drone Crop Monitoring & Yield Optimization';
  const category = project.category || 'Agriculture';
  const mentor = project.mentor_name || 'Dr. P. Mishra';
  const industryPartner = project.industry_partner || 'AgriTech Solutions Pvt. Ltd.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header & Back */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#2563EB',
            fontWeight: 700,
            fontSize: '0.875rem',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '999px',
            background: '#EFF6FF',
            color: '#2563EB',
          }}
        >
          ● Stage: {project.stage || 'In Development'}
        </span>
      </div>

      {/* 2. Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          {title}
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
          University Lab Research to Field Deployment Pipeline
        </p>
      </div>

      {/* 3. Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '0.5rem',
        }}
      >
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'milestones', label: 'Milestones' },
          { id: 'team', label: 'Team' },
          { id: 'resources', label: 'Resources' },
          { id: 'reports', label: 'Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 0',
              borderBottom: activeTab === tab.id ? '2px solid #2563EB' : '2px solid transparent',
              color: activeTab === tab.id ? '#2563EB' : '#64748B',
              fontWeight: activeTab === tab.id ? 800 : 600,
              fontSize: '0.9rem',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Main Body: Left Content + Right Metadata Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <>
              {/* Media gallery */}
              <div className="card" style={{ padding: '1rem' }}>
                <img
                  src={project.photo_url || 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800'}
                  alt="Project Hardware"
                  style={{ width: '100%', height: '260px', borderRadius: '12px', objectFit: 'cover', marginBottom: '0.75rem' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {[
                    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=200',
                    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200',
                    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=200',
                    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200',
                  ].map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Thumbnail"
                      style={{ width: '100%', height: '65px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>

              {/* Milestones Preview inside Overview */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    Active Development Milestones
                  </h3>
                  <button
                    onClick={() => setActiveTab('milestones')}
                    style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563EB' }}
                  >
                    View Checklist ➔
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {milestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleToggleMilestone(m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: m.status === 'completed' ? '#F0FDF4' : '#F8FAFC',
                        borderRadius: '10px',
                        border: m.status === 'completed' ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {m.status === 'completed' ? (
                          <CheckCircle2 size={20} color="#10B981" />
                        ) : m.status === 'in_progress' ? (
                          <Clock size={20} color="#2563EB" />
                        ) : (
                          <Circle size={20} color="#94A3B8" />
                        )}
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', textDecoration: m.status === 'completed' ? 'line-through' : 'none' }}>
                          {m.title}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: m.status === 'completed' ? '#ECFDF5' : m.status === 'in_progress' ? '#EFF6FF' : '#F1F5F9',
                          color: m.status === 'completed' ? '#059669' : m.status === 'in_progress' ? '#2563EB' : '#64748B',
                          textTransform: 'capitalize',
                        }}
                      >
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Milestones */}
          {activeTab === 'milestones' && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                  Project Milestones & Verification
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Click any milestone to toggle status</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleToggleMilestone(m.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: m.status === 'completed' ? '#F0FDF4' : '#FFFFFF',
                      borderRadius: '12px',
                      border: m.status === 'completed' ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {m.status === 'completed' ? (
                        <CheckCircle2 size={22} color="#10B981" />
                      ) : m.status === 'in_progress' ? (
                        <Clock size={22} color="#2563EB" />
                      ) : (
                        <Circle size={22} color="#94A3B8" />
                      )}
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>{m.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Target Date: {m.date}</div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: m.status === 'completed' ? '#ECFDF5' : m.status === 'in_progress' ? '#EFF6FF' : '#F1F5F9',
                        color: m.status === 'completed' ? '#059669' : m.status === 'in_progress' ? '#2563EB' : '#64748B',
                      }}
                    >
                      {m.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Team */}
          {activeTab === 'team' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
                Engineering & Faculty Team
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { name: 'Priya Sharma', role: 'Student Team Lead', dept: 'Computer Science' },
                  { name: 'Dr. P. Mishra', role: 'Faculty Mentor', dept: 'Agriculture & Biosystems' },
                  { name: 'Rohan Kumar', role: 'Robotics & Hardware', dept: 'Mechanical Engineering' },
                  { name: 'AgriTech Pvt. Ltd.', role: 'Industry Partner & Pilot Site', dept: 'CSR Innovation' },
                ].map((member, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{member.name}</div>
                    <div style={{ fontSize: '0.775rem', color: '#2563EB', fontWeight: 600 }}>{member.role}</div>
                    <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '2px' }}>{member.dept}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Resources */}
          {activeTab === 'resources' && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Assigned Lab Resources & Hardware Grants
              </h3>
              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>BIT Sindri Robotics & IoT Lab Bench #4</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                  Equipment allocated: Drone flight testing rig, multispectral camera, 3D printing quota.
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Reports */}
          {activeTab === 'reports' && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Project Progress & Field Testing Reports
              </h3>
              {[
                { name: 'Midterm_Evaluation_Report.pdf', size: '3.2 MB', date: '18 Aug 2024' },
                { name: 'Field_Trial_Telemetry_Dataset.csv', size: '1.8 MB', date: '22 Aug 2024' },
              ].map((doc, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={20} color="#2563EB" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{doc.name}</div>
                      <div style={{ fontSize: '0.725rem', color: '#64748B' }}>{doc.size} • {doc.date}</div>
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Download size={14} /> Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Project Metadata Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem' }}>
              Project Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Project ID:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>#0208</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Category:</span>
                <span style={{ fontWeight: 700, color: '#0F172A', textTransform: 'capitalize' }}>{category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Start Date:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>01 Aug 2024</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Expected Completion:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>30 Nov 2024</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Faculty Mentor:</span>
                <span style={{ fontWeight: 700, color: '#2563EB' }}>{mentor}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Industry Partner:</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>{industryPartner}</span>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: '0.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 700 }}>
                  <span style={{ color: '#0F172A' }}>Overall Progress</span>
                  <span style={{ color: '#2563EB' }}>{progress}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: '#2563EB', borderRadius: '999px', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="btn btn-blue"
              style={{ width: '100%', marginTop: '1.25rem', borderRadius: '10px' }}
            >
              Update Progress
            </button>
          </div>
        </div>
      </div>

      {/* Update Progress Modal */}
      {isUpdateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsUpdateModalOpen(false)}>
          <div
            className="modal-content card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '90%', padding: '2rem', borderRadius: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>Log Project Progress</h2>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProgressSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Progress Percentage ({progress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Progress Notes / Key Highlights
                </label>
                <textarea
                  rows={3}
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Summarize recent hardware tests, pilot milestones, or lab results..."
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-blue">
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
