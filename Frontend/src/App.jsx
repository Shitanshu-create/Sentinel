import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ProtectedRoute from './features/auth/components/ProtectedRoute.jsx';
import { useAuth } from './features/auth/hooks/useAuth.js';
import { fetchEntries, fetchObservations } from './features/ai-chat/services/journal.api.js';
import { fetchMyAssessments } from './features/assessments/services/assessment.api.js';
import LandingPage from './pages/LandingPage.jsx';
import { formatEntry } from './shared/utils/formatEntry.js';
import { WelcomePopup } from './shared/components/WelcomePopup.jsx';

const AnalyticsPage = lazy(() => import('./features/analytics/pages/AnalyticsPage.jsx'));
const ChatPage = lazy(() => import('./features/ai-chat/pages/ChatPage.jsx'));
const Login = lazy(() => import('./features/auth/pages/LoginPage.jsx'));
const Register = lazy(() => import('./features/auth/pages/RegisterPage.jsx'));
const WritingPage = lazy(() => import('./features/writing/pages/WritingPage.jsx'));
const WelfareOfficerDashboardPage = lazy(() => import('./features/welfare-officer/pages/WelfareOfficerDashboardPage.jsx'));
const PersonnelDetailPage = lazy(() => import('./features/welfare-officer/pages/PersonnelDetailPage.jsx'));
const OfficerAssessmentsPage = lazy(() => import('./features/welfare-officer/pages/OfficerAssessmentsPage.jsx'));
const PersonnelAssessmentsPage = lazy(() => import('./features/assessments/pages/PersonnelAssessmentsPage.jsx'));
const CommandDashboardPage = lazy(() => import('./features/commanding-officer/pages/CommandDashboardPage.jsx'));
const UnitDetailPage = lazy(() => import('./features/commanding-officer/pages/UnitDetailPage.jsx'));

const getDestinationForRole = (role) => {
  if (role === 'commander') return '/commanding-officer';
  if (role === 'welfare_officer') return '/welfare-officer';
  return '/journal';
};

function LoadingScreen() {
  return (
    <main className="auth-page-container">
      <div className="auth-wrapper" style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 className="auth-title" style={{ animation: 'pulse 1.5s infinite' }}>Loading...</h1>
      </div>
    </main>
  );
}

function App() {
  const navigate = useNavigate();
  const { user, loading, handleLogout } = useAuth();
  const [entries, setEntries] = useState([]);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [pendingAssessments, setPendingAssessments] = useState(0);
  const isLoggedIn = !!user;

  const refreshPendingAssessments = async () => {
    if (user?.role === 'personnel') {
      try {
        const res = await fetchMyAssessments();
        const pending = (res.assessments || []).filter((a) => a.status === 'assigned').length;
        setPendingAssessments(pending);
      } catch (err) {
        // ignore errors in background fetch
      }
    }
  };

  useEffect(() => {
    if (user) {
      const getEntries = async () => {
        try {
          const [entriesResult] = await Promise.allSettled([
            fetchEntries(),
            fetchObservations()
          ]);
          const res = entriesResult.status === 'fulfilled' ? entriesResult.value : null;
          if (res?.entries) {
            setEntries(res.entries.map(formatEntry));
          }
        } catch (err) {
          console.error("Error fetching entries:", err);
        }
      };

      getEntries();
      if (user.role === 'personnel') {
        refreshPendingAssessments();
      } else {
        setPendingAssessments(0);
      }
    } else {
      setEntries([]);
      setSelectedEntryId(null);
      setPendingAssessments(0);
    }
  }, [user]);

  const logoutUser = async () => {
    await handleLogout();
    navigate('/');
  };

  const openEntryInJournal = (entry) => {
    setSelectedEntryId(entry.id);
    navigate('/journal');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<LandingPage isLoggedIn={isLoggedIn} />} />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to={getDestinationForRole(user?.role)} replace />
              ) : (
                <Login
                  onBack={() => navigate('/')}
                  onLoginSuccess={(loggedUser) => navigate(getDestinationForRole(loggedUser?.role))}
                  onOpenRegister={() => navigate('/signup')}
                />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isLoggedIn ? (
                <Navigate to={getDestinationForRole(user?.role)} replace />
              ) : (
                <Register
                  onBack={() => navigate('/')}
                  onRegisterSuccess={(registeredUser) => navigate(getDestinationForRole(registeredUser?.role))}
                  onOpenLogin={() => navigate('/login')}
                />
              )
            }
          />
          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <WritingPage
                  onLogout={logoutUser}
                  onOpenAnalytics={() => navigate('/analytics')}
                  onOpenChat={() => navigate('/chat')}
                  onOpenAssessments={() => navigate('/assessments')}
                  pendingAssessments={pendingAssessments}
                  entries={entries}
                  setEntries={setEntries}
                  selectedEntryId={selectedEntryId}
                  setSelectedEntryId={setSelectedEntryId}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage
                  onLogout={logoutUser}
                  onOpenAnalytics={() => navigate('/analytics')}
                  onOpenWriting={() => navigate('/journal')}
                  onOpenAssessments={() => navigate('/assessments')}
                  pendingAssessments={pendingAssessments}
                  entries={entries}
                  onSelectEntry={openEntryInJournal}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage
                  onLogout={logoutUser}
                  onOpenWriting={() => navigate('/journal')}
                  onOpenChat={() => navigate('/chat')}
                  onOpenAssessments={() => navigate('/assessments')}
                  pendingAssessments={pendingAssessments}
                  entries={entries}
                  onSelectEntry={openEntryInJournal}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments"
            element={
              <ProtectedRoute allowedRoles={['personnel']}>
                <PersonnelAssessmentsPage
                  onLogout={logoutUser}
                  onOpenWriting={() => navigate('/journal')}
                  onOpenChat={() => navigate('/chat')}
                  onOpenAnalytics={() => navigate('/analytics')}
                  onOpenAssessments={() => navigate('/assessments')}
                  pendingAssessments={pendingAssessments}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/welfare-officer"
            element={
              <ProtectedRoute allowedRoles={['welfare_officer', 'commander', 'admin']}>
                <WelfareOfficerDashboardPage onLogout={logoutUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/welfare-officer/assessments"
            element={
              <ProtectedRoute allowedRoles={['welfare_officer', 'commander', 'admin']}>
                <OfficerAssessmentsPage onLogout={logoutUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/welfare-officer/personnel/:id"
            element={
              <ProtectedRoute allowedRoles={['welfare_officer', 'commander', 'admin']}>
                <PersonnelDetailPage onLogout={logoutUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/commanding-officer"
            element={
              <ProtectedRoute allowedRoles={['commander', 'admin']}>
                <CommandDashboardPage onLogout={logoutUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/commanding-officer/units/:unitName"
            element={
              <ProtectedRoute allowedRoles={['commander', 'admin']}>
                <UnitDetailPage onLogout={logoutUser} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <WelcomePopup />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
