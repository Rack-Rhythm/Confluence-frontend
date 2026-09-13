import React from 'react';
import { LogOut, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LogoutModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  if (!isOpen) return null;

  const handleConfirm = () => {
    logout();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '420px', textAlign: 'center', padding: '2rem 1.5rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#F5F3FF',
            color: '#6D28D9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            border: '1px solid #DDD6FE',
          }}
        >
          <LogOut size={26} />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
          Confirm Logout
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.75rem', lineHeight: 1.5 }}>
          Are you sure you want to logout from your account? You can log back in anytime.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ flex: 1, borderRadius: '8px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="btn btn-primary"
            style={{ flex: 1, borderRadius: '8px', background: '#5B21B6' }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
