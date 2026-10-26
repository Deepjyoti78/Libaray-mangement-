import { ArrowRight, CalendarDays, Clock, MapPin, Info, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EditorialGrid({ onBookSlot }) {
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
            <span className="label">LIBRARY SPACES &amp; ENVIRONMENT</span>
            <h2 className="heading-lg editorial-main-title">
              A space to settle in.
            </h2>
          </div>
          <div className="editorial-header-right">
            <span className="editorial-header-meta">
              The Japan Foundation, New Delhi · Reading Facilities
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Spaces Showcase Cards */}
        <div className="spaces-showcase-grid reveal" id="spaces">
          {/* Space Card 1: Reading Room */}
          <article className="space-showcase-card" id="reading-room">
            <div className="space-card-media">
              <img
                src="/images/reading-room.jpg"
                alt="Reading room with natural oak study desks, wooden bookshelves and garden view"
                width={700}
                height={460}
                loading="lazy"
                className="space-card-img"
              />
              <span className="space-card-tag">Quiet Sanctuary</span>
            </div>
            <div className="space-card-content">
              <div className="space-card-meta">
                <span className="section-number">01</span>
                <span className="col-tag">Silent Study</span>
              </div>
              <h3 className="heading-md space-card-title">Reading Room</h3>
              <p className="space-card-desc">
                A calm sanctuary for deep reading, study and research. Settle into
                natural oak desks, open bookshelves, and contemplative views.
              </p>
              <button
                type="button"
                className="text-link space-card-action"
                onClick={onBookSlot}
                aria-label="Reserve a slot in Reading Room"
              >
                <span>Reserve Reading Room</span>
                <ArrowRight className="btn-icon-arrow" />
              </button>
            </div>
          </article>

          {/* Space Card 2: Community Area */}
          <article className="space-showcase-card" id="community-area">
            <div className="space-card-media">
              <img
                src="/images/library-reading-area.webp"
                alt="Community reading lounge with circular discussion table, armchairs, and floor-to-ceiling bookshelves"
                width={700}
                height={460}
                loading="lazy"
                className="space-card-img"
              />
              <span className="space-card-tag">Community &amp; Lounge</span>
            </div>
            <div className="space-card-content">
              <div className="space-card-meta">
                <span className="section-number">02</span>
                <span className="col-tag">Collaborative</span>
              </div>
              <h3 className="heading-md space-card-title">Community Area</h3>
              <p className="space-card-desc">
                Comfortable lounge seating, discussion tables, periodicals racks, and
                open cultural shelves for relaxed browsing and exchange.
              </p>
              <a
                href="#visit"
                className="text-link space-card-action"
                onClick={(e) => handleScroll(e, '#visit')}
              >
                <span>View Visiting Details</span>
                <ArrowRight className="btn-icon-arrow" />
              </a>
            </div>
          </article>
        </div>

        {/* Supporting Editorial Features (Manga Corner & Visit Information) */}
        <div className="editorial-grid">
          {/* Item 03: Manga Corner (Authentic Shelving Crop) */}
          <article className="editorial-col editorial-feature reveal" id="manga-corner">
            <div className="col-top-meta">
              <span className="section-number">03</span>
              <span className="col-tag">Curated Volumes</span>
            </div>

            <div className="feature-media">
              <img
                src="/images/manga-corner.jpg"
                alt="Authentic Japanese literature and tankōbon manga volumes on library shelves"
                width={700}
                height={525}
                loading="lazy"
                className="feature-img manga-crop"
              />
              <span className="media-caption">Japanese Publications &amp; Tankōbon Shelves</span>
            </div>

            <div className="feature-text">
              <h3 className="heading-md">Manga Corner</h3>
              <p className="feature-desc">
                Browse popular series, graphic novels, and serialized editions
                in original Japanese and bilingual translations, curated for
                in-library reading.
              </p>
            </div>

            <a
              href="#visit"
              className="text-link"
              onClick={(e) => handleScroll(e, '#visit')}
            >
              <span>View Details</span>
              <ArrowRight className="btn-icon-arrow" />
            </a>
          </article>

          {/* Item 04: Plan Your Visit (Circulation Desk + Verified Schedule) */}
          <article className="editorial-col visit-panel reveal" id="visit">
            <div className="col-top-meta">
              <span className="section-number">04</span>
              <span className="col-tag">Schedule</span>
            </div>

            <div className="visit-media-strip">
              <img
                src="/images/library-circulation-desk.webp"
                alt="Actual library circulation desk counter with warm lighting and reception sign"
                width={700}
                height={350}
                loading="lazy"
                className="visit-desk-img"
              />
              <span className="media-caption">Circulation Desk &amp; Member Check-in</span>
            </div>

            <div className="visit-heading-wrap">
              <span className="label">PLAN YOUR VISIT</span>
              <h3 className="heading-sm visit-title">Visitor Information</h3>
            </div>

            <div className="visit-details-list">
              <div className="visit-detail-item">
                <span className="visit-icon" aria-hidden="true"><CalendarDays /></span>
                <div className="visit-detail-body">
                  <span className="detail-label">OPEN DAYS</span>
                  <span className="detail-value">Tuesday – Saturday</span>
                  <span className="detail-sub">Closed Sun, Mon &amp; Public Holidays</span>
                </div>
              </div>

              <div className="visit-detail-item">
                <span className="visit-icon" aria-hidden="true"><Clock /></span>
                <div className="visit-detail-body">
                  <span className="detail-label">SESSIONS &amp; HOURS</span>
                  <div className="session-blocks">
                    <span className="session-line">Morning: 11:00 AM – 2:30 PM</span>
                    <span className="session-line">Afternoon: 3:00 PM – 6:30 PM</span>
                  </div>
                  <span className="detail-sub">Sanitization break 2:30 PM – 3:00 PM</span>
                </div>
              </div>

              <div className="visit-detail-item">
                <span className="visit-icon" aria-hidden="true"><MapPin /></span>
                <div className="visit-detail-body">
                  <span className="detail-label">LOCATION</span>
                  <span className="detail-value">5A, Ring Road, Lajpat Nagar-IV</span>
                  <span className="detail-sub">Near Moolchand Metro · New Delhi 110024</span>
                </div>
              </div>

              <div className="visit-detail-item note-item">
                <span className="visit-icon" aria-hidden="true"><Info /></span>
                <div className="visit-detail-body">
                  <span className="detail-sub">
                    Entry is free for reading on-site. Slot reservation is
                    recommended during busy weekend sessions.
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary visit-cta-btn"
              onClick={onBookSlot}
              aria-label="Reserve a Visit"
            >
              <Calendar className="btn-icon" />
              <span>Reserve a Visit</span>
              <ArrowRight className="btn-icon-arrow" />
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
