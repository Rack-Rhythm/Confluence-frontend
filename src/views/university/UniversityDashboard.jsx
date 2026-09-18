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
  AlertTriangle,
  FileCheck,
  UserCheck,
  Award,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  Eye,
  MapPin,
} from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { pitchesAPI } from '../../api/pitches';
import { analyticsAPI } from '../../api/analytics';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge, CategoryPill } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getIssueImageUrl, handleImageError } from '../../utils/imageUtils';

export const UniversityDashboard = ({ onNavigate, onSelectIssue, onSelectPitch }) => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [actionInbox, setActionInbox] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [issuesRes, pitchesRes, analyticsRes, inboxRes] = await Promise.allSettled([
          issuesAPI.getIssues(),
          pitchesAPI.getPitches(),
          analyticsAPI.getSummary(),
          issuesAPI.getActionInbox(),
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

        if (inboxRes.status === 'fulfilled') {
          setActionInbox(inboxRes.value);
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

  // Derive dynamic trend line coordinates from real issues
  const trendIntervals = 5;
  const now = Date.now();
  const msInterval = 7 * 24 * 60 * 60 * 1000;
  const trendData = [];
  for (let i = trendIntervals; i >= 0; i--) {
    const periodEnd = now - i * msInterval;
    const reported = issues.filter((iss) => new Date(iss.created_at).getTime() <= periodEnd).length;
    const resolved = issues.filter((iss) => iss.status === 'resolved' && new Date(iss.updated_at || iss.created_at).getTime() <= periodEnd).length;
    trendData.push({ reported, resolved });
  }

  const maxTrend = Math.max(1, ...trendData.map((d) => Math.max(d.reported, d.resolved)));
  const trendPoints = trendData.map((d, idx) => {
    const x = 30 + idx * 88;
    const yRep = 180 - Math.round((d.reported / maxTrend) * 130);
    const yRes = 180 - Math.round((d.resolved / maxTrend) * 130);
    return { x, yRep, yRes, ...d };
  });

  const dReported = trendPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.yRep}`).join(' ');
  const dResolved = trendPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.yRes}`).join(' ');
  const areaReported = `${dReported} L ${trendPoints[trendPoints.length - 1].x} 180 L ${trendPoints[0].x} 180 Z`;
  const areaResolved = `${dResolved} L ${trendPoints[trendPoints.length - 1].x} 180 L ${trendPoints[0].x} 180 Z`;
  const lastPoint = trendPoints[trendPoints.length - 1];

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

      {/* Action Inbox Section (Issue 25) */}
      <div
        className="card"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#EEF2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4F46E5',
              }}
            >
              <Inbox size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Action Inbox
                </h2>
                {actionInbox?.total_pending_actions > 0 ? (
                  <span
                    style={{
                      background: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    {actionInbox.total_pending_actions} Pending
                  </span>
                ) : (
                  <span
                    style={{
                      background: '#ECFDF5',
                      color: '#059669',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    All Caught Up
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>
                Priority queue of decisions requiring university coordinator review and approval.
              </p>
            </div>
          </div>
        </div>

        {/* 5 Action Buckets Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            {
              key: 'challenges_awaiting_review',
              title: 'Challenges for Review',
              subtitle: 'Awaiting adoption or review',
              count: actionInbox?.buckets?.challenges_awaiting_review?.count ?? 0,
              icon: FileCheck,
              color: '#2563EB',
              bg: '#EFF6FF',
              border: '#BFDBFE',
              navTarget: 'challenges',
              btnLabel: 'Review Challenges',
            },
            {
              key: 'nominations_awaiting_decision',
              title: 'Student Nominations',
              subtitle: 'Awaiting endorsement',
              count: actionInbox?.buckets?.nominations_awaiting_decision?.count ?? 0,
              icon: UserCheck,
              color: '#D97706',
              bg: '#FFFBEB',
              border: '#FDE68A',
              navTarget: 'challenges',
              btnLabel: 'View Nominations',
            },
            {
              key: 'solutions_awaiting_review',
              title: 'Solutions Under Review',
              subtitle: 'Pitches awaiting decision',
              count: actionInbox?.buckets?.solutions_awaiting_review?.count ?? 0,
              icon: Lightbulb,
              color: '#7C3AED',
              bg: '#F5F3FF',
              border: '#DDD6FE',
              navTarget: 'solutions',
              btnLabel: 'Evaluate Pitches',
            },
            {
              key: 'milestones_awaiting_approval',
              title: 'Milestone Approvals',
              subtitle: 'Verification & sign-off',
              count: actionInbox?.buckets?.milestones_awaiting_approval?.count ?? 0,
              icon: Award,
              color: '#059669',
              bg: '#ECFDF5',
              border: '#A7F3D0',
              navTarget: 'projects',
              btnLabel: 'Inspect Milestones',
            },
            {
              key: 'citizen_verification_failures',
              title: 'Citizen Disputes',
              subtitle: 'Verification failed / disputed',
              count: actionInbox?.buckets?.citizen_verification_failures?.count ?? 0,
              icon: AlertOctagon,
              color: '#DC2626',
              bg: '#FEF2F2',
              border: '#FECACA',
              navTarget: 'challenges',
              btnLabel: 'Resolve Disputes',
            },
          ].map((bucket) => {
            const IconComp = bucket.icon;
            const hasItems = bucket.count > 0;
            return (
              <div
                key={bucket.key}
                style={{
                  background: hasItems ? bucket.bg : '#F8FAFC',
                  border: `1px solid ${hasItems ? bucket.border : '#E2E8F0'}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: hasItems ? '#FFFFFF' : '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: hasItems ? bucket.color : '#94A3B8',
                      }}
                    >
                      <IconComp size={18} />
                    </div>
                    <span
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: hasItems ? bucket.color : '#64748B',
                        background: hasItems ? '#FFFFFF' : '#F1F5F9',
                        padding: '2px 10px',
                        borderRadius: '8px',
                        boxShadow: hasItems ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                      }}
                    >
                      {bucket.count}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>
                    {bucket.title}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#64748B', lineHeight: 1.3, marginBottom: '0.9rem' }}>
                    {bucket.subtitle}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(bucket.navTarget)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: 'none',
                    background: hasItems ? bucket.color : '#E2E8F0',
                    color: hasItems ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  <span>{bucket.btnLabel}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
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

              {/* Dynamic Path based on live issues */}
              <path
                d={areaReported}
                fill="url(#gradReportedUni)"
              />
              <path
                d={dReported}
                fill="none"
                stroke="#2563EB"
                strokeWidth="3"
              />

              <path
                d={areaResolved}
                fill="url(#gradResolvedUni)"
              />
              <path
                d={dResolved}
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
              />

              {lastPoint && (
                <>
                  <circle cx={lastPoint.x} cy={lastPoint.yRep} r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx={lastPoint.x} cy={lastPoint.yRes} r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                </>
              )}
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

      {/* 4. Incoming Problem Pipeline (Recently Reported) */}
      <div
        className="card"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: '0.85rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Incoming Problem Pipeline
            </h3>
            <p style={{ fontSize: '0.775rem', color: '#64748B', margin: '3px 0 0 0' }}>
              Recently reported citizen problems requiring university verification and adoption
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('problem_pipeline')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#2563EB',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <span>View Full Pipeline ({totalIssues})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {issues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
            No reported problems available in the pipeline.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}># ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>REPORTED PROBLEM & PHOTO</th>
                  <th style={{ padding: '0.75rem 1rem' }}>AI CLASSIFICATION</th>
                  <th style={{ padding: '0.75rem 1rem' }}>LOCATION</th>
                  <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {issues.slice(0, 6).map((iss) => (
                  <tr key={iss.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#64748B' }}>
                      #{iss.id}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={getIssueImageUrl(iss)}
                          alt={iss.title}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: '1px solid #E2E8F0',
                            background: '#F1F5F9',
                          }}
                          onError={(e) => handleImageError(e, iss.category)}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {iss.title}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: '#64748B' }}>
                            Reported {iss.created_at ? new Date(iss.created_at).toLocaleDateString() : 'recently'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontWeight: 700, fontSize: '0.75rem' }}>
                        <Sparkles size={12} /> {Math.round((iss.ai_confidence || 0.9) * 100)}% ({iss.category})
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                      📍 {iss.district || 'Dhanbad'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <StatusBadge status={iss.status} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => onSelectIssue ? onSelectIssue(iss) : onNavigate('problem_pipeline')}
                        className="btn btn-outline btn-sm"
                        style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                      >
                        <Eye size={13} style={{ marginRight: '4px' }} />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
