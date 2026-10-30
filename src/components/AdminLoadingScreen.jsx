import React, { useState, useEffect } from 'react';
import { BookOpen, ShieldCheck, RefreshCw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminLoadingScreen({
  title = 'Initializing Management Console',
  subtitle = 'Authenticating staff credentials & preparing library records...',
}) {
  const [showSlowNotice, setShowSlowNotice] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Verifying staff credentials...',
    'Loading catalog & circulation services...',
    'Establishing secure library workspace...',
  ];

  useEffect(() => {
    // Cycle through status messages to provide rich feedback
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 1800);

    // If it takes more than 6s, show helpful escape options
    const timer = setTimeout(() => {
      setShowSlowNotice(true);
    }, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="admin-loading-screen" role="status" aria-live="polite">
      {/* Background ambient lighting */}
      <div className="admin-loading-ambient-glow" aria-hidden="true" />

      <div className="admin-loading-card">
        {/* Animated Brand Emblem */}
        <div className="admin-loading-brand-wrap">
          <div className="admin-loading-glow-ring" />
          <div className="admin-loading-spinner-ring" />
          <div className="admin-loading-icon-badge">
            <BookOpen size={26} strokeWidth={2.2} className="admin-loading-book-icon" />
          </div>
        </div>

        {/* Brand Meta */}
        <div className="admin-loading-header">
          <div className="admin-loading-pill">
            <span className="admin-loading-pulse-dot" />
            <span className="admin-loading-org">Sora Library</span>
            <span className="admin-loading-sep">•</span>
            <span className="admin-loading-system">Console</span>
          </div>

          <h2 className="admin-loading-title">{title}</h2>
          <p className="admin-loading-sub">{subtitle}</p>
        </div>

        {/* Indeterminate Shimmer Progress Bar */}
        <div className="admin-loading-progress-track">
          <div className="admin-loading-progress-bar" />
        </div>

        {/* Dynamic Status Text */}
        <div className="admin-loading-status-wrap">
          <p className="admin-loading-status-text">
            {steps[activeStep]}
          </p>
        </div>

        {/* Security & System Trust Badge */}
        <div className="admin-loading-footer">
          <div className="admin-loading-trust-tag">
            <ShieldCheck size={14} className="admin-loading-shield" />
            <span>Secure Staff Workspace</span>
          </div>
        </div>

        {/* Resilient Escape Route for Slow Connections */}
        {showSlowNotice && (
          <div className="admin-loading-fallback-box">
            <p className="fallback-text">Taking longer than expected?</p>
            <div className="fallback-actions">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="fallback-btn fallback-btn-reload"
              >
                <RefreshCw size={13} />
                <span>Reload Page</span>
              </button>
              <Link to="/admin/login" className="fallback-btn fallback-btn-login">
                <span>Sign In Again</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

