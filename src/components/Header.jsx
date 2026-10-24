import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Reading Room', href: '#reading-room' },
  { label: 'Manga Corner', href: '#manga-corner' },
  { label: 'Visit Guide', href: '#visit' },
  { label: 'Contact', href: '#contact' },
];

export default function Header({ onBookSlot }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileOpen(false);
  };

  return (
    <>
      <header className="header" role="banner">
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
            <div className="header-lang" aria-label="Language selection">
              <span className="lang-option active">EN</span>
              <span className="lang-sep">/</span>
              <span className="lang-option">日本語</span>
            </div>

            <Link
              to="/book"
              className="header-book-btn"
              onClick={onBookSlot}
              aria-label="Book a Slot for library visit"
            >
              <Calendar className="btn-icon" />
              <span>Book a Slot</span>
            </Link>

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
            <div className="header-lang">
              <span className="lang-option active">EN</span>
              <span className="lang-sep">/</span>
              <span className="lang-option">日本語</span>
            </div>
            <Link
              to="/book"
              className="header-book-btn full-width"
              onClick={() => {
                onBookSlot?.();
                setMobileOpen(false);
              }}
            >
              <Calendar className="btn-icon" />
              <span>Book a Slot</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
