import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function PageLoadingScreen({
  message,
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [showSlowNotice, setShowSlowNotice] = useState(false);

  const steps = [
    'Preparing your reading space...',
    'Curating the library collection...',
    'Arranging quiet corners...',
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2200);

    const slowTimer = setTimeout(() => {
      setShowSlowNotice(true);
    }, 7000);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(slowTimer);
    };
  }, [steps.length]);

  return (
    <div
      className="page-loading-screen"
      role="status"
      aria-live="polite"
      aria-label="Loading library page"
    >
      <div className="page-loading-ambient" aria-hidden="true" />

      <div className="page-loading-card">
        {/* Animated Brand Emblem */}
        <div className="page-loading-emblem-wrap">
          <div className="page-loading-glow-ring" />
          <div className="page-loading-spinner-ring" />
          <div className="page-loading-icon-badge">
            <svg
              width="26"
              height="23"
              viewBox="0 0 28 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="page-loading-book-svg"
            >
              <path d="M2 4.5C6 3.5 10 4.5 14 6.5C18 4.5 22 3.5 26 4.5V19.5C22 18.5 18 19.5 14 21.5C10 19.5 6 18.5 2 19.5V4.5Z" />
              <path d="M14 6.5V21.5" />
              <path d="M5.5 7.8C8 7.2 10.8 7.6 13 8.8" opacity="0.6" strokeWidth="1.2" />
              <path d="M22.5 7.8C20 7.2 17.2 7.6 15 8.8" opacity="0.6" strokeWidth="1.2" />
            </svg>
          </div>
        </div>

        {/* Brand Meta */}
        <div className="page-loading-meta">
          <span className="page-loading-kanji">読書 · マンガ · 人 · 日本</span>
          <h2 className="page-loading-title">The Library</h2>
          <span className="page-loading-sub">LIBRARY / NEW DELHI</span>
        </div>

        {/* Shimmer Progress Beam */}
        <div className="page-loading-bar-wrap" aria-hidden="true">
          <div className="page-loading-bar-sweep" />
        </div>

        {/* Dynamic Status Text */}
        <p className="page-loading-status-text">
          {message || steps[activeStep]}
        </p>

        {/* Slow connection recovery */}
        {showSlowNotice && (
          <div className="page-loading-fallback">
            <span className="page-loading-fallback-text">Taking a moment?</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="page-loading-reload-btn"
            >
              <RefreshCw size={12} />
              <span>Refresh Page</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
