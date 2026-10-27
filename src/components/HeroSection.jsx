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

      {/* Authentic Japanese Framing Illustrations Layer matching Image 2 reference */}
      <div className="hero-illustrations-layer" aria-hidden="true">
        {/* Top-Left: Sakura Branch & Hanging Chochin Lantern */}
        <svg className="hero-decor-top-left" viewBox="0 0 340 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFA654" stopOpacity="0.12" />
              <stop offset="60%" stopColor="#D4663B" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#A8431C" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="lanternBodyGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B8582C" stopOpacity="0.75" />
              <stop offset="20%" stopColor="#DE955D" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#F5D0A4" stopOpacity="0.85" />
              <stop offset="80%" stopColor="#DE955D" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#B8582C" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="barkGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2E1C12" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4A2F21" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="sakuraPetalGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F2B8AA" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#DE826A" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#BD4F35" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Soft Subtle Ambient Glow behind Lantern */}
          <circle cx="82" cy="185" r="75" fill="url(#lanternGlow)" />

          {/* Hanging Cord from ceiling */}
          <line x1="82" y1="0" x2="82" y2="114" stroke="#3A2418" strokeWidth="1.8" opacity="0.7" />
          <circle cx="82" cy="114" r="4" fill="#A8431C" stroke="#2B160C" strokeWidth="1" opacity="0.8" />

          {/* Traditional Japanese Paper Lantern (Andon / Chochin) */}
          <g className="lantern-group" opacity="0.9">
            {/* Top Cap (Dark Wood) */}
            <path d="M 58,118 L 106,118 L 112,128 L 52,128 Z" fill="#2E1B10" stroke="#1A0D07" strokeWidth="1" opacity="0.85" />
            <rect x="74" y="112" width="16" height="6" rx="2" fill="#4A2E1E" opacity="0.85" />

            {/* Curved Lantern Paper Body */}
            <path d="M 52,128 Q 40,185 52,236 L 112,236 Q 124,185 112,128 Z" fill="url(#lanternBodyGrad)" stroke="#5A2E15" strokeWidth="1" opacity="0.88" />

            {/* Vertical Wooden Rib Struts */}
            <path d="M 68,128 Q 60,185 68,236" stroke="#7A3614" strokeWidth="0.9" opacity="0.45" fill="none" />
            <path d="M 82,128 L 82,236" stroke="#7A3614" strokeWidth="0.9" opacity="0.4" fill="none" />
            <path d="M 96,128 Q 104,185 96,236" stroke="#7A3614" strokeWidth="0.9" opacity="0.45" fill="none" />

            {/* Horizontal Wire Rings (Higo) */}
            <line x1="49" y1="150" x2="115" y2="150" stroke="#9A481E" strokeWidth="0.6" opacity="0.3" />
            <line x1="46" y1="172" x2="118" y2="172" stroke="#9A481E" strokeWidth="0.6" opacity="0.3" />
            <line x1="46" y1="194" x2="118" y2="194" stroke="#9A481E" strokeWidth="0.6" opacity="0.3" />
            <line x1="49" y1="216" x2="115" y2="216" stroke="#9A481E" strokeWidth="0.6" opacity="0.3" />

            {/* Kanji Calligraphy on Lantern: 読書 (Dokusho - Reading) */}
            <text x="82" y="174" textAnchor="middle" fill="#221109" fontFamily="serif" fontSize="21" fontWeight="bold" opacity="0.85">読</text>
            <text x="82" y="212" textAnchor="middle" fill="#221109" fontFamily="serif" fontSize="21" fontWeight="bold" opacity="0.85">書</text>

            {/* Bottom Wooden Cap */}
            <path d="M 52,236 L 112,236 L 106,246 L 58,246 Z" fill="#2E1B10" stroke="#1A0D07" strokeWidth="1" opacity="0.85" />
            <rect x="76" y="246" width="12" height="7" rx="1.5" fill="#4A2E1E" opacity="0.85" />

            {/* Hanging Tassel */}
            <line x1="82" y1="253" x2="82" y2="275" stroke="#A8431C" strokeWidth="1.8" opacity="0.75" />
            <circle cx="82" cy="275" r="3" fill="#7E2D10" opacity="0.8" />
            <path d="M 80,277 L 77,315 L 87,315 L 84,277 Z" fill="#983815" opacity="0.65" />
          </g>

          {/* Delicate Cherry Blossom Branches framing top-left */}
          <g className="sakura-branch-top-left" opacity="0.82">
            <path d="M -10,35 Q 60,45 130,25 T 240,65 T 325,40" stroke="url(#barkGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 70,38 Q 110,85 145,115" stroke="url(#barkGrad)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M 125,98 Q 170,125 210,118" stroke="url(#barkGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 190,55 Q 220,95 260,92" stroke="url(#barkGrad)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <path d="M 40,40 Q 55,90 75,108" stroke="url(#barkGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Sakura Flowers */}
            <g transform="translate(145, 115) scale(0.9)">
              <circle cx="-12" cy="0" r="7.5" fill="url(#sakuraPetalGrad)" />
              <circle cx="12" cy="0" r="7.5" fill="url(#sakuraPetalGrad)" />
              <circle cx="0" cy="-12" r="7.5" fill="url(#sakuraPetalGrad)" />
              <circle cx="0" cy="12" r="7.5" fill="url(#sakuraPetalGrad)" />
              <circle cx="8" cy="8" r="7.5" fill="url(#sakuraPetalGrad)" />
              <circle cx="0" cy="0" r="3.5" fill="#E8B85A" opacity="0.8" />
            </g>
            <g transform="translate(210, 118) rotate(25) scale(0.8)">
              <circle cx="-10" cy="0" r="7" fill="url(#sakuraPetalGrad)" />
              <circle cx="10" cy="0" r="7" fill="url(#sakuraPetalGrad)" />
              <circle cx="0" cy="-10" r="7" fill="url(#sakuraPetalGrad)" />
              <circle cx="0" cy="10" r="7" fill="url(#sakuraPetalGrad)" />
              <circle cx="0" cy="0" r="3" fill="#E8B85A" opacity="0.8" />
            </g>
            <g transform="translate(260, 92) rotate(-15) scale(0.7)">
              <circle cx="-10" cy="0" r="6.5" fill="url(#sakuraPetalGrad)" />
              <circle cx="10" cy="0" r="6.5" fill="url(#sakuraPetalGrad)" />
              <circle cx="0" cy="-10" r="6.5" fill="url(#sakuraPetalGrad)" />
              <circle cx="0" cy="10" r="6.5" fill="url(#sakuraPetalGrad)" />
              <circle cx="0" cy="0" r="3" fill="#E8B85A" opacity="0.8" />
            </g>
            <g transform="translate(115, 30) rotate(45) scale(0.75)">
              <circle cx="-10" cy="0" r="7" fill="url(#sakuraPetalGrad)" />
              <circle cx="10" cy="0" r="7" fill="url(#sakuraPetalGrad)" />
              <circle cx="0" cy="-10" r="7" fill="url(#sakuraPetalGrad)" />
              <circle cx="0" cy="10" r="7.5" fill="url(#sakuraPetalGrad)" />
              <circle cx="0" cy="0" r="3" fill="#E8B85A" opacity="0.8" />
            </g>

            {/* Drifting Petals */}
            <ellipse cx="160" cy="180" rx="4" ry="7" transform="rotate(-35 160 180)" fill="url(#sakuraPetalGrad)" opacity="0.55" />
            <ellipse cx="230" cy="195" rx="3.5" ry="6.5" transform="rotate(25 230 195)" fill="url(#sakuraPetalGrad)" opacity="0.5" />
            <ellipse cx="140" cy="270" rx="3.5" ry="7" transform="rotate(40 140 270)" fill="url(#sakuraPetalGrad)" opacity="0.45" />
            <ellipse cx="80" cy="340" rx="3" ry="6" transform="rotate(-20 80 340)" fill="url(#sakuraPetalGrad)" opacity="0.4" />
            <ellipse cx="195" cy="310" rx="3.5" ry="7" transform="rotate(60 195 310)" fill="url(#sakuraPetalGrad)" opacity="0.5" />
          </g>
        </svg>

        {/* Top-Right: Setting Sun & Pagoda Silhouette & Sakura */}
        <svg className="hero-decor-top-right" viewBox="0 0 380 360" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#BD5530" stopOpacity="0.22" />
              <stop offset="70%" stopColor="#8C3518" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#551E0E" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sunDisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C45A32" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#852E15" stopOpacity="0.22" />
            </linearGradient>
          </defs>

          {/* Subtle Japanese Sun Disk */}
          <circle cx="280" cy="140" r="95" fill="url(#sunGlow)" />
          <circle cx="280" cy="140" r="68" fill="url(#sunDisk)" stroke="#C45A32" strokeWidth="0.8" strokeOpacity="0.3" />

          {/* Pagoda Silhouette in Sunset */}
          <g className="pagoda-top-right" transform="translate(245, 62)" opacity="0.75">
            <line x1="35" y1="10" x2="35" y2="30" stroke="#E0A678" strokeWidth="1.2" opacity="0.7" />
            <circle cx="35" cy="10" r="2" fill="#E0A678" opacity="0.7" />
            <path d="M 24,34 Q 35,28 46,34 L 42,39 L 28,39 Z" fill="#24130A" stroke="#C48458" strokeWidth="0.7" opacity="0.8" />
            <path d="M 18,46 Q 35,38 52,46 L 48,52 L 22,52 Z" fill="#24130A" stroke="#C48458" strokeWidth="0.7" opacity="0.8" />
            <path d="M 12,60 Q 35,50 58,60 L 53,67 L 17,67 Z" fill="#24130A" stroke="#C48458" strokeWidth="0.7" opacity="0.8" />
            <path d="M 6,76 Q 35,64 64,76 L 58,84 L 12,84 Z" fill="#24130A" stroke="#C48458" strokeWidth="0.8" opacity="0.8" />
            <path d="M 0,94 Q 35,80 70,94 L 64,105 L 6,105 Z" fill="#24130A" stroke="#C48458" strokeWidth="0.8" opacity="0.8" />
            <rect x="18" y="105" width="34" height="25" fill="#1A0D07" opacity="0.8" />
          </g>

          {/* Delicate Framing Sakura Branches */}
          <g className="sakura-top-right" opacity="0.75">
            <path d="M 390,20 Q 320,40 270,18 T 180,60" stroke="#3A2318" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 310,32 Q 280,75 240,85" stroke="#3A2318" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="270" cy="18" r="5" fill="#DE826A" opacity="0.7" />
            <circle cx="240" cy="85" r="5.5" fill="#DE826A" opacity="0.7" />
            <circle cx="180" cy="60" r="4.5" fill="#E89B86" opacity="0.65" />
            <ellipse cx="210" cy="115" rx="3" ry="5.5" transform="rotate(35 210 115)" fill="#DE826A" opacity="0.5" />
          </g>
        </svg>

        {/* Bottom-Left: Pagoda & Golden Japanese Waves (Seigaiha) */}
        <svg className="hero-decor-bottom-left" viewBox="0 0 380 260" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldWave" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(215, 155, 105, 0.4)" />
              <stop offset="50%" stopColor="rgba(235, 190, 150, 0.5)" />
              <stop offset="100%" stopColor="rgba(190, 110, 65, 0.2)" />
            </linearGradient>
            <linearGradient id="pagodaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3E2517" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#180E08" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Subtle Pagoda Silhouette */}
          <g className="pagoda-bottom-left" transform="translate(20, 75)" opacity="0.7">
            <line x1="70" y1="20" x2="70" y2="50" stroke="#D49D70" strokeWidth="1.4" opacity="0.65" />
            <circle cx="70" cy="20" r="2.5" fill="#D49D70" opacity="0.65" />
            <ellipse cx="70" cy="30" rx="5" ry="1.6" stroke="#D49D70" strokeWidth="0.8" fill="none" opacity="0.5" />
            <ellipse cx="70" cy="36" rx="4.5" ry="1.5" stroke="#D49D70" strokeWidth="0.8" fill="none" opacity="0.5" />
            <path d="M 52,55 Q 70,48 88,55 L 82,62 L 58,62 Z" fill="url(#pagodaFill)" stroke="#D49D70" strokeWidth="0.9" />
            <rect x="63" y="62" width="14" height="10" fill="#24150D" stroke="#A86535" strokeWidth="0.6" opacity="0.7" />
            <path d="M 44,72 Q 70,62 96,72 L 90,80 L 50,80 Z" fill="url(#pagodaFill)" stroke="#D49D70" strokeWidth="0.9" />
            <rect x="58" y="80" width="24" height="12" fill="#24150D" stroke="#A86535" strokeWidth="0.6" opacity="0.7" />
            <path d="M 35,92 Q 70,80 105,92 L 98,102 L 42,102 Z" fill="url(#pagodaFill)" stroke="#D49D70" strokeWidth="0.9" />
            <rect x="52" y="102" width="36" height="14" fill="#24150D" stroke="#A86535" strokeWidth="0.6" opacity="0.7" />
            <path d="M 24,116 Q 70,100 116,116 L 108,128 L 32,128 Z" fill="url(#pagodaFill)" stroke="#D49D70" strokeWidth="1" />
            <rect x="44" y="128" width="52" height="22" fill="#24150D" stroke="#A86535" strokeWidth="0.8" opacity="0.7" />
            <line x1="56" y1="128" x2="56" y2="150" stroke="#D49D70" strokeWidth="0.8" opacity="0.5" />
            <line x1="70" y1="128" x2="70" y2="150" stroke="#D49D70" strokeWidth="0.8" opacity="0.5" />
            <line x1="84" y1="128" x2="84" y2="150" stroke="#D49D70" strokeWidth="0.8" opacity="0.5" />
            <path d="M 36,150 L 104,150 L 112,170 L 28,170 Z" fill="#1C1008" stroke="#8E4E24" strokeWidth="0.8" opacity="0.7" />
          </g>

          {/* Delicate Golden Seigaiha Waves */}
          <g className="waves-bottom-left" opacity="0.65">
            <path d="M -20,260 C 40,240 80,190 150,210 C 220,230 260,180 340,220 C 370,235 390,260 400,260" stroke="url(#goldWave)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M -10,250 C 45,230 85,180 155,200 C 225,220 265,170 345,210" stroke="url(#goldWave)" strokeWidth="1.1" fill="none" opacity="0.7" />
            <path d="M 0,240 C 50,220 90,170 160,190 C 230,210 270,160 350,200" stroke="url(#goldWave)" strokeWidth="0.8" fill="none" opacity="0.5" />
            <ellipse cx="190" cy="195" rx="3.5" ry="6.5" transform="rotate(45 190 195)" fill="#DE826A" opacity="0.5" />
            <ellipse cx="295" cy="210" rx="3" ry="5.5" transform="rotate(-30 295 210)" fill="#DE826A" opacity="0.45" />
          </g>
        </svg>

        {/* Bottom-Right: Flowing Golden Waves & Drifting Petals */}
        <svg className="hero-decor-bottom-right" viewBox="0 0 380 260" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldWaveRight" x1="1" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(215, 155, 105, 0.4)" />
              <stop offset="50%" stopColor="rgba(235, 190, 150, 0.5)" />
              <stop offset="100%" stopColor="rgba(190, 110, 65, 0.2)" />
            </linearGradient>
          </defs>

          <g className="waves-bottom-right" opacity="0.65">
            <path d="M 400,260 C 340,240 300,190 230,210 C 160,230 120,180 40,220 C 10,235 -10,260 -20,260" stroke="url(#goldWaveRight)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M 390,250 C 335,230 295,180 225,200 C 155,220 115,170 35,210" stroke="url(#goldWaveRight)" strokeWidth="1.1" fill="none" opacity="0.7" />
            <path d="M 380,240 C 330,220 290,170 220,190 C 150,210 110,160 30,200" stroke="url(#goldWaveRight)" strokeWidth="0.8" fill="none" opacity="0.5" />
            <ellipse cx="190" cy="195" rx="3.5" ry="6.5" transform="rotate(-45 190 195)" fill="#DE826A" opacity="0.5" />
            <ellipse cx="85" cy="210" rx="3" ry="5.5" transform="rotate(30 85 210)" fill="#DE826A" opacity="0.45" />
            <ellipse cx="275" cy="225" rx="3.5" ry="6" transform="rotate(-20 275 225)" fill="#DE826A" opacity="0.5" />
          </g>
        </svg>

        {/* Ambient Drifting Sakura Petals - subtle and translucent */}
        <svg className="hero-decor-petals-field" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="120" cy="380" rx="4" ry="7" transform="rotate(-25 120 380)" fill="#DE826A" opacity="0.4" />
          <ellipse cx="290" cy="290" rx="3.5" ry="6.5" transform="rotate(40 290 290)" fill="#DE826A" opacity="0.35" />
          <ellipse cx="240" cy="460" rx="3" ry="6" transform="rotate(-15 240 460)" fill="#DE826A" opacity="0.4" />
          <ellipse cx="440" cy="350" rx="3.5" ry="7" transform="rotate(50 440 350)" fill="#DE826A" opacity="0.3" />
          <ellipse cx="580" cy="240" rx="3" ry="6" transform="rotate(-35 580 240)" fill="#DE826A" opacity="0.25" />
          <ellipse cx="640" cy="480" rx="3.5" ry="6.5" transform="rotate(30 640 480)" fill="#DE826A" opacity="0.3" />
          <ellipse cx="730" cy="330" rx="3" ry="6" transform="rotate(-20 730 330)" fill="#DE826A" opacity="0.3" />
          <ellipse cx="860" cy="620" rx="4" ry="7.5" transform="rotate(55 860 620)" fill="#DE826A" opacity="0.35" />
          <ellipse cx="980" cy="310" rx="3" ry="6" transform="rotate(-45 980 310)" fill="#DE826A" opacity="0.3" />
          <ellipse cx="1080" cy="460" rx="3.5" ry="7" transform="rotate(15 1080 460)" fill="#DE826A" opacity="0.35" />
        </svg>
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
            </div>

            {/* Eyebrow Label */}
            <div className="hero-eyebrow-row">
              <span className="hero-eyebrow-pill">BOOKS · CULTURE · PEOPLE · JAPAN</span>
            </div>

            {/* Editorial Main Heading with Highlighted 'read.' matching Image 2 */}
            <h1 className="hero-heading-editorial">
              Find your place<br className="hero-heading-break" /> to <span className="hero-heading-highlight">read.</span>
            </h1>

            {/* Terracotta Accent Line */}
            <div className="hero-heading-accent-line" aria-hidden="true" />

            {/* Supporting Text */}
            <p className="hero-subheading-editorial">
              Japanese books, manga and calm study spaces in New Delhi.
            </p>

            {/* Action CTAs */}
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

            {/* Japanese Traditional Quote Bar matching Image 2 */}
            <div className="hero-calligraphy-quote">
              <div className="hero-quote-bar" aria-hidden="true" />
              <div className="hero-quote-text">
                <span className="hero-quote-kanji">読書空間</span>
                <span className="hero-quote-sub">A calm space for curious minds.</span>
              </div>
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
