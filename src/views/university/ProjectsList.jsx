import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Search,
  Filter,
  Layers,
  CheckCircle2,
  Clock,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { pitchesAPI } from '../../api/pitches';
import { issuesAPI } from '../../api/issues';
import { getIssueImageUrl, handleImageError } from '../../utils/imageUtils';

export const ProjectsList = ({ onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, prototype, development, testing, deployed
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const [projRes, pitchesRes] = await Promise.allSettled([
          pitchesAPI.getProjects(),
          pitchesAPI.getPitches(),
        ]);

        let realProjects = [];
        if (projRes.status === 'fulfilled') {
          const rawP = projRes.value;
          realProjects = Array.isArray(rawP) ? rawP : rawP.results || [];
        }

        if (realProjects.length > 0) {
          const formatted = realProjects.map((p) => {
            let stage = 'Prototype';
            if (['pilot'].includes(p.status)) stage = 'Development';
            else if (['deployment_ready'].includes(p.status)) stage = 'Testing';
            else if (['deployed', 'awaiting_citizen_verification', 'verified'].includes(p.status)) stage = 'Deployed';

            const defaultProgress = stage === 'Deployed' ? 100 : stage === 'Testing' ? 85 : stage === 'Development' ? 65 : 35;
            const teamNames = p.team_details?.map((t) => t.name).filter(Boolean).join(', ') ||
              p.student_team_details?.map((t) => t.name).filter(Boolean).join(', ') ||
              'Student Engineering Team';

            return {
              ...p,
              id: p.id,
              pitchId: p.solution,
              title: p.title,
              problem: p.challenge_details?.title || p.title,
              category: p.challenge_details?.category || 'Engineering',
              stage,
              progress: p.progress_pct ?? defaultProgress,
              team_name: teamNames,
            };
          });
          setProjects(formatted);
        } else {
          // Fallback to pitches if no projects created yet
          let rawPitches = [];
          if (pitchesRes.status === 'fulfilled') {
            const raw = pitchesRes.value;
            rawPitches = Array.isArray(raw) ? raw : raw.results || [];
          }

          const liveProjects = rawPitches.map((p, idx) => {
            const stages = ['Prototype', 'Development', 'Testing', 'Deployed'];
            const stageIdx = (p.id || idx) % 4;
            const stage = p.stage || stages[stageIdx];
            const progressVals = [35, 65, 85, 100];
            const progress = p.progress_pct || progressVals[stageIdx];
            const leadName = p.student_team_details?.[0]?.name || p.author?.name || 'Student Innovators';

            return {
              ...p,
              stage,
              progress,
              team_name: p.team_name || `${leadName}'s Team`,
            };
          });

          setProjects(liveProjects);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const totalCount = projects.length;
  const prototypeCount = projects.filter((p) => p.stage === 'Prototype').length;
  const developmentCount = projects.filter((p) => p.stage === 'Development').length;
  const testingCount = projects.filter((p) => p.stage === 'Testing').length;
  const deployedCount = projects.filter((p) => p.stage === 'Deployed').length;

  const filteredProjects = projects.filter((p) => {
    const title = p.title || p.executive_summary || '';
    const team = p.team_name || '';
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;

    if (activeTab === 'prototype') return matchesSearch && matchesCat && p.stage === 'Prototype';
    if (activeTab === 'development') return matchesSearch && matchesCat && p.stage === 'Development';
    if (activeTab === 'testing') return matchesSearch && matchesCat && p.stage === 'Testing';
    if (activeTab === 'deployed') return matchesSearch && matchesCat && p.stage === 'Deployed';
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
          Projects
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
          Track development, milestones, and deployment of university innovation solutions.
        </p>
      </div>

      {/* 2. Tabs Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '0.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto' }}>
          {[
            { id: 'all', label: 'All', count: totalCount },
            { id: 'prototype', label: 'Prototype', count: prototypeCount },
            { id: 'development', label: 'Development', count: developmentCount },
            { id: 'testing', label: 'Testing', count: testingCount },
            { id: 'deployed', label: 'Deployed', count: deployedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
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
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.725rem',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: activeTab === tab.id ? '#EFF6FF' : '#F1F5F9',
                  color: activeTab === tab.id ? '#2563EB' : '#64748B',
                  fontWeight: 700,
                }}
              >
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px', height: '38px', width: '220px', fontSize: '0.85rem' }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field"
            style={{ height: '38px', fontSize: '0.85rem', width: '150px' }}
          >
            <option value="all">All Categories</option>
            <option value="agriculture">Agriculture</option>
            <option value="environment">Environment</option>
            <option value="healthcare">Healthcare</option>
            <option value="water">Water</option>
          </select>
        </div>
      </div>

      {/* 3. Projects Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>#</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Project Title</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Team</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Stage</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Progress</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                  No active projects found in this development stage.
                </td>
              </tr>
            ) : (
              filteredProjects.map((proj, idx) => {
                const projNum = `#020${proj.id || idx + 1}`;
                const titleText = proj.title || proj.executive_summary || 'Drone Crop Monitoring';
                const stage = proj.stage || 'Development';
                const progress = proj.progress || 45;

                const stageColors = {
                  Prototype: { bg: '#EFF6FF', text: '#2563EB' },
                  Development: { bg: '#F5F3FF', text: '#7C3AED' },
                  Testing: { bg: '#FFFBEB', text: '#D97706' },
                  Deployed: { bg: '#ECFDF5', text: '#059669' },
                };
                const style = stageColors[stage] || stageColors.Development;

                return (
                  <tr
                    key={proj.id || idx}
                    style={{ borderBottom: '1px solid #F1F5F9' }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#64748B' }}>
                      {projNum}
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={getIssueImageUrl(proj.challenge_details || proj)}
                          alt={titleText}
                          style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid #E2E8F0', background: '#F1F5F9' }}
                          onError={(e) => handleImageError(e, proj.category)}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, color: '#0F172A' }}>{titleText}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {proj.problem ? `Problem: ${proj.problem}` : (proj.category ? `Domain: ${proj.category}` : 'University Lab Project')}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#334155' }}>
                      {proj.team_name}
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '6px',
                          background: style.bg,
                          color: style.text,
                        }}
                      >
                        {stage}
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '90px', height: '6px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${progress}%`,
                              height: '100%',
                              background: progress === 100 ? '#10B981' : '#2563EB',
                              borderRadius: '999px',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                          {progress}%
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => onSelectProject && onSelectProject(proj)}
                        className="btn btn-blue btn-sm"
                        style={{ borderRadius: '8px', padding: '4px 12px' }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
