import React, { useState, useEffect } from 'react';
import { BookmarkCheck, Megaphone, Plus, Layers, MapPin, Users, ArrowRight } from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { StatusBadge, CategoryPill } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

export const AdoptedProblems = ({ onSelectIssue, onCreateOpenCall }) => {
  const { showToast } = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issuesAPI
      .getIssues({ status: 'adopted' })
      .then((res) => {
        const raw = Array.isArray(res) ? res : res.results || [];
        setIssues(raw);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
            Adopted Societal Challenges
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Problems formally adopted by the institution. Manage assigned departments and launch open student pitch calls.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94A3B8' }}>
          Loading adopted problems...
        </div>
      ) : issues.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748B' }}>
          No adopted issues found. Go to Problem Pipeline to adopt validated issues.
        </div>
      ) : (
        <div className="grid-2">
          {issues.map((issue) => (
            <div key={issue.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <CategoryPill category={issue.category} />
                  <StatusBadge status={issue.status} />
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
                  {issue.title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.75rem' }}>
                  📍 {issue.district} • Adopted by University Innovation Cell
                </div>

                <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {issue.description}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                <button
                  onClick={() => onSelectIssue(issue)}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, borderRadius: '8px' }}
                >
                  View Details
                </button>
                <button
                  onClick={() => showToast(`Open Call created for "${issue.title}"!`, 'success')}
                  className="btn btn-blue btn-sm"
                  style={{ flex: 1, borderRadius: '8px' }}
                >
                  <Megaphone size={14} /> Open Pitch Call
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
