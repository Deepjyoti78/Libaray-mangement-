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
            <span className="label">OUR SPACES</span>
            <h2 className="heading-lg editorial-main-title">
              A space to settle in
            </h2>
          </div>
          <div className="editorial-header-right">
            <a
              href="#visit"
              className="spaces-view-all-btn"
              onClick={(e) => handleScroll(e, '#visit')}
            >
              <span>View all</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Responsive Spaces Showcase Cards (2x2 Grid: Reading Room & Community Area, Manga Corner & Visitor Information side by side) */}
        <div className="spaces-showcase-grid reveal" id="spaces">
          {/* Space Card 1: Reading Room */}
          <Link
            to="/spaces/reading-room"
            className="space-showcase-card space-card-clickable"
            id="reading-room"
            title="Explore Reading Room Details & Photos"
          >
            <div className="space-card-media">
              <img
                src="/images/library-study-room.webp"
                alt="Reading room with study desks and books"
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
              <div className="space-card-title-row">
                <h3 className="heading-md space-card-title">Reading Room</h3>
                <div className="space-circle-arrow-btn" aria-hidden="true">
                  <ArrowRight size={13} />
                </div>
              </div>
              <p className="space-card-desc">
                Quiet reading, study and research.
              </p>
              <span className="text-link space-card-action desktop-only-action">
                <span>View Full Details &amp; Photos</span>
                <ArrowRight className="btn-icon-arrow" />
              </span>
            </div>
          </Link>

          {/* Space Card 2: Community Area */}
          <Link
            to="/spaces/community-area"
            className="space-showcase-card space-card-clickable"
            id="community-area"
            title="Explore Community Area Details & Photos"
          >
            <div className="space-card-media">
              <img
                src="/images/library-reading-area.webp"
                alt="Community reading lounge"
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
              <div className="space-card-title-row">
                <h3 className="heading-md space-card-title">Community Area</h3>
                <div className="space-circle-arrow-btn" aria-hidden="true">
                  <ArrowRight size={13} />
                </div>
              </div>
              <p className="space-card-desc">
                Relax, read and connect with fellow members.
              </p>
              <span className="text-link space-card-action desktop-only-action">
                <span>View Full Details &amp; Photos</span>
                <ArrowRight className="btn-icon-arrow" />
              </span>
            </div>
          </Link>

          {/* Space Card 3: Manga Corner */}
          <Link
            to="/spaces/manga-corner"
            className="space-showcase-card space-card-clickable"
            id="manga-corner"
            title="Explore Manga Corner Details & Photos"
          >
            <div className="space-card-media">
              <img
                src="/images/manga-corner-collection.jpg"
                alt="Manga collection shelves"
                width={700}
                height={460}
                loading="lazy"
                className="space-card-img"
              />
              <span className="space-card-tag">Curated Volumes</span>
            </div>
            <div className="space-card-content">
              <div className="space-card-meta">
                <span className="section-number">03</span>
                <span className="col-tag">Curated Volumes</span>
              </div>
              <div className="space-card-title-row">
                <h3 className="heading-md space-card-title">Manga Corner</h3>
                <div className="space-circle-arrow-btn" aria-hidden="true">
                  <ArrowRight size={13} />
                </div>
              </div>
              <p className="space-card-desc">
                Explore a wide range of manga and more.
              </p>
              <span className="text-link space-card-action desktop-only-action">
                <span>View Full Details &amp; Photos</span>
                <ArrowRight className="btn-icon-arrow" />
              </span>
            </div>
          </Link>

          {/* Space Card 4: Visitor Information (Side-by-side with Manga Corner) */}
          <Link
            to="/spaces/visitor-info"
            className="space-showcase-card space-card-clickable"
            id="visitor-info-card"
            title="Explore Visitor Information & Circulation Desk"
          >
            <div className="space-card-media">
              <img
                src="/images/library-circulation-desk.webp"
                alt="Library circulation desk counter"
                width={700}
                height={460}
                loading="lazy"
                className="space-card-img"
              />
              <span className="space-card-tag">Reception &amp; Loans</span>
            </div>
            <div className="space-card-content">
              <div className="space-card-meta">
                <span className="section-number">04</span>
                <span className="col-tag">Visitor Guide</span>
              </div>
              <div className="space-card-title-row">
                <h3 className="heading-md space-card-title">Visitor Information</h3>
                <div className="space-circle-arrow-btn" aria-hidden="true">
                  <ArrowRight size={13} />
                </div>
              </div>
              <p className="space-card-desc">
                Circulation desk, membership, and hours.
              </p>
              <span className="text-link space-card-action desktop-only-action">
                <span>View Full Details &amp; Photos</span>
                <ArrowRight className="btn-icon-arrow" />
              </span>
            </div>
          </Link>
        </div>

        {/* Supporting Editorial Features (Plan Your Visit) */}
        <div className="editorial-grid">

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
