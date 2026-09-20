import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Sparkles,
  Lightbulb,
  Building2,
  FileText,
  Send,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { StatusBadge, CategoryPill } from '../../components/common/StatusBadge';
import { useParams, useNavigate } from 'react-router-dom';
import { issuesAPI } from '../../api/issues';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getIssueImageUrl, handleImageError } from '../../utils/imageUtils';

export const ProblemDetailStudent = ({ problem, onBack, onSubmitPitch }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentProblem, setCurrentProblem] = useState(problem || null);
  const [loading, setLoading] = useState(!problem && !!id);
  const [activeTab, setActiveTab] = useState('overview');
  const [nominationRationale, setNominationRationale] = useState('');
  const [showNominateModal, setShowNominateModal] = useState(false);
  const [nominating, setNominating] = useState(false);
  const [userNomination, setUserNomination] = useState(problem?.user_nomination || null);

  useEffect(() => {
    if (currentProblem?.user_nomination) {
      setUserNomination(currentProblem.user_nomination);
    }
  }, [currentProblem]);

  useEffect(() => {
    if (problem && (!id || String(problem.id) === String(id))) {
      setCurrentProblem(problem);
      setLoading(false);
      return;
    }
    if (id) {
      setLoading(true);
      issuesAPI
        .getIssue(id)
        .then((res) => setCurrentProblem(res))
        .catch((err) => console.error('Failed to load student problem:', err))
        .finally(() => setLoading(false));
    }
  }, [id, problem]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748B' }}>
        Loading societal challenge #{id}...
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
          Problem Not Found
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
          The requested problem challenge could not be found or has been archived.
        </p>
        <button onClick={() => (onBack ? onBack() : navigate(-1))} className="btn btn-primary" style={{ borderRadius: '8px' }}>
          Back to Explore
        </button>
      </div>
    );
  }

  problem = currentProblem;

  const handleNominate = async (e) => {
    e.preventDefault();
    setNominating(true);
    try {
      const res = await issuesAPI.nominateIssue(problem.id, nominationRationale);
      showToast('Issue nominated for your university review board!', 'success');
      setUserNomination(res);
      setShowNominateModal(false);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to nominate issue. You may have already nominated it.';
      showToast(msg, 'error');
    } finally {
      setNominating(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back button */}
      <button
        onClick={() => (onBack ? onBack() : navigate(-1))}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#2563EB',
          width: 'fit-content',
        }}
      >
        <ArrowLeft size={16} /> Back to Explore
      </button>

      {/* Main Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
            {problem.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#64748B' }}>
            <span>📍 {problem.district}, {problem.address || 'India'}</span>
            <span>•</span>
            <span>Reported on {new Date(problem.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <StatusBadge status={problem.status} />
      </div>

      {/* Layout Grid */}
      <div className="grid-responsive-2" style={{ gap: '1.5rem' }}>
        {/* Left column: Tabs + Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Main Photo */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#F1F5F9' }}>
            <img
              src={getIssueImageUrl(problem)}
              alt={problem.title}
              style={{ width: '100%', height: '320px', objectFit: 'cover' }}
              onError={(e) => handleImageError(e, problem.category)}
            />
          </div>

          {/* Tab Navigation */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #E2E8F0',
                gap: '1.5rem',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {['overview', 'location', 'attachments'].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    paddingBottom: '0.5rem',
                    color: activeTab === t ? '#2563EB' : '#64748B',
                    borderBottom: activeTab === t ? '2px solid #2563EB' : 'none',
                    textTransform: 'capitalize',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Problem Description
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {problem.description}
                </p>

                {problem.expected_outcome && (
                  <>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                      Target Outcome
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>
                      {problem.expected_outcome}
                    </p>
                  </>
                )}
              </div>
            )}

            {activeTab === 'location' && (
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Geographic Context
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                  District: <strong>{problem.district}</strong>
                </p>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                  Specific Address: {problem.address || 'Block area / rural settlement'}
                </p>
                {problem.latitude && problem.longitude && (
                  <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.5rem' }}>
                    GPS Coordinates: {problem.latitude}, {problem.longitude}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'attachments' && (
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Attached Documents & Photographs
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <FileText size={20} color="#2563EB" />
                  <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>Field_Report_Survey.pdf (Verified Citizen Submission)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Quick Info & Primary CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem' }}>
              Quick Info
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}>
                  CATEGORY
                </div>
                <CategoryPill category={problem.category} />
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}>
                  IMPACT LEVEL
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#EF4444', fontWeight: 700 }}>
                  <Sparkles size={14} /> High Impact ({Math.round((problem.ai_confidence || 0.94) * 100)}% AI Confidence)
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}>
                  STATUS
                </div>
                <StatusBadge status={problem.status} />
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}>
                  REPORTED DATE
                </div>
                <div style={{ fontWeight: 600, color: '#0F172A' }}>
                  {new Date(problem.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* CTAs */}
            {(() => {
              const userUniId = user?.university_id || user?.university?.id;
              const isAdoptedByMyUni = problem?.is_adopted_by_user_university ?? (
                (problem?.status === 'adopted' || problem?.status === 'open') &&
                (problem?.adoption_details?.university === userUniId ||
                 problem?.adoption_details?.university_details?.id === userUniId ||
                 problem?.adoption?.university === userUniId ||
                 problem?.adoption?.university_id === userUniId ||
                 problem?.maintaining_university === userUniId ||
                 problem?.maintaining_university_details?.id === userUniId)
              );
              const isAdoptedByOtherUni = (problem?.status === 'adopted' || problem?.status === 'open') && !isAdoptedByMyUni && (problem?.adoption_details || problem?.adoption);

              return (
                <div style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {isAdoptedByMyUni ? (
                    <>
                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#065F46',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle2 size={16} color="#059669" />
                        <span>Adopted by your university — Open Call Active. Technical pitch submissions are open!</span>
                      </div>

                      <button
                        onClick={() => onSubmitPitch(problem)}
                        className="btn btn-blue btn-lg"
                        style={{ width: '100%', borderRadius: '10px' }}
                      >
                        <Lightbulb size={18} /> Submit a Solution / Pitch
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Lock Warning Notice */}
                      <div
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '12px',
                          background: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          color: '#92400E',
                          fontSize: '0.8rem',
                          lineHeight: 1.5,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#B45309' }}>
                          <Lock size={15} /> Pitching Locked (University Adoption Required)
                        </div>
                        <div style={{ fontSize: '0.775rem', color: '#78350F' }}>
                          {isAdoptedByOtherUni
                            ? `This challenge has been adopted by another university (${problem.adoption_details?.university_details?.name || 'Partner Institution'}).`
                            : 'Under the National Civic Innovation Framework, students cannot write pitches until this challenge is officially adopted by their university.'}
                        </div>
                      </div>

                      {/* Disabled Pitch Button */}
                      <button
                        disabled
                        className="btn btn-outline"
                        style={{
                          width: '100%',
                          borderRadius: '10px',
                          opacity: 0.6,
                          cursor: 'not-allowed',
                          background: '#F8FAFC',
                          color: '#94A3B8',
                          borderColor: '#CBD5E1',
                        }}
                        title="Adoption required before drafting solution pitches"
                      >
                        <Lock size={16} /> Submit a Solution / Pitch (Locked)
                      </button>

                      {/* Nomination Action */}
                      {!isAdoptedByOtherUni && (
                        userNomination ? (
                          <div
                            style={{
                              padding: '0.75rem 1rem',
                              borderRadius: '10px',
                              background: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              color: '#1E40AF',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <CheckCircle2 size={16} color="#2563EB" />
                            <span>Nominated for your University Review ({userNomination.status || 'Pending'})</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowNominateModal(true)}
                            className="btn btn-primary"
                            style={{ width: '100%', borderRadius: '10px' }}
                          >
                            <Building2 size={16} /> Nominate for My University Adoption
                          </button>
                        )
                      )}
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Nominate Modal */}
      {showNominateModal && (
        <div className="modal-overlay" onClick={() => setShowNominateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
              Nominate Problem for University Adoption
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Provide a brief rationale explaining why your department / university has the domain expertise to solve this problem.
            </p>

            <form onSubmit={handleNominate}>
              <div className="form-group">
                <label className="form-label">Rationale / Expertise *</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="e.g. Our Chemical & Environmental department has a dedicated lab for nanomaterial membrane synthesis..."
                  value={nominationRationale}
                  onChange={(e) => setNominationRationale(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowNominateModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={nominating}
                  className="btn btn-primary"
                >
                  {nominating ? 'Submitting...' : 'Submit Nomination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
