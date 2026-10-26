import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle2, 
  AlertCircle, ShieldCheck, User, Mail, Hash, BookOpen, 
  Library, ChevronLeft, ChevronRight, Check, FileText, Info, X,
  Lightbulb, CreditCard
} from 'lucide-react';

/**
 * Returns today's date in 'YYYY-MM-DD' formatted for the Asia/Kolkata timezone.
 */
function getTodayInKolkata() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return parts;
}

/**
 * Friendly short date formatting: "Wed, 28 Oct 2026"
 */
function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

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

export default function BookingWizard({ isModal = false, onClose }) {
  const navigate = useNavigate();

  // Wizard logical steps: 1 = Selection (Space + Date + Slot), 2 = Details, 3 = Review
  const [step, setStep] = useState(1);

  // Close on Escape key press if in modal mode
  useEffect(() => {
    if (!isModal || !onClose) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, onClose]);

  // Configuration from server
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Form selections
  const [facilityId, setFacilityId] = useState('reading-room');
  const [selectedDate, setSelectedDate] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [membershipNo, setMembershipNo] = useState('');
  const [agreeRules, setAgreeRules] = useState(false);

  // Calendar month/year navigation state
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());

  // Real-time slot availability
  const [availability, setAvailability] = useState(null);
  const [availLoading, setAvailLoading] = useState(false);

  // Form validation errors & submission state
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 1. Fetch public configuration on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);

          // Find first open available date to pre-select
          findFirstOpenDate(data.settings?.openingDays || ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], data.closureDates || []);
        }
      } catch (err) {
        console.error('Failed to load configuration:', err);
      } finally {
        setConfigLoading(false);
      }
    }
    loadConfig();
  }, []);

  // Helper to calculate first available open date
  const findFirstOpenDate = (openingDays, closureDates) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    for (let i = 0; i <= 14; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const dayName = days[d.getDay()];
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const isClosure = closureDates.some(c => c.date === dateStr);

      if (openingDays.includes(dayName) && !isClosure) {
        setSelectedDate(dateStr);
        setCalendarMonth(d.getMonth());
        setCalendarYear(d.getFullYear());
        break;
      }
    }
  };

  // 2. Fetch real-time availability whenever facility or date changes
  useEffect(() => {
    if (!facilityId || !selectedDate) return;

    let isMounted = true;
    async function checkAvail() {
      setAvailLoading(true);
      try {
        const res = await fetch(`/api/availability?facilityId=${facilityId}&date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAvailability(data);
            // If currently selected session is no longer available, reset it
            if (sessionId) {
              const stillValid = data.sessions?.find((s) => s.id === sessionId && s.isAvailable);
              if (!stillValid) {
                // Auto-pick first available session if none selected
                const firstAvail = data.sessions?.find((s) => s.isAvailable);
                setSessionId(firstAvail ? firstAvail.id : '');
              }
            } else {
              // Pre-select first available session for convenience
              const firstAvail = data.sessions?.find((s) => s.isAvailable);
              if (firstAvail) {
                setSessionId(firstAvail.id);
              }
            }
          }
        }
      } catch (err) {
        console.error('Availability check failed:', err);
      } finally {
        if (isMounted) setAvailLoading(false);
      }
    }

    checkAvail();
    return () => { isMounted = false; };
  }, [facilityId, selectedDate]);

  // Calendar calculations
  const calendarData = useMemo(() => {
    const todayStr = getTodayInKolkata();
    const openingDays = config?.settings?.openingDays || ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const closureDates = (config?.closureDates || []).map(c => c.date);
    const advanceDays = config?.settings?.advanceBookingDays || 14;

    const daysInWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Monday-first index: 0 is Mon, 6 is Sun
    const firstDayRaw = new Date(calendarYear, calendarMonth, 1).getDay();
    const firstDayIndex = (firstDayRaw + 6) % 7;
    const daysInCurrentMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();

    // Calculate max allowed date
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + advanceDays);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    const cells = [];

    // 1. Previous month trailing padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        dayNumber: daysInPrevMonth - i,
        isCurrentMonth: false,
        disabled: true,
        dateStr: null,
      });
    }

    // 2. Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const yyyy = calendarYear;
      const mm = String(calendarMonth + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const dateObj = new Date(calendarYear, calendarMonth, day);
      const dayOfWeekName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];

      const isPast = dateStr < todayStr;
      const isBeyondAdvance = dateStr > maxDateStr;
      const isClosedDay = !openingDays.includes(dayOfWeekName);
      const isClosureDate = closureDates.includes(dateStr);

      const isDisabled = isPast || isBeyondAdvance || isClosedDay || isClosureDate;
      const isSelected = dateStr === selectedDate;
      const hasSessions = !isDisabled;

      cells.push({
        dayNumber: day,
        isCurrentMonth: true,
        disabled: isDisabled,
        isClosed: isClosedDay || isClosureDate,
        dateStr,
        isSelected,
        hasSessions,
        isPast,
      });
    }

    // 3. Next month leading padding (only complete the active week row, avoid extra 6th row)
    const remainder = cells.length % 7;
    if (remainder > 0) {
      const padCount = 7 - remainder;
      for (let i = 1; i <= padCount; i++) {
        cells.push({
          dayNumber: i,
          isCurrentMonth: false,
          disabled: true,
          dateStr: null,
        });
      }
    }

    // 4. Group into weeks of 7 days
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }

    return {
      monthName: monthNames[calendarMonth],
      year: calendarYear,
      daysInWeek,
      cells,
      weeks,
    };
  }, [calendarMonth, calendarYear, config, selectedDate]);

  // Calendar month navigation
  const handlePrevMonth = () => {
    const now = new Date();
    if (calendarYear === now.getFullYear() && calendarMonth <= now.getMonth()) return;
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToDetails = () => {
    const errs = {};
    if (!facilityId) errs.facilityId = 'Please select a library space.';
    if (!selectedDate) errs.selectedDate = 'Please select an available date.';
    if (availability && !availability.available) {
      errs.selectedDate = availability.reason || 'Selected date is not available.';
    }
    if (!sessionId) {
      errs.sessionId = 'Please select a morning or afternoon session.';
    }

    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitError('');
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Step 2 Validation -> Proceed to Step 3 (Review)
  const handleProceedToReview = () => {
    const errs = {};
    if (!visitorName.trim()) {
      errs.visitorName = 'Please enter your full name.';
    } else if (visitorName.trim().length < 2) {
      errs.visitorName = 'Name must be at least 2 characters.';
    }

    if (!visitorEmail.trim()) {
      errs.visitorEmail = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitorEmail.trim())) {
      errs.visitorEmail = 'Please provide a valid email format (e.g. name@example.com).';
    }

    if (!agreeRules) {
      errs.agreeRules = 'You must agree to the library visit guidelines to proceed.';
    }

    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitError('');
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Step 3 Submission -> Create Real Reservation
  const handleConfirmReservation = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId,
          sessionId,
          visitDate: selectedDate,
          visitorName: visitorName.trim(),
          visitorEmail: visitorEmail.trim(),
          membershipNo: membershipNo ? membershipNo.trim() : null,
          agreeRules: true,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (_) {
        if (!res.ok) {
          throw new Error(
            res.status === 502
              ? 'Unable to reach backend service. Please check that the server is running.'
              : `Server error (${res.status}). Please try again.`
          );
        }
      }

      if (!res.ok) {
        throw new Error(data?.error || `Failed to complete reservation (status ${res.status}).`);
      }

      // Route directly to confirmation pass
      if (onClose) {
        onClose();
      }
      navigate(`/booking/confirmation/${data.booking.bookingRef}?token=${data.booking.managementToken}`, {
        state: { booking: data.booking },
      });
    } catch (err) {
      setSubmitError(err.message || 'An error occurred while creating your reservation.');
      // If error is capacity related, bring user back to selection
      if (err.message.toLowerCase().includes('fill') || err.message.toLowerCase().includes('capacity')) {
        setStep(1);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (configLoading) {
    const loadingCard = (
      <div className={`new-booking-page ${isModal ? 'modal-view' : ''}`}>
        <div className="new-booking-container" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
          <div className="loading-state" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
            <div className="loading-spinner" />
            <p style={{ color: '#7A6F66', fontFamily: 'var(--font-serif)', fontSize: '1.15rem', marginTop: '1rem' }}>
              Preparing library booking system...
            </p>
          </div>
        </div>
      </div>
    );

    if (isModal) {
      return (
        <div className="booking-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
          <div className="booking-modal-dialog" onClick={(e) => e.stopPropagation()}>
            {loadingCard}
          </div>
        </div>
      );
    }
    return loadingCard;
  }

  const selectedFacilityObj = config?.facilities?.find((f) => f.id === facilityId) || {
    id: 'reading-room',
    name: 'Reading Room',
    description: 'A calm space for reading, study and research.',
  };

  const selectedSessionObj = availability?.sessions?.find((s) => s.id === sessionId);

  // Left Photo Editorial Quote per step
  const photoMeta = {
    1: {
      headline: 'A space for reading, culture and curiosity.',
      caption: 'BOOKS · MANGA · PEOPLE · JAPAN',
    },
    2: {
      headline: 'People, Books and a Little More Japan.',
      sub: 'A welcoming space for readers in New Delhi',
      caption: 'A WELCOMING SPACE FOR READERS IN NEW DELHI',
    },
    3: {
      headline: 'Explore. Read. Connect.',
      sub: 'BOOKS · MANGA · CULTURE · PEOPLE · JAPAN',
      caption: 'BOOKS · MANGA · CULTURE · PEOPLE · JAPAN',
    },
  }[step] || {
    headline: 'A space for reading, culture and curiosity.',
    caption: 'BOOKS · MANGA · PEOPLE · JAPAN',
  };

  const wizardContent = (
    <div className={`new-booking-page ${isModal ? 'modal-view' : ''}`}>
      {/* Top Meta Bar (Only rendered on standalone full-page view) */}
      {!isModal && (
        <nav className="booking-top-bar" aria-label="Page navigation">
          <div className="booking-top-bar-inner confirmation-top-bar-inner">
            <div className="top-bar-meta">
              <span>RESERVE A VISIT · THE LIBRARY NEW DELHI</span>
            </div>
          </div>
        </nav>
      )}

      {/* Main Two-Column Outer Card Container */}
      <main className="new-booking-container">
        {/* =========================================================================
            LEFT COLUMN: Editorial Photography Panel
            ========================================================================= */}
        <aside className="booking-photo-panel" aria-label="Library atmosphere">
          <div className="photo-panel-bg" style={{ backgroundImage: "url('/images/library-reading-area.webp')" }} />
          <div className="photo-panel-overlay" />

          <div className="photo-panel-content">
            {/* Top Emblem & Brand */}
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

            {/* Center Editorial Quote */}
            <div className="photo-panel-quote-box">
              <h2 className="photo-quote-heading">
                A space for<br />
                reading, culture<br />
                and curiosity.
              </h2>
              <div className="photo-quote-line" aria-hidden="true" />
              <p className="photo-quote-japanese">読書・マンガ・人・日本</p>
            </div>

            {/* Bottom Tagline */}
            <div className="photo-panel-footer">
              <span className="photo-footer-caption">{photoMeta.caption}</span>
            </div>
          </div>
        </aside>

        {/* =========================================================================
            RIGHT COLUMN: Interactive Step Panel
            ========================================================================= */}
        <section className={`booking-interactive-panel ${submitError ? 'has-submit-error' : ''}`} aria-live="polite">
          {/* Close Modal Button positioned at top right */}
          {isModal && (
            <button
              type="button"
              className="booking-modal-close-btn"
              onClick={onClose}
              aria-label="Close reservation modal"
              title="Close modal"
            >
              <X className="w-4 h-4 stroke-[2.25]" />
            </button>
          )}

          {/* =====================================================================
              STEP 1: SELECTION VIEW (Facility + Calendar & Slot Side-by-Side)
              ===================================================================== */}
          {step === 1 && (
            <div key="step-1" className="step-selection-layout-clean wizard-step-transition">
              <header className="step-intro-header-art">
                <div className="step-intro-text-col">
                  <div className="category-tag-row">
                    <span className="category-tag">BOOK A VISIT</span>
                  </div>
                  <h1 className="step-main-title">Reserve your slot</h1>
                  <p className="step-main-subtitle">Choose a space, date and time that suits you.</p>
                </div>

                {/* Subtle Botanical, Spectacles & Open Book Line Art Illustration */}
                <div className="step-header-art-box" aria-hidden="true">
                  <svg width="86" height="74" viewBox="0 0 100 85" fill="none" stroke="#7A6858" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="step-header-illustration">
                    {/* Graceful Botanical Branch */}
                    <path d="M70 58 C 64 38, 52 20, 36 6" strokeWidth="1.1" opacity="0.6" />
                    <path d="M60 42 C 52 38, 52 28, 60 31 C 66 33, 65 40, 60 42 Z" fill="#8C7E72" fillOpacity="0.08" opacity="0.7" />
                    <path d="M52 29 C 43 25, 45 15, 53 18 C 58 21, 57 27, 52 29 Z" fill="#8C7E72" fillOpacity="0.08" opacity="0.7" />
                    <path d="M44 17 C 37 12, 41 4, 48 8 C 50 12, 48 16, 44 17 Z" fill="#8C7E72" fillOpacity="0.08" opacity="0.7" />
                    <path d="M36 6 C 31 1, 40 1, 39 5 Z" fill="#8C7E72" fillOpacity="0.08" opacity="0.7" />

                    {/* Open Book Base Thickness & Binding */}
                    <path d="M42 74 C 54 70, 66 73, 72 78 C 78 73, 90 70, 98 74 L98 77 C 90 73, 78 76, 72 81 C 66 76, 54 73, 42 77 Z" fill="#8C7E72" fillOpacity="0.08" />

                    {/* Open Book Left & Right Pages */}
                    <path d="M42 74 C 54 70, 66 72, 72 77 L72 61 C 66 56, 54 54, 42 58 Z" fill="#FFFFFF" fillOpacity="0.5" />
                    <path d="M98 74 C 86 70, 74 72, 72 77 L72 61 C 74 56, 86 54, 98 58 Z" fill="#FFFFFF" fillOpacity="0.5" />
                    <path d="M72 61 L72 77" strokeWidth="1.3" />

                    {/* Subtle page text lines */}
                    <path d="M47 62 C 53 60, 61 60, 67 63" opacity="0.45" />
                    <path d="M47 66 C 53 64, 61 64, 67 67" opacity="0.45" />
                    <path d="M48 70 C 53 68, 60 68, 66 71" opacity="0.45" />
                    <path d="M77 63 C 83 60, 91 60, 93 62" opacity="0.45" />
                    <path d="M77 67 C 83 64, 91 64, 93 66" opacity="0.45" />
                    <path d="M77 71 C 83 68, 89 68, 92 70" opacity="0.45" />

                    {/* Bookmark Ribbon */}
                    <path d="M72 77 C 71 80, 73 83, 70 85 L72 83 L74 85 C 74 82, 73 79, 72 77 Z" fill="#AC512E" fillOpacity="0.4" stroke="#AC512E" strokeWidth="0.8" />

                    {/* Reading Spectacles */}
                    <circle cx="56" cy="46" r="6.5" fill="#FFFFFF" fillOpacity="0.3" strokeWidth="1.1" />
                    <circle cx="73" cy="46" r="6.5" fill="#FFFFFF" fillOpacity="0.3" strokeWidth="1.1" />
                    <path d="M62.5 45 C 64.5 43.5, 66.5 43.5, 66.5 45" strokeWidth="1.1" />
                    <path d="M49.5 46 C 45 44, 42 41, 40 42" strokeWidth="0.9" opacity="0.7" />
                    <path d="M79.5 46 C 84 44, 87 41, 89 42" strokeWidth="0.9" opacity="0.7" />
                  </svg>
                </div>
              </header>

              {/* 1. Facility Selection */}
              <div className="selection-sub-section facility-sub-section">
                <div className="section-label-row">
                  <span className="section-number-badge">1</span>
                  <h2 className="section-title">Select a facility</h2>
                </div>

                <div className="facility-cards-row" role="radiogroup" aria-label="Reading facility choices">
                  {/* Reading Room Option */}
                  <div 
                    id="facility-reading-room"
                    className={`facility-pill-card ${facilityId === 'reading-room' ? 'selected' : ''}`}
                    onClick={() => setFacilityId('reading-room')}
                    role="radio"
                    aria-checked={facilityId === 'reading-room'}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') setFacilityId('reading-room'); }}
                  >
                    <div className="facility-pill-top">
                      <BookOpen className="facility-pill-icon" />
                      <div className={`custom-radio-dot ${facilityId === 'reading-room' ? 'checked' : ''}`} />
                    </div>
                    <div className="facility-pill-body">
                      <h3 className="facility-pill-name">Reading Room</h3>
                      <p className="facility-pill-desc">A calm space for reading, study and research.</p>
                    </div>
                  </div>

                  {/* Manga Corner Option */}
                  <div 
                    id="facility-manga-corner"
                    className={`facility-pill-card ${facilityId === 'manga-corner' ? 'selected' : ''}`}
                    onClick={() => setFacilityId('manga-corner')}
                    role="radio"
                    aria-checked={facilityId === 'manga-corner'}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') setFacilityId('manga-corner'); }}
                  >
                    <div className="facility-pill-top">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="facility-pill-icon">
                        <line x1="5" y1="4" x2="5" y2="20" />
                        <line x1="9.5" y1="4" x2="9.5" y2="20" />
                        <line x1="14" y1="4" x2="18.5" y2="20" />
                      </svg>
                      <div className={`custom-radio-dot ${facilityId === 'manga-corner' ? 'checked' : ''}`} />
                    </div>
                    <div className="facility-pill-body">
                      <h3 className="facility-pill-name">Manga Corner</h3>
                      <p className="facility-pill-desc">Explore a wide range of Japanese manga.</p>
                    </div>
                  </div>
                </div>
                {errors.facilityId && <p className="inline-error-msg">{errors.facilityId}</p>}
              </div>

              {/* 2 & 3: Date Calendar & Slot Choice Grid */}
              <div className="step1-date-slot-grid">
                {/* 2. Date Selection (Custom Calendar) */}
                <div className="selection-sub-section mb-0">
                  <div className="section-label-row">
                    <span className="section-number-badge">2</span>
                    <h2 className="section-title">Select a date</h2>
                  </div>

                  <div className="inline-calendar-box" aria-label="Calendar for date selection">
                    <div className="cal-header">
                      <button 
                        type="button" 
                        onClick={handlePrevMonth}
                        className="cal-arrow-btn" 
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="w-4 h-4 stroke-[2.25]" />
                      </button>
                      <span className="cal-month-title">
                        {calendarData.monthName} {calendarData.year}
                      </span>
                      <button 
                        type="button" 
                        onClick={handleNextMonth}
                        className="cal-arrow-btn" 
                        aria-label="Next month"
                      >
                        <ChevronRight className="w-4 h-4 stroke-[2.25]" />
                      </button>
                    </div>

                    <div className="cal-weekdays-row" aria-hidden="true">
                      {calendarData.daysInWeek.map((day) => (
                        <div key={day} className="cal-weekday-cell">{day}</div>
                      ))}
                    </div>

                    <div className="cal-weeks-list">
                      {calendarData.weeks.map((week, wIdx) => (
                        <div key={wIdx} className="cal-week-row">
                          {week.map((cell, cIdx) => {
                            if (!cell.isCurrentMonth) {
                              return (
                                <div key={`pad-${wIdx}-${cIdx}`} className="cal-day-cell pad-cell">
                                  <span className="day-number-bubble pad-bubble">{cell.dayNumber}</span>
                                </div>
                              );
                            }

                            return (
                              <button
                                key={cell.dateStr}
                                type="button"
                                disabled={cell.disabled}
                                onClick={() => {
                                  setSelectedDate(cell.dateStr);
                                  setErrors((prev) => ({ ...prev, selectedDate: null }));
                                }}
                                className={`cal-day-cell ${cell.isSelected ? 'selected' : ''} ${cell.disabled ? 'disabled' : ''} ${cell.isClosed ? 'closed' : ''}`}
                                aria-label={`${cell.dateStr}${cell.isSelected ? ' selected' : ''}${cell.disabled ? ' unavailable' : ''}`}
                              >
                                <span className="day-number-bubble">{cell.dayNumber}</span>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  {errors.selectedDate && <p className="inline-error-msg">{errors.selectedDate}</p>}
                </div>

                {/* 3. Session Time Slot Selection & Action CTA */}
                <div className="selection-sub-section mb-0 slot-choice-col">
                  <div className="section-label-row">
                    <span className="section-number-badge">3</span>
                    <h2 className="section-title">Select a time slot</h2>
                  </div>

                  {availability && !availability.available ? (
                    <div className="session-unavailable-notice">
                      <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                      <div>
                        <strong>Library Closed on this date</strong>
                        <p>{availability.reason || 'The facility is closed on this date according to regular opening schedule.'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="session-cards-column" role="radiogroup" aria-label="Session time choices">
                      {/* Morning Slot */}
                      {(() => {
                        const mSession = availability?.sessions?.find(s => s.id === 'morning') || {
                          id: 'morning',
                          name: 'Morning Session',
                          startTime: '11:00 AM',
                          endTime: '2:30 PM',
                          isAvailable: true,
                          remainingCapacity: 15,
                        };
                        const isSelected = sessionId === 'morning';
                        const isFull = mSession.isAvailable === false || mSession.remainingCapacity <= 0;

                        return (
                          <div
                            id="session-morning"
                            className={`session-pill-card ${isSelected ? 'selected' : ''} ${isFull ? 'disabled' : ''}`}
                            onClick={() => !isFull && setSessionId('morning')}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={isFull ? -1 : 0}
                            onKeyDown={(e) => { if (!isFull && (e.key === ' ' || e.key === 'Enter')) setSessionId('morning'); }}
                          >
                            <div className="session-pill-top">
                              <div className="session-time-group">
                                <Clock className={`session-time-clock ${isSelected ? 'clock-active' : ''}`} />
                                <span className="session-time-text">11:00 AM – 2:30 PM</span>
                              </div>
                              <div className={`custom-radio-dot ${isSelected ? 'checked' : ''}`} />
                            </div>
                            <div className="session-pill-bottom">
                              <span className="session-name-sub">Morning Session</span>
                              <span className={`capacity-indicator ${isFull ? 'cap-full' : mSession.remainingCapacity <= 4 ? 'cap-low' : 'cap-ok'}`}>
                                {isFull ? 'Fully Booked' : `${mSession.remainingCapacity ?? 15} spots left`}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Afternoon Slot */}
                      {(() => {
                        const aSession = availability?.sessions?.find(s => s.id === 'afternoon') || {
                          id: 'afternoon',
                          name: 'Afternoon Session',
                          startTime: '3:00 PM',
                          endTime: '6:30 PM',
                          isAvailable: true,
                          remainingCapacity: 15,
                        };
                        const isSelected = sessionId === 'afternoon';
                        const isFull = aSession.isAvailable === false || aSession.remainingCapacity <= 0;

                        return (
                          <div
                            id="session-afternoon"
                            className={`session-pill-card ${isSelected ? 'selected' : ''} ${isFull ? 'disabled' : ''}`}
                            onClick={() => !isFull && setSessionId('afternoon')}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={isFull ? -1 : 0}
                            onKeyDown={(e) => { if (!isFull && (e.key === ' ' || e.key === 'Enter')) setSessionId('afternoon'); }}
                          >
                            <div className="session-pill-top">
                              <div className="session-time-group">
                                <Clock className={`session-time-clock ${isSelected ? 'clock-active' : ''}`} />
                                <span className="session-time-text">3:00 PM – 6:30 PM</span>
                              </div>
                              <div className={`custom-radio-dot ${isSelected ? 'checked' : ''}`} />
                            </div>
                            <div className="session-pill-bottom">
                              <span className="session-name-sub">Afternoon Session</span>
                              <span className={`capacity-indicator ${isFull ? 'cap-full' : aSession.remainingCapacity <= 4 ? 'cap-low' : 'cap-ok'}`}>
                                {isFull ? 'Fully Booked' : `${aSession.remainingCapacity ?? 15} spots left`}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  {errors.sessionId && <p className="inline-error-msg">{errors.sessionId}</p>}

                  {/* Primary CTA: Continue to details */}
                  <div className="step1-cta-block">
                    <button 
                      type="button" 
                      id="continue-to-details-btn"
                      className="primary-espresso-btn step1-primary-btn"
                      onClick={handleProceedToDetails}
                    >
                      <span>Continue to details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <p className="step1-cta-hint">You can review details before confirming your booking.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              STEP 2: VISITOR DETAILS (Mockup 2: "Tell us about yourself")
              ===================================================================== */}
          {step === 2 && (
            <div key="step-2" className="step-details-layout-clean wizard-step-transition">
              <header className="step-intro-header-art">
                <div className="step-intro-text-col">
                  <div className="category-tag-row">
                    <span className="category-tag">YOUR DETAILS</span>
                  </div>
                  <h1 className="step-main-title">Tell us about yourself</h1>
                  <p className="step-main-subtitle">Please provide your details to complete your reservation.</p>
                </div>

                {/* Subtle Botanical & Book Stack Line Art Illustration */}
                <div className="step-header-art-box" aria-hidden="true">
                  <svg width="86" height="74" viewBox="0 0 100 85" fill="none" stroke="#7A6858" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="step-header-illustration">
                    <path d="M40 70 C 45 45, 60 25, 80 5" strokeWidth="1.1" opacity="0.6" />
                    <path d="M52 48 C 45 42, 45 32, 54 36 C 60 38, 58 46, 52 48 Z" fill="#8C7E72" fillOpacity="0.08" opacity="0.7" />
                    <path d="M60 36 C 58 26, 66 18, 72 24 C 74 29, 68 34, 60 36 Z" fill="#8C7E72" fillOpacity="0.08" opacity="0.7" />
                    <path d="M68 25 C 70 15, 80 10, 84 17 C 85 23, 77 26, 68 25 Z" fill="#8C7E72" fillOpacity="0.08" opacity="0.7" />
                    <path d="M78 8 C 82 2, 92 2, 90 10 C 86 14, 80 12, 78 8 Z" fill="#8C7E72" fillOpacity="0.08" opacity="0.7" />
                    
                    <path d="M62 68 L88 64 L96 72 L70 76 Z" fill="#FFFFFF" fillOpacity="0.4" />
                    <path d="M62 68 L62 72 L70 80 L96 76 L96 72" />
                    <path d="M62 72 L70 80" />
                    
                    <path d="M64 59 L89 56 L95 63 L70 66 Z" fill="#FFFFFF" fillOpacity="0.4" />
                    <path d="M64 59 L64 62 L70 69 L95 66 L95 63" />
                    <path d="M64 62 L70 69" />
                    
                    <path d="M67 50 L91 48 L96 54 L72 56 Z" fill="#FFFFFF" fillOpacity="0.5" />
                    <path d="M67 50 L67 53 L72 59 L96 57 L96 54" />
                    <path d="M67 53 L72 59" />
                    
                    <path d="M69 51 L89 49" opacity="0.5" />
                    <path d="M66 60 L87 57" opacity="0.5" />
                    <path d="M64 69 L86 65" opacity="0.5" />
                  </svg>
                </div>
              </header>

              {/* Information Callout Banner */}
              <div className="details-info-callout">
                <div className="callout-icon-wrap">
                  <Lightbulb className="callout-bulb-icon" />
                </div>
                <div className="callout-text-wrap">
                  <strong className="callout-title">A few details, a better experience</strong>
                  <p className="callout-desc">We'll use this information to confirm your booking and keep you updated.</p>
                </div>
              </div>

              <form className="details-form-box" onSubmit={(e) => { e.preventDefault(); handleProceedToReview(); }}>
                {/* Full Name */}
                <div className="form-field-group">
                  <div className="field-label-row">
                    <User className="field-label-icon" />
                    <label htmlFor="visitor-name" className="field-label-text">
                      FULL NAME <span className="req-asterisk">*</span>
                    </label>
                  </div>
                  <input
                    id="visitor-name"
                    type="text"
                    className={`field-text-input ${errors.visitorName ? 'error' : ''}`}
                    placeholder="Enter your full name"
                    value={visitorName}
                    onChange={(e) => {
                      setVisitorName(e.target.value);
                      if (errors.visitorName) setErrors((prev) => ({ ...prev, visitorName: null }));
                    }}
                    autoComplete="name"
                  />
                  {errors.visitorName && <p className="inline-error-msg">{errors.visitorName}</p>}
                </div>

                {/* Email Address */}
                <div className="form-field-group">
                  <div className="field-label-row">
                    <Mail className="field-label-icon" />
                    <label htmlFor="visitor-email" className="field-label-text">
                      EMAIL ADDRESS <span className="req-asterisk">*</span>
                    </label>
                  </div>
                  <input
                    id="visitor-email"
                    type="email"
                    className={`field-text-input ${errors.visitorEmail ? 'error' : ''}`}
                    placeholder="Enter your email address"
                    value={visitorEmail}
                    onChange={(e) => {
                      setVisitorEmail(e.target.value);
                      if (errors.visitorEmail) setErrors((prev) => ({ ...prev, visitorEmail: null }));
                    }}
                    autoComplete="email"
                  />
                  <span className="field-helper-text">You will receive a confirmation email with your booking details.</span>
                  {errors.visitorEmail && <p className="inline-error-msg">{errors.visitorEmail}</p>}
                </div>

                {/* Membership Number (Optional) */}
                <div className="form-field-group">
                  <div className="field-label-row">
                    <CreditCard className="field-label-icon" />
                    <label htmlFor="membership-no" className="field-label-text">
                      MEMBERSHIP NUMBER (OPTIONAL)
                    </label>
                  </div>
                  <input
                    id="membership-no"
                    type="text"
                    className="field-text-input"
                    placeholder="Enter your membership number"
                    value={membershipNo}
                    onChange={(e) => setMembershipNo(e.target.value)}
                  />
                  <span className="field-helper-text">Required only if specified by the library's booking policy.</span>
                </div>

                {/* Agreement Checkbox */}
                <div className="guidelines-agreement-box">
                  <label className="checkbox-flex-label">
                    <input
                      id="guidelines-agreement-checkbox"
                      type="checkbox"
                      checked={agreeRules}
                      onChange={(e) => {
                        setAgreeRules(e.target.checked);
                        if (errors.agreeRules) setErrors((prev) => ({ ...prev, agreeRules: null }));
                      }}
                      className="custom-form-checkbox"
                    />
                    <span className="checkbox-text">
                      I have read and agree to the library's{' '}
                      <span className="accent-link">visit guidelines</span> and{' '}
                      <span className="accent-link">booking terms</span>.
                    </span>
                  </label>
                  {errors.agreeRules && <p className="inline-error-msg" style={{ marginTop: '0.2rem' }}>{errors.agreeRules}</p>}
                </div>

                {/* Navigation Actions */}
                <div className="form-nav-row">
                  <button
                    type="button"
                    id="back-to-selection-btn"
                    className="nav-secondary-back-btn"
                    onClick={() => setStep(1)}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back to selection</span>
                  </button>

                  <button
                    type="submit"
                    id="review-booking-btn"
                    className="primary-espresso-btn"
                  >
                    <span>Review booking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =====================================================================
              STEP 3: REVIEW VIEW (Mockup 3 Left: "Almost there!")
              ===================================================================== */}
          {step === 3 && (
            <div key="step-3" className="step-review-layout wizard-step-transition">
              <header className="step-intro-header">
                <div className="category-tag-row">
                  <span className="category-tag">REVIEW YOUR VISIT</span>
                  <span className="category-rule" />
                </div>
                <h1 className="step-main-title">Almost there!</h1>
                <p className="step-main-subtitle">Review your booking before confirming.</p>
              </header>

              {submitError && (
                <div className="submit-error-banner" role="alert">
                  <AlertCircle className="w-5 h-5 text-red-700 shrink-0" />
                  <p>{submitError}</p>
                </div>
              )}

              <div className="review-cards-list">
                {/* 1. Booking Summary Card */}
                <div className="review-section-card">
                  <div className="review-card-head">
                    <div className="head-left">
                      <div className="review-head-badge">
                        <FileText className="review-head-icon" />
                      </div>
                      <h2 className="review-head-title">Booking summary</h2>
                    </div>
                    <button
                      type="button"
                      id="edit-summary-btn"
                      className="edit-pill-btn"
                      onClick={() => setStep(1)}
                      title="Edit facility, date or session"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="review-card-rows">
                    {/* Facility */}
                    <div className="review-row-item review-row-facility">
                      <div className="row-icon-col row-icon-circle">
                        <BookOpen className="row-icon" />
                      </div>
                      <div className="row-text-block">
                        <div className="row-label-col">Facility</div>
                        <div className="row-val-col">
                          <strong>{selectedFacilityObj.name}</strong>
                          <span className="val-sub desktop-val-sub">{selectedFacilityObj.description}</span>
                          <span className="val-sub mobile-val-sub">
                            {facilityId === 'reading-room'
                              ? 'Quiet reading, study and research.'
                              : 'Explore a wide range of Japanese manga.'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Date and Time Group (side-by-side on mobile, flow on desktop) */}
                    <div className="review-date-time-group">
                      <div className="review-row-item review-row-date">
                        <div className="row-icon-col row-icon-circle">
                          <Calendar className="row-icon" />
                        </div>
                        <div className="row-text-block">
                          <div className="row-label-col">Date</div>
                          <div className="row-val-col">
                            <strong className="desktop-date-val">{formatFullDate(selectedDate)}</strong>
                            <strong className="mobile-date-val">{formatShortDate(selectedDate)}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="review-row-item review-row-time">
                        <div className="row-icon-col row-icon-circle">
                          <Clock className="row-icon" />
                        </div>
                        <div className="row-text-block">
                          <div className="row-label-col">Time</div>
                          <div className="row-val-col">
                            <strong>
                              {sessionId === 'morning' ? '11:00 AM – 2:30 PM' : '3:00 PM – 6:30 PM'}
                            </strong>
                            <span className="session-pill-tag">
                              {sessionId === 'morning' ? 'Morning Session' : 'Afternoon Session'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Visitor Details Card */}
                <div className="review-section-card">
                  <div className="review-card-head">
                    <div className="head-left">
                      <div className="review-head-badge">
                        <User className="review-head-icon" />
                      </div>
                      <h2 className="review-head-title">Visitor details</h2>
                    </div>
                    <button
                      type="button"
                      id="edit-details-btn"
                      className="edit-pill-btn"
                      onClick={() => setStep(2)}
                      title="Edit visitor name or email"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="review-card-rows">
                    <div className="review-row-item">
                      <div className="row-icon-col row-icon-circle">
                        <User className="row-icon" />
                      </div>
                      <div className="row-text-block">
                        <div className="row-label-col">Full name</div>
                        <div className="row-val-col">
                          <strong>{visitorName}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="review-row-item">
                      <div className="row-icon-col row-icon-circle">
                        <Mail className="row-icon" />
                      </div>
                      <div className="row-text-block">
                        <div className="row-label-col">Email address</div>
                        <div className="row-val-col">
                          <strong className="user-email-text">{visitorEmail}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="review-row-item">
                      <div className="row-icon-col row-icon-circle">
                        <CreditCard className="row-icon" />
                      </div>
                      <div className="row-text-block">
                        <div className="row-label-col">Membership number</div>
                        <div className="row-val-col">
                          <span className="membership-val">{membershipNo ? membershipNo : 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Bottom Actions */}
              <div className="review-actions-bottom">
                <button
                  type="button"
                  id="back-to-details-btn"
                  className="nav-secondary-back-btn"
                  onClick={() => setStep(2)}
                  disabled={submitting}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to details</span>
                </button>

                <button
                  type="button"
                  id="confirm-reservation-btn"
                  className="primary-espresso-btn confirm-btn"
                  onClick={handleConfirmReservation}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="mini-spinner-light" />
                      <span>Reserving slot...</span>
                    </>
                  ) : (
                    <>
                      <span className="desktop-btn-text">Confirm reservation</span>
                      <span className="mobile-btn-text">Confirm booking</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="mobile-review-edit-hint">
                You can still edit these details.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );

  if (isModal) {
    return (
      <div 
        className="booking-modal-backdrop" 
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) {
            onClose();
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Reserve a Visit"
      >
        <div className="booking-modal-dialog" onClick={(e) => e.stopPropagation()}>
          {wizardContent}
        </div>
      </div>
    );
  }

  return wizardContent;
}
