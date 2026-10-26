import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Calendar, Clock, MapPin, QrCode, 
  Printer, ArrowLeft, XCircle, AlertCircle, ShieldAlert,
  BookOpen, User, Check, Info, CalendarPlus, FileText, ArrowRight, X, Trash2, Copy
} from 'lucide-react';

/**
 * Friendly full date formatting: "Wednesday, 28 October 2026"
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

function formatMobileDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[dateObj.getUTCDay()];
  const monthName = months[dateObj.getUTCMonth()];
  return (
    <>
      <span style={{ display: 'block' }}>{dayName},</span>
      <span style={{ display: 'block' }}>{monthName} {d}, {y}</span>
    </>
  );
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

export default function ConfirmationPage() {
  const { id: bookingRef } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState('');

  // Cancel dialog state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!booking?.bookingRef) return;
    navigator.clipboard.writeText(booking.bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Load booking from API if not passed via state
  useEffect(() => {
    if (booking) return;

    async function fetchBooking() {
      if (!token) {
        setError('Missing management credential token to view this reservation.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/bookings/${bookingRef}?token=${token}`);
        let data = null;
        try {
          data = await res.json();
        } catch (_) {}
        if (!res.ok) {
          throw new Error(data?.error || `Failed to retrieve booking (status ${res.status}).`);
        }
        setBooking(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingRef, token, booking]);

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError('');

    try {
      const res = await fetch(`/api/bookings/${bookingRef}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token || booking?.managementToken,
          reason: cancelReason || 'Cancelled by visitor online',
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (_) {}
      if (!res.ok) {
        throw new Error(data?.error || `Cancellation request rejected (status ${res.status}).`);
      }

      setBooking((prev) => ({
        ...prev,
        status: 'cancelled',
        cancelledAt: data.cancelledAt,
      }));
      setShowCancelModal(false);
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Generates and downloads an .ics calendar file
  const handleAddToCalendar = () => {
    if (!booking) return;
    const [startHour, startMin] = (booking.sessionStartTime || '11:00').split(':');
    const [endHour, endMin] = (booking.sessionEndTime || '14:30').split(':');
    const dateStr = (booking.visitDate || '').replace(/-/g, '');
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//The Library New Delhi//Booking System//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:The Library Visit - ${booking.facilityName || 'Reading Space'}
DESCRIPTION:Library session reservation at The Japan Foundation New Delhi. Booking Reference: ${booking.bookingRef}
LOCATION:5A, Ring Road, Lajpat Nagar-IV, New Delhi 110024
DTSTART:${dateStr}T${startHour || '11'}${startMin || '00'}00
DTEND:${dateStr}T${endHour || '14'}${endMin || '30'}00
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library-reservation-${booking.bookingRef}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="new-booking-page">
        <div className="new-booking-container">
          <div className="loading-state" style={{ padding: '6rem 2rem' }}>
            <div className="loading-spinner" />
            <p style={{ color: '#7A6F66', fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>
              Loading reservation pass...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="new-booking-page">
        <div className="new-booking-container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <AlertCircle className="w-12 h-12 text-amber-700 mx-auto mb-4" />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#352319', marginBottom: '0.75rem' }}>
              Reservation Not Accessible
            </h2>
            <p style={{ color: '#7A6F66', marginBottom: '2rem', lineHeight: '1.5' }}>
              {error || 'The requested booking reference could not be located or verified.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/my-booking" className="primary-espresso-btn" style={{ padding: '0.75rem 1.5rem' }}>
                Find My Reservation
              </Link>
              <Link to="/book" className="nav-secondary-back-btn" style={{ padding: '0.75rem 1.5rem' }}>
                Reserve a Slot
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isCancelled = booking.status === 'cancelled';
  const isCheckedIn = booking.status === 'checked_in';

  return (
    <div className="new-booking-page confirmation-page-root">
      {/* =========================================================================
          DESKTOP VIEW (Visible only on desktop > 768px, exactly as original)
          ========================================================================= */}
      <div className="confirmation-desktop-view">
        {/* Top Meta Bar */}
        <nav className="booking-top-bar" aria-label="Breadcrumb navigation">
          <div className="booking-top-bar-inner confirmation-top-bar-inner">
            <div className="top-bar-meta">
              <span>RESERVATION PASS · THE LIBRARY NEW DELHI</span>
            </div>
          </div>
        </nav>

        {/* Main Two-Column Outer Card Container */}
        <main className="new-booking-container confirmation-card-container">
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
                  {isCancelled
                    ? 'Reservation cancelled.'
                    : 'Thank you for being part of our reading community.'}
                </h2>
                <p className="photo-quote-sub">
                  {isCancelled
                    ? 'Your seat has been released for other visitors.'
                    : 'A QUIETER PLACE TO DISCOVER JAPAN.'}
                </p>
              </div>

              <div className="photo-panel-footer">
                <span className="photo-footer-caption">BOOKS · MANGA · PEOPLE · JAPAN</span>
              </div>
            </div>
          </aside>

          {/* =========================================================================
              RIGHT COLUMN: Confirmation & Visit Pass
              ========================================================================= */}
          <section className="booking-interactive-panel" aria-live="polite">
            <button
              type="button"
              className="booking-modal-close-btn"
              onClick={() => navigate('/')}
              aria-label="Close"
              title="Close"
            >
              <X className="w-4 h-4 stroke-[2.25]" />
            </button>

            <div className="confirmation-content-box">
              <header className="step-intro-header">
                <div className="category-tag-row">
                  <span className="category-tag">
                    {isCancelled ? 'RESERVATION CANCELLED' : isCheckedIn ? 'CHECKED IN & VERIFIED' : 'BOOKING CONFIRMED'}
                  </span>
                </div>
                <h1 className="step-main-title">
                  {isCancelled ? 'Reservation Cancelled' : isCheckedIn ? 'Checked In & Verified' : 'Your visit is confirmed!'}
                </h1>
                <p className="step-main-subtitle">
                  {isCancelled
                    ? 'This booking was cancelled and its seat capacity released.'
                    : isCheckedIn
                    ? 'Welcome to The Library. We hope you enjoy your reading session.'
                    : 'We look forward to welcoming you to the library.'}
                </p>
              </header>

              {/* Visit Pass Box */}
              <div className={`visit-pass-card ${isCancelled ? 'cancelled' : ''}`}>
                {/* Left Sub-panel: QR Code and Reference */}
                <div className="pass-qr-col">
                  <div className="qr-frame-box">
                    {booking.qrCodeDataUrl ? (
                      <img
                        src={booking.qrCodeDataUrl}
                        alt={`QR code for reference ${booking.bookingRef}`}
                        className={`pass-qr-image ${isCancelled ? 'grayscale opacity-40' : ''}`}
                        width={80}
                        height={80}
                      />
                    ) : (
                      <div className="qr-fallback-box">
                        <QrCode className="w-14 h-14 text-stone-400" />
                      </div>
                    )}
                  </div>
                  <div className="pass-ref-badge">
                    <span className="ref-code-text">{booking.bookingRef}</span>
                  </div>
                  <span className="pass-scan-caption">
                    {isCancelled ? 'Revoked upon cancellation' : 'Show this QR code at reception for check-in.'}
                  </span>
                </div>

                {/* Right Sub-panel: Metadata 2x2 Grid */}
                <div className="pass-details-col">
                  <div className="pass-detail-item">
                    <div className="pass-icon-wrap"><BookOpen className="w-4 h-4" /></div>
                    <div className="pass-text-wrap">
                      <span className="pass-label">Facility</span>
                      <span className="pass-val"><strong>{booking.facilityName || booking.facilityId}</strong></span>
                    </div>
                  </div>

                  <div className="pass-detail-item">
                    <div className="pass-icon-wrap"><Calendar className="w-4 h-4" /></div>
                    <div className="pass-text-wrap">
                      <span className="pass-label">Date</span>
                      <span className="pass-val"><strong>{formatFullDate(booking.visitDate)}</strong></span>
                    </div>
                  </div>

                  <div className="pass-detail-item">
                    <div className="pass-icon-wrap"><Clock className="w-4 h-4" /></div>
                    <div className="pass-text-wrap">
                      <span className="pass-label">Time Slot</span>
                      <span className="pass-val">
                        <strong>{formatTimeSlot(booking.sessionStartTime, booking.sessionEndTime)}</strong>
                        <span className="pass-sub">{booking.sessionName || 'Morning Session'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="pass-detail-item">
                    <div className="pass-icon-wrap"><User className="w-4 h-4" /></div>
                    <div className="pass-text-wrap">
                      <span className="pass-label">Visitor</span>
                      <span className="pass-val">
                        <strong>{booking.visitorName}</strong>
                        <span className="pass-sub">{booking.visitorEmail}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Information Box */}
              <div className="important-info-box">
                <div className="info-icon-circle">
                  <Info className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="info-vertical-divider" />
                <div className="info-text-col">
                  <h3 className="info-title">Visitor guidelines</h3>
                  <p className="info-guide-line">Please arrive 5–10 minutes early with this digital QR pass or booking reference.</p>
                  <p className="info-guide-line">Bring your photo identification or membership card if requested by library staff.</p>
                </div>
              </div>

              {/* Bottom Actions Wrap */}
              <div className="confirmation-actions-wrap">
                <div className="actions-utility-row">
                  <button
                    type="button"
                    id="add-to-calendar-btn"
                    className="action-btn-outline"
                    onClick={handleAddToCalendar}
                    title="Download .ics calendar invitation"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    <span>Add to calendar</span>
                  </button>

                  <button
                    type="button"
                    id="print-pass-btn"
                    className="action-btn-outline"
                    onClick={handlePrint}
                    title="Print paper pass"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print pass</span>
                  </button>

                  {!isCancelled && !isCheckedIn && (
                    <button
                      type="button"
                      id="cancel-reservation-btn"
                      className="action-btn-cancel"
                      onClick={() => setShowCancelModal(true)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel reservation</span>
                    </button>
                  )}
                </div>

                {/* Full Width Primary Navigation Row (Home button removed as requested) */}
                <div className="actions-nav-row">
                  <Link
                    to="/my-booking"
                    id="my-bookings-btn"
                    className="primary-espresso-btn full-width-reservations-btn"
                    title="Go to My Reservations"
                  >
                    <span>Go to My Reservations</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* =========================================================================
          MOBILE VIEW (Visible only on mobile <= 768px, exact match to screenshot)
          ========================================================================= */}
      <div className="confirmation-mobile-view" aria-live="polite">
        <div className="confirmation-mobile-card">
          {/* Top Drag Handle */}
          <div className="confirmation-mobile-drag-handle" aria-hidden="true" />

          {/* Top Header Text */}
          <div className="confirmation-mobile-header-text">
            RESERVATION PASS · THE LIBRARY NEW DELHI
          </div>

          {/* Circular Close Button */}
          <button
            type="button"
            className="confirmation-mobile-close-circle"
            onClick={() => navigate('/')}
            aria-label="Close"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2.25]" />
          </button>

          {/* Title Block */}
          <header className="confirmation-mobile-title-block">
            <div className="confirmation-mobile-tag-row">
              <span className={`confirmation-mobile-tag ${isCancelled ? 'cancelled' : isCheckedIn ? 'checked-in' : ''}`}>
                {isCancelled ? 'RESERVATION CANCELLED' : isCheckedIn ? 'CHECKED IN & VERIFIED' : 'BOOKING CONFIRMED'}
              </span>
            </div>
            <h1 className="confirmation-mobile-title">
              {isCancelled ? 'Reservation Cancelled' : isCheckedIn ? 'Checked In & Verified' : 'Your visit is confirmed!'}
            </h1>
            <p className="confirmation-mobile-subtitle">
              {isCancelled
                ? 'This booking was cancelled and its seat capacity released.'
                : isCheckedIn
                ? 'Welcome to The Library. We hope you enjoy your reading session.'
                : 'We look forward to welcoming you to the library.'}
            </p>
          </header>

          {/* SECTION 1: QR & Booking Code Card */}
          <div className="confirmation-mobile-qr-card">
            <div className="confirmation-mobile-qr-frame">
              {booking.qrCodeDataUrl ? (
                <img
                  src={booking.qrCodeDataUrl}
                  alt={`QR code for reference ${booking.bookingRef}`}
                  className={`confirmation-mobile-qr-img ${isCancelled ? 'grayscale opacity-40' : ''}`}
                  width={84}
                  height={84}
                />
              ) : (
                <QrCode className="w-16 h-16 text-stone-400" />
              )}
            </div>

            <div className="confirmation-mobile-code-col">
              <span className="confirmation-mobile-code-label">BOOKING CODE</span>
              <button
                type="button"
                className="confirmation-mobile-code-pill"
                onClick={handleCopyCode}
                title="Click to copy booking code"
              >
                <span className="confirmation-mobile-code-val">{booking.bookingRef}</span>
                <span className="confirmation-mobile-copy-icon">
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#20140E] stroke-[2]" />
                  )}
                </span>
              </button>
              <span className="confirmation-mobile-scan-note">
                {isCancelled ? 'Revoked upon cancellation' : 'Show this QR code at reception for check-in.'}
              </span>
            </div>
          </div>

          {/* SECTION 2: Visit Details 2x2 Grid Card */}
          <div className="confirmation-mobile-details-card">
            {/* Top Row: Facility & Date */}
            <div className="confirmation-mobile-details-row">
              <div className="confirmation-mobile-detail-cell">
                <div className="confirmation-mobile-detail-badge">
                  <BookOpen className="w-4 h-4 stroke-[1.8]" />
                </div>
                <div className="confirmation-mobile-detail-text">
                  <span className="confirmation-mobile-detail-label">FACILITY</span>
                  <span className="confirmation-mobile-detail-val">{booking.facilityName || 'Reading Room'}</span>
                  <span className="confirmation-mobile-detail-sub">
                    {booking.facilityId === 'manga-section' || booking.facilityName?.toLowerCase().includes('manga')
                      ? 'Explore a wide range of Japanese manga.'
                      : 'Quiet reading, study and research.'}
                  </span>
                </div>
              </div>

              <div className="confirmation-mobile-detail-cell with-divider">
                <div className="confirmation-mobile-detail-badge">
                  <Calendar className="w-4 h-4 stroke-[1.8]" />
                </div>
                <div className="confirmation-mobile-detail-text">
                  <span className="confirmation-mobile-detail-label">DATE</span>
                  <span className="confirmation-mobile-detail-val">{formatMobileDate(booking.visitDate)}</span>
                </div>
              </div>
            </div>

            <div className="confirmation-mobile-row-divider" />

            {/* Bottom Row: Time Slot & Visitor */}
            <div className="confirmation-mobile-details-row">
              <div className="confirmation-mobile-detail-cell">
                <div className="confirmation-mobile-detail-badge">
                  <Clock className="w-4 h-4 stroke-[1.8]" />
                </div>
                <div className="confirmation-mobile-detail-text">
                  <span className="confirmation-mobile-detail-label">TIME SLOT</span>
                  <span className="confirmation-mobile-detail-val">
                    {formatTimeSlot(booking.sessionStartTime, booking.sessionEndTime)}
                  </span>
                  <span className="confirmation-mobile-detail-sub">{booking.sessionName || 'Morning Session'}</span>
                </div>
              </div>

              <div className="confirmation-mobile-detail-cell with-divider">
                <div className="confirmation-mobile-detail-badge">
                  <User className="w-4 h-4 stroke-[1.8]" />
                </div>
                <div className="confirmation-mobile-detail-text">
                  <span className="confirmation-mobile-detail-label">VISITOR</span>
                  <span className="confirmation-mobile-detail-val">{booking.visitorName}</span>
                  <span className="confirmation-mobile-detail-sub break-all">{booking.visitorEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Visitor Guidelines Box */}
          <div className="confirmation-mobile-guide-card">
            <div className="confirmation-mobile-guide-icon-circle">
              <Info className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="confirmation-mobile-guide-text">
              <span className="confirmation-mobile-guide-title">Visitor guidelines</span>
              <p className="confirmation-mobile-guide-p">
                Please arrive 5–10 minutes early with this digital QR pass or booking reference. Bring photo identification or membership card if requested.
              </p>
            </div>
          </div>

          {/* SECTION 4: Actions (3 rows) */}
          <div className="confirmation-mobile-actions-zone">
            {/* Row 1: Add to calendar & Print pass */}
            <div className="confirmation-mobile-actions-row-1">
              <button
                type="button"
                id="mobile-add-to-calendar-btn"
                className="confirmation-mobile-btn-outline"
                onClick={handleAddToCalendar}
                title="Download .ics calendar invitation"
              >
                <Calendar className="w-4 h-4" />
                <span>Add to calendar</span>
              </button>

              <button
                type="button"
                id="mobile-print-pass-btn"
                className="confirmation-mobile-btn-outline"
                onClick={handlePrint}
                title="Print paper pass"
              >
                <Printer className="w-4 h-4" />
                <span>Print pass</span>
              </button>
            </div>

            {/* Row 2: Cancel reservation */}
            {!isCancelled && !isCheckedIn && (
              <button
                type="button"
                id="mobile-cancel-reservation-btn"
                className="confirmation-mobile-btn-cancel"
                onClick={() => setShowCancelModal(true)}
              >
                <Trash2 className="w-4 h-4 stroke-[2]" />
                <span>Cancel reservation</span>
              </button>
            )}

            {/* Row 3: Go to My Reservations */}
            <Link
              to="/my-booking"
              id="mobile-my-bookings-btn"
              className="confirmation-mobile-btn-primary"
              title="Go to My Reservations"
            >
              <span>Go to My Reservations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal Dialog */}
      {showCancelModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3 className="modal-title">Cancel Reservation?</h3>
            <p className="modal-text">
              Are you sure you want to cancel your reservation <strong>{booking.bookingRef}</strong> for{' '}
              {formatFullDate(booking.visitDate)}? Your reserved seat will be immediately released for other visitors.
            </p>

            <label htmlFor="cancel-reason" className="field-label" style={{ marginBottom: '0.375rem' }}>
              Reason for cancellation (optional):
            </label>
            <textarea
              id="cancel-reason"
              className="modal-textarea"
              placeholder="e.g. Schedule conflict or changed travel plans"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />

            {cancelError && <p className="inline-error-msg" style={{ marginBottom: '1rem' }}>{cancelError}</p>}

            <div className="modal-actions">
              <button
                type="button"
                id="modal-keep-reservation-btn"
                className="nav-secondary-back-btn"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Keep reservation
              </button>
              <button
                type="button"
                id="modal-confirm-cancel-btn"
                className="action-btn-confirm-cancel"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, cancel reservation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
