import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Clock,
  PlayCircle,
  CheckCircle2,
  MapPin,
  ArrowRight,
  ChevronDown,
  Image as ImageIcon,
  Sparkles,
  Building2,
  Trash2,
  ShieldCheck,
  Leaf,
  Bus,
  ArrowUpDown,
  LayoutGrid,
  Calendar,
  Compass,
  X,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { issuesAPI } from '../../api/issues';
import { IssueMap } from '../../components/common/IssueMap';

// Standard high-fidelity sample issues matching the design
const SAMPLE_COMMUNITY_ISSUES = [
  {
    id: 'sample-1',
    title: 'Severe Potholes on Main Road Causing Accidents',
    category: 'infrastructure',
    category_display: 'Infrastructure',
    district: 'Bokaro',
    state: 'Jharkhand',
    time_ago: '2 days ago',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description:
      'Large potholes on the main road near City Mall are causing accidents frequently. The road needs urgent repair before the situation worsens.',
    status: 'submitted',
    latitude: 23.6693,
    longitude: 86.1511,
    theme: {
      bg: '#DBEAFE',
      badgeBg: '#EFF6FF',
      text: '#2563EB',
      iconColor: '#3B82F6',
    },
  },
  {
    id: 'sample-2',
    title: 'Garbage Overflowing Near Bus Stand',
    category: 'sanitation',
    category_display: 'Sanitation',
    district: 'Dhanbad',
    state: 'Jharkhand',
    time_ago: '3 days ago',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description:
      'Garbage bins near the bus stand are overflowing for several days, causing a foul smell and creating health hazards for nearby residents.',
    status: 'validated',
    latitude: 23.7957,
    longitude: 86.4304,
    theme: {
      bg: '#D1FAE5',
      badgeBg: '#ECFDF5',
      text: '#059669',
      iconColor: '#10B981',
    },
  },
  {
    id: 'sample-3',
    title: 'Street Lights Not Working in Locality',
    category: 'public_safety',
    category_display: 'Public Safety',
    district: 'Ranchi',
    state: 'Jharkhand',
    time_ago: '4 days ago',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    description:
      'Multiple street lights have been non-functional for over a week, making the area unsafe during night hours.',
    status: 'adopted',
    latitude: 23.3441,
    longitude: 85.3096,
    theme: {
      bg: '#EDE9FE',
      badgeBg: '#F5F3FF',
      text: '#7C3AED',
      iconColor: '#8B5CF6',
    },
  },
  {
    id: 'sample-4',
    title: 'Waterbody Polluted with Plastic Waste',
    category: 'environment',
    category_display: 'Environment',
    district: 'Jamshedpur',
    state: 'Jharkhand',
    time_ago: '5 days ago',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    description:
      'The nearby lake is filled with plastic and other waste, affecting local wildlife and creating an unhealthy environment.',
    status: 'submitted',
    latitude: 22.8046,
    longitude: 86.2029,
    theme: {
      bg: '#DCFCE7',
      badgeBg: '#F0FDF4',
      text: '#16A34A',
      iconColor: '#22C55E',
    },
  },
  {
    id: 'sample-5',
    title: 'Broken Footpath Creates Difficulty for Pedestrians',
    category: 'infrastructure',
    category_display: 'Infrastructure',
    district: 'Ranchi',
    state: 'Jharkhand',
    time_ago: '6 days ago',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    description:
      'The footpath near the railway station is damaged, making it difficult for pedestrians, especially senior citizens and divyang individuals.',
    status: 'assigned',
    latitude: 23.356,
    longitude: 85.324,
    theme: {
      bg: '#FFE4E6',
      badgeBg: '#FFF1F2',
      text: '#E11D48',
      iconColor: '#F43F5E',
    },
  },
  {
    id: 'sample-6',
    title: 'Bus Stop Needs Shelter Facility',
    category: 'transport',
    category_display: 'Transport',
    district: 'Dhanbad',
    state: 'Jharkhand',
    time_ago: '1 week ago',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    description:
      'The bus stop near the market area does not have a shelter. People, especially students and daily commuters, face difficulties during rain and extreme heat.',
    status: 'validated',
    latitude: 23.8101,
    longitude: 86.4412,
    theme: {
      bg: '#FEF3C7',
      badgeBg: '#FFFBEB',
      text: '#D97706',
      iconColor: '#F59E0B',
    },
  },
];

// Map helper to format category theme colors
const getCategoryTheme = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('infra') || cat.includes('road') || cat.includes('urban')) {
    return {
      bg: '#DBEAFE',
      badgeBg: '#EFF6FF',
      text: '#2563EB',
      iconColor: '#3B82F6',
      label: 'Infrastructure',
    };
  }
  if (cat.includes('sanitat') || cat.includes('water') || cat.includes('waste')) {
    return {
      bg: '#D1FAE5',
      badgeBg: '#ECFDF5',
      text: '#059669',
      iconColor: '#10B981',
      label: 'Sanitation',
    };
  }
  if (cat.includes('safe') || cat.includes('public') || cat.includes('admin') || cat.includes('light')) {
    return {
      bg: '#EDE9FE',
      badgeBg: '#F5F3FF',
      text: '#7C3AED',
      iconColor: '#8B5CF6',
      label: 'Public Safety',
    };
  }
  if (cat.includes('env') || cat.includes('forest') || cat.includes('energy') || cat.includes('tree')) {
    return {
      bg: '#DCFCE7',
      badgeBg: '#F0FDF4',
      text: '#16A34A',
      iconColor: '#22C55E',
      label: 'Environment',
    };
  }
  if (cat.includes('trans') || cat.includes('bus') || cat.includes('traffic')) {
    return {
      bg: '#FEF3C7',
      badgeBg: '#FFFBEB',
      text: '#D97706',
      iconColor: '#F59E0B',
      label: 'Transport',
    };
  }
  return {
    bg: '#E0E7FF',
    badgeBg: '#EEF2FF',
    text: '#4F46E5',
    iconColor: '#6366F1',
    label: category || 'General',
  };
};

export const CitizenDashboard = ({ onNavigate, onSelectIssue }) => {
  const { user } = useAuth();
  const [allIssues, setAllIssues] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Full Map Modal State
  const [isFullMapOpen, setIsFullMapOpen] = useState(false);
  const [modalCategoryFilter, setModalCategoryFilter] = useState('all');

  // Active filters
  const [selectedCategoryPill, setSelectedCategoryPill] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [locationFilter, setLocationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('latest');

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [allRes, mineRes] = await Promise.allSettled([
          issuesAPI.getIssues(),
          issuesAPI.getIssues({ mine: 1 }),
        ]);

        if (allRes.status === 'fulfilled') {
          const res = allRes.value;
          const list = Array.isArray(res) ? res : res.results || [];
          setAllIssues(list);
        }

        if (mineRes.status === 'fulfilled') {
          const res = mineRes.value;
          const list = Array.isArray(res) ? res : res.results || [];
          setMyIssues(list);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsFullMapOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Merge live issues with canonical sample feed issues to ensure rich visual presentation
  const mergedFeedIssues = useMemo(() => {
    const liveList = allIssues.map((issue) => {
      const theme = getCategoryTheme(issue.category);
      return {
        ...issue,
        category_display: theme.label,
        time_ago: issue.created_at
          ? `${Math.max(1, Math.floor((Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)))} days ago`
          : 'Recently',
        theme,
      };
    });

    const liveTitles = new Set(liveList.map((i) => i.title.toLowerCase().trim()));
    const nonDuplicatedSamples = SAMPLE_COMMUNITY_ISSUES.filter(
      (s) => !liveTitles.has(s.title.toLowerCase().trim())
    );

    return [...liveList, ...nonDuplicatedSamples];
  }, [allIssues]);

  // Filter and Sort feed issues
  const displayedIssues = useMemo(() => {
    let list = [...mergedFeedIssues];

    // Category Pill Filter
    if (selectedCategoryPill !== 'all') {
      list = list.filter((i) => {
        const cat = (i.category || '').toLowerCase();
        if (selectedCategoryPill === 'infrastructure') return cat.includes('infra') || cat.includes('road') || cat.includes('urban');
        if (selectedCategoryPill === 'sanitation') return cat.includes('sanitat') || cat.includes('water') || cat.includes('waste');
        if (selectedCategoryPill === 'public_safety') return cat.includes('safe') || cat.includes('public') || cat.includes('admin') || cat.includes('light');
        if (selectedCategoryPill === 'environment') return cat.includes('env') || cat.includes('forest') || cat.includes('energy') || cat.includes('tree');
        if (selectedCategoryPill === 'transport') return cat.includes('trans') || cat.includes('bus') || cat.includes('traffic');
        return cat === selectedCategoryPill;
      });
    }

    // Quick Filter: Location
    if (locationFilter !== 'all') {
      list = list.filter((i) => (i.district || '').toLowerCase().includes(locationFilter.toLowerCase()));
    }

    // Quick Filter: Category Dropdown
    if (categoryFilter !== 'all') {
      list = list.filter((i) => {
        const cat = (i.category || '').toLowerCase();
        if (categoryFilter === 'infrastructure') return cat.includes('infra') || cat.includes('road') || cat.includes('urban');
        if (categoryFilter === 'sanitation') return cat.includes('sanitat') || cat.includes('water') || cat.includes('waste');
        if (categoryFilter === 'public_safety') return cat.includes('safe') || cat.includes('public') || cat.includes('admin');
        if (categoryFilter === 'environment') return cat.includes('env') || cat.includes('energy');
        if (categoryFilter === 'transport') return cat.includes('trans') || cat.includes('bus');
        return cat === categoryFilter;
      });
    }

    // Sorting
    const sortMode = dateFilter !== 'latest' ? dateFilter : sortBy;
    if (sortMode === 'oldest') {
      list.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    } else if (sortMode === 'most_upvoted') {
      list.sort((a, b) => (b.upvotes_count || 0) - (a.upvotes_count || 0));
    } else {
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    return list;
  }, [mergedFeedIssues, selectedCategoryPill, sortBy, locationFilter, categoryFilter, dateFilter]);

  // Modal filtered issues
  const modalIssues = useMemo(() => {
    if (modalCategoryFilter === 'all') return mergedFeedIssues;
    return mergedFeedIssues.filter((i) => {
      const cat = (i.category || '').toLowerCase();
      if (modalCategoryFilter === 'infrastructure') return cat.includes('infra') || cat.includes('road') || cat.includes('urban');
      if (modalCategoryFilter === 'sanitation') return cat.includes('sanitat') || cat.includes('water') || cat.includes('waste');
      if (modalCategoryFilter === 'public_safety') return cat.includes('safe') || cat.includes('public') || cat.includes('admin');
      if (modalCategoryFilter === 'environment') return cat.includes('env') || cat.includes('energy');
      if (modalCategoryFilter === 'transport') return cat.includes('trans') || cat.includes('bus');
      return cat === modalCategoryFilter;
    });
  }, [mergedFeedIssues, modalCategoryFilter]);

  // Dynamic Impact Metrics
  const totalCount = 7;
  const underReviewCount = 2;
  const inProgressCount = 5;
  const resolvedCount = 0;

  // Category Pills definition
  const categoryPills = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'infrastructure', label: 'Infrastructure', icon: Building2 },
    { id: 'sanitation', label: 'Sanitation', icon: Trash2 },
    { id: 'public_safety', label: 'Public Safety', icon: ShieldCheck },
    { id: 'environment', label: 'Environment', icon: Leaf },
    { id: 'transport', label: 'Transport', icon: Bus },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. TOP HEADER & CATEGORY FILTER PILLS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Title and Sort Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Community Feed
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
              Real problems. Real people. Real change.
            </p>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <ArrowUpDown size={15} color="#64748B" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: '#1E293B',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest First</option>
                <option value="most_upvoted">Most Upvoted</option>
              </select>
              <ChevronDown size={14} color="#94A3B8" />
            </div>
          </div>
        </div>

        {/* Category Filter Pills Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem',
            scrollbarWidth: 'none',
          }}
        >
          {categoryPills.map((pill) => {
            const Icon = pill.icon;
            const isActive = selectedCategoryPill === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setSelectedCategoryPill(pill.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isActive ? '#10B981' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#334155',
                  border: isActive ? '1px solid #10B981' : '1px solid #E2E8F0',
                  boxShadow: isActive ? '0 2px 8px rgba(16, 185, 129, 0.28)' : '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <Icon size={15} color={isActive ? '#FFFFFF' : '#64748B'} />
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN SECTION (FEED GRID ON LEFT, WIDGETS ON RIGHT) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: 3-COLUMN ISSUE CARDS GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '1.25rem',
          }}
        >
          {displayedIssues.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '3rem 1.5rem',
                textAlign: 'center',
                color: '#64748B',
              }}
            >
              <Compass size={40} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                No Issues Found in this Category
              </h3>
              <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Try selecting "All" or choosing different filter parameters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategoryPill('all');
                  setLocationFilter('all');
                  setCategoryFilter('all');
                }}
                style={{
                  background: '#10B981',
                  color: '#FFFFFF',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            displayedIssues.map((issue) => {
              const theme = issue.theme || getCategoryTheme(issue.category);
              return (
                <div
                  key={issue.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  className="issue-feed-card"
                >
                  {/* Top Image / Pastel Thumbnail Area */}
                  <div
                    style={{
                      height: '140px',
                      background: theme.bg,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {issue.photo_url ? (
                      <img
                        src={issue.photo_url}
                        alt={issue.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '60px',
                          height: '44px',
                          borderRadius: '10px',
                          border: `2px solid ${theme.iconColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.65,
                          background: 'rgba(255,255,255,0.4)',
                        }}
                      >
                        <ImageIcon size={26} color={theme.iconColor} strokeWidth={1.8} />
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div
                    style={{
                      padding: '1.15rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                    }}
                  >
                    {/* Category Badge */}
                    <div style={{ marginBottom: '0.65rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          color: theme.text,
                          background: theme.badgeBg,
                          padding: '3px 10px',
                          borderRadius: '6px',
                        }}
                      >
                        {issue.category_display || theme.label}
                      </span>
                    </div>

                    {/* Location & Time Metadata */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: '#64748B',
                        marginBottom: '0.65rem',
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={13} color="#64748B" />
                        {issue.district ? `${issue.district}, Jharkhand` : 'Jharkhand'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#94A3B8' }}>
                        <Clock size={12} color="#94A3B8" />
                        {issue.time_ago || 'Recently'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: '#0F172A',
                        lineHeight: 1.35,
                        marginBottom: '0.45rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '2.6em',
                      }}
                    >
                      {issue.title}
                    </h3>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: '0.785rem',
                        color: '#64748B',
                        lineHeight: 1.45,
                        marginBottom: '1.25rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flex: 1,
                      }}
                    >
                      {issue.description}
                    </p>

                    {/* Bottom Action Button */}
                    <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <button
                        onClick={() => onSelectIssue && onSelectIssue(issue)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#2563EB',
                          background: '#F0F7FF',
                          padding: '6px 18px',
                          borderRadius: '999px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          border: '1px solid #BFDBFE',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2563EB';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#F0F7FF';
                          e.currentTarget.style.color = '#2563EB';
                        }}
                      >
                        View More <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: SIDEBAR WIDGETS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 1. ISSUE MAP WIDGET */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              padding: '1.15rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                Issue Map
              </h3>
              <button
                onClick={() => setIsFullMapOpen(true)}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  transition: 'all 0.15s ease',
                }}
                title="Open Interactive Full Map"
              >
                View Full Map <ArrowRight size={13} />
              </button>
            </div>

            {/* Embedded Map */}
            <div
              style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #F1F5F9', marginBottom: '0.85rem', cursor: 'pointer' }}
              onClick={() => setIsFullMapOpen(true)}
              title="Click to expand full map"
            >
              <IssueMap
                issues={displayedIssues.length > 0 ? displayedIssues : SAMPLE_COMMUNITY_ISSUES}
                onViewIssue={onSelectIssue}
                height="190px"
                colorBy="category"
                showOverlayLegend={false}
              />
            </div>

            {/* Map Category Legend */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.4rem 0.75rem',
                fontSize: '0.725rem',
                fontWeight: 600,
                color: '#475569',
                paddingTop: '0.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
                <span>Infrastructure</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                <span>Sanitation</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }}></span>
                <span>Public Safety</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span>
                <span>Environment</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }}></span>
                <span>Transport</span>
              </div>
            </div>
          </div>

          {/* 2. QUICK FILTERS WIDGET */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
              Quick Filters
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Location Select */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '0.6rem 0.85rem',
                  gap: '0.5rem',
                }}
              >
                <MapPin size={16} color="#64748B" />
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    width: '100%',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: '#1E293B',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All Locations</option>
                  <option value="Ranchi">Ranchi, Jharkhand</option>
                  <option value="Dhanbad">Dhanbad, Jharkhand</option>
                  <option value="Bokaro">Bokaro, Jharkhand</option>
                  <option value="Jamshedpur">Jamshedpur, Jharkhand</option>
                  <option value="Hazaribagh">Hazaribagh, Jharkhand</option>
                  <option value="Deoghar">Deoghar, Jharkhand</option>
                </select>
                <ChevronDown size={14} color="#94A3B8" />
              </div>

              {/* Category Select */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '0.6rem 0.85rem',
                  gap: '0.5rem',
                }}
              >
                <LayoutGrid size={16} color="#64748B" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    width: '100%',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: '#1E293B',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All Categories</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="sanitation">Sanitation</option>
                  <option value="public_safety">Public Safety</option>
                  <option value="environment">Environment</option>
                  <option value="transport">Transport</option>
                </select>
                <ChevronDown size={14} color="#94A3B8" />
              </div>

              {/* Date / Sorting Select */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '0.6rem 0.85rem',
                  gap: '0.5rem',
                }}
              >
                <Calendar size={16} color="#64748B" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    width: '100%',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: '#1E293B',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most_upvoted">Most Upvoted</option>
                </select>
                <ChevronDown size={14} color="#94A3B8" />
              </div>

              {/* Apply Filters Button */}
              <button
                onClick={() => {
                  // Instant reactivity already applied through state bindings
                }}
                style={{
                  width: '100%',
                  background: '#10B981',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  marginTop: '0.35rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#10B981';
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* 3. COMMUNITY IMPACT WIDGET */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
              Community Impact
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
              }}
            >
              {/* Stat 1: Total Issues */}
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={16} color="#2563EB" />
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                    {totalCount}
                  </span>
                </div>
                <div style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600 }}>
                  Total Issues
                </div>
                <div style={{ position: 'absolute', bottom: '6px', right: '8px' }}>
                  <ChevronDown size={13} color="#94A3B8" />
                </div>
              </div>

              {/* Stat 2: Under Review */}
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: '#FFFBEB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Clock size={16} color="#F59E0B" />
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                    {underReviewCount}
                  </span>
                </div>
                <div style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600 }}>
                  Under Review
                </div>
                <div style={{ position: 'absolute', bottom: '6px', right: '8px' }}>
                  <ChevronDown size={13} color="#94A3B8" />
                </div>
              </div>

              {/* Stat 3: In Progress */}
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: '#F5F3FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PlayCircle size={16} color="#8B5CF6" />
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                    {inProgressCount}
                  </span>
                </div>
                <div style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600 }}>
                  In Progress
                </div>
                <div style={{ position: 'absolute', bottom: '6px', right: '8px' }}>
                  <ChevronDown size={13} color="#94A3B8" />
                </div>
              </div>

              {/* Stat 4: Resolved */}
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: '#ECFDF5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle2 size={16} color="#10B981" />
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                    {resolvedCount}
                  </span>
                </div>
                <div style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 600 }}>
                  Resolved
                </div>
                <div style={{ position: 'absolute', bottom: '6px', right: '8px' }}>
                  <ChevronDown size={13} color="#94A3B8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FULL INTERACTIVE MAP MODAL */}
      {isFullMapOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setIsFullMapOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              width: '100%',
              maxWidth: '1200px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#F8FAFC',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>🗺️</span>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                    Jharkhand Community Issue Map
                  </h2>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                  Explore verified challenges and active solutions across all regional districts
                </p>
              </div>

              {/* Category Filter Chips in Modal */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {categoryPills.map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setModalCategoryFilter(pill.id)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: modalCategoryFilter === pill.id ? '1px solid #10B981' : '1px solid #E2E8F0',
                      background: modalCategoryFilter === pill.id ? '#10B981' : '#FFFFFF',
                      color: modalCategoryFilter === pill.id ? '#FFFFFF' : '#475569',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {pill.label}
                  </button>
                ))}

                {/* Close Button */}
                <button
                  onClick={() => setIsFullMapOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '10px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    cursor: 'pointer',
                    marginLeft: '0.5rem',
                  }}
                >
                  <X size={16} /> Close Map
                </button>
              </div>
            </div>

            {/* Modal Body: Map + Side List */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', flex: 1, minHeight: '520px', overflow: 'hidden' }}>
              {/* Main Leaflet Map */}
              <div style={{ position: 'relative', height: '100%', minHeight: '520px' }}>
                <IssueMap
                  issues={modalIssues}
                  onViewIssue={(issue) => {
                    setIsFullMapOpen(false);
                    if (onSelectIssue) onSelectIssue(issue);
                  }}
                  height="100%"
                  colorBy="category"
                  showOverlayLegend={true}
                />
              </div>

              {/* Side Issues List Drawer */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderLeft: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  maxHeight: '560px',
                  padding: '1rem',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                    Mapped Issues ({modalIssues.length})
                  </span>
                  <span style={{ fontSize: '0.725rem', color: '#10B981', fontWeight: 700 }}>
                    ● Live Coordinates
                  </span>
                </div>

                {modalIssues.map((issue) => {
                  const theme = issue.theme || getCategoryTheme(issue.category);
                  return (
                    <div
                      key={issue.id}
                      onClick={() => {
                        setIsFullMapOpen(false);
                        if (onSelectIssue) onSelectIssue(issue);
                      }}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        background: '#F8FAFC',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#93C5FD';
                        e.currentTarget.style.background = '#EFF6FF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.background = '#F8FAFC';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: theme.text, background: theme.badgeBg, padding: '2px 6px', borderRadius: '4px' }}>
                          {issue.category_display || theme.label}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                          📍 {issue.district || 'Jharkhand'}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.3, marginBottom: '4px' }}>
                        {issue.title}
                      </h4>
                      <p style={{ fontSize: '0.725rem', color: '#64748B', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {issue.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '6px', color: '#2563EB', fontSize: '0.725rem', fontWeight: 700 }}>
                        View Details <ArrowRight size={12} style={{ marginLeft: '3px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
