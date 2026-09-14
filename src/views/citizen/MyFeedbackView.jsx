import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, CheckCircle, Clock, ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { issuesAPI } from '../../api/issues';
import { pitchesAPI } from '../../api/pitches';
import { StatusBadge } from '../../components/common/StatusBadge';

export const MyFeedbackView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        // Fetch user's issues and verified feedbacks
        const res = await issuesAPI.getIssues({ mine: 1 });
        const myIssues = Array.isArray(res) ? res : res.results || [];
        
        // Filter issues with resolution feedback or citizen comments
        const resolvedWithFeedback = myIssues
          .filter((i) => i.resolution_feedback || i.citizen_verified_resolved)
          .map((i) => ({
            id: `issue-${i.id}`,
            issueId: i.id,
            type: 'Issue Verification',
            title: i.title,
            feedback: i.resolution_feedback || (i.citizen_verified_resolved ? 'Verified as resolved' : 'In review'),
            status: i.status,
            date: i.updated_at || i.created_at,
          }));

        setFeedbacks(resolvedWithFeedback);
      } catch (err) {
        console.error('Failed to load feedback records:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
            My Community Feedback
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Reviews, confirmations, and comments you have provided on civic issues and solutions.
          </p>
        </div>
        <button
          onClick={() => navigate('/citizen/dashboard')}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
            Loading your feedback history...
          </div>
        ) : feedbacks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
            <MessageSquare size={36} color="#CBD5E1" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
              No feedback recorded yet
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#94A3B8', maxWidth: '400px', margin: '0 auto' }}>
              When your reported issues are addressed or when you review prototype pitches, your comments will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '6px' }}>
                      {fb.type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      {new Date(fb.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                    {fb.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', background: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                    "{fb.feedback}"
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/citizen/issues/${fb.issueId}`)}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  View Issue <ExternalLink size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
