import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  CalendarDays,
  Receipt,
  BarChart2,
  ShieldCheck,
  Building2,
  Settings,
  ChevronLeft,
  ChevronDown,
  Search,
  Bell,
  LogOut,
  ExternalLink,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import GlobalSearchModal from './GlobalSearchModal';
import AdminLoadingScreen from './AdminLoadingScreen';

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Global Keyboard Shortcut: ⌘K or Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Synchronize admin theme on root and body when admin console is active
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark', 'black-theme');
      body.classList.add('dark-theme', 'black-theme');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark', 'black-theme');
      body.classList.remove('dark-theme', 'black-theme');
    }
  }, [isDark]);

  const forceLoading = location.search.includes('loading=true');

  if (loading || forceLoading) {
    return <AdminLoadingScreen title="Loading Management Session" subtitle="Verifying credentials and restoring library workspace..." />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Derive active breadcrumb
  const getBreadcrumb = () => {
    const p = location.pathname;
    if (p === '/admin' || p === '/admin/') {
      return { parent: 'Dashboard', current: 'Overview' };
    }
    if (p.includes('catalog')) {
      return { parent: 'Collections', current: 'Book Catalog' };
    }
    if (p.includes('members')) {
      return { parent: 'Patrons', current: 'Members Directory' };
    }
    if (p.includes('loans')) {
      return { parent: 'Circulation', current: 'Loans & Returns Desk' };
    }
    if (p.includes('bookings') || p.includes('reservations')) {
      return { parent: 'Operations', current: 'Reservations' };
    }
    if (p.includes('fines')) {
      return { parent: 'Circulation', current: 'Fines & Payments' };
    }
    if (p.includes('reports')) {
      return { parent: 'Analytics', current: 'Reports & Circulation' };
    }
    if (p.includes('librarians')) {
      return { parent: 'Administration', current: 'Librarians & Roles' };
    }
    if (p.includes('branches')) {
      return { parent: 'Administration', current: 'Branches & Spaces' };
    }
    if (p.includes('check-in')) {
      return { parent: 'Operations', current: 'QR Check-in Station' };
    }
    if (p.includes('settings')) {
      return { parent: 'Administration', current: 'System Settings' };
    }
    return { parent: 'Dashboard', current: 'Overview' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <div
      className={`monochrome-dashboard-layout ${collapsed ? 'sidebar-collapsed' : ''} ${isDark ? 'black-theme' : ''}`}
      data-theme={theme}
    >
      {/* 4. Left Sidebar */}
      <aside className="dashboard-sidebar">
        {/* Branding */}
        <div className="sidebar-branding">
          <div className="brand-logo-lockup">
            <div className="brand-icon-box">
              <BookOpen size={20} strokeWidth={2} className="brand-book-icon" />
            </div>
            <div className="brand-text-block">
              <span className="brand-title">SORA LIBRARY</span>
              <span className="brand-subtitle">Management Console</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-collapse-toggle"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar width"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="sidebar-nav-scroll">
          {/* Main Menu */}
          <div className="nav-section">
            <span className="nav-section-title">Main Menu</span>
            <nav className="nav-items-list" aria-label="Main menu">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} className="nav-link-icon" />
                <span className="nav-link-text">Dashboard</span>
              </NavLink>

              <NavLink
                to="/admin/catalog"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              >
                <BookOpen size={18} className="nav-link-icon" />
                <span className="nav-link-text">Book Catalog</span>
              </NavLink>

              <NavLink
                to="/admin/members"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              >
                <Users size={18} className="nav-link-icon" />
                <span className="nav-link-text">Members</span>
              </NavLink>

              <NavLink
                to="/admin/loans"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              >
                <ArrowLeftRight size={18} className="nav-link-icon" />
                <span className="nav-link-text">Loans &amp; Returns</span>
              </NavLink>

              <NavLink
                to="/admin/bookings"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              >
                <CalendarDays size={18} className="nav-link-icon" />
                <span className="nav-link-text">Reservations</span>
              </NavLink>

              <NavLink
                to="/admin/fines"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              >
                <Receipt size={18} className="nav-link-icon" />
                <span className="nav-link-text">Fines &amp; Payments</span>
              </NavLink>

              <NavLink
                to="/admin/reports"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              >
                <BarChart2 size={18} className="nav-link-icon" />
                <span className="nav-link-text">Reports &amp; Analytics</span>
              </NavLink>
            </nav>
          </div>

          {/* Administration Section */}
          <div className="nav-section">
            <span className="nav-section-title">Administration</span>
            <nav className="nav-items-list" aria-label="Administration menu">
              <NavLink
                to="/admin/librarians"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              >
                <ShieldCheck size={18} className="nav-link-icon" />
                <span className="nav-link-text">Librarians &amp; Roles</span>
              </NavLink>

              <NavLink
                to="/admin/branches"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              >
                <Building2 size={18} className="nav-link-icon" />
                <span className="nav-link-text">Branches</span>
              </NavLink>

              <NavLink
                to="/admin/settings"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              >
                <Settings size={18} className="nav-link-icon" />
                <span className="nav-link-text">Settings</span>
              </NavLink>
            </nav>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="sidebar-user-footer">
          <div
            className="user-profile-badge"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          >
            <div className="user-avatar-circle">
              {/* Fallback portrait or monogram initials */}
              <span className="user-initials">
                {user.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'AM'}
              </span>
            </div>

            <div className="user-text-meta">
              <span className="user-display-name">{user.name || 'Aarav Mehta'}</span>
              <span className="user-role-label">
                {user.role === 'admin' ? 'Library Admin' : user.role || 'Library Admin'}
              </span>
            </div>

            <ChevronDown size={14} className="user-chevron" />
          </div>

          {/* User popup dropdown */}
          {userDropdownOpen && (
            <div className="user-menu-dropdown">
              <Link to="/" target="_blank" className="user-menu-item">
                <ExternalLink size={14} />
                <span>Public Visitor Site</span>
              </Link>
              <button onClick={logout} className="user-menu-item logout">
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main-area">
        {/* 5. Top Utility Bar */}
        <header className="dashboard-utility-bar">
          <div className="utility-breadcrumbs">
            <span className="crumb-parent">{breadcrumb.parent}</span>
            <span className="crumb-separator">›</span>
            <span className="crumb-current">{breadcrumb.current}</span>
          </div>

          <div className="utility-right-controls">
            {/* Global Search Bar */}
            <div
              className="utility-search-box"
              onClick={() => setSearchModalOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="Open search dialog"
            >
              <Search size={15} className="utility-search-icon" />
              <span className="search-placeholder-text">Search books, members...</span>
              <kbd className="cmd-k-badge">⌘ K</kbd>
            </div>

            {/* Black Mode / Light Mode Functional Theme Button */}
            <button
              type="button"
              className={`utility-theme-pill-btn ${isDark ? 'active-dark' : 'active-light'}`}
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Black Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Black Mode'}
            >
              <span className="theme-toggle-switch">
                {isDark ? (
                  <Moon size={13} strokeWidth={2.4} className="theme-icon moon-icon" />
                ) : (
                  <Sun size={13} strokeWidth={2.4} className="theme-icon sun-icon" />
                )}
              </span>
              <span className="theme-toggle-text">{isDark ? 'Black Mode' : 'Light Mode'}</span>
            </button>

            {/* Notification Bell */}
            <div className="utility-notification-wrap">
              <button
                type="button"
                className="utility-icon-btn notification-btn"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={16} />
                <span className="notification-dot" />
              </button>

              {notificationsOpen && (
                <div className="notification-popover">
                  <div className="notif-header">Notifications</div>
                  <div className="notif-item">
                    <span className="notif-title">Monthly circulation report ready</span>
                    <span className="notif-time">10 mins ago</span>
                  </div>
                  <div className="notif-item">
                    <span className="notif-title">3 overdue notices queued</span>
                    <span className="notif-time">1 hour ago</span>
                  </div>
                </div>
              )}
            </div>

            {/* Return to Public Website */}
            <Link
              to="/"
              className="utility-public-site-btn"
              title="Return to Public Visitor Site"
            >
              <ExternalLink size={13} />
              <span>Public Site</span>
            </Link>

            {/* User Avatar Circle */}
            <div className="utility-user-avatar">
              <span className="utility-avatar-initials">
                {user.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'AM'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Dynamic Outlet */}
        <main className="dashboard-page-outlet">
          <Outlet />
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}
