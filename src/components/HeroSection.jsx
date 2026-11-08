import { ArrowRight } from 'lucide-react';

export default function HeroSection({ onBookSlot }) {
  const handleExploreClick = (e) => {
    e.preventDefault();
    const target =
      document.querySelector('#about') ||
      document.querySelector('#spaces') ||
      document.querySelector('#reading-room') ||
      document.querySelector('#collections');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-cinematic" id="home" aria-label="Introduction to The Library">
      {/* Background Cinematic Night Scene with Stars, Desks & Warm Lamps in Wildflower Meadow */}
      <div className="hero-cinematic-bg" aria-hidden="true">
        <img
          src="/images/a_highly_detailed_cinematic_night_scene_identical.png"
          alt="Peaceful library readers with warm desk lamps under a starry cosmic sky"
          className="hero-cinematic-img"
          loading="eager"
          fetchPriority="high"
        />
        <div className="hero-cinematic-overlay" />
      </div>

      <div className="container hero-cinematic-container">
        <div className="hero-cinematic-content">
          {/* Eyebrow Pill Badge */}
          <div className="hero-eyebrow-pill" aria-label="The Japan Foundation New Delhi">
            <span className="hero-eyebrow-dot" aria-hidden="true" />
            <span>THE JAPAN FOUNDATION · NEW DELHI</span>
          </div>

          <h1 className="hero-cinematic-heading">
            <span className="hero-cinematic-title-italic">A quieter world</span>
            <span className="hero-cinematic-title-regular">begins with a book.</span>
          </h1>

          <p className="hero-cinematic-subheading">
            Discover Japanese books, manga, and a peaceful space to read in New Delhi.
          </p>

          <div className="hero-cinematic-actions">
            <button
              type="button"
              className="hero-cinematic-btn-primary"
              onClick={onBookSlot}
              aria-label="Reserve a Visit"
            >
              <span>Reserve a Visit</span>
              <ArrowRight className="btn-cinematic-arrow" size={14} />
            </button>

            <a
              href="#collections"
              className="hero-cinematic-btn-secondary"
              onClick={handleExploreClick}
              aria-label="Explore the Collection"
            >
              <span>Explore the Collection</span>
              <ArrowRight className="btn-cinematic-arrow" size={14} />
            </a>
          </div>

          {/* Operational Hours & Feature Pill */}
          <div className="hero-feature-pills" aria-label="Library operational status">
            <span className="hero-pill-item">
              <span className="hero-live-dot" aria-hidden="true" />
              Open Today · 11:00 – 18:30
            </span>
            <span className="hero-pill-sep" aria-hidden="true">·</span>
            <span className="hero-pill-item">Free Admission</span>
          </div>
        </div>
      </div>
    </section>
  );
}
