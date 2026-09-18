import React, { useState, useEffect } from 'react';
import {
  ListChecks,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit3,
  Building2,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Zap,
  Tag,
  MapPin,
  Calendar,
  Eye,
  Sliders,
  X,
  Plus,
  FileText,
  Layers,
  TrendingUp,
  BarChart3,
  Save,
  ChevronDown,
} from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { authAPI } from '../../api/auth';
import { useToast } from '../../context/ToastContext';

const ALL_STATUSES = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'validating', label: 'Under Validation' },
  { value: 'validated', label: 'Validated' },
  { value: 'adopted', label: 'University Adopted' },
  { value: 'pitching', label: 'Pitching Stage' },
  { value: 'selected', label: 'Pitch Selected' },
  { value: 'in_progress', label: 'In Development' },
  { value: 'developed', label: 'Developed' },
  { value: 'testing', label: 'Testing' },
  { value: 'piloting', label: 'Pilot Phase' },
  { value: 'deployed', label: 'Deployed' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'reopened', label: 'Reopened' },
];

const CATEGORY_OPTIONS = [
  { value: 'urban_infra', label: 'Urban Infrastructure' },
  { value: 'water', label: 'Water & Sanitation' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'education', label: 'Education' },
  { value: 'environment', label: 'Environment & Forests' },
  { value: 'energy', label: 'Renewable Energy' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'rural_livelihoods', label: 'Rural Livelihoods' },
  { value: 'public_admin', label: 'Public Administration' },
  { value: 'accessibility', label: 'Accessibility & Inclusion' },
  { value: 'other', label: 'Other' },
];

const DISTRICT_OPTIONS = [
  'Bokaro',
  'Ranchi',
  'Dhanbad',
  'East Singhbhum',
  'West Singhbhum',
  'Khunti',
  'Latehar',
  'Seraikela Kharsawan',
  'Hazaribagh',
  'Deoghar',
  'Ramgarh',
  'Palamu',
  'Dumka',
  'Giridih',
  'Jamtara',
  'Godda',
  'Sahebganj',
  'Pakur',
  'Lohardaga',
  'Gumla',
  'Simdega',
  'Garhwa',
  'Chatra',
  'Koderma',
];

const BridgeIcon = ({ size = 18, color = '#2563EB' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19V7M20 19V7M4 11h16M2 19h20M7 11c0 3.5 1.5 6 5 6s5-2.5 5-6M9 11v6M15 11v6" />
  </svg>
);

export const AdminProblemsView = () => {
  const { showToast } = useToast();
  const [issues, setIssues] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Modals state
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [adoptModalOpen, setAdoptModalOpen] = useState(false);
  const [targetUniversityId, setTargetUniversityId] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    district: '',
    severity: 'medium',
    ai_confidence_score: 0.85,
  });
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [issuesRes, unisRes] = await Promise.allSettled([
        issuesAPI.getIssues(),
        authAPI.getUniversities(),
      ]);

      if (issuesRes.status === 'fulfilled') {
        const list = Array.isArray(issuesRes.value)
          ? issuesRes.value
          : issuesRes.value.results || [];
        setIssues(list);
      }
      if (unisRes.status === 'fulfilled') {
        const uList = Array.isArray(unisRes.value)
          ? unisRes.value
          : unisRes.value.results || [];
        setUniversities(uList);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load challenges data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Filtered list
  const filtered = issues.filter((iss) => {
    const matchesSearch =
      (iss.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (iss.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (iss.district || '').toLowerCase().includes(search.toLowerCase()) ||
      (iss.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || iss.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Action: Force Status Override
  const handleForceStatusOverride = async (e) => {
    e.preventDefault();
    if (!selectedIssue || !targetStatus) return;
    setSubmitting(true);
    try {
      await issuesAPI.updateIssue(selectedIssue.id, {
        status: targetStatus,
      });
      showToast(`Force override successful: Challenge is now "${targetStatus}"`, 'success');
      setOverrideModalOpen(false);
      fetchAll();
    } catch (err) {
      console.error(err);
      showToast('Failed to override status. Check backend permissions.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Action: Force University Adoption
  const handleForceAdoption = async (e) => {
    e.preventDefault();
    if (!selectedIssue || !targetUniversityId) return;
    setSubmitting(true);
    try {
      await issuesAPI.forceAdoptIssue(selectedIssue.id, targetUniversityId);
      const chosenUni = universities.find((u) => u.id === targetUniversityId);
      showToast(
        `Direct Adoption Enacted! Problem assigned to ${chosenUni?.name || 'Selected University'}`,
        'success'
      );
      setAdoptModalOpen(false);
      fetchAll();
    } catch (err) {
      console.error(err);
      showToast('Failed to enforce university adoption', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Action: Edit Issue Details
  const handleEditIssue = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;
    setSubmitting(true);
    try {
      await issuesAPI.updateIssue(selectedIssue.id, editForm);
      showToast('Challenge details updated by Master Admin', 'success');
      setEditModalOpen(false);
      fetchAll();
    } catch (err) {
      console.error(err);
      showToast('Failed to update challenge details', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Action: Delete Issue
  const handleDeleteIssue = async (issue) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently purge challenge "${issue.title}"? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await issuesAPI.deleteIssue(issue.id);
      showToast('Challenge eradicated from database', 'success');
      fetchAll();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete challenge', 'error');
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'submitted':
        return { label: 'Submitted', color: '#64748B', bg: '#F1F5F9' };
      case 'validating':
        return { label: 'Validating', color: '#D97706', bg: '#FEF3C7' };
      case 'validated':
        return { label: 'Validated', color: '#2563EB', bg: '#EFF6FF' };
      case 'adopted':
        return { label: 'Adopted', color: '#7C3AED', bg: '#F5F3FF' };
      case 'in_progress':
      case 'developed':
        return { label: 'Developing', color: '#0284C7', bg: '#E0F2FE' };
      case 'deployed':
      case 'resolved':
        return { label: 'Resolved / Live', color: '#10B981', bg: '#ECFDF5' };
      default:
        return { label: st, color: '#475569', bg: '#F8FAFC' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1E38 100%)',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          border: '1px solid #334155',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 800,
                background: '#EF4444',
                color: '#FFF',
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              SUPERADMIN AUTHORITY
            </span>
            <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 600 }}>
              Full Control over Lifecycle & Allocations
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0 }}>
            Master Problem & Challenge Oversight
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#94A3B8', marginTop: '4px' }}>
            Bypass adoption delays, force-override state transitions, edit parameters directly, or purge entries.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={fetchAll}
            className="btn btn-outline"
            style={{ color: '#FFFFFF', borderColor: '#475569' }}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>TOTAL REGISTERED</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
            {issues.length}
          </div>
        </div>
        <div className="card" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700 }}>UNDER VALIDATION</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706', marginTop: '2px' }}>
            {issues.filter((i) => i.status === 'validating' || i.status === 'submitted').length}
          </div>
        </div>
        <div className="card" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 700 }}>UNIVERSITY ADOPTED</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7C3AED', marginTop: '2px' }}>
            {issues.filter((i) => i.status === 'adopted').length}
          </div>
        </div>
        <div className="card" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>RESOLVED / DEPLOYED</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
            {issues.filter((i) => ['deployed', 'resolved'].includes(i.status)).length}
          </div>
        </div>
      </div>

      {/* Controls: Search & Filter */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
          <Search
            size={16}
            color="#94A3B8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Search problems by title, description, district, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="#64748B" />
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: '180px' }}
          >
            <option value="ALL">All Statuses ({issues.length})</option>
            {ALL_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label} ({issues.filter((i) => i.status === st.value).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Problem Statement</th>
                <th style={{ padding: '1rem 1rem' }}>Location / Category</th>
                <th style={{ padding: '1rem 1rem' }}>Adoption Status</th>
                <th style={{ padding: '1rem 1rem' }}>Lifecycle State</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Master Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                    Loading system challenges...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                    No challenges matched the search filters.
                  </td>
                </tr>
              ) : (
                filtered.map((issue) => {
                  const badge = getStatusBadge(issue.status);
                  const isAdopted = !!issue.adopted_university || issue.status === 'adopted';
                  return (
                    <tr
                      key={issue.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background 0.15s ease',
                      }}
                      className="hover-row"
                    >
                      {/* Problem Statement */}
                      <td style={{ padding: '1rem 1.25rem', maxWidth: '320px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.925rem' }}>
                          {issue.title}
                        </div>
                        <div
                          style={{
                            fontSize: '0.775rem',
                            color: '#64748B',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginTop: '2px',
                          }}
                        >
                          {issue.description}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '0.7rem', color: '#94A3B8' }}>
                          <span>ID: #{String(issue.id || '').slice(0, 8)}</span>
                          <span>• AI Score: {Math.round((issue.ai_confidence_score || 0.8) * 100)}%</span>
                        </div>
                      </td>

                      {/* Location & Category */}
                      <td style={{ padding: '1rem 1rem', fontSize: '0.825rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#334155', fontWeight: 600 }}>
                          <MapPin size={13} color="#EF4444" /> {issue.district || 'Statewide'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B', fontSize: '0.75rem', marginTop: '3px' }}>
                          <Tag size={12} /> {issue.category}
                        </div>
                      </td>

                      {/* Adoption Status */}
                      <td style={{ padding: '1rem 1rem' }}>
                        {isAdopted ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#F5F3FF', color: '#7C3AED', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                            <Building2 size={13} />
                            {issue.adopted_university_name || 'Adopted Campus'}
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FFFBEB', color: '#D97706', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                            Pending Campus Adoption
                          </div>
                        )}
                      </td>

                      {/* Lifecycle State */}
                      <td style={{ padding: '1rem 1rem' }}>
                        <span
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: '20px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          ● {badge.label}
                        </span>
                      </td>

                      {/* Master Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {/* Force Status */}
                          <button
                            onClick={() => {
                              setSelectedIssue(issue);
                              setTargetStatus(issue.status);
                              setOverrideModalOpen(true);
                            }}
                            title="Force Override Status"
                            style={{
                              background: '#EFF6FF',
                              color: '#2563EB',
                              border: '1px solid #BFDBFE',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            <Zap size={13} /> Override
                          </button>

                          {/* Force Adopt */}
                          <button
                            onClick={() => {
                              setSelectedIssue(issue);
                              setTargetUniversityId(universities[0]?.id || '');
                              setAdoptModalOpen(true);
                            }}
                            title="Force University Adoption"
                            style={{
                              background: '#F5F3FF',
                              color: '#7C3AED',
                              border: '1px solid #DDD6FE',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            <Building2 size={13} /> Adopt
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => {
                              setSelectedIssue(issue);
                              setEditForm({
                                title: issue.title || '',
                                description: issue.description || '',
                                category: issue.category || '',
                                district: issue.district || '',
                                severity: issue.severity || 'medium',
                                ai_confidence_score: issue.ai_confidence_score || 0.85,
                              });
                              setEditModalOpen(true);
                            }}
                            title="Edit Challenge"
                            style={{
                              background: '#F1F5F9',
                              color: '#475569',
                              border: '1px solid #CBD5E1',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            <Edit3 size={13} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteIssue(issue)}
                            title="Permanent Purge"
                            style={{
                              background: '#FEF2F2',
                              color: '#EF4444',
                              border: '1px solid #FECACA',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Force Status Override */}
      {overrideModalOpen && selectedIssue && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} color="#2563EB" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Force Status Override
                </h3>
              </div>
              <button onClick={() => setOverrideModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#64748B" />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              As a Master Admin, you possess unrestricted authority to force this problem statement into any lifecycle state immediately, bypassing standard validation, adoption, or review criteria.
            </p>

            <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>TARGET CHALLENGE</div>
              <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.925rem' }}>{selectedIssue.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>Current Status: <strong>{selectedIssue.status}</strong></div>
            </div>

            <form onSubmit={handleForceStatusOverride} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  New Lifecycle Status:
                </label>
                <select
                  className="input-field"
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  required
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label} ({st.value})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ background: '#2563EB' }}
                >
                  {submitting ? 'Applying Override...' : 'Apply Force Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Force University Adoption */}
      {adoptModalOpen && selectedIssue && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#7C3AED" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Force University Adoption
                </h3>
              </div>
              <button onClick={() => setAdoptModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#64748B" />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Immediately assign this problem statement to a university's incubation cell. This unlocks student pitch submissions and open calls instantly for this campus.
            </p>

            <form onSubmit={handleForceAdoption} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Select Adopting Campus / Institution:
                </label>
                <select
                  className="input-field"
                  value={targetUniversityId}
                  onChange={(e) => setTargetUniversityId(e.target.value)}
                  required
                >
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.code || u.district || 'State Campus'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setAdoptModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ background: '#7C3AED' }}
                >
                  {submitting ? 'Adopting...' : 'Directly Enforce Adoption'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Problem Details (Pixel-Perfect from Screenshot) */}
      {editModalOpen && selectedIssue && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(6px)', background: 'rgba(15, 23, 42, 0.6)' }} onClick={() => setEditModalOpen(false)}>
          <div
            className="modal-content"
            style={{
              maxWidth: '680px',
              width: '100%',
              borderRadius: '24px',
              padding: '2rem',
              background: '#FFFFFF',
              boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.25)',
              border: '1px solid #E2E8F0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: '#F0F7FF',
                    border: '1px solid #E0EDFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0F172A',
                  }}
                >
                  <Edit3 size={22} color="#0F172A" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    Direct Problem Parameter Modification
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '3px 0 0 0' }}>
                    Update the key details of the problem
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#0F172A',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Close modal"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleEditIssue} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Field 1: Problem Title */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: '6px',
                  }}
                >
                  <FileText size={16} color="#0F172A" />
                  <span>Problem Title</span>
                  <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="e.g. Heavy Monsoon Potholes"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.925rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  required
                />
              </div>

              {/* Field 2: Detailed Description */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: '6px',
                  }}
                >
                  <Calendar size={16} color="#0F172A" />
                  <span>Detailed Description</span>
                  <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value.slice(0, 500) })}
                  placeholder="Detailed breakdown of the issue..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.925rem',
                    color: '#0F172A',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '85px',
                    lineHeight: '1.5',
                  }}
                  required
                />
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748B', marginTop: '4px', fontWeight: 500 }}>
                  {(editForm.description || '').length}/500
                </div>
              </div>

              {/* Row 1: Category & District */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Category */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: '6px',
                    }}
                  >
                    <Layers size={16} color="#0F172A" />
                    <span>Category</span>
                    <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      background: '#F0F7FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '14px',
                      padding: '0.45rem 0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: '#DBEAFE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563EB',
                        flexShrink: 0,
                      }}
                    >
                      <BridgeIcon size={18} color="#2563EB" />
                    </div>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        paddingLeft: '0.75rem',
                        paddingRight: '2rem',
                        fontWeight: 600,
                        fontSize: '0.925rem',
                        color: '#0F172A',
                        appearance: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} color="#334155" style={{ position: 'absolute', right: '14px', pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* District */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: '6px',
                    }}
                  >
                    <MapPin size={16} color="#0F172A" />
                    <span>District</span>
                    <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      background: '#F0F7FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '14px',
                      padding: '0.45rem 0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: '#DBEAFE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563EB',
                        flexShrink: 0,
                      }}
                    >
                      <MapPin size={18} color="#2563EB" />
                    </div>
                    <select
                      value={editForm.district}
                      onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                      style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        paddingLeft: '0.75rem',
                        paddingRight: '2rem',
                        fontWeight: 600,
                        fontSize: '0.925rem',
                        color: '#0F172A',
                        appearance: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {DISTRICT_OPTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} color="#334155" style={{ position: 'absolute', right: '14px', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>

              {/* Row 2: Severity & AI Confidence Score */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Severity */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: '6px',
                    }}
                  >
                    <ShieldAlert size={16} color="#0F172A" />
                    <span>Severity</span>
                    <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      background: '#FFFDF5',
                      border: '1px solid #FDE68A',
                      borderRadius: '14px',
                      padding: '0.45rem 0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: '#FEF3C7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#D97706',
                        flexShrink: 0,
                      }}
                    >
                      <AlertTriangle size={18} color="#D97706" />
                    </div>
                    <select
                      value={editForm.severity}
                      onChange={(e) => setEditForm({ ...editForm, severity: e.target.value })}
                      style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        paddingLeft: '0.75rem',
                        paddingRight: '2rem',
                        fontWeight: 600,
                        fontSize: '0.925rem',
                        color: '#0F172A',
                        appearance: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                    <ChevronDown size={18} color="#334155" style={{ position: 'absolute', right: '14px', pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* AI Confidence Score */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: '6px',
                    }}
                  >
                    <TrendingUp size={16} color="#0F172A" />
                    <span>AI Confidence Score (0.0 – 1.0)</span>
                  </label>
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      background: '#F4F8FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '14px',
                      padding: '0.45rem 0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: '#EDE9FE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6366F1',
                        flexShrink: 0,
                      }}
                    >
                      <BarChart3 size={18} color="#6366F1" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={editForm.ai_confidence_score}
                      onChange={(e) => setEditForm({ ...editForm, ai_confidence_score: parseFloat(e.target.value) || 0 })}
                      style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        paddingLeft: '0.75rem',
                        fontWeight: 600,
                        fontSize: '0.925rem',
                        color: '#0F172A',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginTop: '0.75rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '999px',
                    padding: '0.65rem 1.6rem',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '0.65rem 1.6rem',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1E293B';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0F172A';
                  }}
                >
                  <Save size={18} />
                  {submitting ? 'Saving...' : 'Save Modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
