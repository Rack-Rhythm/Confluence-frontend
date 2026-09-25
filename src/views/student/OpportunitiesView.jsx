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
      title: `${orgName} - ${eng.engagement_type?.toUpperCase() || 'CSR'} Grant`,
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

  const featured = liveOpportunities.length > 0 ? liveOpportunities[0] : null;
  const standardOpportunities = liveOpportunities.slice(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#E6C371' }}>
          Loading live opportunities...
        </div>
      ) : liveOpportunities.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#DFD3B6' }}>
          No active opportunities currently listed.
        </div>
      ) : (
        <>
          {/* GRID SECTION */}
          {standardOpportunities.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid rgba(230,195,113,0.2)', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#E6C371', fontFamily: '"Playfair Display", Georgia, serif', margin: 0 }}>
                  Active Innovation Calls
                </h2>
                <div style={{ fontSize: '0.9rem', color: '#DFD3B6', fontWeight: 600 }}>
                  {standardOpportunities.length} Grants Available
                </div>
              </div>
              
                            <div className="opp-horizontal-gallery">
                {standardOpportunities.map((op, index) => {
                  // Asymmetric masonry layout assignment based on grid image reference
                  let spanClass = 'opp-item-horizontal-standard';
                  
                  if (index % 5 === 0) spanClass = 'opp-item-horizontal-wide';
                  
                  
                  return (
                    <div key={op.id} className={`opp-item-card ${spanClass}`}>
                      <img src={getIssueImageUrl(op)} alt={op.title} onError={(e) => handleImageError(e, op.category)} />
                      <div className="opp-card-overlay"></div>
                      
                      <div className="opp-card-content">
                        <span style={{ fontSize: '0.7rem', color: '#E6C371', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                          {op.sector}
                        </span>
                        <h3 style={{ fontSize: '1.15rem', color: '#E6C371', fontWeight: 800, margin: '0 0 0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                          {op.title}
                        </h3>
                        
                        <div className="opp-hover-reveal">
                          <p style={{ fontSize: '0.85rem', color: '#DFD3B6', opacity: 0.9, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.75rem', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                            {op.desc}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#DFD3B6', fontSize: '0.75rem', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                            <Building2 size={14} /> {op.sponsor}
                          </div>
                          
                          <button onClick={() => handleApply(op)} disabled={applied[op.id]} style={{ background: 'rgba(230,195,113,0.15)', border: '1px solid rgba(230,195,113,0.5)', color: '#E6C371', padding: '0.6rem', borderRadius: '6px', fontWeight: 700, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: applied[op.id] ? 'not-allowed' : 'pointer', opacity: applied[op.id] ? 0.5 : 1, transition: 'all 0.2s', backdropFilter: 'blur(4px)' }} onMouseEnter={(e) => { if(!applied[op.id]) { e.currentTarget.style.background = 'rgba(230,195,113,0.3)' } }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(230,195,113,0.15)' }}>
                            {applied[op.id] ? <><CheckCircle2 size={14}/> Applied</> : <>Apply Now <ArrowRight size={14} /></>}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
