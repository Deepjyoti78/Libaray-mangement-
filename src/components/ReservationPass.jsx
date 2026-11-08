import { useEffect, useRef, useState } from 'react';
import { BookOpen, CalendarDays, Clock, User, Copy, Check, QrCode, TicketX } from 'lucide-react';
import { formatVisitDate } from '../utils/dates';

function formatTime(time) {
  if (!time) return '';
  if (/AM|PM/i.test(time)) return time;
  const [hour, minute = '00'] = time.split(':');
  return `${Number(hour) % 12 || 12}:${minute} ${Number(hour) >= 12 ? 'PM' : 'AM'}`;
}

export default function ReservationPass({ booking }) {
  const [copyState, setCopyState] = useState('');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const inactive = ['cancelled', 'completed', 'no_show'].includes(booking.status);
  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(booking.bookingRef);
      setCopyState('Copied');
    } catch { setCopyState('Select the reference to copy it.'); }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyState(''), 2500);
  };
  return (
    <div className={`reservation-ticket ${inactive ? 'reservation-ticket-inactive' : ''}`}>
      <div className="reservation-ticket-qr">
        <div className="reservation-qr-frame">
          {inactive ? <div className="reservation-qr-placeholder"><TicketX size={42} strokeWidth={1.25} /><span>Pass inactive</span></div>
            : booking.qrCodeDataUrl ? <img src={booking.qrCodeDataUrl} width={160} height={160} alt={`Entry QR code for ${booking.bookingRef}`} />
              : <div className="reservation-qr-placeholder"><QrCode size={42} strokeWidth={1.25} /><span>Use your reference</span></div>}
        </div>
        <span className="reservation-reference-label">Booking reference</span>
        <button type="button" className="reservation-reference" onClick={copyReference} aria-label={`Copy booking reference ${booking.bookingRef}`} title="Copy booking reference">
          <span>{booking.bookingRef}</span>{copyState === 'Copied' ? <Check size={15} /> : <Copy size={15} />}
        </button>
        <span className="reservation-copy-feedback" role="status">{copyState || (inactive ? 'This pass is no longer valid for entry.' : 'Show at reception.')}</span>
      </div>
      <dl className="reservation-details">
        <div><dt><BookOpen size={15} />Facility</dt><dd>{booking.facilityName || booking.facilityId}</dd></div>
        <div><dt><CalendarDays size={15} />Visit date</dt><dd>{formatVisitDate(booking.visitDate)}</dd></div>
        <div><dt><Clock size={15} />Time slot <span className="reservation-timezone">IST</span></dt><dd>{formatTime(booking.sessionStartTime)} – {formatTime(booking.sessionEndTime)}<small>{booking.sessionName}</small></dd></div>
        <div><dt><User size={15} />Visitor</dt><dd>{booking.visitorName}<small className="reservation-email">{booking.visitorEmail}</small></dd></div>
      </dl>
    </div>
  );
}
