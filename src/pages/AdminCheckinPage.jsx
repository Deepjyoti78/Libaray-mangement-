import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, Search, CheckCircle2, AlertCircle, Camera, 
  CameraOff, ArrowRight, UserCheck, ShieldCheck, RefreshCw 
} from 'lucide-react';

export default function AdminCheckinPage() {
  const [searchParams] = useSearchParams();
  const prefillRef = searchParams.get('ref') || '';

  // Mode: 'camera' or 'manual'
  const [activeTab, setActiveTab] = useState(prefillRef ? 'manual' : 'camera');
  const [manualInput, setManualInput] = useState(prefillRef);

  // Scanner state
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);

  // Check-in processing state
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Auto-fill and submit if ref in query params
  useEffect(() => {
    if (prefillRef) {
      setManualInput(prefillRef);
      handleCheckinSubmit(prefillRef);
    }
  }, [prefillRef]);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    setCameraError('');
    setError('');
    setResult(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader-container');
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Play subtle audio beep or haptic vibration if supported
          try {
            if (navigator.vibrate) navigator.vibrate(100);
          } catch {}

          stopScanner();
          await handleCheckinSubmit(decodedText);
        },
        (errorMessage) => {
          // ignore scan frame errors
        }
      );

      setScannerActive(true);
    } catch (err) {
      console.error('Camera start error:', err);
      setCameraError(
        'Could not access camera. Please verify camera permissions or use the manual search tab below.'
      );
      setScannerActive(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerActive) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.error('Error stopping scanner:', e);
      }
      setScannerActive(false);
    }
  };

  const handleCheckinSubmit = async (payloadToSubmit) => {
    const payload = payloadToSubmit || manualInput;
    if (!payload || (typeof payload === 'string' && !payload.trim())) {
      setError('Please provide a booking reference or QR credential.');
      return;
    }

    setProcessing(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/admin/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ payload }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Check-in validation failed.');
      }

      setResult(data);
      setManualInput('');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleCheckinSubmit(manualInput);
  };

  const resetForNextVisitor = () => {
    setResult(null);
    setError('');
    setManualInput('');
    if (activeTab === 'camera') {
      startScanner();
    }
  };

  return (
    <div className="admin-checkin-page">
      <div className="admin-page-header">
        <div>
          <span className="label">RECEPTION DESK</span>
          <h1 className="heading-lg">Visitor Check-in &amp; Verification</h1>
        </div>
        <div className="admin-header-actions">
          <span className="desk-location-tag">Circulation Counter · New Delhi</span>
        </div>
      </div>

      <div className="checkin-container-grid">
        {/* Left Column: Verification Form / Scanner */}
        <div className="checkin-controls-card">
          {/* Tab Selector */}
          <div className="checkin-tabs-bar">
            <button
              className={`checkin-tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('camera');
                setError('');
              }}
            >
              <Camera className="tab-icon" />
              <span>Camera QR Scanner</span>
            </button>
            <button
              className={`checkin-tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
              onClick={() => {
                stopScanner();
                setActiveTab('manual');
                setError('');
              }}
            >
              <Search className="tab-icon" />
              <span>Manual Reference Search</span>
            </button>
          </div>

          {/* Camera Scanner View */}
          {activeTab === 'camera' && (
            <div className="scanner-view-box">
              <div id="qr-reader-container" className="camera-viewport">
                {!scannerActive && (
                  <div className="camera-standby-screen">
                    <QrCode className="scanner-placeholder-icon" />
                    <p className="scanner-instruction">
                      Point camera at visitor's digital or printed QR pass.
                    </p>
                    <button
                      onClick={startScanner}
                      className="btn-primary"
                      disabled={processing}
                    >
                      <Camera className="btn-icon" />
                      <span>Start Camera Scanner</span>
                    </button>
                  </div>
                )}
              </div>

              {scannerActive && (
                <div className="scanner-controls-strip">
                  <span className="scanner-pulse-indicator">
                    <span className="pulse-dot" /> Scanner Active
                  </span>
                  <button onClick={stopScanner} className="btn-outline btn-sm">
                    <CameraOff className="mini-icon" />
                    <span>Stop Camera</span>
                  </button>
                </div>
              )}

              {cameraError && (
                <div className="admin-error-banner mt-2">
                  <AlertCircle className="mini-icon" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>
          )}

          {/* Manual Input Fallback */}
          {activeTab === 'manual' && (
            <div className="manual-input-box">
              <p className="manual-desc">
                If the visitor cannot present a QR code or their screen has glare, enter their unique booking reference.
              </p>

              <form onSubmit={handleManualSubmit} className="manual-form">
                <div className="form-group">
                  <label htmlFor="refInput" className="form-label">
                    Booking Reference
                  </label>
                  <input
                    id="refInput"
                    type="text"
                    className="form-input ref-field"
                    placeholder="e.g. JF-2026-X7K9P"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                    autoFocus
                  />
                  <span className="field-hint">
                    Case-insensitive. Matches format <code>JF-2026-XXXXX</code>.
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn-primary full-width"
                  disabled={processing || !manualInput.trim()}
                >
                  {processing ? (
                    <>
                      <div className="loading-spinner small white" />
                      <span>Verifying pass...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="btn-icon" />
                      <span>Verify &amp; Check In</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {error && (
            <div className="checkin-rejection-banner" role="alert">
              <AlertCircle className="rejection-icon" />
              <div>
                <strong>Check-in Denied:</strong> {error}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Verified Visitor Pass Result */}
        <div className="checkin-result-card">
          <div className="result-header">
            <span className="label">VERIFICATION RESULT</span>
            <h2 className="heading-sm">Circulation Status</h2>
          </div>

          {processing ? (
            <div className="admin-loading-state">
              <div className="loading-spinner" />
              <p>Validating cryptographic credential with database...</p>
            </div>
          ) : result ? (
            <div className="verified-pass-wrap">
              <div className="verified-success-banner">
                <CheckCircle2 className="verified-badge-icon" />
                <div>
                  <h3 className="verified-title">Arrival Verified</h3>
                  <span className="verified-time">
                    Checked in at {new Date(result.checkedInAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </span>
                </div>
              </div>

              <div className="verified-details-grid">
                <div className="verified-item">
                  <span className="detail-label">BOOKING REFERENCE</span>
                  <code className="booking-ref-code large">{result.bookingRef}</code>
                </div>

                <div className="verified-item">
                  <span className="detail-label">VISITOR NAME</span>
                  <span className="detail-val-bold">{result.visitorName}</span>
                </div>

                <div className="verified-item">
                  <span className="detail-label">FACILITY</span>
                  <span className="detail-val-bold">{result.facilityName}</span>
                </div>

                <div className="verified-item">
                  <span className="detail-label">SESSION</span>
                  <span className="detail-val-bold">{result.sessionName} ({result.sessionTime})</span>
                </div>

                <div className="verified-item">
                  <span className="detail-label">VISIT DATE</span>
                  <span className="detail-val">{result.visitDate}</span>
                </div>

                <div className="verified-item">
                  <span className="detail-label">VISITOR EMAIL</span>
                  <span className="detail-val">{result.visitorEmail}</span>
                </div>
              </div>

              <div className="desk-action-confirmation">
                <ShieldCheck className="mini-icon" />
                <span>
                  Capacity state updated. Visitor is authorized for the reading space.
                </span>
              </div>

              <button onClick={resetForNextVisitor} className="btn-primary full-width mt-2">
                <span>Check In Next Visitor</span>
                <ArrowRight className="mini-icon" />
              </button>
            </div>
          ) : (
            <div className="standby-pass-wrap">
              <div className="standby-illustration">
                <UserCheck className="standby-icon" />
              </div>
              <h3 className="standby-title">Awaiting Check-in</h3>
              <p className="standby-sub">
                Scan a visitor's QR code or search their booking reference to verify their reservation and record arrival.
              </p>
              <div className="standby-guidelines">
                <span>✓ Rejects invalid or expired credentials</span>
                <span>✓ Prevents duplicate check-ins</span>
                <span>✓ Automatically logs staff check-in timestamp</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
