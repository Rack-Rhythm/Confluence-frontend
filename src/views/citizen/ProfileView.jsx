import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit3, X, Check, School, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ProfileView = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.district || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        name,
        phone,
        district: location,
      });
      setIsEditing(false);
    } catch (err) {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
            My Profile
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Manage your personal and account information.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="btn btn-outline"
          style={{ borderRadius: '10px' }}
        >
          <Edit3 size={16} /> Edit Profile
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        {/* Avatar */}
        <div
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563EB, #6366F1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '2.25rem',
            fontWeight: 800,
            margin: '0 auto 1.25rem',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
          }}
        >
          {user?.name ? user.name[0].toUpperCase() : 'U'}
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
          {user?.name || 'Citizen'}
        </h2>
        <div style={{ display: 'inline-block', padding: '3px 12px', background: '#EFF6FF', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', textTransform: 'capitalize', marginBottom: '1.75rem' }}>
          {user?.role?.replace('_', ' ') || 'Citizen'}
        </div>

        {/* Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem',
            textAlign: 'left',
            borderTop: '1px solid #F1F5F9',
            paddingTop: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <User size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Full Name</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>{user?.name || 'Not provided'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <Mail size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Email Address</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <Phone size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Phone Number</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>{user?.phone || '+91 98765 43210'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <MapPin size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Location</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>{location}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                Edit Profile
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                style={{ color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email (Read Only)</label>
                <input
                  type="email"
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ background: '#F8FAFC', color: '#64748B' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location / District</label>
                <input
                  type="text"
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ background: '#5B21B6' }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
