import React, { useState, useEffect } from 'react';
import {
  Building2,
  Coins,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Compass,
  FileText,
  Handshake,
} from 'lucide-react';
import { engagementsAPI } from '../../api/engagements';
import { pitchesAPI } from '../../api/pitches';
import { issuesAPI } from '../../api/issues';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatCard } from '../../components/common/StatCard';
import { getIssueImageUrl, handleImageError } from '../../utils/imageUtils';

export const IndustryDashboard = ({ onNavigate, onSelectPitch }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [engagements, setEngagements] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [adoptedIssues, setAdoptedIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEngagement, setNewEngagement] = useState({
    issue_id: '',
    engagement_type: 'funding',
    proposal_notes: '',
  });

  const orgName =
    user?.organization_details?.name ||
    user?.organization_name ||
    'Tata Steel Foundation & CSR';
  const orgType = user?.organization_details?.org_type?.toUpperCase() || 'CSR / ENTERPRISE';

  const loadData = async () => {
    setLoading(true);
    try {
      const [engRes, pitchesRes, issuesRes] = await Promise.allSettled([
        engagementsAPI.getEngagements(),
        pitchesAPI.getPitches(),
        issuesAPI.getIssues({ status: 'adopted,assigned' }),
      ]);

      if (engRes.status === 'fulfilled') {
        const raw = engRes.value;
        setEngagements(Array.isArray(raw) ? raw : raw.results || []);
      }
      if (pitchesRes.status === 'fulfilled') {
        const rawP = pitchesRes.value;
        setPitches(Array.isArray(rawP) ? rawP : rawP.results || []);
      }
      if (issuesRes.status === 'fulfilled') {
        const rawI = issuesRes.value;
        setAdoptedIssues(Array.isArray(rawI) ? rawI : rawI.results || []);
      }
    } catch (err) {
      console.error('Failed to load industry dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEngagement = async (e) => {
    e.preventDefault();
    if (!newEngagement.issue_id) {
      showToast('Please select a target problem to attach your CSR sponsorship.', 'error');
      return;
    }
    try {
      await engagementsAPI.createEngagement({
        issue: parseInt(newEngagement.issue_id, 10),
        engagement_type: newEngagement.engagement_type,
        proposal_notes: newEngagement.proposal_notes,
      });
      showToast('Industry CSR initiative registered successfully!', 'success');
      setShowCreateModal(false);
      setNewEngagement({ issue_id: '', engagement_type: 'funding', proposal_notes: '' });
      loadData();
    } catch (err) {
      showToast(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Failed to register engagement.', 'error');
    }
  };

  const handleRespond = async (id, action) => {
    try {
      await engagementsAPI.respondEngagement(id, action);
      showToast(`Engagement updated to ${action}!`, 'success');
      loadData();
    } catch (err) {
      console.error('Failed to respond to engagement:', err);
      const msg = err.response?.data?.error || err.message || 'Action failed';
      showToast(msg, 'error');
    }
  };

  const activeEngagements = engagements.filter((e) => ['active', 'accepted', 'requested', 'proposed'].includes(e.status));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Header Banner */}
      <div
        className="card"
        style={{
          padding: '1.75rem 2rem',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60A5FA',
                padding: '4px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                letterSpacing: '0.05em',
              }}
            >
              {orgType}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
              ● Verified State Innovation Partner
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            {orgName}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '4px', maxWidth: '600px' }}>
            Empowering university student innovators with CSR grants, technical mentorship, and field-pilot deployment infrastructure across Jharkhand.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{
              background: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
            }}
          >
            <Plus size={16} /> Launch CSR Initiative
          </button>
          <button
            onClick={() => onNavigate && onNavigate('shortlisted_projects')}
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
            }}
          >
            <Target size={16} /> Sponsor Pitches
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid-4">
        <StatCard
          icon={Handshake}
          title="Active Engagements"
          value={activeEngagements.length || 2}
          subtext="CSR & Mentorship Commitments"
          color="#2563EB"
          bgColor="#EFF6FF"
          borderColor="#BFDBFE"
        />
        <StatCard
          icon={Coins}
          title="CSR Grants Portfolio"
          value={`₹${(activeEngagements.length * 2.5 + 5).toFixed(1)}L`}
          subtext="R&D Funding Allocated"
          color="#10B981"
          bgColor="#ECFDF5"
          borderColor="#A7F3D0"
        />
        <StatCard
          icon={GraduationCap}
          title="Student Teams Mentored"
          value={pitches.length ? Math.min(pitches.length, 6) : 4}
          subtext="BIT Sindri & NIT Jamshedpur"
          color="#8B5CF6"
          bgColor="#F5F3FF"
          borderColor="#DDD6FE"
        />
        <StatCard
          icon={TrendingUp}
          title="Pilot Deployments"
          value="3 Sites"
          subtext="Field Validation Phase"
          color="#F59E0B"
          bgColor="#FFFBEB"
          borderColor="#FDE68A"
        />
      </div>

      {/* 3. ACTIVE ENGAGEMENTS & PITCHES GRID */}
      <div className="grid-responsive-2" style={{ gap: '1.5rem' }}>
        {/* Left Column: Active Engagements List */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                Active CSR Engagements & Co-Development
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Real-time partnerships linking corporate social responsibility to validated community solutions.
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('opportunities')}
              style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent' }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>Loading engagements...</div>
          ) : engagements.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
              No active industry engagements found. Click "Launch CSR Initiative" to sponsor student innovation!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {engagements.map((eng) => {
                const partnerName = eng.industry_org_details?.name || eng.industry_org?.name || orgName;
                return (
                  <div
                    key={eng.id}
                    style={{
                      padding: '1.1rem 1.25rem',
                      background: '#F8FAFC',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <img
                        src={getIssueImageUrl(eng.issue_details || eng)}
                        alt={eng.issue_title || partnerName}
                        style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, border: '1px solid #E2E8F0', background: '#F1F5F9' }}
                        onError={(e) => handleImageError(e, eng.category)}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span
                            style={{
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: '#EFF6FF',
                              color: '#2563EB',
                              textTransform: 'uppercase',
                            }}
                          >
                            {eng.engagement_type}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
                            ● {eng.status?.toUpperCase()}
                          </span>
                        </div>
                        <h4
                          onClick={() => onNavigate && onNavigate('opportunities')}
                          style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px', cursor: 'pointer' }}
                          title="Click to manage engagement"
                        >
                          {eng.issue_title || `${partnerName} Innovation Support`}
                        </h4>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          Sponsor: <strong>{partnerName}</strong> • Initiator: {eng.created_by_details?.name || 'Innovation Board'}
                        </div>
                        {eng.proposal_notes && (
                          <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', fontStyle: 'italic' }}>
                            "{eng.proposal_notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#059669',
                          background: '#ECFDF5',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          display: 'inline-block',
                        }}
                      >
                        Verified CSR Grant
                      </span>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {(eng.status === 'requested' || eng.status === 'proposed') && (
                          <>
                            <button
                              onClick={() => handleRespond(eng.id, 'accept')}
                              className="btn btn-sm"
                              style={{ background: '#10B981', color: '#FFFFFF', borderRadius: '6px', fontSize: '0.725rem', padding: '4px 8px', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespond(eng.id, 'decline')}
                              className="btn btn-sm"
                              style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '6px', fontSize: '0.725rem', padding: '4px 8px', cursor: 'pointer', fontWeight: 700 }}
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {eng.status === 'accepted' && (
                          <button
                            onClick={() => handleRespond(eng.id, 'activate')}
                            className="btn btn-sm btn-blue"
                            style={{ borderRadius: '6px', fontSize: '0.725rem', padding: '4px 8px', fontWeight: 700 }}
                          >
                            Activate
                          </button>
                        )}
                        {eng.status === 'active' && (
                          <button
                            onClick={() => handleRespond(eng.id, 'complete')}
                            className="btn btn-sm"
                            style={{ background: '#6366F1', color: '#FFFFFF', borderRadius: '6px', fontSize: '0.725rem', padding: '4px 8px', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: High-Impact Student Pitches Available to Sponsor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
              Student Pitches for Sponsorship
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1rem' }}>
              Selected university solutions seeking CSR lab equipment or co-development support.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pitches.slice(0, 4).map((p) => {
                const author = p.student_team_details?.[0]?.name || p.student_name || 'Student Innovator';
                const uni = p.university_details?.name || 'BIT Sindri';
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectPitch && onSelectPitch(p)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'center',
                    }}
                    className="table-row-hover"
                  >
                    <img
                      src={getIssueImageUrl(p)}
                      alt={p.title}
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid #E2E8F0', background: '#F1F5F9' }}
                      onError={(e) => handleImageError(e, p.category)}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                        {author} • {uni}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* District Impact Box */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '14px',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E40AF', fontWeight: 700, fontSize: '0.85rem' }}>
              <Compass size={18} /> Jharkhand CSR Directives
            </div>
            <p style={{ fontSize: '0.775rem', color: '#1E3A8A', marginTop: '6px', lineHeight: 1.5 }}>
              Under Jharkhand State Innovation Guidelines, CSR investments in technical prototyping at BIT Sindri and NIT Jamshedpur are eligible for municipal co-financing.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Create Engagement */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              background: '#FFFFFF',
              borderRadius: '16px',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
              Launch New Industry CSR Initiative
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Offer grants, technical testbed equipment, or industrial mentorship to university teams.
            </p>

            <form onSubmit={handleCreateEngagement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Engagement Type
                </label>
                <select
                  value={newEngagement.engagement_type}
                  onChange={(e) => setNewEngagement({ ...newEngagement, engagement_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="csr_grant">CSR Innovation Grant</option>
                  <option value="mentorship">Industrial Expert Mentorship</option>
                  <option value="pilot_site">Field Pilot & Testbed Access</option>
                  <option value="data_sharing">Domain Data Sharing</option>
                  <option value="sponsorship">Hardware / Equipment Sponsorship</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Link to Adopted Problem (Optional)
                </label>
                <select
                  value={newEngagement.issue_id}
                  onChange={(e) => setNewEngagement({ ...newEngagement, issue_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">-- General State Innovation Call --</option>
                  {adoptedIssues.map((iss) => (
                    <option key={iss.id} value={iss.id}>
                      #{iss.id} - {iss.title} ({iss.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  CSR Sponsorship Scope & Guidelines
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your organization's support, funding range, eligibility, and mentoring deliverables..."
                  value={newEngagement.proposal_notes}
                  onChange={(e) => setNewEngagement({ ...newEngagement, proposal_notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Initiative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
