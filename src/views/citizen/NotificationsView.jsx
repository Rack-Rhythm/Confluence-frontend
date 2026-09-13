import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, PlayCircle, Sparkles, CheckCheck } from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { pitchesAPI } from '../../api/pitches';
import { notificationsAPI } from '../../api/notifications';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const NotificationsView = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
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
            title: n.title,
            desc: n.message,
            time: new Date(n.created_at).toLocaleDateString(),
            type: n.notification_type === 'project' ? 'resolved' : n.notification_type === 'issue' ? 'review' : 'in_progress',
            unread: !n.is_read,
          }));
          setNotifications(mapped);
          setLoading(false);
          return;
        }
        const [issuesRes, pitchesRes] = await Promise.allSettled([
          issuesAPI.getIssues({ mine: 1 }),
          pitchesAPI.getPitches({ mine: 1 }),
        ]);

        const notifs = [];

        if (issuesRes.status === 'fulfilled') {
          const raw = Array.isArray(issuesRes.value) ? issuesRes.value : issuesRes.value.results || [];
          raw.forEach((issue) => {
            if (issue.status === 'resolved') {
              notifs.push({
                id: `iss-res-${issue.id}`,
                title: `Your issue has been resolved`,
                desc: `"${issue.title}" has completed field deployment. Please verify resolution on details page.`,
                time: new Date(issue.updated_at || issue.created_at).toLocaleDateString(),
                type: 'resolved',
                unread: true,
              });
            } else if (issue.status === 'adopted' || issue.status === 'assigned') {
              notifs.push({
                id: `iss-adopt-${issue.id}`,
                title: `Update on your issue: In Progress`,
                desc: `"${issue.title}" has been adopted and assigned to an innovation engineering team.`,
                time: new Date(issue.updated_at || issue.created_at).toLocaleDateString(),
                type: 'in_progress',
                unread: true,
              });
            } else if (issue.status === 'submitted') {
              notifs.push({
                id: `iss-sub-${issue.id}`,
                title: `Your issue is under AI Triage & Review`,
                desc: `"${issue.title}" was received and auto-categorized (Confidence: ${Math.round((issue.ai_confidence || 0.9) * 100)}%).`,
                time: new Date(issue.created_at).toLocaleDateString(),
                type: 'review',
                unread: false,
              });
            }
          });
        }

        if (pitchesRes.status === 'fulfilled') {
          const rawPitches = Array.isArray(pitchesRes.value) ? pitchesRes.value : pitchesRes.value.results || [];
          rawPitches.forEach((pitch) => {
            if (pitch.status === 'selected') {
              notifs.push({
                id: `pitch-win-${pitch.id}`,
                title: `Winning Pitch Selected! 🎉`,
                desc: `Your pitch "${pitch.title}" was selected by the University Review Board for project lifecycle deployment.`,
                time: new Date(pitch.updated_at || pitch.created_at).toLocaleDateString(),
                type: 'resolved',
                unread: true,
              });
            } else if (pitch.review_feedback) {
              notifs.push({
                id: `pitch-rev-${pitch.id}`,
                title: `Mentor Feedback Received`,
                desc: `Review Board note: "${pitch.review_feedback}"`,
                time: new Date(pitch.updated_at || pitch.created_at).toLocaleDateString(),
                type: 'in_progress',
                unread: false,
              });
            }
          });
        }

        notifs.push({
          id: 'welcome-01',
          title: `Welcome to Confluence, ${user?.name || 'Changemaker'}!`,
          desc: 'Your account is connected to the live state innovation network.',
          time: 'Active Session',
          type: 'welcome',
          unread: false,
        });

        const storageKey = `confluence_read_notifs_${user?.id || 'guest'}`;
        const storedReadIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const persistedNotifs = notifs.map((n) => ({
          ...n,
          unread: storedReadIds.includes(n.id) ? false : n.unread,
        }));

        setNotifications(persistedNotifs);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllRead();
    } catch (e) {}
    const storageKey = `confluence_read_notifs_${user?.id || 'guest'}`;
    const allIds = notifications.map((n) => n.id);
    localStorage.setItem(storageKey, JSON.stringify(allIds));
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast('All notifications marked as read', 'info');
  };

  const markAsRead = async (id) => {
    try {
      if (typeof id === 'number') {
        await notificationsAPI.markRead(id);
      }
    } catch (e) {}
    const storageKey = `confluence_read_notifs_${user?.id || 'guest'}`;
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!stored.includes(id)) {
      stored.push(id);
      localStorage.setItem(storageKey, JSON.stringify(stored));
    }
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const getIcon = (type) => {
    if (type === 'resolved') return <CheckCircle2 size={18} color="#10B981" />;
    if (type === 'in_progress') return <PlayCircle size={18} color="#2563EB" />;
    if (type === 'review') return <Clock size={18} color="#F59E0B" />;
    return <Sparkles size={18} color="#8B5CF6" />;
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
            Notifications
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Live status updates and alerts generated dynamically from your active issues and submissions.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.825rem',
            fontWeight: 700,
            color: '#5B21B6',
          }}
        >
          <CheckCheck size={16} /> Mark all as read
        </button>
      </div>

      <div className="card" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94A3B8' }}>
            Loading live notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748B' }}>
            No notifications at this time.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                background: n.unread ? '#F8FAFC' : '#FFFFFF',
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {getIcon(n.type)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: n.unread ? 800 : 600, color: '#0F172A' }}>
                    {n.title}
                  </div>
                  <span style={{ fontSize: '0.725rem', color: '#94A3B8' }}>{n.time}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                  {n.desc}
                </p>
              </div>

              {n.unread && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#2563EB',
                    marginTop: '8px',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
