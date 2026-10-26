import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Menu, X, Ticket, LayoutDashboard, ArrowRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Reading Room', href: '#reading-room' },
  { label: 'Manga Corner', href: '#manga-corner' },
  { label: 'Visit Guide', href: '#visit' },
  { label: 'My Pass', href: '/my-booking' },
  { label: 'Contact', href: '#contact' },
];

export default function Header({ onBookSlot }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('EN');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      e.preventDefault();
      navigate(href);
    }
    setMobileOpen(false);
  };

  return (
    <>
      <header className={`header ${isScrolled ? 'header-scrolled' : 'header-transparent'}`} role="banner">
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

          <nav className="header-nav" aria-label="Main navigation">
            <ul className="header-nav-links">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    className="header-nav-link"
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

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

      {/* Mobile navigation drawer */}
      <div
        className={`mobile-menu${mobileOpen ? ' open' : ''}`}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <div className="mobile-menu-inner">
          <div className="mobile-nav-links">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="mobile-nav-link"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="mobile-menu-actions">
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
            <button
              type="button"
              className="header-book-btn full-width"
              onClick={() => {
                onBookSlot?.();
                setMobileOpen(false);
              }}
              aria-label="Reserve a Visit"
            >
              <Calendar className="btn-icon" />
              <span>Reserve a Visit</span>
              <ArrowRight className="btn-icon-arrow" />
            </button>
            <button
              type="button"
              className="header-book-btn full-width mobile-pass-btn"
              onClick={() => {
                navigate('/my-booking');
                setMobileOpen(false);
              }}
            >
              <Ticket className="btn-icon" />
              <span>Find My Pass</span>
            </button>
            <button
              type="button"
              className="header-book-btn full-width mobile-dashboard-btn"
              onClick={() => {
                navigate('/admin');
                setMobileOpen(false);
              }}
            >
              <LayoutDashboard className="btn-icon" />
              <span>Staff Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
