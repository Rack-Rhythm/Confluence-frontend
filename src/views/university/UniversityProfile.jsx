import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  School,
  Edit,
  Save,
  CheckCircle2,
  Camera,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const UniversityProfile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    role: 'University Coordinator',
    institution: user?.university_details?.name || user?.university?.name || 'Innovation & Incubation Centre',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || 'Innovation & Incubation Cell',
    institute_code: user?.university_details?.code || '',
    address: user?.address || 'Institutional Campus',
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (updateProfile) {
        await updateProfile({
          name: formData.name,
          phone: formData.phone,
        });
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update university profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px' }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
            Profile
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Manage your personal and institutional coordinator credentials.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`btn ${isEditing ? 'btn-blue' : 'btn-outline'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '10px' }}
          >
            {isEditing ? <Save size={16} /> : <Edit size={16} />}
            {isEditing ? 'Save Changes' : 'Edit Profile'}
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

      {/* 2. Profile Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                fontSize: '2rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              }}
            >
              {formData.name.charAt(0)}
            </div>
            <button
              onClick={() => showToast('Photo upload ready.', 'info')}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <Camera size={14} />
            </button>
          </div>

          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>{formData.name}</h2>
            <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 700 }}>{formData.role}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>{formData.institution}</div>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="grid-responsive-2" style={{ gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginBottom: '0.35rem' }}>
                Email Address
              </label>
              <input
                type="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                style={{ background: isEditing ? '#FFFFFF' : '#F8FAFC' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginBottom: '0.35rem' }}>
                Phone Number
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                style={{ background: isEditing ? '#FFFFFF' : '#F8FAFC' }}
              />
            </div>
          </div>

          <div className="grid-responsive-2" style={{ gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginBottom: '0.35rem' }}>
                Academic Department
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input-field"
                style={{ background: isEditing ? '#FFFFFF' : '#F8FAFC' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginBottom: '0.35rem' }}>
                Institute AISHE / Code
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.institute_code}
                onChange={(e) => setFormData({ ...formData, institute_code: e.target.value })}
                className="input-field"
                style={{ background: isEditing ? '#FFFFFF' : '#F8FAFC' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginBottom: '0.35rem' }}>
              Campus Address
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field"
              style={{ background: isEditing ? '#FFFFFF' : '#F8FAFC' }}
            />
          </div>

          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-blue" style={{ borderRadius: '10px' }}>
                Save Profile Information
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
