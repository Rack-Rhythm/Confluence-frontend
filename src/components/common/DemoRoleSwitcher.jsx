import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { Sparkles, Shield, ChevronDown, ChevronUp, LogIn, ExternalLink } from 'lucide-react';

export const DemoRoleSwitcher = ({ onNavigatePublic }) => {
  const { user, role, demoLogin, logout, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside aria-label="Demo role selector" className="demo-role-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10B981', fontWeight: 700 }}>
          <Sparkles size={14} /> LIVE DEMO ROLE SWITCHER
        </span>
        <span style={{ color: '#64748B', fontSize: '0.7rem' }}>
          (100% Dynamic Django Backend Data)
        </span>
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {Object.entries(DEMO_ACCOUNTS).map(([key, item]) => {
            const isActive = isAuthenticated && role === item.role;
            return (
              <button
                key={key}
                onClick={() => demoLogin(key)}
                className={`demo-role-btn ${isActive ? 'active' : ''}`}
                title={`Switch to ${item.label}`}
              >
                {isActive && '✓ '}
                {item.label.split(' ')[0]}
              </button>
            );
          })}

          <button
            onClick={() => {
              if (isAuthenticated) logout();
              if (onNavigatePublic) onNavigatePublic();
            }}
            className="demo-role-btn"
            style={{ background: '#334155' }}
            title="View Public Landing Page"
          >
            <ExternalLink size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
            Public View
          </button>
        </div>
      )}

      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', padding: '2px' }}
        title={collapsed ? 'Expand Switcher' : 'Collapse Switcher'}
      >
        {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
    </aside>
  );
};
