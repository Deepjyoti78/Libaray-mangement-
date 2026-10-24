import { useState, useEffect } from 'react';
import { 
  Settings, Save, Plus, Trash2, Calendar, 
  AlertCircle, CheckCircle2, ShieldAlert, History 
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    daily_booking_limit: 1,
    advance_booking_days: 14,
    cancellation_cutoff_hours: 2,
    opening_days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    require_membership: false,
  });

  const [capacities, setCapacities] = useState([]);
  const [closures, setClosures] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // New closure date form
  const [newClosureDate, setNewClosureDate] = useState('');
  const [newClosureReason, setNewClosureReason] = useState('');
  const [addingClosure, setAddingClosure] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');

    try {
      const [settingsRes, auditRes] = await Promise.all([
        fetch('/api/admin/settings', { credentials: 'include' }),
        fetch('/api/admin/audit', { credentials: 'include' }),
      ]);

      if (!settingsRes.ok) throw new Error('Failed to load settings');
      const data = await settingsRes.json();
      setSettings(data.settings || {});
      setCapacities(data.capacities || []);
      setClosures(data.closures || []);

      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCapacityChange = (facilityId, sessionId, newCap) => {
    setCapacities((prev) =>
      prev.map((c) =>
        c.facility_id === facilityId && c.session_id === sessionId
          ? { ...c, capacity: parseInt(newCap, 10) || 0 }
          : c
      )
    );
  };

  const handleOpeningDayToggle = (day) => {
    const current = settings.opening_days || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setSettings((prev) => ({ ...prev, opening_days: updated }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          settings,
          capacities,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      await fetchSettings();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddClosure = async (e) => {
    e.preventDefault();
    if (!newClosureDate) return;

    setAddingClosure(true);
    setError('');

    try {
      const res = await fetch('/api/admin/settings/closures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          overrideDate: newClosureDate,
          reason: newClosureReason || 'Special Event / Holiday Closure',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add closure date');
      }

      setNewClosureDate('');
      setNewClosureReason('');
      await fetchSettings();
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingClosure(false);
    }
  };

  const handleDeleteClosure = async (id) => {
    if (!window.confirm('Remove this closure override?')) return;

    try {
      const res = await fetch(`/api/admin/settings/closures/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to remove closure override');
      await fetchSettings();
    } catch (err) {
      alert(err.message);
    }
  };

  const allWeekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="loading-spinner" />
        <p>Loading administrative configuration...</p>
      </div>
    );
  }

  return (
    <div className="admin-settings-page">
      <div className="admin-page-header">
        <div>
          <span className="label">ADMINISTRATION</span>
          <h1 className="heading-lg">Capacity &amp; Schedule Settings</h1>
        </div>
        <div className="admin-header-actions">
          <button
            type="submit"
            form="settingsForm"
            className="btn-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="loading-spinner small white" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="btn-icon" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="admin-success-banner">
          <CheckCircle2 className="mini-icon" />
          <span>Configuration saved and transactional rules updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="admin-error-banner">
          <AlertCircle className="mini-icon" />
          <span>{error}</span>
        </div>
      )}

      <form id="settingsForm" onSubmit={handleSaveSettings} className="settings-grid-layout">
        {/* Section 1: Facility Capacities */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="label">CAPACITIES</span>
            <h2 className="heading-sm">Facility Seat Limits</h2>
            <p className="card-subtext">
              Configure maximum simultaneous reservations permitted per session. Enforced atomically via database transactions.
            </p>
          </div>

          <div className="capacities-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Facility Space</th>
                  <th>Session</th>
                  <th>Configured Max Capacity</th>
                </tr>
              </thead>
              <tbody>
                {capacities.map((c) => (
                  <tr key={`${c.facility_id}-${c.session_id}`}>
                    <td><strong>{c.facility_name}</strong></td>
                    <td>{c.session_name}</td>
                    <td>
                      <input
                        type="number"
                        className="form-input cap-input"
                        min="0"
                        max="100"
                        value={c.capacity}
                        onChange={(e) => handleCapacityChange(c.facility_id, c.session_id, e.target.value)}
                        required
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Booking Rules */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="label">RESERVATION RULES</span>
            <h2 className="heading-sm">Booking Policy Limits</h2>
          </div>

          <div className="settings-form-col">
            <div className="form-group">
              <label className="form-label">
                Daily Booking Limit Per Visitor
              </label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="5"
                value={settings.daily_booking_limit || 1}
                onChange={(e) => setSettings({ ...settings, daily_booking_limit: parseInt(e.target.value, 10) })}
                required
              />
              <span className="field-hint">
                Default 1 slot per visitor per calendar day to ensure equitable access.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">
                Maximum Advance Booking Window (Days)
              </label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="60"
                value={settings.advance_booking_days || 14}
                onChange={(e) => setSettings({ ...settings, advance_booking_days: parseInt(e.target.value, 10) })}
                required
              />
              <span className="field-hint">
                Number of days in advance visitors can view and book slots.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">
                Online Cancellation Cutoff Window (Hours)
              </label>
              <input
                type="number"
                className="form-input"
                min="0"
                max="48"
                value={settings.cancellation_cutoff_hours || 2}
                onChange={(e) => setSettings({ ...settings, cancellation_cutoff_hours: parseInt(e.target.value, 10) })}
                required
              />
              <span className="field-hint">
                Minimum hours before session start time that visitors can cancel online.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Operating Days */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="label">WEEKLY SCHEDULE</span>
            <h2 className="heading-sm">Library Opening Days</h2>
            <p className="card-subtext">
              Checked days are open for visitor reservations. Unchecked days are closed automatically.
            </p>
          </div>

          <div className="weekday-selector-grid">
            {allWeekDays.map((day) => {
              const isOpen = (settings.opening_days || []).includes(day);
              return (
                <button
                  type="button"
                  key={day}
                  className={`weekday-toggle-btn ${isOpen ? 'open' : 'closed'}`}
                  onClick={() => handleOpeningDayToggle(day)}
                >
                  <span className="day-name">{day}</span>
                  <span className="day-status">{isOpen ? 'OPEN' : 'CLOSED'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Exceptional Closure Dates */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="label">SCHEDULE OVERRIDES</span>
            <h2 className="heading-sm">Holiday &amp; Event Closures</h2>
            <p className="card-subtext">
              Block bookings on specific dates for gazetted holidays, staff maintenance, or events.
            </p>
          </div>

          <div className="closure-add-form">
            <div className="closure-inputs-row">
              <input
                type="date"
                className="form-input date-input"
                value={newClosureDate}
                onChange={(e) => setNewClosureDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <input
                type="text"
                className="form-input text-input"
                placeholder="Reason (e.g. Diwali Holiday, Staff Workshop)"
                value={newClosureReason}
                onChange={(e) => setNewClosureReason(e.target.value)}
              />
              <button
                type="button"
                className="btn-outline btn-sm"
                onClick={handleAddClosure}
                disabled={addingClosure || !newClosureDate}
              >
                <Plus className="mini-icon" />
                <span>Add Date</span>
              </button>
            </div>
          </div>

          <div className="closures-list-wrap">
            {closures.length === 0 ? (
              <span className="cell-muted text-sm">No exceptional closure dates scheduled.</span>
            ) : (
              <ul className="closures-list">
                {closures.map((c) => (
                  <li key={c.id} className="closure-item">
                    <div className="closure-item-info">
                      <strong>{c.override_date}</strong>
                      <span className="closure-reason">{c.reason}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteClosure(c.id)}
                      className="btn-delete-closure"
                      title="Remove override"
                    >
                      <Trash2 className="mini-icon text-danger" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </form>

      {/* Section 5: Audit Log History */}
      <div className="admin-table-card mt-3">
        <div className="settings-card-header">
          <div className="header-flex">
            <div>
              <span className="label">SECURITY &amp; COMPLIANCE</span>
              <h2 className="heading-sm">System Audit History</h2>
            </div>
            <History className="metric-icon" />
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Timestamp (IST)</th>
                <th>Actor Type</th>
                <th>Actor ID / User</th>
                <th>Action</th>
                <th>Entity Target</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.slice(0, 15).map((log) => (
                <tr key={log.id}>
                  <td className="cell-muted">
                    {new Date(log.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                  <td><span className="actor-badge">{log.actor_type}</span></td>
                  <td>{log.actor_name || log.actor_id}</td>
                  <td><strong>{log.action}</strong></td>
                  <td>{log.entity_type} {log.entity_id ? `(${log.entity_id})` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
