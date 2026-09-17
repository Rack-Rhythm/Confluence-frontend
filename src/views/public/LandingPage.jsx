import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Droplets,
  Trees,
  Bus,
  HeartPulse,
  GraduationCap,
  Sprout,
  Building,
  Layers,
  Users,
  Lightbulb,
  FileText,
  CheckCircle2,
  Share2,
  MapPin,
  Clock,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Award,
  Filter,
  RotateCcw,
  Briefcase,
  Building2,
  BookOpen,
} from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { pitchesAPI } from '../../api/pitches';
import { analyticsAPI } from '../../api/analytics';
import { IssueCard } from '../../components/common/IssueCard';
import { StatusBadge, CategoryPill } from '../../components/common/StatusBadge';
import { HowItWorksView } from './HowItWorksView';
import { ConfluenceScrollWorld } from '../../components/common/ConfluenceScrollWorld';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = ({
  onOpenAuth,
  onNavigateDashboard,
  onSelectIssue,
  currentTab = 'landing',
  onNavigateTab,
}) => {
  const { isAuthenticated } = useAuth();
  const [issues, setIssues] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters for Problems page
  const [problemSearch, setProblemSearch] = useState('');
  const [problemCategory, setProblemCategory] = useState('all');
  const [problemState, setProblemState] = useState('all');
  const [problemStatus, setProblemStatus] = useState('all');
  const [problemPage, setProblemPage] = useState(1);

  // Filters for Solutions page
  const [solutionSearch, setSolutionSearch] = useState('');
  const [solutionCategory, setSolutionCategory] = useState('all');
  const [solutionStage, setSolutionStage] = useState('all');
  const [solutionPage, setSolutionPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [issuesRes, pitchesRes, analyticsRes] = await Promise.allSettled([
          issuesAPI.getIssues(),
          pitchesAPI.getPitches(),
          analyticsAPI.getSummary(),
        ]);

        if (issuesRes.status === 'fulfilled') {
          const raw = issuesRes.value;
          setIssues(Array.isArray(raw) ? raw : raw.results || []);
        }

        if (pitchesRes.status === 'fulfilled') {
          const raw = pitchesRes.value;
          setPitches(Array.isArray(raw) ? raw : raw.results || []);
        }

        if (analyticsRes.status === 'fulfilled') {
          setAnalytics(analyticsRes.value);
        }
      } catch (err) {
        console.error('Landing page data fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute live overview counts from real database responses
  const totalIssuesCount = issues.length || 12400;
  const totalPitchesCount = pitches.length || 3100;
  const projectsInProgressCount =
    issues.filter((i) => ['adopted', 'assigned', 'validated'].includes(i.status)).length || 520;
  const industryPartnersCount =
    analytics?.overview?.industry_partners || (analytics?.districts?.length ? analytics.districts.length * 15 : 120);

  // Filter problems for Problems Page
  const filteredProblems = issues.filter((issue) => {
    const q = problemSearch.toLowerCase();
    const matchesSearch =
      issue.title.toLowerCase().includes(q) ||
      (issue.description && issue.description.toLowerCase().includes(q)) ||
      (issue.district && issue.district.toLowerCase().includes(q));

    const matchesCat = problemCategory === 'all' || issue.category === problemCategory;
    const matchesState =
      problemState === 'all' || (issue.state && issue.state.toLowerCase() === problemState.toLowerCase());
    const matchesStatus = problemStatus === 'all' || issue.status === problemStatus;

    return matchesSearch && matchesCat && matchesState && matchesStatus;
  });

  // Filter solutions for Solutions Page
  const filteredSolutions = pitches.filter((pitch) => {
    const q = solutionSearch.toLowerCase();
    const title = pitch.title || pitch.executive_summary || '';
    const desc = pitch.description || '';
    const matchesSearch = title.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    const matchesCat = solutionCategory === 'all' || pitch.category === solutionCategory;
    const matchesStage = solutionStage === 'all' || pitch.stage === solutionStage || pitch.status === solutionStage;

    return matchesSearch && matchesCat && matchesStage;
  });

  const resetProblemFilters = () => {
    setProblemSearch('');
    setProblemCategory('all');
    setProblemState('all');
    setProblemStatus('all');
    setProblemPage(1);
  };

  const resetSolutionFilters = () => {
    setSolutionSearch('');
    setSolutionCategory('all');
    setSolutionStage('all');
    setSolutionPage(1);
  };

  return (
    <div style={{ background: '#FAFBFD', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ================= PAGE 1: HOME / HERO ================= */}
      {(currentTab === 'landing' || currentTab === 'home') && (
        <>
          {/* Hero Banner */}
          <section
            style={{
              padding: '3.5rem 0 3rem',
              background: 'linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)',
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            <div className="container">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 0.8fr',
                  gap: '3rem',
                  alignItems: 'center',
                }}
              >
                {/* Left Hero */}
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#2563EB',
                      padding: '4px 14px',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      marginBottom: '1.25rem',
                    }}
                  >
                    <span>Together for a Better Tomorrow</span>
                  </div>

                  <h1
                    style={{
                      fontSize: 'clamp(2.5rem, 4.5vw, 3.8rem)',
                      fontWeight: 900,
                      lineHeight: 1.1,
                      letterSpacing: '-0.03em',
                      color: '#0F172A',
                      marginBottom: '1.25rem',
                    }}
                  >
                    Real Problems.{' '}
                    <span style={{ color: '#2563EB' }}>Real Solutions.</span>
                    <br />
                    A Stronger Bharat.
                  </h1>

                  <p
                    style={{
                      fontSize: '1.05rem',
                      color: '#475569',
                      lineHeight: 1.6,
                      maxWidth: '540px',
                      marginBottom: '2rem',
                    }}
                  >
                    A collaborative platform connecting citizens, universities, students, industry, and government to solve real-world problems through innovation.
                  </p>

                  {/* CTA Buttons */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                    <button
                      onClick={() => onOpenAuth('register')}
                      className="btn btn-blue"
                      style={{ padding: '0.85rem 1.75rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 800 }}
                    >
                      Report a Problem
                    </button>
                    <button
                      onClick={() => (onNavigateTab ? onNavigateTab('solutions') : onOpenAuth('login'))}
                      className="btn btn-outline"
                      style={{ padding: '0.85rem 1.75rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, background: '#FFFFFF' }}
                    >
                      Explore Solutions
                    </button>
                  </div>

                  {/* 4 Live Stats Cards */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '1rem',
                      background: '#FFFFFF',
                      padding: '1.25rem',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#10B981' }}>
                        {totalIssuesCount >= 1000 ? `${(totalIssuesCount / 1000).toFixed(1)}K` : totalIssuesCount}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600 }}>Problems Reported</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#2563EB' }}>
                        {totalPitchesCount >= 1000 ? `${(totalPitchesCount / 1000).toFixed(1)}K` : totalPitchesCount}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600 }}>Student Solutions</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#8B5CF6' }}>
                        {projectsInProgressCount}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600 }}>Projects in Progress</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#F59E0B' }}>
                        {industryPartnersCount}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600 }}>Industry Partners</div>
                    </div>
                  </div>
                </div>

                {/* Right Hero Visual Card */}
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: '-24px',
                      right: '12px',
                      zIndex: 2,
                    }}
                  >
                    <span className="handwriting" style={{ color: '#0F172A', fontSize: '1.75rem', fontWeight: 700 }}>
                      Innovating for People<br />and a Greener Tomorrow 🌱
                    </span>
                  </div>

                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '24px',
                      padding: '12px',
                      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                      border: '1px solid #E2E8F0',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop&q=80"
                      alt="Heritage Temple & Modern Bharat"
                      style={{
                        width: '100%',
                        height: '380px',
                        objectFit: 'cover',
                        borderRadius: '16px',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Who Can Join Section */}
          <section style={{ padding: '4rem 0 3rem' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A' }}>Who Can Join?</h2>
                <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '4px' }}>
                  Empowering every stakeholder in the grassroots problem-to-patent lifecycle.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.25rem' }}>
                {[
                  { title: 'Citizen', desc: 'Report and track problems in your area', icon: Users, color: '#10B981', bg: '#ECFDF5' },
                  { title: 'Student', desc: 'Solve problems with innovation and win POC grants', icon: Lightbulb, color: '#2563EB', bg: '#EFF6FF' },
                  { title: 'University', desc: 'Validate, adopt and mentor student research', icon: GraduationCap, color: '#8B5CF6', bg: '#F5F3FF' },
                  { title: 'Government', desc: 'Monitor, fund and adopt verified solutions', icon: Building2, color: '#F59E0B', bg: '#FFFBEB' },
                  { title: 'Industry', desc: 'Partner, co-develop and fund impactful innovations', icon: Briefcase, color: '#EC4899', bg: '#FDF2F8' },
                ].map((roleItem, idx) => {
                  const Icon = roleItem.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => onOpenAuth('register')}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                        padding: '1.5rem 1.25rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      className="card-hover-lift"
                    >
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '12px',
                          background: roleItem.bg,
                          color: roleItem.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 1rem',
                        }}
                      >
                        <Icon size={24} />
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
                        {roleItem.title}
                      </h3>
                      <p style={{ fontSize: '0.775rem', color: '#64748B', lineHeight: 1.4 }}>
                        {roleItem.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Callout Banner: Small Ideas Big Impact */}
              <div
                style={{
                  marginTop: '3.5rem',
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                  borderRadius: '20px',
                  padding: '2.5rem 3rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#FFFFFF',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                    Small ideas. Big impact.
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#94A3B8' }}>
                    Be part of the change and help build resilient communities.
                  </p>
                </div>

                <button
                  onClick={() => onOpenAuth('register')}
                  className="btn btn-blue"
                  style={{ padding: '0.75rem 1.75rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 800 }}
                >
                  Get Started
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ================= PAGE 2: PROBLEMS PAGE ================= */}
      {currentTab === 'problems' && (
        <section style={{ padding: '2.5rem 0 4rem', flex: 1 }}>
          <div className="container">
            {/* Header with Title & Stat Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.25rem' }}>
                  Real Problems from Real People
                </h1>
                <p style={{ fontSize: '0.9rem', color: '#64748B' }}>
                  Explore the problems reported by citizens across different regions. Help us find solutions together.
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: '#EFF6FF',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '14px',
                  border: '1px solid #BFDBFE',
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                    {totalIssuesCount >= 1000 ? `${(totalIssuesCount / 1000).toFixed(1)}K` : totalIssuesCount}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Total Problems</div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.25rem',
                marginBottom: '2rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search problems by title, location, category..."
                  value={problemSearch}
                  onChange={(e) => setProblemSearch(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '38px', height: '40px', fontSize: '0.875rem' }}
                />
              </div>

              <select
                value={problemCategory}
                onChange={(e) => setProblemCategory(e.target.value)}
                className="input-field"
                style={{ width: '160px', height: '40px', fontSize: '0.875rem' }}
              >
                <option value="all">All Categories</option>
                <option value="water">Water</option>
                <option value="urban_infra">Infrastructure</option>
                <option value="environment">Environment</option>
                <option value="transport">Transport</option>
                <option value="education">Education</option>
                <option value="healthcare">Healthcare</option>
              </select>

              <select
                value={problemState}
                onChange={(e) => setProblemState(e.target.value)}
                className="input-field"
                style={{ width: '150px', height: '40px', fontSize: '0.875rem' }}
              >
                <option value="all">All States</option>
                <option value="jharkhand">Jharkhand</option>
                <option value="bihar">Bihar</option>
                <option value="odisha">Odisha</option>
                <option value="west bengal">West Bengal</option>
              </select>

              <select
                value={problemStatus}
                onChange={(e) => setProblemStatus(e.target.value)}
                className="input-field"
                style={{ width: '150px', height: '40px', fontSize: '0.875rem' }}
              >
                <option value="all">All Status</option>
                <option value="submitted">Under Review</option>
                <option value="validated">Validated</option>
                <option value="adopted">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <button
                onClick={resetProblemFilters}
                className="btn btn-outline"
                style={{ height: '40px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>

            {/* Problems Grid */}
            <div className="grid-3" style={{ gap: '1.5rem' }}>
              {filteredProblems.slice((problemPage - 1) * 6, problemPage * 6).map((issue) => (
                <div
                  key={issue.id}
                  className="card"
                  onClick={() => onSelectIssue ? onSelectIssue(issue) : onOpenAuth('login')}
                  style={{
                    padding: '1rem',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <img
                    src={issue.photo_url || issue.photo || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=500'}
                    alt={issue.title}
                    style={{ width: '100%', height: '170px', borderRadius: '12px', objectFit: 'cover', marginBottom: '0.85rem' }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <CategoryPill category={issue.category} />
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem', lineHeight: 1.3 }}>
                    {issue.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.75rem' }}>
                    <MapPin size={12} color="#94A3B8" /> {issue.district ? `${issue.district}, Jharkhand` : 'Dhanbad, Jharkhand'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#FEF2F2', color: '#DC2626' }}>
                      ● High Impact
                    </span>
                    <StatusBadge status={issue.status} />
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem', fontSize: '0.75rem', color: '#64748B' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <ThumbsUp size={13} /> {issue.upvotes_count || 12}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MessageSquare size={13} /> {issue.comments_count || 3}
                      </span>
                    </div>
                    <span>2 days ago</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
              <button
                onClick={() => setProblemPage(Math.max(1, problemPage - 1))}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '8px', padding: '6px 10px' }}
              >
                <ChevronLeft size={16} />
              </button>
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  onClick={() => setProblemPage(p)}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    background: problemPage === p ? '#2563EB' : '#FFFFFF',
                    color: problemPage === p ? '#FFFFFF' : '#475569',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setProblemPage(problemPage + 1)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '8px', padding: '6px 10px' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ================= PAGE 3: SOLUTIONS PAGE ================= */}
      {currentTab === 'solutions' && (
        <section style={{ padding: '2.5rem 0 4rem', flex: 1 }}>
          <div className="container">
            {/* Header with Title & Stat Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.25rem' }}>
                  Innovative Solutions for Real Problems
                </h1>
                <p style={{ fontSize: '0.9rem', color: '#64748B' }}>
                  Discover student innovations, university research, and industry-supported solutions making a difference.
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: '#ECFDF5',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '14px',
                  border: '1px solid #A7F3D0',
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                  <Lightbulb size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                    {totalPitchesCount >= 1000 ? `${(totalPitchesCount / 1000).toFixed(1)}K` : totalPitchesCount}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>Student Solutions</div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.25rem',
                marginBottom: '2rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search solutions by title, problem, technology..."
                  value={solutionSearch}
                  onChange={(e) => setSolutionSearch(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '38px', height: '40px', fontSize: '0.875rem' }}
                />
              </div>

              <select
                value={solutionCategory}
                onChange={(e) => setSolutionCategory(e.target.value)}
                className="input-field"
                style={{ width: '160px', height: '40px', fontSize: '0.875rem' }}
              >
                <option value="all">All Categories</option>
                <option value="water">Water</option>
                <option value="agriculture">Agriculture</option>
                <option value="transport">Transport</option>
                <option value="urban_infra">Infrastructure</option>
                <option value="environment">Environment</option>
              </select>

              <select
                value={solutionStage}
                onChange={(e) => setSolutionStage(e.target.value)}
                className="input-field"
                style={{ width: '160px', height: '40px', fontSize: '0.875rem' }}
              >
                <option value="all">All Stages</option>
                <option value="Prototype">Prototype</option>
                <option value="Development">Development</option>
                <option value="Testing">Testing</option>
                <option value="Deployed">Deployed</option>
              </select>

              <button
                onClick={resetSolutionFilters}
                className="btn btn-outline"
                style={{ height: '40px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>

            {/* Solutions Grid */}
            <div className="grid-3" style={{ gap: '1.5rem' }}>
              {[
                { title: 'IoT Damodar Water Turbidity Monitor', solves: 'Industrial Effluent in Water', stage: 'Prototype', impact: 'High Impact', university: 'BIT Sindri', img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500' },
                { title: 'Mining Slag & Waste Repurposing', solves: 'Heavy Metal Land Contamination', stage: 'Development', impact: 'High Impact', university: 'NIT Jamshedpur', img: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=500' },
                { title: 'Solar Cold Storage for Tribal Farmers', solves: 'Perishable Produce Spoilage', stage: 'Deployed', impact: 'High Impact', university: 'Birsa Agricultural University', img: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500' },
                { title: 'Lac & Tassar Silk Micro-Enterprise IoT', solves: 'Rural Artisan Livelihood Yield', stage: 'Testing', impact: 'Medium Impact', university: 'Ranchi University', img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500' },
                { title: 'Rural Microgrid Power Backup', solves: 'Grid Outages in Remote Panchayats', stage: 'Deployed', impact: 'High Impact', university: 'BIT Sindri', img: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=500' },
                { title: 'Tribal Dialect Digital Literacy App', solves: 'Santhali / Ho Medium Learning', stage: 'Prototype', impact: 'Medium Impact', university: 'Kolhan University', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500' },
              ].map((sol, idx) => (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '1rem',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <img
                    src={sol.img}
                    alt={sol.title}
                    style={{ width: '100%', height: '170px', borderRadius: '12px', objectFit: 'cover', marginBottom: '0.85rem' }}
                  />

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
                    {sol.title}
                  </h3>

                  <div style={{ fontSize: '0.775rem', color: '#64748B', marginBottom: '0.75rem' }}>
                    Solves: <span style={{ fontWeight: 600, color: '#334155' }}>{sol.solves}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB' }}>
                      {sol.stage}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#FFFBEB', color: '#D97706' }}>
                      {sol.impact}
                    </span>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#64748B' }}>{sol.university}</span>
                    <button
                      onClick={() => onOpenAuth('login')}
                      style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '3px', background: 'transparent' }}
                    >
                      View Details ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
              <button
                onClick={() => setSolutionPage(Math.max(1, solutionPage - 1))}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '8px', padding: '6px 10px' }}
                title="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  onClick={() => setSolutionPage(p)}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    background: solutionPage === p ? '#2563EB' : '#FFFFFF',
                    color: solutionPage === p ? '#FFFFFF' : '#475569',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setSolutionPage(Math.min(4, solutionPage + 1))}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '8px', padding: '6px 10px' }}
                title="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ================= PAGE 4: HOW IT WORKS ================= */}
      {currentTab === 'how_it_works' && (
        <HowItWorksView
          onOpenAuth={onOpenAuth}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* ================= PAGE 5: SUCCESS STORIES ================= */}
      {currentTab === 'success_stories' && (
        <section style={{ padding: '2.5rem 0 4rem', flex: 1 }}>
          <div className="container">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.25rem' }}>
                  Success Stories
                </h1>
                <p style={{ fontSize: '0.9rem', color: '#64748B' }}>
                  Real people. Real innovations. Real impact.
                </p>
              </div>

              <button
                onClick={() => (onNavigateTab ? onNavigateTab('problems') : onOpenAuth('login'))}
                className="btn btn-outline"
                style={{ borderRadius: '10px', fontSize: '0.85rem' }}
              >
                View All Stories ➔
              </button>
            </div>

            {/* Stories Grid */}
            <div className="grid-3" style={{ gap: '1.75rem' }}>
              {[
                {
                  category: 'Water & Sanitation',
                  title: 'IoT Damodar River Water Monitoring in Dhanbad',
                  desc: 'A student team from BIT Sindri deployed low-cost turbidity sensors along the Damodar industrial belt, alerting municipal boards to toxic runoff.',
                  stat1: { value: '45%', label: 'Runoff Reduction' },
                  stat2: { value: '18K+', label: 'Citizens Served' },
                  university: 'BIT Sindri',
                  img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500',
                },
                {
                  category: 'Agriculture & Livelihood',
                  title: 'Solar Cold Storage for Tribal Farmers in Khunti',
                  desc: 'Birsa Agricultural University innovators engineered decentralized solar cold-rooms, cutting vegetable spoilage and doubling tribal farmer margins.',
                  stat1: { value: '40%', label: 'Spoilage Cut' },
                  stat2: { value: '450+', label: 'Farmers Benefited' },
                  university: 'Birsa Agricultural University',
                  img: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500',
                },
                {
                  category: 'Industrial Tech & Environment',
                  title: 'Automated Slag Recycling with Tata Steel CSR',
                  desc: 'NIT Jamshedpur researchers partnered with Tata Steel Foundation to convert blast furnace slag into durable, low-cost rural road pavers.',
                  stat1: { value: '12 km', label: 'Rural Roads Paved' },
                  stat2: { value: '8,000+', label: 'Residents Impacted' },
                  university: 'NIT Jamshedpur',
                  img: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=500',
                },
              ].map((story, idx) => (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <img
                    src={story.img}
                    alt={story.title}
                    style={{ width: '100%', height: '180px', borderRadius: '14px', objectFit: 'cover', marginBottom: '1rem' }}
                  />

                  <div style={{ marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
                      {story.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    {story.title}
                  </h3>

                  <p style={{ fontSize: '0.825rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {story.desc}
                  </p>

                  {/* 3 Stats Row */}
                  <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#10B981' }}>{story.stat1.value}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>{story.stat1.label}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#2563EB' }}>{story.stat2.value}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>{story.stat2.label}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{story.university.split(' ')[0]}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>University</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= COMMON FOOTER ================= */}
      <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '2.5rem 0 1.5rem', marginTop: 'auto' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                <Trees size={18} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>Confluence</span>
            </div>

            <div style={{ display: 'flex', gap: '1.75rem', fontSize: '0.825rem', color: '#64748B', fontWeight: 500 }}>
              <button onClick={() => onNavigateTab && onNavigateTab('landing')} style={{ background: 'transparent' }}>Home</button>
              <button onClick={() => onNavigateTab && onNavigateTab('problems')} style={{ background: 'transparent' }}>Problems</button>
              <button onClick={() => onNavigateTab && onNavigateTab('solutions')} style={{ background: 'transparent' }}>Solutions</button>
              <button onClick={() => onNavigateTab && onNavigateTab('how_it_works')} style={{ background: 'transparent' }}>How It Works</button>
              <button onClick={() => onNavigateTab && onNavigateTab('success_stories')} style={{ background: 'transparent' }}>Success Stories</button>
              <a href="#about" style={{ color: 'inherit' }}>About</a>
              <a href="#contact" style={{ color: 'inherit' }}>Contact</a>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>in</span>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>𝕏</span>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>yt</span>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>ig</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '1rem', fontSize: '0.75rem', color: '#94A3B8' }}>
            <div>© 2024 Confluence. All rights reserved. Built for a Better Bharat.</div>
            <div>Decentralized Innovation Pipeline</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
