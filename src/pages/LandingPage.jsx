import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import InfoStrip from '../components/InfoStrip';
import EditorialGrid from '../components/EditorialGrid';
import CollectionsStrip from '../components/CollectionsStrip';
import Footer from '../components/Footer';
import BookingWizard from './BookingWizard';

export default function LandingPage({ initialBookingOpen = false }) {
  const location = useLocation();
  const [isBookingOpen, setIsBookingOpen] = useState(
    initialBookingOpen || location.pathname === '/book'
  );

  /* Ensure public site always renders in pristine Japanese washi paper palette */
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.setAttribute('data-theme', 'light');
    root.classList.remove('dark', 'black-theme');
    body.classList.remove('dark-theme', 'black-theme');
  }, []);

  /* Scroll reveal observer */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    const els = document.querySelectorAll('.reveal');
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Sync state if route is /book
  useEffect(() => {
    if (location.pathname === '/book') {
      setIsBookingOpen(true);
    }
  }, [location.pathname]);

  const handleOpenBooking = () => {
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    if (window.location.pathname === '/book') {
      window.history.pushState(null, '', '/');
    }
  };

  return (
    <div className="site-wrapper">
      <Header onBookSlot={handleOpenBooking} />
      <main id="main-content">
        <HeroSection onBookSlot={handleOpenBooking} />
        <InfoStrip />
        <EditorialGrid onBookSlot={handleOpenBooking} />
        <CollectionsStrip onBookSlot={handleOpenBooking} />
      </main>
      <Footer />

      {/* Booking Pop-up Modal */}
      {isBookingOpen && (
        <BookingWizard isModal={true} onClose={handleCloseBooking} />
      )}
    </div>
  );
}
