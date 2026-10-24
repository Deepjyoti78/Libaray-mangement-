const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Reading Room', href: '#reading-room' },
  { label: 'Manga Corner', href: '#manga-corner' },
  { label: 'Visit Guide', href: '#visit' },
  { label: 'Collections', href: '#collections' },
  { label: 'Contact', href: '#contact' },
];

export default function Footer() {
  const handleScroll = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer" id="contact" role="contentinfo">
      <div className="container">
        <div className="footer-main">
          {/* Brand & Wordmark */}
          <div className="footer-brand">
            <div className="footer-wordmark">
              <span className="footer-wordmark-title">The Library</span>
              <span className="footer-wordmark-sub">LIBRARY / NEW DELHI</span>
            </div>
            <p className="footer-tagline">
              Books, culture, periodicals, and quiet reading spaces dedicated to
              discovering Japan in New Delhi.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="footer-nav" aria-label="Footer navigation">
            <span className="footer-nav-heading">NAVIGATION</span>
            <ul className="footer-links-list">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    className="footer-nav-link"
                    href={link.href}
                    onClick={(e) => handleScroll(e, link.href)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Location & Hours Summary */}
          <div className="footer-info">
            <span className="footer-nav-heading">LOCATION &amp; HOURS</span>
            <div className="footer-info-content">
              <p className="footer-address">
                5A, Ring Road, Lajpat Nagar-IV<br />
                New Delhi 110024, India
              </p>
              <p className="footer-timing">
                Tuesday – Saturday: 11:00 AM – 6:30 PM<br />
                Closed on Sundays, Mondays &amp; Holidays
              </p>
            </div>
          </div>
        </div>

        {/* Restrained Bottom Bar with Student Concept Disclaimer */}
        <div className="footer-bottom">
          <p className="footer-disclaimer">
            Independent student concept — not an official service.
          </p>
          <span className="footer-credit">
            Concept design proposal for The Japan Foundation Library, New Delhi.
          </span>
        </div>
      </div>
    </footer>
  );
}
