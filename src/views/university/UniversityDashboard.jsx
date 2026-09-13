import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Clock,
  BookmarkCheck,
  Lightbulb,
  Building2,
  TrendingUp,
  School,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { pitchesAPI } from '../../api/pitches';
import { analyticsAPI } from '../../api/analytics';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';

export const UniversityDashboard = ({ onNavigate, onSelectIssue, onSelectPitch }) => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [issuesRes, pitchesRes, analyticsRes] = await Promise.allSettled([
          issuesAPI.getIssues(),
          pitchesAPI.getPitches(),
          analyticsAPI.getSummary(),
        ]);

        if (issuesRes.status === 'fulfilled') {
          const raw = issuesRes.value;
          setIssues(Array.isArray(raw) ? raw : raw.results || []);
        }

        if (pitchesRes.status === 'fulfilled') {
          const raw = pitchesRes.value;
          setPitches(Array.isArray(raw) ? raw : raw.results || []);
        }

        if (analyticsRes.status === 'fulfilled') {
          setAnalytics(analyticsRes.value);
        }
      } catch (err) {
        console.error('Failed to load university dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 100% dynamic counts computed strictly from live database
  const totalIssues = issues.length;
  const underReviewIssues = issues.filter((i) => i.status === 'submitted').length;
  const adoptedIssues = issues.filter((i) => ['adopted', 'assigned', 'resolved'].includes(i.status)).length;
  const totalPitches = pitches.length;

  const categories = analytics?.categories || [];
  const maxCategoryCount = Math.max(...categories.map((c) => c.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)',
          borderRadius: '20px',
          border: '1px solid #BFDBFE',
          padding: '1.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
            Good Morning, {user?.name || 'Prof. S. Soren'}! 🎓
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#475569', maxWidth: '600px' }}>
            Drive innovation from real societal problems into patented technologies and student startups.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: '#FFFFFF',
            padding: '0.65rem 1.25rem',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <School size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
              {user?.university_details?.name || user?.university?.name || 'Birsa Institute of Technology (BIT) Sindri'}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#10B981', fontWeight: 700 }}>
              ● University Innovation Cell Active
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4 Stat Cards */}
      <div className="grid-4">
        <StatCard
          icon={Inbox}
          title="Problem Pipeline"
          value={totalIssues}
          subtext="New & Incoming Problems"
          color="#2563EB"
          bgColor="#EFF6FF"
          borderColor="#BFDBFE"
          onClick={() => onNavigate('problem_pipeline')}
        />
        <StatCard
          icon={Clock}
          title="Under Review"
          value={underReviewIssues}
          subtext="Awaiting academic review"
          color="#F59E0B"
          bgColor="#FFFBEB"
          borderColor="#FDE68A"
          onClick={() => onNavigate('validation')}
        />
        <StatCard
          icon={BookmarkCheck}
          title="Adopted Problems"
          value={adoptedIssues}
          subtext="By university departments"
          color="#10B981"
          bgColor="#ECFDF5"
          borderColor="#A7F3D0"
          onClick={() => onNavigate('adopted_problems')}
        />
        <StatCard
          icon={Lightbulb}
          title="Student Pitches"
          value={totalPitches}
          subtext="Cryptographically stamped"
          color="#8B5CF6"
          bgColor="#F5F3FF"
          borderColor="#DDD6FE"
          onClick={() => onNavigate('student_pitches')}
        />
      </div>

      {/* 3. Issue Trends & Category Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '1.5rem' }}>
        {/* Issue Trends Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Issue Trends
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Monthly comparison of reported vs resolved problems
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700, background: '#EFF6FF', padding: '4px 10px', borderRadius: '999px' }}>
              This Month ▾
            </span>
          </div>

          <div style={{ height: '220px', width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="gradReportedUni" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradResolvedUni" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="40" x2="500" y2="40" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="190" x2="500" y2="190" stroke="#E2E8F0" strokeWidth="1" />

              <path
                d="M 20 160 Q 120 110, 240 130 T 360 80 T 480 40 L 480 190 L 20 190 Z"
                fill="url(#gradReportedUni)"
              />
              <path
                d="M 20 160 Q 120 110, 240 130 T 360 80 T 480 40"
                fill="none"
                stroke="#2563EB"
                strokeWidth="3"
              />

              <path
                d="M 20 180 Q 120 160, 240 150 T 360 120 T 480 80 L 480 190 L 20 190 Z"
                fill="url(#gradResolvedUni)"
              />
              <path
                d="M 20 180 Q 120 160, 240 150 T 360 120 T 480 80"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
              />

              <circle cx="480" cy="40" r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="480" cy="80" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginTop: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB' }}>
              <span style={{ width: '12px', height: '3px', background: '#2563EB', borderRadius: '2px' }}></span>
              Reported ({totalIssues})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981' }}>
              <span style={{ width: '12px', height: '3px', background: '#10B981', borderRadius: '2px' }}></span>
              Resolved ({issues.filter((i) => i.status === 'resolved').length})
            </span>
          </div>
        </div>

        {/* Category Distribution Donut */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
            Category Distribution
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '1.25rem' }}>
            Breakdown across focus areas
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {categories.map((cat, idx) => {
              const colors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
              const col = colors[idx % colors.length];

              return (
                <div key={cat.category || idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                    <span style={{ color: '#334155', textTransform: 'capitalize' }}>
                      {cat.category?.replace('_', ' ') || 'Domain'}
                    </span>
                    <span style={{ color: '#0F172A', fontWeight: 700 }}>{cat.count}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${(cat.count / maxCategoryCount) * 100}%`, height: '100%', background: col, borderRadius: '999px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
