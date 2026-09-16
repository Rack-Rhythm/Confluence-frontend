import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  MapPin,
  Image as ImageIcon,
  Send,
  Search,
  CheckCircle2,
  Tag,
  ArrowRight,
  Lightbulb,
  Users,
  ClipboardList,
  Sliders,
  Award,
  Handshake,
  Coins,
  CalendarCheck,
  Rocket,
  Activity,
  Check,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Building2,
  Landmark,
  GraduationCap,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';

export const HowItWorksView = ({ onOpenAuth, onNavigateTab }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const stageRefs = useRef([]);

  const stagesData = [
    {
      id: 'report',
      stepNum: '01',
      badge: 'Report',
      title: 'Report the Problem',
      subtitle: 'Citizens can easily report issues from their communities with photos, location and details.',
      image: '/confluence/world/01-report.jpg',
      themeColor: '#3B82F6',
      accentBg: '#EFF6FF',
      accentBorder: '#BFDBFE',
      glowColor: 'rgba(59, 130, 246, 0.25)',
      quote: '“Small reports create big changes.”',
      tagline: 'Grassroots Citizen Action',
      hudTitle: 'Nagrik Seva Mobile Portal',
      hudChecklist: [
        'Geo-tagged GPS Location Pin',
        'High-Resolution Photo Evidence',
        'Automatic Ward & District Detection',
        'Instant Community Notification',
      ],
      actionLabel: 'Report a Problem',
      actionOnClick: () => onOpenAuth && onOpenAuth('register'),
      steps: [
        { icon: FileText, title: 'Describe Issue', desc: 'Clear statement with severity level' },
        { icon: MapPin, title: 'Pin Location', desc: 'Accurate GPS coordinates on interactive map' },
        { icon: ImageIcon, title: 'Attach Evidence', desc: 'Photos & videos directly from your camera' },
        { icon: Send, title: 'Publish to Grid', desc: 'Sent directly to local civic dashboard' },
      ],
    },
    {
      id: 'validate',
      stepNum: '02',
      badge: 'Validate',
      title: 'Verify & Assess',
      subtitle: 'Authorities check the details, verify the evidence and assign the right category and priority.',
      image: '/confluence/world/02-validate.jpg',
      themeColor: '#10B981',
      accentBg: '#ECFDF5',
      accentBorder: '#A7F3D0',
      glowColor: 'rgba(16, 185, 129, 0.25)',
      quote: '“Verified problems lead to authentic, targeted solutions.”',
      tagline: 'Authority & AI Verification',
      hudTitle: 'Verification Status: APPROVED',
      hudChecklist: [
        'Location Confirmed via Geospatial Audit',
        'Image Authenticity & Duplicate Check',
        'Category Assigned (Potholes, Sanitation, Water)',
        'Priority Scored & Dispatched to Universities',
      ],
      actionLabel: 'Verify as Authority',
      actionOnClick: () => onOpenAuth && onOpenAuth('login'),
      steps: [
        { icon: Search, title: 'Inspect Evidence', desc: 'AI fraud check + drone surveillance review' },
        { icon: ShieldCheck, title: 'Validate Authenticity', desc: 'Municipal officer signs off verification' },
        { icon: Tag, title: 'Tag Category', desc: 'Routed to correct civic department and syllabus' },
        { icon: ArrowRight, title: 'Broadcast to Innovators', desc: 'Opened for college hackathons and researchers' },
      ],
    },
    {
      id: 'innovate',
      stepNum: '03',
      badge: 'Innovate',
      title: 'Find Smart Solutions',
      subtitle: 'Experts and communities collaborate to propose the best solutions using technology and local knowledge.',
      image: '/confluence/world/03-innovate.jpg',
      themeColor: '#8B5CF6',
      accentBg: '#F5F3FF',
      accentBorder: '#DDD6FE',
      glowColor: 'rgba(139, 92, 246, 0.25)',
      quote: '“Ideas today. A stronger, self-reliant Bharat tomorrow.”',
      tagline: 'Academic & Student Innovation',
      hudTitle: 'University Innovation Lab',
      hudChecklist: [
        'Multidisciplinary Student Project Teams',
        'Faculty Mentors & Research Lab Support',
        'Working Hardware / Software Prototypes',
        'Peer Peer-Review & Pitch Submission',
      ],
      actionLabel: 'Submit a Solution',
      actionOnClick: () => onOpenAuth && onOpenAuth('login'),
      steps: [
        { icon: Lightbulb, title: 'Brainstorm Ideas', desc: 'Cross-functional engineering & design thinking' },
        { icon: Users, title: 'Form Research Teams', desc: 'Partner with college peers and faculty guides' },
        { icon: ClipboardList, title: 'Build Prototypes', desc: 'Low-cost hardware, IoT, and AI architectures' },
        { icon: Sliders, title: 'Refine & Pitch', desc: 'Publish solution blueprints for grant reviews' },
      ],
    },
    {
      id: 'partner',
      stepNum: '04',
      badge: 'Partner',
      title: 'Execute the Plan',
      subtitle: 'Government, institutions and local partners work together to implement the solution.',
      image: '/confluence/world/04-partner.jpg',
      themeColor: '#F59E0B',
      accentBg: '#FFFBEB',
      accentBorder: '#FDE68A',
      glowColor: 'rgba(245, 158, 11, 0.25)',
      quote: '“Stronger together — bridging academia, government & industry.”',
      tagline: 'Public-Private Partnership & Funding',
      hudTitle: 'Work in Progress — Deployment Phase',
      hudChecklist: [
        'Planning: Comprehensive site assessment & approvals',
        'Execution: Active paving, procurement & installation',
        'Industry Match: CSR grants and corporate mentorship',
        'Completion: Quality audit and safety certification',
      ],
      actionLabel: 'Partner with Us',
      actionOnClick: () => onOpenAuth && onOpenAuth('register'),
      steps: [
        { icon: Award, title: 'Grant Allocation', desc: 'Government POC funds & CSR investment' },
        { icon: Handshake, title: 'Form Alliances', desc: 'Municipal contractors & corporate sponsors' },
        { icon: Coins, title: 'Procure Resources', desc: 'Raw material procurement and engineering kits' },
        { icon: CalendarCheck, title: 'Deploy on Ground', desc: 'Scheduled execution with milestone tracking' },
      ],
    },
    {
      id: 'implement',
      stepNum: '05',
      badge: 'Implement',
      title: 'Create Lasting Impact',
      subtitle: 'Solutions are tracked, measured and sustained for a better, stronger community.',
      image: '/confluence/world/05-implement.jpg',
      themeColor: '#059669',
      accentBg: '#ECFDF5',
      accentBorder: '#A7F3D0',
      glowColor: 'rgba(5, 150, 105, 0.25)',
      quote: '“Real Problems. Real People. A Stronger Tomorrow.”',
      tagline: 'Sustainable Transformation',
      hudTitle: 'Impact Delivered: CERTIFIED',
      hudChecklist: [
        'Cleaner Communities & Smarter Sanitation',
        'Safer Road Infrastructure & Zero Potholes',
        'Sustainable Green Energy & Clean Waterways',
        'Scalable Blueprints Replicated Across Districts',
      ],
      actionLabel: 'Explore Live Impact',
      actionOnClick: () => onNavigateTab && onNavigateTab('problems'),
      steps: [
        { icon: Rocket, title: 'Public Rollout', desc: 'Live operations and citizen handover' },
        { icon: Activity, title: 'Continuous Telemetry', desc: 'IoT sensors and citizen feedback loops' },
        { icon: CheckCircle2, title: 'Measure Impact', desc: 'Transparent audit scores published online' },
        { icon: RefreshCw, title: 'National Scale', desc: 'Replicating proven models across India' },
      ],
    },
  ];

  // Calculate overall scroll progress and update active step
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      if (totalScroll > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100)));
      }

      const scrollTrigger = window.scrollY + window.innerHeight * 0.4;
      stageRefs.current.forEach((ref, index) => {
        if (!ref) return;
        const top = ref.offsetTop;
        const height = ref.offsetHeight;
        if (scrollTrigger >= top && scrollTrigger < top + height) {
          setActiveStep(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToStep = (index) => {
    setActiveStep(index);
    const target = stageRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div style={{ background: '#0B1329', minHeight: '100vh', color: '#F8FAFC', position: 'relative', overflowX: 'hidden' }}>
      {/* Background ambient stars & glowing gradients */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(37,99,235,0.18), transparent 70%), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(139,92,246,0.12), transparent 70%), radial-gradient(ellipse 70% 60% at 20% 90%, rgba(16,185,129,0.12), transparent 70%)',
        }}
      />

      {/* ================= TOP STICKY HUD BAR ================= */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(11, 19, 41, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Header Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 0 15px rgba(59,130,246,0.5)',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                How Confluence Works
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Continuous 5-Stage Grassroots Innovation Journey
              </div>
            </div>
          </div>

          {/* Quick Jump Timeline Navigation Pills */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '4px',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {stagesData.map((stage, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={stage.id}
                  onClick={() => scrollToStep(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    background: isActive ? stage.themeColor : 'transparent',
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    boxShadow: isActive ? `0 0 16px ${stage.themeColor}80` : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                    }}
                  >
                    {stage.stepNum}
                  </span>
                  <span>{stage.badge}</span>
                </button>
              );
            })}
          </div>

          {/* CTA Action */}
          <button
            onClick={() => onOpenAuth && onOpenAuth('register')}
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 15px rgba(37,99,235,0.4)',
            }}
          >
            <span>Get Started</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Global Progress Bar Line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${scrollProgress}%`,
              background: 'linear-gradient(90deg, #3B82F6, #10B981, #8B5CF6, #F59E0B, #059669)',
              boxShadow: '0 0 10px #3B82F6',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </div>

      {/* ================= HERO INTRO BANNER ================= */}
      <div style={{ position: 'relative', zIndex: 10, padding: '3.5rem 1.5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              color: '#60A5FA',
              padding: '6px 16px',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              boxShadow: '0 0 20px rgba(59,130,246,0.2)',
            }}
          >
            <Sparkles size={16} />
            <span>Viksit Bharat Problem-to-Impact Pipeline</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
            }}
          >
            From Real Problems to{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #60A5FA 0%, #34D399 50%, #A78BFA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Lasting Impact
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: '#94A3B8',
              lineHeight: 1.6,
              maxWidth: '720px',
              margin: '0 auto 2rem',
            }}
          >
            Explore the connected 5-stage journey connecting citizens, municipal authorities, student innovators, and industry partners into one unified collaborative ecosystem.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => scrollToStep(0)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                padding: '10px 22px',
                borderRadius: '999px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <span>Scroll to Begin Journey</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= 5 CONTINUOUS STAGE SECTIONS ================= */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1440px', margin: '0 auto', padding: '1rem 1.5rem 5rem' }}>
        {stagesData.map((stage, idx) => {
          const isEven = idx % 2 === 0;

          return (
            <React.Fragment key={stage.id}>
              {/* STAGE CONTAINER */}
              <div
                ref={(el) => (stageRefs.current[idx] = el)}
                style={{
                  padding: '3rem 0',
                  position: 'relative',
                }}
              >
                {/* Glow Backdrop */}
                <div
                  style={{
                    position: 'absolute',
                    top: '20%',
                    [isEven ? 'left' : 'right']: '10%',
                    width: '400px',
                    height: '400px',
                    background: stage.glowColor,
                    filter: 'blur(120px)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: -1,
                  }}
                />

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isEven ? '1.15fr 0.85fr' : '0.85fr 1.15fr',
                    gap: '2.5rem',
                    alignItems: 'center',
                  }}
                >
                  {/* DIORAMA VISUAL COLUMN (Swapped based on even/odd for panoramic flow) */}
                  <div style={{ order: isEven ? 1 : 2 }}>
                    <div
                      style={{
                        position: 'relative',
                        borderRadius: '28px',
                        overflow: 'hidden',
                        border: `2px solid ${activeStep === idx ? stage.themeColor : 'rgba(255, 255, 255, 0.12)'}`,
                        boxShadow: `0 20px 50px -10px ${stage.themeColor}30, 0 10px 30px rgba(0,0,0,0.5)`,
                        background: '#0F172A',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        transform: activeStep === idx ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      {/* Diorama Image */}
                      <img
                        src={stage.image}
                        alt={`${stage.title} 3D Diorama World`}
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          objectFit: 'cover',
                          maxHeight: '480px',
                        }}
                      />

                      {/* Glassmorphism Floating HUD Card Overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '16px',
                          left: '16px',
                          right: '16px',
                          background: 'rgba(15, 23, 42, 0.82)',
                          backdropFilter: 'blur(14px)',
                          borderRadius: '18px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          padding: '1rem 1.25rem',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: stage.themeColor,
                                boxShadow: `0 0 10px ${stage.themeColor}`,
                              }}
                            />
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>
                              {stage.hudTitle}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: stage.themeColor,
                              background: `${stage.themeColor}20`,
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            STAGE {stage.stepNum}
                          </span>
                        </div>

                        {/* Checklist */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '6px',
                          }}
                        >
                          {stage.hudChecklist.map((item, cIdx) => (
                            <div
                              key={cIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.74rem',
                                color: '#E2E8F0',
                              }}
                            >
                              <CheckCircle2 size={13} color={stage.themeColor} style={{ flexShrink: 0 }} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CONTENT & ACTION HUD COLUMN */}
                  <div style={{ order: isEven ? 2 : 1 }}>
                    {/* Stage Header Tag */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: `${stage.themeColor}20`,
                        border: `1px solid ${stage.themeColor}60`,
                        color: stage.themeColor,
                        padding: '4px 14px',
                        borderRadius: '999px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        marginBottom: '1rem',
                      }}
                    >
                      <span>STAGE {stage.stepNum}</span>
                      <span>•</span>
                      <span>{stage.badge.toUpperCase()}</span>
                    </div>

                    <h2
                      style={{
                        fontSize: 'clamp(1.85rem, 3vw, 2.5rem)',
                        fontWeight: 900,
                        color: '#FFFFFF',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                        marginBottom: '0.75rem',
                      }}
                    >
                      {stage.title}
                    </h2>

                    <p
                      style={{
                        fontSize: '1.02rem',
                        color: '#94A3B8',
                        lineHeight: 1.6,
                        marginBottom: '1.5rem',
                      }}
                    >
                      {stage.subtitle}
                    </p>

                    {/* 4 Interactive Process Action Pills */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '0.75rem',
                        marginBottom: '1.75rem',
                      }}
                    >
                      {stage.steps.map((stepItem, stepIdx) => {
                        const Icon = stepItem.icon;
                        return (
                          <div
                            key={stepIdx}
                            style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '14px',
                              padding: '0.85rem 1rem',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.75rem',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <div
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                background: `${stage.themeColor}25`,
                                color: stage.themeColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginTop: '2px',
                              }}
                            >
                              <Icon size={16} />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>
                                {stepItem.title}
                              </div>
                              <div style={{ fontSize: '0.73rem', color: '#94A3B8', marginTop: '2px', lineHeight: 1.35 }}>
                                {stepItem.desc}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Stage CTA Button & Quote */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={stage.actionOnClick}
                        style={{
                          padding: '0.85rem 1.75rem',
                          borderRadius: '12px',
                          fontSize: '0.92rem',
                          fontWeight: 800,
                          border: 'none',
                          background: stage.themeColor,
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: `0 4px 20px ${stage.themeColor}50`,
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = `0 8px 25px ${stage.themeColor}70`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = `0 4px 20px ${stage.themeColor}50`;
                        }}
                      >
                        <span>{stage.actionLabel}</span>
                        <ArrowRight size={16} />
                      </button>

                      <div
                        style={{
                          fontSize: '0.82rem',
                          color: '#64748B',
                          fontStyle: 'italic',
                          fontWeight: 600,
                          maxWidth: '280px',
                        }}
                      >
                        {stage.quote}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEAMLESS CONNECTING GLOW PATHWAY (Rendered between stages) */}
              {idx < stagesData.length - 1 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem 0',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      height: '60px',
                      width: '2px',
                      background: `linear-gradient(180deg, ${stage.themeColor}, ${stagesData[idx + 1].themeColor})`,
                      boxShadow: `0 0 12px ${stage.themeColor}`,
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#0B1329',
                        border: `2px solid ${stagesData[idx + 1].themeColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stagesData[idx + 1].themeColor,
                        fontSize: '0.65rem',
                        fontWeight: 900,
                      }}
                    >
                      ↓
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#64748B',
                      letterSpacing: '0.05em',
                      marginTop: '6px',
                    }}
                  >
                    CONTINUOUS HIGHWAY TO STAGE {stagesData[idx + 1].stepNum}
                  </span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ================= FINAL VIKSIT BHARAT SUMMARY BANNER ================= */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1360px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '28px',
            padding: '3rem 2.5rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(37,99,235,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2.5rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle decorative glow */}
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '250px',
              height: '250px',
              background: 'rgba(59, 130, 246, 0.25)',
              filter: 'blur(80px)',
              borderRadius: '50%',
            }}
          />

          <div style={{ maxWidth: '680px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(59,130,246,0.15)',
                color: '#60A5FA',
                padding: '4px 14px',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: '1rem',
              }}
            >
              <Sparkles size={14} /> National Grassroots Movement
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.4rem)',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                marginBottom: '0.75rem',
              }}
            >
              Real Problems. Real People. <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #34D399, #60A5FA)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                A Stronger Tomorrow.
              </span>
            </h2>

            <p style={{ color: '#94A3B8', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
              Join the unified national ecosystem turning local community challenges into scalable, patented, and funded innovations.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onOpenAuth && onOpenAuth('register')}
              style={{
                padding: '1rem 2rem',
                borderRadius: '14px',
                fontSize: '0.98rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(37,99,235,0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Get Started Now</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => onNavigateTab && onNavigateTab('problems')}
              style={{
                padding: '1rem 2rem',
                borderRadius: '14px',
                fontSize: '0.98rem',
                fontWeight: 700,
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
              }}
            >
              Explore Live Problems
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
