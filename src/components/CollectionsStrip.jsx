import { ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLLECTIONS = [
  {
    title: 'Books',
    tag: 'Literature & Language',
    desc: 'Japanese prose, classical literature, JLPT textbooks, bilingual editions and research monographs.',
    image: '/images/library-study-room.webp',
    imagePosition: '15% 45%', // focused on the wooden bookshelves with Japanese book classifications
    alt: 'Classified wooden bookshelves with Japanese literature and reference volumes',
  },
  {
    title: 'Periodicals',
    tag: 'Magazines & Journals',
    desc: 'Contemporary Japanese magazines, art journals, cultural commentaries, and current news publications.',
    image: '/images/library-reading-area.webp',
    imagePosition: '48% 50%', // focused on the magazine stand and open periodicals shelf
    alt: 'Periodical rack and recent Japanese magazines in the reading lounge',
  },
  {
    title: 'Cultural Resources',
    tag: 'Arts, Cinema & Crafts',
    desc: 'Monographs on traditional architecture, tea ceremony, origami, cinema, kabuki, and contemporary craft.',
    image: '/images/library-reading-area.webp',
    imagePosition: '70% 30%', // focused on the warm discussion lounge and art references
    alt: 'Cultural art publications and discussion table under warm lighting',
  },
  {
    title: 'Events & Programs',
    tag: 'Screenings & Workshops',
    desc: 'Seasonal cultural screenings, book discussions, origami workshops, and Japanese language seminars.',
    image: '/images/library-circulation-desk.webp',
    imagePosition: '75% 40%', // focused on the library community information and event bulletin
    alt: 'Event announcements and member community desk at the library',
  },
];

export default function CollectionsStrip({ onBookSlot }) {
  return (
    <section className="collections" id="collections" aria-label="Library Collections and Resources">
      <div className="container">
        {/* Section Header */}
        <div className="collections-header reveal">
          <div className="collections-header-left">
            <span className="label">CURATED HOLDINGS</span>
            <h2 className="heading-lg">Explore the collections</h2>
          </div>
          <div className="collections-header-right">
            <p className="collections-intro-text">
              Over 20,000 volumes, periodicals, audio-visual materials, and
              learning resources available for in-library browsing and research.
            </p>
          </div>
        </div>

        {/* Compact Editorial Collection Strip */}
        <div className="collections-strip-grid">
          {COLLECTIONS.map((item, idx) => (
            <div className="collection-card reveal" key={item.title}>
              <div className="collection-img-frame">
                <img
                  src={item.image}
                  alt={item.alt}
                  width={400}
                  height={260}
                  loading="lazy"
                  className="collection-photo"
                  style={{ objectPosition: item.imagePosition }}
                />
                <span className="collection-num">0{idx + 1}</span>
              </div>

              <div className="collection-meta">
                <span className="collection-tag">{item.tag}</span>
                <h3 className="collection-title">{item.title}</h3>
                <p className="collection-desc">{item.desc}</p>
              </div>

              <div className="collection-card-footer">
                <a
                  href="#visit"
                  className="text-link"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#visit')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>Learn more</span>
                  <ArrowRight className="btn-icon-arrow" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Restrained Editorial Booking Callout */}
        <div className="booking-callout-banner reveal">
          <div className="booking-callout-content">
            <span className="label callout-eyebrow">YOUR VISIT</span>
            <h3 className="heading-md callout-title">Make time for reading.</h3>
            <p className="callout-desc">
              Plan a visit to the reading room or manga corner. Reserve your slot
              or stop by during open hours to discover a quiet space in New Delhi.
            </p>
          </div>

          <div className="booking-callout-actions">
            <button
              type="button"
              className="btn-primary callout-btn"
              onClick={onBookSlot}
              aria-label="Reserve a Visit"
            >
              <Calendar className="btn-icon" />
              <span>Reserve a Visit</span>
              <ArrowRight className="btn-icon-arrow" />
            </button>
            <span className="callout-note">Free entry · Advance slot recommended</span>
          </div>
        </div>
      </div>
    </section>
  );
}
