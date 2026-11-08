import { X } from 'lucide-react';
import '../styles/reservation-card.css';

export default function ReservationCard({ children, cardRef, titleId, label, onClose, quote, description, caption = 'BOOKS · MANGA · PEOPLE · JAPAN', image = '/images/library-reading-area.webp', className = '', panelClassName = '', live }) {
  return (
    <main ref={cardRef} className={`reservation-card ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-label={titleId ? undefined : label}>
      <aside className="booking-photo-panel reservation-photo" aria-label="The Library, New Delhi">
        <div className="photo-panel-bg" style={{ backgroundImage: 'url(' + image + ')' }} />
        <div className="photo-panel-overlay" />
        <div className="photo-panel-content">
          <div className="photo-panel-header">
            <div className="photo-brand-emblem" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6 6h10M6 10h10" /></svg>
            </div>
            <div className="photo-brand-text"><span className="photo-brand-title">The Library</span><span className="photo-brand-subtitle">LIBRARY / NEW DELHI</span></div>
          </div>
          <div className="photo-panel-quote-box">
            <h2 className="photo-quote-heading">{quote}</h2>
            <div className="photo-quote-line" aria-hidden="true" />
            <p className="photo-quote-sub">{description}</p>
          </div>
          <div className="photo-panel-footer"><span className="photo-footer-caption">{caption}</span></div>
        </div>
      </aside>
      <section className={`booking-interactive-panel reservation-panel ${panelClassName}`} aria-live={live}>
        {onClose && <button type="button" className="booking-modal-close-btn reservation-close" onClick={onClose} aria-label="Return to library home" title="Close"><X size={16} strokeWidth={2.25} /></button>}
        {children}
      </section>
    </main>
  );
}
