import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TopHeader = ({ onNavigate, onSearch, searchQuery, unreadCount = 3 }) => {
  const { user, role, isImpersonating, stopImpersonating } = useAuth();

  const getSearchPlaceholder = () => {
    switch (role) {
      case 'citizen':
        return 'Search issues, locations, or keywords...';
      case 'student':
        return 'Search problems, projects, opportunities...';
      case 'university_coordinator':
      case 'faculty_mentor':
        return 'Search problems, students, pitches...';
      case 'gov_admin':
        return 'Search issues, projects, districts...';
      case 'industry_partner':
        return 'Search opportunities, projects, universities...';
      case 'admin':
        return 'Search users, issues, projects, organizations...';
      default:
        return 'Search problems, projects, updates...';
    }
  };

  const getRoleDisplayName = () => {
    if (user?.is_superuser || role === 'admin') return 'Super Admin';
    if (role === 'university_coordinator') return 'University Coordinator';
    if (role === 'faculty_mentor') return 'Faculty Mentor';
    if (role === 'gov_admin') return 'Government Officer';
    if (role === 'industry_partner') return 'Industry CSR Partner';
    if (role === 'student') return 'Student Innovator';
    return 'Citizen';
  };

  return (
    <header className="top-header">
      {/* Search Bar with Role-Specific Placeholder */}
      <div className="search-bar-input" style={{ width: '380px' }}>
        <Search size={16} color="#94A3B8" />
        <input
          type="text"
          placeholder={getSearchPlaceholder()}
          value={searchQuery || ''}
          onChange={(e) => onSearch && onSearch(e.target.value)}
        />
      </div>

      {/* Right User & Alert Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isImpersonating && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.35rem 0.85rem',
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#92400E',
            }}
          >
            <span>🎭 Acting as {user?.name || user?.email}</span>
            <button
              onClick={stopImpersonating}
              style={{
                background: '#D97706',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Exit to Master Admin
            </button>
          </div>
        )}

        {/* Notification Bell */}
        <button
          onClick={() => onNavigate('notifications')}
          style={{
            position: 'relative',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
          }}
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#EF4444',
                color: '#FFFFFF',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #FFFFFF',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Pill */}
        <div
          onClick={() => onNavigate('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.35rem 0.75rem 0.35rem 0.4rem',
            borderRadius: '999px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #6366F1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.675rem', color: '#64748B' }}>
              {getRoleDisplayName()}
            </div>
          </div>
          <ChevronDown size={14} color="#94A3B8" />
        </div>
      </div>
    </header>
  );
};
