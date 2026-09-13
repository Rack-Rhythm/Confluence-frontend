import React, { useState } from 'react';
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
} from 'lucide-react';
import { StatusBadge, CategoryPill } from '../../components/common/StatusBadge';
import { issuesAPI } from '../../api/issues';
import { useToast } from '../../context/ToastContext';

export const IssueDetail = ({ issue, onBack, onRefresh }) => {
  const { showToast } = useToast();
  const [resolutionFeedback, setResolutionFeedback] = useState('');
  const [confirmedResolved, setConfirmedResolved] = useState(issue?.citizen_verified_resolved || false);
  const [submittingResolution, setSubmittingResolution] = useState(false);

  if (!issue) return null;

  const handleConfirmResolution = async (confirmed) => {
    setSubmittingResolution(true);
    try {
      await issuesAPI.confirmResolution(issue.id, confirmed, resolutionFeedback);
      setConfirmedResolved(confirmed);
      showToast(confirmed ? 'Resolution confirmed! Thank you for your feedback.' : 'Feedback recorded.', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast('Failed to record resolution confirmation.', 'error');
    } finally {
      setSubmittingResolution(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back button */}
      <button
        onClick={onBack}
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
        <ArrowLeft size={16} /> Back to My Issues
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
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.85fr', gap: '1.5rem' }}>
        {/* Left Column: Photo & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Main Photo Card */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <img
              src={issue.photo_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800'}
              alt={issue.title}
              style={{ width: '100%', height: '340px', objectFit: 'cover' }}
            />
          </div>

          {/* Description Section */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
              Description
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {issue.description}
            </p>

            {issue.expected_outcome && (
              <>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Expected Outcome & Remediation
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                  {issue.expected_outcome}
                </p>
              </>
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
