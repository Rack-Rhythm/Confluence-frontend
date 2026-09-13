import React from 'react';

export const StatCard = ({
  icon: Icon,
  title,
  value,
  subtext,
  color = '#2563EB',
  bgColor = '#EFF6FF',
  borderColor = '#BFDBFE',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
      }}
      className="card-stat-hover"
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: bgColor,
          border: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          flexShrink: 0,
        }}
      >
        <Icon size={26} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>
          {title}
        </div>
        {subtext && (
          <div style={{ fontSize: '0.725rem', color: '#10B981', fontWeight: 600, marginTop: '3px' }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};
