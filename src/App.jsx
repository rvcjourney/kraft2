import { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { Container, Navbar, Card } from 'react-bootstrap';
import { FiBarChart2, FiAward } from 'react-icons/fi';

import HomePage from './components/Home/HomePage';
import AuthForm from './components/Auth/AuthForm';
import OnboardingFlow from './components/Onboarding/OnboardingFlow';
import LoanLesson from './components/Lessons/LoanLesson';
import LessonsHome from './components/Lessons/LessonsHome';
import ModuleTopicsView from './components/Lessons/ModuleTopicsView';
import EmployabilityScorecard from './components/Dashboard/EmployabilityScorecard';
import ProfileScreen from './components/Profile/ProfileScreen';
import Sidebar from './components/Layout/Sidebar';
import AgentSimplified from './components/RolePlay/AgentSimplified';
import DevTestPanel from './components/Dev/DevTestPanel';

import * as localAuth from './services/localAuth';
import { useUserStore, useOnboardingStore } from './store/userStore';
import './styles/App.css';

// ── Auth Guards ───────────────────────────────────────────────────────────────

function RequireAuth({ children }) {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}

function RequireOnboarding({ children }) {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  const profile = localStorage.getItem('onboarding_profile');
  if (!profile) return <Navigate to="/onboarding" replace />;
  return children;
}

// ── Authenticated Shell Layout ────────────────────────────────────────────────

function AppShell({ children }) {
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);
  const setCompleted = useOnboardingStore((s) => s.setCompleted);
  const userEmail = localStorage.getItem('email') || '';

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('ck_sidebar_collapsed') === 'true'
  );

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('ck_sidebar_collapsed', next ? 'true' : 'false');
  };

  // Derive active screen from current path for sidebar highlight
  const path = window.location.pathname.replace('/', '') || 'lessons';
  const screen = path.startsWith('lessons') ? 'lessons'
    : path.startsWith('roleplay') ? 'roleplay'
    : path.startsWith('dashboard') ? 'dashboard'
    : path.startsWith('profile') ? 'profile'
    : 'lessons';

  const handleLogout = () => {
    localAuth.logout();
    setUser(null);
    setCompleted(false);
    navigate('/auth');
  };

  return (
    <>
      <Sidebar
        screen={screen}
        setScreen={(s) => navigate(`/${s}`)}
        onLogout={handleLogout}
        userEmail={userEmail}
        collapsed={collapsed}
        onToggle={handleToggle}
      />
      <div className={`ck-main${collapsed ? ' ck-main--collapsed' : ''}`}>
        {children}
      </div>
    </>
  );
}

// ── Lessons Screen (3-level: modules → topics → lesson) ──────────────────────

function LessonsScreen() {
  const navigate = useNavigate();
  const { moduleId, topicIndex } = useParams();
  const userEmail = localStorage.getItem('email') || '';

  if (topicIndex !== undefined) {
    return (
      <LoanLesson
        startTopicIndex={Number(topicIndex)}
        onBack={() => navigate(`/lessons/${moduleId}`)}
      />
    );
  }

  if (moduleId) {
    return (
      <ModuleTopicsView
        moduleId={moduleId}
        onBack={() => navigate('/lessons')}
        onOpenTopic={(idx) => navigate(`/lessons/${moduleId}/${idx}`)}
      />
    );
  }

  return (
    <LessonsHome
      userEmail={userEmail}
      onOpenModule={(id) => navigate(`/lessons/${id}`)}
    />
  );
}

// ── Dashboard Screen ──────────────────────────────────────────────────────────

function DashboardScreen() {
  const navigate = useNavigate();
  const storedProfile = useMemo(() => {
    try {
      const p = localStorage.getItem('onboarding_profile');
      return p ? JSON.parse(p) : null;
    } catch { return null; }
  }, []);

  return (
    <Container fluid className="py-4 app-content-shell">
      <div className="row g-4 w-100">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="mb-0"><FiBarChart2 className="me-2 text-primary" /> Dashboard</h2>
          </div>

          {storedProfile && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h6 className="text-muted mb-2">Your Profile</h6>
                <div className="d-flex flex-wrap gap-3">
                  <span><strong>Goal:</strong> {storedProfile.goal || '—'}</span>
                  <span><strong>Target Role:</strong> {storedProfile.target_role || '—'}</span>
                  <span><strong>Industry:</strong> {storedProfile.industry || '—'}</span>
                </div>
              </Card.Body>
            </Card>
          )}

          <EmployabilityScorecard onClose={() => navigate('/lessons')} />
        </div>
      </div>
    </Container>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutesWithNav />
    </BrowserRouter>
  );
}

// Wrapper to use navigate for auth/onboarding redirects after login
function AppRoutesWithNav() {
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);
  const setCompleted = useOnboardingStore((s) => s.setCompleted);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const userEmail = localStorage.getItem('email') || '';

  useEffect(() => {
    const storedUser = localAuth.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      const profile = localStorage.getItem('onboarding_profile');
      if (profile) {
        setCompleted(true);
      }
    }
  }, [setUser, setCompleted]);

  return (
    <div className="app-shell">
      <DevTestPanel />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage onGetStarted={() => navigate('/auth')} />} />
        <Route
          path="/auth"
          element={
            isAuthenticated
              ? <Navigate to="/lessons" replace />
              : <Container fluid className="py-4 app-content-shell">
                  <AuthForm onSuccess={() => {
                    const profile = localStorage.getItem('onboarding_profile');
                    navigate(profile ? '/lessons' : '/onboarding');
                  }} />
                </Container>
          }
        />

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <div className="d-flex flex-column min-vh-100">
                <Navbar className="navbar-modern shadow-sm px-4">
                  <Navbar.Brand className="fw-bold d-flex align-items-center gap-2 brand-logo">
                    <div className="logo-icon"><FiAward size={20} /></div>
                    <div className="d-flex flex-column lh-1">
                      <span className="brand-name">CareerKraft</span>
                      <small className="brand-tagline">Skill. Practice. Grow.</small>
                    </div>
                  </Navbar.Brand>
                </Navbar>
                <Container fluid className="py-4 app-content-shell">
                  <OnboardingFlow onComplete={() => navigate('/lessons')} />
                </Container>
              </div>
            </RequireAuth>
          }
        />

        {/* Authenticated + onboarded */}
        <Route path="/lessons" element={
          <RequireOnboarding><AppShell><LessonsScreen /></AppShell></RequireOnboarding>
        } />
        <Route path="/lessons/:moduleId" element={
          <RequireOnboarding><AppShell><LessonsScreen /></AppShell></RequireOnboarding>
        } />
        <Route path="/lessons/:moduleId/:topicIndex" element={
          <RequireOnboarding><AppShell><LessonsScreen /></AppShell></RequireOnboarding>
        } />
        <Route path="/roleplay" element={
          <RequireOnboarding>
            <AppShell><AgentSimplified onBack={() => navigate('/lessons')} /></AppShell>
          </RequireOnboarding>
        } />
        <Route path="/dashboard" element={
          <RequireOnboarding><AppShell><DashboardScreen /></AppShell></RequireOnboarding>
        } />
        <Route path="/profile" element={
          <RequireOnboarding>
            <AppShell>
              <Container fluid className="py-4 app-content-shell">
                <ProfileScreen
                  onBack={() => navigate('/lessons')}
                  user={{ id: localStorage.getItem('user_id'), email: userEmail }}
                />
              </Container>
            </AppShell>
          </RequireOnboarding>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
