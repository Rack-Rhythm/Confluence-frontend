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
  Plus
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
                          <span>ID: #{issue.id.slice(0, 8)}</span>
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

      {/* MODAL 3: Edit Problem Details */}
      {editModalOpen && selectedIssue && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={20} color="#0F172A" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Direct Problem Parameter Modification
                </h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleEditIssue} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Problem Title
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Detailed Description
                </label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Category
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    District
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Severity
                  </label>
                  <select
                    className="input-field"
                    value={editForm.severity}
                    onChange={(e) => setEditForm({ ...editForm, severity: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    AI Confidence Score (0.0 - 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    className="input-field"
                    value={editForm.ai_confidence_score}
                    onChange={(e) => setEditForm({ ...editForm, ai_confidence_score: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ background: '#0F172A' }}
                >
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
