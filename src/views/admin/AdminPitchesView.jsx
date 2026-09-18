import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Award,
  Zap,
  Trash2,
  Edit3,
  ExternalLink,
  GitBranch,
  Lock,
  Unlock,
  Building2,
  School,
  X,
  User,
  IndianRupee,
  FileCode,
  ShieldCheck
} from 'lucide-react';
import { pitchesAPI } from '../../api/pitches';
import { useToast } from '../../context/ToastContext';
import { DeleteConfirmModal } from '../../components/common/DeleteConfirmModal';

const PITCH_STATUSES = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'changes_requested', label: 'Changes Requested' },
  { value: 'resubmitted', label: 'Resubmitted' },
  { value: 'selected', label: 'Selected / Funded' },
  { value: 'merged', label: 'Merged' },
  { value: 'rejected', label: 'Rejected' },
];

export const AdminPitchesView = () => {
  const { showToast } = useToast();
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Deletion modal state
  const [pitchToDelete, setPitchToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPitch, setSelectedPitch] = useState(null);

  // Modals
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [fundingAmount, setFundingAmount] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    summary: '',
    tech_stack: '',
    demo_url: '',
    repo_url: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPitches = async () => {
    setLoading(true);
    try {
      const data = await pitchesAPI.getPitches();
      const list = Array.isArray(data) ? data : data.results || [];
      setPitches(list);
    } catch (err) {
      console.error(err);
      showToast('Failed to load solutions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPitches();
  }, []);

  const filtered = pitches.filter((p) => {
    const s = search.toLowerCase();
    const matchesSearch =
      (p.title || '').toLowerCase().includes(s) ||
      (p.summary || '').toLowerCase().includes(s) ||
      (p.student_name || '').toLowerCase().includes(s) ||
      (p.issue_title || '').toLowerCase().includes(s);
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Action: Force Status / Award
  const handleForceStatus = async (e) => {
    e.preventDefault();
    if (!selectedPitch || !newStatus) return;
    setSubmitting(true);
    try {
      const payload = { status: newStatus };
      if (fundingAmount) {
        payload.allocated_grant = fundingAmount;
      }
      await pitchesAPI.updatePitch(selectedPitch.id, payload);
      showToast(`Status updated to "${newStatus}" by Super Admin`, 'success');
      setOverrideModalOpen(false);
      fetchPitches();
    } catch (err) {
      console.error(err);
      showToast('Failed to force status on pitch', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Action: Edit Pitch
  const handleEditPitch = async (e) => {
    e.preventDefault();
    if (!selectedPitch) return;
    setSubmitting(true);
    try {
      await pitchesAPI.updatePitch(selectedPitch.id, editForm);
      showToast('Solution pitch parameters updated', 'success');
      setEditModalOpen(false);
      fetchPitches();
    } catch (err) {
      console.error(err);
      showToast('Failed to edit pitch', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Action: Delete Pitch
  const handleDeletePitch = (pitch) => {
    setPitchToDelete(pitch);
  };

  const handleConfirmDeletePitch = async () => {
    if (!pitchToDelete) return;
    setDeleteLoading(true);
    try {
      await pitchesAPI.deletePitch(pitchToDelete.id);
      showToast(`Pitch "${pitchToDelete.title}" permanently deleted from database.`, 'success');
      setPitchToDelete(null);
      fetchPitches();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to delete pitch from database.';
      showToast(msg, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'selected':
      case 'awarded':
      case 'merged':
        return { label: st.toUpperCase(), color: '#10B981', bg: '#ECFDF5' };
      case 'changes_requested':
        return { label: 'CHANGES REQUESTED', color: '#DC2626', bg: '#FEF2F2' };
      case 'resubmitted':
        return { label: 'RESUBMITTED', color: '#7C3AED', bg: '#F5F3FF' };
      case 'under_review':
        return { label: 'UNDER REVIEW', color: '#2563EB', bg: '#EFF6FF' };
      case 'rejected':
        return { label: 'REJECTED', color: '#EF4444', bg: '#FEF2F2' };
      default:
        return { label: 'SUBMITTED', color: '#64748B', bg: '#F1F5F9' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #172554 100%)',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          border: '1px solid #1E3A8A',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 800,
                background: '#3B82F6',
                color: '#FFF',
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              IP & SOLUTION VAULT
            </span>
            <span style={{ fontSize: '0.75rem', color: '#60A5FA', fontWeight: 600 }}>
              Unrestricted IP Inspection & Immediate Award Authority
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0 }}>
            Master Student Solutions & IP Inspection
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#94A3B8', marginTop: '4px' }}>
            Inspect decrypted confidential proposals, override review committees, assign direct grants, or moderate content.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={fetchPitches}
            className="btn btn-outline"
            style={{ color: '#FFFFFF', borderColor: '#334155' }}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>TOTAL PROPOSALS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
            {pitches.length}
          </div>
        </div>
        <div className="card" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700 }}>UNDER REVIEW</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563EB', marginTop: '2px' }}>
            {pitches.filter((p) => ['under_review', 'submitted', 'resubmitted'].includes(p.status)).length}
          </div>
        </div>
        <div className="card" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 700 }}>CHANGES REQUESTED</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#DC2626', marginTop: '2px' }}>
            {pitches.filter((p) => p.status === 'changes_requested').length}
          </div>
        </div>
        <div className="card" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>SELECTED / FUNDED</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
            {pitches.filter((p) => ['selected', 'merged', 'awarded', 'project'].includes(p.status)).length}
          </div>
        </div>
      </div>

      {/* Controls */}
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
            placeholder="Search solutions by title, student, problem statement..."
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
            <option value="ALL">All Statuses ({pitches.length})</option>
            {PITCH_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label} ({pitches.filter((p) => p.status === st.value).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Solutions Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Solution & Student</th>
                <th style={{ padding: '1rem 1rem' }}>Problem Addressed</th>
                <th style={{ padding: '1rem 1rem' }}>Tech & Repository</th>
                <th style={{ padding: '1rem 1rem' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Master Controls</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                    Loading student solutions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                    No solution pitches found matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((pitch) => {
                  const badge = getStatusBadge(pitch.status);
                  return (
                    <tr
                      key={pitch.id}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}
                      className="hover-row"
                    >
                      {/* Solution Title & Student */}
                      <td style={{ padding: '1rem 1.25rem', maxWidth: '300px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.925rem' }}>
                          {pitch.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', fontSize: '0.8rem', color: '#475569' }}>
                          <User size={13} color="#2563EB" />
                          <span>{pitch.student_name || 'Student Innovator'}</span>
                          <span style={{ color: '#94A3B8' }}>•</span>
                          <span style={{ color: '#64748B' }}>{pitch.university_name || 'Incubation Hub'}</span>
                        </div>
                      </td>

                      {/* Problem Statement */}
                      <td style={{ padding: '1rem 1rem', maxWidth: '240px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>
                          {pitch.issue_title || 'Civic Challenge'}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '2px' }}>
                          Challenge ID: #{pitch.issue ? String(pitch.issue).slice(0, 8) : 'N/A'}
                        </div>
                      </td>

                      {/* Tech & Links */}
                      <td style={{ padding: '1rem 1rem' }}>
                        <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                          {pitch.tech_stack || 'Web & IoT'}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          {pitch.repo_url && (
                            <a
                              href={pitch.repo_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#0F172A', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem' }}
                            >
                              <GitBranch size={12} /> Code
                            </a>
                          )}
                          {pitch.demo_url && (
                            <a
                              href={pitch.demo_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#2563EB', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem' }}
                            >
                              <ExternalLink size={12} /> Demo
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Status */}
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

                      {/* Controls */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {/* Inspect IP */}
                          <button
                            onClick={() => {
                              setSelectedPitch(pitch);
                              setInspectModalOpen(true);
                            }}
                            title="Inspect IP & Proposal"
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
                            <Unlock size={13} /> Inspect IP
                          </button>

                          {/* Force Status / Award */}
                          <button
                            onClick={() => {
                              setSelectedPitch(pitch);
                              setNewStatus(pitch.status);
                              setOverrideModalOpen(true);
                            }}
                            title="Force Status / Award"
                            style={{
                              background: '#ECFDF5',
                              color: '#059669',
                              border: '1px solid #A7F3D0',
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
                            <Award size={13} /> Award
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => {
                              setSelectedPitch(pitch);
                              setEditForm({
                                title: pitch.title || '',
                                summary: pitch.summary || '',
                                tech_stack: pitch.tech_stack || '',
                                demo_url: pitch.demo_url || '',
                                repo_url: pitch.repo_url || '',
                              });
                              setEditModalOpen(true);
                            }}
                            title="Edit Pitch"
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
                            onClick={() => handleDeletePitch(pitch)}
                            title="Delete Solution"
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

      {/* MODAL 1: Inspect Decrypted IP */}
      {inspectModalOpen && selectedPitch && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#10B981" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Superadmin IP Vault & Pitch Inspection
                </h3>
              </div>
              <button onClick={() => setInspectModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#64748B" />
              </button>
            </div>

            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.8rem', color: '#065F46', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Unlock size={16} />
              You are viewing the unmasked, decrypted submission data including proprietary architectural diagrams and code links.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>TITLE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>{selectedPitch.title}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>EXECUTIVE SUMMARY</div>
                <div style={{ fontSize: '0.85rem', color: '#334155', background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', marginTop: '4px', lineHeight: '1.5' }}>
                  {selectedPitch.summary}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>CONFIDENTIAL IP PACKAGE (ADMIN ACCESS)</div>
                <div style={{ fontSize: '0.85rem', color: '#0F172A', background: '#F1F5F9', padding: '0.85rem', borderRadius: '8px', marginTop: '4px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  {selectedPitch.confidential_package || selectedPitch.full_proposal || 'No additional confidential attachment provided.'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>REPOSITORY</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                    {selectedPitch.repo_url ? (
                      <a href={selectedPitch.repo_url} target="_blank" rel="noreferrer" style={{ color: '#2563EB', wordBreak: 'break-all' }}>
                        {selectedPitch.repo_url}
                      </a>
                    ) : (
                      'None'
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>LIVE DEMO</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                    {selectedPitch.demo_url ? (
                      <a href={selectedPitch.demo_url} target="_blank" rel="noreferrer" style={{ color: '#2563EB', wordBreak: 'break-all' }}>
                        {selectedPitch.demo_url}
                      </a>
                    ) : (
                      'None'
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setInspectModalOpen(false)} className="btn btn-outline">
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Force Status / Award */}
      {overrideModalOpen && selectedPitch && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#059669" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Force Status / Award Solution
                </h3>
              </div>
              <button onClick={() => setOverrideModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleForceStatus} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Target State
                </label>
                <select
                  className="input-field"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  {PITCH_STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label} ({st.value})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Grant / Funding Allocation (₹ Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <IndianRupee size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 50,000"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    style={{ paddingLeft: '2rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setOverrideModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ background: '#059669' }}>
                  {submitting ? 'Applying...' : 'Enact Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Pitch Details */}
      {editModalOpen && selectedPitch && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={20} color="#0F172A" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Modify Solution Parameters
                </h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleEditPitch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Title
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
                  Summary
                </label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={editForm.summary}
                  onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Tech Stack
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={editForm.tech_stack}
                  onChange={(e) => setEditForm({ ...editForm, tech_stack: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Repository URL
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    value={editForm.repo_url}
                    onChange={(e) => setEditForm({ ...editForm, repo_url: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Demo URL
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    value={editForm.demo_url}
                    onChange={(e) => setEditForm({ ...editForm, demo_url: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ background: '#0F172A' }}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Database Deletion Confirmation Alert Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(pitchToDelete)}
        onClose={() => !deleteLoading && setPitchToDelete(null)}
        onConfirm={handleConfirmDeletePitch}
        title="Delete Solution Pitch from Database"
        itemType="Solution Pitch"
        itemName={pitchToDelete?.title}
        itemDetails={[
          `ID: #${pitchToDelete?.public_id || pitchToDelete?.id}`,
          pitchToDelete?.university_name ? `University: ${pitchToDelete.university_name}` : null,
          `Status: ${pitchToDelete?.status?.toUpperCase() || 'SUBMITTED'}`,
          pitchToDelete?.lead_innovator ? `Lead: ${pitchToDelete.lead_innovator}` : null,
        ].filter(Boolean)}
        warningMessage={`Permanently deleting this pitch will wipe it directly from the central database. All student solution submissions, community feedback ratings, and review sessions linked to this pitch will be removed.`}
        loading={deleteLoading}
      />
    </div>
  );
};
