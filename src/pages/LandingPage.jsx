import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import InfoStrip from '../components/InfoStrip';
import EditorialGrid from '../components/EditorialGrid';
import CollectionsStrip from '../components/CollectionsStrip';
import Footer from '../components/Footer';

export default function LandingPage() {
  const navigate = useNavigate();

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

  const handleOpenBooking = () => {
    navigate('/book');
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
    </div>
  );
}
