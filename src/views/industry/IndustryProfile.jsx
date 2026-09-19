import React, { useState } from 'react';
import { Building2, Globe, Mail, Phone, MapPin, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const IndustryProfile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const org = user?.organization_details || {};
  const [formData, setFormData] = useState({
    name: user?.name || '',
    role: 'CSR & Innovation Director',
    organization: org.name || 'Corporate Innovation Partner',
    org_type: org.org_type?.toUpperCase() || 'CSR FOUNDATION',
    email: user?.email || '',
    phone: user?.phone || '',
    website: org.website || '',
    district: org.district || user?.district || '',
    address: org.address || 'Jharkhand Regional Office',
    csr_reg: org.csr_registration_number || 'CSR Registration Verified',
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (updateProfile) {
        await updateProfile({
          name: formData.name,
          phone: formData.phone,
          district: formData.district,
        });
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update industry profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
            Corporate & CSR Profile
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Official organization accreditation, CSR registration, and industry representative details.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`btn ${isEditing ? 'btn-outline' : 'btn-primary'}`}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline"
            style={{ borderRadius: '10px', padding: '0.5rem' }}
            title="Close Profile"
          >
            <X size={20} color="#64748B" />
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Organization Information Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '14px',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={32} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                  {formData.organization}
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                  ● Accredited CSR Partner
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
                {formData.org_type} • Registration: {formData.csr_reg}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid-responsive-2" style={{ gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Official Organization Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Website / CSR Portal
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Representative Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Designation / Role
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Official Email
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.875rem', color: '#64748B' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Phone / Contact
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Registered Office Address (Jharkhand)
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>

      {/* CSR Focus Areas */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
          Mandated Thematic Areas {org.name ? `(${org.name})` : 'in Jharkhand'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
          Priority focus areas supported by incubation cells and institutional grants:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {(Array.isArray(org.focus_areas) && org.focus_areas.length > 0 ? org.focus_areas : [
            'Clean Drinking Water & IoT Testing',
            'Mining Slag & Industrial Recycling',
            'Tribal Agriculture & Solar Cold Stores',
            'Smart Rural Microgrids',
            'Assistive Tech for Divyangjan',
            'Forest Produce & Lac Value Addition',
          ]).map((theme, idx) => (
            <div
              key={idx}
              style={{
                padding: '0.75rem 1rem',
                background: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} color="#10B981" /> {theme}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
