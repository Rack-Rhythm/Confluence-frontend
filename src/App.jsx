import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DemoRoleSwitcher } from './components/common/DemoRoleSwitcher';
import { Navbar } from './components/common/Navbar';
import { Sidebar, getViewPath } from './components/common/Sidebar';
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
import { MyFeedbackView } from './views/citizen/MyFeedbackView';

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

// Admin views
import { AdminDashboard } from './views/admin/AdminDashboard';
import { UserManagement } from './views/admin/UserManagement';
import { OrganizationsManagement } from './views/admin/OrganizationsManagement';
import { SystemLogsView } from './views/admin/SystemLogsView';

// Industry views
import { IndustryDashboard } from './views/industry/IndustryDashboard';
import { IndustryEngagementsView } from './views/industry/IndustryEngagementsView';
import { IndustryProjectsView } from './views/industry/IndustryProjectsView';
import { IndustryProfile } from './views/industry/IndustryProfile';

export const getBaseRole = (r) => {
  if (r === 'university_coordinator' || r === 'faculty_mentor') return 'university';
  if (r === 'gov_admin') return 'officer';
  if (r === 'industry_partner') return 'industry';
  if (r === 'student') return 'student';
  if (r === 'citizen') return 'citizen';
  if (r === 'admin') return 'admin';
  return r || 'citizen';
};

function MainApp() {
  const { user, role, isAuthenticated, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Selected item states
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedProblemForPitch, setSelectedProblemForPitch] = useState(null);
  const [selectedPitch, setSelectedPitch] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');

  const publicRoutes = ['/', '/problems', '/solutions', '/how_it_works', '/success_stories', '/stats', '/public'];
  const isPublicPage = publicRoutes.includes(location.pathname);

  const openAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleNavigate = (viewIdOrPath) => {
    if (typeof viewIdOrPath === 'string' && viewIdOrPath.startsWith('/')) {
      navigate(viewIdOrPath);
    } else {
      const path = getViewPath(role, viewIdOrPath);
      navigate(path);
    }
  };

  const handleSelectIssue = (issue) => {
    if (!issue) return;
    setSelectedIssue(issue);
    if (role === 'student') {
      navigate(`/student/problems/${issue.id}`);
    } else {
      const baseRole = getBaseRole(role);
      navigate(`/${baseRole}/issues/${issue.id}`);
    }
  };

  const handleSelectPitch = (pitch) => {
    if (!pitch) return;
    setSelectedPitch(pitch);
    const baseRole = getBaseRole(role);
    navigate(`/${baseRole}/pitches/${pitch.id}`);
  };

  const handleSelectProject = (project) => {
    if (!project) return;
    setSelectedProject(project);
    const baseRole = getBaseRole(role);
    navigate(`/${baseRole}/projects/${project.id}`);
  };

  const handleSubmitPitchForProblem = (problem) => {
    setSelectedProblemForPitch(problem);
    navigate(`/student/submit-pitch/${problem.id}`);
  };

  // Determine landing page tab based on path
  let publicNavTab = 'landing';
  if (location.pathname === '/problems') publicNavTab = 'problems';
  else if (location.pathname === '/solutions') publicNavTab = 'solutions';
  else if (location.pathname === '/how_it_works') publicNavTab = 'how_it_works';
  else if (location.pathname === '/success_stories') publicNavTab = 'success_stories';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Demo Role Switcher */}
      <DemoRoleSwitcher onNavigatePublic={() => navigate('/')} />

      {/* Auth Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          navigate(`/${getBaseRole(role)}/dashboard`);
        }}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />

      {/* Public Landing View vs Authenticated Dashboard View */}
      {isPublicPage ? (
        <>
          <Navbar
            onOpenAuth={openAuth}
            onNavigate={(tab) => {
              if (tab === 'landing') navigate('/');
              else if (tab === 'dashboard') navigate(`/${getBaseRole(role)}/dashboard`);
              else navigate(`/${tab}`);
            }}
            currentTab={publicNavTab}
          />
          <LandingPage
            onOpenAuth={openAuth}
            onNavigateDashboard={() => navigate(`/${getBaseRole(role)}/dashboard`)}
            onSelectIssue={(issue) => {
              setSelectedIssue(issue);
              openAuth('login');
            }}
            currentTab={publicNavTab}
            onNavigateTab={(tab) => {
              if (tab === 'landing') navigate('/');
              else navigate(`/${tab}`);
            }}
          />
        </>
      ) : (
        <div className="dashboard-container">
          <Sidebar
            currentView={location.pathname}
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
              <Routes>
                {/* 1. Citizen Routes */}
                <Route path="/citizen" element={<Navigate to="/citizen/dashboard" replace />} />
                <Route
                  path="/citizen/dashboard"
                  element={<CitizenDashboard onNavigate={handleNavigate} onSelectIssue={handleSelectIssue} />}
                />
                <Route
                  path="/citizen/report"
                  element={<ReportIssue onBack={() => navigate('/citizen/dashboard')} onSuccess={() => navigate('/citizen/my-issues')} />}
                />
                <Route
                  path="/citizen/my-issues"
                  element={<MyIssues onNavigate={handleNavigate} onSelectIssue={handleSelectIssue} />}
                />
                <Route
                  path="/citizen/issues/:id"
                  element={<IssueDetail issue={selectedIssue} backLabel="Back to My Issues" onBack={() => navigate('/citizen/my-issues')} onRefresh={() => {}} />}
                />
                <Route path="/citizen/notifications" element={<NotificationsView />} />
                <Route path="/citizen/profile" element={<ProfileView />} />
                <Route path="/citizen/settings" element={<SettingsView />} />
                <Route path="/citizen/my-feedback" element={<MyFeedbackView />} />
                <Route path="/citizen/feedback" element={<Navigate to="/citizen/my-feedback" replace />} />

                {/* 2. Student Routes */}
                <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
                <Route
                  path="/student/dashboard"
                  element={
                    <StudentDashboard
                      onNavigate={handleNavigate}
                      onSelectProblem={handleSelectIssue}
                      onSelectPitch={handleSelectPitch}
                      onSubmitPitchForProblem={handleSubmitPitchForProblem}
                    />
                  }
                />
                <Route
                  path="/student/explore"
                  element={<ExploreProblems onSelectProblem={handleSelectIssue} onSubmitPitchForProblem={handleSubmitPitchForProblem} />}
                />
                <Route
                  path="/student/problems/:id"
                  element={<ProblemDetailStudent problem={selectedIssue} onBack={() => navigate('/student/explore')} onSubmitPitch={handleSubmitPitchForProblem} />}
                />
                <Route
                  path="/student/submit-pitch"
                  element={<SubmitPitchWizard selectedProblem={selectedProblemForPitch || selectedIssue} onBack={() => navigate('/student/explore')} onSuccess={() => navigate('/student/my-pitches')} />}
                />
                <Route
                  path="/student/submit-pitch/:problemId"
                  element={<SubmitPitchWizard selectedProblem={selectedProblemForPitch || selectedIssue} onBack={() => navigate('/student/explore')} onSuccess={() => navigate('/student/my-pitches')} />}
                />
                <Route
                  path="/student/my-pitches"
                  element={<MyPitches onNavigate={handleNavigate} onSelectPitch={handleSelectPitch} />}
                />
                <Route
                  path="/student/pitches/:id"
                  element={<PitchDetailsView pitch={selectedPitch} onBack={() => navigate('/student/my-pitches')} onRefresh={() => {}} />}
                />
                <Route path="/student/my-projects" element={<MyProjects />} />
                <Route
                  path="/student/projects/:id"
                  element={<ProjectDetailsView project={selectedProject} onBack={() => navigate('/student/my-projects')} />}
                />
                <Route path="/student/opportunities" element={<OpportunitiesView />} />
                <Route path="/student/certificates" element={<CertificatesView />} />
                <Route path="/student/notifications" element={<NotificationsView />} />
                <Route path="/student/profile" element={<ProfileView />} />

                {/* 3. University Routes (Coordinator & Mentor) */}
                <Route path="/university" element={<Navigate to="/university/dashboard" replace />} />
                <Route
                  path="/university/dashboard"
                  element={<UniversityDashboard onNavigate={handleNavigate} onSelectIssue={handleSelectIssue} onSelectPitch={handleSelectPitch} />}
                />
                <Route path="/university/problem-pipeline" element={<ProblemPipeline onSelectIssue={handleSelectIssue} />} />
                <Route path="/university/validation" element={<ValidationView onSelectIssue={handleSelectIssue} />} />
                <Route
                  path="/university/adopted-problems"
                  element={<AdoptedProblems onSelectIssue={handleSelectIssue} onCreateOpenCall={() => navigate('/university/open-calls')} />}
                />
                <Route path="/university/open-calls" element={<OpenCalls onSelectIssue={handleSelectIssue} onSelectPitch={handleSelectPitch} />} />
                <Route path="/university/student-pitches" element={<StudentPitchesList onSelectPitch={handleSelectPitch} />} />
                <Route
                  path="/university/pitches/:id"
                  element={<PitchDetailsView pitch={selectedPitch} onBack={() => navigate('/university/student-pitches')} onRefresh={() => {}} />}
                />
                <Route path="/university/review-board" element={<ReviewBoardView onSelectPitch={handleSelectPitch} />} />
                <Route path="/university/projects" element={<ProjectsList onSelectProject={handleSelectProject} />} />
                <Route
                  path="/university/projects/:id"
                  element={<ProjectDetailsView project={selectedProject} onBack={() => navigate('/university/projects')} />}
                />
                <Route path="/university/mentorship" element={<MentorshipView />} />
                <Route path="/university/analytics" element={<UniversityAnalytics />} />
                <Route path="/university/reports" element={<UniversityReports />} />
                <Route path="/university/profile" element={<UniversityProfile />} />
                <Route path="/university/settings" element={<UniversitySettings />} />
                <Route path="/university/notifications" element={<UniversityNotifications />} />
                <Route
                  path="/university/issues/:id"
                  element={<IssueDetail issue={selectedIssue} backLabel="Back to Problem Pipeline" onBack={() => navigate('/university/problem-pipeline')} onRefresh={() => {}} />}
                />

                {/* 4. Industry Routes */}
                <Route path="/industry" element={<Navigate to="/industry/dashboard" replace />} />
                <Route
                  path="/industry/dashboard"
                  element={<IndustryDashboard onNavigate={handleNavigate} onSelectPitch={handleSelectPitch} />}
                />
                <Route path="/industry/engagements" element={<IndustryEngagementsView />} />
                <Route path="/industry/opportunities" element={<IndustryEngagementsView />} />
                <Route path="/industry/funding" element={<IndustryEngagementsView />} />
                <Route path="/industry/projects" element={<IndustryProjectsView onSelectPitch={handleSelectPitch} />} />
                <Route
                  path="/industry/projects/:id"
                  element={<ProjectDetailsView project={selectedProject} onBack={() => navigate('/industry/projects')} />}
                />
                <Route path="/industry/notifications" element={<NotificationsView />} />
                <Route path="/industry/profile" element={<IndustryProfile />} />
                <Route
                  path="/industry/pitches/:id"
                  element={<PitchDetailsView pitch={selectedPitch} onBack={() => navigate('/industry/projects')} onRefresh={() => {}} />}
                />

                {/* 5. Government / Officer Routes */}
                <Route path="/officer" element={<Navigate to="/officer/dashboard" replace />} />
                <Route
                  path="/officer/dashboard"
                  element={<OfficerDashboard onNavigate={handleNavigate} onSelectIssue={handleSelectIssue} />}
                />
                <Route path="/officer/issues" element={<IssuesOverview onSelectIssue={handleSelectIssue} />} />
                <Route path="/officer/adoption-pipeline" element={<AdoptionPipeline />} />
                <Route path="/officer/projects" element={<ProjectsOverview />} />
                <Route path="/officer/analytics" element={<ImpactAnalytics />} />
                <Route path="/officer/reports" element={<ReportsDocuments />} />
                <Route
                  path="/officer/issues/:id"
                  element={<IssueDetail issue={selectedIssue} backLabel="Back to Issues Overview" onBack={() => navigate('/officer/issues')} onRefresh={() => {}} />}
                />
                <Route path="/officer/notifications" element={<NotificationsView />} />
                <Route path="/officer/profile" element={<ProfileView />} />

                {/* 6. Admin Routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route
                  path="/admin/dashboard"
                  element={<AdminDashboard onNavigate={handleNavigate} />}
                />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/organizations" element={<OrganizationsManagement />} />
                <Route path="/admin/problems" element={<IssuesOverview onSelectIssue={handleSelectIssue} />} />
                <Route path="/admin/projects" element={<ProjectsOverview />} />
                <Route path="/admin/analytics" element={<ImpactAnalytics />} />
                <Route path="/admin/reports" element={<ReportsDocuments />} />
                <Route path="/admin/system-logs" element={<SystemLogsView />} />
                <Route path="/admin/notifications" element={<NotificationsView />} />
                <Route path="/admin/profile" element={<ProfileView />} />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to={role ? `/${getBaseRole(role)}/dashboard` : '/'} replace />} />
              </Routes>
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
        <BrowserRouter>
          <MainApp />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
