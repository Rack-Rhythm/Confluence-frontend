import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  User,
  Users,
  Calendar,
  Layers,
  FileText,
  MessageSquare,
  Sparkles,
  Download,
  Send,
  Star,
  Award,
  AlertTriangle,
  Play,
  RefreshCw,
  UserPlus,
  FileEdit,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { pitchesAPI } from '../../api/pitches';
import { engagementsAPI } from '../../api/engagements';
import { authAPI } from '../../api/auth';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const PitchDetailsView = ({ pitch, onBack, onRefresh }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const targetId = pitch?.id || id;
  const [activeTab, setActiveTab] = useState('overview'); // overview, tech_details, team, documents, comments, evaluations
  const [currentPitch, setCurrentPitch] = useState(pitch || {});
  const [loading, setLoading] = useState(!pitch?.id && !!id);
  const [actionLoading, setActionLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [scoringState, setScoringState] = useState({});
  const [comments, setComments] = useState([]);
  const [existingEngagement, setExistingEngagement] = useState(null);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [sponsorForm, setSponsorForm] = useState({
    engagement_type: 'funding',
    proposal_notes: '',
  });

  // Multi-criteria Evaluation (Issue 30)
  const [evaluations, setEvaluations] = useState([]);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalForm, setEvalForm] = useState({
    technical_feasibility: 15,
    social_impact: 15,
    cost_feasibility: 10,
    scalability: 10,
    sustainability: 8,
    innovation: 8,
    implementation_readiness: 8,
    recommendation: 'select',
    comments: '',
  });

  // Review actions (Issue 27, 28, 29)
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false);
  const [requestChangesText, setRequestChangesText] = useState('');
  const [showAssignMentorModal, setShowAssignMentorModal] = useState(false);
  const [availableMentors, setAvailableMentors] = useState([]);
  const [selectedMentorId, setSelectedMentorId] = useState('');

  // Resubmit revision state for students (Issue 27 & P0 Issue 7/9)
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [resubmitForm, setResubmitForm] = useState({
    title: '',
    public_summary: '',
    confidential_package: '',
    change_summary: '',
    repository_url: '',
    demo_url: '',
    documentation_url: '',
    video_url: '',
  });

  const handleOpenResubmit = () => {
    setResubmitForm({
      title: currentPitch.title || '',
      public_summary: currentPitch.public_summary || currentPitch.summary || currentPitch.proposed_solution || '',
      confidential_package: currentPitch.confidential_package || currentPitch.private_details || '',
      change_summary: '',
      repository_url: currentPitch.repository_url || '',
      demo_url: currentPitch.demo_url || '',
      documentation_url: currentPitch.documentation_url || '',
      video_url: currentPitch.video_url || '',
    });
    setShowResubmitModal(true);
  };

  const handleResubmitPitch = async (e) => {
    e.preventDefault();
    if (!resubmitForm.change_summary.trim()) {
      addToast('Please provide a summary of the revisions made.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await pitchesAPI.resubmitPitch(currentPitch.id, {
        title: resubmitForm.title,
        public_summary: resubmitForm.public_summary,
        confidential_package: resubmitForm.confidential_package || 'Updated confidential specification package.',
        change_summary: resubmitForm.change_summary.trim(),
        repository_url: resubmitForm.repository_url,
        demo_url: resubmitForm.demo_url,
        documentation_url: resubmitForm.documentation_url,
        video_url: resubmitForm.video_url,
      });
      addToast(`Revision v${(currentPitch.version || 1) + 1} submitted successfully!`, 'success');
      setShowResubmitModal(false);
      fetchPitchAndEngagement();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to resubmit pitch:', err);
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to submit revision.';
      addToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchPitchAndEngagement = async () => {
    if (!targetId) return;
    try {
      const data = await pitchesAPI.getPitch(targetId);
      if (data) {
        setCurrentPitch(data);
        if (Array.isArray(data.community_feedback) && data.community_feedback.length > 0) {
          setComments(data.community_feedback.map((fb) => ({
            id: fb.id,
            author: fb.citizen_details?.name || 'Citizen Contributor',
            role: 'Community Feedback',
            text: fb.feedback_text,
            time: fb.created_at ? new Date(fb.created_at).toLocaleDateString() : 'Recent',
            relevance_score: fb.relevance_score,
            mentor_notes: fb.mentor_notes,
            is_shared_with_students: fb.is_shared_with_students,
          })));
        }

        try {
          const evList = await pitchesAPI.getEvaluations(targetId);
          setEvaluations(Array.isArray(evList) ? evList : evList?.results || []);
        } catch (e) {
          console.error('Failed to load evaluations:', e);
        }

        if (user?.role === 'university_coordinator' || user?.role === 'faculty_mentor') {
          try {
            const univId = user?.university_id || user?.university?.id || data.university_id || data.university?.id;
            let rawM = [];
            if (univId) {
              const res = await authAPI.getUniversityMentors(univId);
              rawM = Array.isArray(res) ? res : res?.results || [];
            } else if (user?.is_staff) {
              const mList = await authAPI.getUsers({ role: 'faculty_mentor' });
              rawM = Array.isArray(mList) ? mList : mList?.results || [];
            }
            setAvailableMentors(rawM);
            if (rawM.length > 0 && !selectedMentorId) setSelectedMentorId(rawM[0].id);
          } catch (e) {
            console.error('Failed to load faculty mentors:', e);
          }
        }

        if (user?.role === 'industry_partner') {
          try {
            const engList = await engagementsAPI.getEngagements();
            const allEng = Array.isArray(engList) ? engList : engList.results || [];
            const match = allEng.find((e) => e.pitch === data.id || e.issue === data.issue);
            setExistingEngagement(match || null);
          } catch (e) {
            console.error('Failed to load industry engagements:', e);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load pitch details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetId) {
      if (!pitch?.id) setLoading(true);
      fetchPitchAndEngagement();
    }
  }, [targetId, user?.role]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
        Loading pitch details #{targetId}...
      </div>
    );
  }

  if (!currentPitch || !currentPitch.id) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#64748B' }}>No pitch found.</p>
        <button onClick={() => (onBack ? onBack() : navigate(-1))} className="btn btn-outline" style={{ marginTop: '1rem' }}>
          Back to Pitches
        </button>
      </div>
    );
  }

  const handleReviewAction = async (action, defaultFeedback = '') => {
    setActionLoading(true);
    try {
      if (currentPitch.id) {
        await pitchesAPI.reviewAction(currentPitch.id, {
          action,
          review_feedback: defaultFeedback || (action === 'select_winner'
            ? 'Selected as winning solution by University Review Board.'
            : 'Your proposal was reviewed by the university board and has been withdrawn from this open call.'),
        });
      }
      const newStatus = action === 'select_winner' ? 'selected' : action === 'reject' ? 'rejected' : currentPitch.status;
      setCurrentPitch((prev) => ({ ...prev, status: newStatus }));
      addToast(action === 'select_winner' ? 'Pitch successfully selected as winner!' : 'Pitch rejected.', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to execute review action:', err);
      const errMsg = err.response?.data?.error || err.message || 'Action failed';
      addToast(`Action failed: ${errMsg}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartReview = async () => {
    setActionLoading(true);
    try {
      await pitchesAPI.reviewAction(currentPitch.id, { action: 'start_review' });
      setCurrentPitch((prev) => ({ ...prev, status: 'under_review' }));
      addToast('Solution marked as Under Review!', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to start review.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async (e) => {
    e.preventDefault();
    if (!requestChangesText.trim()) {
      addToast('Please provide feedback explaining requested changes.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await pitchesAPI.reviewAction(currentPitch.id, {
        action: 'request_changes',
        review_feedback: requestChangesText.trim(),
      });
      setCurrentPitch((prev) => ({ ...prev, status: 'changes_requested', review_feedback: requestChangesText }));
      addToast('Changes requested. Student team notified for revision!', 'success');
      setShowRequestChangesModal(false);
      setRequestChangesText('');
      if (onRefresh) onRefresh();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to request changes.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignMentor = async (e) => {
    e.preventDefault();
    if (!selectedMentorId) {
      addToast('Please select a faculty mentor.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const res = await pitchesAPI.reviewAction(currentPitch.id, {
        action: 'assign_mentor',
        mentor_id: parseInt(selectedMentorId, 10),
      });
      const assigned = availableMentors.find((m) => String(m.id) === String(selectedMentorId));
      setCurrentPitch((prev) => ({
        ...prev,
        assigned_mentor: parseInt(selectedMentorId, 10),
        assigned_mentor_details: assigned || prev.assigned_mentor_details,
      }));
      addToast(`Assigned ${assigned?.name || 'Faculty Mentor'} to solution!`, 'success');
      setShowAssignMentorModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to assign mentor.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await pitchesAPI.submitEvaluation(currentPitch.id, {
        technical_feasibility: parseInt(evalForm.technical_feasibility, 10) || 0,
        social_impact: parseInt(evalForm.social_impact, 10) || 0,
        cost_feasibility: parseInt(evalForm.cost_feasibility, 10) || 0,
        scalability: parseInt(evalForm.scalability, 10) || 0,
        sustainability: parseInt(evalForm.sustainability, 10) || 0,
        innovation: parseInt(evalForm.innovation, 10) || 0,
        implementation_readiness: parseInt(evalForm.implementation_readiness, 10) || 0,
        recommendation: evalForm.recommendation,
        comments: evalForm.comments,
      });
      addToast(`Evaluation submitted! Total Score: ${res.total_score}/100`, 'success');
      setShowEvalModal(false);
      const evList = await pitchesAPI.getEvaluations(currentPitch.id);
      setEvaluations(Array.isArray(evList) ? evList : evList?.results || []);
      setCurrentPitch((prev) => ({ ...prev, status: 'under_review' }));
      if (onRefresh) onRefresh();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to submit evaluation.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProposeSponsorship = async (e) => {
    e.preventDefault();
    if (!currentPitch.issue) {
      addToast('Cannot link engagement: issue reference missing', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const org = user?.organization_name || user?.organization_details?.name || 'Tata Steel Foundation & CSR';
      await engagementsAPI.createEngagement({
        issue: currentPitch.issue,
        pitch: currentPitch.id,
        engagement_type: sponsorForm.engagement_type,
        proposal_notes: sponsorForm.proposal_notes || `Corporate CSR Sponsorship proposal from ${org} for pitch #${currentPitch.id}.`,
      });
      addToast('CSR sponsorship proposal submitted successfully!', 'success');
      setShowSponsorModal(false);
      setSponsorForm({ engagement_type: 'funding', proposal_notes: '' });
      fetchPitchAndEngagement();
    } catch (err) {
      console.error('Failed to propose sponsorship:', err);
      const msg = err.response?.data?.detail || err.response?.data?.issue?.[0] || err.message || 'Failed to submit engagement';
      addToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const authorDisplayName = user?.name || user?.email || 'Prof. S. Soren';
    const authorRoleLabel = user?.role ? user.role.replace('_', ' ') : 'University Coordinator';

    try {
      if (currentPitch.id) {
        const res = await pitchesAPI.submitFeedback(currentPitch.id, commentText);
        setComments((prev) => [
          ...prev,
          {
            id: res?.id || Date.now(),
            author: res?.citizen_details?.name || authorDisplayName,
            role: authorRoleLabel,
            text: res?.feedback_text || commentText,
            time: 'Just now',
            relevance_score: res?.relevance_score,
            mentor_notes: res?.mentor_notes,
            is_shared_with_students: res?.is_shared_with_students,
          },
        ]);
      } else {
        setComments((prev) => [
          ...prev,
          {
            id: Date.now(),
            author: authorDisplayName,
            role: authorRoleLabel,
            text: commentText,
            time: 'Just now',
          },
        ]);
      }
      setCommentText('');
      addToast('Feedback comment added to pitch record.', 'success');
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setComments((prev) => [
        ...prev,
        {
          id: Date.now(),
          author: authorDisplayName,
          role: authorRoleLabel,
          text: commentText,
          time: 'Just now',
        },
      ]);
      setCommentText('');
      addToast('Feedback added to record.', 'success');
    }
  };

  const handleScoreFeedback = async (feedbackId) => {
    const s = scoringState[feedbackId] || { score: 8, notes: '', share: true };
    try {
      await pitchesAPI.scoreFeedback(feedbackId, {
        relevance_score: parseInt(s.score, 10) || 8,
        mentor_notes: s.notes || '',
        is_shared_with_students: s.share !== undefined ? s.share : true,
      });
      setComments((prev) =>
        prev.map((c) =>
          c.id === feedbackId
            ? { ...c, relevance_score: parseInt(s.score, 10) || 8, mentor_notes: s.notes, is_shared_with_students: s.share }
            : c
        )
      );
      setScoringState((prev) => ({ ...prev, [feedbackId]: { ...prev[feedbackId], open: false } }));
      addToast('Feedback relevance scored successfully!', 'success');
    } catch (err) {
      console.error('Failed to score feedback:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to score feedback';
      addToast(`Scoring failed: ${errMsg}`, 'error');
    }
  };

  const handleDownloadDeliverable = (docName) => {
    const content = `CONFLUENCE INNOVATION PLATFORM
Verified Intellectual Property & Project Deliverable
------------------------------------------------------
Document: ${docName}
Pitch ID: #${currentPitch.id}
Solution: ${currentPitch.title}
Student Innovators: ${teamName}
University: ${uniName}
SHA-256 Checksum: ${currentPitch.submission_hash || currentPitch.sha256_hash || 'Verified'}
Date Generated: ${new Date().toLocaleDateString()}

Status: Verified by Confluence Technical Review Board
This artifact is cryptographically stamped and licensed under Jharkhand Innovation Council Open Call Guidelines.
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docName.endsWith('.pdf') || docName.endsWith('.xlsx') ? `${docName}.txt` : docName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Downloading ${docName}...`, 'success');
  };

  const title = currentPitch.title || currentPitch.executive_summary || 'Smart Water Monitoring System';
  const authorName = currentPitch.student_team_details?.[0]?.name || currentPitch.student_team_details?.[0]?.email || currentPitch.author?.name || currentPitch.student_name || 'Ananya Verma';
  const uniName = currentPitch.university_details?.name || currentPitch.student_team_details?.[0]?.university_details?.name || 'Birsa Institute of Technology (BIT) Sindri';
  const mentorName = currentPitch.assigned_mentor_details?.name || 'Dr. A. K. Singh (Faculty Mentor)';
  const teamName = currentPitch.team_name || (currentPitch.student_team_details?.length ? `Team ${currentPitch.student_team_details[0]?.name?.split(' ')[0] || 'Innovators'}` : 'Team AquaTech');
  const category = currentPitch.category || 'water';
  const isConfidentialProtected =
    !currentPitch.confidential_package ||
    (typeof currentPitch.confidential_package === 'string' &&
      currentPitch.confidential_package.startsWith('[PROTECTED'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Back button & Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#2563EB',
            fontWeight: 700,
            fontSize: '0.875rem',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Back to Pitches
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Submission #{currentPitch.id ? currentPitch.id.toString().padStart(4, '0') : '0201'}
          </span>
          <StatusBadge status={currentPitch.status || 'shortlisted'} />
        </div>
      </div>

      {/* 2. Pitch Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
            {title}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
            Dual-package intellectual property submitted via Confluence Innovation Pipeline
          </p>
        </div>
      </div>

      {/* Changes Requested Notification Banner (for Students, Citizens & Reviewers) */}
      {currentPitch.status === 'changes_requested' && (
        <div
          style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '1.5px solid #F59E0B',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1, minWidth: '280px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#F59E0B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#92400E', margin: 0 }}>
                  Revisions & Changes Requested
                </h3>
                <span
                  style={{
                    background: '#B45309',
                    color: '#FFFFFF',
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    textTransform: 'uppercase',
                  }}
                >
                  Action Required
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#78350F', margin: 0, lineHeight: 1.5 }}>
                The University Review Board requested technical revisions on this solution proposal:
              </p>
              <div
                style={{
                  marginTop: '0.5rem',
                  background: '#FFFFFF',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '10px',
                  border: '1px solid #FDE68A',
                  color: '#0F172A',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  lineHeight: 1.55,
                  whiteSpace: 'pre-line',
                }}
              >
                "{currentPitch.review_feedback || 'Please refine the technical specification, bill of materials, and verification benchmarks as requested.'}"
              </div>
            </div>
          </div>

          {(user?.role === 'student' || isTeamMember) && (
            <button
              onClick={handleOpenResubmit}
              className="btn btn-primary"
              style={{
                background: '#D97706',
                border: 'none',
                borderRadius: '10px',
                padding: '0.65rem 1.25rem',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 3px 10px rgba(217, 119, 6, 0.3)',
                alignSelf: 'center',
                cursor: 'pointer',
              }}
            >
              <FileEdit size={16} /> Submit Updated Revision (v{(currentPitch.version || 1) + 1})
            </button>
          )}
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '0.5rem',
        }}
      >
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'tech_details', label: 'Technical Details' },
          { id: 'team', label: 'Team' },
          { id: 'documents', label: 'Documents' },
          { id: 'comments', label: `Comments (${comments.length})` },
          { id: 'evaluations', label: `Evaluations (${evaluations.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 0',
              borderBottom: activeTab === tab.id ? '2px solid #2563EB' : '2px solid transparent',
              color: activeTab === tab.id ? '#2563EB' : '#64748B',
              fontWeight: activeTab === tab.id ? 800 : 600,
              fontSize: '0.9rem',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Main Body: Left Content + Right Info Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <>
              {/* Media gallery */}
              <div className="card" style={{ padding: '1rem' }}>
                <img
                  src={currentPitch.photo_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800'}
                  alt="Pitch hardware"
                  style={{ width: '100%', height: '280px', borderRadius: '12px', objectFit: 'cover', marginBottom: '0.75rem' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {[
                    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=200',
                    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200',
                    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200',
                    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200',
                  ].map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Thumbnail"
                      style={{ width: '100%', height: '65px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>

              {/* Problem & Solution text */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
                  Solution Abstract & Impact
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {currentPitch.description ||
                    'A low-cost, solar-powered IoT sensor node capable of real-time monitoring for turbidity, pH, dissolved oxygen, and microbial presence in rural surface water bodies. The system transmits telemetry over LoRaWAN to a decentralized dashboard accessible by Gram Panchayat health workers.'}
                </p>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Expected Societal Outcomes
                </h4>
                <ul style={{ fontSize: '0.85rem', color: '#475569', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                  <li>Early warning mechanism for water-borne pathogen outbreaks in 15+ tribal villages.</li>
                  <li>Real-time automated alerts delivered via SMS and IVR in local dialects.</li>
                  <li>Low-maintenance sensor probes manufactured with localized component sourcing.</li>
                </ul>
              </div>
            </>
          )}

          {/* Tab 2: Technical Details */}
          {activeTab === 'tech_details' && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                  Technical Specification & IP Package
                </h3>
                {isConfidentialProtected ? (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', background: '#FEF2F2', padding: '3px 10px', borderRadius: '999px', border: '1px solid #FCA5A5' }}>
                    🔒 Confidential Dual-Package (Protected)
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '3px 10px', borderRadius: '999px', border: '1px solid #A7F3D0' }}>
                    🔓 Confidential Dual-Package (Unlocked)
                  </span>
                )}
              </div>

              {/* Cryptographic SHA-256 IP Timestamp */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563EB', marginBottom: '4px' }}>
                  🔒 Cryptographic SHA-256 IP Timestamp
                </div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#475569', wordBreak: 'break-all' }}>
                  {currentPitch.submission_hash || currentPitch.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </div>
              </div>

              {/* Confidential IP Package Section */}
              {isConfidentialProtected ? (
                <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309', fontWeight: 800, fontSize: '0.95rem', marginBottom: '6px' }}>
                    <ShieldCheck size={18} /> Dual-Package Confidentiality Protection
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#78350F', lineHeight: 1.5, margin: 0 }}>
                    Proprietary circuit design, hardware BOM costing, and firmware source code are protected under institutional IP bylaws.
                    Full disclosure is unlocked for submitting student innovators, faculty mentors, university review boards, and verified Industry Co-development Partners with an active CSR engagement.
                  </p>
                  {user?.role === 'industry_partner' && (
                    <button
                      onClick={() => setShowSponsorModal(true)}
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '0.85rem' }}
                    >
                      Propose CSR Sponsorship to Unlock IP
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontWeight: 800, fontSize: '0.95rem', marginBottom: '6px' }}>
                    <ShieldCheck size={18} /> Confidential Intellectual Property Package (Unlocked)
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#166534', whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #BBF7D0', marginTop: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {typeof currentPitch.confidential_package === 'object'
                      ? JSON.stringify(currentPitch.confidential_package, null, 2)
                      : (currentPitch.confidential_package || 'Confidential schematics, PCB layout gerbers, and BOM cost breakdown.')}
                  </div>
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>Hardware Stack</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                  ESP32 MCU, LoRa SX1278 transceiver, analog pH probe, optical turbidity sensor, 5W Monocrystalline solar panel with 18650 Li-ion battery pack.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>Firmware & Cloud Backend</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                  FreeRTOS edge firmware, MQTT broker ingestion, Django REST API backend, PostGIS spatial database for contamination heatmaps.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Team */}
          {activeTab === 'team' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                  Student Innovation Team ({teamName})
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 700 }}>
                  🏫 {uniName}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {currentPitch.student_team_details && currentPitch.student_team_details.length > 0 ? (
                  currentPitch.student_team_details.map((member, idx) => (
                    <div key={idx} style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{member.name || member.email}</div>
                      <div style={{ fontSize: '0.775rem', color: '#2563EB', fontWeight: 600 }}>{idx === 0 ? 'Lead Innovator' : 'Co-Innovator'}</div>
                      <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '2px' }}>{member.email}</div>
                    </div>
                  ))
                ) : (
                  [
                    { name: authorName, role: 'Team Lead & Embedded Hardware', dept: 'Electronics & Comm.' },
                    { name: 'Rohan Das', role: 'Firmware & LoRa Networking', dept: 'Computer Science' },
                    { name: 'Priya Mahato', role: 'UI/UX & Mobile Dashboard', dept: 'Information Technology' },
                    { name: mentorName, role: 'Assigned Mentor', dept: 'Environmental Eng.' },
                  ].map((member, idx) => (
                    <div key={idx} style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{member.name}</div>
                      <div style={{ fontSize: '0.775rem', color: '#2563EB', fontWeight: 600 }}>{member.role}</div>
                      <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '2px' }}>{member.dept}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Documents */}
          {activeTab === 'documents' && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Submitted Deliverables & Schematics
              </h3>
              {[
                { name: 'Circuit_Schematics_v1.pdf', size: '2.4 MB', date: '12 Aug 2024' },
                { name: 'BOM_Component_Costing.xlsx', size: '480 KB', date: '12 Aug 2024' },
                { name: 'Field_Pilot_Report_Kharagpur.pdf', size: '4.1 MB', date: '14 Aug 2024' },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={20} color="#2563EB" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{doc.name}</div>
                      <div style={{ fontSize: '0.725rem', color: '#64748B' }}>{doc.size} • {doc.date}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadDeliverable(doc.name)}
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tab 5: Comments */}
          {activeTab === 'comments' && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Faculty, Mentor & Review Board Notes
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {comments.map((c) => {
                  const isScoringOpen = scoringState[c.id]?.open;
                  const currentScore = scoringState[c.id]?.score ?? (c.relevance_score || 8);
                  const currentNotes = scoringState[c.id]?.notes ?? (c.mentor_notes || '');
                  const currentShare = scoringState[c.id]?.share ?? (c.is_shared_with_students ?? true);

                  return (
                    <div key={c.id} style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0F172A' }}>
                          {c.author} <span style={{ fontSize: '0.725rem', color: '#2563EB', fontWeight: 600 }}>({c.role})</span>
                        </span>
                        <span style={{ fontSize: '0.725rem', color: '#94A3B8' }}>{c.time}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, marginBottom: '0.5rem' }}>{c.text}</p>

                      {/* Score display & Scoring Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #CBD5E1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {c.relevance_score ? (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706', background: '#FEF3C7', padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Star size={12} fill="#D97706" /> Score: {c.relevance_score}/10
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Unscored</span>
                          )}
                          {c.mentor_notes && (
                            <span style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>
                              Notes: {c.mentor_notes}
                            </span>
                          )}
                        </div>

                        {c.id && (
                          <button
                            type="button"
                            onClick={() =>
                              setScoringState((prev) => ({
                                ...prev,
                                [c.id]: {
                                  score: currentScore,
                                  notes: currentNotes,
                                  share: currentShare,
                                  open: !isScoringOpen,
                                },
                              }))
                            }
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#2563EB',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {isScoringOpen ? 'Cancel Scoring' : 'Score / Evaluate Feedback'}
                          </button>
                        )}
                      </div>

                      {/* Expandable Scoring Panel */}
                      {isScoringOpen && (
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #BFDBFE', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E3A8A' }}>
                              Relevance Score (1-10):
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={currentScore}
                                onChange={(e) =>
                                  setScoringState((prev) => ({
                                    ...prev,
                                    [c.id]: { ...prev[c.id], score: e.target.value },
                                  }))
                                }
                                style={{ marginLeft: '6px', width: '50px', padding: '2px 6px', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                              />
                            </label>
                            <label style={{ fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="checkbox"
                                checked={currentShare}
                                onChange={(e) =>
                                  setScoringState((prev) => ({
                                    ...prev,
                                    [c.id]: { ...prev[c.id], share: e.target.checked },
                                  }))
                                }
                              />
                              Share with student team
                            </label>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              type="text"
                              placeholder="Mentor evaluation note..."
                              value={currentNotes}
                              onChange={(e) =>
                                setScoringState((prev) => ({
                                  ...prev,
                                  [c.id]: { ...prev[c.id], notes: e.target.value },
                                }))
                              }
                              className="input-field"
                              style={{ flex: 1, height: '32px', fontSize: '0.8rem' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleScoreFeedback(c.id)}
                              className="btn btn-blue btn-sm"
                            >
                              Save Score
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Add academic feedback or mentor note..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="input-field"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-blue" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Send size={16} /> Post
                </button>
              </form>
            </div>
          )}

          {/* Tab 6: Evaluations (Issue 30) */}
          {activeTab === 'evaluations' && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Solution Multi-Criteria Evaluations
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>
                    Standardized evaluation scorecard across 7 rigorous criteria totaling 100 points.
                  </p>
                </div>
                {(user?.role === 'university_coordinator' || user?.role === 'faculty_mentor') && (
                  <button
                    type="button"
                    onClick={() => setShowEvalModal(true)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', borderRadius: '8px' }}
                  >
                    + Submit Evaluation
                  </button>
                )}
              </div>

              {evaluations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8', fontSize: '0.85rem' }}>
                  No evaluations submitted yet for this solution.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {evaluations.map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                            {ev.reviewer_details?.name || 'Review Board Evaluator'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '0.5rem' }}>
                            {new Date(ev.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span
                            style={{
                              fontSize: '1rem',
                              fontWeight: 800,
                              color: '#2563EB',
                              background: '#EFF6FF',
                              padding: '2px 10px',
                              borderRadius: '8px',
                            }}
                          >
                            Score: {ev.total_score} / 100
                          </span>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '999px',
                              background: ev.recommendation === 'select' ? '#ECFDF5' : ev.recommendation === 'reject' ? '#FEF2F2' : '#FFFBEB',
                              color: ev.recommendation === 'select' ? '#059669' : ev.recommendation === 'reject' ? '#DC2626' : '#D97706',
                            }}
                          >
                            {ev.recommendation?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* 7-Criteria Breakdown Bar Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', background: '#F8FAFC', padding: '0.85rem', borderRadius: '8px' }}>
                        {[
                          { label: 'Technical Feasibility', score: ev.technical_feasibility, max: 20 },
                          { label: 'Social Impact', score: ev.social_impact, max: 20 },
                          { label: 'Cost Feasibility', score: ev.cost_feasibility, max: 15 },
                          { label: 'Scalability', score: ev.scalability, max: 15 },
                          { label: 'Sustainability', score: ev.sustainability, max: 10 },
                          { label: 'Innovation', score: ev.innovation, max: 10 },
                          { label: 'Implementation Readiness', score: ev.implementation_readiness, max: 10 },
                        ].map((crit) => (
                          <div key={crit.label} style={{ fontSize: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', marginBottom: '2px' }}>
                              <span>{crit.label}</span>
                              <strong style={{ color: '#0F172A' }}>{crit.score}/{crit.max}</strong>
                            </div>
                            <div style={{ width: '100%', height: '5px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                              <div style={{ width: `${(crit.score / crit.max) * 100}%`, height: '100%', background: '#3B82F6', borderRadius: '999px' }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {ev.comments && (
                        <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>
                          "{ev.comments}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Info Sidebar & Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Submitter Profile Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                }}
              >
                {authorName.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                  {authorName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Lead, {teamName}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Category:</span>
                <span style={{ fontWeight: 700, color: '#0F172A', textTransform: 'capitalize' }}>{category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Submitted on:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>12 Aug 2024</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Team Size:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>4 Members</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Looking for:</span>
                <span style={{ fontWeight: 700, color: '#2563EB' }}>Mentorship, Funding</span>
              </div>
            </div>
          </div>

          {/* Action Decision Buttons */}
          {/* Action Decision Buttons / Role-Aware Panel */}
          {user?.role === 'industry_partner' ? (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                Corporate CSR & Co-Development
              </h4>

              {existingEngagement ? (
                <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>
                      {existingEngagement.engagement_type?.replace('_', ' ')}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      color: existingEngagement.status === 'active' || existingEngagement.status === 'accepted' ? '#059669' : '#D97706',
                      background: existingEngagement.status === 'active' || existingEngagement.status === 'accepted' ? '#ECFDF5' : '#FEF3C7',
                    }}>
                      ● {existingEngagement.status?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                    {user?.organization_name || user?.organization_details?.name || 'Tata Steel Foundation & CSR'}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                    {existingEngagement.proposal_notes || 'Active industry CSR partnership on this innovation track.'}
                  </p>
                  {(existingEngagement.status === 'active' || existingEngagement.status === 'accepted') && (
                    <button
                      onClick={() => navigate('/industry/projects')}
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: '0.5rem' }}
                    >
                      View in Co-Development Projects
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '0.825rem', color: '#64748B', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                    Support this technical solution with CSR grant funding, prototyping laboratory access, or technology transfer.
                  </p>
                  <button
                    onClick={() => setShowSponsorModal(true)}
                    className="btn btn-primary"
                    style={{ width: '100%', borderRadius: '10px' }}
                  >
                    Propose CSR Sponsorship
                  </button>
                </div>
              )}
            </div>
          ) : (user?.role === 'university_coordinator' || user?.role === 'faculty_mentor') ? (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.2rem' }}>
                  University Review Actions
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                  Review and progress this solution through institutional milestones.
                </p>
              </div>

              {/* Status Banner */}
              <div style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: currentPitch.status === 'selected' ? '#ECFDF5' : currentPitch.status === 'rejected' ? '#FEF2F2' : currentPitch.status === 'changes_requested' ? '#FFFBEB' : '#F1F5F9',
                border: `1px solid ${currentPitch.status === 'selected' ? '#A7F3D0' : currentPitch.status === 'rejected' ? '#FECACA' : currentPitch.status === 'changes_requested' ? '#FDE68A' : '#E2E8F0'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Status:</span>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: currentPitch.status === 'selected' ? '#059669' : currentPitch.status === 'rejected' ? '#DC2626' : currentPitch.status === 'changes_requested' ? '#D97706' : '#2563EB'
                }}>
                  {currentPitch.status?.replace('_', ' ')}
                </span>
              </div>

              {/* Start Review (if submitted/resubmitted) */}
              {['submitted', 'resubmitted'].includes(currentPitch.status) && (
                <button
                  onClick={handleStartReview}
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Play size={15} /> Start Review
                </button>
              )}

              {/* Score Evaluation */}
              <button
                onClick={() => setShowEvalModal(true)}
                disabled={actionLoading}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  fontWeight: 700
                }}
              >
                <Award size={15} color="#F59E0B" /> Score Evaluation (/100)
              </button>

              {/* Request Changes */}
              <button
                onClick={() => setShowRequestChangesModal(true)}
                disabled={actionLoading || currentPitch.status === 'selected' || currentPitch.status === 'rejected'}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  borderColor: '#F59E0B',
                  color: '#D97706',
                  fontWeight: 700
                }}
              >
                <FileEdit size={15} /> Request Changes
              </button>

              {/* University Coordinator restricted actions */}
              {(user?.role === 'university_coordinator' || user?.is_staff) && (
                <>
                  <div style={{ height: '1px', background: '#E2E8F0', margin: '0.25rem 0' }} />

                  {/* Assign Faculty Mentor */}
                  <button
                    onClick={() => setShowAssignMentorModal(true)}
                    disabled={actionLoading}
                    className="btn btn-outline"
                    style={{
                      width: '100%',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <UserPlus size={15} /> {currentPitch.assigned_mentor ? 'Reassign Mentor' : 'Assign Faculty Mentor'}
                  </button>

                  {/* Select as Winner */}
                  <button
                    onClick={() => handleReviewAction('select_winner')}
                    disabled={actionLoading || currentPitch.status === 'selected'}
                    className="btn btn-blue"
                    style={{
                      width: '100%',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      background: '#10B981',
                      borderColor: '#10B981',
                      color: '#FFFFFF'
                    }}
                  >
                    <CheckCircle2 size={15} /> {currentPitch.status === 'selected' ? '✓ Selected Winner' : 'Select as Winner'}
                  </button>

                  {/* Reject */}
                  <button
                    onClick={() => handleReviewAction('reject')}
                    disabled={actionLoading || currentPitch.status === 'rejected'}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '10px',
                      border: '1px solid #FCA5A5',
                      background: '#FEF2F2',
                      color: '#DC2626',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: currentPitch.status === 'rejected' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <XCircle size={15} /> {currentPitch.status === 'rejected' ? 'Rejected' : 'Reject Proposal'}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <Clock size={16} color="#3B82F6" /> Pitch Review Status
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Status:</span>
                <StatusBadge status={currentPitch.status} />
              </div>
              
              {currentPitch.status === 'changes_requested' ? (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#B45309', fontWeight: 700, fontSize: '0.825rem' }}>
                    <AlertTriangle size={15} /> Revision Requested by Evaluators
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#92400E', margin: 0, lineHeight: 1.5, background: '#FEF3C7', padding: '0.5rem 0.65rem', borderRadius: '6px' }}>
                    {currentPitch.review_feedback || 'Please update your pitch details and submit a new revision.'}
                  </p>
                  {(user?.role === 'student' || user?.role === 'citizen' || user?.id === currentPitch.author_id || user?.id === currentPitch.user?.id) && (
                    <button
                      onClick={handleOpenResubmit}
                      className="btn btn-primary"
                      style={{
                        background: '#D97706',
                        borderColor: '#D97706',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.825rem',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        marginTop: '0.25rem',
                        width: '100%',
                      }}
                    >
                      <Sparkles size={15} /> Submit Updated Revision
                    </button>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: '0.825rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  Under review by university coordinators and faculty evaluation committees.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sponsor Modal */}
      {showSponsorModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              background: '#FFFFFF',
              borderRadius: '16px',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
              Propose Corporate CSR Sponsorship
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Pitch #{currentPitch.id}: {title}
            </p>

            <form onSubmit={handleProposeSponsorship} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Engagement Type
                </label>
                <select
                  value={sponsorForm.engagement_type}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, engagement_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="funding">CSR Grant / Direct Funding</option>
                  <option value="mentorship">Industrial Mentorship & Advisory</option>
                  <option value="prototyping">Prototyping Lab & Testing Facility</option>
                  <option value="technology_transfer">Technology Transfer & Licensing</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Sponsorship Details & Deliverables
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Details of grant commitment, target testing sites, equipment provision..."
                  value={sponsorForm.proposal_notes}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, proposal_notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowSponsorModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary"
                >
                  {actionLoading ? 'Submitting...' : 'Submit CSR Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evaluation Scorecard Modal (Issue 30) */}
      {showEvalModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Multi-Criteria Evaluation Scorecard
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
                  Institutional assessment across 7 standardized criteria (Total 100 points).
                </p>
              </div>
              <div style={{
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                textAlign: 'right'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1E40AF', display: 'block' }}>TOTAL SCORE</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1D4ED8' }}>
                  {(parseInt(evalForm.technical_feasibility, 10) || 0) +
                    (parseInt(evalForm.social_impact, 10) || 0) +
                    (parseInt(evalForm.cost_feasibility, 10) || 0) +
                    (parseInt(evalForm.scalability, 10) || 0) +
                    (parseInt(evalForm.sustainability, 10) || 0) +
                    (parseInt(evalForm.innovation, 10) || 0) +
                    (parseInt(evalForm.implementation_readiness, 10) || 0)}
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}> / 100</span>
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitEvaluation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    <span>Technical Feasibility</span>
                    <span style={{ color: '#2563EB', fontWeight: 700 }}>{evalForm.technical_feasibility} / 20</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={evalForm.technical_feasibility}
                    onChange={(e) => setEvalForm({ ...evalForm, technical_feasibility: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', accentColor: '#2563EB' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    <span>Social Impact</span>
                    <span style={{ color: '#2563EB', fontWeight: 700 }}>{evalForm.social_impact} / 20</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={evalForm.social_impact}
                    onChange={(e) => setEvalForm({ ...evalForm, social_impact: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', accentColor: '#2563EB' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    <span>Cost Feasibility</span>
                    <span style={{ color: '#2563EB', fontWeight: 700 }}>{evalForm.cost_feasibility} / 15</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={evalForm.cost_feasibility}
                    onChange={(e) => setEvalForm({ ...evalForm, cost_feasibility: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', accentColor: '#2563EB' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    <span>Scalability</span>
                    <span style={{ color: '#2563EB', fontWeight: 700 }}>{evalForm.scalability} / 15</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={evalForm.scalability}
                    onChange={(e) => setEvalForm({ ...evalForm, scalability: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', accentColor: '#2563EB' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    <span>Sustainability</span>
                    <span style={{ color: '#2563EB', fontWeight: 700 }}>{evalForm.sustainability} / 10</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={evalForm.sustainability}
                    onChange={(e) => setEvalForm({ ...evalForm, sustainability: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', accentColor: '#2563EB' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    <span>Innovation & Novelty</span>
                    <span style={{ color: '#2563EB', fontWeight: 700 }}>{evalForm.innovation} / 10</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={evalForm.innovation}
                    onChange={(e) => setEvalForm({ ...evalForm, innovation: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', accentColor: '#2563EB' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  <span>Implementation Readiness</span>
                  <span style={{ color: '#2563EB', fontWeight: 700 }}>{evalForm.implementation_readiness} / 10</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={evalForm.implementation_readiness}
                  onChange={(e) => setEvalForm({ ...evalForm, implementation_readiness: parseInt(e.target.value, 10) })}
                  style={{ width: '100%', accentColor: '#2563EB' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Formal Recommendation
                </label>
                <select
                  value={evalForm.recommendation}
                  onChange={(e) => setEvalForm({ ...evalForm, recommendation: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                    background: '#FFFFFF',
                  }}
                >
                  <option value="select">Recommend for Selection / Grant</option>
                  <option value="revise">Request Revisions & Improvements</option>
                  <option value="reject">Recommend Rejection</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Evaluator Feedback & Qualitative Notes
                </label>
                <textarea
                  required
                  rows="3"
                  value={evalForm.comments}
                  onChange={(e) => setEvalForm({ ...evalForm, comments: e.target.value })}
                  placeholder="Provide technical rationale, strengths, vulnerabilities, or required milestone conditions..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEvalModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary"
                >
                  {actionLoading ? 'Saving Scorecard...' : 'Submit Evaluation Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Changes Modal (Issue 27) */}
      {showRequestChangesModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              borderRadius: '16px',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
              Request Changes / Revisions
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Specify the revisions required. The student team will receive this feedback and can submit an updated pitch revision.
            </p>

            <form onSubmit={handleRequestChanges} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Revision Requirements & Feedback
                </label>
                <textarea
                  required
                  rows="4"
                  value={requestChangesText}
                  onChange={(e) => setRequestChangesText(e.target.value)}
                  placeholder="e.g. Please refine the bill of materials, clarify solar battery storage capacity, and add a risk mitigation plan."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRequestChangesModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{ background: '#D97706', borderColor: '#D97706' }}
                >
                  {actionLoading ? 'Submitting...' : 'Send Revision Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Mentor Modal (Issue 29) */}
      {showAssignMentorModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '2rem',
              borderRadius: '16px',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
              Assign Faculty Mentor
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Assign an accredited faculty mentor from this institution to guide the student team and evaluate deliverables.
            </p>

            <form onSubmit={handleAssignMentor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Select Faculty Mentor
                </label>
                {availableMentors.length === 0 ? (
                  <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', color: '#64748B' }}>
                    No faculty mentors found for this institution. Ensure mentors are registered with the faculty mentor role.
                  </div>
                ) : (
                  <select
                    value={selectedMentorId}
                    onChange={(e) => setSelectedMentorId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.875rem',
                      background: '#FFFFFF',
                    }}
                  >
                    <option value="">-- Choose a Faculty Mentor --</option>
                    {availableMentors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.username || `User #${m.id}`} ({m.email || m.department || 'Faculty Mentor'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAssignMentorModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !selectedMentorId}
                  className="btn btn-primary"
                >
                  {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resubmit Pitch Revision Modal */}
      {showResubmitModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <div style={{ background: '#FEF3C7', padding: '6px', borderRadius: '8px', color: '#D97706' }}>
                <Sparkles size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Submit Pitch Revision (v{(currentPitch.version || 1) + 1})
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Address evaluator feedback and submit updated technical materials. A new version record will be created.
            </p>

            {currentPitch.review_feedback && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.825rem', color: '#92400E' }}>
                <strong>Requested Changes:</strong> {currentPitch.review_feedback}
              </div>
            )}

            <form onSubmit={handleResubmitPitch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Summary of Changes Made <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <textarea
                  required
                  rows="3"
                  value={resubmitForm.change_summary}
                  onChange={(e) => setResubmitForm({ ...resubmitForm, change_summary: e.target.value })}
                  placeholder="Explain how you addressed the review board's feedback (e.g. Added solar storage battery specs and refined prototype budget)..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Pitch Title
                </label>
                <input
                  type="text"
                  value={resubmitForm.title}
                  onChange={(e) => setResubmitForm({ ...resubmitForm, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Public Summary & Concept
                </label>
                <textarea
                  rows="3"
                  value={resubmitForm.public_summary}
                  onChange={(e) => setResubmitForm({ ...resubmitForm, public_summary: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Confidential Technical Package & Specs <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <textarea
                  required
                  rows="4"
                  value={resubmitForm.confidential_package}
                  onChange={(e) => setResubmitForm({ ...resubmitForm, confidential_package: e.target.value })}
                  placeholder="Detailed architectural blueprints, bill of materials, algorithms, firmware details..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Repository URL
                  </label>
                  <input
                    type="url"
                    value={resubmitForm.repository_url}
                    onChange={(e) => setResubmitForm({ ...resubmitForm, repository_url: e.target.value })}
                    placeholder="https://github.com/..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Live Demo / Simulation URL
                  </label>
                  <input
                    type="url"
                    value={resubmitForm.demo_url}
                    onChange={(e) => setResubmitForm({ ...resubmitForm, demo_url: e.target.value })}
                    placeholder="https://demo..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowResubmitModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{ background: '#D97706', borderColor: '#D97706' }}
                >
                  {actionLoading ? 'Submitting Revision...' : 'Submit Pitch Revision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
