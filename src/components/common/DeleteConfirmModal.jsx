import React from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, Database } from 'lucide-react';

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Database Deletion',
  itemType = 'Record',
  itemName = '',
  itemDetails = [],
  warningMessage,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={!loading ? onClose : undefined}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25), 0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #FEE2E2',
          overflow: 'hidden',
          animation: 'modalSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Top Danger Bar */}
        <div
          style={{
            height: '6px',
            background: 'linear-gradient(90deg, #EF4444, #DC2626, #B91C1C)',
          }}
        />

        <div style={{ padding: '1.75rem' }}>
          {/* Header with Icon and Close */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FECACA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#DC2626',
                  flexShrink: 0,
                }}
              >
                <ShieldAlert size={26} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {title}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      border: '1px solid #FCA5A5',
                      padding: '2px 7px',
                      borderRadius: '999px',
                    }}
                  >
                    Database Alert
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '3px 0 0 0' }}>
                  This operation directly deletes records from the database.
                </p>
              </div>
            </div>

            {!loading && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Item Preview Card */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Target {itemType}
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', wordBreak: 'break-word', marginBottom: itemDetails.length ? '8px' : 0 }}>
              {itemName || 'Untitled Record'}
            </div>

            {itemDetails.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {itemDetails.map((detail, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      color: '#334155',
                    }}
                  >
                    {detail}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Warning Banner */}
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '1.5rem',
            }}
          >
            <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: '#991B1B', lineHeight: 1.45 }}>
              <strong>Permanent Deletion:</strong> {warningMessage || `Are you sure you want to delete this ${itemType.toLowerCase()}? Once executed, this data will be wiped from the database and cannot be recovered.`}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-outline"
              style={{
                padding: '0.6rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: '10px',
                color: '#475569',
                borderColor: '#CBD5E1',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.6rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                borderRadius: '10px',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <Trash2 size={16} />
              {loading ? 'Deleting from Database...' : 'Delete from Database'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
