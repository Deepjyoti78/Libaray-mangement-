import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  Download,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  CalendarDays,
  Eye,
  MoreHorizontal,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Building2,
  ShieldCheck,
  User,
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import TablePagination from '../components/TablePagination';

export default function AdminBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from URL or default
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterDate, setFilterDate] = useState(searchParams.get('date') || '');
  const [filterFacility, setFilterFacility] = useState(searchParams.get('facilityId') || '');
  const [filterSession, setFilterSession] = useState(searchParams.get('sessionId') || '');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');

  // Pagination & Display
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Data & State
  const [bookings, setBookings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total_bookings: 0,
    expected_count: 0,
    checked_in_count: 0,
    completed_count: 0,
    cancelled_count: 0,
    no_show_count: 0,
  });

  // Fetch summary stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/admin/stats`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          setStats(data.summary);
        }
      }
    } catch {
      // stats fallback
    }
  };

  // Selection
  const [selectedRefs, setSelectedRefs] = useState(new Set());
  const [activeMenuRef, setActiveMenuRef] = useState(null);

  // Detail Inspector Modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  // Toast & Copy State
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedRef, setCopiedRef] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Pop-up Permission & Confirmation States
  const [cancelTarget, setCancelTarget] = useState(null);
  const [bulkActionTarget, setBulkActionTarget] = useState(null);

  const menuContainerRef = useRef(null);

  // Show temporary toast message
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Close active row menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.row-action-popover') && !e.target.closest('.btn-action-icon')) {
        setActiveMenuRef(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch reservation records
  const fetchBookings = async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (filterDate) params.set('date', filterDate);
    if (filterFacility) params.set('facilityId', filterFacility);
    if (filterSession) params.set('sessionId', filterSession);
    if (filterStatus) params.set('status', filterStatus);

    // Fetch generous page batch for smooth client pagination & responsive filtering
    params.set('limit', '100');
    params.set('offset', '0');

    try {
      const res = await fetch(`/api/admin/bookings?${params.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to retrieve bookings.');
      }
      const data = await res.json();
      setBookings(data.bookings || []);
      setTotalCount(data.total || (data.bookings || []).length);
    } catch (err) {
      setError(err.message || 'Error fetching reservations.');
    } finally {
      setLoading(false);
    }
  };

  // Synchronize on filter updates
  useEffect(() => {
    fetchBookings();
    fetchStats();
    setCurrentPage(1);
    setSelectedRefs(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDate, filterFacility, filterSession, filterStatus]);

  // Client-side search submission or debounce
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  // Reset all active filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterDate('');
    setFilterFacility('');
    setFilterSession('');
    setFilterStatus('');
    setSearchParams({});
    setCurrentPage(1);
    showToast('Filters reset to default.');
  };

  const isFiltered = Boolean(searchTerm || filterDate || filterFacility || filterSession || filterStatus);

  // Copy reference code with feedback
  const handleCopyRef = (ref, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    showToast(`Copied reference ${ref} to clipboard`);
    setTimeout(() => {
      setCopiedRef((curr) => (curr === ref ? null : curr));
    }, 2000);
  };

  // Open detail inspector modal
  const handleOpenDetail = async (ref) => {
    setActiveMenuRef(null);
    setSelectedBooking(null);
    setAuditLogs([]);

    try {
      const res = await fetch(`/api/admin/bookings/${ref}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSelectedBooking(data.booking);
        setAuditLogs(data.auditHistory || []);
      } else {
        showToast(`Could not load details for pass ${ref}.`);
      }
    } catch (err) {
      console.error('Failed to load booking details:', err);
      showToast(`Error retrieving details: ${err.message}`);
    }
  };

  // Request cancel reservation popup
  const requestCancelBooking = (ref) => {
    setActiveMenuRef(null);
    const bObj = bookings.find((item) => item.booking_ref === ref) || (selectedBooking?.bookingRef === ref ? {
      booking_ref: ref,
      full_name: selectedBooking.fullName,
      visit_date: selectedBooking.visitDate,
      session_time: selectedBooking.sessionTime,
      reading_room: selectedBooking.readingRoom,
    } : null);

    setCancelTarget({
      ref,
      booking: bObj,
    });
  };

  // Perform confirmed cancellation
  const executeCancellation = async () => {
    if (!cancelTarget) return;
    const { ref } = cancelTarget;
    setCancelTarget(null);
    await handleStatusChange(ref, 'cancelled', undefined, true);
  };

  // Update reservation status
  const handleStatusChange = async (ref, newStatus, reasonText, isConfirmed = false) => {
    setActiveMenuRef(null);

    if (newStatus === 'cancelled' && !isConfirmed) {
      requestCancelBooking(ref);
      return;
    }

    setActionInProgress(true);
    try {
      const res = await fetch(`/api/admin/bookings/${ref}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          reason: reasonText || `Updated to ${newStatus} by staff in management console`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status.');
      }

      showToast(`Reservation ${ref} marked as ${newStatus.replace('_', ' ')}.`);

      await fetchBookings();
      await fetchStats();

      if (selectedBooking && selectedBooking.bookingRef === ref) {
        await handleOpenDetail(ref);
      }
    } catch (err) {
      showToast(`Action error: ${err.message}`);
    } finally {
      setActionInProgress(false);
    }
  };

  // Bulk Check-In with confirmation modal
  const handleBulkCheckIn = () => {
    const toCheckIn = bookings.filter((b) => selectedRefs.has(b.booking_ref) && b.status === 'confirmed');
    if (toCheckIn.length === 0) {
      showToast('No confirmed reservations among selected items.');
      return;
    }

    setBulkActionTarget({
      type: 'check_in',
      title: `Check In ${toCheckIn.length} Visitor(s)?`,
      eyebrow: 'ATTENDANCE MANAGEMENT',
      message: `Mark ${toCheckIn.length} selected reservation(s) as checked-in to the library reading room.`,
      confirmText: `Confirm Check-In (${toCheckIn.length})`,
      cancelText: 'Cancel',
      variant: 'primary',
      onConfirm: async () => {
        setBulkActionTarget(null);
        setActionInProgress(true);
        let successCount = 0;
        for (const b of toCheckIn) {
          try {
            const res = await fetch(`/api/admin/bookings/${b.booking_ref}/status`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ status: 'checked_in', reason: 'Bulk check-in by staff' }),
            });
            if (res.ok) successCount++;
          } catch (err) {
            console.error('Bulk check-in failed for', b.booking_ref, err);
          }
        }
        setActionInProgress(false);
        setSelectedRefs(new Set());
        showToast(`Successfully checked in ${successCount} reservation(s).`);
        fetchBookings();
        fetchStats();
      },
    });
  };

  // Bulk Cancel with confirmation modal
  const handleBulkCancel = () => {
    const toCancel = bookings.filter(
      (b) => selectedRefs.has(b.booking_ref) && (b.status === 'confirmed' || b.status === 'checked_in')
    );
    if (toCancel.length === 0) {
      showToast('No cancellable reservations among selected items.');
      return;
    }

    setBulkActionTarget({
      type: 'cancel',
      title: `Cancel ${toCancel.length} Selected Reservation(s)?`,
      eyebrow: 'BULK CANCELLATION',
      message: `Are you sure you want to cancel ${toCancel.length} selected reservation(s)? This will immediately release seat capacity across the associated sessions.`,
      confirmText: `Cancel ${toCancel.length} Reservations`,
      cancelText: 'Keep Reservations',
      variant: 'danger',
      onConfirm: async () => {
        setBulkActionTarget(null);
        setActionInProgress(true);
        let successCount = 0;
        for (const b of toCancel) {
          try {
            const res = await fetch(`/api/admin/bookings/${b.booking_ref}/status`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ status: 'cancelled', reason: 'Bulk cancellation by staff' }),
            });
            if (res.ok) successCount++;
          } catch (err) {
            console.error('Bulk cancel failed for', b.booking_ref, err);
          }
        }
        setActionInProgress(false);
        setSelectedRefs(new Set());
        showToast(`Cancelled ${successCount} reservation(s).`);
        fetchBookings();
        fetchStats();
      },
    });
  };

  // Export filtered reservations to CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      showToast('No reservation records to export.');
      return;
    }

    const csvRows = [];
    csvRows.push(['SORA LIBRARY - RESERVATIONS EXPORT REPORT']);
    csvRows.push([`Generated on: ${new Date().toISOString()} | Active Filters: ${isFiltered ? 'Yes' : 'None'}`]);
    csvRows.push([]);
    csvRows.push([
      'Reference Code',
      'Visit Date',
      'Facility',
      'Session',
      'Visitor Name',
      'Visitor Email',
      'Membership ID',
      'Status',
      'Created Timestamp',
      'Checked-In Timestamp',
      'Checked-In By',
      'Cancelled Reason',
    ]);

    bookings.forEach((b) => {
      csvRows.push([
        b.booking_ref,
        b.visit_date,
        b.facility_name,
        b.session_name,
        b.visitor_name,
        b.visitor_email,
        b.membership_no || 'Non-member',
        b.status,
        b.created_at || '',
        b.checked_in_at || '',
        b.checked_in_by_name || '',
        b.cancellation_reason || '',
      ]);
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStamp = filterDate || new Date().toISOString().split('T')[0];
    link.setAttribute('download', `sora_reservations_${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${bookings.length} reservations to CSV.`);
  };

  // Selection toggles
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRefs(new Set(bookings.map((b) => b.booking_ref)));
    } else {
      setSelectedRefs(new Set());
    }
  };

  const handleSelectRow = (ref) => {
    setSelectedRefs((prev) => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      return next;
    });
  };

  // Status counts calculated dynamically from current dataset
  const statusCounts = useMemo(() => {
    const counts = {
      all: bookings.length,
      confirmed: 0,
      checked_in: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
    };
    bookings.forEach((b) => {
      if (counts[b.status] !== undefined) {
        counts[b.status]++;
      }
    });
    return counts;
  }, [bookings]);

  // Client-side pagination slicing
  const totalPages = Math.ceil(bookings.length / pageSize) || 1;
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return bookings.slice(startIndex, startIndex + pageSize);
  }, [bookings, currentPage, pageSize]);

  // Formatted date string e.g. "Wed, 28 Oct 2026"
  const formatDateNice = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const [y, m, d] = dateStr.split('-');
      if (!y || !m || !d) return dateStr;
      const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      return {
        main: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        day: date.toLocaleDateString('en-GB', { weekday: 'short' }),
      };
    } catch {
      return { main: dateStr, day: '' };
    }
  };

  // Get initials for visitor avatar badge
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="admin-bookings-page">
      {/* 1. Page Header */}
      <div className="bookings-header-wrap">
        <div className="bookings-header-titles">
          <span className="bookings-eyebrow">SORA OPERATIONS &amp; ACCESS</span>
          <h1 className="bookings-main-title">Bookings Management</h1>
          <p className="bookings-subtitle">
            Review visitor reservation passes, monitor hall capacities, and manage guest check-ins.
          </p>
        </div>

        <div className="bookings-header-actions">
          {/* Direct Link to Check-In Scanner Station */}
          <Link to="/admin/check-in" className="action-pill-btn" title="Open QR Check-in Station">
            <UserCheck size={14} className="pill-cal-icon" />
            <span>Check-in Station</span>
          </Link>

          {/* Export CSV */}
          <button
            type="button"
            className="action-pill-btn"
            onClick={handleExportCSV}
            title="Download CSV report of current records"
          >
            <Download size={14} className="pill-cal-icon" />
            <span>Export CSV</span>
          </button>

          {/* Reload Button */}
          <button
            type="button"
            className="action-pill-btn"
            onClick={() => {
              fetchBookings();
              fetchStats();
              showToast('Reloaded reservation records.');
            }}
            title="Reload reservation records"
          >
            <RefreshCw size={14} className={`pill-cal-icon ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>

          {/* New Reservation Link */}
          <Link
            to="/book"
            target="_blank"
            className="btn-add-transaction"
            title="Open booking wizard in new tab"
          >
            <Plus size={14} className="plus-icon" />
            <span>New Booking</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <section className="bookings-kpi-grid" aria-label="Key booking metrics">
        {/* Total Bookings */}
        <div
          className={`bookings-kpi-card ${filterStatus === '' ? 'active' : ''}`}
          onClick={() => setFilterStatus('')}
          role="button"
          tabIndex={0}
        >
          <div className="bookings-kpi-top">
            <span className="bookings-kpi-label">TOTAL BOOKINGS</span>
            <div className="bookings-kpi-icon-wrap">
              <CalendarDays size={15} />
            </div>
          </div>
          <div className="bookings-kpi-val">{totalCount}</div>
          <div className="bookings-kpi-sub">
            <span className="kpi-indicator-dot dot-all" />
            <span>All recorded visitors</span>
          </div>
        </div>

        {/* Confirmed / Expected */}
        <div
          className={`bookings-kpi-card ${filterStatus === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'confirmed' ? '' : 'confirmed')}
          role="button"
          tabIndex={0}
        >
          <div className="bookings-kpi-top">
            <span className="bookings-kpi-label">CONFIRMED PASSES</span>
            <div className="bookings-kpi-icon-wrap">
              <Clock size={15} />
            </div>
          </div>
          <div className="bookings-kpi-val">{statusCounts.confirmed}</div>
          <div className="bookings-kpi-sub">
            <span className="kpi-indicator-dot dot-confirmed" />
            <span>Awaiting arrival</span>
          </div>
        </div>

        {/* Checked In */}
        <div
          className={`bookings-kpi-card ${filterStatus === 'checked_in' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'checked_in' ? '' : 'checked_in')}
          role="button"
          tabIndex={0}
        >
          <div className="bookings-kpi-top">
            <span className="bookings-kpi-label">CHECKED IN</span>
            <div className="bookings-kpi-icon-wrap">
              <UserCheck size={15} />
            </div>
          </div>
          <div className="bookings-kpi-val">{statusCounts.checked_in}</div>
          <div className="bookings-kpi-sub">
            <span className="kpi-indicator-dot dot-checkedin" />
            <span>Visitors on premise</span>
          </div>
        </div>

        {/* Cancelled / Missed */}
        <div
          className={`bookings-kpi-card ${filterStatus === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'cancelled' ? '' : 'cancelled')}
          role="button"
          tabIndex={0}
        >
          <div className="bookings-kpi-top">
            <span className="bookings-kpi-label">CANCELLED / MISSED</span>
            <div className="bookings-kpi-icon-wrap">
              <XCircle size={15} />
            </div>
          </div>
          <div className="bookings-kpi-val">{statusCounts.cancelled + statusCounts.no_show}</div>
          <div className="bookings-kpi-sub">
            <span className="kpi-indicator-dot dot-cancelled" />
            <span>Released slots</span>
          </div>
        </div>
      </section>

      {/* 3. Filter & Search Panel */}
      <div className="bookings-filter-card">
        {/* Status Segmented Tabs */}
        <div className="filter-tabs-row" role="tablist" aria-label="Filter reservations by status">
          {[
            { id: '', label: 'All Records', count: statusCounts.all },
            { id: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
            { id: 'checked_in', label: 'Checked In', count: statusCounts.checked_in },
            { id: 'completed', label: 'Completed', count: statusCounts.completed },
            { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
            { id: 'no_show', label: 'No Show', count: statusCounts.no_show },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`filter-status-tab ${filterStatus === tab.id ? 'active' : ''}`}
              onClick={() => setFilterStatus(tab.id)}
              role="tab"
              aria-selected={filterStatus === tab.id}
            >
              <span>{tab.label}</span>
              <span className="tab-count-badge">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Input Bar: Search, Date, Space, Session & Clear */}
        <div className="filter-inputs-bar">
          {/* Integrated Search Box */}
          <form onSubmit={handleSearchSubmit} className="bookings-search-wrap">
            <Search size={14} className="table-search-icon" />
            <input
              type="text"
              className="bookings-search-input"
              placeholder="Search reference (JF-2026-...), visitor name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="bookings-search-clear"
                onClick={() => {
                  setSearchTerm('');
                  fetchBookings();
                }}
                title="Clear search query"
              >
                <X size={13} />
              </button>
            )}
          </form>

          {/* Date Selector */}
          <div className="bookings-date-filter-wrap">
            <input
              type="date"
              className="bookings-date-input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              title="Filter by visit date"
            />
          </div>

          {/* Facility Dropdown */}
          <select
            className="bookings-select-filter"
            value={filterFacility}
            onChange={(e) => setFilterFacility(e.target.value)}
            aria-label="Filter by space"
          >
            <option value="">All Spaces</option>
            <option value="reading-room">Reading Room</option>
            <option value="manga-corner">Manga Corner</option>
          </select>

          {/* Session Dropdown */}
          <select
            className="bookings-select-filter"
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            aria-label="Filter by session slot"
          >
            <option value="">All Sessions</option>
            <option value="morning">Morning (11:00 – 14:30)</option>
            <option value="afternoon">Afternoon (15:00 – 18:30)</option>
          </select>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              type="button"
              className="filter-reset-btn"
              onClick={clearFilters}
              title="Reset all active filters"
            >
              <X size={13} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Bulk Selection Action Bar */}
      {selectedRefs.size > 0 && (
        <div className="bulk-selection-bar">
          <div className="bulk-selection-info">
            <CheckCircle2 size={16} />
            <span>
              <strong>{selectedRefs.size}</strong> reservation{selectedRefs.size > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="bulk-selection-actions">
            <button
              type="button"
              className="btn-bulk-action"
              onClick={handleBulkCheckIn}
              disabled={actionInProgress}
            >
              <UserCheck size={13} />
              <span>Check In Selected</span>
            </button>

            <button
              type="button"
              className="btn-bulk-action"
              onClick={handleBulkCancel}
              disabled={actionInProgress}
            >
              <XCircle size={13} />
              <span>Cancel Selected</span>
            </button>

            <button
              type="button"
              className="btn-bulk-deselect"
              onClick={() => setSelectedRefs(new Set())}
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="admin-error-banner" role="alert">
          <AlertCircle size={16} className="mini-icon" />
          <span>{error}</span>
        </div>
      )}

      {/* 5. Main Table Container */}
      <div className="recent-activity-card" ref={menuContainerRef}>
        <div className="table-card-header">
          <div className="title-row">
            <h3 className="table-heading">RESERVATION ROSTER</h3>
            <span
              className="info-icon-badge"
              title="Real-time synchronized reservation log with one-click visitor check-in"
            >
              ⓘ
            </span>
            <span className="table-meta-counter">
              Showing {bookings.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
              {Math.min(currentPage * pageSize, bookings.length)} of {bookings.length} passes
            </span>
          </div>

          <div className="table-card-controls">
            {/* Page Size Selector */}
            <select
              className="bookings-select-filter"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ padding: '4px 8px', fontSize: '12px' }}
              aria-label="Rows per page"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="td-empty" style={{ padding: '50px 0' }}>
            <div className="monochrome-spinner" style={{ margin: '0 auto 12px auto' }} />
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--mono-text-secondary)' }}>
              Loading reservation passes...
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="td-empty" style={{ padding: '60px 20px' }}>
            <CalendarDays size={36} style={{ color: 'var(--mono-text-muted)', marginBottom: '12px' }} />
            <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: 'var(--mono-text-primary)' }}>
              No reservation passes found
            </p>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--mono-text-secondary)' }}>
              {isFiltered
                ? 'Try adjusting or clearing your active filters to view other bookings.'
                : 'No reservation records exist yet in the system.'}
            </p>
            {isFiltered && (
              <button type="button" onClick={clearFilters} className="btn-action-secondary">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive-container">
            <table className="monochrome-table">
              <thead>
                <tr>
                  <th className="th-checkbox">
                    <input
                      type="checkbox"
                      className="table-checkbox"
                      checked={bookings.length > 0 && selectedRefs.size === bookings.length}
                      onChange={handleSelectAll}
                      aria-label="Select all reservations on page"
                    />
                  </th>
                  <th>REFERENCE</th>
                  <th>VISIT DATE</th>
                  <th>SPACE &amp; SESSION</th>
                  <th>VISITOR</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((b, idx) => {
                  const dateInfo = formatDateNice(b.visit_date);
                  const isSelected = selectedRefs.has(b.booking_ref);
                  const isMenuOpen = activeMenuRef === b.booking_ref;
                  const isNearBottom = idx >= Math.max(0, paginatedBookings.length - 4);

                  return (
                    <tr
                      key={b.booking_ref}
                      className={isSelected ? 'row-selected' : ''}
                      onClick={() => handleSelectRow(b.booking_ref)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Checkbox */}
                      <td className="th-checkbox" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(b.booking_ref)}
                          aria-label={`Select reservation ${b.booking_ref}`}
                        />
                      </td>

                      {/* Reference Badge with Copy */}
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="booking-ref-badge"
                          onClick={(e) => handleCopyRef(b.booking_ref, e)}
                          title="Click to copy booking reference"
                        >
                          <span>{b.booking_ref}</span>
                          {copiedRef === b.booking_ref ? (
                            <Check size={13} style={{ color: '#059669' }} />
                          ) : (
                            <Copy size={12} className="copy-icon-subtle" />
                          )}
                        </button>
                      </td>

                      {/* Visit Date */}
                      <td>
                        <div className="visit-date-cell">
                          <span className="visit-date-main">{dateInfo.main}</span>
                          <span className="visit-date-day">{dateInfo.day}</span>
                        </div>
                      </td>

                      {/* Facility & Session */}
                      <td>
                        <div className="facility-session-cell">
                          <span className="facility-name-text">
                            {b.facility_name || (b.facility_id === 'reading-room' ? 'Reading Room' : 'Manga Corner')}
                          </span>
                          <span className="session-timing-pill">
                            <Clock size={11} />
                            <span>
                              {b.session_name || (b.session_id === 'morning' ? 'Morning' : 'Afternoon')} ·{' '}
                              {b.start_time || (b.session_id === 'morning' ? '11:00' : '15:00')}–
                              {b.end_time || (b.session_id === 'morning' ? '14:30' : '18:30')}
                            </span>
                          </span>
                        </div>
                      </td>

                      {/* Visitor Details */}
                      <td>
                        <div className="visitor-profile-cell">
                          <div className="visitor-avatar-initials">
                            {getInitials(b.visitor_name)}
                          </div>
                          <div className="visitor-meta-text">
                            <span className="visitor-full-name">{b.visitor_name}</span>
                            <span className="visitor-email-address">{b.visitor_email}</span>
                            {b.membership_no && (
                              <span className="visitor-member-tag">#{b.membership_no}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td>
                        <span className={`res-status-badge res-status-${b.status}`}>
                          <span className="res-status-dot" />
                          <span>
                            {b.status === 'checked_in'
                              ? 'Checked In'
                              : b.status === 'no_show'
                              ? 'No Show'
                              : b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                          </span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'right' }}>
                        <div className="table-actions-group" style={{ justifyContent: 'flex-end' }}>
                          {/* Quick Primary Action: Check In or Complete */}
                          {b.status === 'confirmed' && (
                            <button
                              type="button"
                              className="btn-action-primary"
                              onClick={() => handleStatusChange(b.booking_ref, 'checked_in')}
                              disabled={actionInProgress}
                              title="Check in visitor on site"
                            >
                              <UserCheck size={13} />
                              <span>Check In</span>
                            </button>
                          )}

                          {b.status === 'checked_in' && (
                            <button
                              type="button"
                              className="btn-action-secondary"
                              onClick={() => handleStatusChange(b.booking_ref, 'completed')}
                              disabled={actionInProgress}
                              title="Mark visitor checkout completed"
                            >
                              <CheckCircle2 size={13} />
                              <span>Complete</span>
                            </button>
                          )}

                          {/* Inspect Detail Button */}
                          <button
                            type="button"
                            className="btn-action-secondary"
                            onClick={() => handleOpenDetail(b.booking_ref)}
                            title="Inspect reservation pass and audit trail"
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>

                          {/* 3-Dots Action Popover */}
                          <div style={{ position: 'relative' }}>
                            <button
                              type="button"
                              className="btn-action-icon"
                              onClick={() =>
                                setActiveMenuRef(isMenuOpen ? null : b.booking_ref)
                              }
                              title="More options"
                              aria-label="More actions"
                            >
                              <MoreHorizontal size={14} />
                            </button>

                            {isMenuOpen && (
                              <div className={`row-action-popover ${isNearBottom ? 'popover-open-up' : ''}`} role="menu">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDetail(b.booking_ref)}
                                >
                                  <Eye size={13} />
                                  <span>View Pass &amp; Audit</span>
                                </button>

                                {b.status === 'confirmed' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStatusChange(b.booking_ref, 'checked_in')
                                    }
                                  >
                                    <UserCheck size={13} />
                                    <span>Check In Visitor</span>
                                  </button>
                                )}

                                {b.status === 'checked_in' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStatusChange(b.booking_ref, 'completed')
                                    }
                                  >
                                    <CheckCircle2 size={13} />
                                    <span>Mark Visit Finished</span>
                                  </button>
                                )}

                                {b.status === 'confirmed' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStatusChange(b.booking_ref, 'no_show')
                                    }
                                  >
                                    <Clock size={13} />
                                    <span>Record No-Show</span>
                                  </button>
                                )}

                                {(b.status === 'confirmed' || b.status === 'checked_in') && (
                                  <button
                                    type="button"
                                    className="danger-item"
                                    onClick={() =>
                                      handleStatusChange(b.booking_ref, 'cancelled')
                                    }
                                  >
                                    <XCircle size={13} />
                                    <span>Cancel Reservation</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    handleCopyRef(b.booking_ref, e);
                                    setActiveMenuRef(null);
                                  }}
                                >
                                  <Copy size={13} />
                                  <span>Copy Reference</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. Pagination Footer */}
        {!loading && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={bookings.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemName="reservations"
          />
        )}
      </div>

      {/* 7. Reservation Pass Inspector Modal */}
      {selectedBooking && (
        <div
          className="inspector-backdrop"
          onClick={(e) => e.target === e.currentTarget && setSelectedBooking(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="inspector-modal-card">
            {/* Modal Header */}
            <div className="inspector-header">
              <div className="inspector-header-info">
                <span className="inspector-eyebrow">RESERVATION PASS INSPECTOR</span>
                <div className="inspector-title-row">
                  <span className="inspector-ref-code">{selectedBooking.bookingRef}</span>
                  <span className={`res-status-badge res-status-${selectedBooking.status}`}>
                    <span className="res-status-dot" />
                    <span>
                      {selectedBooking.status === 'checked_in'
                        ? 'Checked In'
                        : selectedBooking.status === 'no_show'
                        ? 'No Show'
                        : selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="inspector-close-btn"
                onClick={() => setSelectedBooking(null)}
                aria-label="Close inspector"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="inspector-body-scroll">
              <div className="inspector-details-grid">
                {/* Visitor Card */}
                <div className="inspector-card-section">
                  <span className="inspector-section-heading">
                    <User size={13} />
                    <span>Visitor Profile</span>
                  </span>

                  <div className="inspector-detail-row">
                    <span className="inspector-label">FULL NAME</span>
                    <span className="inspector-val">{selectedBooking.visitorName}</span>
                  </div>

                  <div className="inspector-detail-row">
                    <span className="inspector-label">EMAIL ADDRESS</span>
                    <span className="inspector-val">{selectedBooking.visitorEmail}</span>
                  </div>

                  <div className="inspector-detail-row">
                    <span className="inspector-label">MEMBERSHIP STATUS</span>
                    <span className="inspector-val">
                      {selectedBooking.membershipNo ? (
                        <code style={{ fontSize: '12px' }}>{selectedBooking.membershipNo}</code>
                      ) : (
                        'Standard Guest'
                      )}
                    </span>
                  </div>
                </div>

                {/* Visit Details Card */}
                <div className="inspector-card-section">
                  <span className="inspector-section-heading">
                    <Building2 size={13} />
                    <span>Visit Schedule</span>
                  </span>

                  <div className="inspector-detail-row">
                    <span className="inspector-label">FACILITY / SPACE</span>
                    <span className="inspector-val">{selectedBooking.facilityName}</span>
                  </div>

                  <div className="inspector-detail-row">
                    <span className="inspector-label">VISIT DATE</span>
                    <span className="inspector-val">
                      {formatDateNice(selectedBooking.visitDate).main} (
                      {formatDateNice(selectedBooking.visitDate).day})
                    </span>
                  </div>

                  <div className="inspector-detail-row">
                    <span className="inspector-label">SESSION WINDOW</span>
                    <span className="inspector-val">
                      {selectedBooking.sessionName} ({selectedBooking.sessionStartTime}–
                      {selectedBooking.sessionEndTime})
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendance & Cancellation Metadata */}
              {(selectedBooking.checkedInAt || selectedBooking.cancelledAt) && (
                <div className="inspector-card-section">
                  <span className="inspector-section-heading">
                    <ShieldCheck size={13} />
                    <span>Attendance Metadata</span>
                  </span>

                  {selectedBooking.checkedInAt && (
                    <div className="inspector-detail-row">
                      <span className="inspector-label">CHECKED IN AT</span>
                      <span className="inspector-val">
                        {new Date(selectedBooking.checkedInAt).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                        })}{' '}
                        {selectedBooking.checkedInByName ? `by ${selectedBooking.checkedInByName}` : ''}
                      </span>
                    </div>
                  )}

                  {selectedBooking.cancelledAt && (
                    <div className="inspector-detail-row">
                      <span className="inspector-label">CANCELLED AT</span>
                      <span className="inspector-val" style={{ color: '#DC2626' }}>
                        {new Date(selectedBooking.cancelledAt).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                        })}{' '}
                        {selectedBooking.cancellationReason
                          ? `(${selectedBooking.cancellationReason})`
                          : ''}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Audit Trail Timeline */}
              <div className="inspector-timeline-section">
                <span className="inspector-section-heading">
                  <Clock size={13} />
                  <span>State History &amp; Audit Trail</span>
                </span>

                {auditLogs.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--mono-text-muted)' }}>
                    No prior state transition events recorded.
                  </p>
                ) : (
                  <div className="timeline-list">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="timeline-item">
                        <span className="timeline-action">{log.action.replace('_', ' ')}</span>
                        <span className="timeline-meta">
                          by {log.actor_type} ·{' '}
                          {new Date(log.created_at).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="inspector-footer">
              <div className="inspector-actions-left">
                {selectedBooking.status === 'confirmed' && (
                  <>
                    <button
                      type="button"
                      className="btn-action-primary"
                      onClick={() => handleStatusChange(selectedBooking.bookingRef, 'checked_in')}
                      disabled={actionInProgress}
                    >
                      <UserCheck size={13} />
                      <span>Check In Visitor</span>
                    </button>

                    <button
                      type="button"
                      className="btn-action-secondary"
                      onClick={() => handleStatusChange(selectedBooking.bookingRef, 'no_show')}
                      disabled={actionInProgress}
                    >
                      <Clock size={13} />
                      <span>Record No-Show</span>
                    </button>

                    <button
                      type="button"
                      className="btn-action-secondary"
                      style={{ color: '#DC2626' }}
                      onClick={() => handleStatusChange(selectedBooking.bookingRef, 'cancelled')}
                      disabled={actionInProgress}
                    >
                      <XCircle size={13} />
                      <span>Cancel Pass</span>
                    </button>
                  </>
                )}

                {selectedBooking.status === 'checked_in' && (
                  <button
                    type="button"
                    className="btn-action-primary"
                    onClick={() => handleStatusChange(selectedBooking.bookingRef, 'completed')}
                    disabled={actionInProgress}
                  >
                    <CheckCircle2 size={13} />
                    <span>Mark Visit Completed</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                className="btn-action-secondary"
                onClick={() => setSelectedBooking(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Pop-Up Modal */}
      <ConfirmationModal
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={executeCancellation}
        title="Cancel Reservation?"
        eyebrow="RESERVATION CANCELLATION"
        message={
          cancelTarget
            ? `Are you sure you want to cancel reservation ${cancelTarget.ref}? The seat slot will be released and returned to public booking availability.`
            : ''
        }
        confirmText="Cancel Reservation"
        cancelText="Keep Reservation"
        variant="danger"
        confirmIcon={XCircle}
        isLoading={actionInProgress}
        detailsCard={
          cancelTarget?.booking ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '13.5px', color: 'var(--mono-text-primary)' }}>
                  {cancelTarget.booking.full_name || 'Visitor'}
                </strong>
                <span className="font-mono" style={{ fontSize: '12px', background: 'var(--mono-hover-bg)', padding: '2px 8px', borderRadius: '4px' }}>
                  {cancelTarget.ref}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--mono-text-secondary)', display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                {cancelTarget.booking.visit_date && <span>📅 {cancelTarget.booking.visit_date}</span>}
                {cancelTarget.booking.session_time && <span>⏰ {cancelTarget.booking.session_time}</span>}
                {cancelTarget.booking.reading_room && <span>🏛️ {cancelTarget.booking.reading_room}</span>}
              </div>
            </div>
          ) : null
        }
      />

      {/* Bulk Action Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(bulkActionTarget)}
        onClose={() => setBulkActionTarget(null)}
        onConfirm={bulkActionTarget?.onConfirm}
        title={bulkActionTarget?.title || 'Confirm Bulk Action'}
        eyebrow={bulkActionTarget?.eyebrow || 'BULK ACTION'}
        message={bulkActionTarget?.message}
        confirmText={bulkActionTarget?.confirmText || 'Confirm'}
        cancelText={bulkActionTarget?.cancelText || 'Cancel'}
        variant={bulkActionTarget?.variant || 'danger'}
        isLoading={actionInProgress}
      />

      {/* Floating In-App Toast Notification */}
      {toastMessage && (
        <div className="sora-toast-container" aria-live="polite">
          <div className="sora-toast">
            <Check size={14} style={{ color: '#10B981' }} />
            <span>{toastMessage}</span>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => setToastMessage(null)}
              aria-label="Dismiss toast"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
