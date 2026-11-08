import { useState, useRef, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const SPACES = [
  {
    id: 'reading-room',
    to: '/spaces/reading-room',
    title: 'Reading Room',
    img: '/images/library-study-room.webp',
    alt: 'Reading room with study desks and books',
    tag: 'Quiet Sanctuary',
    hasBookIcon: true,
    num: '01',
    colTag: 'Silent Study',
    desc: 'Quiet reading, study and research.'
  },
  {
    id: 'community-area',
    to: '/spaces/community-area',
    title: 'Community Area',
    img: '/images/library-reading-area.webp',
    alt: 'Community reading lounge',
    tag: 'Community & Lounge',
    num: '02',
    colTag: 'Collaborative',
    desc: 'Relax, read and connect with fellow members.'
  },
  {
    id: 'manga-corner',
    to: '/spaces/manga-corner',
    title: 'Manga Corner',
    img: '/images/manga-corner-collection.jpg',
    alt: 'Manga collection shelves',
    tag: 'Curated Volumes',
    num: '03',
    colTag: 'Curated Volumes',
    desc: 'Explore a wide range of Japanese manga and graphic novels.'
  },
  {
    id: 'visitor-info',
    to: '/spaces/visitor-info',
    title: 'Visitor Information',
    img: '/images/library-circulation-desk.webp',
    alt: 'Library circulation desk counter',
    tag: 'Reception & Loans',
    num: '04',
    colTag: 'Visitor Guide',
    desc: 'Circulation desk, membership verification, and hours.'
  }
];

export default function EditorialGrid() {
  const gridRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const onScroll = () => {
      const cards = el.querySelectorAll('.space-showcase-card');
      if (!cards.length) return;
      const scrollLeft = el.scrollLeft;
      const cardWidth = cards[0].offsetWidth + 14;
      const idx = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.max(0, Math.min(SPACES.length - 1, idx)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToIndex = (idx) => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.space-showcase-card');
    if (cards[idx]) {
      cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      setActiveIndex(idx);
    }
  };

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    const el = document.querySelector(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="editorial" id="about" aria-label="Library Spaces and Overview">
      <div className="container">
        {/* Section Header */}
        <div className="editorial-section-header reveal">
          <div className="editorial-header-left">
            <span className="label">OUR SPACES</span>
            <h2 className="heading-lg editorial-main-title">
              A space to settle in
            </h2>
          </div>
          <div className="editorial-header-right">
            <a
              href="#spaces"
              className="spaces-view-all-btn"
              onClick={(e) => handleScroll(e, '#spaces')}
            >
              <span>View all</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Responsive Spaces Showcase Cards (4 cards in one row on desktop, swipeable carousel on mobile) */}
        <div className="spaces-showcase-grid reveal" id="spaces" ref={gridRef}>
          {SPACES.map((space) => (
            <Link
              key={space.id}
              to={space.to}
              className="space-showcase-card space-card-clickable"
              id={space.id}
              title={`Explore ${space.title} Details & Photos`}
            >
              <div className="space-card-media">
                <img
                  src={space.img}
                  alt={space.alt}
                  width={700}
                  height={460}
                  loading="lazy"
                  className="space-card-img"
                />
                <span className="space-card-tag">
                  {space.hasBookIcon && <BookOpen size={11} className="space-tag-icon" />}
                  <span>{space.tag}</span>
                </span>
              </div>
              <div className="space-card-content">
                <div className="space-card-meta">
                  <span className="section-number">{space.num}</span>
                  <span className="col-tag">{space.colTag}</span>
                </div>
                <div className="space-card-title-row">
                  <h3 className="heading-md space-card-title">{space.title}</h3>
                  <div className="space-circle-arrow-btn" aria-hidden="true">
                    <ArrowRight size={13} />
                  </div>
                </div>
                <p className="space-card-desc">
                  {space.desc}
                </p>
                <span className="text-link space-card-action">
                  <span>View Full Details &amp; Photos</span>
                  <ArrowRight size={13} className="btn-icon-arrow" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Carousel Controls (Arrows & Pagination Dots) */}
        <div className="spaces-carousel-controls" aria-label="Spaces carousel pagination">
          <button
            type="button"
            className="spaces-carousel-arrow-btn"
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            aria-label="Previous space"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="spaces-carousel-dots" role="tablist">
            {SPACES.map((space, idx) => (
              <button
                key={space.id}
                type="button"
                role="tab"
                aria-selected={activeIndex === idx}
                aria-label={`Go to ${space.title}`}
                className={`spaces-carousel-dot ${activeIndex === idx ? 'active' : ''}`}
                onClick={() => scrollToIndex(idx)}
              />
            ))}
          </div>

          <button
            type="button"
            className="spaces-carousel-arrow-btn"
            onClick={() => scrollToIndex(Math.min(SPACES.length - 1, activeIndex + 1))}
            disabled={activeIndex === SPACES.length - 1}
            aria-label="Next space"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
