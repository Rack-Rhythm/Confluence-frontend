import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  Lightbulb,
  FolderKanban,
  Target,
  User,
  PlusCircle,
  ListChecks,
  Bell
} from 'lucide-react';
import { getViewPath } from './Sidebar';

export const MobileBottomNav = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) return null;

  const role = user.role;
  const isStudent = role === 'student';

  // Define nav items based on role
  let navItems = [];

  if (isStudent) {
    navItems = [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
      { id: 'explore_problems', icon: Compass, label: 'Explore' },
      { id: 'my_pitches', icon: Lightbulb, label: 'Pitches' },
      { id: 'opportunities', icon: Target, label: 'Grants' },
      { id: 'profile', icon: User, label: 'Profile' },
    ];
  } else if (role === 'citizen') {
    navItems = [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
      { id: 'report_problem', icon: PlusCircle, label: 'Report' },
      { id: 'my_issues', icon: ListChecks, label: 'Issues' },
      { id: 'notifications', icon: Bell, label: 'Alerts' },
      { id: 'profile', icon: User, label: 'Profile' },
    ];
  } else {
    // Generic fallback for other roles
    navItems = [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
      { id: 'profile', icon: User, label: 'Profile' },
    ];
  }

  const handleNav = (id) => {
    const path = getViewPath(role, id);
    if (path) navigate(path);
  };

  return (
    <div className={`mobile-bottom-nav ${isStudent ? 'student-theme-white' : ''}`}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const path = getViewPath(role, item.id);
        const isActive = location.pathname.startsWith(path);
        
        return (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
