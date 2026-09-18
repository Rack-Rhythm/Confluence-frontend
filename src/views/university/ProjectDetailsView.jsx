import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Circle,
  FileText,
  Users,
  Calendar,
  Layers,
  Building2,
  TrendingUp,
  Download,
  Plus,
  X,
  Send,
  AlertTriangle,
  ShieldCheck,
  Award,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { pitchesAPI } from '../../api/pitches';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const ProjectDetailsView = ({ project, onBack }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [currentProject, setCurrentProject] = useState(project || null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, milestones, team, resources, reports
  const [progress, setProgress] = useState(project?.progress || 0);
  const [milestones, setMilestones] = useState([]);

  // Discussions (Issue 40)
  const [discussions, setDiscussions] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);

  // Modals
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateNotes, setUpdateNotes] = useState('');

  // Milestone Evidence Modal (Students)
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [evidenceText, setEvidenceText] = useState('');
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  // Milestone Review Modal (Mentors)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Deployment Gate Modal (Students)
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);
  const [deploymentEvidenceText, setDeploymentEvidenceText] = useState('');
  const [submittingDeployment, setSubmittingDeployment] = useState(false);

  // Deployment Approval (Mentors)
  const [approvingDeployment, setApprovingDeployment] = useState(false);

  const isMentorOrCoordinator =
    user?.role === 'university_coordinator' ||
    user?.role === 'faculty_mentor' ||
    user?.role === 'coordinator' ||
    user?.role === 'mentor' ||
    user?.role === 'gov_admin' ||
    user?.role === 'admin';

  const isStudentOrTeam =
    user?.role === 'student' ||
    !user?.role ||
    user?.role === 'user';

  const loadProjectData = async () => {
    const targetId = project?.id || id;
    if (!targetId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Attempt 1: Fetch from real Project endpoint
      try {
        const projData = await pitchesAPI.getProject(targetId);
        if (projData && projData.id) {
          setCurrentProject(projData);
          const mls = projData.milestones || [];
          setMilestones(mls);

          const approvedCount = mls.filter((m) => (m.status || '').toLowerCase() === 'approved').length;
          const pct = mls.length > 0 ? Math.round((approvedCount / mls.length) * 100) : 35;
          setProgress(pct);
          if (projData.discussions) {
            setDiscussions(projData.discussions);
          } else {
            loadDiscussions(targetId);
          }
          setLoading(false);
          return;
        }
      } catch (err) {
        // Not a direct Project ID, attempt pitch fetch fallback
      }

      // Attempt 2: Fetch via Pitch endpoint
      const pitchData = await pitchesAPI.getPitch(targetId);
      if (pitchData) {
        const lc = pitchData.project_lifecycle || {};
        const fallbackProject = {
          id: pitchData.id,
          pitchId: pitchData.id,
          solution_title: pitchData.title,
          challenge_title: pitchData.issue_details?.title || pitchData.title,
          university_name: pitchData.university_details?.name || 'Partner Technical University',
          mentor_name: pitchData.assigned_mentor_details?.name || 'Assigned Faculty Mentor',
          team_members_detail: pitchData.student_team_details || [],
          project_members: pitchData.student_team_details || [],
          deployment_status: lc.outcome_status ? lc.outcome_status.toLowerCase().replace(' ', '_') : 'prototype',
          progress: 50,
          milestones: lc.milestones || [],
        };
        setCurrentProject(fallbackProject);
        setMilestones(
          (lc.milestones || []).map((m, idx) => ({
            id: m.id || idx + 1,
            order: idx + 1,
            title: m.title || `Milestone ${idx + 1}`,
            status: m.completed || m.status === 'approved' ? 'approved' : 'in_progress',
            due_date: m.due_date || 'Upcoming',
            evidence: m.evidence || '',
          }))
        );
        loadDiscussions(targetId);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDiscussions = async (projId) => {
    const target = projId || currentProject?.id || id;
    if (!target) return;
    try {
      setLoadingDiscussions(true);
      const data = await pitchesAPI.getProjectDiscussions(target);
      if (Array.isArray(data)) {
        setDiscussions(data);
      } else if (data && Array.isArray(data.results)) {
        setDiscussions(data.results);
      }
    } catch (err) {
      console.warn('Could not load discussions:', err);
    } finally {
      setLoadingDiscussions(false);
    }
  };

  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setSubmittingComment(true);
      const targetId = currentProject?.id || id;
      const created = await pitchesAPI.postProjectDiscussion(targetId, newComment.trim());
      setDiscussions((prev) => [created, ...prev]);
      setNewComment('');
      addToast('Discussion comment posted!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to post discussion comment.', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id, project?.id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
        <Clock size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#2563EB' }} />
        <p>Loading project milestones & deployment gate #{project?.id || id}...</p>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#64748B' }}>No project record found.</p>
        <button onClick={() => (onBack ? onBack() : navigate(-1))} className="btn btn-outline" style={{ marginTop: '1rem' }}>
          Back to Projects
        </button>
      </div>
    );
  }

  const title = currentProject.solution_title || currentProject.title || 'Technical Innovation Project';
  const problemTitle = currentProject.challenge_title || currentProject.problem || title;
  const universityName = currentProject.university_name || currentProject.university || 'Partner University';
  const mentorName = currentProject.mentor_name || currentProject.mentor || 'Assigned Faculty Mentor';
  const teamList = currentProject.team_members_detail?.map((t) => t.name).join(', ') || currentProject.team || 'Student Engineering Team';
  const deploymentStatus = currentProject.deployment_status || 'CREATED';

  // --- Handlers ---
  const handleOpenEvidenceModal = (milestone) => {
    setSelectedMilestone(milestone);
    setEvidenceText(milestone.evidence || '');
    setIsEvidenceModalOpen(true);
  };

  const handleSubmitEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceText.trim()) {
      addToast('Please provide evidence links or documentation notes.', 'error');
      return;
    }

    try {
      setSubmittingEvidence(true);
      if (currentProject.id && selectedMilestone.id) {
        await pitchesAPI.updateProjectMilestone(currentProject.id, selectedMilestone.id, {
          evidence: evidenceText,
          status: 'SUBMITTED',
        });
        addToast('Milestone evidence submitted for mentor review!', 'success');
        setIsEvidenceModalOpen(false);
        loadProjectData();
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to submit milestone evidence.', 'error');
    } finally {
      setSubmittingEvidence(false);
    }
  };

  const handleOpenReviewModal = (milestone) => {
    setSelectedMilestone(milestone);
    setReviewFeedback(milestone.reviewer_feedback || '');
    setIsReviewModalOpen(true);
  };

  const handleReviewAction = async (action) => {
    try {
      setSubmittingReview(true);
      await pitchesAPI.reviewProjectMilestone(currentProject.id, selectedMilestone.id, {
        action,
        feedback: reviewFeedback,
      });
      addToast(
        action === 'approve'
          ? 'Milestone approved successfully!'
          : 'Changes requested from student team.',
        'success'
      );
      setIsReviewModalOpen(false);
      loadProjectData();
    } catch (err) {
      console.error(err);
      addToast('Failed to review milestone.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitDeployment = async (e) => {
    e.preventDefault();
    if (!deploymentEvidenceText.trim()) {
      addToast('Please provide deployment evidence (links, GitHub release, live telemetry).', 'error');
      return;
    }

    try {
      setSubmittingDeployment(true);
      await pitchesAPI.submitDeployment(currentProject.id, {
        deployment_evidence: deploymentEvidenceText,
      });
      addToast('Deployment evidence submitted! Awaiting mentor gate verification.', 'success');
      setIsDeploymentModalOpen(false);
      loadProjectData();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.error || 'Failed to submit deployment evidence.', 'error');
    } finally {
      setSubmittingDeployment(false);
    }
  };

  const handleApproveDeployment = async () => {
    if (!window.confirm('Are you sure you want to approve this project for field deployment? This will transition the challenge to citizen verification.')) {
      return;
    }

    try {
      setApprovingDeployment(true);
      await pitchesAPI.approveDeployment(currentProject.id, {
        notes: 'Mentor verified pilot deployment deliverables and field testing requirements.',
      });
      addToast('Deployment verified & approved! Citizen verification initiated.', 'success');
      loadProjectData();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.error || 'Failed to approve deployment gate.', 'error');
    } finally {
      setApprovingDeployment(false);
    }
  };

  const handleDownloadReport = (docName) => {
    const content = `CONFLUENCE INNOVATION PLATFORM
Engineering Milestone & Progress Artifact
------------------------------------------------------
Artifact: ${docName}
Project: ${title}
Challenge: ${problemTitle}
University: ${universityName}
Faculty Mentor: ${mentorName}
Innovation Team: ${teamList}
Deployment Status: ${deploymentStatus}
Date: ${new Date().toLocaleDateString()}

Verified and timestamped through Confluence Lifecycle Pipeline.
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docName.endsWith('.pdf') || docName.endsWith('.csv') ? `${docName}.txt` : docName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Downloading ${docName}...`, 'success');
  };

  const getStatusBadgeStyle = (st) => {
    const s = (st || '').toLowerCase();
    switch (s) {
      case 'approved':
      case 'verified':
      case 'deployed':
      case 'completed':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
      case 'submitted':
      case 'deployment_ready':
      case 'awaiting_citizen_verification':
      case 'awaiting_verification':
        return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
      case 'changes_requested':
      case 'reopened':
      case 'rejected':
      case 'failed':
      case 'overdue':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
      case 'in_progress':
      case 'pilot':
      case 'prototype':
      case 'planning':
      case 'created':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      default:
        return { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' };
    }
  };

  const normDeployStatus = (deploymentStatus || '').toLowerCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header & Back */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          onClick={() => (onBack ? onBack() : navigate(-1))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#2563EB',
            fontWeight: 700,
            fontSize: '0.875rem',
            background: 'transparent',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '999px',
              background: getStatusBadgeStyle(normDeployStatus).bg,
              color: getStatusBadgeStyle(normDeployStatus).text,
              border: `1px solid ${getStatusBadgeStyle(normDeployStatus).border}`,
            }}
          >
            ● State: {normDeployStatus.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* 2. Deployment Gate Action Banner (Issue 35) */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          borderLeft: `4px solid ${
            normDeployStatus === 'verified'
              ? '#10B981'
              : normDeployStatus === 'deployment_ready'
              ? '#F59E0B'
              : '#2563EB'
          }`,
          background: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {normDeployStatus === 'verified' ? (
            <CheckCircle2 size={32} color="#10B981" />
          ) : normDeployStatus === 'awaiting_citizen_verification' || normDeployStatus === 'awaiting_verification' ? (
            <Clock size={32} color="#F59E0B" />
          ) : (
            <ShieldCheck size={32} color="#2563EB" />
          )}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Deployment Verification Gate
            </h4>
            <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '2px 0 0 0' }}>
              {normDeployStatus === 'verified' && 'Citizen verified resolution. Field deployment is fully ratified and resolved.'}
              {(normDeployStatus === 'awaiting_citizen_verification' || normDeployStatus === 'awaiting_verification') && 'Mentor approved deployment. Awaiting final citizen confirmation on the public resolution portal.'}
              {normDeployStatus === 'deployment_ready' && 'Student team submitted deployment evidence. Faculty mentor verification required.'}
              {normDeployStatus === 'reopened' && 'Citizen rejected previous deployment verification. Revisions and re-testing needed.'}
              {['created', 'planning', 'prototype', 'pilot'].includes(normDeployStatus) && 'In active development. Complete milestones and submit evidence to open the deployment gate.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Student action: Submit deployment evidence */}
          {!['deployed', 'awaiting_citizen_verification', 'awaiting_verification', 'verified'].includes(normDeployStatus) && (
            <button
              onClick={() => setIsDeploymentModalOpen(true)}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <Send size={14} /> Submit Deployment Evidence
            </button>
          )}

          {/* Mentor action: Approve deployment gate */}
          {isMentorOrCoordinator && normDeployStatus === 'deployment_ready' && (
            <button
              onClick={handleApproveDeployment}
              disabled={approvingDeployment}
              className="btn btn-blue btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <ShieldCheck size={14} /> {approvingDeployment ? 'Approving...' : 'Approve Deployment Gate'}
            </button>
          )}
        </div>
      </div>

      {/* 3. Title & Subtitle */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          {title}
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '2px' }}>
          Challenge: <strong style={{ color: '#334155' }}>{problemTitle}</strong> • {universityName}
        </p>
      </div>

      {/* 4. Navigation Tabs */}
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
          { id: 'milestones', label: `Milestones (${milestones.length})` },
          { id: 'team', label: 'Team' },
          { id: 'discussions', label: `Discussions (${discussions.length})` },
          { id: 'resources', label: 'Resources' },
          { id: 'reports', label: 'Reports' },
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
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 5. Main Body: Left Content + Right Metadata Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <>
              {/* Media gallery */}
              <div className="card" style={{ padding: '1rem' }}>
                <img
                  src={currentProject.photo_url || 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800'}
                  alt="Project Hardware"
                  style={{ width: '100%', height: '240px', borderRadius: '12px', objectFit: 'cover', marginBottom: '0.75rem' }}
                />
              </div>

              {/* Milestones Preview inside Overview */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    Active Development Milestones
                  </h3>
                  <button
                    onClick={() => setActiveTab('milestones')}
                    style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    View All Milestones ➔
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {milestones.length === 0 ? (
                    <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>No milestones scheduled yet.</p>
                  ) : (
                    milestones.slice(0, 4).map((m) => {
                      const mStatus = (m.status || '').toLowerCase();
                      const badge = getStatusBadgeStyle(mStatus);
                      return (
                        <div
                          key={m.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            background: mStatus === 'approved' ? '#F0FDF4' : '#F8FAFC',
                            borderRadius: '10px',
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {mStatus === 'approved' ? (
                              <CheckCircle2 size={18} color="#10B981" />
                            ) : mStatus === 'submitted' ? (
                              <Clock size={18} color="#D97706" />
                            ) : (
                              <Circle size={18} color="#94A3B8" />
                            )}
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                              {m.title}
                            </span>
                          </div>

                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '999px',
                              background: badge.bg,
                              color: badge.text,
                              textTransform: 'uppercase',
                            }}
                          >
                            {mStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Milestones with Evidence & Review */}
          {activeTab === 'milestones' && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Project Milestones & Verification Workflow
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Student teams submit verification evidence; faculty mentors evaluate and approve.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {milestones.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>No milestones created for this project.</p>
                ) : (
                  milestones.map((m, idx) => {
                    const mStatus = (m.status || '').toLowerCase();
                    const badge = getStatusBadgeStyle(mStatus);
                    return (
                      <div
                        key={m.id}
                        style={{
                          padding: '1.25rem',
                          background: mStatus === 'approved' ? '#F0FDF4' : '#FFFFFF',
                          borderRadius: '12px',
                          border: `1px solid ${badge.border}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {mStatus === 'approved' ? (
                              <CheckCircle2 size={22} color="#10B981" />
                            ) : mStatus === 'submitted' ? (
                              <Clock size={22} color="#D97706" />
                            ) : (
                              <Circle size={22} color="#94A3B8" />
                            )}
                            <div>
                              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                                #{m.order || idx + 1}. {m.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                Target Date: {m.due_date || 'Upcoming'}
                              </div>
                            </div>
                          </div>

                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: '999px',
                              background: badge.bg,
                              color: badge.text,
                            }}
                          >
                            {mStatus.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {m.description && (
                          <p style={{ fontSize: '0.825rem', color: '#475569', margin: '0 0 0 2rem' }}>
                            {m.description}
                          </p>
                        )}

                        {m.evidence && (
                          <div
                            style={{
                              marginLeft: '2rem',
                              padding: '0.65rem 0.85rem',
                              background: '#F8FAFC',
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0',
                              fontSize: '0.8rem',
                              color: '#334155',
                            }}
                          >
                            <strong style={{ color: '#0F172A' }}>Submitted Evidence: </strong>
                            {m.evidence}
                          </div>
                        )}

                        {m.reviewer_feedback && (
                          <div
                            style={{
                              marginLeft: '2rem',
                              padding: '0.65rem 0.85rem',
                              background: '#FEF2F2',
                              borderRadius: '8px',
                              border: '1px solid #FECACA',
                              fontSize: '0.8rem',
                              color: '#991B1B',
                            }}
                          >
                            <strong style={{ color: '#7F1D1D' }}>Mentor Review Feedback: </strong>
                            {m.reviewer_feedback}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                          {/* Student submit evidence button */}
                          {mStatus !== 'approved' && (
                            <button
                              onClick={() => handleOpenEvidenceModal(m)}
                              className="btn btn-outline btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                            >
                              <Send size={12} /> {m.evidence ? 'Update Evidence' : 'Submit Evidence'}
                            </button>
                          )}

                          {/* Mentor review button */}
                          {isMentorOrCoordinator && (
                            <button
                              onClick={() => handleOpenReviewModal(m)}
                              className="btn btn-blue btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                            >
                              <CheckCircle2 size={12} /> Review Milestone
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Team */}
          {activeTab === 'team' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
                Engineering & Faculty Team
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{mentorName}</div>
                  <div style={{ fontSize: '0.775rem', color: '#2563EB', fontWeight: 600 }}>Faculty Mentor</div>
                  <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '2px' }}>{universityName}</div>
                </div>
                {Array.isArray(currentProject.project_members) && currentProject.project_members.length > 0 ? (
                  currentProject.project_members.map((pm, idx) => (
                    <div key={pm.id || idx} style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{pm.user_name || pm.name || pm.user_email || 'Student Innovator'}</div>
                      <div style={{ fontSize: '0.775rem', color: '#059669', fontWeight: 600 }}>{pm.role ? pm.role.replace(/_/g, ' ') : 'Team Member'}</div>
                      <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '2px' }}>{pm.user_email || pm.department || 'Active Contributor'}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{teamList}</div>
                    <div style={{ fontSize: '0.775rem', color: '#059669', fontWeight: 600 }}>Student Engineering Team</div>
                    <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '2px' }}>Primary Innovators</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Resources */}
          {activeTab === 'resources' && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Assigned Lab Resources & Hardware Grants
              </h3>
              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>{universityName} Engineering Lab Bench</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                  Equipment allocated: Testing rigs, compute quota, and telemetry monitoring hardware.
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Reports */}
          {activeTab === 'reports' && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Project Progress & Field Testing Reports
              </h3>
              {[
                { name: 'Milestone_Progress_Summary.pdf', size: '2.4 MB', date: 'Latest' },
                { name: 'Deployment_Telemetry_Evidence.csv', size: '1.2 MB', date: 'Active' },
              ].map((doc, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={20} color="#2563EB" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{doc.name}</div>
                      <div style={{ fontSize: '0.725rem', color: '#64748B' }}>{doc.size} • {doc.date}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadReport(doc.name)}
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tab 6: Discussions (Issue 40) */}
          {activeTab === 'discussions' && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} color="#2563EB" /> Project Collaboration & Discussions
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  {discussions.length} comment{discussions.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Form to submit new comment */}
              <form onSubmit={handlePostDiscussion} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea
                  rows={3}
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Post an engineering update, question for mentor, or coordination note..."
                  className="input-field"
                  style={{ width: '100%', borderRadius: '10px', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="btn btn-blue btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                  >
                    <Send size={14} /> {submittingComment ? 'Posting...' : 'Post Message'}
                  </button>
                </div>
              </form>

              {/* Comments list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                {loadingDiscussions ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748B' }}>
                    <Clock size={20} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                    Loading discussions...
                  </div>
                ) : discussions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8', fontSize: '0.875rem' }}>
                    No discussion messages posted yet. Start the engineering conversation!
                  </div>
                ) : (
                  discussions.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>
                          {c.author_name || c.author_email || 'Collaborator'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                          {c.created_at ? new Date(c.created_at).toLocaleString() : 'Just now'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', whiteSpace: 'pre-wrap' }}>
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Project Metadata Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem' }}>
              Project Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Project ID:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>#{currentProject.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Deployment Gate:</span>
                <span style={{ fontWeight: 700, color: getStatusBadgeStyle(deploymentStatus).text }}>
                  {deploymentStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Faculty Mentor:</span>
                <span style={{ fontWeight: 700, color: '#2563EB' }}>{mentorName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Partner Univ:</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>{universityName}</span>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: '0.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 700 }}>
                  <span style={{ color: '#0F172A' }}>Milestones Completed</span>
                  <span style={{ color: '#2563EB' }}>{progress}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? '#10B981' : '#2563EB', borderRadius: '999px', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="btn btn-blue"
              style={{ width: '100%', marginTop: '1.25rem', borderRadius: '10px' }}
            >
              Log Progress Note
            </button>
          </div>
        </div>
      </div>

      {/* Modal 1: Milestone Evidence Submission (Student) */}
      {isEvidenceModalOpen && selectedMilestone && (
        <div className="modal-backdrop" onClick={() => setIsEvidenceModalOpen(false)}>
          <div
            className="modal-content card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '90%', padding: '2rem', borderRadius: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                Submit Milestone Evidence
              </h2>
              <button
                onClick={() => setIsEvidenceModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                Milestone: {selectedMilestone.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Submit documentation links, prototype GitHub release, or telemetry logs for mentor approval.
              </div>
            </div>

            <form onSubmit={handleSubmitEvidence} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Evidence Details & Links
                </label>
                <textarea
                  rows={4}
                  required
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  placeholder="Paste GitHub PR, sensor calibration data, or video demo link..."
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsEvidenceModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submittingEvidence} className="btn btn-blue">
                  {submittingEvidence ? 'Submitting...' : 'Submit Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Milestone Review (Mentor) */}
      {isReviewModalOpen && selectedMilestone && (
        <div className="modal-backdrop" onClick={() => setIsReviewModalOpen(false)}>
          <div
            className="modal-content card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '90%', padding: '2rem', borderRadius: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                Evaluate Milestone Deliverable
              </h2>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                Milestone: {selectedMilestone.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#334155', marginTop: '4px' }}>
                <strong>Evidence: </strong>
                {selectedMilestone.evidence || 'No evidence text provided yet.'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Mentor Review Feedback / Revision Notes
                </label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Enter feedback or revision requirements for the team..."
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  disabled={submittingReview}
                  onClick={() => handleReviewAction('request_changes')}
                  className="btn btn-outline"
                  style={{ color: '#DC2626', borderColor: '#FECACA' }}
                >
                  Request Changes
                </button>
                <button
                  type="button"
                  disabled={submittingReview}
                  onClick={() => handleReviewAction('approve')}
                  className="btn btn-blue"
                  style={{ background: '#059669', borderColor: '#059669' }}
                >
                  Approve Milestone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Submit Project Deployment Gate Evidence */}
      {isDeploymentModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsDeploymentModalOpen(false)}>
          <div
            className="modal-content card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '90%', padding: '2rem', borderRadius: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                Submit Project for Deployment
              </h2>
              <button
                onClick={() => setIsDeploymentModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.825rem', color: '#64748B', marginBottom: '1rem' }}>
              Under Confluence Deployment Gate rules, student teams submit deployment evidence for faculty mentor verification before public citizen resolution is unlocked.
            </p>

            <form onSubmit={handleSubmitDeployment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Deployment Evidence & Proof (Required)
                </label>
                <textarea
                  rows={4}
                  required
                  value={deploymentEvidenceText}
                  onChange={(e) => setDeploymentEvidenceText(e.target.value)}
                  placeholder="Live production URL, telemetry dashboard link, Gram Panchayat test report, or field installation photos..."
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsDeploymentModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submittingDeployment} className="btn btn-blue">
                  {submittingDeployment ? 'Submitting...' : 'Submit for Gate Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Progress Notes Modal */}
      {isUpdateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsUpdateModalOpen(false)}>
          <div
            className="modal-content card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '90%', padding: '2rem', borderRadius: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>Log Project Progress</h2>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsUpdateModalOpen(false);
                addToast('Project progress log saved successfully!', 'success');
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Progress Notes / Key Highlights
                </label>
                <textarea
                  rows={3}
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Summarize recent hardware tests, pilot milestones, or lab results..."
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-blue">
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
