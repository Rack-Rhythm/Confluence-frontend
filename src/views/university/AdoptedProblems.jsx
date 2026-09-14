import React, { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  Megaphone,
  Plus,
  Layers,
  MapPin,
  Users,
  ArrowRight,
  Handshake,
  X,
  Building2,
  CheckCircle2,
  Clock,
  Check,
  AlertCircle,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { authAPI } from '../../api/auth';
import { engagementsAPI } from '../../api/engagements';
import { StatusBadge, CategoryPill } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

export const AdoptedProblems = ({ onSelectIssue, onCreateOpenCall }) => {
  const { showToast } = useToast();
  const [issues, setIssues] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('adopted'); // 'adopted' or 'partnerships'
  const [actionLoading, setActionLoading] = useState(false);
  const [proposeLoading, setProposeLoading] = useState(false);
  const [selectedIssueForEngage, setSelectedIssueForEngage] = useState(null);
  const [engageForm, setEngageForm] = useState({
    industry_org: '',
    engagement_type: 'funding',
    proposal_notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [issRes, orgRes, engRes] = await Promise.allSettled([
        issuesAPI.getIssues({ status: 'adopted,assigned' }),
        authAPI.getOrganizations(),
        engagementsAPI.getEngagements(),
      ]);

      if (issRes.status === 'fulfilled') {
        const raw = Array.isArray(issRes.value) ? issRes.value : issRes.value.results || [];
        setIssues(raw);
      }
      if (orgRes.status === 'fulfilled') {
        const rawO = orgRes.value;
        const orgList = Array.isArray(rawO) ? rawO : rawO?.results || [];
        setOrganizations(orgList);
      }
      if (engRes.status === 'fulfilled') {
        const rawE = engRes.value;
        setEngagements(Array.isArray(rawE) ? rawE : rawE.results || []);
      }
    } catch (err) {
      console.error('Failed to load adopted problems data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProposeEngagement = async (e) => {
    e.preventDefault();
    if (!engageForm.industry_org) {
      showToast('Please select a target industry partner.', 'error');
      return;
    }
    setProposeLoading(true);
    try {
      await engagementsAPI.createEngagement({
        issue: selectedIssueForEngage.id,
        industry_org: parseInt(engageForm.industry_org, 10),
        engagement_type: engageForm.engagement_type,
        proposal_notes: engageForm.proposal_notes,
      });
      showToast('Partnership proposal dispatched to industry sponsor!', 'success');
      setSelectedIssueForEngage(null);
      setEngageForm({ industry_org: '', engagement_type: 'funding', proposal_notes: '' });
      loadData();
    } catch (err) {
      console.error('Failed to dispatch proposal:', err);
      const msg = err.response?.data?.detail || err.response?.data?.message || err.response?.data?.error || 'Failed to dispatch proposal.';
      showToast(msg, 'error');
    } finally {
      setProposeLoading(false);
    }
  };

  const handleRespondEngagement = async (engagementId, action) => {
    setActionLoading(true);
    try {
      await engagementsAPI.respondEngagement(engagementId, action);
      const actionLabels = {
        accept: 'Partnership Accepted & MOU Initiated!',
        decline: 'Partnership proposal declined.',
        activate: 'Partnership activated for active collaboration!',
        complete: 'Partnership marked as completed.',
      };
      showToast(actionLabels[action] || `Action "${action}" processed successfully!`, 'success');
      loadData();
    } catch (err) {
      console.error('Failed to respond to engagement:', err);
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Action failed.';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingEngagements = engagements.filter((e) => e.status === 'requested');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
            Adopted Societal Challenges & Partnerships
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Manage institutional problem adoptions, student open calls, and incoming industry CSR & mentorship proposals.
          </p>
        </div>
      </div>

      {/* Pending Incoming Proposals Alert Banner */}
      {pendingEngagements.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)',
            border: '1px solid #BFDBFE',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, minWidth: '280px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#2563EB',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Handshake size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1D4ED8', background: '#DBEAFE', padding: '2px 8px', borderRadius: '999px', textTransform: 'uppercase' }}>
                  Action Required
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  {pendingEngagements.length} pending industry proposal{pendingEngagements.length > 1 ? 's' : ''}
                </span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
                New Proposal: {pendingEngagements[0].industry_org_details?.name || 'Industry Partner'}
              </h4>
              <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.4 }}>
                Proposed a <strong>{pendingEngagements[0].engagement_type?.replace('_', ' ')}</strong> partnership for Problem #{pendingEngagements[0].issue} ({pendingEngagements[0].issue_title}).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              disabled={actionLoading}
              onClick={() => handleRespondEngagement(pendingEngagements[0].id, 'accept')}
              className="btn btn-sm"
              style={{ background: '#10B981', color: '#FFFFFF', borderRadius: '8px', padding: '7px 14px', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <CheckCircle2 size={15} /> Accept Proposal
            </button>
            <button
              disabled={actionLoading}
              onClick={() => handleRespondEngagement(pendingEngagements[0].id, 'decline')}
              className="btn btn-sm"
              style={{ background: '#FFFFFF', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '7px 12px', fontWeight: 700, cursor: 'pointer' }}
            >
              Decline
            </button>
            <button
              onClick={() => setActiveTab('partnerships')}
              className="btn btn-outline btn-sm"
              style={{ borderRadius: '8px', padding: '7px 12px', fontSize: '0.8rem' }}
            >
              View All Proposals
            </button>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('adopted')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'adopted' ? '#0F172A' : '#F1F5F9',
            color: activeTab === 'adopted' ? '#FFFFFF' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <Layers size={16} />
          <span>Adopted Challenges</span>
          <span style={{ fontSize: '0.725rem', background: activeTab === 'adopted' ? 'rgba(255,255,255,0.2)' : '#E2E8F0', padding: '2px 7px', borderRadius: '999px' }}>
            {issues.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('partnerships')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'partnerships' ? '#2563EB' : '#F1F5F9',
            color: activeTab === 'partnerships' ? '#FFFFFF' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <Handshake size={16} />
          <span>Industry Partnerships & CSR</span>
          <span
            style={{
              fontSize: '0.725rem',
              background: pendingEngagements.length > 0 ? '#EF4444' : (activeTab === 'partnerships' ? 'rgba(255,255,255,0.25)' : '#E2E8F0'),
              color: pendingEngagements.length > 0 ? '#FFFFFF' : 'inherit',
              padding: '2px 7px',
              borderRadius: '999px',
              fontWeight: 800,
            }}
          >
            {pendingEngagements.length > 0 ? `${pendingEngagements.length} NEW` : engagements.length}
          </span>
        </button>
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94A3B8' }}>
          Loading adopted problems & partnership data...
        </div>
      ) : activeTab === 'adopted' ? (
        /* Tab 1: Adopted Challenges */
        issues.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748B' }}>
            No adopted issues found. Go to Problem Pipeline to adopt validated issues.
          </div>
        ) : (
          <div className="grid-2">
            {issues.map((issue) => {
              const issueEngagements = engagements.filter((e) => e.issue === issue.id);
              const hasPending = issueEngagements.some((e) => e.status === 'requested');

              return (
                <div key={issue.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <CategoryPill category={issue.category} />
                      <StatusBadge status={issue.status} />
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
                      {issue.title}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.75rem' }}>
                      📍 {issue.district} • Adopted by University Innovation Cell
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, marginBottom: '1rem' }}>
                      {issue.description}
                    </p>

                    {/* Associated Industry Engagements Snippet */}
                    {issueEngagements.length > 0 && (
                      <div
                        style={{
                          background: hasPending ? '#FEF2F2' : '#F8FAFC',
                          border: `1px solid ${hasPending ? '#FECACA' : '#E2E8F0'}`,
                          borderRadius: '8px',
                          padding: '0.6rem 0.85rem',
                          marginBottom: '1rem',
                          fontSize: '0.75rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 700, color: hasPending ? '#B91C1C' : '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Handshake size={13} /> Industry Sponsor: {issueEngagements[0].industry_org_details?.name || 'Partner'}
                          </span>
                          <span style={{ fontWeight: 700, color: hasPending ? '#DC2626' : '#2563EB', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            {issueEngagements[0].status}
                          </span>
                        </div>
                        <div style={{ color: '#64748B' }}>
                          Type: {issueEngagements[0].engagement_type?.replace('_', ' ')} •
                          <button
                            onClick={() => setActiveTab('partnerships')}
                            style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, cursor: 'pointer', paddingLeft: '4px', textDecoration: 'underline' }}
                          >
                            Manage in Partnerships tab
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => onSelectIssue(issue)}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, minWidth: '100px', borderRadius: '8px' }}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedIssueForEngage(issue);
                        if (!engageForm.industry_org && organizations.length > 0) {
                          setEngageForm((prev) => ({ ...prev, industry_org: String(organizations[0].id) }));
                        }
                      }}
                      className="btn btn-sm"
                      style={{ flex: 1, minWidth: '120px', borderRadius: '8px', background: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <Handshake size={14} /> Engage Industry
                    </button>
                    <button
                      onClick={() => {
                        if (onCreateOpenCall) onCreateOpenCall(issue);
                        else showToast(`Open Pitch Call opened for "${issue.title}"!`, 'success');
                      }}
                      className="btn btn-blue btn-sm"
                      style={{ flex: 1, minWidth: '120px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <Megaphone size={14} /> Open Pitch Call
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Tab 2: Industry Partnerships & CSR Proposals */
        engagements.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748B' }}>
            <Handshake size={36} color="#94A3B8" style={{ margin: '0 auto 1rem auto' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
              No Industry Partnerships Registered Yet
            </div>
            <p style={{ fontSize: '0.85rem', maxWidth: '480px', margin: '0 auto' }}>
              Use the "Engage Industry" button on any adopted challenge to invite corporate sponsors, or review incoming proposals here when industry partners reach out.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {engagements.map((eng) => {
              const partner = eng.industry_org_details?.name || eng.industry_org?.name || 'Corporate Partner';
              const isPending = eng.status === 'requested';

              return (
                <div
                  key={eng.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    border: isPending ? '2px solid #93C5FD' : '1px solid #E2E8F0',
                    background: isPending ? '#F0F9FF' : '#FFFFFF',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 800,
                          color: '#2563EB',
                          background: '#EFF6FF',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {eng.engagement_type?.replace('_', ' ')}
                      </span>
                      <StatusBadge status={eng.status} />
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
                      {partner}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building2 size={14} /> Corporate Sponsor • 📍 Problem #{eng.issue}: {eng.issue_title}
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Proposal Notes:
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#1E293B', lineHeight: 1.5, margin: 0 }}>
                        {eng.proposal_notes || 'Proposed collaboration with technical university cohort.'}
                      </p>
                    </div>

                    {eng.response_notes && (
                      <div style={{ background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.775rem', color: '#475569' }}>
                        <strong>Response Notes:</strong> {eng.response_notes}
                      </div>
                    )}
                  </div>

                  <div>
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: '#F8FAFC',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '0.725rem',
                        color: '#64748B',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <span>Initiated: {new Date(eng.created_at || Date.now()).toLocaleDateString()}</span>
                      <span style={{ fontWeight: 700, color: eng.initiator === 'industry' ? '#2563EB' : '#059669' }}>
                        {eng.initiator === 'industry' ? 'Incoming from Industry' : 'University Outreach'}
                      </span>
                    </div>

                    {/* Response Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {eng.status === 'requested' && (
                        <>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleRespondEngagement(eng.id, 'accept')}
                            className="btn btn-sm"
                            style={{ flex: 2, background: '#10B981', color: '#FFFFFF', borderRadius: '8px', fontSize: '0.8rem', padding: '7px 12px', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <CheckCircle2 size={15} /> Accept Partnership
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleRespondEngagement(eng.id, 'decline')}
                            className="btn btn-sm"
                            style={{ flex: 1, background: '#FFFFFF', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '8px', fontSize: '0.8rem', padding: '7px 10px', cursor: 'pointer', fontWeight: 700 }}
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {eng.status === 'accepted' && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleRespondEngagement(eng.id, 'activate')}
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%', borderRadius: '8px', fontSize: '0.8rem', padding: '7px 12px' }}
                        >
                          Activate Collaboration (MOU Ready)
                        </button>
                      )}

                      {eng.status === 'active' && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleRespondEngagement(eng.id, 'complete')}
                          className="btn btn-outline btn-sm"
                          style={{ width: '100%', borderRadius: '8px', fontSize: '0.8rem', padding: '7px 12px' }}
                        >
                          Mark as Completed
                        </button>
                      )}

                      {eng.status === 'completed' && (
                        <div style={{ width: '100%', textAlign: 'center', padding: '6px', background: '#ECFDF5', borderRadius: '6px', color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>
                          ✓ Partnership Completed
                        </div>
                      )}

                      {eng.status === 'declined' && (
                        <div style={{ width: '100%', textAlign: 'center', padding: '6px', background: '#F8FAFC', borderRadius: '6px', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700 }}>
                          Proposal Declined
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Engage Industry Modal */}
      {selectedIssueForEngage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Handshake size={22} color="#2563EB" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  Propose Industry Partnership
                </h2>
              </div>
              <button onClick={() => setSelectedIssueForEngage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748B" />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
              Initiate corporate sponsorship or technical co-development for: <strong style={{ color: '#0F172A' }}>{selectedIssueForEngage.title}</strong>
            </p>

            <form onSubmit={handleProposeEngagement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Target Industry Partner (Organization)
                </label>
                <select
                  required
                  value={engageForm.industry_org}
                  onChange={(e) => setEngageForm({ ...engageForm, industry_org: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                >
                  <option value="">-- Choose Corporate / Industry Partner --</option>
                  {(Array.isArray(organizations) ? organizations : []).map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.org_type?.toUpperCase() || 'CSR'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Engagement Type
                </label>
                <select
                  value={engageForm.engagement_type}
                  onChange={(e) => setEngageForm({ ...engageForm, engagement_type: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                >
                  <option value="funding">CSR / Grant Funding</option>
                  <option value="mentorship">Mentorship & Technical Advisory</option>
                  <option value="prototyping">Prototyping & Lab Access</option>
                  <option value="technology_transfer">Technology Transfer & Licensing</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Partnership Proposal & Deliverables
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Outline the expected corporate funding, prototyping facilities, or mentor advisory needed for this student cohort..."
                  value={engageForm.proposal_notes}
                  onChange={(e) => setEngageForm({ ...engageForm, proposal_notes: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  disabled={proposeLoading}
                  onClick={() => setSelectedIssueForEngage(null)}
                  className="btn btn-outline"
                  style={{ borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={proposeLoading}
                  className="btn btn-primary"
                  style={{ borderRadius: '8px' }}
                >
                  {proposeLoading ? 'Dispatching Proposal...' : 'Send Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
