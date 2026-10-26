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
            {/* Japanese Botanical & Geometric Background Art Illustration */}
            <div className="hero-content-bg-art" aria-hidden="true">
              {/* Soft Warm Radial Ambient Glow */}
              <div className="hero-art-glow" />

              {/* Japanese Kanji Calligraphy Watermark (読書空間 - Reading Space) */}
              <div className="hero-kanji-watermark">
                <span className="kanji-char">読</span>
                <span className="kanji-char">書</span>
                <span className="kanji-char">空</span>
                <span className="kanji-char">間</span>
              </div>

              {/* Japanese Traditional Botanical & Geometric Line Art SVG */}
              <svg
                className="hero-art-svg"
                viewBox="0 0 540 600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Traditional Zen Enso Ring */}
                <circle
                  cx="280"
                  cy="260"
                  r="190"
                  stroke="url(#artGoldGrad)"
                  strokeWidth="1.5"
                  strokeDasharray="6 8"
                  opacity="0.35"
                />
                <circle
                  cx="280"
                  cy="260"
                  r="140"
                  stroke="rgba(224, 130, 85, 0.2)"
                  strokeWidth="1"
                  opacity="0.4"
                />
                <circle
                  cx="280"
                  cy="260"
                  r="90"
                  stroke="rgba(255, 230, 205, 0.12)"
                  strokeWidth="1"
                  strokeDasharray="2 6"
                />

                {/* Delicate Japanese Botanical Branch Line Art (Sakura / Momiji) */}
                <path
                  d="M 60,420 C 120,380 180,330 240,310 C 300,290 380,270 460,210"
                  stroke="url(#artLineGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M 190,325 C 210,280 250,250 290,240"
                  stroke="url(#artLineGrad)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 280,298 C 320,315 360,330 410,320"
                  stroke="url(#artLineGrad)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 330,280 C 360,250 400,230 450,225"
                  stroke="url(#artLineGrad)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Stylized Cherry Blossom / Maple Petals */}
                <path
                  d="M 290,240 C 285,225 300,215 310,225 C 320,235 305,245 290,240 Z"
                  fill="rgba(224, 130, 85, 0.25)"
                  stroke="rgba(255, 200, 170, 0.4)"
                  strokeWidth="1"
                />
                <path
                  d="M 450,225 C 445,210 460,200 470,210 C 480,220 465,230 450,225 Z"
                  fill="rgba(224, 130, 85, 0.3)"
                  stroke="rgba(255, 200, 170, 0.4)"
                  strokeWidth="1"
                />
                <path
                  d="M 410,320 C 405,305 420,295 430,305 C 440,315 425,325 410,320 Z"
                  fill="rgba(224, 130, 85, 0.22)"
                  stroke="rgba(255, 200, 170, 0.35)"
                  strokeWidth="1"
                />
                <path
                  d="M 220,350 C 215,338 228,330 236,338 C 244,346 232,354 220,350 Z"
                  fill="rgba(224, 130, 85, 0.2)"
                  stroke="rgba(255, 200, 170, 0.3)"
                  strokeWidth="1"
                />

                {/* Floating Petal Accents */}
                <ellipse cx="160" cy="220" rx="6" ry="12" transform="rotate(-35 160 220)" fill="rgba(224, 130, 85, 0.2)" />
                <ellipse cx="380" cy="150" rx="5" ry="10" transform="rotate(25 380 150)" fill="rgba(255, 215, 185, 0.18)" />
                <ellipse cx="440" cy="380" rx="5" ry="11" transform="rotate(45 440 380)" fill="rgba(224, 130, 85, 0.18)" />
                <ellipse cx="120" cy="310" rx="4" ry="8" transform="rotate(-15 120 310)" fill="rgba(255, 215, 185, 0.15)" />

                {/* Traditional Japanese Seal Stamp (Hanko - 和 Harmony) */}
                <rect x="420" y="440" width="46" height="46" rx="8" stroke="rgba(200, 75, 45, 0.45)" strokeWidth="1.5" fill="rgba(200, 75, 45, 0.08)" />
                <text x="443" y="468" textAnchor="middle" fill="rgba(235, 120, 90, 0.65)" fontSize="18" fontFamily="serif" fontWeight="bold">和</text>

                {/* Gradients */}
                <defs>
                  <linearGradient id="artGoldGrad" x1="90" y1="70" x2="470" y2="450" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E08255" stopOpacity="0.5" />
                    <stop offset="0.5" stopColor="#F5D0A9" stopOpacity="0.25" />
                    <stop offset="1" stopColor="#E08255" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="artLineGrad" x1="60" y1="420" x2="460" y2="210" gradientUnits="userSpaceOnUse">
                    <stop stopColor="rgba(224, 130, 85, 0.55)" />
                    <stop offset="0.6" stopColor="rgba(255, 220, 190, 0.4)" />
                    <stop offset="1" stopColor="rgba(224, 130, 85, 0.1)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

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
                    src="/images/library-study-room.webp"
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
                    src="/images/library-reading-area.webp"
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
                    src="/images/manga-corner-collection.jpg"
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
