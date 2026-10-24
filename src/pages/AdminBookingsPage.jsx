import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, CheckCircle2, XCircle, Clock, 
  Eye, RefreshCw, AlertCircle, UserCheck, UserX, X 
} from 'lucide-react';

export default function AdminBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterDate, setFilterDate] = useState(searchParams.get('date') || '');
  const [filterFacility, setFilterFacility] = useState(searchParams.get('facilityId') || '');
  const [filterSession, setFilterSession] = useState(searchParams.get('sessionId') || '');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');

  // Data & State
  const [bookings, setBookings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected reservation for detail modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  // Action status change confirmation
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (filterDate) params.set('date', filterDate);
    if (filterFacility) params.set('facilityId', filterFacility);
    if (filterSession) params.set('sessionId', filterSession);
    if (filterStatus) params.set('status', filterStatus);

    try {
      const res = await fetch(`/api/admin/bookings?${params.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to retrieve bookings.');
      }
      const data = await res.json();
      setBookings(data.bookings);
      setTotalCount(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterDate, filterFacility, filterSession, filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDate('');
    setFilterFacility('');
    setFilterSession('');
    setFilterStatus('');
    setSearchParams({});
  };

  // Inspect detail view
  const handleOpenDetail = async (ref) => {
    setDetailLoading(true);
    setSelectedBooking(null);
    setAuditLogs([]);

    try {
      const res = await fetch(`/api/admin/bookings/${ref}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedBooking(data.booking);
        setAuditLogs(data.auditHistory || []);
      }
    } catch (err) {
      console.error('Failed to load booking details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Execute status change
  const handleStatusChange = async (ref, newStatus) => {
    if (!window.confirm(`Are you sure you want to change status of ${ref} to '${newStatus}'?`)) {
      return;
    }

    setActionInProgress(true);
    try {
      const res = await fetch(`/api/admin/bookings/${ref}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus, reason: `Updated by staff in dashboard` }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      // Refresh both list and detail
      await fetchBookings();
      if (selectedBooking && selectedBooking.bookingRef === ref) {
        await handleOpenDetail(ref);
      }
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <div className="admin-bookings-page">
      <div className="admin-page-header">
        <div>
          <span className="label">RESERVATION RECORDS</span>
          <h1 className="heading-lg">Bookings Management</h1>
        </div>
        <div className="admin-header-actions">
          <button onClick={fetchBookings} className="btn-outline admin-refresh-btn" title="Refresh records">
            <RefreshCw className="admin-mini-icon" />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-form">
          <div className="search-input-wrap">
            <Search className="search-icon" />
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search reference, visitor name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary btn-sm">
            Search
          </button>
        </form>

        <div className="filter-dropdowns-row">
          <div className="filter-group">
            <label className="filter-label">DATE</label>
            <input
              type="date"
              className="filter-select"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">FACILITY</label>
            <select
              className="filter-select"
              value={filterFacility}
              onChange={(e) => setFilterFacility(e.target.value)}
            >
              <option value="">All Spaces</option>
              <option value="reading-room">Reading Room</option>
              <option value="manga-corner">Manga Corner</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">SESSION</label>
            <select
              className="filter-select"
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
            >
              <option value="">All Sessions</option>
              <option value="morning">Morning (11:00 - 14:30)</option>
              <option value="afternoon">Afternoon (15:00 - 18:30)</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">STATUS</label>
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          {(searchTerm || filterDate || filterFacility || filterSession || filterStatus) && (
            <button onClick={clearFilters} className="btn-outline btn-sm filter-clear-btn">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="admin-error-banner">
          <AlertCircle className="mini-icon" />
          <span>{error}</span>
        </div>
      )}

      {/* Bookings Table */}
      <div className="admin-table-card">
        <div className="table-header-meta">
          <span>Found <strong>{totalCount}</strong> reservation records</span>
        </div>

        {loading ? (
          <div className="admin-loading-state">
            <div className="loading-spinner" />
            <p>Loading reservation records...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-panel-state">
            <p>No reservation records match the selected filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Visit Date</th>
                  <th>Facility</th>
                  <th>Session</th>
                  <th>Visitor</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.booking_ref} className={`row-status-${b.status}`}>
                    <td>
                      <code className="booking-ref-code">{b.booking_ref}</code>
                    </td>
                    <td>{b.visit_date}</td>
                    <td>{b.facility_name}</td>
                    <td>{b.session_name}</td>
                    <td><strong>{b.visitor_name}</strong></td>
                    <td className="cell-muted">{b.visitor_email}</td>
                    <td>
                      <span className={`status-pill ${b.status}`}>{b.status}</span>
                    </td>
                    <td className="td-actions">
                      <button
                        onClick={() => handleOpenDetail(b.booking_ref)}
                        className="btn-outline btn-xs"
                        title="View details & audit history"
                      >
                        <Eye className="mini-icon" />
                        <span>Inspect</span>
                      </button>

                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(b.booking_ref, 'checked_in')}
                          className="btn-primary btn-xs"
                          disabled={actionInProgress}
                          title="Check in visitor"
                        >
                          <UserCheck className="mini-icon" />
                          <span>Check In</span>
                        </button>
                      )}

                      {b.status === 'checked_in' && (
                        <button
                          onClick={() => handleStatusChange(b.booking_ref, 'completed')}
                          className="btn-outline btn-xs"
                          disabled={actionInProgress}
                          title="Mark visit completed"
                        >
                          Complete
                        </button>
                      )}

                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(b.booking_ref, 'cancelled')}
                          className="btn-outline btn-xs text-danger"
                          disabled={actionInProgress}
                          title="Cancel reservation"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reservation Detail Modal */}
      {selectedBooking && (
        <div className="booking-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedBooking(null)}>
          <div className="booking-modal admin-detail-modal">
            <div className="booking-modal-header">
              <div>
                <span className="label">RESERVATION INSPECTOR</span>
                <h2 className="heading-md">Pass: {selectedBooking.bookingRef}</h2>
              </div>
              <button className="booking-modal-close" onClick={() => setSelectedBooking(null)}>
                <X className="mini-icon" />
              </button>
            </div>

            <div className="admin-detail-grid">
              <div className="detail-item">
                <span className="detail-label">STATUS</span>
                <span className={`status-pill ${selectedBooking.status}`}>{selectedBooking.status}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">VISIT DATE</span>
                <span className="detail-val">{selectedBooking.visitDate}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">FACILITY</span>
                <span className="detail-val">{selectedBooking.facilityName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">SESSION</span>
                <span className="detail-val">{selectedBooking.sessionName} ({selectedBooking.sessionStartTime} - {selectedBooking.sessionEndTime})</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">VISITOR NAME</span>
                <span className="detail-val">{selectedBooking.visitorName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">VISITOR EMAIL</span>
                <span className="detail-val">{selectedBooking.visitorEmail}</span>
              </div>
              {selectedBooking.membershipNo && (
                <div className="detail-item">
                  <span className="detail-label">MEMBERSHIP NO</span>
                  <span className="detail-val">{selectedBooking.membershipNo}</span>
                </div>
              )}
              {selectedBooking.checkedInAt && (
                <div className="detail-item">
                  <span className="detail-label">CHECKED IN AT</span>
                  <span className="detail-val">
                    {new Date(selectedBooking.checkedInAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    {selectedBooking.checkedInByName ? ` by ${selectedBooking.checkedInByName}` : ''}
                  </span>
                </div>
              )}
              {selectedBooking.cancelledAt && (
                <div className="detail-item">
                  <span className="detail-label">CANCELLED AT</span>
                  <span className="detail-val">
                    {new Date(selectedBooking.cancelledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    {selectedBooking.cancellationReason ? ` (${selectedBooking.cancellationReason})` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Audit History Log */}
            <div className="admin-audit-box">
              <span className="audit-box-title">AUDIT TRAIL &amp; STATE EVENTS</span>
              {auditLogs.length === 0 ? (
                <span className="cell-muted text-sm">No recorded state changes.</span>
              ) : (
                <ul className="audit-list">
                  {auditLogs.map((log) => (
                    <li key={log.id} className="audit-item">
                      <span className="audit-action">{log.action}</span>
                      <span className="audit-meta">
                        by {log.actor_type} ({log.actor_id}) on{' '}
                        {new Date(log.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Actions Toolbar in Modal */}
            <div className="modal-actions-bar">
              {selectedBooking.status === 'confirmed' && (
                <>
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => handleStatusChange(selectedBooking.bookingRef, 'checked_in')}
                    disabled={actionInProgress}
                  >
                    Check In Visitor
                  </button>
                  <button
                    className="btn-outline btn-sm"
                    onClick={() => handleStatusChange(selectedBooking.bookingRef, 'no_show')}
                    disabled={actionInProgress}
                  >
                    Record No-Show
                  </button>
                  <button
                    className="btn-outline btn-sm text-danger"
                    onClick={() => handleStatusChange(selectedBooking.bookingRef, 'cancelled')}
                    disabled={actionInProgress}
                  >
                    Cancel Reservation
                  </button>
                </>
              )}

              {selectedBooking.status === 'checked_in' && (
                <button
                  className="btn-primary btn-sm"
                  onClick={() => handleStatusChange(selectedBooking.bookingRef, 'completed')}
                  disabled={actionInProgress}
                >
                  Mark Visit Completed
                </button>
              )}

              <button className="btn-outline btn-sm ml-auto" onClick={() => setSelectedBooking(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
