import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection({ onBookSlot }) {
  const handleExploreClick = (e) => {
    e.preventDefault();
    const target = document.querySelector('#info-strip') || document.querySelector('#about');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero" id="home" aria-label="Introduction to The Library">
      <div className="container">
        <div className="hero-grid">
          {/* Left Column: Editorial Text (approx 42% width) */}
          <div className="hero-content">
            <span className="label hero-eyebrow">BOOKS · CULTURE · PEOPLE · JAPAN</span>

            <h1 className="hero-headline">
              A quieter place<br />
              to discover Japan.
            </h1>

            <div className="hero-rule" aria-hidden="true" />

            <p className="hero-body">
              Discover Japanese books, manga, periodicals and cultural resources
              in a welcoming space in New Delhi. Explore the collection, find
              your quiet corner, and make time for reading.
            </p>

            <div className="hero-actions">
              <Link
                to="/book"
                className="btn-primary"
                onClick={onBookSlot}
                aria-label="Reserve a Visit"
              >
                <Calendar className="btn-icon" />
                <span>Reserve a Visit</span>
                <ArrowRight className="btn-icon-arrow" />
              </Link>

              <a
                href="#info-strip"
                className="text-link hero-explore-link"
                onClick={handleExploreClick}
              >
                <span>Explore the Library</span>
                <ArrowRight className="btn-icon-arrow" />
              </a>
            </div>
          </div>

          {/* Right Column: Authentic Editorial Photography (approx 58% width) */}
          <div className="hero-visual" aria-label="Photographs of the actual library interior">
            <div className="hero-frame-main">
              <img
                src="/images/library-study-room.webp"
                alt="Study tables, wooden bookshelves, and indoor greenery inside the library interior in New Delhi"
                width={1024}
                height={768}
                loading="eager"
                fetchPriority="high"
                className="hero-img-primary"
              />
              <span className="hero-photo-caption">Reading &amp; Study Room · New Delhi</span>
            </div>

            {/* Deliberately art-directed secondary real photograph */}
            <div className="hero-frame-secondary" aria-hidden="true">
              <img
                src="/images/library-reading-area.webp"
                alt="Lounge armchairs, circular discussion table, and wall bookshelves under warm chandelier lighting"
                width={480}
                height={360}
                loading="eager"
                className="hero-img-secondary"
              />
            </div>

            {/* Restrained decorative terracotta accent mark */}
            <div className="hero-accent-mark" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
