import React, { useState, useEffect } from 'react';
import { X, Sparkles, LogIn, UserPlus, Lock, Mail, User, Phone, School, Building2 } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';
import { useToast } from '../../context/ToastContext';

export const AuthModal = ({ isOpen, initialTab = 'login', onClose, onSuccess }) => {
  const [tab, setTab] = useState(initialTab);
  const { login, register, demoLogin } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('citizen');
  const [universityId, setUniversityId] = useState('');
  const [organizationId, setOrganizationId] = useState('');

  const [universities, setUniversities] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Load universities and organizations for registration dropdowns
      authAPI.getUniversities().then(setUniversities).catch(() => {});
      authAPI.getOrganizations().then(setOrganizations).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    const payload = {
      email,
      password,
      name,
      phone,
      role,
      university: ['student', 'faculty_mentor', 'university_coordinator'].includes(role) && universityId ? parseInt(universityId) : null,
      organization: role === 'industry_partner' && organizationId ? parseInt(organizationId) : null,
    };

    setLoading(true);
    try {
      await register(payload);
      setTab('login');
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demoKey) => {
    setLoading(true);
    try {
      await demoLogin(demoKey);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
              {tab === 'login' ? 'Sign In to Confluence' : 'Create an Account'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
              {tab === 'login' ? 'Access your dashboard, track issues, and collaborate' : 'Join India’s premier societal innovation platform'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ color: '#94A3B8', padding: '4px', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div
          style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => setTab('login')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: tab === 'login' ? '#FFFFFF' : 'transparent',
              color: tab === 'login' ? '#0F172A' : '#64748B',
              boxShadow: tab === 'login' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: tab === 'register' ? '#FFFFFF' : 'transparent',
              color: tab === 'register' ? '#0F172A' : '#64748B',
              boxShadow: tab === 'register' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Register
          </button>
        </div>

        {/* Quick Demo One-Click Logins */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '0.85rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', marginBottom: '8px' }}>
            <Sparkles size={13} /> ONE-CLICK DEMO LOGIN (REAL BACKEND USERS)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
            {Object.entries(DEMO_ACCOUNTS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleDemoClick(key)}
                disabled={loading}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '6px 8px',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  color: '#334155',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <span>{item.label.split(' ')[0]}</span>
                <span style={{ fontSize: '0.65rem', color: '#10B981' }}>➔</span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94A3B8" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94A3B8" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem', borderRadius: '10px' }}
            >
              <LogIn size={18} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#94A3B8" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="e.g. Rohit Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94A3B8" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Role *</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="citizen">Citizen / Community Member</option>
                <option value="student">Student / Innovator</option>
                <option value="faculty_mentor">Faculty Mentor</option>
                <option value="university_coordinator">University Coordinator</option>
                <option value="industry_partner">Industry Partner / CSR</option>
                <option value="gov_admin">Government Officer / Admin</option>
              </select>
            </div>

            {['student', 'faculty_mentor', 'university_coordinator'].includes(role) && (
              <div className="form-group">
                <label className="form-label">University / Institution</label>
                <select
                  className="form-select"
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                >
                  <option value="">Select University...</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.district})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {role === 'industry_partner' && (
              <div className="form-group">
                <label className="form-label">Company / Organization</label>
                <select
                  className="form-select"
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                >
                  <option value="">Select Organization...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.org_type?.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94A3B8" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem', borderRadius: '10px' }}
            >
              <UserPlus size={18} />
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
