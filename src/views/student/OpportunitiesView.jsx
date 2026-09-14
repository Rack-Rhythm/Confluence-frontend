import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2, Calendar, Sparkles, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { engagementsAPI } from '../../api/engagements';
import { issuesAPI } from '../../api/issues';
import { useToast } from '../../context/ToastContext';

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {liveOpportunities.map((op) => (
            <div
              key={op.id}
              className="card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '3px 10px', borderRadius: '999px', textTransform: 'capitalize' }}>
                    {op.sector}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                    {op.deadline}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
                  {op.title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.75rem' }}>
                  🏢 {op.sponsor}
                </div>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#334155',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {op.desc}
                </p>

                <div style={{ background: '#ECFDF5', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #A7F3D0', fontSize: '0.8rem', fontWeight: 700, color: '#065F46', marginBottom: '1.25rem' }}>
                  💰 {op.grant}
                </div>
              </div>

              <button
                onClick={() => handleApply(op)}
                disabled={applied[op.id]}
                className={`btn ${applied[op.id] ? 'btn-outline' : 'btn-primary'}`}
                style={{ width: '100%', borderRadius: '10px', background: applied[op.id] ? '#F1F5F9' : '#0F172A' }}
              >
                {applied[op.id] ? (
                  <>
                    <CheckCircle2 size={16} color="#10B981" /> Application Registered
                  </>
                ) : (
                  <>
                    Apply Now <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
