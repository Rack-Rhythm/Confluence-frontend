import React, { useState, useEffect } from 'react';
import { Inbox, Sparkles, CheckCircle, XCircle, ArrowRight, Layers, Eye } from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { StatusBadge, CategoryPill } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

export const ProblemPipeline = ({ onSelectIssue }) => {
  const { showToast } = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

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

  const handleModerate = async (issueId, action) => {
    try {
      await issuesAPI.moderateIssue(issueId, { action });
      showToast(`Problem #${issueId} ${action}d!`, 'success');
      load();
    } catch (err) {
      showToast('Action failed.', 'error');
    }
  };

  const handleAdopt = async (issueId) => {
    try {
      await issuesAPI.adoptIssue(issueId);
      showToast(`Problem #${issueId} adopted by your university! Open call initialized.`, 'success');
      load();
    } catch (err) {
      console.error('Failed to adopt issue:', err);
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to adopt issue.';
      showToast(msg, 'error');
    }
  };

  const tabs = [
    { id: 'all', label: `All Problems (${issues.length})` },
    { id: 'pending', label: `Pending Validation (${issues.filter((i) => i.status === 'submitted').length})` },
    { id: 'validated', label: `Approved / Validated (${issues.filter((i) => i.status === 'validated').length})` },
    { id: 'adopted', label: `Adopted (${issues.filter((i) => i.status === 'adopted' || i.status === 'assigned').length})` },
    { id: 'rejected', label: `Rejected (${issues.filter((i) => i.status === 'rejected').length})` },
  ];

  const filtered = issues.filter((i) => {
    if (activeTab === 'pending') return i.status === 'submitted';
    if (activeTab === 'validated') return i.status === 'validated';
    if (activeTab === 'adopted') return i.status === 'adopted' || i.status === 'assigned';
    if (activeTab === 'rejected') return i.status === 'rejected';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          Problem Pipeline & Academic Intake
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Intake stream of citizen problems: AI classified, pending academic validation, and departmental routing.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', background: '#FFFFFF', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '0.45rem 0.85rem',
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
            Loading problem pipeline...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>
            No problems in this pipeline stage.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}># ID</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>TITLE & PHOTO</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>AI CLASSIFICATION</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>LOCATION</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>STATUS</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((issue) => (
                  <tr key={issue.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#64748B' }}>
                      #{issue.id}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={issue.photo_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=100'}
                          alt={issue.title}
                          style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div style={{ fontWeight: 700, color: '#0F172A', maxWidth: '260px' }}>
                          {issue.title}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontWeight: 700, fontSize: '0.75rem' }}>
                        <Sparkles size={12} /> {Math.round((issue.ai_confidence || 0.9) * 100)}% ({issue.category})
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#475569' }}>
                      📍 {issue.district}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <StatusBadge status={issue.status} />
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => onSelectIssue(issue)}
                          className="btn btn-outline btn-sm"
                          style={{ borderRadius: '6px' }}
                        >
                          <Eye size={13} />
                        </button>
                        {issue.status === 'submitted' && (
                          <button
                            onClick={() => handleModerate(issue.id, 'validate')}
                            className="btn btn-primary btn-sm"
                            style={{ background: '#10B981', borderRadius: '6px' }}
                          >
                            Validate
                          </button>
                        )}
                        {issue.status === 'validated' && (
                          <button
                            onClick={() => handleAdopt(issue.id)}
                            className="btn btn-blue btn-sm"
                            style={{ borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem' }}
                          >
                            <Layers size={13} /> Adopt
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
