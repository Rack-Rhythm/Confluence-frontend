import React, { useState } from 'react';
import { Leaf, Search, ArrowRight, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ onOpenAuth, onNavigate, currentTab }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'landing', label: 'Home' },
    { id: 'problems', label: 'Problems' },
    { id: 'solutions', label: 'Solutions' },
    { id: 'how_it_works', label: 'How It Works' },
    { id: 'success_stories', label: 'Success Stories' }
  ];

  const handleNavClick = (tab) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar-container" style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      padding: '0.85rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 999,
    }}>
      <div className="container flex-row items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => handleNavClick('landing')}
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

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              style={{
                color: currentTab === link.id ? '#2563EB' : 'inherit',
                fontWeight: currentTab === link.id ? 700 : 500,
                borderBottom: currentTab === link.id ? '2px solid #2563EB' : 'none',
                paddingBottom: '4px',
              }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => handleNavClick('problems')}
            style={{ color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Search"
          >
            <Search size={18} />
          </button>

          {isAuthenticated ? (
            <div className="flex-row items-center gap-3">
              <button onClick={() => handleNavClick('dashboard')} className="btn btn-blue btn-sm">
                <User size={15} />
                {user?.name?.split(' ')[0] || 'My Dashboard'}
                <ArrowRight size={14} />
              </button>
              <button onClick={logout} className="btn btn-outline btn-sm">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex-row items-center gap-3">
              <button onClick={() => onOpenAuth('login')} className="btn btn-outline btn-sm">
                Login
              </button>
              <button onClick={() => onOpenAuth('register')} className="btn btn-primary btn-sm">
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle & Search */}
        <div className="flex md:hidden items-center gap-4">
          <button onClick={() => handleNavClick('problems')} style={{ color: '#64748B' }}>
            <Search size={20} />
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ color: '#0F172A' }}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu md:hidden">
          {navLinks.map(link => (
            <button
              key={link.id}
              className="mobile-menu-link"
              onClick={() => handleNavClick(link.id)}
              style={{ color: currentTab === link.id ? '#2563EB' : 'inherit', fontWeight: currentTab === link.id ? 700 : 500 }}
            >
              {link.label}
              <ArrowRight size={16} style={{ opacity: 0.5 }} />
            </button>
          ))}
          
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {isAuthenticated ? (
              <>
                <button onClick={() => handleNavClick('dashboard')} className="btn btn-blue w-full">
                  My Dashboard
                </button>
                <button onClick={logout} className="btn btn-outline w-full">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }} className="btn btn-outline w-full">
                  Login
                </button>
                <button onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }} className="btn btn-primary w-full">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

