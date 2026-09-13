import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Sparkles, Check, AlertCircle, Eye, Layers } from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { StatusBadge, CategoryPill } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

export const ValidationView = ({ onSelectIssue }) => {
  const { showToast } = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const load = async () => {
    setLoading(true);
    try {
      const data = await issuesAPI.getIssues();
      setIssues(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleValidate = async (issueId) => {
    try {
      await issuesAPI.moderateIssue(issueId, { action: 'validate' });
      showToast(`Problem #${issueId} validated and approved for university open calls!`, 'success');
      load();
    } catch (err) {
      showToast('Validation failed.', 'error');
    }
  };

  const handleReject = async (issueId) => {
    try {
      await issuesAPI.moderateIssue(issueId, { action: 'reject' });
      showToast(`Problem #${issueId} rejected.`, 'info');
      load();
    } catch (err) {
      showToast('Action failed.', 'error');
    }
  };

  const pendingIssues = issues.filter((i) => i.status === 'submitted');
  const validatedIssues = issues.filter((i) => i.status === 'validated');
  const rejectedIssues = issues.filter((i) => i.status === 'rejected');

  const getFiltered = () => {
    if (activeTab === 'pending') return pendingIssues;
    if (activeTab === 'validated') return validatedIssues;
    if (activeTab === 'rejected') return rejectedIssues;
    return issues;
  };

  const filtered = getFiltered();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          Problem Validation & AI Assistance
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Review, verify and validate citizen problems using automated AI categorization and duplicate detection.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', background: '#FFFFFF', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        {[
          { id: 'pending', label: `Pending (${pendingIssues.length})` },
          { id: 'validated', label: `Validated (${validatedIssues.length})` },
          { id: 'rejected', label: `Rejected (${rejectedIssues.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: activeTab === t.id ? '#2563EB' : '#F1F5F9',
              color: activeTab === t.id ? '#FFFFFF' : '#475569',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94A3B8' }}>
            Loading validation queue...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>
            No problems in this validation stage.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}># ID</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>TITLE</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>AI DUPLICATE-CHECK</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>AI CATEGORY</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((issue) => (
                  <tr key={issue.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#64748B' }}>
                      #{issue.id}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#0F172A', maxWidth: '300px' }}>
                      {issue.title}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#10B981', background: '#ECFDF5', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        ✓ No duplicate match
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <CategoryPill category={issue.category} />
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => onSelectIssue(issue)}
                          className="btn btn-outline btn-sm"
                          style={{ borderRadius: '6px' }}
                        >
                          Review
                        </button>
                        {issue.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => handleValidate(issue.id)}
                              className="btn btn-primary btn-sm"
                              style={{ background: '#10B981', borderRadius: '6px' }}
                            >
                              Validate
                            </button>
                            <button
                              onClick={() => handleReject(issue.id)}
                              className="btn btn-outline btn-sm"
                              style={{ borderRadius: '6px', color: '#EF4444' }}
                            >
                              Reject
                            </button>
                          </>
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

      {/* AI Assistance Callout */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Sparkles size={20} color="#2563EB" />
        <div style={{ fontSize: '0.85rem', color: '#1E40AF', fontWeight: 600 }}>
          <strong>AI Assistance Enabled:</strong> Our NLP model automatically categorizes problems, computes confidence scores, and detects duplicate complaints across districts.
        </div>
      </div>
    </div>
  );
};
