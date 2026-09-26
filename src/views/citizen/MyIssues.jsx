import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MapPin, Eye, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { StatusBadge, CategoryPill } from '../../components/common/StatusBadge';
import { getIssueImageUrl, handleImageError } from '../../utils/imageUtils';


const getCategoryTheme = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('water') || cat.includes('sanitat')) {
    return { color: '#10B981', bg: '#D1FAE5', label: 'Water & San.' };
  }
  if (cat.includes('infra') || cat.includes('road')) {
    return { color: '#EF4444', bg: '#FEE2E2', label: 'Infrastructure' };
  }
  if (cat.includes('agri') || cat.includes('farm')) {
    return { color: '#F59E0B', bg: '#FEF3C7', label: 'Agriculture' };
  }
  if (cat.includes('edu') || cat.includes('school')) {
    return { color: '#3B82F6', bg: '#DBEAFE', label: 'Education' };
  }
  if (cat.includes('health') || cat.includes('medic')) {
    return { color: '#EC4899', bg: '#FCE7F3', label: 'Healthcare' };
  }
  if (cat.includes('rural') || cat.includes('panchayat')) {
    return { color: '#8B5CF6', bg: '#EDE9FE', label: 'Rural Services' };
  }
  return { color: '#6366F1', bg: '#E0E7FF', label: category || 'General' };
};

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
        <div className="mobile-horizontal-scroll-row" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap', width: '100%', margin: '0 -0.5rem', padding: '0 0.5rem 0.5rem' }}>
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
        <div className="grid-responsive-3" style={{ gap: '1.25rem' }}>
          {filtered.map((issue) => {
            const theme = getCategoryTheme(issue.category);
            return (
              <div
                key={issue.id}
                className="modern-citizen-card"
                onClick={() => onSelectIssue && onSelectIssue(issue)}
              >
                <div className="modern-citizen-image-container">
                  <img
                    src={issue.preview_image || getIssueImageUrl(issue)}
                    alt={issue.title}
                    className="modern-citizen-image"
                    onError={(e) => handleImageError(e, issue.category)}
                  />
                  <div className="modern-citizen-badge">{new Date(issue.created_at).toLocaleDateString()}</div>
                </div>

                <div className="modern-citizen-content">
                  <h3 className="modern-citizen-title">{issue.title}</h3>
                  <p className="modern-citizen-sponsor">
                    <MapPin size={12} color="#64748B" />
                    {issue.address || issue.district || 'Jharkhand'}
                  </p>

                  <div className="modern-citizen-divider"></div>

                  <div className="modern-citizen-stats">
                    <div className="modern-citizen-stat-item">
                      <span className="modern-citizen-stat-value">
                        {theme.label.split(' ')[0]}
                      </span>
                      <span className="modern-citizen-stat-label">Category</span>
                    </div>
                    <div className="modern-citizen-stat-item">
                      <span className="modern-citizen-stat-value">{issue.upvotes || 0}</span>
                      <span className="modern-citizen-stat-label">Upvotes</span>
                    </div>
                    <div className="modern-citizen-stat-item">
                      <span className="modern-citizen-stat-value">{issue.status === 'resolved' ? 'Resolved' : 'Open'}</span>
                      <span className="modern-citizen-stat-label">Status</span>
                    </div>
                  </div>

                  <button 
                    className="modern-citizen-btn" 
                    style={{ 
                      background: issue.status === 'resolved' && !issue.citizen_verified_resolved ? '#10B981' : '#5B21B6', 
                      color: 'white' 
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectIssue) onSelectIssue(issue);
                    }}
                  >
                    {issue.status === 'resolved' && !issue.citizen_verified_resolved ? 'Verify Resolution' : 'View Progress'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
