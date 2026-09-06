import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  FileText,
  LogOut,
  Menu,
  MessageSquareText,
  Plus,
  Moon,
  Sun,
  Home,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../features/theme/ThemeContext.jsx';
import './appsidebar.css';

const navItems = [
  { id: 'new', label: 'Add New Entry', icon: Plus },
  { id: 'journal', label: 'Open Writing Page', icon: FileText },
  { id: 'chat', label: 'AI Chat', icon: MessageSquareText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 }
];

const mobileNavItems = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'chat', label: 'AI Chat', icon: MessageSquareText },
  { id: 'new', label: 'Add New Entry', icon: Plus, prominent: true },
  { id: 'panel', label: 'Past Entries', icon: FileText }
];

function IconButton({ label, children, active = false, className = '', ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`sidebar-icon-btn ${
        active ? 'sidebar-icon-btn-active' : 'sidebar-icon-btn-inactive'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function AppSidebar({
  active,
  panelOpen = false,
  onTogglePanel,
  onNewEntry,
  onOpenWriting,
  onOpenChat,
  onOpenAnalytics,
  onLogout
}) {
  const { isLight, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileMoreRef = useRef(null);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        mobileMoreRef.current?.focus();
      }
    };

    const handlePointerDown = (event) => {
      if (
        mobileMenuRef.current?.contains(event.target) ||
        mobileMoreRef.current?.contains(event.target)
      ) {
        return;
      }
      setMobileMenuOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    requestAnimationFrame(() => {
      mobileMenuRef.current?.querySelector('button')?.focus();
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [mobileMenuOpen]);

  const handleNav = (id) => {
    // If we're on mobile and the panel is open, auto-close it when navigating
    if (panelOpen && id !== 'panel') {
      onTogglePanel?.();
    }

    if (id === 'new') {
      onNewEntry?.();
      return;
    }

    if (id === 'panel') onTogglePanel?.();
    if (id === 'journal') onOpenWriting?.();
    if (id === 'chat') onOpenChat?.();
    if (id === 'analytics') onOpenAnalytics?.();
  };

  const handleMobileNav = (id) => {
    handleNav(id);
    setMobileMenuOpen(false);
  };

  const handleMobileMenuAction = (action) => {
    action?.();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <aside className="app-sidebar sidebar-wrapper">
        <div className="sidebar-group">
          <IconButton
            label={panelOpen ? 'Collapse Past Entries' : 'Past Entries'}
            onClick={onTogglePanel}
            active={panelOpen}
          >
            {panelOpen ? <X size={21} strokeWidth={3} /> : <Menu size={22} strokeWidth={3} />}
          </IconButton>
          <div className="sidebar-divider" />
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <IconButton
                key={item.id}
                label={item.label}
                active={active === item.id}
                onClick={() => handleNav(item.id)}
              >
                <Icon size={21} strokeWidth={3} />
              </IconButton>
            );
          })}
        </div>

        <div className="sidebar-group">
          <IconButton
            label={isLight ? 'Use dark theme' : 'Use light theme'}
            onClick={toggleTheme}
          >
            {isLight ? <Moon size={20} strokeWidth={3} /> : <Sun size={20} strokeWidth={3} />}
          </IconButton>
          <IconButton label="Logout" onClick={onLogout} className="sidebar-logout-btn">
            <LogOut size={20} strokeWidth={3} />
          </IconButton>
          <IconButton label="Home" onClick={() => navigate('/')} className="sidebar-home-btn">
            <Home size={21} strokeWidth={3} />
          </IconButton>
        </div>
      </aside>

      <nav className="mobile-bottom-nav" aria-label="Primary navigation">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          let isActive = false;
          if (panelOpen) {
            isActive = item.id === 'panel';
          } else {
            isActive = item.id === 'new' ? active === 'journal' : active === item.id;
          }

          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              title={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`mobile-nav-btn ${isActive ? 'mobile-nav-btn-active' : ''} ${
                item.prominent ? 'mobile-nav-btn-prominent' : ''
              }`}
              onClick={() => handleMobileNav(item.id)}
            >
              <span className="mobile-nav-icon">
                <Icon size={item.prominent ? 26 : 21} strokeWidth={3} />
              </span>
              <span className="mobile-nav-label">
                {item.id === 'panel' ? 'Entries' : item.label.replace('Add New Entry', 'Add')}
              </span>
            </button>
          );
        })}

        <button
          ref={mobileMoreRef}
          type="button"
          aria-label="More options"
          aria-haspopup="menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-menu"
          title="More"
          className={`mobile-nav-btn ${mobileMenuOpen ? 'mobile-nav-btn-active' : ''}`}
          onClick={() => setMobileMenuOpen((value) => !value)}
        >
          <span className="mobile-nav-icon">
            <Menu size={23} strokeWidth={3} />
          </span>
          <span className="mobile-nav-label">More</span>
        </button>
      </nav>

      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          ref={mobileMenuRef}
          className="mobile-nav-sheet"
          role="menu"
          aria-label="More navigation options"
        >
          {/* <div className="mobile-nav-sheet-handle" aria-hidden="true" /> */}
          <button
            type="button"
            role="menuitem"
            className="mobile-sheet-action"
            onClick={() => {
              toggleTheme();
              // Prevent closing the menu so the user sees the transition
            }}
          >
            {isLight ? <Moon size={23} strokeWidth={3} /> : <Sun size={23} strokeWidth={3} />}
            <span>Theme</span>
            <span className={`mobile-theme-switch ${isLight ? 'mobile-theme-switch-light' : ''}`}>
              <span />
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="mobile-sheet-action"
            onClick={() => handleMobileMenuAction(onLogout)}
          >
            <LogOut size={23} strokeWidth={3} />
            <span>Logout</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="mobile-sheet-action"
            onClick={() => handleMobileMenuAction(() => navigate('/'))}
          >
            <Home size={23} strokeWidth={3} />
            <span>Home</span>
          </button>
        </div>
      )}
    </>
  );
}

export default AppSidebar;
