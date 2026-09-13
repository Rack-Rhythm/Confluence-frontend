import React, { useState, useEffect } from 'react';
import { Search, Filter, Compass, MapPin, Eye, MessageSquare, ArrowRight, Lightbulb } from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { IssueCard } from '../../components/common/IssueCard';

export const ExploreProblems = ({ onSelectProblem, onSubmitPitchForProblem }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await issuesAPI.getIssues();
        setIssues(Array.isArray(res) ? res : res.results || []);
      } catch (err) {
        console.error('Failed to load problems:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const districts = Array.from(new Set(issues.map((i) => i.district).filter(Boolean)));

  const filtered = issues.filter((issue) => {
    const matchesCat = categoryFilter === 'all' || issue.category === categoryFilter;
    const matchesDist = districtFilter === 'all' || issue.district === districtFilter;
    const matchesSearch =
      !searchQuery ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesDist && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          Explore Real Problems
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Find problems from communities across India, understand the context, and submit your technical pitches.
        </p>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          background: '#FFFFFF',
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        <div className="search-bar-input" style={{ width: '320px' }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search problems, projects, places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '160px', padding: '0.45rem 0.75rem', fontSize: '0.825rem' }}
          >
            <option value="all">All Categories</option>
            <option value="water">Water & Sanitation</option>
            <option value="urban_infra">Infrastructure</option>
            <option value="agriculture">Agriculture</option>
            <option value="environment">Environment</option>
            <option value="education">Education</option>
            <option value="healthcare">Healthcare</option>
            <option value="energy">Energy</option>
          </select>

          <select
            className="form-select"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            style={{ width: '150px', padding: '0.45rem 0.75rem', fontSize: '0.825rem' }}
          >
            <option value="all">All Locations</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Problem Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94A3B8' }}>
          Loading real community problems...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', color: '#64748B' }}>
          No problems match your filters.
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((issue) => (
            <div key={issue.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <IssueCard
                issue={issue}
                onView={() => onSelectProblem(issue)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
