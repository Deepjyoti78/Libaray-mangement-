import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, ArrowRight, AlertCircle, CheckCircle2, QrCode, 
  Calendar, Clock, BookOpen, User, Ticket, Mail, ShieldCheck, X, RotateCcw
} from 'lucide-react';

/**
 * Friendly full date formatting: "Tuesday, October 27, 2026"
 */
function formatFullDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * 12-hour AM/PM session time slot formatting: "11:00 AM – 2:30 PM"
 */
function formatTimeSlot(startTime, endTime) {
  const formatSingle = (t) => {
    if (!t) return '';
    if (t.includes('AM') || t.includes('PM')) return t;
    const parts = t.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };
  if (!startTime) return '11:00 AM – 2:30 PM';
  return `${formatSingle(startTime)} – ${formatSingle(endTime)}`;
}

export default function MyBookingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [bookingRef, setBookingRef] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundBooking, setFoundBooking] = useState(null);

  // Auto-populate from route state or recent localStorage if available
  useEffect(() => {
    if (location.state?.bookingRef) {
      setBookingRef(location.state.bookingRef.toUpperCase());
    } else {
      const savedRef = localStorage.getItem('last_booking_ref');
      if (savedRef && !bookingRef) {
        setBookingRef(savedRef.toUpperCase());
      }
    }
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      const savedEmail = localStorage.getItem('last_booking_email');
      if (savedEmail && !email) {
        setEmail(savedEmail);
      }
    }
  }, [location.state]);

  const handleLookup = async (e) => {
    e.preventDefault();
    const cleanRef = bookingRef.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanRef || !cleanEmail) {
      setError('Please provide both your booking reference and email address.');
      return;
    }

    setLoading(true);
    setError('');
    setFoundBooking(null);

    try {
      const res = await fetch('/api/my-booking/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingRef: cleanRef,
          email: cleanEmail,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (_) {}
      if (!res.ok) {
        throw new Error(data?.error || `No matching reservation found (status ${res.status}).`);
      }

      setFoundBooking(data.booking);
      // Persist for convenience
      localStorage.setItem('last_booking_ref', cleanRef);
      localStorage.setItem('last_booking_email', cleanEmail);
    } catch (err) {
      setError(err.message || 'No reservation located matching this reference and email.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewConfirmation = () => {
    if (foundBooking) {
      navigate(`/booking/confirmation/${foundBooking.bookingRef}?token=${foundBooking.managementToken}`, {
        state: { booking: foundBooking },
      });
    }
  };

  const handleResetSearch = () => {
    setFoundBooking(null);
    setError('');
  };

  return (
    <div className="new-booking-page">
      {/* Top Meta Bar */}
      <nav className="booking-top-bar" aria-label="Breadcrumb navigation">
        <div className="booking-top-bar-inner confirmation-top-bar-inner">
          <div className="top-bar-meta">
            <span>RESERVATION PASS RETRIEVAL · THE LIBRARY NEW DELHI</span>
          </div>
        </div>
      </nav>

      {/* Main Two-Column Outer Card Container */}
      <main className="new-booking-container lookup-card-container">
        {/* =========================================================================
            LEFT COLUMN: Editorial Photography Panel
            ========================================================================= */}
        <aside className="booking-photo-panel" aria-label="Library atmosphere">
          <div className="photo-panel-bg" style={{ backgroundImage: "url('/images/library-reading-area.webp')" }} />
          <div className="photo-panel-overlay" />

          <div className="photo-panel-content">
            <div className="photo-panel-header">
              <div className="photo-brand-emblem" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                </svg>
              </div>
              <div className="photo-brand-text">
                <span className="photo-brand-title">The Library</span>
                <span className="photo-brand-subtitle">LIBRARY / NEW DELHI</span>
              </div>
            </div>

            <div className="photo-panel-quote-box">
              <div className="photo-quote-line" aria-hidden="true" />
              <h2 className="photo-quote-heading">
                {foundBooking
                  ? 'Your reservation is ready.'
                  : 'Find your reservation pass.'}
              </h2>
              <p className="photo-quote-sub">
                {foundBooking
                  ? 'CONFIRMED VISIT ACCESS · DIGITAL PASS'
                  : 'ACCESS YOUR ENTRY QR CODE & MANAGE YOUR VISIT.'}
              </p>
            </div>

            <div className="photo-panel-footer">
              <span className="photo-footer-caption">BOOKS · MANGA · PEOPLE · JAPAN</span>
            </div>
          </div>
        </aside>

        {/* =========================================================================
            RIGHT COLUMN: Interactive Step / Retrieval Panel
            ========================================================================= */}
        <section className="booking-interactive-panel" aria-live="polite">
          {/* Close / Return Home Button positioned at top right */}
          <button
            type="button"
            className="booking-modal-close-btn"
            onClick={() => navigate('/')}
            aria-label="Return to library home"
            title="Return to library home"
          >
            <X className="w-4 h-4 stroke-[2.25]" />
          </button>

          <div className="lookup-panel-content">
            {/* Header with Title & Matching Bespoke Line Art */}
            <header className="step-intro-header-art">
              <div className="step-intro-text-col">
                <div className="category-tag-row">
                  <span className="category-tag">
                    {foundBooking ? 'RESERVATION FOUND' : 'FIND YOUR BOOKING'}
                  </span>
                </div>
                <h1 className="step-main-title">
                  {foundBooking ? 'Booking verified!' : 'Retrieve your pass'}
                </h1>
                <p className="step-main-subtitle">
                  {foundBooking
                    ? 'We located your visit reservation. Open your pass to view QR check-in code.'
                    : 'Enter your booking reference and email to view your digital QR entry pass.'}
                </p>
              </div>

              {/* Bespoke Line Art Illustration: Magnifying Glass & Archive Ledger */}
              <div className="step-header-art-box" aria-hidden="true">
                <svg width="86" height="74" viewBox="0 0 100 85" fill="none" stroke="#7A6858" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="step-header-illustration">
                  {/* Graceful Botanical Branch */}
                  <path d="M72 58 C 66 38, 54 20, 38 6" strokeWidth="1.1" opacity="0.6" />
                  <path d="M62 42 C 54 38, 54 28, 62 31 C 68 33, 67 40, 62 42 Z" fill="#8C7E72" fillOpacity="0.08" opacity="0.7" />
                  <path d="M54 29 C 45 25, 47 15, 55 18 C 60 21, 59 27, 54 29 Z" fill="#8C7E72" fillOpacity="0.08" opacity="0.7" />
                  <path d="M46 17 C 39 12, 43 4, 50 8 C 52 12, 50 16, 46 17 Z" fill="#8C7E72" fillOpacity="0.08" opacity="0.7" />
                  <path d="M38 6 C 33 1, 42 1, 41 5 Z" fill="#8C7E72" fillOpacity="0.08" opacity="0.7" />

                  {/* Archive Ledger / Document Stack */}
                  <path d="M40 76 L88 72 L96 78 L48 82 Z" fill="#8C7E72" fillOpacity="0.08" />
                  <path d="M40 68 L88 64 L96 70 L48 74 Z" fill="#FFFFFF" fillOpacity="0.4" />
                  <path d="M40 68 L40 76 L48 82 L96 78 L96 70" />
                  
                  {/* Subtle document lines */}
                  <path d="M48 69 L82 66" opacity="0.4" />
                  <path d="M48 72 L78 69" opacity="0.4" />

                  {/* Reading / Magnifying Glass */}
                  <circle cx="58" cy="46" r="10" fill="#FFFFFF" fillOpacity="0.3" strokeWidth="1.2" />
                  <path d="M54 43 L62 43" opacity="0.5" strokeWidth="1" />
                  <path d="M53 46 L63 46" opacity="0.5" strokeWidth="1" />
                  <path d="M55 49 L61 49" opacity="0.5" strokeWidth="1" />
                  <path d="M65 53 L78 66" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M73 61 L77 65" stroke="#AC512E" strokeWidth="1.2" />
                </svg>
              </div>
            </header>

            {!foundBooking ? (
              /* =============================================================
                 LOOKUP FORM (Search State)
                 ============================================================= */
              <form className="lookup-interactive-form" onSubmit={handleLookup}>
                <div className="lookup-fields-stack">
                  {/* Booking Reference Field */}
                  <div className="form-field-group">
                    <div className="field-label-row">
                      <Ticket className="field-label-icon" />
                      <label htmlFor="refInput" className="field-label-text">
                        BOOKING REFERENCE <span className="req-asterisk">*</span>
                      </label>
                    </div>
                    <input
                      id="refInput"
                      type="text"
                      className="field-text-input ref-input-styled"
                      placeholder="e.g. JF-2026-X7K9P"
                      value={bookingRef}
                      onChange={(e) => {
                        setBookingRef(e.target.value.toUpperCase());
                        if (error) setError('');
                      }}
                      autoComplete="off"
                      spellCheck={false}
                      required
                    />
                    <span className="field-helper-text">
                      Located in your confirmation email, e.g. <code>JF-2026-XXXXX</code>.
                    </span>
                  </div>

                  {/* Email Address Field */}
                  <div className="form-field-group">
                    <div className="field-label-row">
                      <Mail className="field-label-icon" />
                      <label htmlFor="emailInput" className="field-label-text">
                        EMAIL ADDRESS <span className="req-asterisk">*</span>
                      </label>
                    </div>
                    <input
                      id="emailInput"
                      type="email"
                      className="field-text-input"
                      placeholder="e.g. yourname@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      autoComplete="email"
                      required
                    />
                    <span className="field-helper-text">
                      Must match the email address provided during reservation.
                    </span>
                  </div>
                </div>

                {/* Privacy & Security Callout Banner */}
                <div className="lookup-security-callout">
                  <div className="callout-icon-wrap">
                    <ShieldCheck className="w-4 h-4 text-[#AC512E]" />
                  </div>
                  <div className="callout-text-col">
                    <span className="callout-title">Secure Verification</span>
                    <p className="callout-desc">
                      Reference code and email are cross-matched to ensure your private booking details remain protected.
                    </p>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="submit-error-banner lookup-error-banner" role="alert">
                    <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Form Navigation / Submission Row */}
                <div className="lookup-actions-row">
                  <Link to="/book" className="nav-secondary-back-btn" title="Reserve a new visit">
                    <span>Book a visit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="submit"
                    id="locate-reservation-btn"
                    className="primary-espresso-btn lookup-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="mini-spinner-light" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Locate reservation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* =============================================================
                 FOUND RESERVATION PREVIEW (Verified State)
                 ============================================================= */
              <div className="found-reservation-layout">
                {/* Status Verified Banner */}
                <div className="lookup-verified-banner">
                  <div className="verified-left">
                    <CheckCircle2 className="w-4 h-4 text-[#236B36]" />
                    <span className="verified-title">Reservation Verified</span>
                  </div>
                  <span className={`status-pill ${foundBooking.status === 'cancelled' ? 'pill-cancelled' : 'pill-active'}`}>
                    {foundBooking.status.toUpperCase()}
                  </span>
                </div>

                {/* Compact Visit Pass Card */}
                <div className="visit-pass-card found-pass-card">
                  {/* QR Column */}
                  <div className="pass-qr-col">
                    <div className="qr-frame-box">
                      {foundBooking.qrCodeDataUrl ? (
                        <img
                          src={foundBooking.qrCodeDataUrl}
                          alt={`QR code for reference ${foundBooking.bookingRef}`}
                          className="pass-qr-image"
                          width={76}
                          height={76}
                        />
                      ) : (
                        <div className="qr-fallback-box">
                          <QrCode className="w-12 h-12 text-stone-400" />
                        </div>
                      )}
                    </div>
                    <div className="pass-ref-badge">
                      <span className="ref-code-text">{foundBooking.bookingRef}</span>
                    </div>
                    <span className="pass-scan-caption">Digital Entry Pass</span>
                  </div>

                  {/* Metadata 2x2 Grid */}
                  <div className="pass-details-col">
                    <div className="pass-detail-item">
                      <div className="pass-icon-wrap"><BookOpen className="w-4 h-4" /></div>
                      <div className="pass-text-wrap">
                        <span className="pass-label">Facility</span>
                        <span className="pass-val"><strong>{foundBooking.facilityName || 'Reading Room'}</strong></span>
                      </div>
                    </div>

                    <div className="pass-detail-item">
                      <div className="pass-icon-wrap"><Calendar className="w-4 h-4" /></div>
                      <div className="pass-text-wrap">
                        <span className="pass-label">Date</span>
                        <span className="pass-val"><strong>{formatFullDate(foundBooking.visitDate)}</strong></span>
                      </div>
                    </div>

                    <div className="pass-detail-item">
                      <div className="pass-icon-wrap"><Clock className="w-4 h-4" /></div>
                      <div className="pass-text-wrap">
                        <span className="pass-label">Time Slot</span>
                        <span className="pass-val">
                          <strong>{formatTimeSlot(foundBooking.sessionStartTime, foundBooking.sessionEndTime)}</strong>
                          <span className="pass-sub">{foundBooking.sessionName || 'Morning Session'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="pass-detail-item">
                      <div className="pass-icon-wrap"><User className="w-4 h-4" /></div>
                      <div className="pass-text-wrap">
                        <span className="pass-label">Visitor</span>
                        <span className="pass-val">
                          <strong>{foundBooking.visitorName}</strong>
                          <span className="pass-sub">{foundBooking.visitorEmail}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions: Open Full Pass & Search Another */}
                <div className="found-actions-stack">
                  <button
                    type="button"
                    id="open-full-pass-btn"
                    className="primary-espresso-btn full-width-reservations-btn"
                    onClick={handleViewConfirmation}
                  >
                    <span>Open Full Digital Pass & QR Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="found-secondary-actions">
                    <button
                      type="button"
                      id="search-another-btn"
                      className="nav-secondary-back-btn"
                      onClick={handleResetSearch}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Search another reservation</span>
                    </button>

                    <Link to="/" id="return-home-btn" className="nav-secondary-back-btn">
                      <span>Return home</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
