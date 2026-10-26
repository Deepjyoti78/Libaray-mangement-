import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  RotateCcw,
  Printer,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Barcode,
  BookOpen,
  User,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import TablePagination from '../components/TablePagination';

const INITIAL_LOANS = [
  {
    id: 1,
    loanCode: '#04102',
    bookTitle: 'Norwegian Wood',
    bookJa: 'ノルウェイの森',
    bookCategory: 'Fiction',
    shelf: 'JPN.813.6/M97n',
    memberName: 'Aoi Kinoshita',
    memberNo: 'MEM-10492',
    memberEmail: 'aoi.k@university.delhi.edu',
    issueDate: '2026-10-14',
    dueDate: '2026-10-28',
    returnDate: null,
    status: 'active',
    fineAmount: 0,
  },
  {
    id: 2,
    loanCode: '#04103',
    bookTitle: 'Kokoro',
    bookJa: 'こころ',
    bookCategory: 'Literature',
    shelf: 'JPN.813.5/N27k',
    memberName: 'Rohit Deshmukh',
    memberNo: 'MEM-10381',
    memberEmail: 'rohit.desh@gmail.com',
    issueDate: '2026-10-18',
    dueDate: '2026-11-01',
    returnDate: null,
    status: 'active',
    fineAmount: 0,
  },
  {
    id: 3,
    loanCode: '#04104',
    bookTitle: 'One Piece: Romance Dawn (Vol. 1)',
    bookJa: 'ONE PIECE 巻一',
    bookCategory: 'Manga',
    shelf: 'MANGA.J.741/O21o',
    memberName: 'Priyanka Sharma',
    memberNo: 'MEM-10115',
    memberEmail: 'priyanka.s@nihongo-delhi.org',
    issueDate: '2026-10-05',
    dueDate: '2026-10-19',
    returnDate: null,
    status: 'overdue',
    fineAmount: 70, // 7 days @ ₹10
  },
  {
    id: 4,
    loanCode: '#04105',
    bookTitle: 'Rashomon and Other Stories',
    bookJa: '羅生門・鼻',
    bookCategory: 'Literature',
    shelf: 'JPN.813.4/A38r',
    memberName: 'Takeshi Yamada',
    memberNo: 'MEM-10024',
    memberEmail: 't.yamada@j-corp.in',
    issueDate: '2026-10-10',
    dueDate: '2026-10-24',
    returnDate: '2026-10-23',
    status: 'returned',
    fineAmount: 0,
  },
  {
    id: 5,
    loanCode: '#04106',
    bookTitle: 'Modern Japanese Architecture & Spatial Design',
    bookJa: '日本の現代建築と空間',
    bookCategory: 'Arts & Culture',
    shelf: 'ART.720.9/K96m',
    memberName: 'Ananya Roy',
    memberNo: 'MEM-10873',
    memberEmail: 'ananya.roy@jnu.ac.in',
    issueDate: '2026-10-20',
    dueDate: '2026-10-27',
    returnDate: null,
    status: 'due_soon',
    fineAmount: 0,
  },
  {
    id: 6,
    loanCode: '#04107',
    bookTitle: 'Your Name (Kimi no Na wa)',
    bookJa: '君の名は。',
    bookCategory: 'Fiction',
    shelf: 'JPN.813.6/S52y',
    memberName: 'Siddharth Varma',
    memberNo: 'MEM-10550',
    memberEmail: 'sid.varma88@outlook.com',
    issueDate: '2026-09-28',
    dueDate: '2026-10-12',
    returnDate: null,
    status: 'overdue',
    fineAmount: 140, // 14 days @ ₹10
  },
  {
    id: 7,
    loanCode: '#04108',
    bookTitle: 'Snow Country',
    bookJa: '雪国',
    bookCategory: 'Literature',
    shelf: 'JPN.813.5/K22s',
    memberName: 'Meera Krishnan',
    memberNo: 'MEM-10904',
    memberEmail: 'meera.krish@arts.du.ac.in',
    issueDate: '2026-10-22',
    dueDate: '2026-11-05',
    returnDate: null,
    status: 'active',
    fineAmount: 0,
  },
  {
    id: 8,
    loanCode: '#04109',
    bookTitle: 'AI, Robotics & High-Speed Rail Innovation',
    bookJa: '日本のAIロボティクス',
    bookCategory: 'Science & Tech',
    shelf: 'SCI.629.8/I77a',
    memberName: 'Hiroshi Sato',
    memberNo: 'MEM-10619',
    memberEmail: 'sato.hiroshi@embassy-japan.org',
    issueDate: '2026-10-08',
    dueDate: '2026-10-22',
    returnDate: '2026-10-21',
    status: 'returned',
    fineAmount: 0,
  },
  {
    id: 9,
    loanCode: '#04110',
    bookTitle: 'The Memory Police',
    bookJa: '密やかな結晶',
    bookCategory: 'Fiction',
    shelf: 'JPN.813.6/O34m',
    memberName: 'Aoi Kinoshita',
    memberNo: 'MEM-10492',
    memberEmail: 'aoi.k@university.delhi.edu',
    issueDate: '2026-10-24',
    dueDate: '2026-11-07',
    returnDate: null,
    status: 'active',
    fineAmount: 0,
  },
];

const STATUS_TABS = [
  { key: 'all', label: 'All Transactions' },
  { key: 'active', label: 'Active Loans' },
  { key: 'due_soon', label: 'Due Soon' },
  { key: 'overdue', label: 'Overdue Items' },
  { key: 'returned', label: 'Returned' },
];

export default function AdminLoansPage() {
  const [loans, setLoans] = useState(INITIAL_LOANS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [quickReturnCode, setQuickReturnCode] = useState('');
  const [quickReturnMsg, setQuickReturnMsg] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals state
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
  const [slipLoan, setSlipLoan] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // New loan form
  const [newLoanForm, setNewLoanForm] = useState({
    memberName: '',
    memberNo: '',
    bookTitle: '',
    durationDays: 14,
    notes: '',
  });

  // Filtered dataset
  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      const matchSearch =
        searchTerm === '' ||
        l.loanCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.memberNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTab = activeTab === 'all' || l.status === activeTab;

      return matchSearch && matchTab;
    });
  }, [loans, searchTerm, activeTab]);

  // Pagination
  const totalPages = Math.ceil(filteredLoans.length / pageSize) || 1;
  const paginatedLoans = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLoans.slice(start, start + pageSize);
  }, [filteredLoans, currentPage, pageSize]);

  // Aggregate KPI counters
  const totalActive = loans.filter((l) => l.status === 'active' || l.status === 'due_soon').length;
  const totalDueSoon = loans.filter((l) => l.status === 'due_soon').length;
  const totalOverdue = loans.filter((l) => l.status === 'overdue').length;
  const totalReturned = loans.filter((l) => l.status === 'returned').length;

  // Rapid Barcode / Loan Code Return
  const handleQuickReturn = (e) => {
    e.preventDefault();
    if (!quickReturnCode.trim()) return;

    const code = quickReturnCode.trim().toLowerCase();
    const foundIdx = loans.findIndex(
      (l) => l.loanCode.toLowerCase() === code || l.loanCode.toLowerCase().replace('#', '') === code
    );

    if (foundIdx === -1) {
      setQuickReturnMsg(`Loan record "${quickReturnCode}" not found.`);
      return;
    }

    if (loans[foundIdx].status === 'returned') {
      setQuickReturnMsg(`Loan ${loans[foundIdx].loanCode} is already checked in.`);
      return;
    }

    const updated = [...loans];
    const today = new Date().toISOString().split('T')[0];
    updated[foundIdx] = {
      ...updated[foundIdx],
      status: 'returned',
      returnDate: today,
    };

    setLoans(updated);
    setQuickReturnMsg(`Successfully returned ${updated[foundIdx].bookTitle} (${updated[foundIdx].loanCode})!`);
    setQuickReturnCode('');
    setTimeout(() => setQuickReturnMsg(''), 4500);
  };

  // 1-Click Mark Returned
  const handleMarkReturned = (id) => {
    const today = new Date().toISOString().split('T')[0];
    let returnedTitle = '';
    setLoans(
      loans.map((l) => {
        if (l.id === id) {
          returnedTitle = l.bookTitle;
          return { ...l, status: 'returned', returnDate: today };
        }
        return l;
      })
    );
    showToast(`Successfully returned "${returnedTitle || 'Book'}".`);
  };

  // Extend due date +14 days
  const handleExtendLoan = (id) => {
    let extendedTitle = '';
    setLoans(
      loans.map((l) => {
        if (l.id === id) {
          extendedTitle = l.bookTitle;
          const curr = new Date(l.dueDate);
          curr.setDate(curr.getDate() + 14);
          return {
            ...l,
            dueDate: curr.toISOString().split('T')[0],
            status: 'active',
          };
        }
        return l;
      })
    );
    showToast(`Loan period for "${extendedTitle || 'Book'}" extended by 14 days.`);
  };

  // Issue new loan
  const handleCreateLoan = (e) => {
    e.preventDefault();
    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + parseInt(newLoanForm.durationDays, 10));

    const newCode = `#0${Math.floor(4120 + Math.random() * 800)}`;
    const created = {
      id: Date.now(),
      loanCode: newCode,
      bookTitle: newLoanForm.bookTitle,
      bookJa: '新規貸出',
      bookCategory: 'General Collection',
      shelf: 'JPN.813.0/GEN',
      memberName: newLoanForm.memberName,
      memberNo: newLoanForm.memberNo || `MEM-${Math.floor(10000 + Math.random() * 89999)}`,
      memberEmail: `${newLoanForm.memberName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      issueDate: today.toISOString().split('T')[0],
      dueDate: due.toISOString().split('T')[0],
      returnDate: null,
      status: 'active',
      fineAmount: 0,
    };

    setLoans([created, ...loans]);
    setIsNewLoanOpen(false);
    setSlipLoan(created);
    setNewLoanForm({
      memberName: '',
      memberNo: '',
      bookTitle: '',
      durationDays: 14,
      notes: '',
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Loan Code', 'Book Title', 'Member Name', 'Member No', 'Issue Date', 'Due Date', 'Return Date', 'Status'];
    const rows = filteredLoans.map((l) => [
      `"${l.loanCode}"`,
      `"${l.bookTitle}"`,
      `"${l.memberName}"`,
      `"${l.memberNo}"`,
      `"${l.issueDate}"`,
      `"${l.dueDate}"`,
      `"${l.returnDate || '-'}"`,
      `"${l.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Circulation_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-bookings-page admin-loans-page">
      {/* 1. Page Header */}
      <div className="bookings-header-wrap">
        <div className="bookings-header-titles">
          <span className="bookings-eyebrow">SORA CIRCULATION &amp; TRANSACTION LEDGER</span>
          <h1 className="bookings-main-title">Loans &amp; Returns Desk</h1>
          <p className="bookings-subtitle">
            Issue new book loans, scan returns, track overdue lending windows, and print borrowing slips.
          </p>
        </div>

        <div className="bookings-header-actions">
          <button
            type="button"
            className="action-pill-btn"
            onClick={handleExportCSV}
            title="Export circulation ledger as CSV"
          >
            <Download size={14} className="pill-cal-icon" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="action-pill-btn"
            onClick={() => setIsNewLoanOpen(true)}
            title="Issue a new book loan"
          >
            <Plus size={14} className="pill-cal-icon" />
            <span>New Loan Transaction</span>
          </button>
        </div>
      </div>

      {/* 2. Rapid Check-in / Barcode Scanner Strip */}
      <div className="rapid-return-bar-wrap">
        <form onSubmit={handleQuickReturn} className="rapid-return-form">
          <div className="scanner-input-box">
            <Barcode size={20} className="barcode-icon" />
            <input
              type="text"
              placeholder="Scan book barcode or type loan code (e.g. #04104) for instant check-in..."
              value={quickReturnCode}
              onChange={(e) => setQuickReturnCode(e.target.value)}
              className="rapid-scanner-input"
            />
          </div>
          <button type="submit" className="action-primary-btn rapid-return-btn">
            <RotateCcw size={14} />
            <span>Process Return</span>
          </button>
        </form>

        {quickReturnMsg && (
          <div
            className={`rapid-return-feedback ${
              quickReturnMsg.includes('not found') || quickReturnMsg.includes('already')
                ? 'feedback-amber'
                : 'feedback-green'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>{quickReturnMsg}</span>
          </div>
        )}
      </div>

      {/* 3. KPI Metrics Bar */}
      <div className="bookings-kpi-grid">
        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">ACTIVE BORROWINGS</span>
            <div className="kpi-icon-wrap"><ArrowLeftRight size={17} /></div>
          </div>
          <div className="kpi-main-number">{totalActive.toLocaleString()}</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend positive">Active in circulation</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">DUE TODAY / SOON</span>
            <div className="kpi-icon-wrap"><Clock size={17} /></div>
          </div>
          <div className="kpi-main-number">{totalDueSoon}</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend neutral">Expiring in 48 hours</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">OVERDUE ITEMS</span>
            <div className="kpi-icon-wrap"><AlertCircle size={17} /></div>
          </div>
          <div className="kpi-main-number">{totalOverdue}</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend negative">Notices queued</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">CHECKED IN TODAY</span>
            <div className="kpi-icon-wrap"><CheckCircle2 size={17} /></div>
          </div>
          <div className="kpi-main-number">{totalReturned}</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend positive">Returned to shelf</span>
          </div>
        </div>
      </div>

      {/* 4. Filter Tabs & Search Controls */}
      <div className="catalog-controls-container">
        <div className="catalog-category-tabs" role="tablist">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`cat-pill-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
            >
              <span>{tab.label}</span>
              <span className="cat-count">
                {tab.key === 'all'
                  ? loans.length
                  : loans.filter((l) => l.status === tab.key).length}
              </span>
            </button>
          ))}
        </div>

        <div className="bookings-filter-bar">
          <div className="filter-search-box">
            <Search size={15} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search by loan code, title, member name or card number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Loans Data Table */}
      <div className="bookings-table-wrapper">
        <table className="bookings-data-table">
          <thead>
            <tr>
              <th>Loan Code</th>
              <th>Book Title &amp; Shelf Location</th>
              <th>Borrower (Member)</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLoans.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-table-cell">
                  <div className="empty-state-wrap">
                    <ArrowLeftRight size={32} className="empty-icon" />
                    <p className="empty-title">No loan transactions match this filter</p>
                    <p className="empty-subtitle">Try selecting another status tab or clear the search field.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedLoans.map((loan) => (
                <tr key={loan.id}>
                  <td>
                    <span className="member-no-code font-mono font-semibold">
                      {loan.loanCode}
                    </span>
                  </td>
                  <td>
                    <div className="book-title-cell">
                      <div className="book-text-info">
                        <span className="book-en-title">{loan.bookTitle}</span>
                        <span className="book-ja-title">{loan.bookJa}</span>
                        <span className="shelf-code-badge mt-1 inline-block">
                          {loan.shelf} · {loan.bookCategory}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="visitor-text-info">
                      <span className="visitor-primary-name">{loan.memberName}</span>
                      <span className="visitor-secondary-email font-mono text-xs">{loan.memberNo}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-stone-600">{loan.issueDate}</span>
                  </td>
                  <td>
                    <div className="date-time-cell">
                      <span className="date-main-text font-mono font-semibold">{loan.dueDate}</span>
                      {loan.status === 'overdue' && (
                        <span className="text-red-700 text-xs font-medium">Fine: ₹{loan.fineAmount}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {loan.status === 'returned' ? (
                      <span className="status-pill pill-active">Returned</span>
                    ) : loan.status === 'due_soon' ? (
                      <span className="status-pill pill-amber">Due Soon</span>
                    ) : loan.status === 'overdue' ? (
                      <span className="status-pill pill-cancelled">Overdue</span>
                    ) : (
                      <span className="status-pill pill-active">Active</span>
                    )}
                  </td>
                  <td className="td-actions">
                    <div className="row-actions-group">
                      {loan.status !== 'returned' && (
                        <button
                          type="button"
                          className="action-icon-btn check-in-btn"
                          onClick={() => handleMarkReturned(loan.id)}
                          title="Mark Returned (Check-in volume)"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      {loan.status !== 'returned' && (
                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => handleExtendLoan(loan.id)}
                          title="Extend loan (+14 days)"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="action-icon-btn"
                        onClick={() => setSlipLoan(loan)}
                        title="Print Loan Slip / Receipt"
                      >
                        <Printer size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLoans.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="loans"
        />
      </div>

      {/* 6. ISSUE NEW LOAN MODAL */}
      {isNewLoanOpen && (
        <div className="modal-backdrop-overlay" onClick={() => setIsNewLoanOpen(false)}>
          <div className="modal-card-dialog catalog-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-text">
                <span className="dialog-eyebrow">CIRCULATION DESK</span>
                <h2 className="dialog-title">Issue Book Loan</h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setIsNewLoanOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="catalog-modal-form">
              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Member Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aoi Kinoshita"
                    value={newLoanForm.memberName}
                    onChange={(e) => setNewLoanForm({ ...newLoanForm, memberName: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Member Card No (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. MEM-10492"
                    value={newLoanForm.memberNo}
                    onChange={(e) => setNewLoanForm({ ...newLoanForm, memberNo: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Book Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Norwegian Wood"
                    value={newLoanForm.bookTitle}
                    onChange={(e) => setNewLoanForm({ ...newLoanForm, bookTitle: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Lending Duration</label>
                  <select
                    value={newLoanForm.durationDays}
                    onChange={(e) => setNewLoanForm({ ...newLoanForm, durationDays: e.target.value })}
                  >
                    <option value={7}>7 Days (Short Loan / Manga)</option>
                    <option value={14}>14 Days (Standard Circulation)</option>
                    <option value={21}>21 Days (Extended Study)</option>
                    <option value={28}>28 Days (Faculty / Scholar)</option>
                  </select>
                </div>
              </div>

              <div className="form-field-item">
                <label>Circulation Desk Notes</label>
                <textarea
                  rows={2}
                  placeholder="Note book condition, special checkout instructions, or reservation override..."
                  value={newLoanForm.notes}
                  onChange={(e) => setNewLoanForm({ ...newLoanForm, notes: e.target.value })}
                />
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="dialog-secondary-btn"
                  onClick={() => setIsNewLoanOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-primary-btn">
                  <ArrowLeftRight size={15} />
                  <span>Confirm Checkout</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. PRINTABLE BORROWING SLIP MODAL */}
      {slipLoan && (
        <div className="modal-backdrop-overlay" onClick={() => setSlipLoan(null)}>
          <div className="modal-card-dialog book-inspector-modal loan-slip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-text">
                <span className="dialog-eyebrow">CIRCULATION RECEIPT</span>
                <h2 className="dialog-title">Borrowing Slip · {slipLoan.loanCode}</h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setSlipLoan(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="inspector-content-body">
              {/* Slip thermal paper aesthetic */}
              <div className="thermal-slip-card">
                <div className="slip-header-brand">
                  <span className="slip-title">THE JAPAN FOUNDATION LIBRARY</span>
                  <span className="slip-sub">5A, Ring Road, Lajpat Nagar-IV, New Delhi</span>
                  <div className="slip-divider-dash" />
                </div>

                <div className="slip-fields-list">
                  <div className="slip-row">
                    <span>Transaction Code:</span>
                    <strong className="font-mono">{slipLoan.loanCode}</strong>
                  </div>
                  <div className="slip-row">
                    <span>Member:</span>
                    <strong>{slipLoan.memberName} ({slipLoan.memberNo})</strong>
                  </div>
                  <div className="slip-row">
                    <span>Book Volume:</span>
                    <strong>{slipLoan.bookTitle}</strong>
                  </div>
                  <div className="slip-row">
                    <span>Shelf Location:</span>
                    <span className="font-mono">{slipLoan.shelf}</span>
                  </div>
                  <div className="slip-divider-dash" />
                  <div className="slip-row">
                    <span>Checkout Date:</span>
                    <span>{slipLoan.issueDate}</span>
                  </div>
                  <div className="slip-row highlight-due">
                    <span>Due Date:</span>
                    <strong className="font-mono">{slipLoan.dueDate}</strong>
                  </div>
                  <div className="slip-row">
                    <span>Standard Overdue Rate:</span>
                    <span>₹10.00 / day</span>
                  </div>
                </div>

                <div className="slip-barcode-area">
                  <Barcode size={38} />
                  <span className="font-mono text-xs">{slipLoan.loanCode}</span>
                </div>
              </div>
            </div>

            <div className="modal-dialog-footer">
              <button
                type="button"
                className="dialog-secondary-btn"
                onClick={() => setSlipLoan(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="action-primary-btn"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={14} />
                <span>Print Thermal Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="bookings-toast-pill" role="status">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
