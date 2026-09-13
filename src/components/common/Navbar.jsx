import React from 'react';
import { Leaf, Search, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ onOpenAuth, onNavigate, currentTab }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0.85rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <div
          onClick={() => onNavigate('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Leaf size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0F172A' }}>
              Confluence
            </div>
          </div>
        </div>

        {/* Links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#475569',
          }}
        >
          <button
            onClick={() => onNavigate('landing')}
            style={{
              color: currentTab === 'landing' ? '#2563EB' : 'inherit',
              fontWeight: currentTab === 'landing' ? 700 : 500,
              borderBottom: currentTab === 'landing' ? '2px solid #2563EB' : 'none',
              paddingBottom: '4px',
            }}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('problems')}
            style={{
              color: currentTab === 'problems' ? '#2563EB' : 'inherit',
              fontWeight: currentTab === 'problems' ? 700 : 500,
            }}
          >
            Problems
          </button>
          <button
            onClick={() => onNavigate('solutions')}
            style={{
              color: currentTab === 'solutions' ? '#2563EB' : 'inherit',
              fontWeight: currentTab === 'solutions' ? 700 : 500,
            }}
          >
            Solutions
          </button>
          <button
            onClick={() => onNavigate('how_it_works')}
            style={{
              color: currentTab === 'how_it_works' ? '#2563EB' : 'inherit',
              fontWeight: currentTab === 'how_it_works' ? 700 : 500,
            }}
          >
            How It Works
          </button>
          <button
            onClick={() => onNavigate('success_stories')}
            style={{
              color: currentTab === 'success_stories' ? '#2563EB' : 'inherit',
              fontWeight: currentTab === 'success_stories' ? 700 : 500,
            }}
          >
            Success Stories
          </button>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => onNavigate('problems')}
            style={{
              padding: '0.5rem',
              color: '#64748B',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Search"
          >
            <Search size={18} />
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => onNavigate('dashboard')}
                className="btn btn-blue btn-sm"
              >
                <User size={15} />
                {user?.name?.split(' ')[0] || 'My Dashboard'}
                <ArrowRight size={14} />
              </button>
              <button
                onClick={logout}
                className="btn btn-outline btn-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => onOpenAuth('login')}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px' }}
              >
                Login
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="btn btn-primary btn-sm"
                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', background: '#0F172A' }}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
