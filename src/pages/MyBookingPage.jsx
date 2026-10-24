import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, AlertCircle, CheckCircle2, QrCode, Calendar, Clock, MapPin } from 'lucide-react';

export default function MyBookingPage() {
  const navigate = useNavigate();
  const [bookingRef, setBookingRef] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundBooking, setFoundBooking] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!bookingRef.trim() || !email.trim()) {
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
          bookingRef: bookingRef.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No matching reservation found.');
      }

      setFoundBooking(data.booking);
    } catch (err) {
      setError(err.message);
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

  return (
    <div className="my-booking-page">
      <header className="wizard-header">
        <div className="container wizard-header-inner">
          <Link to="/" className="wizard-back-home">
            <ArrowLeft className="wizard-icon" />
            <span>Return to Library</span>
          </Link>
          <div className="wizard-header-title">
            <span className="label">RESERVATION RETRIEVAL</span>
          </div>
          <Link to="/book" className="wizard-my-booking-link">
            Book a New Slot
          </Link>
        </div>
      </header>

      <div className="container my-booking-content">
        <div className="lookup-card">
          <div className="lookup-header">
            <span className="label">FIND YOUR BOOKING</span>
            <h1 className="heading-md">Retrieve your reservation pass</h1>
            <p className="lookup-sub">
              Enter your booking reference (e.g. <code>JF-2026-XXXXX</code>) and the email address used during reservation.
            </p>
          </div>

          <form onSubmit={handleLookup} className="lookup-form">
            <div className="form-group">
              <label htmlFor="refInput" className="form-label">
                Booking Reference
              </label>
              <input
                id="refInput"
                type="text"
                className="form-input ref-field"
                placeholder="e.g. JF-2026-X7K9P"
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="emailInput" className="form-label">
                Email Address
              </label>
              <input
                id="emailInput"
                type="email"
                className="form-input"
                placeholder="e.g. yourname@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="field-hint">
                Both credentials must match exactly to verify ownership.
              </span>
            </div>

            {error && (
              <div className="lookup-error-box" role="alert">
                <AlertCircle className="mini-icon" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? (
                <>
                  <div className="loading-spinner small white" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="btn-icon" />
                  <span>Locate Reservation</span>
                </>
              )}
            </button>
          </form>

          {/* Result Card */}
          {foundBooking && (
            <div className="found-booking-card">
              <div className="found-header">
                <CheckCircle2 className="found-icon" />
                <div>
                  <h2 className="found-title">Reservation Located</h2>
                  <span className="found-sub">Status: <strong>{foundBooking.status.toUpperCase()}</strong></span>
                </div>
              </div>

              <div className="found-details">
                <div className="found-row">
                  <span>Reference:</span>
                  <strong>{foundBooking.bookingRef}</strong>
                </div>
                <div className="found-row">
                  <span>Facility:</span>
                  <strong>{foundBooking.facilityName}</strong>
                </div>
                <div className="found-row">
                  <span>Visit Date:</span>
                  <strong>{foundBooking.visitDate}</strong>
                </div>
                <div className="found-row">
                  <span>Session:</span>
                  <strong>{foundBooking.sessionName} ({foundBooking.sessionStartTime} – {foundBooking.sessionEndTime})</strong>
                </div>
                <div className="found-row">
                  <span>Visitor:</span>
                  <strong>{foundBooking.visitorName}</strong>
                </div>
              </div>

              <button
                onClick={handleViewConfirmation}
                className="btn-primary full-width mt-2"
              >
                <span>View Full Pass &amp; QR Code</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
