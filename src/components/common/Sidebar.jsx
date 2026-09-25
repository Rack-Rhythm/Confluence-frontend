import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  Compass,
  Bell,
  User,
  LogOut,
  Leaf,
  Lightbulb,
  FolderKanban,
  Target,
  Inbox,
  CheckCircle,
  BookmarkCheck,
  Megaphone,
  Scale,
  Rocket,
  Handshake,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Star,
  Coins,
  GraduationCap,
  TrendingUp,
  Users,
  Building2,
  Building,
  KeyRound,
  ShieldAlert,
  Sliders,
  TerminalSquare,
  HelpCircle,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const getViewPath = (role, id) => {
  const map = {
    citizen: {
      dashboard: '/citizen/dashboard',
      report_problem: '/citizen/report',
      my_issues: '/citizen/my-issues',
      notifications: '/citizen/notifications',
      profile: '/citizen/profile',
      settings: '/citizen/settings',
    },
    student: {
      dashboard: '/student/dashboard',
      explore_problems: '/student/explore',
      my_pitches: '/student/my-pitches',
      my_projects: '/student/my-projects',
      opportunities: '/student/opportunities',
      certificates: '/student/certificates',
      notifications: '/student/notifications',
      profile: '/student/profile',
    },
    university_coordinator: {
      dashboard: '/university/dashboard',
      challenges: '/university/adopted-problems',
      solutions: '/university/student-pitches',
      review_board: '/university/review-board',
      projects: '/university/projects',
      people: '/university/mentorship',
      reports: '/university/reports',
      notifications: '/university/notifications',
      profile: '/university/profile',
      settings: '/university/settings',
      problem_pipeline: '/university/problem-pipeline',
      validation: '/university/validation',
      adopted_problems: '/university/adopted-problems',
      open_calls: '/university/open-calls',
      student_pitches: '/university/student-pitches',
      mentorship: '/university/mentorship',
      analytics: '/university/analytics',
    },
    faculty_mentor: {
      dashboard: '/university/dashboard',
      challenges: '/university/adopted-problems',
      solutions: '/university/student-pitches',
      review_board: '/university/review-board',
      projects: '/university/projects',
      people: '/university/mentorship',
      reports: '/university/reports',
      notifications: '/university/notifications',
      profile: '/university/profile',
      settings: '/university/settings',
      problem_pipeline: '/university/problem-pipeline',
      validation: '/university/validation',
      adopted_problems: '/university/adopted-problems',
      open_calls: '/university/open-calls',
      student_pitches: '/university/student-pitches',
      mentorship: '/university/mentorship',
      analytics: '/university/analytics',
    },
    gov_admin: {
      dashboard: '/officer/dashboard',
      issues_overview: '/officer/issues',
      adoption_pipeline: '/officer/adoption-pipeline',
      projects: '/officer/projects',
      analytics: '/officer/analytics',
      reports: '/officer/reports',
      notifications: '/officer/notifications',
      profile: '/officer/profile',
    },
    industry_partner: {
      dashboard: '/industry/dashboard',
      opportunities: '/industry/opportunities',
      funding: '/industry/funding',
      partnerships: '/industry/partnerships',
      shortlisted_projects: '/industry/projects',
      mentorship: '/industry/mentorship',
      project_progress: '/industry/project-progress',
      notifications: '/industry/notifications',
      profile: '/industry/profile',
    },
    admin: {
      dashboard: '/admin/dashboard',
      user_management: '/admin/users',
      organizations: '/admin/organizations',
      university_management: '/admin/organizations',
      industry_management: '/admin/organizations',
      problem_management: '/admin/problems',
      solution_vault: '/admin/pitches',
      content_moderation: '/admin/pitches',
      project_management: '/admin/projects',
      platform_analytics: '/admin/analytics',
      reports: '/admin/reports',
      system_logs: '/admin/system-logs',
      platform_settings: '/admin/settings',
      notifications: '/admin/notifications',
      profile: '/admin/profile',
    },
  };
  return map[role]?.[id] || `/${role}/dashboard`;
};

export const Sidebar = ({ currentView, onNavigate, onOpenLogout, unreadNotificationsCount = 3, isOpen = false, onClose }) => {
  const { user, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getSidebarConfig = () => {
    // 1. Citizen Dashboard Sidebar
    if (role === 'citizen') {
      return {
        main: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'report_problem', label: 'Report Problem', icon: PlusCircle },
          { id: 'my_issues', label: 'My Issues', icon: ListChecks },
          { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
          { id: 'profile', label: 'Profile', icon: User },
        ],
        account: [
          { id: 'logout', label: 'Logout', icon: LogOut, isAction: true },
        ],
      };
    }

    // 2. Student Dashboard Sidebar (Section 72)
    if (role === 'student') {
      return {
        main: [
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'explore_problems', label: 'Challenges', icon: Compass },
          { id: 'my_pitches', label: 'My Solutions', icon: Lightbulb },
          { id: 'my_projects', label: 'My Projects', icon: Rocket },
          { id: 'opportunities', label: 'Opportunities', icon: Target },
          { id: 'certificates', label: 'Certificates', icon: GraduationCap },
          { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
          { id: 'profile', label: 'Profile', icon: User },
        ],
        account: [
          { id: 'logout', label: 'Logout', icon: LogOut, isAction: true },
        ],
      };
    }

    // 3. University Dashboard Sidebar (Section 73)
    if (role === 'university_coordinator' || role === 'faculty_mentor') {
      return {
        main: [
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'challenges', label: 'Challenges', icon: BookmarkCheck },
          { id: 'solutions', label: 'Solutions', icon: Lightbulb },
          { id: 'projects', label: 'Projects', icon: Rocket },
          { id: 'people', label: 'People', icon: Users },
          { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
          { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
          { id: 'profile', label: 'Profile', icon: User },
        ],
        account: [
          { id: 'logout', label: 'Logout', icon: LogOut, isAction: true },
        ],
      };
    }

    // 4. Government Dashboard Sidebar
    if (role === 'gov_admin') {
      return {
        main: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'issues_overview', label: 'Issues Overview', icon: FileSpreadsheet },
          { id: 'adoption_pipeline', label: 'Adoption Status', icon: BookmarkCheck },
          { id: 'projects', label: 'Projects', icon: Rocket },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'profile', label: 'Profile', icon: User },
        ],
        account: [
          { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
          { id: 'logout', label: 'Logout', icon: LogOut, isAction: true },
        ],
      };
    }

    // 5. Industry Dashboard Sidebar
    if (role === 'industry_partner') {
      return {
        main: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'opportunities', label: 'Opportunities', icon: Target },
          { id: 'shortlisted_projects', label: 'Partner Projects', icon: Star },
          { id: 'partnerships', label: 'Partnerships', icon: Handshake },
          { id: 'funding', label: 'Funding', icon: Coins },
          { id: 'mentorship', label: 'Mentorship', icon: GraduationCap },
          { id: 'project_progress', label: 'Project Progress', icon: TrendingUp },
          { id: 'profile', label: 'Profile', icon: User },
        ],
        account: [
          { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
          { id: 'logout', label: 'Logout', icon: LogOut, isAction: true },
        ],
      };
    }

    // Default Fallback: Citizen Sidebar
    return {
      main: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'report_problem', label: 'Report Problem', icon: PlusCircle },
        { id: 'my_issues', label: 'My Issues', icon: ListChecks },
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
        { id: 'profile', label: 'Profile', icon: User },
      ],
      account: [
        { id: 'logout', label: 'Logout', icon: LogOut, isAction: true },
      ],
    };
  };

  const config = getSidebarConfig();

  const renderNavBtn = (item) => {
    const Icon = item.icon;
    const itemPath = getViewPath(role, item.id);
    const isActive = location.pathname === itemPath || currentView === item.id || (itemPath !== `/${role}/dashboard` && location.pathname.startsWith(itemPath + '/'));

    if (item.isAction) {
      return (
        <button
          key={item.id}
          onClick={() => {
            if (onClose) onClose();
            onOpenLogout();
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#EF4444',
            background: '#FEF2F2',
            marginTop: '0.25rem',
          }}
        >
          <Icon size={17} />
          <span>{item.label}</span>
        </button>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => {
          if (onClose) onClose();
          navigate(itemPath);
          if (onNavigate) onNavigate(item.id, itemPath);
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 0.85rem',
          borderRadius: '10px',
          marginBottom: '0.2rem',
          fontSize: '0.84rem',
          fontWeight: isActive ? 700 : 500,
          color: isActive ? '#2563EB' : '#475569',
          background: isActive ? '#EFF6FF' : 'transparent',
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <Icon size={17} color={isActive ? '#2563EB' : '#64748B'} />
          <span>{item.label}</span>
        </div>
        {item.badge ? (
          <span
            style={{
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: '0.65rem',
              fontWeight: 700,
              borderRadius: '999px',
              padding: '1px 6px',
            }}
          >
            {item.badge}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 998,
          }}
        />
      )}

      <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`} style={{ width: '260px' }}>
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 3px 10px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Leaf size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                CONFLUENCE
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>
                People. Ideas. Impact.
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div style={{ flex: 1, padding: '0.75rem', overflowY: 'auto' }}>
          {/* MAIN Section */}
          {config.main && config.main.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 800,
                  color: '#94A3B8',
                  letterSpacing: '0.06em',
                  padding: '0 0.85rem 0.4rem',
                }}
              >
                MAIN
              </div>
              {config.main.map(renderNavBtn)}
            </div>
          )}

          {/* SYSTEM Section (for Admin) */}
          {config.system && config.system.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 800,
                  color: '#94A3B8',
                  letterSpacing: '0.06em',
                  padding: '0 0.85rem 0.4rem',
                }}
              >
                SYSTEM
              </div>
              {config.system.map(renderNavBtn)}
            </div>
          )}

          {/* ACCOUNT Section */}
          {config.account && config.account.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 800,
                  color: '#94A3B8',
                  letterSpacing: '0.06em',
                  padding: '0 0.85rem 0.4rem',
                }}
              >
                ACCOUNT
              </div>
              {config.account.map(renderNavBtn)}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
