import { Calendar, ArrowRight } from 'lucide-react';

export default function HeroSection({ onBookSlot }) {
  const handleExploreClick = (e) => {
    e.preventDefault();
    const target = document.querySelector('#info-strip') || document.querySelector('#collections') || document.querySelector('#about');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-full-bg" id="home" aria-label="Introduction to The Library">
      {/* Full-Bleed Authentic Japanese Library Interior Background */}
      <div className="hero-bg-media" aria-hidden="true">
        <img
          src="/images/hero-library.jpg"
          alt="Tranquil Japanese library reading hall with floor-to-ceiling wooden bookshelves and garden view"
          className="hero-bg-img"
          loading="eager"
          fetchPriority="high"
        />
        <div className="hero-bg-overlay" />
      </div>

      <div className="container hero-container">
        <div className="hero-content-wrap">
          {/* Eyebrow Label */}
          <div className="hero-eyebrow-row">
            <span className="hero-eyebrow-pill">BOOKS · CULTURE · PEOPLE · JAPAN</span>
          </div>

          {/* Editorial Main Heading */}
          <h1 className="hero-heading-editorial">
            Find your place<br className="hero-heading-break" /> to read.
          </h1>

          {/* Supporting Text */}
          <p className="hero-subheading-editorial">
            Japanese books, manga and calm study spaces in New Delhi.
          </p>

          {/* Action CTAs: Ivory Primary Button & Transparent Secondary */}
          <div className="hero-actions-group">
            <button
              type="button"
              className="hero-btn-ivory"
              onClick={onBookSlot}
              aria-label="Reserve a Visit"
            >
              <Calendar className="btn-icon" />
              <span>Reserve a Visit</span>
              <ArrowRight className="btn-icon-arrow" />
            </button>

            <a
              href="#collections"
              className="hero-btn-transparent"
              onClick={handleExploreClick}
              aria-label="Explore the Collection"
            >
              <span>Explore the Collection</span>
              <ArrowRight className="btn-icon-arrow" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
