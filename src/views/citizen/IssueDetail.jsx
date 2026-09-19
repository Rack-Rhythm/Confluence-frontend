import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Send,
  Building,
  ShieldCheck,
  ThumbsUp,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { StatusBadge, CategoryPill } from '../../components/common/StatusBadge';
import { issuesAPI } from '../../api/issues';
import { useToast } from '../../context/ToastContext';

export const IssueDetail = ({ issue: initialIssue, onBack, onRefresh, backLabel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentIssue, setCurrentIssue] = useState(initialIssue || null);
  const [loading, setLoading] = useState(!initialIssue && !!id);
  const [resolutionFeedback, setResolutionFeedback] = useState('');
  const [confirmedResolved, setConfirmedResolved] = useState(initialIssue?.citizen_verified_resolved || false);
  const [submittingResolution, setSubmittingResolution] = useState(false);

  // Failed verification state (Issue 37)
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [whatIsStillWrong, setWhatIsStillWrong] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  useEffect(() => {
    if (initialIssue && (!id || String(initialIssue.id) === String(id))) {
      setCurrentIssue(initialIssue);
      setConfirmedResolved(initialIssue.citizen_verified_resolved || false);
      setLoading(false);
      return;
    }
    if (id) {
      setLoading(true);
      issuesAPI
        .getIssue(id)
        .then((data) => {
          setCurrentIssue(data);
          setConfirmedResolved(data.citizen_verified_resolved || false);
        })
        .catch((err) => {
          console.warn('API lookup failed for issue:', id, err);
          setCurrentIssue(null);
        })
        .finally(() => setLoading(false));
    } else if (initialIssue) {
      setCurrentIssue(initialIssue);
      setConfirmedResolved(initialIssue.citizen_verified_resolved || false);
    }
  }, [id, initialIssue]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748B' }}>
        Loading problem details #{id}...
      </div>
    );
  }

  if (!currentIssue) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
          Problem Statement Not Found
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
          The requested societal issue could not be loaded.
        </p>
        <button onClick={() => (onBack ? onBack() : navigate(-1))} className="btn btn-primary" style={{ borderRadius: '8px' }}>
          Go Back
        </button>
      </div>
    );
  }

  const activeIssue = currentIssue;
  const issue = currentIssue;

  const handleConfirmResolution = async (confirmed) => {
    setSubmittingResolution(true);
    try {
      if (confirmed) {
        await issuesAPI.confirmResolution(activeIssue.id, true, {
          feedback: resolutionFeedback,
          reason: resolutionFeedback,
        });
        setConfirmedResolved(true);
        showToast('Resolution confirmed! Challenge marked as resolved.', 'success');
      } else {
        if (!rejectReason.trim() && !whatIsStillWrong.trim()) {
          showToast('Please provide a reason explaining what is still wrong.', 'error');
          setSubmittingResolution(false);
          return;
        }
        await issuesAPI.confirmResolution(activeIssue.id, false, {
          reason: rejectReason || whatIsStillWrong,
          what_is_still_wrong: whatIsStillWrong || rejectReason,
          evidence: evidenceUrl,
          photo_video_url: evidenceUrl,
        });
        setConfirmedResolved(false);
        setShowRejectForm(false);
        showToast('Challenge marked as Not Resolved and reopened for team investigation.', 'info');
      }
      const refreshed = await issuesAPI.getIssue(activeIssue.id);
      setCurrentIssue(refreshed);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to record resolution confirmation.', 'error');
    } finally {
      setSubmittingResolution(false);
    }
  };

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back button */}
      <button
        onClick={handleBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#5B21B6',
          width: 'fit-content',
        }}
      >
        <ArrowLeft size={16} /> {backLabel || 'Back to Issues'}
      </button>

      {/* Main Issue Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
            {issue.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#64748B', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} color="#94A3B8" /> {issue.district}, {issue.address || 'Local area'}
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} color="#94A3B8" /> Reported on {new Date(issue.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <StatusBadge status={issue.status} />
      </div>

      {/* Content Grid: Photos + Quick Info */}
      <div className="grid-responsive-2" style={{ gap: '1.5rem' }}>
        {/* Left Column: Media & Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Main Photo Card */}
          <div className="card" style={{ padding: '0.75rem', overflow: 'hidden' }}>
            <img
              src={
                issue.photo_url ||
                issue.photo ||
                'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800'
              }
              alt="Issue evidence"
              style={{
                width: '100%',
                maxHeight: '340px',
                objectFit: 'cover',
                borderRadius: '12px',
              }}
            />
          </div>

          {/* Detailed Description */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
              Problem Statement
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {issue.description}
            </p>

            {issue.expected_outcome && (
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', marginBottom: '0.35rem' }}>
                  EXPECTED CIVIC OUTCOME
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#0F172A', fontWeight: 500 }}>
                  {issue.expected_outcome}
                </p>
              </div>
            )}
          </div>

          {/* Citizen Verification on Resolution (when resolved or in progress) */}
          {issue.status === 'resolved' && (
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)',
                border: '1px solid #A7F3D0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <ShieldCheck size={22} color="#10B981" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#065F46' }}>
                  Citizen Resolution Verification
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#047857', marginBottom: '1rem' }}>
                The assigned university team marked this issue as deployed. As the submitter, please confirm if the problem is fully resolved.
              </p>

              <textarea
                className="form-textarea"
                placeholder="Share your experience (e.g., The water filter is running great and water is now clean)..."
                value={resolutionFeedback}
                onChange={(e) => setResolutionFeedback(e.target.value)}
                style={{ marginBottom: '1rem', minHeight: '70px' }}
              />

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  disabled={submittingResolution}
                  onClick={() => handleConfirmResolution(true)}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#10B981', borderRadius: '8px' }}
                >
                  <CheckCircle2 size={16} /> Confirm Resolved
                </button>
                <button
                  disabled={submittingResolution}
                  onClick={() => handleConfirmResolution(false)}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: '8px', color: '#EF4444' }}
                >
                  Needs More Work
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Quick Info Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem' }}>
              Quick Info
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              {/* Category */}
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}>
                  CATEGORY
                </div>
                <CategoryPill category={issue.category} />
              </div>

              {/* Location */}
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}>
                  LOCATION
                </div>
                <div style={{ fontWeight: 600, color: '#0F172A' }}>
                  {issue.district}, {issue.address || 'India'}
                </div>
                {issue.latitude && issue.longitude && (
                  <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '2px' }}>
                    GPS: {issue.latitude}, {issue.longitude}
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginBottom: '4px' }}>
                  STATUS
                </div>
                <StatusBadge status={issue.status} />
              </div>

              {/* AI Triage Score */}
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}>
                  AI TRIAGE CONFIDENCE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontWeight: 700 }}>
                  <Sparkles size={14} /> {Math.round((issue.ai_confidence || 0.92) * 100)}% Auto-Categorized
                </div>
              </div>

              {/* Date */}
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}>
                  REPORTED ON
                </div>
                <div style={{ fontWeight: 600, color: '#0F172A' }}>
                  {new Date(issue.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
