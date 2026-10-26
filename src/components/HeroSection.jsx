import { Calendar, ArrowRight } from 'lucide-react';

export default function HeroSection({ onBookSlot }) {
  const handleExploreClick = (e) => {
    e.preventDefault();
    const target = document.querySelector('#info-strip') || document.querySelector('#collections') || document.querySelector('#about');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSpaceClick = (e, targetId) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
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
        <div className="hero-grid-layout">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="hero-content-wrap">
            {/* Eyebrow Label */}
            <div className="hero-eyebrow-row">
              <span className="hero-eyebrow-pill">BOOKS · CULTURE · PEOPLE · JAPAN</span>
            </div>

            {/* Editorial Main Heading */}
            <h1 className="hero-heading-editorial">
              Find your place<br className="hero-heading-break" /> to read.
            </h1>

            {/* Terracotta Accent Line */}
            <div className="hero-heading-accent-line" aria-hidden="true" />

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

          {/* Right Column: Editorial Photo Collage (Desktop Only) */}
          <div className="hero-collage-wrap" aria-label="Spaces Showcase Collage">
            {/* Left Stack: Reading & Study Room + Community Area */}
            <div className="hero-collage-left-stack">
              {/* Card 1: Reading & Study Room */}
              <a
                href="#reading-room"
                className="hero-collage-card card-study"
                onClick={(e) => handleSpaceClick(e, '#reading-room')}
                title="View Reading & Study Room"
              >
                <div className="hero-card-img-wrap">
                  <img
                    src="/images/reading-room.jpg"
                    alt="Reading & Study Room"
                    className="hero-card-img"
                    loading="eager"
                  />
                </div>
                <div className="hero-card-caption">
                  <span className="hero-card-title">Reading &amp; Study Room</span>
                  <span className="hero-card-dash">—</span>
                  <ArrowRight className="hero-card-arrow" />
                </div>
              </a>

              {/* Card 2: Community Area */}
              <a
                href="#community-area"
                className="hero-collage-card card-community"
                onClick={(e) => handleSpaceClick(e, '#community-area')}
                title="View Community Area"
              >
                <div className="hero-card-img-wrap">
                  <img
                    src="/images/community-lounge.jpg"
                    alt="Community Area"
                    className="hero-card-img"
                    loading="eager"
                  />
                </div>
                <div className="hero-card-caption">
                  <span className="hero-card-title">Community Area</span>
                  <span className="hero-card-dash">—</span>
                  <ArrowRight className="hero-card-arrow" />
                </div>
              </a>
            </div>

            {/* Right Stack: Manga Corner */}
            <div className="hero-collage-right-stack">
              {/* Card 3: Manga Corner */}
              <a
                href="#manga-corner"
                className="hero-collage-card card-manga"
                onClick={(e) => handleSpaceClick(e, '#manga-corner')}
                title="View Manga Corner"
              >
                <div className="hero-card-img-wrap">
                  <img
                    src="/images/manga-corner.jpg"
                    alt="Manga Corner"
                    className="hero-card-img"
                    loading="eager"
                  />
                </div>
                <div className="hero-card-caption">
                  <span className="hero-card-title">Manga Corner</span>
                  <span className="hero-card-dash">—</span>
                  <ArrowRight className="hero-card-arrow" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
