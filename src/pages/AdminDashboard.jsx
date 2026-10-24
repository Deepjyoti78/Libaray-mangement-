import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  ShoppingCart,
  Users,
  AlertCircle,
  Calendar,
  Download,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import KpiCard from '../components/KpiCard';
import SquareBlockChart from '../components/SquareBlockChart';
import BooksByCategoryCard from '../components/BooksByCategoryCard';
import OverdueTrendChart from '../components/OverdueTrendChart';
import RecentLoanActivityTable from '../components/RecentLoanActivityTable';
import AddTransactionModal from '../components/AddTransactionModal';

export default function AdminDashboard() {
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    kpi: {
      totalBooks: 12480,
      totalLoans: 10320,
      activeMembers: 4305,
      overdueItems: 196,
    },
    categories: [],
    overdueTrend: [],
  });

  const [circulationPeriod, setCirculationPeriod] = useState('monthly');
  const [circulationData, setCirculationData] = useState([]);
  const [totalCirculationLoans, setTotalCirculationLoans] = useState(10320);

  // Table state
  const [loans, setLoans] = useState([]);
  const [loansTotal, setLoansTotal] = useState(0);
  const [loansPage, setLoansPage] = useState(1);
  const [loansSearch, setLoansSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter Period for header
  const [headerPeriod, setHeaderPeriod] = useState('Daily');
  const [selectedDate, setSelectedDate] = useState('2025-11-06');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);

  // 1. Fetch dashboard analytics & KPI
  const fetchDashboardAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/dashboard-analytics', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard analytics:', err);
    }
  };

  // 2. Fetch circulation statistics
  const fetchCirculationData = async (period = circulationPeriod) => {
    try {
      const res = await fetch(`/api/admin/circulation?period=${period}&year=2025`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setCirculationData(data.data || []);
        if (data.totalLoans) setTotalCirculationLoans(data.totalLoans);
      }
    } catch (err) {
      console.error('Failed to load circulation stats:', err);
    }
  };

  // 3. Fetch recent loans table
  const fetchLoans = async (page = loansPage, search = loansSearch) => {
    try {
      const res = await fetch(
        `/api/admin/loans?page=${page}&limit=10&search=${encodeURIComponent(search)}`,
        { credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        setLoans(data.loans || []);
        setLoansTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load loans table:', err);
    }
  };

  // Initial load
  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([
        fetchDashboardAnalytics(),
        fetchCirculationData('monthly'),
        fetchLoans(1, ''),
      ]);
      setLoading(false);
    }
    init();
  }, []);

  // Handle circulation period switch
  const handlePeriodChange = (newPeriod) => {
    setCirculationPeriod(newPeriod);
    fetchCirculationData(newPeriod);
  };

  // Handle table search
  const handleSearchChange = (val) => {
    setLoansSearch(val);
    setLoansPage(1);
    fetchLoans(1, val);
  };

  // Handle table page change
  const handlePageChange = (newPage) => {
    setLoansPage(newPage);
    fetchLoans(newPage, loansSearch);
  };

  // Handle loan status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/loans/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchLoans(loansPage, loansSearch);
        fetchDashboardAnalytics();
      }
    } catch (err) {
      console.error('Failed to update loan status:', err);
    }
  };

  // Handle Export Report (CSV)
  const handleExportReport = () => {
    const csvRows = [];
    csvRows.push(['SORA LIBRARY MANAGEMENT CONSOLE - EXECUTIVE REPORT']);
    csvRows.push([`Generated on: ${new Date().toISOString()}`]);
    csvRows.push([]);
    csvRows.push(['KEY PERFORMANCE INDICATORS']);
    csvRows.push(['Metric', 'Value']);
    csvRows.push(['Total Catalog Books', analyticsData.kpi.totalBooks]);
    csvRows.push(['Total Loans Issued', analyticsData.kpi.totalLoans]);
    csvRows.push(['Active Library Members', analyticsData.kpi.activeMembers]);
    csvRows.push(['Overdue Items', analyticsData.kpi.overdueItems]);
    csvRows.push([]);
    csvRows.push(['BOOKS BY CATEGORY']);
    csvRows.push(['Category', 'Book Count', 'Share']);
    analyticsData.categories.forEach((c) => {
      csvRows.push([c.name, c.count, `${c.percentage}%`]);
    });
    csvRows.push([]);
    csvRows.push(['RECENT LOAN TRANSACTIONS']);
    csvRows.push(['Loan ID', 'Member Name', 'Book Title', 'Type', 'Issue Date', 'Due Date', 'Status']);
    loans.forEach((l) => {
      csvRows.push([l.loan_code, l.member_name, l.book_title, l.type, l.issue_date, l.due_date, l.status]);
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      csvRows.map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sora_library_report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format header date nicely e.g. "6 Nov 2025"
  const formatHeaderDate = (dateStr) => {
    try {
      const [y, m, d] = dateStr.split('-');
      const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // First name of authenticated user
  const firstName = user?.name ? user.name.split(' ')[0] : 'Aarav';

  return (
    <div className="dashboard-content-page">
      {/* 6. Dashboard Heading and Actions */}
      <section className="dashboard-header-section">
        <div className="dashboard-welcome-wrap">
          <h1 className="dashboard-welcome-heading">Welcome back, {firstName}</h1>
          <p className="dashboard-welcome-sub">
            Here's what's happening in your library today.
          </p>
        </div>

        <div className="dashboard-actions-wrap">
          {/* Period selector dropdown */}
          <div className="dropdown-action-anchor">
            <button
              type="button"
              className="action-pill-btn period-selector-btn"
              onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
            >
              <span>{headerPeriod}</span>
              <ChevronDown size={14} className="pill-chevron" />
            </button>

            {periodDropdownOpen && (
              <div className="header-period-menu">
                {['Daily', 'Weekly', 'Monthly'].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setHeaderPeriod(p);
                      setPeriodDropdownOpen(false);
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Selector Pill */}
          <div className="date-picker-anchor">
            <button
              type="button"
              className="action-pill-btn date-pill-btn"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            >
              <Calendar size={14} className="pill-cal-icon" />
              <span>{formatHeaderDate(selectedDate)}</span>
            </button>

            {isDatePickerOpen && (
              <div className="date-picker-popover">
                <input
                  type="date"
                  className="quick-date-input"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setIsDatePickerOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Export Report Action */}
          <button
            type="button"
            className="btn-export-report"
            onClick={handleExportReport}
          >
            <Download size={14} className="export-icon" />
            <span>Export Report</span>
          </button>
        </div>
      </section>

      {/* 7. Four KPI Cards in One Horizontal Row */}
      <section className="kpi-cards-grid" aria-label="Key library statistics">
        <KpiCard
          icon={BookOpen}
          label="TOTAL BOOKS"
          value={analyticsData.kpi.totalBooks}
          trend="+0.94 last month"
          sparklineData={[10, 16, 12, 22, 18, 25, 20, 29]}
        />
        <KpiCard
          icon={ShoppingCart}
          label="TOTAL LOANS"
          value={analyticsData.kpi.totalLoans}
          subtext="Loans issued"
          trend="+0.94 last month"
          sparklineData={[8, 14, 18, 15, 20, 24, 28, 30]}
        />
        <KpiCard
          icon={Users}
          label="ACTIVE MEMBERS"
          value={analyticsData.kpi.activeMembers}
          subtext="New members"
          trend="+0.94 last month"
          sparklineData={[12, 10, 18, 16, 22, 21, 26, 28]}
        />
        <KpiCard
          icon={AlertCircle}
          label="OVERDUE ITEMS"
          value={analyticsData.kpi.overdueItems}
          trend="+0.94 last month"
          sparklineData={[14, 20, 16, 24, 19, 28, 22, 31]}
        />
      </section>

      {/* Main Analytics Section: Two Columns */}
      <section className="analytics-two-columns" aria-label="Circulation and category analytics">
        {/* Left Column: 8. Critical Square-Block Circulation Chart */}
        <div className="analytics-left-col">
          <SquareBlockChart
            data={circulationData}
            period={circulationPeriod}
            onPeriodChange={handlePeriodChange}
            totalLoans={totalCirculationLoans}
          />
        </div>

        {/* Right Column: 9. Books By Category & Overdue Trend */}
        <div className="analytics-right-col">
          <BooksByCategoryCard
            categories={analyticsData.categories}
            totalBooks={analyticsData.kpi.totalBooks}
          />
          <OverdueTrendChart
            data={analyticsData.overdueTrend}
          />
        </div>
      </section>

      {/* 10. Recent Loan Activity Table (Full-Width Card) */}
      <section className="recent-activity-section" aria-label="Recent transactions">
        <RecentLoanActivityTable
          loans={loans}
          total={loansTotal}
          page={loansPage}
          limit={10}
          search={loansSearch}
          onSearchChange={handleSearchChange}
          onPageChange={handlePageChange}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onStatusUpdate={handleStatusUpdate}
        />
      </section>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={() => {
          fetchLoans(1, loansSearch);
          fetchDashboardAnalytics();
        }}
      />
    </div>
  );
}
