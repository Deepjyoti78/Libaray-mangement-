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
} from 'lucide-react';
import GlobalSearchModal from './GlobalSearchModal';

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
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

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="monochrome-spinner" />
        <p>Loading library management session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Derive active breadcrumb
  const getBreadcrumb = () => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      return { parent: 'Dashboard', current: 'Overview' };
    }
    if (location.pathname.includes('bookings')) {
      return { parent: 'Dashboard', current: 'Reservations' };
    }
    if (location.pathname.includes('check-in')) {
      return { parent: 'Dashboard', current: 'Circulation Check-in' };
    }
    if (location.pathname.includes('settings')) {
      return { parent: 'Administration', current: 'Settings' };
    }
    return { parent: 'Dashboard', current: 'Overview' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <div className={`monochrome-dashboard-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
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
                onClick={(e) => {
                  if (location.pathname === '/admin') {
                    e.preventDefault();
                    setSearchModalOpen(true);
                  }
                }}
              >
                <BookOpen size={18} className="nav-link-icon" />
                <span className="nav-link-text">Book Catalog</span>
              </NavLink>

              <NavLink
                to="/admin/members"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  if (location.pathname === '/admin') {
                    e.preventDefault();
                    setSearchModalOpen(true);
                  }
                }}
              >
                <Users size={18} className="nav-link-icon" />
                <span className="nav-link-text">Members</span>
              </NavLink>

              <NavLink
                to="/admin/loans"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  if (location.pathname === '/admin') {
                    e.preventDefault();
                    const tbl = document.querySelector('.recent-activity-card');
                    tbl?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
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
