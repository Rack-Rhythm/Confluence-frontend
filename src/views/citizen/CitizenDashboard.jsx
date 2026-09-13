import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  PlayCircle,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  MapPin,
  Trees,
  Award,
  Calendar,
  Volume2,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { issuesAPI } from '../../api/issues';
import { engagementsAPI } from '../../api/engagements';
import { StatCard } from '../../components/common/StatCard';
import { IssueMap } from '../../components/common/IssueMap';
import { StatusBadge } from '../../components/common/StatusBadge';

export const CitizenDashboard = ({ onNavigate, onSelectIssue }) => {
  const { user } = useAuth();
  const [myIssues, setMyIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [mineRes, allRes, engRes] = await Promise.allSettled([
          issuesAPI.getIssues({ mine: 1 }),
          issuesAPI.getIssues(),
          engagementsAPI.getEngagements(),
        ]);

        if (mineRes.status === 'fulfilled') {
          const res = mineRes.value;
          setMyIssues(Array.isArray(res) ? res : res.results || []);
        }

        if (allRes.status === 'fulfilled') {
          const res = allRes.value;
          setAllIssues(Array.isArray(res) ? res : res.results || []);
        }

        if (engRes.status === 'fulfilled') {
          const res = engRes.value;
          setEngagements(Array.isArray(res) ? res : res.results || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // 100% dynamic counts computed strictly from live backend responses
  const totalCount = myIssues.length;
  const underReviewCount = myIssues.filter((i) => i.status === 'submitted').length;
  const inProgressCount = myIssues.filter((i) => ['validated', 'adopted', 'assigned'].includes(i.status)).length;
  const resolvedCount = myIssues.filter((i) => i.status === 'resolved').length;

  // Category counts computed from user's live issues (or regional issues)
  const categories = [
    { key: 'urban_infra', label: 'Infrastructure', color: '#2563EB' },
    { key: 'water', label: 'Sanitation / Water', color: '#10B981' },
    { key: 'public_admin', label: 'Public Safety', color: '#F59E0B' },
    { key: 'environment', label: 'Environment', color: '#8B5CF6' },
    { key: 'transport', label: 'Transport', color: '#EC4899' },
  ];

  const sourceIssues = myIssues.length > 0 ? myIssues : allIssues;
  const categoryDistribution = categories.map((cat) => {
    const count = sourceIssues.filter((i) => i.category === cat.key).length;
    return { ...cat, count };
  });

  const maxCatCount = Math.max(...categoryDistribution.map((c) => c.count), 1);

  // People benefited computed from actual resolved issues or active deployments
  const peopleBenefited = resolvedCount > 0 ? resolvedCount * 250 : totalCount > 0 ? totalCount * 120 : allIssues.filter((i) => i.status === 'resolved').length * 250;

  // Calculate percentages for donut
  const denom = totalCount > 0 ? totalCount : 1;
  const underReviewPct = totalCount > 0 ? Math.round((underReviewCount / denom) * 100) : 0;
  const inProgressPct = totalCount > 0 ? Math.round((inProgressCount / denom) * 100) : 0;
  const resolvedPct = totalCount > 0 ? Math.round((resolvedCount / denom) * 100) : 0;

  const strokeTotal = 88;
  const dashReview = totalCount > 0 ? (underReviewCount / denom) * strokeTotal : 0;
  const dashProgress = totalCount > 0 ? (inProgressCount / denom) * strokeTotal : 0;
  const dashResolved = totalCount > 0 ? (resolvedCount / denom) * strokeTotal : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. TOP WELCOME BANNER */}
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
          boxShadow: '0 4px 15px rgba(37, 99, 235, 0.05)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
              Welcome back, {user?.name || 'Citizen'}! 👋
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#475569', maxWidth: '580px' }}>
            Thank you for being a changemaker. Report problems, track progress and help build better communities.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: '#FFFFFF',
              padding: '0.65rem 1.25rem',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <Trees size={24} color="#10B981" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                Stronger Communities
              </div>
              <div style={{ fontSize: '0.725rem', color: '#10B981', fontWeight: 700 }}>
                Brighter Bharat
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS ROW + REPORT PROBLEM CTA */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr) 1.25fr',
          gap: '1.25rem',
          alignItems: 'stretch',
        }}
      >
        <StatCard
          icon={FileText}
          title="Total Issues"
          value={totalCount}
          color="#2563EB"
          bgColor="#EFF6FF"
          borderColor="#BFDBFE"
          onClick={() => onNavigate('my_issues')}
        />
        <StatCard
          icon={Clock}
          title="Under Review"
          value={underReviewCount}
          color="#F59E0B"
          bgColor="#FFFBEB"
          borderColor="#FDE68A"
          onClick={() => onNavigate('my_issues')}
        />
        <StatCard
          icon={PlayCircle}
          title="In Progress"
          value={inProgressCount}
          color="#6366F1"
          bgColor="#EEF2FF"
          borderColor="#C7D2FE"
          onClick={() => onNavigate('my_issues')}
        />
        <StatCard
          icon={CheckCircle2}
          title="Resolved"
          value={resolvedCount}
          color="#10B981"
          bgColor="#ECFDF5"
          borderColor="#A7F3D0"
          onClick={() => onNavigate('my_issues')}
        />

        {/* Report a New Problem CTA Button Card */}
        <div
          onClick={() => onNavigate('report_problem')}
          style={{
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#FFFFFF',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.25)',
            transition: 'transform 0.15s ease',
          }}
          className="btn-glow-hover"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem', fontWeight: 800 }}>
              <Plus size={20} /> Report a New Problem
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '3px' }}>
              See something that needs attention? Let us know.
            </div>
          </div>
          <ArrowRight size={20} />
        </div>
      </div>

      {/* 3. MIDDLE ROW: RECENT ISSUES + ISSUE MAP + ANNOUNCEMENTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1.35fr 1fr', gap: '1.25rem' }}>
        {/* My Recent Issues */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
              My Recent Issues
            </h3>
            <button
              onClick={() => onNavigate('my_issues')}
              style={{ fontSize: '0.775rem', fontWeight: 700, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {myIssues.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94A3B8', fontSize: '0.85rem' }}>
                You haven't reported any issues yet. Click "+ Report a New Problem" to begin!
              </div>
            ) : (
              myIssues.slice(0, 3).map((issue) => (
                <div
                  key={issue.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem',
                    borderRadius: '12px',
                    border: '1px solid #F1F5F9',
                    background: '#F8FAFC',
                  }}
                >
                  <img
                    src={issue.photo_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=200'}
                    alt={issue.title}
                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {issue.title}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={11} /> {issue.district || 'Location'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge status={issue.status} />
                    <button
                      onClick={() => onSelectIssue(issue)}
                      style={{ display: 'block', fontSize: '0.7rem', color: '#2563EB', fontWeight: 600, marginTop: '4px' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Issue Map */}
        <div className="card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
              Issue Map
            </h3>
            <button
              onClick={() => onNavigate('track_status')}
              style={{ fontSize: '0.775rem', fontWeight: 700, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              View Map <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ flex: 1, minHeight: '260px' }}>
            <IssueMap
              issues={myIssues.length > 0 ? myIssues : allIssues}
              onViewIssue={onSelectIssue}
              height="260px"
            />
          </div>
        </div>

        {/* Dynamic Announcements & Industry Partnerships */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
              Active Engagements
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>● Live</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {engagements.length > 0 ? (
              engagements.slice(0, 3).map((eng) => (
                <div
                  key={eng.id}
                  style={{
                    padding: '0.65rem 0.75rem',
                    background: '#F0FDF4',
                    borderRadius: '10px',
                    border: '1px solid #A7F3D0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#065F46' }}>
                    <Trees size={15} /> {eng.industry_org_details?.name || eng.industry_org?.name || 'Industry CSR Partner'}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#047857', marginTop: '2px' }}>
                    {eng.proposal_notes || 'Active CSR sponsorship & mentoring for district societal challenge.'}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div style={{ padding: '0.65rem 0.75rem', background: '#EFF6FF', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#1E40AF' }}>
                    <Calendar size={15} /> University Open Call Active
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#1D4ED8', marginTop: '2px' }}>
                    Regional engineering institutions reviewing validated citizen problems.
                  </div>
                </div>

                <div style={{ padding: '0.65rem 0.75rem', background: '#ECFDF5', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#065F46' }}>
                    <Trees size={15} /> Community Resolution Verification
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#047857', marginTop: '2px' }}>
                    Submitters can verify field deployment outcomes directly on their issue detail page.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4. STATISTICS, CATEGORY BREAKDOWN & IMPACT ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr 1fr', gap: '1.25rem' }}>
        {/* Issue Statistics Donut */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
              Issue Statistics
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Live Data</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center', padding: '0.5rem 0' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                {totalCount > 0 ? (
                  <>
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="4"
                      strokeDasharray={`${dashReview} ${strokeTotal}`}
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="4"
                      strokeDasharray={`${dashProgress} ${strokeTotal}`}
                      strokeDashoffset={`-${dashReview}`}
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="4"
                      strokeDasharray={`${dashResolved} ${strokeTotal}`}
                      strokeDashoffset={`-${dashReview + dashProgress}`}
                    />
                  </>
                ) : (
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#CBD5E1" strokeWidth="4" strokeDasharray="88 88" />
                )}
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>{totalCount}</span>
                <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>Total</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></span>
                <span>Under Review ({underReviewPct}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563EB' }}></span>
                <span>In Progress ({inProgressPct}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></span>
                <span>Resolved ({resolvedPct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Wise Issues Progress Bars */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
              Category Wise Issues
            </h3>
            <button
              onClick={() => onNavigate('my_issues')}
              style={{ fontSize: '0.775rem', fontWeight: 700, color: '#2563EB' }}
            >
              View All ➔
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {categoryDistribution.map((cat) => (
              <div key={cat.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  <span style={{ color: '#334155' }}>{cat.label}</span>
                  <span style={{ color: '#0F172A', fontWeight: 700 }}>{cat.count}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: cat.color,
                      width: `${(cat.count / maxCatCount) * 100}%`,
                      borderRadius: '999px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Impact */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)',
            border: '1px solid #A7F3D0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
              <Trees size={20} color="#10B981" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>My Impact</h3>
            </div>
            <p style={{ fontSize: '0.775rem', color: '#059669', fontWeight: 600, marginBottom: '1.25rem' }}>
              You are making a difference!
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ background: '#FFFFFF', padding: '0.65rem 0.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563EB' }}>{totalCount}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>Reported</div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '0.65rem 0.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10B981' }}>{resolvedCount}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>Resolved</div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '0.65rem 0.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8B5CF6' }}>~{peopleBenefited}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>Benefited</div>
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.775rem', color: '#475569', fontStyle: 'italic', textAlign: 'center' }}>
            “Civic responsibility leads to stronger communities.”
          </p>
        </div>
      </div>

      {/* 5. HOW IT WORKS STEPPER */}
      <div className="card">
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
            How It Works?
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
            See how your report creates real change from submission to field resolution.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', position: 'relative' }}>
          {[
            { step: '1', title: 'Report', desc: 'Share the issue details with photos', color: '#2563EB' },
            { step: '2', title: 'Review', desc: 'Our team verifies and categorizes', color: '#8B5CF6' },
            { step: '3', title: 'Action', desc: 'Concerned department takes action', color: '#10B981' },
            { step: '4', title: 'Track', desc: 'You can track real-time updates', color: '#0284C7' },
            { step: '5', title: 'Resolution', desc: 'Get notified when the issue is resolved', color: '#F59E0B' },
          ].map((s) => (
            <div key={s.step} style={{ textAlign: 'center', position: 'relative' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: s.color,
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  boxShadow: `0 4px 10px ${s.color}40`,
                }}
              >
                {s.step}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                {s.title}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748B', lineHeight: 1.3 }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
