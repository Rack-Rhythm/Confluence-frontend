import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Lock,
  Palette,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const UniversitySettings = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('general'); // general, notifications, security, appearance
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('confluence_uni_settings');
      return saved ? JSON.parse(saved) : {
        notify_issues: true,
        notify_submissions: true,
        notify_milestones: true,
        language: 'English',
        timezone: '(GMT+05:30) India Standard Time',
      };
    } catch {
      return {
        notify_issues: true,
        notify_submissions: true,
        notify_milestones: true,
        language: 'English',
        timezone: '(GMT+05:30) India Standard Time',
      };
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('confluence_uni_settings', JSON.stringify(settings));
    } catch (err) {
      console.error(err);
    }
    showToast('Preferences saved successfully to this browser!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px' }}>
      {/* 1. Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
          Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
          Manage your coordinator account settings, notification preferences, and security.
        </p>
      </div>

      {/* 2. Tabs Row */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '0.5rem',
        }}
      >
        {[
          { id: 'general', label: 'General' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'security', label: 'Security' },
          { id: 'appearance', label: 'Appearance' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 0',
              borderBottom: activeTab === tab.id ? '2px solid #2563EB' : '2px solid transparent',
              color: activeTab === tab.id ? '#2563EB' : '#64748B',
              fontWeight: activeTab === tab.id ? 800 : 600,
              fontSize: '0.9rem',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Settings Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeTab === 'general' && (
            <>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
                  Email Notifications
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settings.notify_issues}
                      onChange={(e) => setSettings({ ...settings, notify_issues: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#2563EB' }}
                    />
                    <span>Issue updates & civic problem submissions in district</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settings.notify_submissions}
                      onChange={(e) => setSettings({ ...settings, notify_submissions: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#2563EB' }}
                    />
                    <span>Student submissions & SHA-256 IP stamped pitches</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settings.notify_milestones}
                      onChange={(e) => setSettings({ ...settings, notify_milestones: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#2563EB' }}
                    />
                    <span>Project milestones & field test verification alerts</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Portal Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="input-field"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                    <option value="Odia">ଓଡ଼ିଆ (Odia)</option>
                    <option value="Bengali">বাংলা (Bengali)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Time Zone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="input-field"
                  >
                    <option value="(GMT+05:30) India Standard Time">(GMT+05:30) India Standard Time</option>
                    <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Notification Channels</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Configure in-app push alerts, email digests, and SMS emergency notifications.
              </p>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Security & Two-Factor Authentication</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Institutional SSO and WebAuthn hardware key protection enabled.
              </p>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>UI Theme & Accessibility</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                High-contrast mode and font scaling for assistive readability.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
            <button type="submit" className="btn btn-blue" style={{ borderRadius: '10px' }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
