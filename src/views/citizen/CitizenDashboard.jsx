import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  Clock,
  PlayCircle,
  CheckCircle2,
  MapPin,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Sparkles,
  Building2,
  Trash2,
  ShieldCheck,
  Leaf,
  ArrowUpDown,
  LayoutGrid,
  Calendar,
  Compass,
  X,
  RefreshCw,
  Search,
  Home,
  Plus,
  ListTodo,
  User,
  Droplets,
  Trees,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { issuesAPI } from '../../api/issues';
import { IssueMap } from '../../components/common/IssueMap';

// Map helper to format category theme colors and human-readable badges
const getCategoryTheme = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('water') || cat.includes('sanitat')) {
    return {
      bg: '#D1FAE5',
      badgeBg: '#ECFDF5',
      text: '#059669',
      iconColor: '#10B981',
      label: 'Water & Sanitation',
    };
  }
  if (cat.includes('agri') || cat.includes('farm')) {
    return {
      bg: '#FEF3C7',
      badgeBg: '#FFFBEB',
      text: '#D97706',
      iconColor: '#F59E0B',
      label: 'Agriculture',
    };
  }
  if (cat.includes('edu') || cat.includes('school')) {
    return {
      bg: '#DBEAFE',
      badgeBg: '#EFF6FF',
      text: '#2563EB',
      iconColor: '#3B82F6',
      label: 'Education',
    };
  }
  if (cat.includes('env') || cat.includes('forest')) {
    return {
      bg: '#DCFCE7',
      badgeBg: '#F0FDF4',
      text: '#16A34A',
      iconColor: '#22C55E',
      label: 'Environment & Forests',
    };
  }
  if (cat.includes('energy') || cat.includes('solar') || cat.includes('power')) {
    return {
      bg: '#FEF9C3',
      badgeBg: '#FEF08A',
      text: '#CA8A04',
      iconColor: '#EAB308',
      label: 'Renewable Energy',
    };
  }
  if (cat.includes('infra') || cat.includes('road') || cat.includes('urban')) {
    return {
      bg: '#E0F2FE',
      badgeBg: '#F0F9FF',
      text: '#0284C7',
      iconColor: '#0EA5E9',
      label: 'Urban Infrastructure',
    };
  }
  if (cat.includes('rural') || cat.includes('livelihood') || cat.includes('artisan') || cat.includes('handloom') || cat.includes('tribal')) {
    return {
      bg: '#FFEDD5',
      badgeBg: '#FFF7ED',
      text: '#EA580C',
      iconColor: '#F97316',
      label: 'Rural Livelihoods',
    };
  }
  if (cat.includes('health') || cat.includes('medic')) {
    return {
      bg: '#FFE4E6',
      badgeBg: '#FFF1F2',
      text: '#E11D48',
      iconColor: '#F43F5E',
      label: 'Healthcare',
    };
  }
  if (cat.includes('safe') || cat.includes('public') || cat.includes('admin')) {
    return {
      bg: '#EDE9FE',
      badgeBg: '#F5F3FF',
      text: '#7C3AED',
      iconColor: '#8B5CF6',
      label: 'Public Administration',
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
    label: category ? category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'General',
  };
};

// Curated contextual photo fallbacks matching Jharkhand civic & problem categories
const getCategoryFallbackImage = (category, title) => {
  const cat = (category || '').toLowerCase();
  const t = (title || '').toLowerCase();
  if (cat.includes('water') || cat.includes('sanitat') || t.includes('water')) {
    return 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=400&auto=format&fit=crop&q=80';
  }
  if (cat.includes('agri') || cat.includes('farm') || t.includes('crop') || t.includes('soil')) {
    return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80';
  }
  if (cat.includes('edu') || cat.includes('school') || t.includes('teacher') || t.includes('school')) {
    return 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&auto=format&fit=crop&q=80';
  }
  if (cat.includes('env') || cat.includes('forest') || cat.includes('pollut') || t.includes('slag') || t.includes('smoke') || t.includes('mud')) {
    return 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&auto=format&fit=crop&q=80';
  }
  if (cat.includes('energy') || cat.includes('solar') || cat.includes('power')) {
    return 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&auto=format&fit=crop&q=80';
  }
  if (cat.includes('rural') || cat.includes('livelihood') || cat.includes('handloom') || cat.includes('artisan') || cat.includes('tribal') || t.includes('jacquard')) {
    return 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=400&auto=format&fit=crop&q=80';
  }
  if (cat.includes('health') || cat.includes('medic') || cat.includes('clinic')) {
    return 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=80';
  }
  if (cat.includes('infra') || cat.includes('road') || cat.includes('urban') || t.includes('bridge') || t.includes('defect') || t.includes('tree')) {
    return 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&auto=format&fit=crop&q=80';
};

export const CitizenDashboard = ({ onNavigate, onSelectIssue }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [allIssues, setAllIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Full Map Modal State
  const [isFullMapOpen, setIsFullMapOpen] = useState(false);
  const [modalCategoryFilter, setModalCategoryFilter] = useState('all');

  // Active filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryPill, setSelectedCategoryPill] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [locationFilter, setLocationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('latest');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await issuesAPI.getIssues();
      const list = Array.isArray(res) ? res : res.results || [];
      setAllIssues(list);
    } catch (err) {
      console.error('Failed to load dashboard issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // Format real database issues with category badges & formatted timestamps
  const feedIssues = useMemo(() => {
    return allIssues.map((issue) => {
      const theme = getCategoryTheme(issue.category);
      const daysDiff = issue.created_at
        ? Math.max(1, Math.floor((Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)))
        : 1;
      return {
        ...issue,
        category_display: theme.label,
        time_ago: daysDiff === 1 ? '1 day ago' : `${daysDiff} days ago`,
        theme,
        preview_image: issue.photo_url || issue.photo || getCategoryFallbackImage(issue.category, issue.title),
      };
    });
  }, [allIssues]);

  // Dynamically extract unique districts from database issues
  const availableDistricts = useMemo(() => {
    const set = new Set(allIssues.map((i) => i.district).filter(Boolean));
    return Array.from(set).sort();
  }, [allIssues]);

  // Dynamically extract unique categories from database issues
  const availableCategories = useMemo(() => {
    const map = new Map();
    allIssues.forEach((i) => {
      if (i.category && !map.has(i.category)) {
        map.set(i.category, getCategoryTheme(i.category).label);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [allIssues]);

  // Filter and Sort feed issues strictly from database records
  const displayedIssues = useMemo(() => {
    let list = [...feedIssues];

    // Search Query Filter
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) =>
          (i.title || '').toLowerCase().includes(q) ||
          (i.description || '').toLowerCase().includes(q) ||
          (i.district || '').toLowerCase().includes(q) ||
          (i.category || '').toLowerCase().includes(q) ||
          (i.category_display || '').toLowerCase().includes(q)
      );
    }

    // Category Pill Filter
    if (selectedCategoryPill !== 'all') {
      list = list.filter((i) => {
        const cat = (i.category || '').toLowerCase();
        if (selectedCategoryPill === 'urban_infra') return cat.includes('infra') || cat.includes('urban') || cat.includes('road');
        if (selectedCategoryPill === 'water') return cat.includes('water') || cat.includes('sanitat');
        if (selectedCategoryPill === 'agriculture') return cat.includes('agri') || cat.includes('farm');
        if (selectedCategoryPill === 'environment') return cat.includes('env') || cat.includes('forest');
        if (selectedCategoryPill === 'energy') return cat.includes('energy') || cat.includes('solar') || cat.includes('power');
        if (selectedCategoryPill === 'education') return cat.includes('edu') || cat.includes('school');
        if (selectedCategoryPill === 'rural_livelihoods') return cat.includes('rural') || cat.includes('livelihood') || cat.includes('artisan') || cat.includes('handloom') || cat.includes('tribal');
        if (selectedCategoryPill === 'public_admin') return cat.includes('public') || cat.includes('admin') || cat.includes('safe');
        return cat === selectedCategoryPill;
      });
    }

    // Quick Filter: Location
    if (locationFilter !== 'all') {
      list = list.filter((i) => (i.district || '').toLowerCase() === locationFilter.toLowerCase());
    }

    // Quick Filter: Category Dropdown
    if (categoryFilter !== 'all') {
      list = list.filter((i) => (i.category || '').toLowerCase() === categoryFilter.toLowerCase());
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
  }, [feedIssues, searchQuery, selectedCategoryPill, sortBy, locationFilter, categoryFilter, dateFilter]);

  // Modal filtered issues
  const modalIssues = useMemo(() => {
    if (modalCategoryFilter === 'all') return feedIssues;
    return feedIssues.filter((i) => {
      const cat = (i.category || '').toLowerCase();
      if (modalCategoryFilter === 'urban_infra') return cat.includes('infra') || cat.includes('urban') || cat.includes('road');
      if (modalCategoryFilter === 'water') return cat.includes('water') || cat.includes('sanitat');
      if (modalCategoryFilter === 'agriculture') return cat.includes('agri') || cat.includes('farm');
      if (modalCategoryFilter === 'environment') return cat.includes('env') || cat.includes('forest');
      if (modalCategoryFilter === 'energy') return cat.includes('energy') || cat.includes('solar') || cat.includes('power');
      if (modalCategoryFilter === 'education') return cat.includes('edu') || cat.includes('school');
      if (modalCategoryFilter === 'rural_livelihoods') return cat.includes('rural') || cat.includes('livelihood') || cat.includes('artisan') || cat.includes('handloom') || cat.includes('tribal');
      if (modalCategoryFilter === 'public_admin') return cat.includes('public') || cat.includes('admin') || cat.includes('safe');
      return cat === modalCategoryFilter;
    });
  }, [feedIssues, modalCategoryFilter]);

  // Dynamic Impact Metrics from real database issues
  const totalCount = allIssues.length;
  const underReviewCount = allIssues.filter((i) =>
    ['submitted', 'validating', 'validated', 'under_review'].includes(i.status)
  ).length;
  const inProgressCount = allIssues.filter((i) =>
    [
      'adopted',
      'open',
      'pitching',
      'solution_selected',
      'selected',
      'assigned',
      'project',
      'prototype',
      'pilot',
      'in_progress',
      'developed',
      'testing',
      'piloting',
    ].includes(i.status)
  ).length;
  const resolvedCount = allIssues.filter((i) =>
    ['deployed', 'verified', 'resolved'].includes(i.status)
  ).length;

  // Category Pills definition matching the screenshot
  const categoryPills = [
    { id: 'all', label: 'All', icon: LayoutGrid },
    { id: 'water', label: 'Water & Sanitation', icon: Droplets },
    { id: 'agriculture', label: 'Agriculture', icon: Leaf },
    { id: 'urban_infra', label: 'Infrastructure', icon: Building2 },
    { id: 'environment', label: 'Environment', icon: Trees },
    { id: 'education', label: 'Education', icon: Compass },
    { id: 'rural_livelihoods', label: 'Rural Livelihoods', icon: Building2 },
    { id: 'energy', label: 'Energy', icon: Sparkles },
    { id: 'public_admin', label: 'Public Admin', icon: ShieldCheck },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* 0. MOBILE SEARCH SECTION (Matching Screenshot) */}
      <div className="mobile-search-section">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '999px',
            padding: '0.65rem 1rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <Search size={18} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search issues, locations, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              fontSize: '0.875rem',
              color: '#0F172A',
              outline: 'none',
              fontWeight: 500,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ color: '#94A3B8', padding: '2px', display: 'flex', alignItems: 'center' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 1. TOP HEADER & CATEGORY FILTER PILLS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Title and Sort Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Community Feed
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.15rem' }}>
              Real civic challenges and community solutions across Jharkhand
            </p>
          </div>

          {/* Sort Dropdown Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={loadDashboardData}
              className="btn btn-outline"
              style={{ padding: '0.4rem 0.65rem', borderRadius: '10px', fontSize: '0.8rem', color: '#64748B' }}
              title="Refresh Feed"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '0.45rem 0.75rem',
                borderRadius: '10px',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#334155',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <ArrowUpDown size={14} color="#64748B" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontWeight: 600,
                  fontSize: '0.825rem',
                  color: '#1E293B',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_upvoted">Most Upvoted</option>
              </select>
              <ChevronDown size={13} color="#94A3B8" />
            </div>
          </div>
        </div>

        {/* Category Filter Pills Row (Horizontally scrollable) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            overflowX: 'auto',
            paddingBottom: '0.35rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
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
                  gap: '0.45rem',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isActive ? '#10B981' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#334155',
                  border: isActive ? '1px solid #10B981' : '1px solid #E2E8F0',
                  boxShadow: isActive ? '0 2px 8px rgba(16, 185, 129, 0.28)' : '0 1px 2px rgba(0,0,0,0.02)',
                  flexShrink: 0,
                }}
              >
                <Icon size={14} color={isActive ? '#FFFFFF' : '#64748B'} />
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MOBILE FEED CARDS LIST (Matching Screenshot on Phone) */}
      <div className="mobile-feed-container" style={{ display: 'none', flexDirection: 'column', gap: '0.85rem' }}>
        {loading ? (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              color: '#64748B',
            }}
          >
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#10B981' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
              Loading Community Issues...
            </h3>
            <p style={{ fontSize: '0.8rem' }}>Fetching live database records</p>
          </div>
        ) : displayedIssues.length === 0 ? (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '2.5rem 1.25rem',
              textAlign: 'center',
              color: '#64748B',
            }}
          >
            <Compass size={36} color="#94A3B8" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
              No Issues Found
            </h3>
            <p style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
              {searchQuery
                ? `No issues found matching "${searchQuery}".`
                : 'No issues match the selected category filters.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryPill('all');
              }}
              style={{
                background: '#10B981',
                color: '#FFFFFF',
                padding: '0.45rem 1.15rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.8rem',
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
                onClick={() => onSelectIssue && onSelectIssue(issue)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '0.75rem',
                  display: 'flex',
                  gap: '0.85rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Left Thumbnail Image */}
                <div
                  style={{
                    width: '115px',
                    minWidth: '115px',
                    height: '88px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: theme.bg,
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  <img
                    src={issue.preview_image}
                    alt={issue.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = getCategoryFallbackImage(issue.category, issue.title);
                    }}
                  />
                </div>

                {/* Right Content */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minWidth: 0,
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Category Pill & Right Chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: theme.text,
                        background: theme.badgeBg,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '85%',
                      }}
                    >
                      {issue.category_display || theme.label}
                    </span>
                    <ChevronRight size={16} color="#94A3B8" />
                  </div>

                  {/* Title (2-line clamp) */}
                  <h3
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      lineHeight: 1.25,
                      margin: '3px 0 2px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {issue.title}
                  </h3>

                  {/* Location & Time Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.7rem',
                      color: '#64748B',
                      marginBottom: '2px',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <MapPin size={11} color="#64748B" />
                      {issue.district ? `${issue.district}, Jharkhand` : 'Jharkhand'}
                    </span>
                    <span style={{ color: '#94A3B8', fontSize: '0.675rem', whiteSpace: 'nowrap', marginLeft: '4px' }}>
                      {issue.time_ago || '1 day ago'}
                    </span>
                  </div>

                  {/* Description Snippet (2-line clamp) */}
                  <p
                    style={{
                      fontSize: '0.725rem',
                      color: '#64748B',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      margin: 0,
                    }}
                  >
                    {issue.description}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. DESKTOP MAIN 2-COLUMN SECTION (FEED GRID ON LEFT, WIDGETS ON RIGHT) */}
      <div
        className="desktop-feed-grid"
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
          {loading ? (
            <div
              style={{
                gridColumn: '1 / -1',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '3.5rem 1.5rem',
                textAlign: 'center',
                color: '#64748B',
              }}
            >
              <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#10B981' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
                Loading Community Issues...
              </h3>
              <p style={{ fontSize: '0.85rem' }}>Fetching live database records</p>
            </div>
          ) : displayedIssues.length === 0 ? (
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
                No Issues Found
              </h3>
              <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {allIssues.length === 0
                  ? 'No problem statements currently reported in the system.'
                  : 'No issues match the selected search, category or location filters.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
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
                    <img
                      src={issue.preview_image}
                      alt={issue.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.src = getCategoryFallbackImage(issue.category, issue.title);
                      }}
                    />
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
        <div className="desktop-sidebar-widgets" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                issues={displayedIssues}
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
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284C7' }}></span>
                <span>Infrastructure</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                <span>Water / San.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span>
                <span>Agriculture</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A' }}></span>
                <span>Environment</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }}></span>
                <span>Education</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#CA8A04' }}></span>
                <span>Energy</span>
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
              {/* Location Select (Dynamic from DB) */}
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
                  <option value="all">All Locations ({availableDistricts.length})</option>
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}, Jharkhand
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} color="#94A3B8" />
              </div>

              {/* Category Select (Dynamic from DB) */}
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
                  <option value="all">All Categories ({availableCategories.length})</option>
                  {availableCategories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
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

              {/* Reset Filters Button */}
              {(selectedCategoryPill !== 'all' || locationFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryPill('all');
                    setLocationFilter('all');
                    setCategoryFilter('all');
                  }}
                  style={{
                    width: '100%',
                    background: '#F1F5F9',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    padding: '0.6rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Clear Active Filters
                </button>
              )}
            </div>
          </div>

          {/* 3. COMMUNITY IMPACT WIDGET (Dynamic from DB) */}
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FULL INTERACTIVE MAP MODAL */}
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
            padding: '1rem',
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
                padding: '1.25rem 1.5rem',
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
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                    Jharkhand Community Issue Map
                  </h2>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                  Explore verified challenges and active solutions across all regional districts ({modalIssues.length} issues mapped)
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

                {modalIssues.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94A3B8', fontSize: '0.85rem' }}>
                    No mapped issues in this category.
                  </div>
                ) : (
                  modalIssues.map((issue) => {
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
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MOBILE FIXED BOTTOM NAVIGATION BAR (Matching Screenshot) */}
      <nav
        className="mobile-bottom-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '66px',
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'none', // Handled responsively via CSS
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 100,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.04)',
          padding: '0 0.5rem',
        }}
      >
        {/* 1. Home (Active) */}
        <button
          onClick={() => navigate('/citizen/dashboard')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            minWidth: '54px',
          }}
        >
          <div
            style={{
              background: '#EFF6FF',
              borderRadius: '999px',
              padding: '4px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Home size={20} color="#2563EB" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#2563EB' }}>
            Home
          </span>
        </button>

        {/* 2. Report (+ elevated circle) */}
        <button
          onClick={() => navigate('/citizen/report')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            marginTop: '-12px',
            minWidth: '54px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#2563EB',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.38)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <Plus size={22} color="#FFFFFF" strokeWidth={2.8} />
          </div>
          <span style={{ fontSize: '0.675rem', fontWeight: 700, color: '#2563EB' }}>
            Report
          </span>
        </button>

        {/* 3. My Issues */}
        <button
          onClick={() => navigate('/citizen/my-issues')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            minWidth: '54px',
          }}
        >
          <ListTodo size={20} color="#64748B" strokeWidth={2} />
          <span style={{ fontSize: '0.675rem', fontWeight: 600, color: '#64748B' }}>
            My Issues
          </span>
        </button>

        {/* 4. Map */}
        <button
          onClick={() => setIsFullMapOpen(true)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            minWidth: '54px',
          }}
        >
          <MapPin size={20} color="#64748B" strokeWidth={2} />
          <span style={{ fontSize: '0.675rem', fontWeight: 600, color: '#64748B' }}>
            Map
          </span>
        </button>

        {/* 5. Profile */}
        <button
          onClick={() => navigate('/citizen/profile')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            minWidth: '54px',
          }}
        >
          <User size={20} color="#64748B" strokeWidth={2} />
          <span style={{ fontSize: '0.675rem', fontWeight: 600, color: '#64748B' }}>
            Profile
          </span>
        </button>
      </nav>
    </div>
  );
};
