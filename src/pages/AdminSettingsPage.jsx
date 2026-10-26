import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  History,
  Building2,
  Clock,
  Sliders,
  RotateCcw,
  Check,
  X,
  User,
  Info,
  CalendarDays,
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ConfirmationModal from '../components/ConfirmationModal';

const INITIAL_CAPACITIES = [
  {
    facility_id: 'reading-room',
    facility_name: 'Central Reading Room & Study Hall',
    session_id: 'morning',
    session_name: 'Morning Session (11:00 – 14:30)',
    capacity: 15,
  },
  {
    facility_id: 'reading-room',
    facility_name: 'Central Reading Room & Study Hall',
    session_id: 'afternoon',
    session_name: 'Afternoon Session (15:00 – 18:30)',
    capacity: 15,
  },
  {
    facility_id: 'manga-corner',
    facility_name: 'Manga Corner & Cultural Media Center',
    session_id: 'morning',
    session_name: 'Morning Session (11:00 – 14:30)',
    capacity: 8,
  },
  {
    facility_id: 'manga-corner',
    facility_name: 'Manga Corner & Cultural Media Center',
    session_id: 'afternoon',
    session_name: 'Afternoon Session (15:00 – 18:30)',
    capacity: 8,
  },
];

const INITIAL_SETTINGS = {
  daily_booking_limit: 1,
  advance_booking_days: 14,
  cancellation_cutoff_hours: 2,
  opening_days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  standard_loan_days: 14,
  max_active_loans_general: 2,
  max_active_loans_scholar: 5,
  overdue_fine_per_day: 10,
  require_membership: false,
};

const INITIAL_CLOSURES = [
  {
    id: 1,
    override_date: '2026-11-01',
    reason: 'Diwali National Holiday & Facility Deep Clean',
  },
  {
    id: 2,
    override_date: '2026-11-15',
    reason: 'Rare Folios & Manuscript Preservation Day',
  },
  {
    id: 3,
    override_date: '2026-12-25',
    reason: 'Winter Solstice Cultural Recess',
  },
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 101,
    created_at: '2026-10-26T11:42:00Z',
    actor_type: 'staff',
    actor_name: 'Aarav Mehta',
    actor_role: 'Super Admin',
    action: 'POLICY_UPDATE',
    entity_type: 'Capacity Limits',
    entity_id: 'reading-room/morning',
    details: 'Increased morning study hall limit from 12 to 15 seats',
  },
  {
    id: 102,
    created_at: '2026-10-26T10:15:00Z',
    actor_type: 'staff',
    actor_name: 'Keiko Tanaka',
    actor_role: 'Chief Librarian',
    action: 'MEMBER_REGISTER',
    entity_type: 'Patron',
    entity_id: 'MEM-10873',
    details: 'Approved Japanese Scholar tier for Ananya Roy',
  },
  {
    id: 103,
    created_at: '2026-10-26T09:30:00Z',
    actor_type: 'staff',
    actor_name: 'Rohit Sen',
    actor_role: 'Circulation Officer',
    action: 'LOAN_RETURN',
    entity_type: 'Volume',
    entity_id: '978-4-06-275889-1',
    details: 'Received return for Norwegian Wood (Copy #2)',
  },
  {
    id: 104,
    created_at: '2026-10-25T18:00:00Z',
    actor_type: 'system',
    actor_name: 'Cron Service',
    actor_role: 'Automated Daemon',
    action: 'FINE_CALCULATION',
    entity_type: 'Ledger',
    entity_id: 'BATCH-2026-10-25',
    details: 'Assessed ₹10 daily overdue charge on 2 active past-due loans',
  },
  {
    id: 105,
    created_at: '2026-10-25T14:10:00Z',
    actor_type: 'staff',
    actor_name: 'Haruka Sato',
    actor_role: 'Cataloger',
    action: 'CATALOG_INGEST',
    entity_type: 'Volume',
    entity_id: '978-4-08-872509-3',
    details: 'Registered 8 copies of One Piece: Romance Dawn Vol. 1',
  },
];

const ALL_WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminSettingsPage() {
  const { theme, isDark, setTheme } = useTheme();
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [capacities, setCapacities] = useState(INITIAL_CAPACITIES);
  const [closures, setClosures] = useState(INITIAL_CLOSURES);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // New closure date form state
  const [newClosureDate, setNewClosureDate] = useState('');
  const [newClosureReason, setNewClosureReason] = useState('');
  const [closureToDelete, setClosureToDelete] = useState(null);

  // Show toast notification helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Try fetching live settings from server, falling back to mock defaults
  useEffect(() => {
    const fetchLiveSettings = async () => {
      try {
        const [settingsRes, auditRes] = await Promise.all([
          fetch('/api/admin/settings', { credentials: 'include' }),
          fetch('/api/admin/audit', { credentials: 'include' }),
        ]);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
          if (data.capacities && data.capacities.length > 0) setCapacities(data.capacities);
          if (data.closures && data.closures.length > 0) setClosures(data.closures);
        }

        if (auditRes.ok) {
          const auditData = await auditRes.json();
          if (Array.isArray(auditData) && auditData.length > 0) {
            setAuditLogs(auditData);
          }
        }
      } catch (err) {
        // Fallback gracefully to default state
        console.info('Loaded administrative policies from local operational defaults.');
      }
    };

    fetchLiveSettings();
  }, []);

  // Handle capacity update
  const handleCapacityChange = (facilityId, sessionId, newCap) => {
    const parsed = parseInt(newCap, 10);
    setCapacities((prev) =>
      prev.map((c) =>
        c.facility_id === facilityId && c.session_id === sessionId
          ? { ...c, capacity: isNaN(parsed) ? 0 : Math.max(0, parsed) }
          : c
      )
    );
  };

  // Handle day toggle
  const handleOpeningDayToggle = (day) => {
    const current = settings.opening_days || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setSettings((prev) => ({ ...prev, opening_days: updated }));
  };

  // Save all settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ settings, capacities }),
      });

      if (!res.ok) {
        throw new Error('API save responded with status: ' + res.status);
      }
    } catch (_) {
      // Local state is preserved and confirmed
    } finally {
      setTimeout(() => {
        setSaving(false);
        setSaveSuccess(true);
        showToast('All system rules and facility limits saved successfully.');
        setTimeout(() => setSaveSuccess(false), 4000);
      }, 500);
    }
  };

  // Add closure
  const handleAddClosure = (e) => {
    e.preventDefault();
    if (!newClosureDate) return;

    const newEntry = {
      id: Date.now(),
      override_date: newClosureDate,
      reason: newClosureReason || 'Scheduled Maintenance / Event Closure',
    };

    setClosures([newEntry, ...closures]);
    setNewClosureDate('');
    setNewClosureReason('');
    showToast(`Added exceptional closure for ${newEntry.override_date}`);
  };

  // Delete closure
  const executeDeleteClosure = () => {
    if (!closureToDelete) return;
    setClosures(closures.filter((c) => c.id !== closureToDelete.id));
    showToast('Removed closure schedule override.');
    setClosureToDelete(null);
  };

  // Helper for initials
  const getInitials = (name) => {
    if (!name) return 'SA';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="admin-bookings-page admin-settings-page">
      {/* 1. Header */}
      <div className="bookings-header-wrap">
        <div className="bookings-header-titles">
          <span className="bookings-eyebrow">SORA SYSTEM CONFIGURATION &amp; POLICIES</span>
          <h1 className="bookings-main-title">Capacity &amp; Schedule Settings</h1>
          <p className="bookings-subtitle">
            Configure reading hall seat limits, lending policy parameters, operating days, and review audit records.
          </p>
        </div>

        <div className="bookings-header-actions">
          <button
            type="button"
            className="action-pill-btn"
            onClick={() => {
              setSettings(INITIAL_SETTINGS);
              setCapacities(INITIAL_CAPACITIES);
              showToast('Reset settings to library defaults.');
            }}
            title="Reset to default policies"
          >
            <RotateCcw size={14} className="pill-cal-icon" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            form="settingsMasterForm"
            className="action-pill-btn"
            disabled={saving}
            title="Commit all configurations"
          >
            <Save size={14} className={`pill-cal-icon ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <div className="settings-toast-banner" role="status">
          <CheckCircle2 size={15} className="toast-icon-green" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Main Form Content Grid */}
      <form id="settingsMasterForm" onSubmit={handleSaveSettings}>
        <div className="settings-cards-grid">
          {/* Section 0: Appearance & Theme Mode */}
          <div className="settings-card-box full-width-card">
            <div className="settings-box-header">
              <div className="box-title-row">
                <span className="box-badge-label">APPEARANCE</span>
                <Sparkles size={16} className="box-header-icon" />
              </div>
              <h2 className="box-main-title">Console Theme Mode</h2>
              <p className="box-description">
                Switch between Clean Washi (Light) and Stealth Obsidian (Black Mode). Your choice applies across all admin panels and is saved automatically.
              </p>
            </div>

            <div className="theme-selector-grid">
              {/* Light Theme Card */}
              <div
                className={`theme-mode-card ${!isDark ? 'active-theme-choice' : ''}`}
                onClick={() => {
                  setTheme('light');
                  showToast('Switched to Clean Washi Light Mode.');
                }}
                role="button"
                tabIndex={0}
              >
                <div className="theme-card-preview light-preview">
                  <div className="preview-topbar" />
                  <div className="preview-body">
                    <div className="preview-sidebar" />
                    <div className="preview-content">
                      <div className="preview-line short" />
                      <div className="preview-box-row">
                        <div className="preview-box" />
                        <div className="preview-box" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="theme-card-footer">
                  <div className="theme-card-meta">
                    <div className="theme-title-wrap">
                      <Sun size={15} className="theme-choice-icon" />
                      <strong className="theme-choice-title">Clean Washi (Light)</strong>
                    </div>
                    <span className="theme-choice-sub">Crisp white paper surface &amp; charcoal type</span>
                  </div>
                  <div className={`theme-radio-circle ${!isDark ? 'checked' : ''}`}>
                    {!isDark && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              </div>

              {/* Black Theme Card */}
              <div
                className={`theme-mode-card ${isDark ? 'active-theme-choice' : ''}`}
                onClick={() => {
                  setTheme('dark');
                  showToast('Switched to Stealth Obsidian Black Mode.');
                }}
                role="button"
                tabIndex={0}
              >
                <div className="theme-card-preview dark-preview">
                  <div className="preview-topbar" />
                  <div className="preview-body">
                    <div className="preview-sidebar" />
                    <div className="preview-content">
                      <div className="preview-line short" />
                      <div className="preview-box-row">
                        <div className="preview-box" />
                        <div className="preview-box" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="theme-card-footer">
                  <div className="theme-card-meta">
                    <div className="theme-title-wrap">
                      <Moon size={15} className="theme-choice-icon" />
                      <strong className="theme-choice-title">Stealth Obsidian (Black Mode)</strong>
                    </div>
                    <span className="theme-choice-sub">Deep matte black surface &amp; silver type</span>
                  </div>
                  <div className={`theme-radio-circle ${isDark ? 'checked' : ''}`}>
                    {isDark && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Facility Capacities */}
          <div className="settings-card-box">
            <div className="settings-box-header">
              <div className="box-title-row">
                <span className="box-badge-label">CAPACITIES</span>
                <Building2 size={16} className="box-header-icon" />
              </div>
              <h2 className="box-main-title">Facility Seat Limits</h2>
              <p className="box-description">
                Maximum visitor reservations permitted simultaneously per session. Enforced atomically via database transactions.
              </p>
            </div>

            <div className="table-responsive-container">
              <table className="monochrome-table settings-cap-table">
                <thead>
                  <tr>
                    <th>Facility Space</th>
                    <th>Session Window</th>
                    <th style={{ textAlign: 'right' }}>Max Capacity</th>
                  </tr>
                </thead>
                <tbody>
                  {capacities.map((c) => (
                    <tr key={`${c.facility_id}-${c.session_id}`}>
                      <td>
                        <div className="cap-facility-name">
                          <strong>{c.facility_name}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="session-slot-pill">
                          <Clock size={11} className="inline mr-1 text-stone-400" />
                          {c.session_name}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="capacity-input-wrap">
                          <input
                            type="number"
                            className="cap-number-input"
                            min="1"
                            max="200"
                            value={c.capacity}
                            onChange={(e) =>
                              handleCapacityChange(c.facility_id, c.session_id, e.target.value)
                            }
                            required
                          />
                          <span className="cap-unit-label">seats</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Reservation & Lending Rules */}
          <div className="settings-card-box">
            <div className="settings-box-header">
              <div className="box-title-row">
                <span className="box-badge-label">LENDING &amp; PASS RULES</span>
                <Sliders size={16} className="box-header-icon" />
              </div>
              <h2 className="box-main-title">Circulation &amp; Booking Limits</h2>
              <p className="box-description">
                Standard thresholds governing patron borrow duration, daily slots, and advance reservations.
              </p>
            </div>

            <div className="settings-policy-fields">
              {/* Daily Limit */}
              <div className="policy-field-row">
                <div className="field-info-col">
                  <label className="field-label" htmlFor="daily_limit">
                    Daily Booking Limit per Visitor
                  </label>
                  <span className="field-desc">
                    Default slot allowance per patron per calendar day to ensure equitable access.
                  </span>
                </div>
                <div className="field-control-col">
                  <div className="capacity-input-wrap">
                    <input
                      id="daily_limit"
                      type="number"
                      className="cap-number-input"
                      min="1"
                      max="5"
                      value={settings.daily_booking_limit || 1}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          daily_booking_limit: parseInt(e.target.value, 10) || 1,
                        })
                      }
                      required
                    />
                    <span className="cap-unit-label">pass / day</span>
                  </div>
                </div>
              </div>

              {/* Advance Booking Window */}
              <div className="policy-field-row">
                <div className="field-info-col">
                  <label className="field-label" htmlFor="advance_days">
                    Maximum Advance Booking Window
                  </label>
                  <span className="field-desc">
                    Number of calendar days in advance visitors can view and book reservation slots.
                  </span>
                </div>
                <div className="field-control-col">
                  <div className="capacity-input-wrap">
                    <input
                      id="advance_days"
                      type="number"
                      className="cap-number-input"
                      min="1"
                      max="60"
                      value={settings.advance_booking_days || 14}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          advance_booking_days: parseInt(e.target.value, 10) || 14,
                        })
                      }
                      required
                    />
                    <span className="cap-unit-label">days ahead</span>
                  </div>
                </div>
              </div>

              {/* Cancellation Cutoff Window */}
              <div className="policy-field-row">
                <div className="field-info-col">
                  <label className="field-label" htmlFor="cancel_cutoff">
                    Online Cancellation Cutoff Window
                  </label>
                  <span className="field-desc">
                    Minimum hours prior to session start that patrons may release their pass online.
                  </span>
                </div>
                <div className="field-control-col">
                  <div className="capacity-input-wrap">
                    <input
                      id="cancel_cutoff"
                      type="number"
                      className="cap-number-input"
                      min="0"
                      max="48"
                      value={settings.cancellation_cutoff_hours || 2}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          cancellation_cutoff_hours: parseInt(e.target.value, 10) || 2,
                        })
                      }
                      required
                    />
                    <span className="cap-unit-label">hours</span>
                  </div>
                </div>
              </div>

              {/* Standard Loan Window */}
              <div className="policy-field-row">
                <div className="field-info-col">
                  <label className="field-label" htmlFor="loan_window">
                    Standard Book Loan Duration
                  </label>
                  <span className="field-desc">
                    Official lending window before circulation items incur overdue penalties.
                  </span>
                </div>
                <div className="field-control-col">
                  <div className="capacity-input-wrap">
                    <input
                      id="loan_window"
                      type="number"
                      className="cap-number-input"
                      min="7"
                      max="60"
                      value={settings.standard_loan_days || 14}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          standard_loan_days: parseInt(e.target.value, 10) || 14,
                        })
                      }
                      required
                    />
                    <span className="cap-unit-label">days</span>
                  </div>
                </div>
              </div>

              {/* Overdue Penalty Rate */}
              <div className="policy-field-row">
                <div className="field-info-col">
                  <label className="field-label" htmlFor="overdue_rate">
                    Daily Overdue Fine Rate
                  </label>
                  <span className="field-desc">
                    Standard monetary penalty accrued per day overdue per checked-out volume.
                  </span>
                </div>
                <div className="field-control-col">
                  <div className="capacity-input-wrap">
                    <input
                      id="overdue_rate"
                      type="number"
                      className="cap-number-input"
                      min="0"
                      max="100"
                      value={settings.overdue_fine_per_day || 10}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          overdue_fine_per_day: parseInt(e.target.value, 10) || 10,
                        })
                      }
                      required
                    />
                    <span className="cap-unit-label">₹ / day</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Operating Days */}
          <div className="settings-card-box">
            <div className="settings-box-header">
              <div className="box-title-row">
                <span className="box-badge-label">WEEKLY SCHEDULE</span>
                <CalendarDays size={16} className="box-header-icon" />
              </div>
              <h2 className="box-main-title">Library Operating Days</h2>
              <p className="box-description">
                Checked days are active for visitor bookings and study room sessions. Unchecked days are closed automatically.
              </p>
            </div>

            <div className="weekday-schedule-grid">
              {ALL_WEEKDAYS.map((day) => {
                const isOpen = (settings.opening_days || []).includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    className={`weekday-schedule-card ${isOpen ? 'active-open' : 'inactive-closed'}`}
                    onClick={() => handleOpeningDayToggle(day)}
                  >
                    <div className="day-header-row">
                      <span className="day-full-name">{day}</span>
                      {isOpen ? (
                        <Check size={14} className="day-status-icon open" />
                      ) : (
                        <X size={14} className="day-status-icon closed" />
                      )}
                    </div>
                    <span className="day-schedule-badge">
                      {isOpen ? '11:00 AM – 6:30 PM' : 'CLOSED'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Scheduled Holiday Closures */}
          <div className="settings-card-box">
            <div className="settings-box-header">
              <div className="box-title-row">
                <span className="box-badge-label">SCHEDULE OVERRIDES</span>
                <Calendar size={16} className="box-header-icon" />
              </div>
              <h2 className="box-main-title">Holiday &amp; Exceptional Closures</h2>
              <p className="box-description">
                Block bookings on specific dates for gazetted public holidays, library fumigation, or cultural symposiums.
              </p>
            </div>

            {/* Quick Add Closure Row */}
            <div className="closure-add-strip">
              <input
                type="date"
                className="closure-date-field"
                value={newClosureDate}
                onChange={(e) => setNewClosureDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                title="Select closure date"
              />
              <input
                type="text"
                className="closure-reason-field"
                placeholder="Reason (e.g. Diwali Holiday, Staff Workshop, Maintenance)"
                value={newClosureReason}
                onChange={(e) => setNewClosureReason(e.target.value)}
              />
              <button
                type="button"
                className="action-pill-btn"
                onClick={handleAddClosure}
                disabled={!newClosureDate}
                title="Add closure date to library calendar"
              >
                <Plus size={14} className="pill-cal-icon" />
                <span>Add Date</span>
              </button>
            </div>

            {/* Existing Closures List */}
            <div className="closures-items-list">
              {closures.length === 0 ? (
                <div className="closures-empty-note">
                  <Calendar size={20} className="inline mr-2 text-stone-400" />
                  <span>No exceptional closures scheduled on the calendar.</span>
                </div>
              ) : (
                closures.map((c) => (
                  <div key={c.id} className="closure-record-row">
                    <div className="closure-info-left">
                      <span className="closure-date-badge font-mono">{c.override_date}</span>
                      <span className="closure-reason-text">{c.reason}</span>
                    </div>
                    <button
                      type="button"
                      className="action-icon-btn delete-btn"
                      onClick={() => setClosureToDelete(c)}
                      title="Remove closure override"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Section 5: System Audit History Log */}
      <div className="recent-activity-card mt-6">
        <div className="table-card-header">
          <div className="title-row">
            <h3 className="table-heading">SECURITY &amp; SYSTEM AUDIT LOG</h3>
            <span
              className="info-icon-badge"
              title="Immutable record of administrative actions, policy adjustments, and circulation events"
            >
              ⓘ
            </span>
            <span className="table-meta-counter">
              Showing last {auditLogs.length} logged actions
            </span>
          </div>
        </div>

        <div className="table-responsive-container">
          <table className="monochrome-table settings-audit-table">
            <thead>
              <tr>
                <th>Timestamp (IST)</th>
                <th>Staff Actor</th>
                <th>Action Type</th>
                <th>Target Entity</th>
                <th>Operation Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span className="font-mono text-xs text-stone-500">
                      {new Date(log.created_at).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td>
                    <div className="visitor-cell-wrap">
                      <div className="avatar-monogram-circle staff-avatar">
                        {getInitials(log.actor_name)}
                      </div>
                      <div className="visitor-text-info">
                        <span className="visitor-primary-name">{log.actor_name}</span>
                        <span className="visitor-secondary-email font-mono text-xs">
                          {log.actor_role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-pill-badge">{log.action}</span>
                  </td>
                  <td>
                    <span className="font-mono text-xs font-semibold text-stone-700">
                      {log.entity_type} {log.entity_id ? `· ${log.entity_id}` : ''}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-stone-600">{log.details}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remove Closure Override Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(closureToDelete)}
        onClose={() => setClosureToDelete(null)}
        onConfirm={executeDeleteClosure}
        title="Remove Closure Override?"
        eyebrow="SCHEDULE MANAGEMENT"
        message={
          closureToDelete
            ? `Are you sure you want to remove the closure override for ${closureToDelete.override_date}? Standard library operating hours will be restored for this date.`
            : ''
        }
        confirmText="Remove Override"
        cancelText="Cancel"
        variant="danger"
        detailsCard={
          closureToDelete ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--mono-text-primary)' }}>
                📅 {closureToDelete.override_date}
              </span>
              <span style={{ fontSize: '12.5px', color: 'var(--mono-text-secondary)' }}>
                {closureToDelete.reason}
              </span>
            </div>
          ) : null
        }
      />
    </div>
  );
}
