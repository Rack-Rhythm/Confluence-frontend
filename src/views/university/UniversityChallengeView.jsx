import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Layers,
  FileText,
  UserCheck,
  Megaphone,
  Lightbulb,
  Award,
  Clock,
  MessageSquare,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  Plus,
  BookmarkCheck,
  MapPin,
  Calendar,
  Building2,
  ChevronRight,
  ShieldCheck,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { issuesAPI } from '../../api/issues';
import { pitchesAPI } from '../../api/pitches';
import { authAPI } from '../../api/auth';
import { StatusBadge, CategoryPill } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getIssueImageUrl, handleImageError } from '../../utils/imageUtils';

export const UniversityChallengeView = ({ issueId, onBack, onSelectPitch }) => {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const targetId = issueId || params.id;

  const [activeTab, setActiveTab] = useState('overview');
  const [issue, setIssue] = useState(null);
  const [nominations, setNominations] = useState([]);
  const [openCall, setOpenCall] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [activityEvents, setActivityEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & form states
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showOpenCallModal, setShowOpenCallModal] = useState(false);
  const [openCallForm, setOpenCallForm] = useState({
    title: '',
    description: '',
    closing_date: '',
    funding: '',
    eligibility: 'Open to all enrolled students',
    required_skills: '',
    max_teams: 5,
  });
  const [submittingOpenCall, setSubmittingOpenCall] = useState(false);
  const [adopting, setAdopting] = useState(false);

  const fetchChallengeData = async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const [issRes, nomRes, ocRes, solRes, discRes, actRes] = await Promise.allSettled([
        issuesAPI.getIssue(targetId),
        issuesAPI.getNominations(),
        issuesAPI.getOpenCalls({ issue: targetId }),
        pitchesAPI.getPitches({ issue: targetId }),
        issuesAPI.getDiscussions(targetId),
        issuesAPI.getActivityTimeline(targetId),
      ]);

      if (issRes.status === 'fulfilled') {
        setIssue(issRes.value);
        if (!openCallForm.title && issRes.value.title) {
          setOpenCallForm((prev) => ({
            ...prev,
            title: `Open Call: ${issRes.value.title}`,
            description: issRes.value.description || '',
          }));
        }
      }

      if (nomRes.status === 'fulfilled') {
        const rawN = Array.isArray(nomRes.value) ? nomRes.value : nomRes.value.results || [];
        setNominations(rawN.filter((n) => String(n.issue || n.issue_id) === String(targetId)));
      }

      if (ocRes.status === 'fulfilled') {
        const rawO = Array.isArray(ocRes.value) ? ocRes.value : ocRes.value.results || [];
        setOpenCall(rawO.length > 0 ? rawO[0] : null);
      }

      if (solRes.status === 'fulfilled') {
        const rawS = Array.isArray(solRes.value) ? solRes.value : solRes.value.results || [];
        setSolutions(rawS);
      }

      if (discRes.status === 'fulfilled') {
        const rawD = Array.isArray(discRes.value) ? discRes.value : discRes.value.results || [];
        setDiscussions(rawD);
      }

      if (actRes.status === 'fulfilled') {
        const rawA = Array.isArray(actRes.value) ? actRes.value : actRes.value.results || [];
        setActivityEvents(rawA);
      }
    } catch (err) {
      console.error('Failed to load challenge repository data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengeData();
  }, [targetId]);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/university/challenges');
  };

  const handleAdopt = async () => {
    if (!issue) return;
    setAdopting(true);
    try {
      await issuesAPI.adoptIssue(issue.id);
      showToast('Challenge adopted by your university!', 'success');
      fetchChallengeData();
    } catch (err) {
      console.error('Failed to adopt challenge:', err);
      const msg = err.response?.data?.error || 'Failed to adopt challenge.';
      showToast(msg, 'error');
    } finally {
      setAdopting(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await issuesAPI.postDiscussion(targetId, newComment.trim());
      setNewComment('');
      showToast('Comment posted to challenge discussion thread!', 'success');
      const updated = await issuesAPI.getDiscussions(targetId);
      setDiscussions(Array.isArray(updated) ? updated : updated.results || []);
    } catch (err) {
      console.error('Failed to post discussion:', err);
      showToast('Failed to post comment.', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCreateOpenCall = async (e) => {
    e.preventDefault();
    if (!openCallForm.title || !openCallForm.closing_date) {
      showToast('Title and closing date are required.', 'error');
      return;
    }
    setSubmittingOpenCall(true);
    try {
      await issuesAPI.createOpenCall({
        issue: issue.id,
        title: openCallForm.title,
        description: openCallForm.description,
        closing_date: openCallForm.closing_date,
        funding: openCallForm.funding,
        eligibility: openCallForm.eligibility,
        required_skills: openCallForm.required_skills,
        max_teams: parseInt(openCallForm.max_teams, 10) || 5,
      });
      showToast('Open call launched for student solutions!', 'success');
      setShowOpenCallModal(false);
      fetchChallengeData();
    } catch (err) {
      console.error('Failed to create open call:', err);
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to create open call.';
      showToast(msg, 'error');
    } finally {
      setSubmittingOpenCall(false);
    }
  };

  const handleReviewNomination = async (nomId, action) => {
    try {
      await issuesAPI.reviewNomination(nomId, action);
      showToast(`Nomination ${action === 'approve' ? 'approved' : 'rejected'}!`, 'success');
      fetchChallengeData();
    } catch (err) {
      showToast('Failed to update nomination.', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
        Loading Challenge Repository #{targetId}...
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
          Challenge Repository Not Found
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
          The requested challenge could not be loaded.
        </p>
        <button onClick={handleBack} className="btn btn-primary" style={{ borderRadius: '8px' }}>
          Return to Challenges
        </button>
      </div>
    );
  }

  const isAdopted = ['adopted', 'assigned', 'deployed', 'awaiting_verification', 'resolved'].includes(issue.status);
  const maintainingUni = issue.adoption_details?.university_name || issue.university_name || (isAdopted ? user?.university_details?.name || 'Maintaining University' : null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'nominations', label: 'Nominations', icon: UserCheck, count: nominations.length },
    { id: 'open_call', label: 'Open Call', icon: Megaphone, count: openCall ? 1 : 0 },
    { id: 'solutions', label: 'Solutions', icon: Lightbulb, count: solutions.length },
    { id: 'review', label: 'Review', icon: Award },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare, count: discussions.length },
    { id: 'activity', label: 'Activity', icon: Activity, count: activityEvents.length },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header & Navigation breadcrumb */}
      <div>
        <button
          onClick={handleBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#2563EB',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '0.75rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Challenges
        </button>

        {/* Repository Title Banner */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '1.5rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  background: '#F1F5F9',
                  color: '#475569',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                CH-{String(issue.id).padStart(5, '0')}
              </span>
              <StatusBadge status={issue.status} />
              {issue.category && <CategoryPill category={issue.category} />}
              {maintainingUni && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: '#ECFDF5',
                    color: '#059669',
                    padding: '3px 9px',
                    borderRadius: '999px',
                  }}
                >
                  <Building2 size={12} /> Maintainer: {maintainingUni}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem', lineHeight: 1.3 }}>
              {issue.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748B' }}>
              {issue.district && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="#64748B" /> {issue.district}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} color="#64748B" /> Reported {new Date(issue.created_at).toLocaleDateString()}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lightbulb size={14} color="#64748B" /> {solutions.length} Solutions Submitted
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!isAdopted && (
              <button
                type="button"
                onClick={handleAdopt}
                disabled={adopting}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
              >
                <BookmarkCheck size={16} />
                {adopting ? 'Adopting...' : 'Adopt Challenge'}
              </button>
            )}

            {isAdopted && !openCall && (
              <button
                type="button"
                onClick={() => setShowOpenCallModal(true)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
              >
                <Megaphone size={16} /> Launch Open Call
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Repository Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #E2E8F0',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        {tabs.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.65rem 1rem',
                fontSize: '0.85rem',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#2563EB' : '#64748B',
                border: 'none',
                background: isActive ? '#EFF6FF' : 'transparent',
                borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <IconComp size={16} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '999px',
                    background: isActive ? '#BFDBFE' : '#F1F5F9',
                    color: isActive ? '#1D4ED8' : '#64748B',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: OVERVIEW (README) */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Reported Photographic Evidence Card */}
            <div
              className="card"
              style={{
                background: '#FFFFFF',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563EB',
                    }}
                  >
                    <Camera size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Reported Photographic Evidence
                    </h3>
                    <div style={{ fontSize: '0.725rem', color: '#64748B' }}>
                      Primary visual record submitted for this problem
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    color: '#2563EB',
                    background: '#EFF6FF',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ImageIcon size={13} />
                  {issue.photo ? 'Uploaded Photo File' : issue.photo_url ? 'Reported Photo Link' : 'Category Reference'}
                </span>
              </div>

              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '340px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                }}
              >
                <img
                  src={getIssueImageUrl(issue)}
                  alt={issue.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                  }}
                  onError={(e) => handleImageError(e, issue.category)}
                />
              </div>
            </div>

            {/* Problem Statement Card */}
            <div className="card" style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
                Problem Statement (README)
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {issue.description}
              </p>
            </div>

            {/* Expected Outcome */}
            {issue.expected_outcome && (
              <div className="card" style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                  🎯 Expected Outcome
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                  {issue.expected_outcome}
                </p>
              </div>
            )}

            {/* Acceptance Criteria */}
            {issue.acceptance_criteria && (
              <div className="card" style={{ background: '#F0FDF4', padding: '1.5rem', borderRadius: '14px', border: '1px solid #BBF7D0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#166534', marginBottom: '0.5rem' }}>
                  ✅ Requirements & Acceptance Criteria
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#14532D', lineHeight: 1.5 }}>
                  {issue.acceptance_criteria}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Metadata & Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
                Challenge Metadata
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Status</span>
                  <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{issue.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>District</span>
                  <span style={{ fontWeight: 700 }}>{issue.district || 'Unassigned'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Category</span>
                  <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{issue.category?.replace('_', ' ')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Maintainer</span>
                  <span style={{ fontWeight: 700 }}>{maintainingUni || 'None (Open)'}</span>
                </div>
              </div>
            </div>

            {/* Submitter Box */}
            <div className="card" style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                Reporter Details
              </h4>
              <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>
                  {issue.submitted_by_details?.name || 'Citizen Ramesh'}
                </div>
                <div>Citizen Reporter (Verified Citizen)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NOMINATIONS */}
      {activeTab === 'nominations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              Student Nominations ({nominations.length})
            </h3>
          </div>

          {nominations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
              No student nominations recorded for this challenge yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {nominations.map((nom) => (
                <div
                  key={nom.id}
                  className="card"
                  style={{
                    background: '#FFFFFF',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                        {nom.student_name || nom.student_details?.name || 'Student Candidate'}
                      </span>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: nom.status === 'approved' ? '#ECFDF5' : nom.status === 'rejected' ? '#FEF2F2' : '#FFFBEB',
                          color: nom.status === 'approved' ? '#059669' : nom.status === 'rejected' ? '#DC2626' : '#D97706',
                        }}
                      >
                        {nom.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '2px 0 0 0' }}>
                      Rationale: {nom.rationale || 'Self-nominated for challenge resolution.'}
                    </p>
                  </div>

                  {nom.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleReviewNomination(nom.id, 'approve')}
                        className="btn btn-primary"
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '8px' }}
                      >
                        Approve Candidate
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReviewNomination(nom.id, 'reject')}
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '8px', color: '#DC2626' }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OPEN CALL */}
      {activeTab === 'open_call' && (
        <div>
          {openCall ? (
            <div className="card" style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
                    Active Open Call
                  </span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem' }}>
                    {openCall.title}
                  </h3>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                  Closes: {new Date(openCall.closing_date).toLocaleDateString()}
                </span>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {openCall.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Eligibility</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{openCall.eligibility || 'Open to all students'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Funding / Grants</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{openCall.funding || 'Institutional Incubation Support'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Max Teams</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{openCall.max_teams || 5} Teams</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem', background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <Megaphone size={36} color="#94A3B8" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
                No Active Open Call
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '480px', margin: '0 auto 1.25rem auto' }}>
                Launch an open call to invite student teams to submit competing engineering and technology solutions for this challenge.
              </p>
              <button
                type="button"
                onClick={() => setShowOpenCallModal(true)}
                className="btn btn-primary"
                style={{ borderRadius: '10px' }}
              >
                Launch Open Call
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SOLUTIONS */}
      {activeTab === 'solutions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              Submitted Solutions ({solutions.length})
            </h3>
          </div>

          {solutions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
              No student solutions have been submitted for this challenge yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {solutions.map((sol) => (
                <div
                  key={sol.id}
                  className="card"
                  style={{
                    background: '#FFFFFF',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                        {sol.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 800,
                          background: '#EFF6FF',
                          color: '#2563EB',
                          padding: '1px 6px',
                          borderRadius: '6px',
                        }}
                      >
                        v{sol.version || 1}
                      </span>
                      <StatusBadge status={sol.status} />
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
                      {sol.public_summary || 'Student engineering proposal.'}
                    </p>

                    {/* Repository and Demo Links */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', fontWeight: 600 }}>
                      {sol.repository_url && (
                        <a href={sol.repository_url} target="_blank" rel="noreferrer" style={{ color: '#2563EB', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <ExternalLink size={12} /> GitHub Repo
                        </a>
                      )}
                      {sol.demo_url && (
                        <a href={sol.demo_url} target="_blank" rel="noreferrer" style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <ExternalLink size={12} /> Live Prototype
                        </a>
                      )}
                      {sol.documentation_url && (
                        <a href={sol.documentation_url} target="_blank" rel="noreferrer" style={{ color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <ExternalLink size={12} /> Docs
                        </a>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectPitch) onSelectPitch(sol);
                      else navigate(`/university/pitches/${sol.id}`);
                    }}
                    className="btn btn-outline"
                    style={{ fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>Inspect & Review</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: REVIEW (Review Board View embedded) */}
      {activeTab === 'review' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
              University Review Board Summary
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Evaluate, compare criteria scores (/100), assign mentors, and select winning proposals directly within this challenge.
            </p>

            {solutions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                No solutions ready for review.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #F1F5F9', textAlign: 'left', color: '#64748B' }}>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Solution</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Version</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Status</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Mentor</th>
                      <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solutions.map((sol) => (
                      <tr key={sol.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#0F172A' }}>
                          {sol.title}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>v{sol.version || 1}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <StatusBadge status={sol.status} />
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: sol.assigned_mentor ? '#059669' : '#94A3B8' }}>
                          {sol.assigned_mentor_details?.name || sol.assigned_mentor?.name || 'Unassigned'}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (onSelectPitch) onSelectPitch(sol);
                              else navigate(`/university/pitches/${sol.id}`);
                            }}
                            className="btn btn-primary"
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '6px' }}
                          >
                            Score & Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: DISCUSSIONS */}
      {activeTab === 'discussions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
              Challenge Discussions & Requirements Q&A
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Communicate with students and citizen reporters to clarify technical constraints and problem requirements.
            </p>

            {/* Comment box */}
            <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Post a technical question, requirement clarification, or answer..."
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                }}
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="btn btn-primary"
                style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Send size={14} /> Send
              </button>
            </form>

            {/* Comments list */}
            {discussions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8', fontSize: '0.85rem' }}>
                No discussion threads yet. Be the first to start the technical conversation!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {discussions.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>
                        {c.author_name || c.author_details?.name || 'Contributor'}
                      </span>
                      <span style={{ fontSize: '0.725rem', color: '#94A3B8' }}>
                        {new Date(c.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, lineHeight: 1.4 }}>
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: ACTIVITY TIMELINE */}
      {activeTab === 'activity' && (
        <div className="card" style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
            Challenge Activity Timeline
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1.25rem' }}>
            Complete cryptographic and chronological audit log of all events for this challenge repository.
          </p>

          {activityEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8', fontSize: '0.85rem' }}>
              No audit events logged yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {activityEvents.map((evt, idx) => (
                <div key={evt.id || idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563EB',
                      flexShrink: 0,
                    }}
                  >
                    <Activity size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                      {evt.description}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#94A3B8', marginTop: '2px' }}>
                      {new Date(evt.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Open Call Launch Modal */}
      {showOpenCallModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '1.75rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
              Launch Open Call for Student Proposals
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Publish an open call against this adopted challenge to invite student engineering teams.
            </p>

            <form onSubmit={handleCreateOpenCall} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Open Call Title *
                </label>
                <input
                  type="text"
                  required
                  value={openCallForm.title}
                  onChange={(e) => setOpenCallForm({ ...openCallForm, title: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Description & Scope
                </label>
                <textarea
                  rows={3}
                  value={openCallForm.description}
                  onChange={(e) => setOpenCallForm({ ...openCallForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Closing Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={openCallForm.closing_date}
                    onChange={(e) => setOpenCallForm({ ...openCallForm, closing_date: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Funding / Grants
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹50,000 Lab Grant"
                    value={openCallForm.funding}
                    onChange={(e) => setOpenCallForm({ ...openCallForm, funding: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowOpenCallModal(false)}
                  className="btn btn-outline"
                  style={{ borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOpenCall}
                  className="btn btn-primary"
                  style={{ borderRadius: '8px' }}
                >
                  {submittingOpenCall ? 'Launching...' : 'Publish Open Call'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityChallengeView;
