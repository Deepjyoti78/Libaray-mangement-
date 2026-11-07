import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReservationCard from '../components/ReservationCard';
import useReservationDialog from '../hooks/useReservationDialog';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Calendar, Clock, AlertCircle, User, Mail, BookOpen, 
  ChevronLeft, ChevronRight, FileText, Lightbulb, CreditCard,
  CheckCircle2, Copy, Check, Printer, CalendarPlus, Trash2, RotateCcw, 
  QrCode, TicketX, CalendarDays
} from 'lucide-react';
import { formatVisitDate } from '../utils/dates';

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

const DEFAULT_CONFIG = {
  facilities: [
    {
      id: 'reading-room',
      name: 'Reading Room',
      description: 'A calm space for reading, study and research.',
    },
    {
      id: 'manga-corner',
      name: 'Manga Corner',
      description: 'Explore a wide range of Japanese manga.',
    },
  ],
  sessions: [
    { id: 'morning', name: 'Morning Session', startTime: '11:00 AM', endTime: '2:30 PM' },
    { id: 'afternoon', name: 'Afternoon Session', startTime: '3:00 PM', endTime: '6:30 PM' },
  ],
  settings: {
    dailyBookingLimit: 1,
    advanceBookingDays: 14,
    cancellationCutoffHours: 2,
    openingDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    requireMembership: false,
  },
  closureDates: [],
  timezone: 'Asia/Kolkata',
};

function getInitialOpenDate(openingDays = ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], closureDates = []) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  for (let i = 0; i <= 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dayName = days[d.getDay()];
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const isClosure = closureDates.some(c => (typeof c === 'string' ? c : c.date) === dateStr);

    if (openingDays.includes(dayName) && !isClosure) {
      return dateStr;
    }
  }
  return '';
}

export default function BookingWizard({ isModal = false, onClose }) {
  const navigate = useNavigate();

  // Wizard logical steps: 1 = Selection (Space + Date + Slot), 2 = Details, 3 = Review
  const [step, setStep] = useState(1);

  const cardRef = useRef(null);
  useReservationDialog(cardRef, onClose, isModal);
  useEffect(() => {
    cardRef.current?.querySelector('[data-reservation-autofocus]')?.focus({ preventScroll: true });
  }, [step]);

  // Configuration with immediate defaults - no blocking screen
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  // Form selections with instant defaults
  const [facilityId, setFacilityId] = useState('reading-room');
  const [selectedDate, setSelectedDate] = useState(() => getInitialOpenDate());
  const [sessionId, setSessionId] = useState('morning');
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [membershipNo, setMembershipNo] = useState('');
  const [agreeRules, setAgreeRules] = useState(false);

  // Calendar month/year navigation state
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const initial = getInitialOpenDate();
    if (initial) {
      const parts = initial.split('-');
      return parseInt(parts[1], 10) - 1;
    }
    return new Date().getMonth();
  });
  const [calendarYear, setCalendarYear] = useState(() => {
    const initial = getInitialOpenDate();
    if (initial) {
      const parts = initial.split('-');
      return parseInt(parts[0], 10);
    }
    return new Date().getFullYear();
  });

  // Real-time slot availability
  const [availability, setAvailability] = useState(null);
  const [availLoading, setAvailLoading] = useState(false);

  // Form validation errors & submission state
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Confirmed booking state (Step 4 - in-popup confirmation)
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [isCancelled, setIsCancelled] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // 1. Fetch public configuration on mount (non-blocking background sync)
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          setConfig((prev) => ({ ...prev, ...data }));

          // Find first open available date to pre-select
          const nextDate = getInitialOpenDate(data.settings?.openingDays, data.closureDates || []);
          if (nextDate) {
            setSelectedDate(nextDate);
            setCalendarMonth(Number(nextDate.slice(5, 7)) - 1);
            setCalendarYear(Number(nextDate.slice(0, 4)));
          }
          if (data.facilities?.length) setFacilityId((current) => data.facilities.some((facility) => facility.id === current) ? current : data.facilities[0].id);
        }
      } catch (err) {
        console.error('Failed to load configuration:', err);
      }
    }
    loadConfig();
  }, []);

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
            setSessionId((current) => data.sessions?.some((session) => session.id === current && session.isAvailable)
              ? current : data.sessions?.find((session) => session.isAvailable)?.id || '');
          }
        } else {
          const errData = await res.json().catch(() => null);
          if (isMounted) {
            setAvailability({
              available: false,
              reason: errData?.error || 'The facility is not accepting reservations on this date.',
              sessions: [],
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          // If server is temporarily booting or unreachable, gracefully fall back to default sessions
          const fallbackSessions = (config?.sessions || DEFAULT_CONFIG.sessions).map((s) => ({
            ...s,
            isAvailable: true,
            remainingCapacity: 15,
          }));
          setAvailability({
            available: true,
            isOfflineFallback: true,
            sessions: fallbackSessions,
          });
          setSessionId((current) => current || fallbackSessions[0]?.id || 'morning');
        }
      } finally {
        if (isMounted) setAvailLoading(false);
      }
    }

    checkAvail();
    return () => { isMounted = false; };
  }, [facilityId, selectedDate, config?.sessions]);

  // Calendar calculations
  const calendarData = useMemo(() => {
    const todayStr = getTodayInKolkata();
    const openingDays = config?.settings?.openingDays || ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const closureDates = (config?.closureDates || []).map(c => c.date);
    const advanceDays = config?.settings?.advanceBookingDays ?? 14;

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
    const maxDate = new Date(todayStr + 'T12:00:00Z');
    maxDate.setUTCDate(maxDate.getUTCDate() + advanceDays);
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
    if (!availability || availLoading) errs.sessionId = 'Wait for current availability before continuing.';
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

  const formatSessionTime = (booking, defSessionId) => {
    if (booking?.sessionStartTime && booking?.sessionEndTime) {
      const s = booking.sessionStartTime.length > 5 ? booking.sessionStartTime.slice(0, 5) : booking.sessionStartTime;
      const e = booking.sessionEndTime.length > 5 ? booking.sessionEndTime.slice(0, 5) : booking.sessionEndTime;
      return `${s} – ${e}`;
    }
    return defSessionId === 'morning' ? '11:00 – 14:30' : '15:00 – 18:30';
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

    if (config.settings.requireMembership && !membershipNo.trim()) errs.membershipNo = 'A membership ID is required.';

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
      } catch {
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

      // Transition smoothly to in-popup confirmation card (Step 4)
      setConfirmedBooking(data.booking);
      setIsCancelled(false);
      setShowCancelConfirm(false);
      setCancelReason('');
      setCancelError('');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3800);
      setStep(4);
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

  const handleCopyRef = async (refText) => {
    try {
      await navigator.clipboard.writeText(refText);
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = refText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      } catch {
        // fallback
      }
    }
    setCopiedRef(true);
    setToastMsg('Booking reference copied');
    setTimeout(() => {
      setCopiedRef(false);
      setToastMsg('');
    }, 2400);
  };

  const handleAddToCalendar = () => {
    if (!confirmedBooking) return;
    setToastMsg('Calendar invite (.ics) downloaded');
    setTimeout(() => setToastMsg(''), 2500);
    const stamp = (time) => new Date(confirmedBooking.visitDate + 'T' + (time ? time.slice(0, 5) : '11:00') + ':00+05:30').toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const escape = (text) => String(text).replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll(',', '\\,').replaceAll(';', '\\;');
    const content = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The Library New Delhi//Reservation//EN', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT', 'UID:' + confirmedBooking.bookingRef + '@library.delhi', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
      'DTSTART:' + stamp(confirmedBooking.sessionStartTime || '11:00'),
      'DTEND:' + stamp(confirmedBooking.sessionEndTime || '14:30'),
      'SUMMARY:' + escape('The Library · ' + (confirmedBooking.facilityName || selectedFacilityObj.name)),
      'DESCRIPTION:' + escape('Booking reference: ' + confirmedBooking.bookingRef),
      'LOCATION:' + escape('5A, Ring Road, Lajpat Nagar-IV, New Delhi 110024'), 'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR', '',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'library-reservation-' + confirmedBooking.bookingRef + '.ics';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleCancelReservation = async (e) => {
    if (e) e.preventDefault();
    if (!confirmedBooking || cancelling) return;
    setCancelling(true);
    setCancelError('');
    try {
      const response = await fetch(`/api/bookings/${encodeURIComponent(confirmedBooking.bookingRef)}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Management-Token': confirmedBooking.managementToken,
        },
        body: JSON.stringify({ reason: cancelReason.trim() || 'Cancelled by visitor online' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Your reservation could not be cancelled. Please try again.');
      setConfirmedBooking((prev) => ({ ...prev, status: 'cancelled', cancelledAt: data.cancelledAt }));
      setIsCancelled(true);
      setShowCancelConfirm(false);
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel reservation.');
    } finally {
      setCancelling(false);
    }
  };

  const handleBookAnother = () => {
    setStep(1);
    setConfirmedBooking(null);
    setIsCancelled(false);
    setShowCancelConfirm(false);
    setCancelReason('');
    setCancelError('');
    setVisitorName('');
    setVisitorEmail('');
    setMembershipNo('');
    setAgreeRules(false);
  };

  const selectedFacilityObj = config?.facilities?.find((f) => f.id === facilityId) || {
    id: 'reading-room',
    name: 'Reading Room',
    description: 'A calm space for reading, study and research.',
  };

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
    4: {
      headline: isCancelled ? 'There’s always another chapter.' : 'Your seat is reserved.',
      sub: isCancelled ? 'Your seat has been released.' : 'A quiet corner awaits your arrival.',
      caption: isCancelled ? 'RESERVATION CANCELLED' : 'RESERVATION CONFIRMED · ENJOY YOUR VISIT',
    },
  }[step] || {
    headline: 'A space for reading, culture and curiosity.',
    caption: 'BOOKS · MANGA · PEOPLE · JAPAN',
  };

  const wizardContent = (
    <div className={isModal ? 'reservation-wizard' : 'new-booking-page'}>
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

      <ReservationCard
        cardRef={cardRef}
        label="Reserve a Visit"
        onClose={isModal ? onClose : undefined}
        quote={photoMeta.headline}
        description={photoMeta.sub || "読書・マンガ・人・日本"}
        caption={photoMeta.caption}
        image={facilityId === 'manga-corner' ? '/images/manga-corner.jpg' : '/images/library-reading-area.webp'}
        panelClassName={`${submitError ? 'has-submit-error' : ''} ${step === 4 ? 'is-confirmation-step' : ''}`}
        live="polite"
      >
          {step === 1 && (
            <div key="step-1" className="step-selection-layout-clean wizard-step-transition">
              <header className="step-intro-header-art">
                <div className="step-intro-text-col">
                  <div className="category-tag-row">
                    <span className="category-tag">BOOK A VISIT</span>
                  </div>
                  <h1 className="step-main-title" tabIndex={-1} data-reservation-autofocus>Reserve your slot</h1>
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
                      <div className="facility-icon-wrap">
                        <BookOpen className="facility-pill-icon" />
                      </div>
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
                      <div className="facility-icon-wrap">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="facility-pill-icon">
                          <line x1="5" y1="4" x2="5" y2="20" />
                          <line x1="9.5" y1="4" x2="9.5" y2="20" />
                          <line x1="14" y1="4" x2="18.5" y2="20" />
                        </svg>
                      </div>
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

                  {availability && availability.available === false && !availability.isOfflineFallback ? (
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
                      disabled={availLoading || !availability}
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
                  <h1 className="step-main-title" tabIndex={-1} data-reservation-autofocus>Tell us about yourself</h1>
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
                      MEMBERSHIP NUMBER {config.settings.requireMembership ? '(REQUIRED)' : '(OPTIONAL)'}
                    </label>
                  </div>
                  <input
                    id="membership-no"
                    type="text"
                    className="field-text-input"
                    placeholder="Enter your membership number"
                    required={config.settings.requireMembership}
                    value={membershipNo}
                    onChange={(e) => setMembershipNo(e.target.value)}
                  />
                  <span className="field-helper-text">Required only if specified by the library's booking policy.</span>
                  {errors.membershipNo && <p className="inline-error-msg">{errors.membershipNo}</p>}
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
                <h1 className="step-main-title" tabIndex={-1} data-reservation-autofocus>Almost there!</h1>
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

          {/* =====================================================================
              STEP 4: VISIT CONFIRMED & RESERVATION PASS (In-Popup View)
              ===================================================================== */}
          {step === 4 && confirmedBooking && (
            <div key="step-4" className="step-confirmed-layout wizard-step-transition">
              {/* Celebratory Luxury Confetti Particles */}
              {showConfetti && (
                <div className="confirmed-confetti-canvas" aria-hidden="true">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <span
                      key={i}
                      className={`confetti-particle confetti-${(i % 5) + 1}`}
                      style={{
                        left: `${(i * 3.3) % 100}%`,
                        animationDelay: `${(i * 0.05).toFixed(2)}s`,
                        animationDuration: `${(1.9 + (i % 4) * 0.35).toFixed(2)}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Floating Feedback Toast */}
              {toastMsg && (
                <div className="confirmed-toast-alert" role="status">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{toastMsg}</span>
                </div>
              )}

              {/* Animated Confirmed Header with live beacon & checkmark */}
              <header className="confirmed-hero-header">
                <div className="confirmed-status-pill-wrap">
                  <span className={`confirmed-status-pill ${isCancelled ? 'status-cancelled' : 'status-active'}`}>
                    <span className="pill-dot" />
                    {isCancelled ? 'RESERVATION RELEASED' : 'RESERVATION CONFIRMED'}
                  </span>
                </div>
                <div className="confirmed-heading-flex">
                  <div className={`confirmed-check-badge ${isCancelled ? 'is-cancelled' : 'is-confirmed'}`} aria-hidden="true">
                    {isCancelled ? (
                      <TicketX className="w-4 h-4 text-red-600 stroke-[2.2]" />
                    ) : (
                      <svg className="confirmed-svg-check" viewBox="0 0 24 24" fill="none">
                        <circle className="circle-draw" cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2.2" />
                        <path className="path-draw" d="M7.5 12.5L10.5 15.5L16.5 9.5" stroke="#10B981" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <h1 className="step-main-title confirmed-heading">
                    {isCancelled ? 'Your reservation is cancelled.' : 'Your visit is confirmed!'}
                  </h1>
                </div>
                <p className="step-main-subtitle confirmed-sub">
                  {isCancelled
                    ? 'Your seat has been released. We hope to welcome you another day.'
                    : 'Your seat is reserved. We look forward to welcoming you to The Library.'}
                </p>
              </header>

              {/* Stacked Interactive Content Region */}
              <div className="confirmed-cards-container">
                {/* CARD 1: My Reservation Pass Card */}
                <div className={`my-reservation-card ${isCancelled ? 'card-cancelled' : ''}`}>
                  <div className="my-res-card-top">
                    <div className="my-res-brand">
                      <BookOpen className="my-res-icon-book" />
                      <div>
                        <span className="my-res-tag">RESERVATION PASS</span>
                        <h2 className="my-res-name">{confirmedBooking.facilityName || selectedFacilityObj.name}</h2>
                      </div>
                    </div>
                    
                    <div className="my-res-ref-box">
                      <span className="ref-label">BOOKING REF</span>
                      <button
                        type="button"
                        id="copy-ref-btn"
                        className="ref-copy-btn"
                        onClick={() => handleCopyRef(confirmedBooking.bookingRef)}
                        title="Copy booking reference"
                        aria-label={`Copy booking reference ${confirmedBooking.bookingRef}`}
                      >
                        <span className="ref-code">{confirmedBooking.bookingRef}</span>
                        {copiedRef ? (
                          <span className="copied-tag"><Check className="w-3 h-3" /> Copied</span>
                        ) : (
                          <Copy className="w-3.5 h-3.5 ref-copy-icon" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="my-res-body-grid">
                    <div className="my-res-info-col">
                      <div className="my-res-detail-item">
                        <CalendarDays className="my-res-item-icon" />
                        <div>
                          <span className="detail-label">VISIT DATE</span>
                          <strong className="detail-value">{formatVisitDate(confirmedBooking.visitDate)}</strong>
                        </div>
                      </div>

                      <div className="my-res-detail-item">
                        <Clock className="my-res-item-icon" />
                        <div>
                          <span className="detail-label">TIME SLOT</span>
                          <strong className="detail-value">
                            {formatSessionTime(confirmedBooking, sessionId)}
                          </strong>
                          <span className="detail-sub">{confirmedBooking.sessionName || (sessionId === 'morning' ? 'Morning Session' : 'Afternoon Session')}</span>
                        </div>
                      </div>

                      <div className="my-res-detail-item">
                        <User className="my-res-item-icon" />
                        <div>
                          <span className="detail-label">VISITOR</span>
                          <strong className="detail-value">{confirmedBooking.visitorName || visitorName}</strong>
                          <span className="detail-sub">{confirmedBooking.visitorEmail || visitorEmail}</span>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Column */}
                    <div className="my-res-qr-col">
                      <div className="my-res-qr-frame">
                        {isCancelled ? (
                          <div className="qr-cancelled-overlay">
                            <TicketX className="w-8 h-8 text-stone-400" />
                            <span>Inactive</span>
                          </div>
                        ) : confirmedBooking.qrCodeDataUrl ? (
                          <img
                            src={confirmedBooking.qrCodeDataUrl}
                            alt={`Entry QR code for ${confirmedBooking.bookingRef}`}
                            className="my-res-qr-img"
                            width="90"
                            height="90"
                          />
                        ) : (
                          <div className="qr-fallback-box">
                            <QrCode className="w-8 h-8 text-stone-600" />
                            <span>Show Ref</span>
                          </div>
                        )}
                      </div>
                      <span className="qr-hint">{isCancelled ? 'Seat released' : 'Scan at reception'}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Row matching reference image */}
                {!isCancelled ? (
                  <>
                    <div className="confirmed-action-buttons-row">
                      <button
                        type="button"
                        id="modal-add-calendar-btn"
                        className="confirmed-action-pill-btn"
                        onClick={handleAddToCalendar}
                        title="Add to your calendar (.ics)"
                      >
                        <CalendarPlus className="w-4 h-4 text-stone-700" />
                        <span>Add to calendar</span>
                      </button>

                      <button
                        type="button"
                        id="modal-print-pass-btn"
                        className="confirmed-action-pill-btn"
                        onClick={() => window.print()}
                        title="Print your reservation pass"
                      >
                        <Printer className="w-4 h-4 text-stone-700" />
                        <span>Print pass</span>
                      </button>

                      <button
                        type="button"
                        id="modal-cancel-res-btn"
                        className="confirmed-action-pill-btn cancel-action-btn"
                        onClick={() => { setCancelError(''); setShowCancelConfirm(true); }}
                        title="Cancel this reservation"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span>Cancel reservation</span>
                      </button>
                    </div>

                    {/* Cancellation prompt inline if clicked */}
                    {showCancelConfirm && (
                      <div className="cancel-confirm-panel">
                        <div className="cancel-warning-head">
                          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                          <div>
                            <strong>Cancel this visit?</strong>
                            <p>Your reservation for {formatVisitDate(confirmedBooking.visitDate)} will be released.</p>
                          </div>
                        </div>

                        <input
                          type="text"
                          id="modal-cancel-reason-input"
                          className="cancel-reason-input"
                          placeholder="Reason for cancellation (optional)"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          maxLength={200}
                          disabled={cancelling}
                        />

                        {cancelError && <p className="inline-error-msg">{cancelError}</p>}

                        <div className="cancel-panel-actions">
                          <button
                            type="button"
                            id="modal-keep-res-btn"
                            className="cancel-keep-btn"
                            onClick={() => setShowCancelConfirm(false)}
                            disabled={cancelling}
                          >
                            Keep reservation
                          </button>
                          <button
                            type="button"
                            id="modal-confirm-cancel-btn"
                            className="cancel-danger-btn"
                            onClick={handleCancelReservation}
                            disabled={cancelling}
                          >
                            {cancelling ? 'Cancelling...' : 'Confirm cancellation'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="res-cancelled-notice-card">
                    <div className="cancelled-notice-left">
                      <TicketX className="w-5 h-5 text-red-700 shrink-0" />
                      <div>
                        <strong>Seat Released</strong>
                        <p>This reservation has been cancelled. You can reserve another date anytime.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmed View Footer Navigation */}
              <div className="confirmed-footer-nav">
                <button
                  type="button"
                  id="modal-book-another-btn"
                  className="confirmed-footer-back-btn"
                  onClick={handleBookAnother}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Book another visit</span>
                </button>

                {onClose ? (
                  <button
                    type="button"
                    id="modal-confirmed-done-btn"
                    className="confirmed-footer-done-btn"
                    onClick={onClose}
                  >
                    <span>Done</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    id="modal-confirmed-home-btn"
                    className="confirmed-footer-done-btn"
                    onClick={() => navigate('/')}
                  >
                    <span>Done</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
      </ReservationCard>
    </div>
  );

  if (isModal) {
    return createPortal(
      <div 
        className="reservation-overlay" 
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) {
            onClose();
          }
        }}
      >
        <div className="reservation-dialog" onClick={(e) => e.stopPropagation()}>
          {wizardContent}
        </div>
      </div>,
      document.body
    );
  }

  return wizardContent;
}
