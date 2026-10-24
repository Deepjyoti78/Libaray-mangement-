import { X, ExternalLink, Calendar, MapPin, Clock } from 'lucide-react';

export default function BookingModal({ onClose }) {
  return (
    <div
      className="booking-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Library slot reservation"
    >
      <div className="booking-modal">
        <div className="booking-modal-header">
          <div>
            <span className="label">RESERVATION</span>
            <h2 className="heading-md modal-title">Book a Slot</h2>
          </div>
          <button
            className="booking-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X />
          </button>
        </div>

        <div className="booking-modal-summary">
          <div className="modal-summary-row">
            <Calendar className="modal-summary-icon" />
            <span>Tuesday – Saturday (Closed Sun &amp; Mon)</span>
          </div>
          <div className="modal-summary-row">
            <Clock className="modal-summary-icon" />
            <span>Sessions: 11:00 AM – 2:30 PM &amp; 3:00 PM – 6:30 PM</span>
          </div>
          <div className="modal-summary-row">
            <MapPin className="modal-summary-icon" />
            <span>5A, Ring Road, Lajpat Nagar-IV, New Delhi</span>
          </div>
        </div>

        <div className="booking-modal-body">
          <p>
            This landing page is an independent student design concept proposing
            a dedicated library interface.
          </p>
          <div className="booking-modal-note">
            In an active system, visitors reserve a reading desk or manga seat
            ahead of peak sessions. To verify official visiting guidelines and
            membership, please consult the Japan Foundation official portal.
          </div>
        </div>

        <div className="modal-actions">
          <a
            href="https://www.jfindia.org.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <span>Visit Official Site</span>
            <ExternalLink className="btn-icon-arrow" />
          </a>
          <button className="btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
