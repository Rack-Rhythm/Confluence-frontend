import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Award,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  ShieldCheck,
  Lock,
  Sparkles,
  TrendingUp,
  X,
  Target,
  Building2,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { pitchesAPI } from '../../api/pitches';
import { engagementsAPI } from '../../api/engagements';
import { issuesAPI } from '../../api/issues';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const IndustryProjectsView = ({ onSelectPitch }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [pitches, setPitches] = useState([]);
  const [engagements, setEngagements] = useState([]);
  const [adoptedIssues, setAdoptedIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  let initialTab = 'all';
  if (location.pathname.includes('/mentorship') || location.pathname.includes('/project-progress')) {
    initialTab = 'sponsored';
  }
  const [activeTab, setActiveTab] = useState(initialTab); // all, sponsored, available
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State for Proposing Engagement
  const [selectedIssueForSponsor, setSelectedIssueForSponsor] = useState(null);
  const [sponsorForm, setSponsorForm] = useState({
    engagement_type: 'funding',
    proposal_notes: '',
  });

  const orgName = user?.organization_details?.name || user?.organization_name || 'Corporate Partner';

  const loadData = async () => {
    setLoading(true);
    try {
      const [pitchesRes, engRes, issuesRes] = await Promise.allSettled([
        pitchesAPI.getPitches(),
        engagementsAPI.getEngagements(),
        issuesAPI.getIssues({ status: 'adopted,assigned' }),
      ]);

      if (pitchesRes.status === 'fulfilled') {
        const rawP = pitchesRes.value;
        setPitches(Array.isArray(rawP) ? rawP : rawP.results || []);
      }
      if (engRes.status === 'fulfilled') {
        const rawE = engRes.value;
        setEngagements(Array.isArray(rawE) ? rawE : rawE.results || []);
      }
      if (issuesRes.status === 'fulfilled') {
        const rawI = issuesRes.value;
        setAdoptedIssues(Array.isArray(rawI) ? rawI : rawI.results || []);
      }
    } catch (err) {
      console.error('Failed to load industry projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Determine which issues/pitches are sponsored by this industry org
  const activeEngagedIssueIds = new Set(
    engagements
      .filter((e) => ['active', 'accepted'].includes(e.status))
      .map((e) => e.issue)
  );

  const handleProposeSponsorship = async (e) => {
    e.preventDefault();
    if (!selectedIssueForSponsor) return;

    try {
      await engagementsAPI.createEngagement({
        issue: selectedIssueForSponsor.id,
        engagement_type: sponsorForm.engagement_type,
        proposal_notes: sponsorForm.proposal_notes || `Corporate sponsorship proposed by ${orgName}.`,
      });
      showToast(`Sponsorship proposal submitted for "${selectedIssueForSponsor.title}"!`, 'success');
      setSelectedIssueForSponsor(null);
      setSponsorForm({ engagement_type: 'funding', proposal_notes: '' });
      loadData();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to submit proposal.';
      showToast(msg, 'error');
    }
  };

  // Build unified project objects
  const projectList = pitches.map((pitch, idx) => {
    const isSponsored = activeEngagedIssueIds.has(pitch.issue);
    const lc = pitch.project_lifecycle || pitch.lifecycle;
    const hasMilestones = lc && Array.isArray(lc.milestones) && lc.milestones.length > 0;
    const completedCount = hasMilestones ? lc.milestones.filter((m) => m.completed).length : 0;
    const totalCount = hasMilestones ? lc.milestones.length : 4;
    const progressPct = hasMilestones
      ? Math.round((completedCount / totalCount) * 100)
      : pitch.status === 'selected'
      ? 50
      : 25;

    const stages = ['Prototype', 'Development', 'Field Testing', 'Deployed'];
    const stage = lc?.outcome_status === 'deployed' ? 'Deployed' : stages[idx % 3];

    return {
      id: pitch.id,
      pitch,
      title: pitch.title,
      issue_id: pitch.issue,
      issue_title: pitch.issue_details?.title || 'Grassroots Innovation Challenge',
      district: pitch.issue_details?.district || 'Jharkhand',
      category: pitch.category || 'water',
      university: pitch.university_details?.name || 'Birsa Institute of Technology (BIT) Sindri',
      team: pitch.student_team_details?.map((s) => s.name).join(', ') || 'Student Innovation Team',
      isSponsored,
      stage,
      progressPct,
      milestones: lc?.milestones || [],
      outcome_status: lc?.outcome_status || 'in_progress',
      deliverables: lc?.deliverables || 'Working Hardware Prototype & Schematics',
      test_results: lc?.test_results || 'Under laboratory validation',
    };
  });

  const sponsoredCount = projectList.filter((p) => p.isSponsored).length;
  const availableCount = projectList.filter((p) => !p.isSponsored).length;

  const filteredProjects = projectList.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.issue_title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;

    if (activeTab === 'sponsored') return matchesSearch && matchesCat && p.isSponsored;
    if (activeTab === 'available') return matchesSearch && matchesCat && !p.isSponsored;
    return matchesSearch && matchesCat;
  });

  const handleOpenPitch = (pitch) => {
    if (!pitch || !pitch.id) {
      showToast('No active pitch submission record available for this challenge yet.', 'info');
      return;
    }
    if (onSelectPitch) {
      onSelectPitch(pitch);
    } else {
      navigate(`/industry/pitches/${pitch.id}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
              ● INDUSTRY CO-DEVELOPMENT TRACK
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Supported Projects & Innovation Testbeds
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: '4px', maxWidth: '650px' }}>
            Monitor prototype milestones, confidential technical deliverables, and field trials for projects backed by {orgName}.
          </p>
        </div>

        <button
          onClick={() => navigate('/industry/engagements')}
          className="btn btn-primary"
          style={{ background: '#2563EB', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
        >
          <Target size={16} /> Manage CSR Engagements
        </button>
      </div>

      {/* 2. Stats Metric Row */}
      <div className="grid-4">
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563EB' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>TOTAL PROJECTS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
            {projectList.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '2px' }}>Across State Universities</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>SPONSORED BY {orgName.split(' ')[0].toUpperCase()}</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>
            {sponsoredCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '2px' }}>Full IP & Milestones Unlocked</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>OPEN FOR SPONSORSHIP</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F59E0B', marginTop: '4px' }}>
            {availableCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '2px' }}>Seeking Grants / Advisory</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>FIELD VALIDATIONS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8B5CF6', marginTop: '4px' }}>
            {projectList.filter((p) => p.stage === 'Field Testing' || p.stage === 'Deployed').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#7C3AED', marginTop: '2px' }}>District Pilot Sites</div>
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div
        style={{
          background: '#FFFFFF',
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Projects (${projectList.length})` },
            { id: 'sponsored', label: `My Sponsored Projects (${sponsoredCount})` },
            { id: 'available', label: `Open for Sponsorship (${availableCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 700,
                background: activeTab === tab.id ? '#2563EB' : '#F1F5F9',
                color: activeTab === tab.id ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search solutions or universities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '32px', height: '38px', fontSize: '0.825rem' }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field"
            style={{ height: '38px', fontSize: '0.825rem', padding: '0 0.75rem' }}
          >
            <option value="all">All Sectors</option>
            <option value="water">Water & Sanitation</option>
            <option value="agriculture">Agriculture & Cold Storage</option>
            <option value="environment">Mining & Environment</option>
            <option value="urban_infra">Urban Infrastructure</option>
            <option value="transport">Transport & Roads</option>
          </select>
        </div>
      </div>

      {/* 4. Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94A3B8' }}>
          Loading projects portfolio...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748B' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
            No projects found matching current filters
          </div>
          <p style={{ fontSize: '0.85rem' }}>
            Switch tabs or clear your search to explore other university solutions.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{
                padding: '1.5rem',
                border: p.isSponsored ? '1.5px solid #93C5FD' : '1px solid #E2E8F0',
                background: p.isSponsored ? '#F8FAFC' : '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#EFF6FF',
                        color: '#2563EB',
                        textTransform: 'uppercase',
                      }}
                    >
                      {p.category}
                    </span>

                    {p.isSponsored ? (
                      <span style={{ fontSize: '0.725rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={13} /> Active Partner — Full IP Unlocked
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.725rem', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={12} /> Open For Corporate Grant
                      </span>
                    )}

                    <span style={{ fontSize: '0.725rem', color: '#64748B' }}>
                      📍 {p.district}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '3px' }}>
                    {p.title}
                  </h3>
                  <div style={{ fontSize: '0.825rem', color: '#475569' }}>
                    Academic Institution: <strong>{p.university}</strong> • Innovator: {p.team}
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563EB' }}>
                    {p.stage.toUpperCase()} STAGE
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                    {p.progressPct}% Complete
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '7px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <div style={{ width: `${p.progressPct}%`, height: '100%', background: p.isSponsored ? '#10B981' : '#2563EB', transition: 'width 0.3s ease' }} />
              </div>

              {/* Technical Deliverables & Status Note */}
              <div
                className="grid-responsive-2" style={{ gap: '1rem', background: '#FFFFFF',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  marginBottom: '1.25rem',
                  fontSize: '0.8rem',
                 }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '2px' }}>
                    DELIVERABLE ARCHITECTURE
                  </span>
                  <span style={{ color: '#0F172A', fontWeight: 600 }}>{p.deliverables}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '2px' }}>
                    LAB TEST RESULTS
                  </span>
                  <span style={{ color: '#0F172A', fontWeight: 600 }}>{p.test_results}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Target Problem: <strong>#{p.issue_id}</strong> — {p.issue_title}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {p.isSponsored ? (
                    <button
                      onClick={() => handleOpenPitch(p.pitch)}
                      className="btn btn-primary"
                      style={{ background: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem' }}
                    >
                      <ShieldCheck size={16} /> View Unlocked Confidential IP
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenPitch(p.pitch)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.825rem' }}
                      >
                        Read Public Summary
                      </button>
                      <button
                        onClick={() => setSelectedIssueForSponsor({ id: p.issue_id, title: p.title })}
                        className="btn btn-primary"
                        style={{ background: '#2563EB', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem' }}
                      >
                        <Plus size={15} /> Propose CSR Sponsorship
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Propose CSR Sponsorship */}
      {selectedIssueForSponsor && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                Propose Corporate Partnership
              </h3>
              <button
                onClick={() => setSelectedIssueForSponsor(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Submitting corporate proposal for <strong>{selectedIssueForSponsor.title}</strong>. This request will be routed to the adopting university coordinator.
            </p>

            <form onSubmit={handleProposeSponsorship} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
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
                  <option value="funding">CSR / Grant Funding</option>
                  <option value="mentorship">Mentorship & Technical Advisory</option>
                  <option value="prototyping">Prototyping & Lab Access</option>
                  <option value="technology_transfer">Technology Transfer & Licensing</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Proposal Notes & Funding Range
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Outline funding commitment, hardware resources, lab facility access, or industry advisory scope..."
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
                  onClick={() => setSelectedIssueForSponsor(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#2563EB' }}>
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
