import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, CalendarPlus, CheckCircle2, Info, Printer, TicketX, Trash2 } from 'lucide-react';
import PassPageShell from '../components/PassPageShell';
import ReservationPass from '../components/ReservationPass';
import { formatVisitDate } from '../utils/dates';

const STATUS = {
  confirmed: { label: 'Booking confirmed', title: 'Your visit is confirmed!', description: 'Your seat is reserved. We look forward to welcoming you to The Library.' },
  checked_in: { label: 'Checked in', title: 'Welcome to The Library.', description: 'Your arrival has been recorded. Enjoy your reading session.' },
  cancelled: { label: 'Reservation cancelled', title: 'Your reservation is cancelled.', description: 'Your seat has been released. We hope to welcome you another day.' },
  completed: { label: 'Visit completed', title: 'Thank you for visiting.', description: 'This visit is complete. We hope you found something wonderful to read.' },
  no_show: { label: 'Visit missed', title: 'This visit has ended.', description: 'This reservation is no longer active. You’re welcome to book another visit.' },
};

export default function ConfirmationPage() {
  const { id: reference } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialBooking = location.state?.booking?.bookingRef === reference ? location.state.booking : null;
  const [booking, setBooking] = useState(initialBooking);
  const [loading, setLoading] = useState(!initialBooking);
  const [error, setError] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const dialog = useRef(null);
  const heading = useRef(null);
  const cancelButton = useRef(null);
  const token = searchParams.get('token') || initialBooking?.managementToken;

  useEffect(() => {
    if (!loading) heading.current?.focus({ preventScroll: true });
  }, [loading, error, booking?.status]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadPass() {
      try {
        if (!token) throw new Error('Use your booking reference and email to retrieve this pass securely.');
        const response = await fetch('/api/bookings/' + encodeURIComponent(reference), { headers: { 'X-Management-Token': token }, signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'This reservation could not be opened. Please retrieve your pass again.');
        if (!controller.signal.aborted) { setBooking(data); setError(''); }
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof TypeError ? 'We couldn’t connect to the library. Retrieve your pass again when you’re online.' : cause.message);
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void loadPass();
    return () => controller.abort();
  }, [reference, token]);

  useEffect(() => {
    if (showCancel) {
      dialog.current?.showModal();
      dialog.current?.querySelector('#modal-keep-reservation-btn')?.focus();
    }
    else if (dialog.current?.open) dialog.current.close();
  }, [showCancel]);

  const closeCancel = () => {
    if (cancelling) return;
    setShowCancel(false);
    cancelButton.current?.focus();
  };
  const cancelReservation = async (event) => {
    event.preventDefault();
    if (cancelling) return;
    setCancelling(true);
    setCancelError('');
    try {
      const response = await fetch('/api/bookings/' + encodeURIComponent(reference) + '/cancel', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Management-Token': token || booking.managementToken },
        body: JSON.stringify({ reason: reason.trim() || 'Cancelled by visitor online' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Your reservation could not be cancelled. Please try again.');
      dialog.current?.close();
      setBooking((previous) => ({ ...previous, status: 'cancelled', cancelledAt: data.cancelledAt }));
      setShowCancel(false);
    } catch (cause) { setCancelError(cause.message); }
    finally { setCancelling(false); }
  };

  const addToCalendar = () => {
    const stamp = (time) => new Date(booking.visitDate + 'T' + time.slice(0, 5) + ':00+05:30').toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const escape = (text) => String(text).replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll(',', '\\,').replaceAll(';', '\\;');
    const content = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The Library New Delhi//Reservation//EN', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT', 'UID:' + booking.bookingRef + '@library.delhi', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
      'DTSTART:' + stamp(booking.sessionStartTime || '11:00'),
      'DTEND:' + stamp(booking.sessionEndTime || '14:30'),
      'SUMMARY:' + escape('The Library · ' + booking.facilityName),
      'DESCRIPTION:' + escape('Booking reference: ' + booking.bookingRef),
      'LOCATION:' + escape('5A, Ring Road, Lajpat Nagar-IV, New Delhi 110024'), 'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR', '',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'library-reservation-' + booking.bookingRef + '.ics';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const status = STATUS[booking?.status] || STATUS.confirmed;
  const inactive = ['cancelled', 'completed', 'no_show'].includes(booking?.status);
  return (
    <PassPageShell titleId="confirmation-title" className="pass-confirmation-card" quote={inactive ? 'There’s always another chapter.' : 'A place to pause. A world to discover.'} description="Books, culture, and a quiet corner in the heart of New Delhi.">
      {loading ? (
        <div className="pass-loading" role="status" aria-busy="true">
          <h1 id="confirmation-title" className="pass-page-title" tabIndex={-1} data-pass-autofocus>Opening your pass…</h1>
          <div className="pass-skeleton" aria-hidden="true" /><div className="pass-skeleton pass-skeleton-ticket" aria-hidden="true" />
        </div>
      ) : error || !booking ? (
        <div className="pass-error-state">
          <AlertCircle size={32} strokeWidth={1.4} />
          <h1 ref={heading} id="confirmation-title" className="pass-page-title" tabIndex={-1} data-pass-autofocus>Let’s find your pass.</h1>
          <p className="pass-page-description" role="alert">{error || 'This reservation could not be found. Use your booking reference and email to try again.'}</p>
          <div className="pass-error-actions"><Link to="/my-booking" className="pass-button pass-button-primary">Find my reservation <ArrowRight size={16} /></Link><Link to="/book" className="pass-button pass-button-secondary">Book a new visit</Link></div>
        </div>
      ) : (
        <>
          <header className="pass-page-heading">
            <span className={'pass-kicker ' + (inactive ? 'pass-status-muted' : 'pass-success-label')}>{inactive ? <TicketX size={14} /> : <CheckCircle2 size={14} />}{status.label}</span>
            <h1 ref={heading} id="confirmation-title" className="pass-page-title" tabIndex={-1} data-pass-autofocus>{status.title}</h1>
            <p className="pass-page-description">{status.description}</p>
          </header>
          <div className="pass-ticket-region">
            <ReservationPass booking={booking} />
            {!inactive && <div className="pass-visit-note"><Info size={15} /><div><strong>Before you visit</strong>Please arrive 5–10 minutes early with this pass or your booking reference. Bring photo identification or your membership card if requested.</div></div>}
          </div>
          {!inactive && <div className="pass-utility-actions"><button type="button" id="print-pass-btn" className="pass-button pass-button-primary" onClick={() => window.print()}><Printer size={16} />Print pass</button><button type="button" id="add-to-calendar-btn" className="pass-button pass-button-secondary" onClick={addToCalendar}><CalendarPlus size={16} />Add to calendar</button></div>}
          <nav className="pass-secondary-nav pass-confirmation-nav" aria-label="Manage your reservation">
            <Link to="/my-booking" id="my-bookings-btn" className="pass-text-link">My reservations <ArrowRight size={15} /></Link>
            {booking.status === 'confirmed' ? <button ref={cancelButton} type="button" id="cancel-reservation-btn" className="pass-text-link pass-danger-link" onClick={() => { setCancelError(''); setShowCancel(true); }}><Trash2 size={13} />Cancel reservation</button> : <Link to="/book" className="pass-text-link">Book another visit</Link>}
          </nav>
          <dialog ref={dialog} className="pass-cancel-dialog" aria-labelledby="cancel-title" aria-describedby="cancel-description" onCancel={(event) => { event.preventDefault(); closeCancel(); }} onClose={() => setShowCancel(false)}>
            <form onSubmit={cancelReservation}>
              <h2 id="cancel-title">Cancel this visit?</h2>
              <p id="cancel-description">Your reservation for {formatVisitDate(booking.visitDate)} will be cancelled and your seat released for another reader.</p>
              <label htmlFor="cancel-reason">Reason <span className="pass-secondary-note">(optional)</span></label>
              <textarea id="cancel-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={250} placeholder="Let us know if your plans have changed." disabled={cancelling} />
              {cancelError && <div className="pass-message" role="alert"><AlertCircle size={15} /><span>{cancelError}</span></div>}
              <div className="pass-cancel-actions"><button type="button" id="modal-keep-reservation-btn" className="pass-button pass-button-primary" onClick={closeCancel} disabled={cancelling} autoFocus>Keep reservation</button><button type="submit" id="modal-confirm-cancel-btn" className="pass-button pass-button-danger" disabled={cancelling}>{cancelling ? 'Cancelling…' : 'Cancel reservation'}</button></div>
            </form>
          </dialog>
        </>
      )}
    </PassPageShell>
  );
}
