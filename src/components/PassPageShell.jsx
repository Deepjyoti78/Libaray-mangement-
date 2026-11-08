import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import ReservationCard from './ReservationCard';
import useReservationDialog from '../hooks/useReservationDialog';
import '../styles/pass-pages.css';

export default function PassPageShell({ children, titleId, quote, description, className = '' }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const close = useCallback(() => navigate('/'), [navigate]);
  useReservationDialog(cardRef, close);
  return (
    <div className="pass-page-shell">
      <div className="pass-page-homepage" aria-hidden="true" inert><LandingPage /></div>
      <div className="reservation-overlay" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        <ReservationCard cardRef={cardRef} titleId={titleId} onClose={close} quote={quote} description={description} className={'pass-page-card ' + className} panelClassName="pass-page-content">
          {children}
        </ReservationCard>
      </div>
    </div>
  );
}
