import { ArrowRight, CalendarDays, Clock, MapPin, Info } from 'lucide-react';
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
            <span className="label">OVERVIEW &amp; FACILITIES</span>
            <h2 className="heading-lg editorial-main-title">
              Designed for quiet study and cultural immersion.
            </h2>
          </div>
          <div className="editorial-header-right">
            <span className="editorial-header-meta">
              The Japan Foundation, New Delhi · Reading Facilities
            </span>
          </div>
        </div>

        {/* 4-Part Editorial Grid with Asymmetrical Proportions */}
        <div className="editorial-grid">
          {/* Item 01: Library Introduction (Text-led Editorial Column) */}
          <article className="editorial-col editorial-intro reveal" id="library-intro">
            <div className="col-top-meta">
              <span className="section-number">01</span>
              <span className="col-tag">Introduction</span>
            </div>

            <div className="editorial-intro-content">
              <span className="label">THE LIBRARY</span>
              <h3 className="heading-md intro-heading">
                A space for Japanese culture in New Delhi
              </h3>
              <p className="intro-text">
                The library houses a rich collection of Japanese literature,
                manga, periodicals, and cultural resources. Whether you are a
                student, researcher, or a curious reader, discover a quiet space
                to explore Japan through its written word and visual culture.
              </p>
              <div className="intro-details">
                <p className="intro-subtext">
                  Located within the Japan Foundation cultural center in Lajpat
                  Nagar, offering members and visitors open access to authentic
                  Japanese media.
                </p>
              </div>
            </div>

            <a
              href="#collections"
              className="text-link intro-link"
              onClick={(e) => handleScroll(e, '#collections')}
            >
              <span>Explore Collections</span>
              <ArrowRight className="btn-icon-arrow" />
            </a>
          </article>

          {/* Item 02: Reading Room (Real Photograph Feature) */}
          <article className="editorial-col editorial-feature reveal" id="reading-room">
            <div className="col-top-meta">
              <span className="section-number">02</span>
              <span className="col-tag">Sanctuary</span>
            </div>

            <div className="feature-media">
              <img
                src="/images/library-reading-area.webp"
                alt="Reading room interior with circular wooden table, comfortable lounge chairs, and floor-to-ceiling bookshelves"
                width={700}
                height={525}
                loading="lazy"
                className="feature-img"
              />
              <span className="media-caption">Reading Lounge &amp; Periodicals Wall</span>
            </div>

            <div className="feature-text">
              <h3 className="heading-md">Reading Room</h3>
              <p className="feature-desc">
                A calm space for reading, study and research. Settle into
                comfortable seating, browse open shelves, or study with views
                of the surrounding greenery.
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

          {/* Item 03: Manga Corner (Authentic Shelving Crop) */}
          <article className="editorial-col editorial-feature reveal" id="manga-corner">
            <div className="col-top-meta">
              <span className="section-number">03</span>
              <span className="col-tag">Collection</span>
            </div>

            <div className="feature-media">
              <img
                src="/images/library-reading-area.webp"
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
              aria-label="Book a Slot for visiting"
            >
              <span>Book a Slot</span>
              <ArrowRight className="btn-icon-arrow" />
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
