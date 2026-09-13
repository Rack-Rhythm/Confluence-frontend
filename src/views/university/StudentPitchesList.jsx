import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { pitchesAPI } from '../../api/pitches';
import { StatusBadge } from '../../components/common/StatusBadge';

export const StudentPitchesList = ({ onSelectPitch }) => {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchPitches = async () => {
      setLoading(true);
      try {
        const res = await pitchesAPI.getPitches();
        const list = Array.isArray(res) ? res : res.results || [];
        setPitches(list);
      } catch (err) {
        console.error('Failed to load student pitches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPitches();
  }, []);

  const totalCount = pitches.length;
  const underReviewCount = pitches.filter((p) => p.status === 'submitted' || p.status === 'under_review').length;
  const shortlistedCount = pitches.filter((p) => p.status === 'shortlisted').length;
  const selectedCount = pitches.filter((p) => p.status === 'selected' || p.status === 'merged').length;
  const rejectedCount = pitches.filter((p) => p.status === 'rejected').length;

  const filteredPitches = pitches.filter((pitch) => {
    const title = pitch.title || pitch.executive_summary || '';
    const student = pitch.author?.name || pitch.student_name || 'Student Innovator';
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = categoryFilter === 'all' || pitch.category === categoryFilter;

    if (activeTab === 'under_review') return matchesSearch && matchesCat && (pitch.status === 'submitted' || pitch.status === 'under_review');
    if (activeTab === 'shortlisted') return matchesSearch && matchesCat && pitch.status === 'shortlisted';
    if (activeTab === 'selected') return matchesSearch && matchesCat && (pitch.status === 'selected' || pitch.status === 'merged');
    if (activeTab === 'rejected') return matchesSearch && matchesCat && pitch.status === 'rejected';
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header Banner */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
          Student Pitches
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
          Review innovative solutions submitted by students with dual-package IP protection.
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
            { id: 'under_review', label: 'Under Review', count: underReviewCount },
            { id: 'shortlisted', label: 'Shortlisted', count: shortlistedCount },
            { id: 'selected', label: 'Selected', count: selectedCount },
            { id: 'rejected', label: 'Rejected', count: rejectedCount },
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

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search student pitches..."
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
            <option value="water">Water</option>
            <option value="agriculture">Agriculture</option>
            <option value="transport">Transport</option>
            <option value="environment">Environment</option>
            <option value="urban_infra">Infrastructure</option>
          </select>
        </div>
      </div>

      {/* 3. Pitches Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>#</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Project Title</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Student</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>University</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPitches.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                  No student pitches found matching the selected filter.
                </td>
              </tr>
            ) : (
              filteredPitches.map((pitch, idx) => {
                const pitchIdNum = pitch.id ? `#${pitch.id.toString().padStart(4, '0')}` : `#020${idx + 1}`;
                const authorName = pitch.author?.name || pitch.author_name || 'Ananya Verma';
                const uniName = pitch.author?.university?.name || 'BIT Sindri / ITER';
                const titleText = pitch.title || pitch.executive_summary || 'Smart Water Monitoring System';

                return (
                  <tr
                    key={pitch.id || idx}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background 0.15s ease',
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#64748B' }}>
                      {pitchIdNum}
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
                        {titleText}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {pitch.issue_title ? `Addressing: ${pitch.issue_title}` : 'Societal Engineering Challenge'}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#334155' }}>
                      {authorName}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', color: '#64748B' }}>
                      {uniName}
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <StatusBadge status={pitch.status || 'under_review'} />
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => onSelectPitch && onSelectPitch(pitch)}
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
