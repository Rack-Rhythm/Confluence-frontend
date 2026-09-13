import React, { useState } from 'react';
import {
  Bell,
  Lightbulb,
  FileText,
  FolderKanban,
  Users,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const UniversityNotifications = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('all'); // all, issues, pitches, projects, mentorship, system

  const notifications = [
    {
      id: 1,
      type: 'pitches',
      title: 'New pitch submitted for Smart Water Monitoring',
      subtext: 'Team AquaTech attached dual-package IP schematics with SHA-256 stamp.',
      time: '2 hours ago',
      icon: Lightbulb,
      color: '#8B5CF6',
      bg: '#F5F3FF',
    },
    {
      id: 2,
      type: 'issues',
      title: 'Problem #1132 (Turbidity in Mahanadi Basin) is ready for validation',
      subtext: 'AI Duplicate detection passed with 0 conflicts.',
      time: '5 hours ago',
      icon: FileText,
      color: '#2563EB',
      bg: '#EFF6FF',
    },
    {
      id: 3,
      type: 'projects',
      title: 'Your project Drone Crop Monitoring reached 40% completion',
      subtext: 'Milestone "Edge AI Firmware Flashing" was logged by student team.',
      time: '1 day ago',
      icon: FolderKanban,
      color: '#10B981',
      bg: '#ECFDF5',
    },
    {
      id: 4,
      type: 'mentorship',
      title: 'Review board evaluation scheduled on 20 Aug 2024',
      subtext: '3 faculty members and 1 industry expert confirmed attendance.',
      time: '2 days ago',
      icon: Users,
      color: '#F59E0B',
      bg: '#FFFBEB',
    },
    {
      id: 5,
      type: 'system',
      title: 'New open call published: Clean Energy & Waste to Energy',
      subtext: 'Published to 4 engineering universities in Odisha & Jharkhand region.',
      time: '3 days ago',
      icon: Bell,
      color: '#06B6D4',
      bg: '#ECFEFF',
    },
  ];

  const filtered = activeTab === 'all' ? notifications : notifications.filter((n) => n.type === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
            Notifications
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Live updates across problem submissions, student pitches, projects, and mentorship.
          </p>
        </div>

        <button
          onClick={() => addToast('All notifications marked as read', 'success')}
          className="btn btn-outline btn-sm"
          style={{ borderRadius: '8px' }}
        >
          Mark all as read
        </button>
      </div>

      {/* 2. Tabs Row */}
      <div
        style={{
          display: 'flex',
          gap: '1.25rem',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '0.5rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'all', label: 'All' },
          { id: 'issues', label: 'Issues' },
          { id: 'pitches', label: 'Pitches' },
          { id: 'projects', label: 'Projects' },
          { id: 'mentorship', label: 'Mentorship' },
          { id: 'system', label: 'System' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 0',
              borderBottom: activeTab === tab.id ? '2px solid #2563EB' : '2px solid transparent',
              color: activeTab === tab.id ? '#2563EB' : '#64748B',
              fontWeight: activeTab === tab.id ? 800 : 600,
              fontSize: '0.875rem',
              background: 'transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Notification List Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filtered.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1.15rem 1.25rem',
                borderRadius: '14px',
                border: '1px solid #F1F5F9',
                transition: 'transform 0.15s ease, background 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: item.bg,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconComponent size={20} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <h4 style={{ fontSize: '0.925rem', fontWeight: 800, color: '#0F172A' }}>
                    {item.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                    {item.time}
                  </span>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#64748B', lineHeight: 1.4 }}>
                  {item.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
