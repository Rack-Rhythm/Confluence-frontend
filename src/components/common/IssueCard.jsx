import React from 'react';
import { MapPin, Eye, MessageSquare, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { StatusBadge, CategoryPill } from './StatusBadge';
import { getIssueImageUrl, handleImageError } from '../../utils/imageUtils';

export const IssueCard = ({ issue, onView, compact = false }) => {
  if (!issue) return null;

  const imageSrc = getIssueImageUrl(issue);

  // Determine Impact badge
  const isHighImpact = issue.ai_confidence > 0.9 || issue.is_escalated;
  const impactLabel = isHighImpact ? 'high_impact' : 'medium_impact';

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      className="issue-card-hover"
    >
      {/* Photo Container */}
      <div style={{ position: 'relative', height: compact ? '140px' : '180px', overflow: 'hidden' }}>
        <img
          src={imageSrc}
          alt={issue.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => handleImageError(e, issue.category)}
        />

        {/* Impact Tag overlay */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
          <StatusBadge status={impactLabel} />
        </div>

        {/* Status Tag overlay */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
          <StatusBadge status={issue.status} />
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3
          style={{
            fontSize: compact ? '0.95rem' : '1.05rem',
            fontWeight: 700,
            color: '#0F172A',
            marginBottom: '0.4rem',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {issue.title}
        </h3>

        {/* Location */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.775rem',
            color: '#64748B',
            marginBottom: '0.75rem',
          }}
        >
          <MapPin size={13} color="#94A3B8" />
          <span>{issue.address || issue.district ? `${issue.district}${issue.address ? `, ${issue.address}` : ''}` : 'Location specified'}</span>
        </div>

        {/* Description snippet */}
        <p
          style={{
            fontSize: '0.825rem',
            color: '#475569',
            lineHeight: 1.5,
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {issue.description}
        </p>

        {/* Categories / Tags */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <CategoryPill category={issue.category} />
          {issue.district && (
            <span className="category-pill" style={{ background: '#F8FAFC' }}>
              📍 {issue.district}
            </span>
          )}
        </div>

        {/* Bottom meta & Action */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.75rem',
            borderTop: '1px solid #F1F5F9',
            fontSize: '0.75rem',
            color: '#94A3B8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Eye size={13} /> {issue.views_count ?? issue.upvotes_count ?? 12}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MessageSquare size={13} /> {issue.discussions_count ?? issue.comments_count ?? 0}
            </span>
            <span>{timeAgo(issue.created_at)}</span>
          </div>

          {onView && (
            <button
              onClick={() => onView(issue)}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px' }}
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
