import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Receipt,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Printer,
  FileText,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

const INITIAL_FINES = [
  {
    id: 1,
    invoiceNo: 'FINE-9021',
    memberNo: 'MEM-10115',
    memberName: 'Priyanka Sharma',
    memberEmail: 'priyanka.s@nihongo-delhi.org',
    itemTitle: 'One Piece: Romance Dawn (Vol. 1)',
    loanCode: '#04104',
    reason: 'Overdue Penalty (7 days late)',
    amount: 70,
    ratePerDay: 10,
    incurredDate: '2026-10-19',
    dueDate: '2026-10-26',
    status: 'unpaid',
    paymentMethod: null,
    paidAt: null,
    waivedReason: null,
  },
  {
    id: 2,
    invoiceNo: 'FINE-9018',
    memberNo: 'MEM-10550',
    memberName: 'Siddharth Varma',
    memberEmail: 'sid.varma88@outlook.com',
    itemTitle: 'Your Name (Kimi no Na wa)',
    loanCode: '#04107',
    reason: 'Overdue Penalty (14 days late)',
    amount: 140,
    ratePerDay: 10,
    incurredDate: '2026-10-12',
    dueDate: '2026-10-26',
    status: 'unpaid',
    paymentMethod: null,
    paidAt: null,
    waivedReason: null,
  },
  {
    id: 3,
    invoiceNo: 'FINE-8994',
    memberNo: 'MEM-10381',
    memberName: 'Rohit Deshmukh',
    memberEmail: 'rohit.desh@gmail.com',
    itemTitle: 'Tokyo Architecture Survey Folio',
    loanCode: '#04088',
    reason: 'Spine Binding Wear & Minor Stain',
    amount: 250,
    ratePerDay: null,
    incurredDate: '2026-10-15',
    dueDate: '2026-10-22',
    status: 'paid',
    paymentMethod: 'UPI (GPay / Paytm)',
    paidAt: '2026-10-16',
    waivedReason: null,
  },
  {
    id: 4,
    invoiceNo: 'FINE-8970',
    memberNo: 'MEM-10492',
    memberName: 'Aoi Kinoshita',
    memberEmail: 'aoi.k@university.delhi.edu',
    itemTitle: 'Japanese Calligraphy Masterclass',
    loanCode: '#04071',
    reason: 'Overdue Penalty (3 days late)',
    amount: 30,
    ratePerDay: 10,
    incurredDate: '2026-10-10',
    dueDate: '2026-10-17',
    status: 'waived',
    paymentMethod: null,
    paidAt: null,
    waivedReason: 'Authorized academic extension approved by Senior Librarian',
  },
  {
    id: 5,
    invoiceNo: 'FINE-8955',
    memberNo: 'MEM-10873',
    memberName: 'Ananya Roy',
    memberEmail: 'ananya.roy@jnu.ac.in',
    itemTitle: 'Lost Library Smart Access Card',
    loanCode: null,
    reason: 'Smart Card Replacement Fee',
    amount: 100,
    ratePerDay: null,
    incurredDate: '2026-10-08',
    dueDate: '2026-10-15',
    status: 'paid',
    paymentMethod: 'Cash (Desk Counter)',
    paidAt: '2026-10-09',
    waivedReason: null,
  },
  {
    id: 6,
    invoiceNo: 'FINE-8922',
    memberNo: 'MEM-10024',
    memberName: 'Takeshi Yamada',
    memberEmail: 't.yamada@j-corp.in',
    itemTitle: 'JLPT N1 Comprehensive Grammar',
    loanCode: '#04012',
    reason: 'Overdue Penalty (5 days late)',
    amount: 50,
    ratePerDay: 10,
    incurredDate: '2026-09-25',
    dueDate: '2026-10-02',
    status: 'paid',
    paymentMethod: 'Credit Card (Visa)',
    paidAt: '2026-09-26',
    waivedReason: null,
  },
];

const STATUS_TABS = [
  { key: 'all', label: 'All Fines & Fees' },
  { key: 'unpaid', label: 'Unpaid / Pending' },
  { key: 'paid', label: 'Paid & Settled' },
  { key: 'waived', label: 'Waived' },
];

export default function AdminFinesPage() {
  const [fines, setFines] = useState(INITIAL_FINES);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals state
  const [isAddFineOpen, setIsAddFineOpen] = useState(false);
  const [collectingFine, setCollectingFine] = useState(null);
  const [waivingFine, setWaivingFine] = useState(null);
  const [receiptFine, setReceiptFine] = useState(null);

  // Form states
  const [newFineForm, setNewFineForm] = useState({
    memberName: '',
    memberNo: '',
    itemTitle: '',
    reason: 'Overdue Penalty',
    amount: 50,
  });

  const [paymentForm, setPaymentForm] = useState({
    method: 'UPI (GPay / PhonePe / Paytm)',
    reference: '',
  });

  const [waiverReason, setWaiverReason] = useState('Special research exemption approved by library director');

  // Filtered dataset
  const filteredFines = useMemo(() => {
    return fines.filter((f) => {
      const matchSearch =
        searchTerm === '' ||
        f.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.memberNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.itemTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTab = activeTab === 'all' || f.status === activeTab;

      return matchSearch && matchTab;
    });
  }, [fines, searchTerm, activeTab]);

  // Pagination
  const totalPages = Math.ceil(filteredFines.length / pageSize) || 1;
  const paginatedFines = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFines.slice(start, start + pageSize);
  }, [filteredFines, currentPage, pageSize]);

  // Aggregate KPI counters
  const totalUnpaid = fines
    .filter((f) => f.status === 'unpaid')
    .reduce((sum, f) => sum + f.amount, 0);
  const totalCollected = fines
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0);
  const totalWaived = fines
    .filter((f) => f.status === 'waived')
    .reduce((sum, f) => sum + f.amount, 0);
  const pendingAccountsCount = fines.filter((f) => f.status === 'unpaid').length;

  // Process payment
  const handleConfirmPayment = (e) => {
    e.preventDefault();
    if (!collectingFine) return;
    const today = new Date().toISOString().split('T')[0];
    setFines(
      fines.map((f) =>
        f.id === collectingFine.id
          ? {
              ...f,
              status: 'paid',
              paidAt: today,
              paymentMethod: paymentForm.method,
            }
          : f
      )
    );
    setReceiptFine({
      ...collectingFine,
      status: 'paid',
      paidAt: today,
      paymentMethod: paymentForm.method,
    });
    setCollectingFine(null);
  };

  // Process waiver
  const handleConfirmWaiver = (e) => {
    e.preventDefault();
    if (!waivingFine) return;
    setFines(
      fines.map((f) =>
        f.id === waivingFine.id
          ? {
              ...f,
              status: 'waived',
              waivedReason: waiverReason,
            }
          : f
      )
    );
    setWaivingFine(null);
  };

  // Create manual fine
  const handleCreateFine = (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const newFine = {
      id: Date.now(),
      invoiceNo: `FINE-${Math.floor(9030 + Math.random() * 900)}`,
      memberNo: newFineForm.memberNo || `MEM-${Math.floor(10000 + Math.random() * 89999)}`,
      memberName: newFineForm.memberName,
      memberEmail: `${newFineForm.memberName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      itemTitle: newFineForm.itemTitle || 'Library Materials / Facility Service',
      loanCode: '#04199',
      reason: newFineForm.reason,
      amount: parseFloat(newFineForm.amount) || 50,
      ratePerDay: newFineForm.reason.includes('Overdue') ? 10 : null,
      incurredDate: today,
      dueDate: due,
      status: 'unpaid',
      paymentMethod: null,
      paidAt: null,
      waivedReason: null,
    };

    setFines([newFine, ...fines]);
    setIsAddFineOpen(false);
    setNewFineForm({
      memberName: '',
      memberNo: '',
      itemTitle: '',
      reason: 'Overdue Penalty',
      amount: 50,
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Invoice No', 'Member No', 'Name', 'Item', 'Reason', 'Amount (INR)', 'Incurred Date', 'Status', 'Payment Method'];
    const rows = filteredFines.map((f) => [
      `"${f.invoiceNo}"`,
      `"${f.memberNo}"`,
      `"${f.memberName}"`,
      `"${f.itemTitle}"`,
      `"${f.reason}"`,
      f.amount,
      `"${f.incurredDate}"`,
      `"${f.status}"`,
      `"${f.paymentMethod || f.waivedReason || '-'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fines_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-bookings-page admin-fines-page">
      {/* 1. Page Header */}
      <div className="bookings-header-wrap">
        <div className="bookings-header-titles">
          <span className="bookings-eyebrow">SORA ACCOUNTS &amp; CIRCULATION REVENUE</span>
          <h1 className="bookings-main-title">Fines &amp; Fee Management</h1>
          <p className="bookings-subtitle">
            Track overdue penalties, book replacement charges, payment settlements, and authorized fee waivers.
          </p>
        </div>

        <div className="bookings-header-actions">
          <button
            type="button"
            className="action-pill-btn"
            onClick={handleExportCSV}
            title="Export fines ledger as CSV"
          >
            <Download size={14} className="pill-cal-icon" />
            <span>Export Ledger</span>
          </button>

          <button
            type="button"
            className="action-pill-btn"
            onClick={() => setIsAddFineOpen(true)}
            title="Record fine or penalty fee"
          >
            <Plus size={14} className="pill-cal-icon" />
            <span>Record Fine / Fee</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div className="bookings-kpi-grid">
        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">OUTSTANDING UNPAID</span>
            <div className="kpi-icon-wrap"><AlertCircle size={17} /></div>
          </div>
          <div className="kpi-main-number text-amber-700">₹{totalUnpaid.toLocaleString()}</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend negative">{pendingAccountsCount} pending notices</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">COLLECTED THIS MONTH</span>
            <div className="kpi-icon-wrap"><Receipt size={17} /></div>
          </div>
          <div className="kpi-main-number">₹{totalCollected.toLocaleString()}</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend positive">UPI &amp; Desk Counter</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">WAIVED / EXEMPTED</span>
            <div className="kpi-icon-wrap"><CheckCircle2 size={17} /></div>
          </div>
          <div className="kpi-main-number">₹{totalWaived.toLocaleString()}</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend neutral">Academic exemptions</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">PENALTY STANDARD</span>
            <div className="kpi-icon-wrap"><CreditCard size={17} /></div>
          </div>
          <div className="kpi-main-number">₹10 / day</div>
          <div className="kpi-footer-row">
            <span className="kpi-sub-label">Standard overdue rate</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Controls */}
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
                  ? fines.length
                  : fines.filter((f) => f.status === tab.key).length}
              </span>
            </button>
          ))}
        </div>

        <div className="bookings-filter-bar">
          <div className="filter-search-box">
            <Search size={15} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search fine by invoice ID, member name, card number, or book title..."
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

      {/* 4. Fines Ledger Table */}
      <div className="bookings-table-wrapper">
        <table className="bookings-data-table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Member Details</th>
              <th>Reason &amp; Volume Item</th>
              <th>Amount (INR)</th>
              <th>Date Incurred</th>
              <th>Status</th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFines.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-table-cell">
                  <div className="empty-state-wrap">
                    <Receipt size={32} className="empty-icon" />
                    <p className="empty-title">No fines or fee records match your search</p>
                    <p className="empty-subtitle">All patron accounts appear settled in this view.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedFines.map((fine) => (
                <tr key={fine.id}>
                  <td>
                    <span className="member-no-code font-mono font-semibold">
                      {fine.invoiceNo}
                    </span>
                  </td>
                  <td>
                    <div className="visitor-text-info">
                      <span className="visitor-primary-name">{fine.memberName}</span>
                      <span className="visitor-secondary-email font-mono text-xs">{fine.memberNo}</span>
                    </div>
                  </td>
                  <td>
                    <div className="book-title-cell">
                      <div className="book-text-info">
                        <span className="book-en-title">{fine.reason}</span>
                        <span className="book-meta-sub font-mono">{fine.itemTitle}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-base font-bold text-stone-900">
                      ₹{fine.amount}
                    </span>
                  </td>
                  <td>
                    <div className="date-time-cell">
                      <span className="date-main-text">{fine.incurredDate}</span>
                      <span className="date-sub-day">Due {fine.dueDate}</span>
                    </div>
                  </td>
                  <td>
                    {fine.status === 'paid' ? (
                      <span className="status-pill pill-active">Paid · {fine.paymentMethod?.split(' ')[0]}</span>
                    ) : fine.status === 'waived' ? (
                      <span className="status-pill pill-cancelled">Waived</span>
                    ) : (
                      <span className="status-pill pill-amber">Unpaid Due</span>
                    )}
                  </td>
                  <td className="td-actions">
                    <div className="row-actions-group">
                      {fine.status === 'unpaid' && (
                        <button
                          type="button"
                          className="action-pill-small-btn btn-collect"
                          onClick={() => setCollectingFine(fine)}
                          title="Collect Settlement"
                        >
                          <span>Collect</span>
                        </button>
                      )}
                      {fine.status === 'unpaid' && (
                        <button
                          type="button"
                          className="action-pill-small-btn btn-waive"
                          onClick={() => setWaivingFine(fine)}
                          title="Authorize Waiver"
                        >
                          <span>Waive</span>
                        </button>
                      )}
                      {fine.status === 'paid' && (
                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => setReceiptFine(fine)}
                          title="Print Formal Receipt"
                        >
                          <Printer size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="bookings-pagination-footer">
          <div className="pagination-info">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredFines.length)} of {filteredFines.length} records
          </div>

          <div className="pagination-nav-group">
            <button
              type="button"
              className="page-nav-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={15} />
              <span>Previous</span>
            </button>
            <span className="page-indicator">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="page-nav-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <span>Next</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. COLLECT PAYMENT MODAL */}
      {collectingFine && (
        <div className="modal-backdrop-overlay" onClick={() => setCollectingFine(null)}>
          <div className="modal-card-dialog catalog-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-text">
                <span className="dialog-eyebrow">ACCOUNTS SETTLEMENT</span>
                <h2 className="dialog-title">Collect Fee · {collectingFine.invoiceNo}</h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setCollectingFine(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="catalog-modal-form">
              <div className="payment-summary-box">
                <div className="summary-amount-line">
                  <span>Total Amount Due:</span>
                  <strong className="text-2xl font-mono text-stone-900">₹{collectingFine.amount}.00</strong>
                </div>
                <div className="summary-meta-line">
                  <span>Patron: {collectingFine.memberName} ({collectingFine.memberNo})</span>
                  <span>Reason: {collectingFine.reason}</span>
                </div>
              </div>

              <div className="form-field-item">
                <label>Payment Settlement Mode *</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                >
                  <option value="UPI (GPay / PhonePe / Paytm)">UPI (QR Code / Instant)</option>
                  <option value="Cash (Desk Counter)">Cash at Desk Counter</option>
                  <option value="Debit / Credit Card (POS)">Debit / Credit Card (POS)</option>
                  <option value="Online Portal Transfer">Online Portal Transfer</option>
                </select>
              </div>

              <div className="form-field-item">
                <label>Transaction / UTR Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-981248019 or Cash receipt #102"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                />
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="dialog-secondary-btn"
                  onClick={() => setCollectingFine(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-primary-btn">
                  <Check size={15} />
                  <span>Confirm &amp; Settle Fee</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. WAIVE FINE MODAL */}
      {waivingFine && (
        <div className="modal-backdrop-overlay" onClick={() => setWaivingFine(null)}>
          <div className="modal-card-dialog catalog-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-text">
                <span className="dialog-eyebrow">EXEMPTION APPROVAL</span>
                <h2 className="dialog-title">Waive Fine · {waivingFine.invoiceNo}</h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setWaivingFine(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmWaiver} className="catalog-modal-form">
              <div className="payment-summary-box">
                <div className="summary-amount-line">
                  <span>Amount to be Waived:</span>
                  <strong className="text-xl font-mono text-stone-900">₹{waivingFine.amount}.00</strong>
                </div>
                <div className="summary-meta-line">
                  <span>Patron: {waivingFine.memberName} ({waivingFine.memberNo})</span>
                </div>
              </div>

              <div className="form-field-item">
                <label>Exemption Justification *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the reason for waiver (e.g., Illness medical certificate, research grant exemption, system error)..."
                  value={waiverReason}
                  onChange={(e) => setWaiverReason(e.target.value)}
                />
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="dialog-secondary-btn"
                  onClick={() => setWaivingFine(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-primary-btn">
                  <Check size={15} />
                  <span>Authorize Waiver</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. RECORD MANUAL FINE MODAL */}
      {isAddFineOpen && (
        <div className="modal-backdrop-overlay" onClick={() => setIsAddFineOpen(false)}>
          <div className="modal-card-dialog catalog-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-text">
                <span className="dialog-eyebrow">ACCOUNTS ENTRY</span>
                <h2 className="dialog-title">Record Manual Fine or Replacement Charge</h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setIsAddFineOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFine} className="catalog-modal-form">
              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Member Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohit Deshmukh"
                    value={newFineForm.memberName}
                    onChange={(e) => setNewFineForm({ ...newFineForm, memberName: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Member Card No</label>
                  <input
                    type="text"
                    placeholder="e.g. MEM-10381"
                    value={newFineForm.memberNo}
                    onChange={(e) => setNewFineForm({ ...newFineForm, memberNo: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Associated Book Title / Resource</label>
                  <input
                    type="text"
                    placeholder="e.g. Kokoro or Smart Card"
                    value={newFineForm.itemTitle}
                    onChange={(e) => setNewFineForm({ ...newFineForm, itemTitle: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Fine Amount (INR) *</label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    required
                    value={newFineForm.amount}
                    onChange={(e) => setNewFineForm({ ...newFineForm, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field-item">
                <label>Violation / Fee Reason</label>
                <select
                  value={newFineForm.reason}
                  onChange={(e) => setNewFineForm({ ...newFineForm, reason: e.target.value })}
                >
                  <option value="Overdue Penalty">Overdue Penalty (@ ₹10/day)</option>
                  <option value="Lost Volume Replacement Charge">Lost Volume Replacement Charge</option>
                  <option value="Binding / Page Damage Fee">Binding / Page Damage Fee</option>
                  <option value="Smart Access Card Reissue">Smart Access Card Reissue</option>
                  <option value="Special Facility Cleaning Fee">Special Facility Cleaning Fee</option>
                </select>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="dialog-secondary-btn"
                  onClick={() => setIsAddFineOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-primary-btn">
                  <Plus size={15} />
                  <span>Issue Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. FORMAL RECEIPT MODAL */}
      {receiptFine && (
        <div className="modal-backdrop-overlay" onClick={() => setReceiptFine(null)}>
          <div className="modal-card-dialog book-inspector-modal loan-slip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-text">
                <span className="dialog-eyebrow">OFFICIAL PAYMENT RECEIPT</span>
                <h2 className="dialog-title">{receiptFine.invoiceNo}</h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setReceiptFine(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="inspector-content-body">
              <div className="thermal-slip-card">
                <div className="slip-header-brand">
                  <span className="slip-title">THE JAPAN FOUNDATION LIBRARY</span>
                  <span className="slip-sub">Official Accounts &amp; Treasury · New Delhi</span>
                  <div className="slip-divider-dash" />
                </div>

                <div className="slip-fields-list">
                  <div className="slip-row">
                    <span>Receipt No:</span>
                    <strong className="font-mono">{receiptFine.invoiceNo}</strong>
                  </div>
                  <div className="slip-row">
                    <span>Paid By:</span>
                    <strong>{receiptFine.memberName} ({receiptFine.memberNo})</strong>
                  </div>
                  <div className="slip-row">
                    <span>Reason:</span>
                    <span>{receiptFine.reason}</span>
                  </div>
                  <div className="slip-row">
                    <span>Item:</span>
                    <span>{receiptFine.itemTitle}</span>
                  </div>
                  <div className="slip-divider-dash" />
                  <div className="slip-row highlight-due">
                    <span>Amount Paid:</span>
                    <strong className="font-mono text-lg">₹{receiptFine.amount}.00</strong>
                  </div>
                  <div className="slip-row">
                    <span>Payment Mode:</span>
                    <span>{receiptFine.paymentMethod}</span>
                  </div>
                  <div className="slip-row">
                    <span>Date Settled:</span>
                    <span>{receiptFine.paidAt}</span>
                  </div>
                  <div className="slip-row">
                    <span>Status:</span>
                    <strong className="text-emerald-700">PAID &amp; CLEARED</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-dialog-footer">
              <button
                type="button"
                className="dialog-secondary-btn"
                onClick={() => setReceiptFine(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="action-primary-btn"
                onClick={() => window.print()}
              >
                <Printer size={14} />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
