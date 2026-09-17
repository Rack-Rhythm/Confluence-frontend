import React, { useState, useEffect } from 'react';
import {
  Sliders,
  ShieldAlert,
  Zap,
  Save,
  Bell,
  Cpu,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Database,
  Lock,
  Radio,
  FileCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminSettingsView = () => {
  const { showToast } = useToast();

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('confluence_platform_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      maintenanceMode: false,
      bypassAdoptionRule: false,
      aiTriageThreshold: 75,
      maxUploadSizeKb: 600,
      systemAnnouncement: '',
      enableMockAiTriage: true,
      requireCitizenOtp: false,
      telemetryRetentionDays: 90,
    };
  });

  const [dirty, setDirty] = useState(false);

  const updateField = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('confluence_platform_settings', JSON.stringify(settings));
    setDirty(false);
    showToast('Platform master configuration committed successfully', 'success');
  };

  const handleReset = () => {
    localStorage.removeItem('confluence_platform_settings');
    setSettings({
      maintenanceMode: false,
      bypassAdoptionRule: false,
      aiTriageThreshold: 75,
      maxUploadSizeKb: 600,
      systemAnnouncement: '',
      enableMockAiTriage: true,
      requireCitizenOtp: false,
      telemetryRetentionDays: 90,
    });
    setDirty(false);
    showToast('Settings reset to platform defaults', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #312E81 100%)',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          border: '1px solid #4338CA',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 800,
                background: '#EF4444',
                color: '#FFF',
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              SYSTEM CORE
            </span>
            <span style={{ fontSize: '0.75rem', color: '#A5B4FC', fontWeight: 600 }}>
              Global Platform Switches & Engine Parameters
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0 }}>
            Platform Master Settings & Policies
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#94A3B8', marginTop: '4px' }}>
            Toggle emergency lockdown, adjust AI computer-vision triage sensitivity, and override civic workflow rules.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty}
            className="btn btn-primary"
            style={{ background: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', opacity: dirty ? 1 : 0.6 }}
          >
            <Save size={16} /> Save Configuration
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Emergency & Lifecycle Overrides */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <ShieldAlert size={20} color="#EF4444" /> Emergency Controls & Policy Enforcements
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Maintenance Mode */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: settings.maintenanceMode ? '#FEF2F2' : '#F8FAFC', borderRadius: '10px', border: settings.maintenanceMode ? '1px solid #FECACA' : '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                  Platform Emergency Maintenance Mode
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                  When enabled, non-admin users see an official Kerala State IT mission maintenance alert.
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateField('maintenanceMode', !settings.maintenanceMode)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings.maintenanceMode ? '#EF4444' : '#94A3B8' }}
              >
                {settings.maintenanceMode ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
              </button>
            </div>

            {/* Bypass University Adoption Rule */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                  Bypass University Adoption Requirement for Student Pitches
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                  By default, students can only pitch solutions after university adoption. Toggling this ON allows open pitching on raw/unvalidated issues.
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateField('bypassAdoptionRule', !settings.bypassAdoptionRule)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings.bypassAdoptionRule ? '#2563EB' : '#94A3B8' }}
              >
                {settings.bypassAdoptionRule ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: AI Vision & Triage Parameters */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <Cpu size={20} color="#2563EB" /> AI Vision & Auto-Triage Thresholds
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  AI Confidence Auto-Validation Cutoff: <strong>{settings.aiTriageThreshold}%</strong>
                </label>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Submissions with AI confidence &ge; {settings.aiTriageThreshold}% skip initial manual screening
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={settings.aiTriageThreshold}
                onChange={(e) => updateField('aiTriageThreshold', parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  Client-side Image Compression Target: <strong>{settings.maxUploadSizeKb} KB</strong>
                </label>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Reduces bandwidth on 2G/3G mobile networks during citizen civic photo uploads
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="2000"
                step="50"
                value={settings.maxUploadSizeKb}
                onChange={(e) => updateField('maxUploadSizeKb', parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Platform Broadcast Banner */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <Radio size={20} color="#F59E0B" /> Global State Broadcast Announcement
          </h3>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Broadcast Message (Displayed across all user dashboards if populated):
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Monsoon Disaster Preparedness Innovation Sprint underway across all 14 districts."
              value={settings.systemAnnouncement}
              onChange={(e) => updateField('systemAnnouncement', e.target.value)}
            />
            <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
              Leave blank to disable the top announcement banner.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-outline"
            style={{ color: '#EF4444', borderColor: '#FECACA' }}
          >
            Reset to Platform Defaults
          </button>

          <button
            type="submit"
            disabled={!dirty}
            className="btn btn-primary"
            style={{ background: '#2563EB', padding: '0.75rem 2rem', fontSize: '0.95rem', opacity: dirty ? 1 : 0.6 }}
          >
            Save All Platform Settings
          </button>
        </div>
      </form>
    </div>
  );
};
