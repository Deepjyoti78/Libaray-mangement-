import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  Menu,
  X,
  Ticket,
  LayoutDashboard,
  ArrowRight,
  Home,
  Info,
  BookOpen,
  Sprout,
  Map,
  CreditCard,
  Phone,
  ChevronRight,
  ChevronsLeft
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Reading Room', href: '#reading-room' },
  { label: 'Manga Corner', href: '#manga-corner' },
  { label: 'Visit Guide', href: '#visit' },
  { label: 'My Pass', href: '/my-booking' },
  { label: 'Contact', href: '#contact' },
];

const MOBILE_NAV_ITEMS = [
  { label: 'Home', href: '#home', icon: Home },
  { label: 'About', href: '#about', icon: Info },
  { label: 'Reading Room', href: '#reading-room', icon: BookOpen },
  { label: 'Manga Corner', href: '#manga-corner', icon: Sprout },
  { label: 'Visit Guide', href: '#visit', icon: Map },
  { label: 'My Pass', href: '/my-booking', icon: CreditCard },
  { label: 'Contact', href: '#contact', icon: Phone },
];

export default function Header({ onBookSlot }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('EN');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      if (location.pathname !== '/') {
        navigate('/' + href);
      } else {
        const el = document.querySelector(href);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      e.preventDefault();
      navigate(href);
    }
    setMobileOpen(false);
  };

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !isScrolled;

  const isItemActive = (item) => {
    if (item.href === '#home') {
      return isHome && (!location.hash || location.hash === '#home' || location.hash === '');
    }
    if (item.href === '#reading-room') {
      return (isHome && location.hash === '#reading-room') || location.pathname.startsWith('/spaces/reading-room');
    }
    if (item.href === '#manga-corner') {
      return (isHome && location.hash === '#manga-corner') || location.pathname.startsWith('/spaces/manga-corner');
    }
    if (item.href.startsWith('#')) {
      return isHome && location.hash === item.href;
    }
    return location.pathname === item.href;
  };

  return (
    <>
      <header className={`header ${isTransparent ? 'header-transparent' : 'header-scrolled'}`} role="banner">
        <div className="container header-inner">
          <a
            href="#home"
            className="header-brand"
            onClick={(e) => handleNavClick(e, '#home')}
            aria-label="The Library, New Delhi - Home"
          >
            <div className="header-emblem-mark" aria-hidden="true">
              <span className="emblem-square" />
              <span className="emblem-line" />
            </div>
            <div className="header-wordmark">
              <span className="header-wordmark-name">The Library</span>
              <span className="header-wordmark-sub">LIBRARY / NEW DELHI</span>
            </div>
          </a>

          {/* Partition 1: Between Brand and Navigation Links */}
          <span className="header-partition" aria-hidden="true" />

          <nav className="header-nav" aria-label="Main navigation">
            <ul className="header-nav-links">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    className={`header-nav-link ${isItemActive(link) ? 'active' : ''}`}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Partition 2: Between Contact and Language Switcher */}
          <span className="header-partition" aria-hidden="true" />

          <div className="header-actions">
            <div className="header-lang" role="group" aria-label="Language selection">
              <button
                type="button"
                className={`lang-option ${activeLang === 'EN' ? 'active' : ''}`}
                onClick={() => setActiveLang('EN')}
              >
                EN
              </button>
              <span className="lang-sep" aria-hidden="true">/</span>
              <button
                type="button"
                className={`lang-option ${activeLang === 'JA' ? 'active' : ''}`}
                onClick={() => setActiveLang('JA')}
              >
                日本語
              </button>
            </div>

            {/* Partition 3: Between Language Switcher and Reserve a Visit */}
            <span className="header-partition" aria-hidden="true" />

            <button
              type="button"
              className="header-book-btn"
              onClick={onBookSlot}
              aria-label="Reserve a Visit"
            >
              <Calendar className="btn-icon" />
              <span>Reserve a Visit</span>
              <ArrowRight className="btn-icon-arrow" />
            </button>

            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer Panel matching reference mockup */}
      <aside
        className={`mobile-drawer-panel ${mobileOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation drawer"
      >
        <div className="mobile-drawer-inner">
          {/* Drawer Top Header */}
          <div className="mobile-drawer-header">
            <div className="drawer-brand-group">
              <div className="drawer-book-icon-wrap" aria-hidden="true">
                <BookOpen size={24} className="drawer-book-icon" />
              </div>
              <div className="drawer-wordmark">
                <span className="drawer-title">The Library</span>
                <span className="drawer-tagline">Read · Explore · Belong</span>
              </div>
            </div>

            <button
              type="button"
              className="drawer-close-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation drawer"
            >
              <ChevronsLeft size={18} />
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="drawer-nav-list" aria-label="Mobile Navigation">
            {MOBILE_NAV_ITEMS.map((item) => {
              const IconComp = item.icon;
              const active = isItemActive(item);

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`drawer-nav-item ${active ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  <div className="drawer-item-left">
                    <span className="drawer-item-icon-box">
                      <IconComp size={18} className="drawer-item-icon" />
                    </span>
                    <span className="drawer-item-label">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="drawer-item-chevron" />
                </a>
              );
            })}
          </nav>

          <div className="drawer-section-divider" aria-hidden="true" />

          {/* Action CTAs */}
          <div className="drawer-actions-stack">
            <button
              type="button"
              className="drawer-action-primary"
              onClick={() => {
                onBookSlot?.();
                setMobileOpen(false);
              }}
              aria-label="Reserve a Visit"
            >
              <div className="drawer-btn-left">
                <Calendar size={18} />
                <span>Reserve a Visit</span>
              </div>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="drawer-action-secondary"
              onClick={() => {
                navigate('/my-booking');
                setMobileOpen(false);
              }}
            >
              <div className="drawer-btn-left">
                <Ticket size={18} />
                <span>Find My Pass</span>
              </div>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className="drawer-action-secondary"
              onClick={() => {
                navigate('/admin');
                setMobileOpen(false);
              }}
            >
              <div className="drawer-btn-left">
                <LayoutDashboard size={18} />
                <span>Staff Dashboard</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Bottom Ambient Inspiration Card */}
          <div className="drawer-ambient-card">
            <div className="drawer-ambient-content">
              <p className="drawer-ambient-quote">
                A quiet place<br />
                for curious minds.
              </p>
              <div className="drawer-ambient-line" aria-hidden="true" />
            </div>
            <div className="drawer-ambient-img-wrap" aria-hidden="true">
              <img
                src="/images/books-literature.jpg"
                alt=""
                className="drawer-ambient-img"
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
