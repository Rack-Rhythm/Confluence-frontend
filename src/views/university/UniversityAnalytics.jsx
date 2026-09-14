import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BookmarkCheck,
  Lightbulb,
  FolderKanban,
  Award,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { pitchesAPI } from '../../api/pitches';
import { analyticsAPI } from '../../api/analytics';
import { StatCard } from '../../components/common/StatCard';

export const UniversityAnalytics = () => {
  const [issues, setIssues] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('year');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [issuesRes, pitchesRes, analyticsRes] = await Promise.allSettled([
          issuesAPI.getIssues(),
          pitchesAPI.getPitches(),
          analyticsAPI.getSummary({ time_range: timeRange }),
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
        console.error('Failed to load university analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const totalAdopted = analytics?.overview?.adopted_issues ?? issues.filter((i) => ['adopted', 'assigned', 'resolved'].includes(i.status)).length;
  const totalPitches = analytics?.overview?.total_pitches_submitted ?? pitches.length;
  const totalProjects = analytics?.overview?.assigned_solutions ?? pitches.filter((p) => p.status === 'shortlisted' || p.status === 'selected' || p.status === 'merged').length;
  const deployedSolutions = analytics?.overview?.resolved_issues ?? issues.filter((i) => i.status === 'resolved').length;

  // Derive dynamic monthly breakdown from live issues and pitches
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mIdx = d.getMonth();
    const yr = d.getFullYear();
    const mName = monthNames[mIdx];

    const adoptedInMonth = issues.filter((iss) => {
      const dt = new Date(iss.created_at);
      return dt.getMonth() === mIdx && dt.getFullYear() === yr && ['adopted', 'assigned', 'resolved'].includes(iss.status);
    }).length;

    const pitchesInMonth = pitches.filter((p) => {
      const dt = new Date(p.created_at);
      return dt.getMonth() === mIdx && dt.getFullYear() === yr;
    }).length;

    const projectsInMonth = pitches.filter((p) => {
      const dt = new Date(p.created_at);
      return dt.getMonth() === mIdx && dt.getFullYear() === yr && ['selected', 'merged'].includes(p.status);
    }).length;

    monthlyData.push({
      month: mName,
      adopted: adoptedInMonth,
      pitches: pitchesInMonth,
      projects: projectsInMonth,
    });
  }
  const maxMonthlyVal = Math.max(1, ...monthlyData.map((m) => Math.max(m.adopted, m.pitches, m.projects)));

  const categories = analytics?.categories || [
    { category: 'water', count: issues.filter((i) => i.category === 'water').length },
    { category: 'urban_infra', count: issues.filter((i) => i.category === 'urban_infra').length },
    { category: 'environment', count: issues.filter((i) => i.category === 'environment').length },
    { category: 'transport', count: issues.filter((i) => i.category === 'transport').length },
    { category: 'public_admin', count: issues.filter((i) => i.category === 'public_admin').length },
  ];

  const totalCatSum = categories.reduce((sum, c) => sum + c.count, 0) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
            Analytics
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Insights and impact of university-led innovations and student startup incubation.
          </p>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-field"
          style={{ width: '150px', height: '38px', fontSize: '0.85rem', fontWeight: 600 }}
        >
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* 2. 4 Stat Cards */}
      <div className="grid-4">
        <StatCard
          icon={BookmarkCheck}
          title="Adopted Problems"
          value={totalAdopted}
          subtext="From public pipeline"
          color="#2563EB"
          bgColor="#EFF6FF"
          borderColor="#BFDBFE"
        />
        <StatCard
          icon={Lightbulb}
          title="Student Pitches"
          value={totalPitches}
          subtext="Cryptographically stamped"
          color="#8B5CF6"
          bgColor="#F5F3FF"
          borderColor="#DDD6FE"
        />
        <StatCard
          icon={FolderKanban}
          title="Projects"
          value={totalProjects}
          subtext="Active in university labs"
          color="#10B981"
          bgColor="#ECFDF5"
          borderColor="#A7F3D0"
        />
        <StatCard
          icon={Award}
          title="Deployed Solutions"
          value={deployedSolutions}
          subtext="Field verified by community"
          color="#F59E0B"
          bgColor="#FFFBEB"
          borderColor="#FDE68A"
        />
      </div>

      {/* 3. Monthly Activity Multi-Bar Chart & Top Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Monthly Activity Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Monthly Activity
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Comparison of adopted issues, student pitches, and incubated projects
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB' }}>
                <span style={{ width: '8px', height: '8px', background: '#2563EB', borderRadius: '2px' }}></span>
                Adopted
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8B5CF6' }}>
                <span style={{ width: '8px', height: '8px', background: '#8B5CF6', borderRadius: '2px' }}></span>
                Pitches
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
                <span style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '2px' }}></span>
                Projects
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', padding: '0 0.5rem', borderBottom: '1px solid #E2E8F0' }}>
            {monthlyData.map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '170px' }}>
                  <div
                    title={`Adopted: ${d.adopted}`}
                    style={{
                      width: '10px',
                      height: `${Math.max(6, Math.round((d.adopted / maxMonthlyVal) * 140))}px`,
                      background: '#2563EB',
                      borderRadius: '3px 3px 0 0',
                    }}
                  />
                  <div
                    title={`Pitches: ${d.pitches}`}
                    style={{
                      width: '10px',
                      height: `${Math.max(6, Math.round((d.pitches / maxMonthlyVal) * 140))}px`,
                      background: '#8B5CF6',
                      borderRadius: '3px 3px 0 0',
                    }}
                  />
                  <div
                    title={`Projects: ${d.projects}`}
                    style={{
                      width: '10px',
                      height: `${Math.max(6, Math.round((d.projects / maxMonthlyVal) * 140))}px`,
                      background: '#10B981',
                      borderRadius: '3px 3px 0 0',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600 }}>{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
            Top Categories
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '1.5rem' }}>
            Distribution of research focus across engineering fields
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categories.map((cat, idx) => {
              const pct = Math.round((cat.count / totalCatSum) * 100);
              const colors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
              const col = colors[idx % colors.length];

              return (
                <div key={cat.category || idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                    <span style={{ color: '#334155', textTransform: 'capitalize' }}>
                      {cat.category?.replace('_', ' ')}
                    </span>
                    <span style={{ color: '#0F172A' }}>{pct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: '999px' }} />
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
