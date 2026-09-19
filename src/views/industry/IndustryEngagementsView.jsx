import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, Building2, Calendar, Sparkles, Plus, CheckCircle2, Handshake, Filter } from 'lucide-react';
import { engagementsAPI } from '../../api/engagements';
import { issuesAPI } from '../../api/issues';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const IndustryEngagementsView = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [engagements, setEngagements] = useState([]);
  const [adoptedIssues, setAdoptedIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Sync filter type with route if possible
  let initialFilter = 'all';
  if (location.pathname.includes('/funding')) initialFilter = 'funding';
  if (location.pathname.includes('/partnerships')) initialFilter = 'technology_transfer'; // or prototyping
  const [filterType, setFilterType] = useState(initialFilter);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    issue_id: '',
    engagement_type: 'funding',
    proposal_notes: '',
  });

  const orgName = user?.organization_details?.name || user?.organization_name || 'Tata Steel Foundation & CSR';

  const loadData = async () => {
    setLoading(true);
    try {
      const [engRes, issRes] = await Promise.allSettled([
        engagementsAPI.getEngagements(),
        issuesAPI.getIssues({ status: 'adopted,assigned' }),
      ]);
      if (engRes.status === 'fulfilled') {
        const raw = engRes.value;
        setEngagements(Array.isArray(raw) ? raw : raw.results || []);
      }
      if (issRes.status === 'fulfilled') {
        const rawI = issRes.value;
        setAdoptedIssues(Array.isArray(rawI) ? rawI : rawI.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.issue_id) {
      showToast('Please select an adopted challenge to attach this engagement.', 'error');
      return;
    }
    try {
      await engagementsAPI.createEngagement({
        issue: parseInt(form.issue_id, 10),
        engagement_type: form.engagement_type,
        proposal_notes: form.proposal_notes,
      });
      showToast('Industry engagement registered successfully!', 'success');
      setShowModal(false);
      setForm({ issue_id: '', engagement_type: 'funding', proposal_notes: '' });
      loadData();
    } catch (err) {
      showToast(err.response?.data?.detail || err.response?.data?.issue?.[0] || 'Failed to submit engagement', 'error');
    }
  };

  const handleRespond = async (id, action) => {
    try {
      await engagementsAPI.respondEngagement(id, action);
      showToast(`Engagement successfully updated (${action})!`, 'success');
      loadData();
    } catch (err) {
      console.error('Failed to respond to engagement:', err);
      const msg = err.response?.data?.error || err.message || 'Action failed';
      showToast(msg, 'error');
    }
  };

  const filtered = engagements.filter((e) => {
    if (filterType === 'all') return true;
    return e.engagement_type === filterType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
            CSR Engagements & Sponsorships
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Manage industry-sponsored open calls, university partnerships, and technical prototyping grants for {orgName}.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> New Engagement Call
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['all', 'funding', 'mentorship', 'prototyping', 'technology_transfer'].map((t) => (
          <button
            key={t}
            onClick={() => {
              setFilterType(t);
              if (t === 'funding') navigate('/industry/funding');
              else if (t === 'technology_transfer' || t === 'prototyping') navigate('/industry/partnerships');
              else navigate('/industry/opportunities');
            }}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: filterType === t ? '#2563EB' : '#F1F5F9',
              color: filterType === t ? '#FFFFFF' : '#475569',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>Loading engagements...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          No engagements found under this filter.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((eng) => {
            const partner = eng.industry_org_details?.name || eng.industry_org?.name || orgName;
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
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        color: '#2563EB',
                        background: '#EFF6FF',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {eng.engagement_type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
                      ● {eng.status?.toUpperCase()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
                    {eng.issue_title || `${partner} CSR Program`}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.75rem' }}>
                    🏢 {partner}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                    {eng.proposal_notes || 'Active industry CSR partnership with state technical universities.'}
                  </p>
                </div>

                <div
                  style={{
                    padding: '0.75rem',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.75rem',
                    color: '#64748B',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>Registered: {new Date(eng.created_at || Date.now()).toLocaleDateString()}</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>Verified</span>
                </div>

                {/* Status transition actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
                  {(eng.status === 'requested' || eng.status === 'proposed') && (
                    <>
                      <button
                        onClick={() => handleRespond(eng.id, 'accept')}
                        className="btn btn-sm"
                        style={{ background: '#10B981', color: '#FFFFFF', borderRadius: '6px', fontSize: '0.75rem', padding: '6px 12px', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Accept Proposal
                      </button>
                      <button
                        onClick={() => handleRespond(eng.id, 'decline')}
                        className="btn btn-sm"
                        style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '6px', fontSize: '0.75rem', padding: '6px 12px', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {eng.status === 'accepted' && (
                    <button
                      onClick={() => handleRespond(eng.id, 'activate')}
                      className="btn btn-sm btn-blue"
                      style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '6px 12px', fontWeight: 700 }}
                    >
                      Activate Partnership
                    </button>
                  )}
                  {eng.status === 'active' && (
                    <button
                      onClick={() => handleRespond(eng.id, 'complete')}
                      className="btn btn-sm"
                      style={{ background: '#6366F1', color: '#FFFFFF', borderRadius: '6px', fontSize: '0.75rem', padding: '6px 12px', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Engagement */}
      {showModal && (
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
              Publish Engagement Call
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Link your CSR initiative to an existing adopted problem or open innovation track.
            </p>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Engagement Type
                </label>
                <select
                  value={form.engagement_type}
                  onChange={(e) => setForm({ ...form, engagement_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="funding">CSR / Grant Funding</option>
                  <option value="mentorship">Mentorship & Advisory</option>
                  <option value="prototyping">Prototyping & Lab Access</option>
                  <option value="technology_transfer">Technology Transfer & Licensing</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Target Problem Statement (Required)
                </label>
                <select
                  value={form.issue_id}
                  required
                  onChange={(e) => setForm({ ...form, issue_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">-- Select an Adopted Challenge --</option>
                  {adoptedIssues.map((iss) => (
                    <option key={iss.id} value={iss.id}>
                      #{iss.id} - {iss.title} ({iss.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Description & Deliverables
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Details of the sponsorship, target milestones, and student team expectations..."
                  value={form.proposal_notes}
                  onChange={(e) => setForm({ ...form, proposal_notes: e.target.value })}
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
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
