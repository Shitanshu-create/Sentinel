import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ProtectedRoute from './features/auth/components/ProtectedRoute.jsx';
import { useAuth } from './features/auth/hooks/useAuth.js';
import { fetchEntries, fetchObservations } from './features/ai-chat/services/journal.api.js';
import LandingPage from './pages/LandingPage.jsx';
import { formatEntry } from './shared/utils/formatEntry.js';
import { WelcomePopup } from './shared/components/WelcomePopup.jsx';

const AnalyticsPage = lazy(() => import('./features/analytics/pages/AnalyticsPage.jsx'));
const ChatPage = lazy(() => import('./features/ai-chat/pages/ChatPage.jsx'));
const Login = lazy(() => import('./features/auth/pages/LoginPage.jsx'));
const Register = lazy(() => import('./features/auth/pages/RegisterPage.jsx'));
const WritingPage = lazy(() => import('./features/writing/pages/WritingPage.jsx'));

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
  const isLoggedIn = !!user;

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
    } else {
      setEntries([]);
      setSelectedEntryId(null);
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
                <Navigate to="/journal" replace />
              ) : (
                <Login
                  onBack={() => navigate('/')}
                  onLoginSuccess={() => navigate('/journal')}
                  onOpenRegister={() => navigate('/signup')}
                />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isLoggedIn ? (
                <Navigate to="/journal" replace />
              ) : (
                <Register
                  onBack={() => navigate('/')}
                  onRegisterSuccess={() => navigate('/journal')}
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
                  entries={entries}
                  onSelectEntry={openEntryInJournal}
                />
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
