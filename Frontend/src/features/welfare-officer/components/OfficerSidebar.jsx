import React from 'react';
import { Users, LogOut, Moon, Sun, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext.jsx';
import '../../../components/appsidebar.css';

export function OfficerSidebar({ onLogout }) {
  const { isLight, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isRosterActive = location.pathname.startsWith('/welfare-officer');

  return (
    <>
      <aside className="app-sidebar sidebar-wrapper">
        <div className="sidebar-group">
          <button
            type="button"
            className={`sidebar-icon-btn ${isRosterActive ? 'sidebar-icon-btn-active' : 'sidebar-icon-btn-inactive'}`}
            title="Unit Roster"
            aria-label="Unit Roster"
            onClick={() => navigate('/welfare-officer')}
          >
            <Users size={21} strokeWidth={3} />
          </button>
        </div>

        <div className="sidebar-group">
          <button
            type="button"
            className="sidebar-icon-btn sidebar-icon-btn-inactive"
            title={isLight ? 'Use dark theme' : 'Use light theme'}
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {isLight ? <Moon size={20} strokeWidth={3} /> : <Sun size={20} strokeWidth={3} />}
          </button>
          <button
            type="button"
            className="sidebar-icon-btn sidebar-icon-btn-inactive sidebar-logout-btn"
            title="Logout"
            aria-label="Logout"
            onClick={onLogout}
          >
            <LogOut size={20} strokeWidth={3} />
          </button>
          <button
            type="button"
            className="sidebar-icon-btn sidebar-icon-btn-inactive sidebar-home-btn"
            title="Home"
            aria-label="Home"
            onClick={() => navigate('/')}
          >
            <Home size={21} strokeWidth={3} />
          </button>
        </div>
      </aside>

      {/* Mobile navigation bar */}
      <nav className="mobile-bottom-nav" aria-label="Welfare navigation">
        <button
          type="button"
          className={`mobile-nav-btn ${isRosterActive ? 'mobile-nav-btn-active' : ''}`}
          onClick={() => navigate('/welfare-officer')}
        >
          <span className="mobile-nav-icon">
            <Users size={22} strokeWidth={3} />
          </span>
          <span className="mobile-nav-label">Roster</span>
        </button>
        <button
          type="button"
          className="mobile-nav-btn"
          onClick={toggleTheme}
        >
          <span className="mobile-nav-icon">
            {isLight ? <Moon size={22} strokeWidth={3} /> : <Sun size={22} strokeWidth={3} />}
          </span>
          <span className="mobile-nav-label">Theme</span>
        </button>
        <button
          type="button"
          className="mobile-nav-btn"
          onClick={onLogout}
        >
          <span className="mobile-nav-icon">
            <LogOut size={22} strokeWidth={3} />
          </span>
          <span className="mobile-nav-label">Logout</span>
        </button>
      </nav>
    </>
  );
}

export default OfficerSidebar;
