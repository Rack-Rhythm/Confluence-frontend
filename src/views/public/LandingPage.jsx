import React, { useState, useEffect, useRef } from 'react';
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
  Leaf,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { pitchesAPI } from '../../api/pitches';
import { analyticsAPI } from '../../api/analytics';
import { StatusBadge, CategoryPill } from '../../components/common/StatusBadge';
import { getIssueImageUrl, handleImageError, getCategoryFallbackImage } from '../../utils/imageUtils';
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

  // Video State
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

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
    <div style={{ background: '#FAFBFD', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden', width: '100%' }}>
      {/* ================= PAGE 1: HOME / HERO ================= */}
      {(currentTab === 'landing' || currentTab === 'home') && (
        <>
          {/* Hero Banner */}
          <section
            style={{
              padding: '3rem 0 4rem',
              background: '#FFFFFF',
            }}
          >
            <div className="container">
              <div className="hero-split">
                {/* Left Hero */}
                <div style={{ paddingRight: '2rem' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#65A30D', /* Green-ish to match reference */
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Sprout size={14} />
                    <span>Together For A Better India</span>
                  </div>

                  <h1
                    style={{
                      fontSize: 'clamp(3rem, 6vw, 4.5rem)',
                      fontWeight: 900,
                      lineHeight: 1.05,
                      letterSpacing: '-0.03em',
                      color: '#0F172A',
                      marginBottom: '1.5rem',
                    }}
                  >
                    Solve Problems,<br />
                    <span style={{ color: '#65A30D' }}>Build Tomorrow.</span>
                  </h1>

                  <p
                    style={{
                      fontSize: '1.1rem',
                      color: '#64748B',
                      lineHeight: 1.6,
                      maxWidth: '480px',
                      marginBottom: '2.5rem',
                    }}
                  >
                    We unite citizens, students, industry, and government to protect our communities and build a sustainable future for all.
                  </p>

                  {/* Input / CTA */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    background: '#F8FAFC', 
                    borderRadius: '999px', 
                    padding: '0.35rem 0.35rem 0.35rem 1.5rem', 
                    maxWidth: '420px',
                    border: '1px solid #E2E8F0',
                    marginBottom: '1.5rem'
                  }}>
                    <input 
                      type="text" 
                      placeholder="Enter your problem" 
                      style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '0.95rem' }} 
                    />
                    <button
                      onClick={() => onOpenAuth('register')}
                      style={{ 
                        background: '#65A30D', 
                        color: '#FFFFFF', 
                        padding: '0.75rem 1.5rem', 
                        borderRadius: '999px', 
                        fontSize: '0.95rem', 
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      Report <ArrowRight size={16} />
                    </button>
                  </div>

                  {/* Avatars */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex' }}>
                      <img src="https://i.pravatar.cc/100?img=1" alt="user" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #FFF', marginLeft: '0' }} />
                      <img src="https://i.pravatar.cc/100?img=2" alt="user" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #FFF', marginLeft: '-12px' }} />
                      <img src="https://i.pravatar.cc/100?img=3" alt="user" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #FFF', marginLeft: '-12px' }} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, lineHeight: 1.2 }}>
                      Join 15,000+ citizens<br />making a difference
                    </div>
                  </div>

                  {/* 4 Live Stats Cards - Styled as clean minimal blocks */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ background: '#F8FAFC', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', minWidth: '120px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A' }}>
                        {totalIssuesCount >= 1000 ? `${(totalIssuesCount / 1000).toFixed(1)}K` : totalIssuesCount}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Issues Reported</div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', minWidth: '120px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A' }}>
                        {projectsInProgressCount}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Active Projects</div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', minWidth: '120px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A' }}>
                        100%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>For The People</div>
                    </div>
                  </div>
                </div>

                {/* Right Hero Visual Card */}
                <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      minHeight: '600px',
                      borderRadius: '32px',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                      background: '#0F172A' // fallback
                    }}
                  >
                    {/* Video Background */}
                    <video 
                      ref={videoRef}
                      autoPlay 
                      loop 
                      muted={isMuted}
                      playsInline
                      style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        zIndex: 0
                      }}
                    >
                      <source src="/confluence-hero-video.mp4" type="video/mp4" />
                    </video>

                    {/* Gradient Overlay for better contrast */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)', zIndex: 1 }}></div>

                    {/* Content wrapper with higher z-index */}
                    <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
                    {/* Mute/Unmute toggle moved to corner */}
                    <div 
                      onClick={() => {
                        setIsMuted(!isMuted);
                        if (videoRef.current) {
                           videoRef.current.muted = !isMuted; 
                           videoRef.current.play().catch(e => console.log('Playback prevented', e));
                        }
                      }}
                      style={{ 
                        position: 'absolute', 
                        bottom: '24px', 
                        left: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        cursor: 'pointer', 
                        zIndex: 10,
                        background: 'rgba(0, 0, 0, 0.4)',
                        padding: '8px 16px',
                        borderRadius: '999px',
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      <div style={{ color: '#FFFFFF' }}>
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </div>
                      <span style={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.02em' }}>
                        {isMuted ? "Click to Unmute" : "Playing Audio"}
                      </span>
                    </div>

                    {/* Floating Glass Cards */}
                    <div style={{ position: 'absolute', top: '15%', right: '-5%', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxWidth: '240px' }}>
                      <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100&auto=format&fit=crop&q=80" alt="cleaning" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>Civic Action</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Resolving local infrastructure problems.</div>
                      </div>
                    </div>

                    <div style={{ position: 'absolute', top: '45%', right: '5%', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxWidth: '240px' }}>
                      <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&auto=format&fit=crop&q=80" alt="innovation" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>Student Solutions</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Prototyping tech for public goods.</div>
                      </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '15%', right: '-2%', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxWidth: '240px' }}>
                      <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=100&auto=format&fit=crop&q=80" alt="industry" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>Industry Backing</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Scaling validated solutions nationwide.</div>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section style={{ padding: '5rem 0', background: '#F8FAFC' }}>
            <div className="container">
              <div className="mission-split">
                
                {/* Left Column */}
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#65A30D',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      marginBottom: '1rem',
                    }}
                  >
                    <Leaf size={14} />
                    <span>Our Mission</span>
                  </div>

                  <h2
                    style={{
                      fontSize: 'clamp(2rem, 4vw, 3rem)',
                      fontWeight: 900,
                      lineHeight: 1.15,
                      letterSpacing: '-0.02em',
                      color: '#0F172A',
                      marginBottom: '1.25rem',
                    }}
                  >
                    We're Building a<br />
                    <span style={{ color: '#65A30D' }}>Smarter, Cleaner, Stronger</span><br />
                    Bharat.
                  </h2>

                  <p
                    style={{
                      fontSize: '1.05rem',
                      color: '#64748B',
                      lineHeight: 1.6,
                      marginBottom: '2rem',
                    }}
                  >
                    Through education, action, and grassroots innovation, we empower citizens and students to protect their communities and create lasting structural change.
                  </p>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => (onNavigateTab ? onNavigateTab('problems') : onOpenAuth('login'))}
                      style={{ 
                        background: '#65A30D', 
                        color: '#FFFFFF', 
                        padding: '0.8rem 1.5rem', 
                        borderRadius: '999px', 
                        fontSize: '0.95rem', 
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      Explore Projects <ArrowRight size={16} />
                    </button>
                    <button
                      onClick={() => (onNavigateTab ? onNavigateTab('how_it_works') : onOpenAuth('login'))}
                      style={{ 
                        background: '#FFFFFF', 
                        color: '#0F172A', 
                        padding: '0.8rem 1.5rem', 
                        borderRadius: '999px', 
                        fontSize: '0.95rem', 
                        fontWeight: 700,
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      Learn More
                    </button>
                  </div>
                </div>

                {/* Right Column: 3 Vertical Cards */}
                <div className="vertical-cards-grid">
                  {[
                    { 
                      title: 'Civic Action', 
                      desc: 'Promoting responsible problem reporting and community management.',
                      img: 'https://images.unsplash.com/photo-1574682782782-78d1f271184a?auto=format&fit=crop&q=80',
                      icon: Users
                    },
                    { 
                      title: 'Student Innovation', 
                      desc: 'Building sustainable and scalable solutions for local problems.',
                      img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80',
                      icon: Lightbulb
                    },
                    { 
                      title: 'Govt Adoption', 
                      desc: 'Empowering local authorities to fund and adopt validated tech.',
                      img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80',
                      icon: Building2
                    }
                  ].map((card, idx) => {
                    const Icon = card.icon;
                    return (
                      <div key={idx} style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '360px', background: '#0F172A' }}>
                        <img src={card.img} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 20%, rgba(15,23,42,0.95) 100%)' }} />
                        
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem' }}>
                          <div style={{ width: '40px', height: '40px', background: '#FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#65A30D', marginBottom: '1rem' }}>
                            <Icon size={20} />
                          </div>
                          <h3 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem' }}>{card.title}</h3>
                          <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.5 }}>{card.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

              </div>
            </div>
          </section>

          {/* Trusted By Logos */}
          <section style={{ padding: '3rem 0', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', borderTop: '1px solid #E2E8F0' }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  TRUSTED BY
                </span>
                <div style={{ height: '1px', background: '#E2E8F0', flex: 1 }}></div>
              </div>
              <div className="trust-logos">
                {[
                  'Ministry of Education',
                  'Smart City Mission',
                  'Digital India',
                  'Startup India',
                  'NITI Aayog',
                  'AICTE'
                ].map((logo, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    color: '#94A3B8', 
                    fontSize: '1.25rem', 
                    fontWeight: 900,
                    opacity: 0.6,
                    cursor: 'default'
                  }}
                  >
                    <div style={{ width: '28px', height: '28px', background: '#CBD5E1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                      <Award size={16} />
                    </div>
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Initiatives Section */}
          <section style={{ padding: '5rem 0', background: '#FAFBFD' }}>
            <div className="container">
              <div className="mission-split">
                
                {/* Left Column: 3 vertical cards */}
                <div className="vertical-cards-grid">
                  {[
                    { title: 'Clean Oceans, Bright Future', desc: 'Removing plastic and debris from our oceans and coastlines.', label: 'Ocean Cleanup', img: 'https://images.unsplash.com/photo-1621451537084-482c73073e0f?auto=format&fit=crop&q=80' },
                    { title: 'More Trees, Better Planet', desc: 'Planting and restoring forests for a healthier Earth.', label: 'Reforestation', img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80' },
                    { title: 'Stronger Communities, Stronger Future', desc: 'Empowering communities to lead local change.', label: 'Community', img: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80' }
                  ].map((item, idx) => (
                    <div key={idx} style={{ background: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ position: 'relative', height: '220px' }}>
                        <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: '#FFFFFF', padding: '4px 12px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, color: '#0F172A' }}>
                          {item.label}
                        </div>
                      </div>
                      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                          {item.title}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.5rem', flex: 1 }}>
                          {item.desc}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: '#65A30D', cursor: 'pointer' }}>
                          Learn More <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#65A30D',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      marginBottom: '1rem',
                    }}
                  >
                    <Leaf size={14} />
                    <span>Our Initiatives</span>
                  </div>
                  <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 900, lineHeight: 1.1, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
                    Real Actions.<br />Real Impact.<br />A Better Future.
                  </h2>
                  <p style={{ fontSize: '1.1rem', color: '#64748B', lineHeight: 1.6, marginBottom: '2rem' }}>
                    Discover how we turn ideas into impact through projects that protect our planet and support communities.
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', cursor: 'pointer', marginBottom: '3rem' }}>
                    View All Initiatives <ArrowRight size={16} />
                  </div>

                  {/* Newsletter Box */}
                  <div style={{ background: '#D9F99D', padding: '2rem', borderRadius: '24px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                      Stay Inspired. Stay Informed.
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#3F6212', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                      Subscribe to our newsletter and get the latest updates on our projects, stories, and how you can help.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input type="text" placeholder="Enter your email" style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', fontSize: '0.9rem', minWidth: '150px' }} />
                      <button style={{ background: '#4D7C0F', color: '#FFFFFF', padding: '0.75rem 1.25rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        Subscribe <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '1.5rem' }}>
                      <div style={{ display: 'flex' }}>
                        <img src="https://i.pravatar.cc/100?img=4" alt="user" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #D9F99D', marginLeft: '0' }} />
                        <img src="https://i.pravatar.cc/100?img=5" alt="user" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #D9F99D', marginLeft: '-10px' }} />
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3F6212' }}>
                        Join thousands of<br />change-makers
                      </div>
                    </div>
                  </div>
                </div>

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
                    src={getIssueImageUrl(issue)}
                    alt={issue.title}
                    style={{ width: '100%', height: '170px', borderRadius: '12px', objectFit: 'cover', marginBottom: '0.85rem', background: '#F1F5F9' }}
                    onError={(e) => handleImageError(e, issue.category)}
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
              {filteredSolutions.slice((solutionPage - 1) * 6, solutionPage * 6).map((pitch, idx) => (
                <div
                  key={pitch.id || idx}
                  className="card"
                  onClick={() => onSelectIssue ? onSelectIssue({ id: pitch.issue || pitch.issue_details?.id, ...pitch.issue_details }) : onOpenAuth('login')}
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
                    src={getIssueImageUrl(pitch)}
                    alt={pitch.title}
                    style={{ width: '100%', height: '170px', borderRadius: '12px', objectFit: 'cover', marginBottom: '0.85rem', background: '#F1F5F9' }}
                    onError={(e) => handleImageError(e, pitch.category || pitch.issue_details?.category || 'education')}
                  />

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
                    {pitch.title}
                  </h3>

                  <div style={{ fontSize: '0.775rem', color: '#64748B', marginBottom: '0.75rem' }}>
                    Solves: <span style={{ fontWeight: 600, color: '#334155' }}>{pitch.issue_details?.title || pitch.summary || 'Civic Infrastructure Challenge'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB' }}>
                      {pitch.stage || (pitch.status === 'approved' ? 'Development' : pitch.status === 'under_review' ? 'Prototype' : 'Testing')}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#FFFBEB', color: '#D97706' }}>
                      {pitch.impact || 'High Impact'}
                    </span>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#64748B' }}>
                      {pitch.university_details?.name || 'Partner Technical University'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIssue ? onSelectIssue({ id: pitch.issue || pitch.issue_details?.id, ...pitch.issue_details }) : onOpenAuth('login');
                      }}
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
                  img: '/media/issues/photos/damodar_water_effluent.jpg',
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
                    style={{ width: '100%', height: '180px', borderRadius: '14px', objectFit: 'cover', marginBottom: '1rem', background: '#F1F5F9' }}
                    onError={(e) => handleImageError(e, 'environment')}
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
                  <div className="grid-responsive-3" style={{ gap: '0.5rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center'  }}>
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
