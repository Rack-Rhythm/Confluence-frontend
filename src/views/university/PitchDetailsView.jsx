import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  User,
  Users,
  Calendar,
  Layers,
  FileText,
  MessageSquare,
  Sparkles,
  Download,
  Send,
} from 'lucide-react';
import { pitchesAPI } from '../../api/pitches';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

export const PitchDetailsView = ({ pitch, onBack, onRefresh }) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview'); // overview, tech_details, team, documents, comments
  const [currentPitch, setCurrentPitch] = useState(pitch || {});
  const [actionLoading, setActionLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Prof. S. Soren',
      role: 'University Coordinator',
      text: 'Methodology is strong. Sensor calibration for high-salinity water should be documented before prototype review.',
      time: '1 day ago',
    },
  ]);

  if (!pitch) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#64748B' }}>No pitch selected.</p>
        <button onClick={onBack} className="btn btn-outline" style={{ marginTop: '1rem' }}>
          Back to Pitches
        </button>
      </div>
    );
  }

  const handleStatusUpdate = async (newStatus) => {
    setActionLoading(true);
    try {
      if (currentPitch.id) {
        await pitchesAPI.updatePitch(currentPitch.id, { status: newStatus });
      }
      setCurrentPitch((prev) => ({ ...prev, status: newStatus }));
      addToast(`Pitch status updated to "${newStatus.toUpperCase()}"!`, 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update status:', err);
      // Optimistic fallback for demo
      setCurrentPitch((prev) => ({ ...prev, status: newStatus }));
      addToast(`Pitch updated to "${newStatus}"`, 'success');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setComments([
      ...comments,
      {
        id: Date.now(),
        author: 'Prof. S. Soren',
        role: 'University Coordinator',
        text: commentText,
        time: 'Just now',
      },
    ]);
    setCommentText('');
    addToast('Feedback comment added to pitch record.', 'success');
  };

  const title = currentPitch.title || currentPitch.executive_summary || 'Smart Water Monitoring System';
  const authorName = currentPitch.author?.name || currentPitch.student_name || 'Ananya Verma';
  const teamName = currentPitch.team_name || 'Team AquaTech';
  const category = currentPitch.category || 'water';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Back button & Top bar */}
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
          <ArrowLeft size={16} /> Back to Pitches
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Submission #{currentPitch.id ? currentPitch.id.toString().padStart(4, '0') : '0201'}
          </span>
          <StatusBadge status={currentPitch.status || 'shortlisted'} />
        </div>
      </div>

      {/* 2. Pitch Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
            {title}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
            Dual-package intellectual property submitted via Confluence Innovation Pipeline
          </p>
        </div>
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
          { id: 'tech_details', label: 'Technical Details' },
          { id: 'team', label: 'Team' },
          { id: 'documents', label: 'Documents' },
          { id: 'comments', label: `Comments (${comments.length})` },
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

      {/* 4. Main Body: Left Content + Right Info Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <>
              {/* Media gallery */}
              <div className="card" style={{ padding: '1rem' }}>
                <img
                  src={currentPitch.photo_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800'}
                  alt="Pitch hardware"
                  style={{ width: '100%', height: '280px', borderRadius: '12px', objectFit: 'cover', marginBottom: '0.75rem' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {[
                    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=200',
                    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200',
                    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200',
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

              {/* Problem & Solution text */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
                  Solution Abstract & Impact
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {currentPitch.description ||
                    'A low-cost, solar-powered IoT sensor node capable of real-time monitoring for turbidity, pH, dissolved oxygen, and microbial presence in rural surface water bodies. The system transmits telemetry over LoRaWAN to a decentralized dashboard accessible by Gram Panchayat health workers.'}
                </p>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Expected Societal Outcomes
                </h4>
                <ul style={{ fontSize: '0.85rem', color: '#475569', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                  <li>Early warning mechanism for water-borne pathogen outbreaks in 15+ tribal villages.</li>
                  <li>Real-time automated alerts delivered via SMS and IVR in local dialects.</li>
                  <li>Low-maintenance sensor probes manufactured with localized component sourcing.</li>
                </ul>
              </div>
            </>
          )}

          {/* Tab 2: Technical Details */}
          {activeTab === 'tech_details' && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Technical Specification & IP Package
              </h3>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563EB', marginBottom: '4px' }}>
                  🔒 Cryptographic SHA-256 IP Timestamp
                </div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#475569', wordBreak: 'break-all' }}>
                  {currentPitch.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>Hardware Stack</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                  ESP32 MCU, LoRa SX1278 transceiver, analog pH probe, optical turbidity sensor, 5W Monocrystalline solar panel with 18650 Li-ion battery pack.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>Firmware & Cloud Backend</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                  FreeRTOS edge firmware, MQTT broker ingestion, Django REST API backend, PostGIS spatial database for contamination heatmaps.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Team */}
          {activeTab === 'team' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
                Student Innovation Team ({teamName})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { name: authorName, role: 'Team Lead & Embedded Hardware', dept: 'Electronics & Comm.' },
                  { name: 'Rohan Das', role: 'Firmware & LoRa Networking', dept: 'Computer Science' },
                  { name: 'Priya Mahato', role: 'UI/UX & Mobile Dashboard', dept: 'Information Technology' },
                  { name: 'Dr. P. Mishra', role: 'Faculty Mentor', dept: 'Environmental Eng.' },
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

          {/* Tab 4: Documents */}
          {activeTab === 'documents' && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Submitted Deliverables & Schematics
              </h3>
              {[
                { name: 'Circuit_Schematics_v1.pdf', size: '2.4 MB', date: '12 Aug 2024' },
                { name: 'BOM_Component_Costing.xlsx', size: '480 KB', date: '12 Aug 2024' },
                { name: 'Field_Pilot_Report_Kharagpur.pdf', size: '4.1 MB', date: '14 Aug 2024' },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                >
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

          {/* Tab 5: Comments */}
          {activeTab === 'comments' && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Faculty & Review Board Notes
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {comments.map((c) => (
                  <div key={c.id} style={{ padding: '0.85rem 1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0F172A' }}>
                        {c.author} <span style={{ fontSize: '0.725rem', color: '#2563EB', fontWeight: 600 }}>({c.role})</span>
                      </span>
                      <span style={{ fontSize: '0.725rem', color: '#94A3B8' }}>{c.time}</span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: '#334155', lineHeight: 1.5 }}>{c.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Add academic feedback or mentor note..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="input-field"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-blue" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Send size={16} /> Post
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Info Sidebar & Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Submitter Profile Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                }}
              >
                {authorName.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                  {authorName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Lead, {teamName}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Category:</span>
                <span style={{ fontWeight: 700, color: '#0F172A', textTransform: 'capitalize' }}>{category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Submitted on:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>12 Aug 2024</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Team Size:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>4 Members</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Looking for:</span>
                <span style={{ fontWeight: 700, color: '#2563EB' }}>Mentorship, Funding</span>
              </div>
            </div>
          </div>

          {/* Action Decision Buttons */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
              University Evaluation Actions
            </h4>

            <button
              onClick={() => handleStatusUpdate('shortlisted')}
              disabled={actionLoading}
              className="btn btn-blue"
              style={{ width: '100%', borderRadius: '10px' }}
            >
              Shortlist Pitch
            </button>

            <button
              onClick={() => handleStatusUpdate('under_review')}
              disabled={actionLoading}
              className="btn btn-outline"
              style={{ width: '100%', borderRadius: '10px' }}
            >
              Request Changes
            </button>

            <button
              onClick={() => handleStatusUpdate('rejected')}
              disabled={actionLoading}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '10px',
                border: '1px solid #FCA5A5',
                background: '#FEF2F2',
                color: '#DC2626',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
