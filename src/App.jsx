import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
  Outlet,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DemoRoleSwitcher } from './components/common/DemoRoleSwitcher';
import { Navbar } from './components/common/Navbar';
import { Sidebar, getViewPath } from './components/common/Sidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';

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
import { UniversityChallengeView } from './views/university/UniversityChallengeView';

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
import { AdminProblemsView } from './views/admin/AdminProblemsView';
import { AdminPitchesView } from './views/admin/AdminPitchesView';
import { AdminSettingsView } from './views/admin/AdminSettingsView';

// Industry views
import { IndustryDashboard } from './views/industry/IndustryDashboard';
import { IndustryEngagementsView } from './views/industry/IndustryEngagementsView';
import { IndustryProjectsView } from './views/industry/IndustryProjectsView';
import { IndustryProfile } from './views/industry/IndustryProfile';

export const getBaseRole = (r) => {
  if (r === 'citizen') return 'citizen';
  if (r === 'student') return 'student';
  if (r === 'university_coordinator' || r === 'faculty_mentor') return 'university';
  if (r === 'gov_admin') return 'officer';
  if (r === 'industry_partner') return 'industry';
  return r || 'citizen';
};

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, role, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const base = getBaseRole(role);
    return <Navigate to={`/${base}/dashboard`} replace />;
  }
  return children ? children : <Outlet />;
};

// Universal Deep-Link Routers (Section 44 & 56, Issues 44 & 56)
const UniversalChallengeRoute = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const role = user?.role;
  if (role === 'student') return <Navigate to={`/student/problems/${id}`} replace />;
  if (role === 'university_coordinator' || role === 'faculty_mentor') return <Navigate to={`/university/challenges/${id}`} replace />;
  if (role === 'gov_admin') return <Navigate to={`/officer/issues/${id}`} replace />;
  return <Navigate to={`/citizen/issues/${id}`} replace />;
};

const UniversalChallengeSolutionsRoute = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const role = user?.role;
  if (role === 'student') return <Navigate to={`/student/problems/${id}`} replace />;
  if (role === 'university_coordinator' || role === 'faculty_mentor') return <Navigate to={`/university/challenges/${id}`} replace />;
  if (role === 'gov_admin') return <Navigate to={`/officer/issues/${id}`} replace />;
  return <Navigate to={`/citizen/issues/${id}`} replace />;
};

const UniversalChallengeSolutionDetailRoute = () => {
  const { solutionId } = useParams();
  const { user } = useAuth();
  const role = user?.role;
  if (role === 'university_coordinator' || role === 'faculty_mentor') return <Navigate to={`/university/pitches/${solutionId}`} replace />;
  if (role === 'industry_partner') return <Navigate to={`/industry/pitches/${solutionId}`} replace />;
  return <Navigate to={`/student/pitches/${solutionId}`} replace />;
};

const UniversalSolutionRoute = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const role = user?.role;
  if (role === 'university_coordinator' || role === 'faculty_mentor') return <Navigate to={`/university/pitches/${id}`} replace />;
  if (role === 'industry_partner') return <Navigate to={`/industry/pitches/${id}`} replace />;
  if (role === 'gov_admin') return <Navigate to={`/officer/pitches/${id}`} replace />;
  return <Navigate to={`/student/pitches/${id}`} replace />;
};

const UniversalProjectRoute = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const role = user?.role;
  if (role === 'student') return <Navigate to={`/student/projects/${id}`} replace />;
  if (role === 'industry_partner') return <Navigate to={`/industry/projects/${id}`} replace />;
  if (role === 'gov_admin') return <Navigate to={`/officer/projects/${id}`} replace />;
  return <Navigate to={`/university/projects/${id}`} replace />;
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const publicRoutes = ['/', '/problems', '/solutions', '/how_it_works', '/success_stories', '/stats', '/public'];
  const isPublicPage = publicRoutes.includes(location.pathname);

  // Apply the student guild theme globally if the user is a student
  useEffect(() => {
    if (role === 'student' && !isPublicPage) {
      document.body.classList.add('theme-student-guild');
    } else {
      document.body.classList.remove('theme-student-guild');
    }
    return () => document.body.classList.remove('theme-student-guild');
  }, [role, isPublicPage]);

  const openAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleNavigate = (viewIdOrPath) => {
    setIsMobileSidebarOpen(false);
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
    const pitchId = typeof pitch === 'object' ? pitch.id : pitch;
    const pitchObj = typeof pitch === 'object' ? pitch : { id: pitch };
    setSelectedPitch(pitchObj);
    const baseRole = getBaseRole(role);
    navigate(`/${baseRole}/pitches/${pitchId}`);
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
        onSuccess={(profile) => {
          const userRole = profile?.role || role;
          navigate(`/${getBaseRole(userRole)}/dashboard`);
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
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
          />

          <div className="dashboard-main">
            <TopHeader
              onNavigate={handleNavigate}
              onSearch={setGlobalSearch}
              searchQuery={globalSearch}
              onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            />

            <main className="dashboard-content">
              <Routes>
                {/* Universal Deep-Link Canonical Routes (Section 44 & 56, Issues 44 & 56) */}
                <Route path="/challenges/:id" element={<UniversalChallengeRoute />} />
                <Route path="/challenges/:id/solutions" element={<UniversalChallengeSolutionsRoute />} />
                <Route path="/challenges/:id/solutions/:solutionId" element={<UniversalChallengeSolutionDetailRoute />} />
                <Route path="/solutions/:id" element={<UniversalSolutionRoute />} />
                <Route path="/projects/:id" element={<UniversalProjectRoute />} />

                {/* 1. Citizen Routes */}
                <Route element={<ProtectedRoute allowedRoles={['citizen', 'gov_admin']} />}>
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
                </Route>

                {/* 2. Student Routes */}
                <Route element={<ProtectedRoute allowedRoles={['student']} />}>
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
                </Route>

                {/* 3. University Routes (Coordinator & Mentor) */}
                <Route element={<ProtectedRoute allowedRoles={['university_coordinator', 'faculty_mentor']} />}>
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
                    path="/university/challenges/:id"
                    element={<UniversityChallengeView onBack={() => navigate('/university/adopted-problems')} onSelectPitch={handleSelectPitch} />}
                  />
                  <Route
                    path="/university/issues/:id"
                    element={<UniversityChallengeView onBack={() => navigate('/university/problem-pipeline')} onSelectPitch={handleSelectPitch} />}
                  />
                </Route>

                {/* 4. Industry Routes */}
                <Route element={<ProtectedRoute allowedRoles={['industry_partner']} />}>
                  <Route path="/industry" element={<Navigate to="/industry/dashboard" replace />} />
                  <Route
                    path="/industry/dashboard"
                    element={<IndustryDashboard onNavigate={handleNavigate} onSelectPitch={handleSelectPitch} />}
                  />
                  <Route path="/industry/engagements" element={<IndustryEngagementsView />} />
                  <Route path="/industry/opportunities" element={<IndustryEngagementsView />} />
                  <Route path="/industry/funding" element={<IndustryEngagementsView />} />
                  <Route path="/industry/partnerships" element={<IndustryEngagementsView />} />
                  <Route path="/industry/projects" element={<IndustryProjectsView onSelectPitch={handleSelectPitch} />} />
                  <Route path="/industry/mentorship" element={<IndustryProjectsView onSelectPitch={handleSelectPitch} />} />
                  <Route path="/industry/project-progress" element={<IndustryProjectsView onSelectPitch={handleSelectPitch} />} />
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
                </Route>

                {/* 5. Government / Officer Routes */}
                <Route element={<ProtectedRoute allowedRoles={['gov_admin']} />}>
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
                  <Route
                    path="/officer/pitches/:id"
                    element={<PitchDetailsView pitch={selectedPitch} onBack={() => navigate('/officer/projects')} onRefresh={() => {}} />}
                  />
                  <Route
                    path="/officer/projects/:id"
                    element={<ProjectDetailsView project={selectedProject} onBack={() => navigate('/officer/projects')} />}
                  />
                  <Route path="/officer/notifications" element={<NotificationsView />} />
                  <Route path="/officer/profile" element={<ProfileView />} />
                </Route>

                {/* 6. Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['gov_admin', 'admin']} />}>
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard onNavigate={handleNavigate} />}
                  />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/organizations" element={<OrganizationsManagement />} />
                  <Route path="/admin/problems" element={<AdminProblemsView />} />
                  <Route
                    path="/admin/problems/:id"
                    element={<IssueDetail issue={selectedIssue} backLabel="Back to Problems" onBack={() => navigate('/admin/problems')} onRefresh={() => {}} />}
                  />
                  <Route
                    path="/admin/issues/:id"
                    element={<IssueDetail issue={selectedIssue} backLabel="Back to Problems" onBack={() => navigate('/admin/problems')} onRefresh={() => {}} />}
                  />
                  <Route path="/admin/pitches" element={<AdminPitchesView />} />
                  <Route
                    path="/admin/pitches/:id"
                    element={<PitchDetailsView pitch={selectedPitch} onBack={() => navigate('/admin/pitches')} onRefresh={() => {}} />}
                  />
                  <Route path="/admin/projects" element={<ProjectsOverview />} />
                  <Route
                    path="/admin/projects/:id"
                    element={<ProjectDetailsView project={selectedProject} onBack={() => navigate('/admin/projects')} />}
                  />
                  <Route path="/admin/analytics" element={<ImpactAnalytics />} />
                  <Route path="/admin/reports" element={<ReportsDocuments />} />
                  <Route path="/admin/system-logs" element={<SystemLogsView />} />
                  <Route path="/admin/settings" element={<AdminSettingsView />} />
                  <Route path="/admin/notifications" element={<NotificationsView />} />
                  <Route path="/admin/profile" element={<ProfileView />} />
                </Route>

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to={role ? `/${getBaseRole(role)}/dashboard` : '/'} replace />} />
              </Routes>
            </main>
          </div>
        </div>
      )}
      <MobileBottomNav />
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
