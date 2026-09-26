import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2, Calendar, Sparkles, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { engagementsAPI } from '../../api/engagements';
import { issuesAPI } from '../../api/issues';
import { useToast } from '../../context/ToastContext';
import { getIssueImageUrl, handleImageError } from '../../utils/imageUtils';

export const OpportunitiesView = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [engagements, setEngagements] = useState([]);
  const [adoptedIssues, setAdoptedIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [engRes, issuesRes] = await Promise.allSettled([
          engagementsAPI.getEngagements(),
          issuesAPI.getIssues({ status: 'adopted' }),
        ]);

        if (engRes.status === 'fulfilled') {
          const raw = engRes.value;
          setEngagements(Array.isArray(raw) ? raw : raw.results || []);
        }

        if (issuesRes.status === 'fulfilled') {
          const raw = issuesRes.value;
          setAdoptedIssues(Array.isArray(raw) ? raw : raw.results || []);
        }
      } catch (err) {
        console.error('Failed to load opportunities:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleApply = (item) => {
    if (item.issue_id) {
      showToast(`Redirecting to submit solution pitch for "${item.title}"...`, 'info');
      navigate(`/student/submit-pitch/${item.issue_id}`);
    } else {
      setApplied((prev) => ({ ...prev, [item.id]: true }));
      showToast(`Interest registered for "${item.title}"!`, 'success');
    }
  };

  // Build 100% dynamic opportunities from live backend engagements and adopted challenges
  const liveOpportunities = [];

  engagements.forEach((eng) => {
    const orgName = eng.industry_org_details?.name || eng.industry_org?.name || 'Tata Steel CSR / Industry Sponsor';
    liveOpportunities.push({
      id: `eng-${eng.id}`,
      issue_id: eng.issue,
      title: `${orgName} — ${eng.engagement_type?.toUpperCase() || 'CSR'} Grant`,
      sponsor: orgName,
      deadline: 'Ongoing Review',
      sector: 'Technology & CSR',
      category: eng.category || 'technology',
      photo: eng.issue_details?.photo || eng.issue_photo,
      issue_details: eng.issue_details,
      grant: `Verified ${eng.engagement_type?.toUpperCase() || 'CSR'} Partnership`,
      desc: eng.proposal_notes || 'Industry partner active sponsorship, equipment support, and student mentorship grant.',
    });
  });

  adoptedIssues.forEach((issue) => {
    liveOpportunities.push({
      id: `issue-${issue.id}`,
      issue_id: issue.id,
      title: `${issue.title} (Open Innovation Call)`,
      sponsor: `${issue.district} District Community / Innovation Board`,
      deadline: 'Open Call',
      sector: issue.category?.replace('_', ' ')?.toUpperCase() || 'CIVIC TECH',
      category: issue.category,
      photo: issue.photo || issue.photo_url,
      grant: 'University Adoption & Project Lifecycle Grant',
      desc: issue.expected_outcome || issue.description,
    });
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          Opportunities, CSR Grants & Innovation Calls
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Live industry CSR partnerships, adopted problem open calls, and student prototyping sponsorships.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94A3B8' }}>
          Loading live opportunities from backend...
        </div>
      ) : liveOpportunities.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748B' }}>
          No active opportunities currently listed.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {liveOpportunities.map((op) => (
            <div
              key={op.id}
              className="modern-opp-card"
              onClick={() => handleApply(op)}
            >
              <div className="modern-opp-image-container">
                <img
                  src={getIssueImageUrl(op)}
                  alt={op.title}
                  className="modern-opp-image"
                  onError={(e) => handleImageError(e, op.category)}
                />
                <div className="modern-opp-badge">{op.deadline}</div>
              </div>

              <div className="modern-opp-content">
                <div className="modern-opp-header">
                  <h3 className="modern-opp-title">{op.title}</h3>
                  <p className="modern-opp-sponsor">by {op.sponsor}</p>
                </div>

                <div className="modern-opp-divider"></div>

                <div className="modern-opp-stats">
                  <div className="stat-item">
                    <span className="stat-value">{op.sector.split(' ')[0]}</span>
                    <span className="stat-label">Sector</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{op.category ? (op.category.length > 10 ? op.category.substring(0, 10)+'..' : op.category) : 'Tech'}</span>
                    <span className="stat-label">Category</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">Open</span>
                    <span className="stat-label">Status</span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); handleApply(op); }}
                  disabled={applied[op.id]}
                  className={`modern-opp-btn ${applied[op.id] ? 'applied' : ''}`}
                >
                  {applied[op.id] ? 'Application Registered' : 'Apply Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
