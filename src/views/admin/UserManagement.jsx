import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Shield,
  Mail,
  Phone,
  School,
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  LogIn,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { authAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { DeleteConfirmModal } from '../../components/common/DeleteConfirmModal';

export const UserManagement = () => {
  const { showToast } = useToast();
  const { impersonateUser, user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Deletion modal state
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    university: '',
    organization: '',
    is_staff: false,
    is_superuser: false,
    is_active: true,
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, unisRes, orgsRes] = await Promise.allSettled([
        authAPI.getUsers(),
        authAPI.getUniversities(),
        authAPI.getOrganizations(),
      ]);
      if (usersRes.status === 'fulfilled') {
        const list = Array.isArray(usersRes.value) ? usersRes.value : usersRes.value.results || [];
        setUsersList(list);
      }
      if (unisRes.status === 'fulfilled') setUniversities(unisRes.value);
      if (orgsRes.status === 'fulfilled') setOrganizations(orgsRes.value);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreateModal = () => {
    setFormData({
      name: '',
      email: '',
      password: 'Password@123',
      role: 'student',
      phone: '',
      university: '',
      organization: '',
      is_staff: false,
      is_superuser: false,
      is_active: true,
    });
    setShowCreateModal(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'citizen',
      phone: u.phone || '',
      university: u.university_details?.id || u.university_id || u.university || '',
      organization: u.organization_details?.id || u.organization_id || u.organization || '',
      is_staff: Boolean(u.is_staff),
      is_superuser: Boolean(u.is_superuser),
      is_active: u.is_active !== false,
    });
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password || 'Password@123',
        role: formData.role,
        phone: formData.phone,
        is_staff: formData.is_staff,
        is_superuser: formData.is_superuser,
      };
      if (formData.university) payload.university = parseInt(formData.university, 10);
      if (formData.organization) payload.organization = parseInt(formData.organization, 10);

      await authAPI.createUser(payload);
      showToast(`User ${formData.name} created successfully!`, 'success');
      setShowCreateModal(false);
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.email?.[0] || err.response?.data?.detail || 'Failed to create user.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        is_staff: formData.is_staff,
        is_superuser: formData.is_superuser,
        is_active: formData.is_active,
      };
      if (formData.password) payload.password = formData.password;
      payload.university = formData.university ? parseInt(formData.university, 10) : null;
      payload.organization = formData.organization ? parseInt(formData.organization, 10) : null;

      await authAPI.updateUser(editingUser.id, payload);
      showToast(`User ${formData.name} credentials updated successfully!`, 'success');
      setShowEditModal(false);
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.email?.[0] || 'Failed to update user credentials.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (u) => {
    if (u.id === currentUser?.id) {
      showToast('Cannot delete your own superadmin account.', 'error');
      return;
    }
    setUserToDelete(u);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      await authAPI.deleteUser(userToDelete.id);
      showToast(`User ${userToDelete.name} (${userToDelete.email}) permanently deleted from database.`, 'success');
      setUserToDelete(null);
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete user from database.';
      showToast(msg, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleImpersonate = (u) => {
    impersonateUser(u);
    // Route to the appropriate dashboard
    const roleRoutes = {
      citizen: '/citizen/dashboard',
      student: '/student/dashboard',
      university_coordinator: '/university/dashboard',
      faculty_mentor: '/university/dashboard',
      gov_admin: '/officer/dashboard',
      industry_partner: '/industry/dashboard',
      admin: '/admin/dashboard',
    };
    navigate(roleRoutes[u.role] || '/citizen/dashboard');
  };

  const tabs = [
    { id: 'all', label: `All Users (${usersList.length})` },
    { id: 'citizen', label: `Citizens (${usersList.filter((u) => u.role === 'citizen').length})` },
    { id: 'student', label: `Students (${usersList.filter((u) => u.role === 'student').length})` },
    { id: 'university', label: `University Staff (${usersList.filter((u) => u.role.includes('coordinator') || u.role.includes('mentor')).length})` },
    { id: 'government', label: `Government (${usersList.filter((u) => u.role === 'gov_admin').length})` },
    { id: 'industry', label: `Industry (${usersList.filter((u) => u.role === 'industry_partner').length})` },
  ];

  const filtered = usersList.filter((u) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'citizen' && u.role === 'citizen') ||
      (activeTab === 'student' && u.role === 'student') ||
      (activeTab === 'university' && (u.role.includes('coordinator') || u.role.includes('mentor'))) ||
      (activeTab === 'government' && u.role === 'gov_admin') ||
      (activeTab === 'industry' && u.role === 'industry_partner');

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.university_details?.name?.toLowerCase().includes(q) ||
      u.organization_details?.name?.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={26} color="#2563EB" /> Master User Directory & Authority
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Omnipotent user control: edit roles, modify institutional links, toggle permissions, or impersonate any account.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Create New Account
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: '#FFFFFF', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.775rem',
                fontWeight: 700,
                background: activeTab === t.id ? '#0F172A' : '#F1F5F9',
                color: activeTab === t.id ? '#FFFFFF' : '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="search-bar-input" style={{ width: '280px' }}>
          <Search size={15} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search users, emails, institutes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}># USER</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>ROLE</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>AFFILIATION</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>AUTHORITY</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>OMNIPOTENT ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    Loading live platform user database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const roleColors = {
                    student: { bg: '#EFF6FF', text: '#2563EB' },
                    citizen: { bg: '#FEF3C7', text: '#D97706' },
                    university_coordinator: { bg: '#DCFCE7', text: '#16A34A' },
                    faculty_mentor: { bg: '#F3E8FF', text: '#9333EA' },
                    gov_admin: { bg: '#E0F2FE', text: '#0284C7' },
                    industry_partner: { bg: '#FFEDD5', text: '#EA580C' },
                    admin: { bg: '#FEE2E2', text: '#DC2626' },
                  };
                  const color = roleColors[u.role] || { bg: '#F1F5F9', text: '#475569' };

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: '#0F172A',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                            }}
                          >
                            {u.name ? u.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {u.name}
                              {u.is_superuser && (
                                <span style={{ fontSize: '0.65rem', background: '#EF4444', color: '#FFF', padding: '1px 5px', borderRadius: '4px' }}>
                                  ROOT
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              {u.email} {u.phone ? `• ${u.phone}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 700,
                            background: color.bg,
                            color: color.text,
                            padding: '3px 8px',
                            borderRadius: '999px',
                            textTransform: 'capitalize',
                          }}
                        >
                          {u.role?.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td style={{ padding: '0.9rem 1.25rem', color: '#475569', fontSize: '0.8rem' }}>
                        {u.university_details?.name || u.organization_details?.name || u.university || u.organization || (
                          <span style={{ color: '#94A3B8' }}>General Citizen</span>
                        )}
                      </td>

                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                          <span style={{ color: u.is_active !== false ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                            ● {u.is_active !== false ? 'Active' : 'Banned'}
                          </span>
                          {u.is_staff && <span style={{ color: '#6366F1', fontWeight: 600 }}>[Staff]</span>}
                        </div>
                      </td>

                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleImpersonate(u)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '8px', color: '#2563EB', borderColor: '#BFDBFE' }}
                            title="Login as this user instantly"
                          >
                            <LogIn size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Impersonate
                          </button>

                          <button
                            onClick={() => openEditModal(u)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '8px' }}
                            title="Edit user role, permissions, password"
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(u)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '8px', color: '#EF4444', borderColor: '#FECACA' }}
                            title="Permanently Delete User from Database"
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                Create Platform User
              </h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+91..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Role / Platform Authority *</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="student">Student Innovator</option>
                  <option value="citizen">Citizen / Community</option>
                  <option value="university_coordinator">University Coordinator (Campus Lead)</option>
                  <option value="faculty_mentor">Faculty Mentor</option>
                  <option value="gov_admin">Government Officer</option>
                  <option value="industry_partner">Industry Partner / CSR Representative</option>
                </select>
              </div>

              {formData.role === 'university_coordinator' && (
                <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#1E40AF' }}>
                  <School size={18} color="#2563EB" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>University Coordinator:</strong> Must be linked to an accredited University below to manage challenge adoptions and student teams.
                  </div>
                </div>
              )}

              {formData.role === 'industry_partner' && (
                <div style={{ backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#6B21A8' }}>
                  <Building2 size={18} color="#9333EA" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Industry Partner:</strong> Must be linked to an Industry/CSR Organization below to sponsor challenges and evaluate student pitches.
                  </div>
                </div>
              )}

              {['student', 'university_coordinator', 'faculty_mentor'].includes(formData.role) && (
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <School size={14} color="#2563EB" />
                    <span>Affiliated University {formData.role === 'university_coordinator' ? '(Required)' : ''} *</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    required={formData.role === 'university_coordinator'}
                  >
                    <option value="">-- Select University Institution --</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.district})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.role === 'industry_partner' && (
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={14} color="#9333EA" />
                    <span>Partner Organization / Industry (Required) *</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    required
                  >
                    <option value="">-- Select Industry / CSR Organization --</option>
                    {organizations.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1.5rem', padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_staff}
                    onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                  />
                  <span>Is Staff (Django Admin)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_superuser}
                    onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                  />
                  <span>Superuser (Root Permissions)</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creating...' : 'Create Account & Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Edit Credentials: {editingUser.name}
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '3px' }}>
                  Update login email, reset password, change role or reassign institution
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Login Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Reset Password</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter new password (leave blank to keep)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Role Assignment</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="student">Student Innovator</option>
                  <option value="citizen">Citizen / Community</option>
                  <option value="university_coordinator">University Coordinator (Campus Lead)</option>
                  <option value="faculty_mentor">Faculty Mentor</option>
                  <option value="gov_admin">Government Officer</option>
                  <option value="industry_partner">Industry Partner / CSR Representative</option>
                </select>
              </div>

              {formData.role === 'university_coordinator' && (
                <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#1E40AF' }}>
                  <School size={18} color="#2563EB" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>University Coordinator:</strong> Must have an assigned university to review student innovations and manage challenges.
                  </div>
                </div>
              )}

              {formData.role === 'industry_partner' && (
                <div style={{ backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#6B21A8' }}>
                  <Building2 size={18} color="#9333EA" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Industry Partner:</strong> Must have an assigned corporate/CSR organization to co-fund challenges and review pitches.
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <School size={14} color="#2563EB" />
                  <span>University Affiliation</span>
                </label>
                <select
                  className="form-select"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                >
                  <option value="">-- None / General --</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.district})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} color="#9333EA" />
                  <span>Industry Organization Affiliation</span>
                </label>
                <select
                  className="form-select"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                >
                  <option value="">-- None / General --</option>
                  {organizations.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span>Active Account</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_staff}
                    onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                  />
                  <span>Is Staff</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_superuser}
                    onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                  />
                  <span>Superuser</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving Changes...' : 'Save Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Database Deletion Confirmation Alert Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(userToDelete)}
        onClose={() => !deleteLoading && setUserToDelete(null)}
        onConfirm={handleConfirmDeleteUser}
        title="Delete User from Database"
        itemType="User Account"
        itemName={userToDelete?.name}
        itemDetails={[
          userToDelete?.email,
          `Role: ${userToDelete?.role?.replace(/_/g, ' ')}`,
          userToDelete?.university_details?.name || userToDelete?.organization_details?.name || 'No institution link',
        ].filter(Boolean)}
        warningMessage={`Deleting ${userToDelete?.name} (${userToDelete?.email}) will revoke their credentials and immediately wipe their record from the SQLite database.`}
        loading={deleteLoading}
      />
    </div>
  );
};
