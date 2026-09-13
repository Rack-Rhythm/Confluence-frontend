import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MapPin, Eye, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { StatusBadge, CategoryPill } from '../../components/common/StatusBadge';

export const MyIssues = ({ onNavigate, onSelectIssue }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadIssues = async () => {
    setLoading(true);
    try {
      const data = await issuesAPI.getIssues({ mine: 1 });
      setIssues(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to load my issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const underReviewIssues = issues.filter((i) => i.status === 'submitted');
  const inProgressIssues = issues.filter((i) => ['validated', 'adopted', 'assigned'].includes(i.status));
  const resolvedIssues = issues.filter((i) => i.status === 'resolved');

  const getFilteredIssues = () => {
    let list = issues;
    if (activeTab === 'under_review') list = underReviewIssues;
    if (activeTab === 'in_progress') list = inProgressIssues;
    if (activeTab === 'resolved') list = resolvedIssues;

    if (searchQuery) {
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (i.district && i.district.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return list;
  };

  const filtered = getFilteredIssues();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
            My Issues
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Track the status and progress of problems you have reported.
          </p>
        </div>

        <button
          onClick={() => onNavigate('report_problem')}
          className="btn btn-primary"
          style={{ background: '#5B21B6', borderRadius: '10px' }}
        >
          <Plus size={18} /> Report a Problem
        </button>
      </div>

      {/* Search & Tabs Filter Bar */}
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
        {/* Search */}
        <div className="search-bar-input" style={{ width: '300px' }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All (${issues.length})` },
            { id: 'under_review', label: `Under Review (${underReviewIssues.length})` },
            { id: 'in_progress', label: `In Progress (${inProgressIssues.length})` },
            { id: 'resolved', label: `Resolved (${resolvedIssues.length})` },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: isActive ? '#5B21B6' : '#F1F5F9',
                  color: isActive ? '#FFFFFF' : '#475569',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Issues List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94A3B8' }}>
          Loading your reported issues...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 1rem',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            color: '#64748B',
          }}
        >
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0F172A' }}>
            No issues found
          </div>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {searchQuery ? 'Try changing your search terms' : 'You haven’t reported any problems in this status yet.'}
          </p>
          <button
            onClick={() => onNavigate('report_problem')}
            className="btn btn-primary btn-sm"
            style={{ borderRadius: '8px', background: '#5B21B6' }}
          >
            Report a Problem Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((issue) => (
            <div
              key={issue.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1.25rem',
                transition: 'all 0.2s ease',
              }}
            >
              <img
                src={issue.photo_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=300'}
                alt={issue.title}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <CategoryPill category={issue.category} />
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    • Reported on {new Date(issue.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: '0.35rem',
                  }}
                >
                  {issue.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.825rem',
                    color: '#475569',
                    marginBottom: '0.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {issue.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748B' }}>
                  <MapPin size={13} color="#94A3B8" />
                  <span>{issue.address || issue.district}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                <StatusBadge status={issue.status} />
                <button
                  onClick={() => onSelectIssue(issue)}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: '8px' }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
