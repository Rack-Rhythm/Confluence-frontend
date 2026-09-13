import React, { useState, useEffect } from 'react';
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
import { issuesAPI } from '../../api/issues';
import { pitchesAPI } from '../../api/pitches';
import { notificationsAPI } from '../../api/notifications';
import { useToast } from '../../context/ToastContext';

export const UniversityNotifications = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('all'); // all, issues, pitches, projects, mentorship, system
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const storageKey = 'confluence_uni_read_notifs';
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchLiveEvents = async () => {
      setLoading(true);
      try {
        let dbNotifs = [];
        try {
          const res = await notificationsAPI.getNotifications();
          dbNotifs = Array.isArray(res) ? res : res.results || [];
        } catch (e) {
          console.warn('DB notifications fallback:', e);
        }

        if (dbNotifs.length > 0) {
          const mapped = dbNotifs.map((n) => ({
            id: n.id,
            type: n.notification_type || 'system',
            title: n.title,
            subtext: n.message,
            time: new Date(n.created_at).toLocaleDateString(),
            icon: n.notification_type === 'pitches' ? Lightbulb : n.notification_type === 'project' ? FolderKanban : n.notification_type === 'mentorship' ? Users : FileText,
            color: n.notification_type === 'project' ? '#10B981' : n.notification_type === 'mentorship' ? '#F59E0B' : '#2563EB',
            bg: n.notification_type === 'project' ? '#ECFDF5' : n.notification_type === 'mentorship' ? '#FFFBEB' : '#EFF6FF',
          }));
          setNotifications(mapped);
          setLoading(false);
          return;
        }

        const [issuesRes, pitchesRes] = await Promise.allSettled([
          issuesAPI.getIssues(),
          pitchesAPI.getPitches(),
        ]);

        const notifs = [];

        if (pitchesRes.status === 'fulfilled') {
          const pList = Array.isArray(pitchesRes.value) ? pitchesRes.value : pitchesRes.value.results || [];
          pList.forEach((p) => {
            if (p.status === 'selected') {
              notifs.push({
                id: `pitch-win-${p.id}`,
                type: 'projects',
                title: `Winning pitch selected: ${p.title}`,
                subtext: `Selected for project incubation and assigned development track.`,
                time: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : 'Recent',
                icon: FolderKanban,
                color: '#10B981',
                bg: '#ECFDF5',
              });
            } else if (p.assigned_mentor_details) {
              notifs.push({
                id: `pitch-mentor-${p.id}`,
                type: 'mentorship',
                title: `Faculty mentor assigned to ${p.title}`,
                subtext: `Assigned Mentor: ${p.assigned_mentor_details.name}.`,
                time: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : 'Recent',
                icon: Users,
                color: '#F59E0B',
                bg: '#FFFBEB',
              });
            } else {
              notifs.push({
                id: `pitch-sub-${p.id}`,
                type: 'pitches',
                title: `New student pitch submitted: ${p.title}`,
                subtext: `Team innovation pitch received and awaiting board evaluation.`,
                time: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent',
                icon: Lightbulb,
                color: '#8B5CF6',
                bg: '#F5F3FF',
              });
            }
          });
        }

        if (issuesRes.status === 'fulfilled') {
          const iList = Array.isArray(issuesRes.value) ? issuesRes.value : issuesRes.value.results || [];
          iList.forEach((issue) => {
            if (issue.status === 'validated') {
              notifs.push({
                id: `iss-val-${issue.id}`,
                type: 'issues',
                title: `Civic Challenge #${issue.id} validated by District`,
                subtext: `"${issue.title}" is ready for university adoption.`,
                time: issue.created_at ? new Date(issue.created_at).toLocaleDateString() : 'Recent',
                icon: FileText,
                color: '#2563EB',
                bg: '#EFF6FF',
              });
            } else if (issue.status === 'adopted') {
              notifs.push({
                id: `iss-adp-${issue.id}`,
                type: 'projects',
                title: `Problem #${issue.id} actively adopted`,
                subtext: `"${issue.title}" active in university engineering pipeline.`,
                time: issue.updated_at ? new Date(issue.updated_at).toLocaleDateString() : 'Recent',
                icon: CheckCircle2,
                color: '#059669',
                bg: '#ECFDF5',
              });
            }
          });
        }

        notifs.push({
          id: 'sys-call-01',
          type: 'system',
          title: 'University Innovation Network Active',
          subtext: 'Synchronized with live state database and District Innovation portal.',
          time: 'Active',
          icon: Bell,
          color: '#06B6D4',
          bg: '#ECFEFF',
        });

        setNotifications(notifs);
      } catch (err) {
        console.error('Failed to load university notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveEvents();
  }, []);

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllRead();
    } catch (e) {}
    const all = notifications.map((n) => n.id);
    setReadIds(all);
    localStorage.setItem(storageKey, JSON.stringify(all));
    addToast('All notifications marked as read', 'success');
  };

  const filtered = (activeTab === 'all' ? notifications : notifications.filter((n) => n.type === activeTab)).map((n) => ({
    ...n,
    unread: !readIds.includes(n.id),
  }));

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
          onClick={markAllAsRead}
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
