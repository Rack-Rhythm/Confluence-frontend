import React, { useState, useEffect } from 'react';
import {
  Building2,
  School,
  Plus,
  Globe,
  MapPin,
  CheckCircle2,
  Trash2,
  Edit3,
  Mail,
  X,
  Search,
  RefreshCw,
  Building,
  ShieldCheck
} from 'lucide-react';
import { authAPI } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import { DeleteConfirmModal } from '../../components/common/DeleteConfirmModal';

export const OrganizationsManagement = () => {
  const { showToast } = useToast();
  const [universities, setUniversities] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('universities'); // 'universities' | 'industry'
  const [search, setSearch] = useState('');

  // Deletion modal state
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'University' | 'Organization', data: obj }
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modals
  const [uniModalOpen, setUniModalOpen] = useState(false);
  const [editingUni, setEditingUni] = useState(null);
  const [uniForm, setUniForm] = useState({
    name: '',
    code: '',
    district: '',
    state: 'Kerala',
    contact_email: '',
  });

  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [orgForm, setOrgForm] = useState({
    name: '',
    org_type: 'csr',
    website: '',
    contact_email: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uniRes, orgRes] = await Promise.allSettled([
        authAPI.getUniversities(),
        authAPI.getOrganizations(),
      ]);
      if (uniRes.status === 'fulfilled') {
        const list = Array.isArray(uniRes.value) ? uniRes.value : uniRes.value.results || [];
        setUniversities(list);
      }
      if (orgRes.status === 'fulfilled') {
        const list = Array.isArray(orgRes.value) ? orgRes.value : orgRes.value.results || [];
        setOrganizations(list);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load institutions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // University CRUD
  const handleOpenAddUni = () => {
    setEditingUni(null);
    setUniForm({ name: '', code: '', district: '', state: 'Kerala', contact_email: '' });
    setUniModalOpen(true);
  };

  const handleOpenEditUni = (uni) => {
    setEditingUni(uni);
    setUniForm({
      name: uni.name || '',
      code: uni.code || '',
      district: uni.district || '',
      state: uni.state || 'Kerala',
      contact_email: uni.contact_email || '',
    });
    setUniModalOpen(true);
  };

  const handleSaveUni = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUni) {
        await authAPI.updateUniversity(editingUni.id, uniForm);
        showToast('University updated successfully', 'success');
      } else {
        await authAPI.createUniversity(uniForm);
        showToast('University campus created', 'success');
      }
      setUniModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to save university', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUni = (uni) => {
    setItemToDelete({ type: 'University', data: uni });
  };

  // Organization CRUD
  const handleOpenAddOrg = () => {
    setEditingOrg(null);
    setOrgForm({ name: '', org_type: 'csr', website: '', contact_email: '' });
    setOrgModalOpen(true);
  };

  const handleOpenEditOrg = (org) => {
    setEditingOrg(org);
    setOrgForm({
      name: org.name || '',
      org_type: org.org_type || 'csr',
      website: org.website || '',
      contact_email: org.contact_email || '',
    });
    setOrgModalOpen(true);
  };

  const handleSaveOrg = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingOrg) {
        await authAPI.updateOrganization(editingOrg.id, orgForm);
        showToast('Partner organization updated', 'success');
      } else {
        await authAPI.createOrganization(orgForm);
        showToast('New industry partner registered', 'success');
      }
      setOrgModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to save partner organization', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrg = (org) => {
    setItemToDelete({ type: 'Organization', data: org });
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      if (itemToDelete.type === 'University') {
        await authAPI.deleteUniversity(itemToDelete.data.id);
        showToast(`University "${itemToDelete.data.name}" permanently deleted from database.`, 'success');
      } else {
        await authAPI.deleteOrganization(itemToDelete.data.id);
        showToast(`Partner organization "${itemToDelete.data.name}" permanently deleted from database.`, 'success');
      }
      setItemToDelete(null);
      loadData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || `Failed to delete ${itemToDelete.type.toLowerCase()} from database.`;
      showToast(msg, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUnis = universities.filter((u) =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.code || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.district || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrgs = organizations.filter((o) =>
    (o.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.org_type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
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
                background: '#8B5CF6',
                color: '#FFF',
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              INSTITUTIONAL ACCREDITATION
            </span>
            <span style={{ fontSize: '0.75rem', color: '#C4B5FD', fontWeight: 600 }}>
              Full CRUD over Campuses & Industry CSR Donors
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0 }}>
            Universities & Industry Organizations
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#94A3B8', marginTop: '4px' }}>
            Accredit higher-education campuses, configure institutional incubation cells, and manage corporate CSR partners.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {activeTab === 'universities' ? (
            <button
              onClick={handleOpenAddUni}
              className="btn btn-primary"
              style={{ background: '#2563EB', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add Campus
            </button>
          ) : (
            <button
              onClick={handleOpenAddOrg}
              className="btn btn-primary"
              style={{ background: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add Partner
            </button>
          )}
          <button
            onClick={loadData}
            className="btn btn-outline"
            style={{ color: '#FFFFFF', borderColor: '#475569' }}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveTab('universities')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'universities' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'universities' ? '#0F172A' : '#64748B',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'universities' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <School size={16} color={activeTab === 'universities' ? '#2563EB' : '#64748B'} />
            Universities ({universities.length})
          </button>
          <button
            onClick={() => setActiveTab('industry')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'industry' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'industry' ? '#0F172A' : '#64748B',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'industry' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <Building2 size={16} color={activeTab === 'industry' ? '#10B981' : '#64748B'} />
            Industry Partners ({organizations.length})
          </button>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by name, district, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.2rem' }}
          />
        </div>
      </div>

      {/* Content: Universities Grid */}
      {activeTab === 'universities' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredUnis.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: '#64748B' }}>
              No universities found.
            </div>
          ) : (
            filteredUnis.map((uni) => (
              <div
                key={uni.id}
                className="card"
                style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                        <School size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          {uni.name}
                        </h3>
                        <span style={{ fontSize: '0.725rem', background: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          {uni.code || 'UNIV'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#64748B' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={13} color="#EF4444" />
                      <span>{uni.district || 'District Not Specified'}, {uni.state || 'Kerala'}</span>
                    </div>
                    {uni.contact_email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Mail size={13} color="#2563EB" />
                        <span>{uni.contact_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '0.725rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={14} /> Accredited Campus
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEditUni(uni)}
                      style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                      title="Edit University"
                    >
                      <Edit3 size={13} color="#334155" />
                    </button>
                    <button
                      onClick={() => handleDeleteUni(uni)}
                      style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                      title="Delete University"
                    >
                      <Trash2 size={13} color="#EF4444" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Content: Organizations Grid */}
      {activeTab === 'industry' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredOrgs.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: '#64748B' }}>
              No industry partners found.
            </div>
          ) : (
            filteredOrgs.map((org) => (
              <div
                key={org.id}
                className="card"
                style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          {org.name}
                        </h3>
                        <span style={{ fontSize: '0.725rem', background: '#DCFCE7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                          {org.org_type || 'CSR'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#64748B' }}>
                    {org.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Globe size={13} color="#10B981" />
                        <a href={org.website.startsWith('http') ? org.website : `https://${org.website}`} target="_blank" rel="noreferrer" style={{ color: '#2563EB' }}>
                          {org.website}
                        </a>
                      </div>
                    )}
                    {org.contact_email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Mail size={13} color="#64748B" />
                        <span>{org.contact_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '0.725rem', color: '#2563EB', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Active CSR MOU
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEditOrg(org)}
                      style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                      title="Edit Organization"
                    >
                      <Edit3 size={13} color="#334155" />
                    </button>
                    <button
                      onClick={() => handleDeleteOrg(org)}
                      style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                      title="Delete Organization"
                    >
                      <Trash2 size={13} color="#EF4444" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: University Create / Edit */}
      {uniModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <School size={20} color="#2563EB" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  {editingUni ? 'Edit University Campus' : 'Accredit New University'}
                </h3>
              </div>
              <button onClick={() => setUniModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleSaveUni} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Institution / University Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Kerala Technological University"
                  value={uniForm.name}
                  onChange={(e) => setUniForm({ ...uniForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Code / Acronym
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. KTU"
                    value={uniForm.code}
                    onChange={(e) => setUniForm({ ...uniForm, code: e.target.value })}
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
                    placeholder="e.g. Thiruvananthapuram"
                    value={uniForm.district}
                    onChange={(e) => setUniForm({ ...uniForm, district: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Official Contact Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="incubation@university.edu"
                  value={uniForm.contact_email}
                  onChange={(e) => setUniForm({ ...uniForm, contact_email: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setUniModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ background: '#2563EB' }}>
                  {submitting ? 'Saving...' : editingUni ? 'Update Campus' : 'Accredit Campus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Organization Create / Edit */}
      {orgModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#10B981" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  {editingOrg ? 'Edit Partner Organization' : 'Onboard Partner Organization'}
                </h3>
              </div>
              <button onClick={() => setOrgModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleSaveOrg} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Organization Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Tata Trusts / Infosys Foundation"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Partner Type
                </label>
                <select
                  className="input-field"
                  value={orgForm.org_type}
                  onChange={(e) => setOrgForm({ ...orgForm, org_type: e.target.value })}
                >
                  <option value="csr">CSR Foundation</option>
                  <option value="incubator">Incubation Center</option>
                  <option value="private_tech">Private Tech Enterprise</option>
                  <option value="ngo">NGO / Civil Society</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Website URL
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://tatatrusts.org"
                  value={orgForm.website}
                  onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Contact Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="partnerships@organization.org"
                  value={orgForm.contact_email}
                  onChange={(e) => setOrgForm({ ...orgForm, contact_email: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setOrgModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ background: '#10B981' }}>
                  {submitting ? 'Saving...' : editingOrg ? 'Update Partner' : 'Register Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Database Deletion Confirmation Alert Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => !deleteLoading && setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${itemToDelete?.type} from Database`}
        itemType={itemToDelete?.type === 'University' ? 'University Institution' : 'Industry Partner Organization'}
        itemName={itemToDelete?.data?.name}
        itemDetails={[
          itemToDelete?.type === 'University' ? itemToDelete?.data?.district : (itemToDelete?.data?.org_type?.toUpperCase() || 'CSR PARTNER'),
          itemToDelete?.data?.code ? `Code: ${itemToDelete.data.code}` : itemToDelete?.data?.website,
        ].filter(Boolean)}
        warningMessage={
          itemToDelete?.type === 'University'
            ? `Permanently deleting "${itemToDelete?.data?.name}" will remove this university from the database and unlink any associated student and coordinator accounts.`
            : `Permanently deleting "${itemToDelete?.data?.name}" will remove this industry partner from the database and invalidate any associated corporate CSR sponsorships.`
        }
        loading={deleteLoading}
      />
    </div>
  );
};
