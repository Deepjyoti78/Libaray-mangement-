import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, LoaderCircle, Mail, RotateCcw, Search, ShieldCheck, Ticket } from 'lucide-react';
import PassPageShell from '../components/PassPageShell';
import ReservationPass from '../components/ReservationPass';

function savedValue(key) {
  try { return localStorage.getItem(key) || ''; } catch { return ''; }
}

export default function MyBookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingRef, setBookingRef] = useState(() => (location.state?.bookingRef || savedValue('last_booking_ref')).toUpperCase());
  const [email, setEmail] = useState(() => location.state?.email || savedValue('last_booking_email'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundBooking, setFoundBooking] = useState(null);
  const request = useRef(null);
  const resultTitle = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => { if (foundBooking) resultTitle.current?.focus({ preventScroll: true }); }, [foundBooking]);

  const handleLookup = async (event) => {
    event.preventDefault();
    if (loading) return;
    const reference = bookingRef.trim().toUpperCase();
    const address = email.trim().toLowerCase();
    if (!reference || !address) { setError('Enter your booking reference and the email used for your reservation.'); return; }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/my-booking/lookup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ bookingRef: reference, email: address }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'We couldn’t find a matching reservation. Check both details and try again.');
      setFoundBooking(data.booking);
      try { localStorage.setItem('last_booking_ref', reference); localStorage.setItem('last_booking_email', address); } catch { /* Retrieval also works without browser storage. */ }
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof TypeError ? 'We couldn’t connect to the library. Please try again in a moment.' : cause.message);
    } finally { if (!controller.signal.aborted) setLoading(false); }
  };

  const openPass = () => navigate('/booking/confirmation/' + foundBooking.bookingRef + '?token=' + encodeURIComponent(foundBooking.managementToken), { state: { booking: foundBooking } });
  return (
    <PassPageShell titleId="lookup-title" className="pass-lookup-card" quote={foundBooking ? 'Your next chapter awaits.' : 'A little time. A good book.'} description="Your reading room, your favourite stories. We’ll save you a seat.">
      <header className="pass-page-heading">
        <span className={foundBooking ? 'pass-kicker pass-success-label' : 'pass-kicker'}>
          {foundBooking ? <CheckCircle2 size={14} /> : <Ticket size={14} />}{foundBooking ? 'Reservation found' : 'Find your booking'}
        </span>
        <h1 ref={resultTitle} id="lookup-title" className="pass-page-title" tabIndex={-1} data-pass-autofocus>{foundBooking ? 'Here’s your library pass.' : 'Retrieve your pass'}</h1>
        <p className="pass-page-description">{foundBooking ? 'Open your pass to print it or manage your reservation.' : 'Enter your booking reference and email to view your digital pass.'}</p>
      </header>
      {foundBooking ? (
        <div className="pass-found-content">
          <div className="pass-ticket-region"><ReservationPass booking={foundBooking} /></div>
          <button type="button" id="open-full-pass-btn" className="pass-button pass-button-primary" onClick={openPass}>Open full digital pass <ArrowRight size={16} /></button>
          <div className="pass-secondary-nav">
            <button type="button" id="search-another-btn" className="pass-text-link" onClick={() => { setFoundBooking(null); setError(''); }}><RotateCcw size={14} />Find another reservation</button>
            <Link to="/" className="pass-text-link">Return home</Link>
          </div>
        </div>
      ) : (
        <>
          <form className="pass-lookup-form" onSubmit={handleLookup} aria-busy={loading}>
            <fieldset className="pass-fieldset" disabled={loading}>
              <legend className="pass-visually-hidden">Find a reservation</legend>
              <div className="pass-field">
                <label htmlFor="refInput"><Ticket size={15} />Booking reference</label>
                <input id="refInput" className="pass-reference-input" type="text" placeholder="JF-2026-X7K9P" value={bookingRef} onChange={(event) => { setBookingRef(event.target.value.toUpperCase()); setError(''); }} autoComplete="off" autoCapitalize="characters" spellCheck={false} aria-describedby="reference-help" required />
                <span id="reference-help" className="pass-field-help">You’ll find this code in your confirmation email.</span>
              </div>
              <div className="pass-field">
                <label htmlFor="emailInput"><Mail size={15} />Email address</label>
                <input id="emailInput" type="email" placeholder="you@example.com" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} aria-describedby="email-help" required />
                <span id="email-help" className="pass-field-help">Use the same email you booked with.</span>
              </div>
            </fieldset>
            {error && <div className="pass-message" role="alert"><AlertCircle size={16} /><span>{error}</span></div>}
            <div className="pass-lookup-actions">
              <button type="submit" id="locate-reservation-btn" className="pass-button pass-button-primary" disabled={loading}>
                {loading ? <LoaderCircle className="pass-loading-icon" size={17} /> : <Search size={17} />}{loading ? 'Finding your reservation…' : 'Locate reservation'}
              </button>
              <p className="pass-privacy"><ShieldCheck size={14} />Your reference and email are checked together to keep your pass private.</p>
            </div>
          </form>
          <footer className="pass-secondary-nav"><span className="pass-secondary-note">Planning a new visit?</span><Link to="/book" className="pass-text-link">Book a visit <ArrowRight size={15} /></Link></footer>
        </>
      )}
    </PassPageShell>
  );
}
