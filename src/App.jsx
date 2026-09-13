import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DemoRoleSwitcher } from './components/common/DemoRoleSwitcher';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { TopHeader } from './components/common/TopHeader';
import { LogoutModal } from './components/common/LogoutModal';
import { AuthModal } from './views/public/AuthModal';

// Public views
import { LandingPage } from './views/public/LandingPage';

// Citizen views
import { CitizenDashboard } from './views/citizen/CitizenDashboard';
import { ReportIssue } from './views/citizen/ReportIssue';
import { MyIssues } from './views/citizen/MyIssues';
import { IssueDetail } from './views/citizen/IssueDetail';
import { NotificationsView } from './views/citizen/NotificationsView';
import { ProfileView } from './views/citizen/ProfileView';
import { SettingsView } from './views/citizen/SettingsView';

// Student views
import { StudentDashboard } from './views/student/StudentDashboard';
import { ExploreProblems } from './views/student/ExploreProblems';
import { ProblemDetailStudent } from './views/student/ProblemDetailStudent';
import { SubmitPitchWizard } from './views/student/SubmitPitchWizard';
import { MyPitches } from './views/student/MyPitches';
import { MyProjects } from './views/student/MyProjects';
import { OpportunitiesView } from './views/student/OpportunitiesView';
import { CertificatesView } from './views/student/CertificatesView';

// University views
import { UniversityDashboard } from './views/university/UniversityDashboard';
import { ProblemPipeline } from './views/university/ProblemPipeline';
import { ValidationView } from './views/university/ValidationView';
import { AdoptedProblems } from './views/university/AdoptedProblems';
import { OpenCalls } from './views/university/OpenCalls';
import { StudentPitchesList } from './views/university/StudentPitchesList';
import { PitchDetailsView } from './views/university/PitchDetailsView';
import { ReviewBoardView } from './views/university/ReviewBoardView';
import { ProjectsList } from './views/university/ProjectsList';
import { ProjectDetailsView } from './views/university/ProjectDetailsView';
import { MentorshipView } from './views/university/MentorshipView';
import { UniversityAnalytics } from './views/university/UniversityAnalytics';
import { UniversityReports } from './views/university/UniversityReports';
import { UniversityProfile } from './views/university/UniversityProfile';
import { UniversitySettings } from './views/university/UniversitySettings';
import { UniversityNotifications } from './views/university/UniversityNotifications';

// Government & Shared views
import { OfficerDashboard } from './views/officer/OfficerDashboard';
import { IssuesOverview } from './views/officer/IssuesOverview';
import { AdoptionPipeline } from './views/officer/AdoptionPipeline';
import { ProjectsOverview } from './views/officer/ProjectsOverview';
import { ImpactAnalytics } from './views/officer/ImpactAnalytics';
import { ReportsDocuments } from './views/officer/ReportsDocuments';
import { HelpSupport } from './views/officer/HelpSupport';

// Admin views
import { UserManagement } from './views/admin/UserManagement';
import { OrganizationsManagement } from './views/admin/OrganizationsManagement';
import { SystemLogsView } from './views/admin/SystemLogsView';

// Industry views
import { IndustryDashboard } from './views/industry/IndustryDashboard';
import { IndustryEngagementsView } from './views/industry/IndustryEngagementsView';
import { IndustryProfile } from './views/industry/IndustryProfile';

function MainApp() {
  const { user, role, isAuthenticated } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard');
  const [publicNavTab, setPublicNavTab] = useState('landing');
  const [showPublicOnly, setShowPublicOnly] = useState(false);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedProblemForPitch, setSelectedProblemForPitch] = useState(null);
  const [selectedPitch, setSelectedPitch] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');

  const openAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleNavigate = (viewId) => {
    setCurrentView(viewId);
    setShowPublicOnly(false);
  };

  const handleSelectIssue = (issue) => {
    setSelectedIssue(issue);
    if (role === 'student') {
      setCurrentView('problem_detail');
    } else {
      setCurrentView('issue_detail');
    }
  };

  const handleSelectPitch = (pitch) => {
    setSelectedPitch(pitch);
    setCurrentView('pitch_details');
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setCurrentView('project_details');
  };

  const handleSubmitPitchForProblem = (problem) => {
    setSelectedProblemForPitch(problem);
    setCurrentView('submit_pitch');
  };

  // Render role-specific view
  const renderDashboardView = () => {
    // 1. Citizen Dashboard
    if (role === 'citizen') {
      switch (currentView) {
        case 'dashboard':
          return <CitizenDashboard onNavigate={handleNavigate} onSelectIssue={handleSelectIssue} />;
        case 'report_problem':
          return (
            <ReportIssue
              onBack={() => handleNavigate('dashboard')}
              onSuccess={() => handleNavigate('my_issues')}
            />
          );
        case 'my_issues':
        case 'track_status':
          return <MyIssues onNavigate={handleNavigate} onSelectIssue={handleSelectIssue} />;
        case 'issue_detail':
          return (
            <IssueDetail
              issue={selectedIssue}
              onBack={() => handleNavigate('my_issues')}
              onRefresh={() => {}}
            />
          );
        case 'notifications':
          return <NotificationsView />;
        case 'profile':
          return <ProfileView />;
        case 'settings':
          return <SettingsView />;
        default:
          return <CitizenDashboard onNavigate={handleNavigate} onSelectIssue={handleSelectIssue} />;
      }
    }

    // 2. Student Dashboard
    if (role === 'student') {
      switch (currentView) {
        case 'dashboard':
          return (
            <StudentDashboard
              onNavigate={handleNavigate}
              onSelectProblem={handleSelectIssue}
              onSubmitPitchForProblem={handleSubmitPitchForProblem}
            />
          );
        case 'explore_problems':
          return (
            <ExploreProblems
              onSelectProblem={handleSelectIssue}
              onSubmitPitchForProblem={handleSubmitPitchForProblem}
            />
          );
        case 'problem_detail':
          return (
            <ProblemDetailStudent
              problem={selectedIssue}
              onBack={() => handleNavigate('explore_problems')}
              onSubmitPitch={handleSubmitPitchForProblem}
            />
          );
        case 'submit_pitch':
          return (
            <SubmitPitchWizard
              selectedProblem={selectedProblemForPitch || selectedIssue}
              onBack={() => handleNavigate('explore_problems')}
              onSuccess={() => handleNavigate('my_pitches')}
            />
          );
        case 'my_pitches':
          return <MyPitches onNavigate={handleNavigate} onSelectPitch={handleSelectPitch} />;
        case 'my_projects':
          return <MyProjects />;
        case 'opportunities':
          return <OpportunitiesView />;
        case 'certificates':
          return <CertificatesView />;
        case 'notifications':
          return <NotificationsView />;
        case 'profile':
          return <ProfileView />;
        default:
          return (
            <StudentDashboard
              onNavigate={handleNavigate}
              onSelectProblem={handleSelectIssue}
              onSubmitPitchForProblem={handleSubmitPitchForProblem}
            />
          );
      }
    }

    // 3. University Dashboard (Coordinator & Faculty Mentor) - All 16 screens
    if (role === 'university_coordinator' || role === 'faculty_mentor') {
      switch (currentView) {
        case 'dashboard':
          return (
            <UniversityDashboard
              onNavigate={handleNavigate}
              onSelectIssue={handleSelectIssue}
              onSelectPitch={handleSelectPitch}
            />
          );
        case 'problem_pipeline':
          return <ProblemPipeline onSelectIssue={handleSelectIssue} />;
        case 'validation':
          return <ValidationView onSelectIssue={handleSelectIssue} />;
        case 'adopted_problems':
          return <AdoptedProblems onSelectIssue={handleSelectIssue} onCreateOpenCall={() => handleNavigate('open_calls')} />;
        case 'open_calls':
          return <OpenCalls onSelectIssue={handleSelectIssue} onSelectPitch={handleSelectPitch} />;
        case 'student_pitches':
          return <StudentPitchesList onSelectPitch={handleSelectPitch} />;
        case 'pitch_details':
          return <PitchDetailsView pitch={selectedPitch} onBack={() => handleNavigate('student_pitches')} onRefresh={() => {}} />;
        case 'review_board':
          return <ReviewBoardView onSelectPitch={handleSelectPitch} />;
        case 'projects':
          return <ProjectsList onSelectProject={handleSelectProject} />;
        case 'project_details':
          return <ProjectDetailsView project={selectedProject} onBack={() => handleNavigate('projects')} />;
        case 'mentorship':
          return <MentorshipView />;
        case 'analytics':
          return <UniversityAnalytics />;
        case 'reports':
          return <UniversityReports />;
        case 'profile':
          return <UniversityProfile />;
        case 'settings':
          return <UniversitySettings />;
        case 'notifications':
          return <UniversityNotifications />;
        case 'issue_detail':
          return (
            <IssueDetail
              issue={selectedIssue}
              onBack={() => handleNavigate('problem_pipeline')}
              onRefresh={() => {}}
            />
          );
        default:
          return (
            <UniversityDashboard
              onNavigate={handleNavigate}
              onSelectIssue={handleSelectIssue}
              onSelectPitch={handleSelectPitch}
            />
          );
      }
    }

    // 4. Government Dashboard
    if (role === 'gov_admin' && !user?.is_superuser) {
      switch (currentView) {
        case 'dashboard':
          return <OfficerDashboard onNavigate={handleNavigate} onSelectIssue={handleSelectIssue} />;
        case 'issues_overview':
          return <IssuesOverview onSelectIssue={handleSelectIssue} />;
        case 'adoption_pipeline':
          return <AdoptionPipeline />;
        case 'projects':
          return <ProjectsOverview />;
        case 'analytics':
          return <ImpactAnalytics />;
        case 'reports':
          return <ReportsDocuments />;
        case 'issue_detail':
          return (
            <IssueDetail
              issue={selectedIssue}
              onBack={() => handleNavigate('issues_overview')}
              onRefresh={() => {}}
            />
          );
        case 'notifications':
          return <NotificationsView />;
        case 'profile':
          return <ProfileView />;
        default:
          return <OfficerDashboard onNavigate={handleNavigate} onSelectIssue={handleSelectIssue} />;
      }
    }

    // 5. Industry Dashboard
    if (role === 'industry_partner') {
      switch (currentView) {
        case 'dashboard':
          return <IndustryDashboard onNavigate={handleNavigate} onSelectPitch={handleSelectPitch} />;
        case 'opportunities':
        case 'funding':
        case 'partnerships':
          return <IndustryEngagementsView />;
        case 'shortlisted_projects':
        case 'mentorship':
        case 'project_progress':
          return <ProjectsOverview />;
        case 'notifications':
          return <NotificationsView />;
        case 'profile':
          return <IndustryProfile />;
        default:
          return <IndustryDashboard onNavigate={handleNavigate} onSelectPitch={handleSelectPitch} />;
      }
    }

    // 6. Admin Dashboard (Super Admin)
    switch (currentView) {
      case 'dashboard':
        return <OfficerDashboard onNavigate={handleNavigate} onSelectIssue={handleSelectIssue} />;
      case 'user_management':
        return <UserManagement />;
      case 'organizations':
      case 'university_management':
      case 'industry_management':
        return <OrganizationsManagement />;
      case 'problem_management':
      case 'content_moderation':
        return <IssuesOverview onSelectIssue={handleSelectIssue} />;
      case 'project_management':
        return <ProjectsOverview />;
      case 'platform_analytics':
        return <ImpactAnalytics />;
      case 'reports':
        return <ReportsDocuments />;
      case 'system_logs':
        return <SystemLogsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <OfficerDashboard onNavigate={handleNavigate} onSelectIssue={handleSelectIssue} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Demo Role Switcher */}
      <DemoRoleSwitcher onNavigatePublic={() => setShowPublicOnly(true)} />

      {/* Auth Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setShowPublicOnly(false);
          setCurrentView('dashboard');
        }}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />

      {/* Main View Condition: Public Landing vs Role Dashboard */}
      {!isAuthenticated || showPublicOnly ? (
        <>
          <Navbar
            onOpenAuth={openAuth}
            onNavigate={(tab) => {
              setPublicNavTab(tab);
              if (tab === 'dashboard') setShowPublicOnly(false);
            }}
            currentTab={publicNavTab}
          />
          <LandingPage
            onOpenAuth={openAuth}
            onNavigateDashboard={() => setShowPublicOnly(false)}
            onSelectIssue={(issue) => {
              setSelectedIssue(issue);
              openAuth('login');
            }}
            currentTab={publicNavTab}
            onNavigateTab={(tab) => setPublicNavTab(tab)}
          />
        </>
      ) : (
        <div className="dashboard-container">
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            onOpenLogout={() => setIsLogoutModalOpen(true)}
          />

          <div className="dashboard-main">
            <TopHeader
              onNavigate={handleNavigate}
              onSearch={setGlobalSearch}
              searchQuery={globalSearch}
            />

            <main className="dashboard-content">
              {renderDashboardView()}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
