import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, XCircle, Clock, School, User, ArrowRight } from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

export const AdoptionPipeline = () => {
  const { showToast } = useToast();
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadNominations = async () => {
    setLoading(true);
    try {
      const data = await issuesAPI.getNominations();
      setNominations(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.warn('Failed to load nominations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNominations();
  }, []);

  const handleReview = async (id, action) => {
    setProcessingId(id);
    try {
      await issuesAPI.reviewNomination(id, action);
      showToast(`Student nomination ${action}d! Issue status updated.`, 'success');
      loadNominations();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to review nomination.';
      showToast(msg, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          University Adoption Pipeline & Student Nominations
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Review grassroots problem nominations submitted by students and coordinate department adoptions.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid-responsive-4" style={{ gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563EB' }}>
            {nominations.length}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>
            Submitted Nominations
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F59E0B' }}>
            {nominations.filter((n) => n.status === 'pending').length}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>
            Pending Review
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981' }}>
            {nominations.filter((n) => n.status === 'approved').length}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>
            Adopted & Approved
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#EF4444' }}>
            {nominations.filter((n) => n.status === 'rejected').length}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>
            Rejected
          </div>
        </div>
      </div>

      {/* Nominations Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', fontWeight: 800, color: '#0F172A' }}>
          Pending Institutional Nominations
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94A3B8' }}>
            Loading university nominations...
          </div>
        ) : nominations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>
            No pending student nominations found for your university.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}># ID</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>PROBLEM TITLE</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>NOMINATING STUDENT</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>RATIONALE & EXPERTISE</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>STATUS</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {nominations.map((nom) => (
                  <tr key={nom.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#64748B' }}>
                      #{nom.id}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#0F172A' }}>
                      {nom.issue?.title || 'Community Challenge'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#475569' }}>
                      {nom.student?.name || 'Priya Sharma'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#334155', maxWidth: '300px' }}>
                      {nom.rationale || 'Our department lab has the testing apparatus and research capacity.'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <StatusBadge status={nom.status} />
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      {nom.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            disabled={processingId === nom.id}
                            onClick={() => handleReview(nom.id, 'approve')}
                            className="btn btn-primary btn-sm"
                            style={{ background: '#10B981', borderRadius: '6px' }}
                          >
                            Approve
                          </button>
                          <button
                            disabled={processingId === nom.id}
                            onClick={() => handleReview(nom.id, 'reject')}
                            className="btn btn-outline btn-sm"
                            style={{ borderRadius: '6px', color: '#EF4444' }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Reviewed</span>
                      )}
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
