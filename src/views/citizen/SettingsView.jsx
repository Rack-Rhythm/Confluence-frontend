import React, { useState } from 'react';
import { Bell, Lock, Globe, Shield, Trash2, ChevronRight, Moon, Sun } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const SettingsView = () => {
  const { showToast } = useToast();
  const [emailAlerts, setEmailAlerts] = useState(() => {
    try {
      const v = localStorage.getItem('confluence_citizen_email_alerts');
      return v !== null ? JSON.parse(v) : true;
    } catch { return true; }
  });
  const [pushAlerts, setPushAlerts] = useState(() => {
    try {
      const v = localStorage.getItem('confluence_citizen_push_alerts');
      return v !== null ? JSON.parse(v) : true;
    } catch { return true; }
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('confluence_citizen_lang') || 'English';
  });

  const toggleEmailAlerts = () => {
    const nextVal = !emailAlerts;
    setEmailAlerts(nextVal);
    localStorage.setItem('confluence_citizen_email_alerts', JSON.stringify(nextVal));
    showToast(`Email alerts ${nextVal ? 'enabled' : 'disabled'}`, 'success');
  };

  const togglePushAlerts = () => {
    const nextVal = !pushAlerts;
    setPushAlerts(nextVal);
    localStorage.setItem('confluence_citizen_push_alerts', JSON.stringify(nextVal));
    showToast(`Push notifications ${nextVal ? 'enabled' : 'disabled'}`, 'success');
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          Settings
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Manage your account preferences and notification settings. (Saved locally)
        </p>
      </div>

      <div className="card" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column' }}>
        {/* Email Alerts */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <Bell size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0F172A' }}>
                Email Notifications
              </div>
              <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                Receive emails when your reported issue gets triaged or resolved
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={toggleEmailAlerts}
            style={{ width: '20px', height: '20px', accentColor: '#2563EB', cursor: 'pointer' }}
          />
        </div>

        {/* Push Alerts */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
              <Bell size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0F172A' }}>
                Push Alerts & SMS
              </div>
              <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                Receive instant status notifications on your mobile device
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={pushAlerts}
            onChange={togglePushAlerts}
            style={{ width: '20px', height: '20px', accentColor: '#16A34A', cursor: 'pointer' }}
          />
        </div>

        {/* Change Password */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #F1F5F9',
            cursor: 'pointer',
          }}
          onClick={() => showToast('Password reset link sent to your registered email.', 'info')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
              <Lock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0F172A' }}>
                Change Password
              </div>
              <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                Update your account password for enhanced security
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#94A3B8" />
        </div>

        {/* Language */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
              <Globe size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0F172A' }}>
                Language
              </div>
              <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                Select your preferred portal language
              </div>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              localStorage.setItem('confluence_citizen_lang', e.target.value);
              showToast(`Language set to ${e.target.value}`, 'success');
            }}
            className="form-select"
            style={{ width: '130px', padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
          >
            <option value="English">English</option>
            <option value="Hindi">हिंदी (Hindi)</option>
            <option value="Odia">ଓଡ଼ିଆ (Odia)</option>
            <option value="Santali">ᱥᱟᱱᱛᱟᱲᱤ (Santali)</option>
          </select>
        </div>

        {/* Privacy & Security */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #F1F5F9',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0F172A' }}>
                Privacy & Security
              </div>
              <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                Manage data encryption and activity log transparency
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#94A3B8" />
        </div>

        {/* Delete Account */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            cursor: 'pointer',
          }}
          onClick={() => showToast('Please contact admin to request account deletion.', 'warning')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
              <Trash2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#DC2626' }}>
                Delete Account
              </div>
              <div style={{ fontSize: '0.775rem', color: '#EF4444' }}>
                Permanently delete your account and associated data
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#EF4444" />
        </div>
      </div>
    </div>
  );
};
