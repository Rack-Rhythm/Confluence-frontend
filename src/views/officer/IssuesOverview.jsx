import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Copy,
  Layers,
  MapPin,
  Eye,
  Sparkles,
} from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { StatusBadge, CategoryPill } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const IssuesOverview = ({ onSelectIssue }) => {
  const { showToast } = useToast();
  const { role } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionInProgress, setActionInProgress] = useState(null);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const data = await issuesAPI.getIssues();
      setIssues(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const handleModerate = async (issueId, action) => {
    setActionInProgress(issueId);
    try {
      await issuesAPI.moderateIssue(issueId, { action });
      showToast(`Issue #${issueId} marked as ${action}d!`, 'success');
      loadIssues();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to moderate issue.';
      showToast(msg, 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const filtered = issues.filter((i) => {
    const matchesCat = categoryFilter === 'all' || i.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.district && i.district.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          All Citizen Issues & Triage Board
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Track and manage issues reported by citizens. Validate, reject, mark duplicates, or adopt for university innovation.
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
            placeholder="Search issues, title, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '150px', padding: '0.45rem 0.75rem', fontSize: '0.825rem' }}
          >
            <option value="all">All Categories</option>
            <option value="water">Water & Sanitation</option>
            <option value="urban_infra">Infrastructure</option>
            <option value="agriculture">Agriculture</option>
            <option value="environment">Environment</option>
            <option value="education">Education</option>
          </select>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '150px', padding: '0.45rem 0.75rem', fontSize: '0.825rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted / Review</option>
            <option value="validated">Validated</option>
            <option value="adopted">Adopted</option>
            <option value="assigned">Assigned / In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94A3B8' }}>
            Loading live citizen issues...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>
            No issues match the selected filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}># ID</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>TITLE & PHOTO</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>LOCATION</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>CATEGORY</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>STATUS</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>DATE</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((issue) => (
                  <tr
                    key={issue.id}
                    style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#64748B' }}>
                      #{issue.id}
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={issue.photo_url || issue.photo || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=100'}
                          alt={issue.title}
                          style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {issue.title}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Sparkles size={11} /> AI Confidence: {Math.round((issue.ai_confidence || 0.9) * 100)}%
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', color: '#475569' }}>
                      📍 {issue.district}
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <CategoryPill category={issue.category} />
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <StatusBadge status={issue.status} />
                    </td>

                    <td style={{ padding: '1rem 1.25rem', color: '#94A3B8', fontSize: '0.8rem' }}>
                      {new Date(issue.created_at).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          onClick={() => onSelectIssue(issue)}
                          className="btn btn-outline btn-sm"
                          style={{ borderRadius: '6px', padding: '4px 8px' }}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Moderation validate button if submitted */}
                        {issue.status === 'submitted' && (
                          <button
                            disabled={actionInProgress === issue.id}
                            onClick={() => handleModerate(issue.id, 'validate')}
                            className="btn btn-primary btn-sm"
                            style={{ background: '#10B981', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            Validate
                          </button>
                        )}
                      </div>
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
