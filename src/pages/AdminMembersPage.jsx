import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Download,
  Users,
  BookOpen,
  GraduationCap,
  AlertCircle,
  Eye,
  Edit2,
  CheckCircle2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Calendar,
  Mail,
  Phone,
  ShieldCheck,
  CreditCard,
  RotateCw,
  Ban,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

const INITIAL_MEMBERS = [
  {
    id: 1,
    memberNo: 'MEM-10492',
    name: 'Aoi Kinoshita',
    email: 'aoi.k@university.delhi.edu',
    phone: '+91 98101 23456',
    tier: 'Japanese Scholar',
    status: 'active',
    activeLoans: 2,
    totalHistoricalLoans: 38,
    joinDate: '2023-04-15',
    expiryDate: '2027-04-15',
    address: 'Room 204, Graduate Hall, North Campus, Delhi',
    idProof: 'Delhi University Student ID / JLPT N1 Certificate',
    finesDue: 0,
  },
  {
    id: 2,
    memberNo: 'MEM-10381',
    name: 'Rohit Deshmukh',
    email: 'rohit.desh@gmail.com',
    phone: '+91 98712 34567',
    tier: 'General',
    status: 'active',
    activeLoans: 1,
    totalHistoricalLoans: 19,
    joinDate: '2024-01-10',
    expiryDate: '2026-01-10',
    address: 'B-42, Defence Colony, New Delhi',
    idProof: 'Aadhaar Card Verified',
    finesDue: 0,
  },
  {
    id: 3,
    memberNo: 'MEM-10115',
    name: 'Priyanka Sharma',
    email: 'priyanka.s@nihongo-delhi.org',
    phone: '+91 99100 45678',
    tier: 'Student',
    status: 'expiring_soon',
    activeLoans: 3,
    totalHistoricalLoans: 45,
    joinDate: '2024-11-01',
    expiryDate: '2026-11-05',
    address: 'Flat 12, Lajpat Nagar-II, New Delhi',
    idProof: 'Japan Foundation Student ID',
    finesDue: 50,
  },
  {
    id: 4,
    memberNo: 'MEM-10024',
    name: 'Takeshi Yamada',
    email: 't.yamada@j-corp.in',
    phone: '+91 98200 98765',
    tier: 'Lifetime / VIP',
    status: 'active',
    activeLoans: 0,
    totalHistoricalLoans: 72,
    joinDate: '2021-08-20',
    expiryDate: '2030-08-20',
    address: 'Shanti Niketan, New Delhi',
    idProof: 'Japanese Diplomatic / Expat Passport',
    finesDue: 0,
  },
  {
    id: 5,
    memberNo: 'MEM-10873',
    name: 'Ananya Roy',
    email: 'ananya.roy@jnu.ac.in',
    phone: '+91 98111 55667',
    tier: 'Japanese Scholar',
    status: 'active',
    activeLoans: 1,
    totalHistoricalLoans: 24,
    joinDate: '2024-06-12',
    expiryDate: '2027-06-12',
    address: 'Mahi Mandavi Hostel, JNU, New Delhi',
    idProof: 'JNU School of Language Literature Studies ID',
    finesDue: 0,
  },
  {
    id: 6,
    memberNo: 'MEM-10550',
    name: 'Siddharth Varma',
    email: 'sid.varma88@outlook.com',
    phone: '+91 97110 33445',
    tier: 'General',
    status: 'suspended',
    activeLoans: 2,
    totalHistoricalLoans: 12,
    joinDate: '2023-09-05',
    expiryDate: '2025-09-05',
    address: 'C-15, Greater Kailash-I, New Delhi',
    idProof: 'Passport Verified',
    finesDue: 240,
  },
  {
    id: 7,
    memberNo: 'MEM-10904',
    name: 'Meera Krishnan',
    email: 'meera.krish@arts.du.ac.in',
    phone: '+91 98118 77889',
    tier: 'Student',
    status: 'active',
    activeLoans: 1,
    totalHistoricalLoans: 8,
    joinDate: '2025-02-14',
    expiryDate: '2027-02-14',
    address: 'D-3, South Extension-I, New Delhi',
    idProof: 'DU College of Art Student ID',
    finesDue: 0,
  },
  {
    id: 8,
    memberNo: 'MEM-10619',
    name: 'Hiroshi Sato',
    email: 'sato.hiroshi@embassy-japan.org',
    phone: '+91 98990 11223',
    tier: 'Lifetime / VIP',
    status: 'active',
    activeLoans: 2,
    totalHistoricalLoans: 56,
    joinDate: '2022-03-01',
    expiryDate: '2032-03-01',
    address: 'Chanakyapuri, New Delhi',
    idProof: 'Official Mission Accreditation',
    finesDue: 0,
  },
];

const TIERS = ['All', 'General', 'Student', 'Japanese Scholar', 'Lifetime / VIP'];

const MEMBER_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active Members' },
  { value: 'expiring_soon', label: 'Expiring Soon' },
  { value: 'suspended', label: 'Suspended Accounts' },
];

export default function AdminMembersPage() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Custom theme dropdown state
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [inspectedMember, setInspectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  // New member form
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    tier: 'General',
    address: '',
    idProof: 'Aadhaar / National ID',
    expiryYears: 2,
  });

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        searchTerm === '' ||
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.memberNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone.includes(searchTerm);

      const matchTier = selectedTier === 'All' || m.tier === selectedTier;

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && m.status === 'active') ||
        (statusFilter === 'expiring_soon' && m.status === 'expiring_soon') ||
        (statusFilter === 'suspended' && m.status === 'suspended');

      return matchSearch && matchTier && matchStatus;
    });
  }, [members, searchTerm, selectedTier, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  // Aggregate counters
  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === 'active').length;
  const scholarsCount = members.filter((m) => m.tier === 'Japanese Scholar').length;
  const overdueCount = members.filter((m) => m.finesDue > 0).length;

  // Handle register
  const handleRegisterMember = (e) => {
    e.preventDefault();
    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(now.getFullYear() + parseInt(newMemberForm.expiryYears, 10));

    const created = {
      id: Date.now(),
      memberNo: `MEM-${Math.floor(10000 + Math.random() * 89999)}`,
      name: newMemberForm.name,
      email: newMemberForm.email,
      phone: newMemberForm.phone,
      tier: newMemberForm.tier,
      status: 'active',
      activeLoans: 0,
      totalHistoricalLoans: 0,
      joinDate: now.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      address: newMemberForm.address,
      idProof: newMemberForm.idProof,
      finesDue: 0,
    };

    setMembers([created, ...members]);
    setIsRegisterModalOpen(false);
    setNewMemberForm({
      name: '',
      email: '',
      phone: '',
      tier: 'General',
      address: '',
      idProof: 'Aadhaar / National ID',
      expiryYears: 2,
    });
  };

  // Handle save edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingMember) return;
    setMembers(
      members.map((m) => (m.id === editingMember.id ? { ...m, ...editingMember } : m))
    );
    setEditingMember(null);
  };

  // Renew membership
  const handleRenewMember = (id) => {
    setMembers(
      members.map((m) => {
        if (m.id === id) {
          const curr = new Date(m.expiryDate);
          curr.setFullYear(curr.getFullYear() + 1);
          return { ...m, expiryDate: curr.toISOString().split('T')[0], status: 'active' };
        }
        return m;
      })
    );
    alert('Membership renewed for 1 additional year.');
  };

  // Toggle status
  const handleToggleStatus = (id) => {
    setMembers(
      members.map((m) => {
        if (m.id === id) {
          const newStatus = m.status === 'suspended' ? 'active' : 'suspended';
          return { ...m, status: newStatus };
        }
        return m;
      })
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Member No', 'Name', 'Email', 'Phone', 'Tier', 'Status', 'Active Loans', 'Expiry Date'];
    const rows = filteredMembers.map((m) => [
      `"${m.memberNo}"`,
      `"${m.name}"`,
      `"${m.email}"`,
      `"${m.phone}"`,
      `"${m.tier}"`,
      `"${m.status}"`,
      m.activeLoans,
      `"${m.expiryDate}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sora_Members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Monogram helper
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="admin-bookings-page admin-members-page">
      {/* 1. Page Header */}
      <div className="bookings-header-wrap">
        <div className="bookings-header-titles">
          <span className="bookings-eyebrow">SORA PATRON MANAGEMENT &amp; ACCESS</span>
          <h1 className="bookings-main-title">Library Members Directory</h1>
          <p className="bookings-subtitle">
            Manage registered library members, issued digital cards, borrowing privileges, and renewal dates.
          </p>
        </div>

        <div className="bookings-header-actions">
          <button
            type="button"
            className="action-pill-btn"
            onClick={handleExportCSV}
            title="Export members directory as CSV"
          >
            <Download size={14} className="pill-cal-icon" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="action-pill-btn"
            onClick={() => setIsRegisterModalOpen(true)}
            title="Register a new library member"
          >
            <Plus size={14} className="pill-cal-icon" />
            <span>Register Member</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div className="bookings-kpi-grid">
        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">TOTAL MEMBERS</span>
            <div className="kpi-icon-wrap"><Users size={17} /></div>
          </div>
          <div className="kpi-main-number">{totalCount.toLocaleString()}</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend positive">+45 new this month</span>
            <span className="kpi-sub-label">Enrolled</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">ACTIVE BORROWERS</span>
            <div className="kpi-icon-wrap"><BookOpen size={17} /></div>
          </div>
          <div className="kpi-main-number">{activeCount.toLocaleString()}</div>
          <div className="kpi-footer-row">
            <span className="kpi-sub-label">Current borrowing rights</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">JAPANESE SCHOLARS</span>
            <div className="kpi-icon-wrap"><GraduationCap size={17} /></div>
          </div>
          <div className="kpi-main-number">{scholarsCount.toLocaleString()}</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend neutral">Academic Tier</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">OVERDUE ACCOUNTS</span>
            <div className="kpi-icon-wrap"><AlertCircle size={17} /></div>
          </div>
          <div className="kpi-main-number">{overdueCount}</div>
          <div className="kpi-footer-row">
            <span className={`kpi-trend ${overdueCount > 0 ? 'negative' : 'positive'}`}>
              {overdueCount > 0 ? 'Fine balances pending' : 'All clear'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filters */}
      <div className="catalog-controls-container">
        {/* Tier filter tabs */}
        <div className="catalog-category-tabs" role="tablist">
          {TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              className={`cat-pill-tab ${selectedTier === tier ? 'active' : ''}`}
              onClick={() => {
                setSelectedTier(tier);
                setCurrentPage(1);
              }}
            >
              <span>{tier}</span>
              <span className="cat-count">
                {tier === 'All'
                  ? members.length
                  : members.filter((m) => m.tier === tier).length}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bookings-filter-bar">
          <div className="filter-search-box">
            <Search size={15} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search member by name, card number, email or phone..."
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

          <div className="theme-dropdown-container" ref={statusDropdownRef}>
            <button
              type="button"
              className={`theme-filter-dropdown-btn ${statusFilter !== 'all' ? 'active-filter' : ''}`}
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              aria-expanded={isStatusDropdownOpen}
              title="Filter by member status"
            >
              <SlidersHorizontal size={13} className="filter-btn-icon" />
              <span className="filter-btn-text">
                {MEMBER_STATUS_OPTIONS.find((opt) => opt.value === statusFilter)?.label || 'All Statuses'}
              </span>
              {statusFilter !== 'all' && <span className="filter-active-indicator" />}
              <ChevronDown
                size={14}
                className={`filter-btn-chevron ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isStatusDropdownOpen && (
              <div className="theme-dropdown-menu">
                <div className="dropdown-menu-header">FILTER BY STATUS</div>
                {MEMBER_STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`theme-dropdown-item ${statusFilter === opt.value ? 'selected' : ''}`}
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setCurrentPage(1);
                      setIsStatusDropdownOpen(false);
                    }}
                  >
                    <span className="item-label">{opt.label}</span>
                    {statusFilter === opt.value && <Check size={13} className="item-check-icon" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Members Table */}
      <div className="bookings-table-wrapper">
        <table className="bookings-data-table">
          <thead>
            <tr>
              <th>Member ID</th>
              <th>Member Name &amp; Contact</th>
              <th>Membership Tier</th>
              <th>Active Loans</th>
              <th>Validity &amp; Expiry</th>
              <th>Status</th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMembers.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-table-cell">
                  <div className="empty-state-wrap">
                    <Users size={32} className="empty-icon" />
                    <p className="empty-title">No members found</p>
                    <p className="empty-subtitle">Try adjusting the search criteria or filter tags.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <span className="member-no-code font-mono font-semibold">
                      {member.memberNo}
                    </span>
                  </td>
                  <td>
                    <div className="visitor-cell-wrap">
                      <div className="avatar-monogram-circle">
                        {getInitials(member.name)}
                      </div>
                      <div className="visitor-text-info">
                        <span className="visitor-primary-name">{member.name}</span>
                        <span className="visitor-secondary-email">{member.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-pill-badge">{member.tier}</span>
                  </td>
                  <td>
                    <span className="font-mono text-sm">
                      <strong>{member.activeLoans}</strong> active
                      <span className="text-stone-400 text-xs ml-1">({member.totalHistoricalLoans} total)</span>
                    </span>
                  </td>
                  <td>
                    <div className="date-time-cell">
                      <span className="date-main-text">Expires {member.expiryDate}</span>
                      <span className="date-sub-day">Joined {member.joinDate}</span>
                    </div>
                  </td>
                  <td>
                    {member.status === 'active' ? (
                      <span className="status-pill pill-active">Active</span>
                    ) : member.status === 'expiring_soon' ? (
                      <span className="status-pill pill-amber">Expiring Soon</span>
                    ) : (
                      <span className="status-pill pill-cancelled">Suspended</span>
                    )}
                  </td>
                  <td className="td-actions">
                    <div className="row-actions-group">
                      <button
                        type="button"
                        className="action-icon-btn"
                        onClick={() => setInspectedMember(member)}
                        title="View Member Digital Pass"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        className="action-icon-btn"
                        onClick={() => setEditingMember({ ...member })}
                        title="Edit Member"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        className="action-icon-btn"
                        onClick={() => handleRenewMember(member.id)}
                        title="Renew Membership (+1 yr)"
                      >
                        <RotateCw size={15} />
                      </button>
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
            {Math.min(currentPage * pageSize, filteredMembers.length)} of {filteredMembers.length} members
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

      {/* 5. REGISTER NEW MEMBER MODAL */}
      {isRegisterModalOpen && (
        <div className="modal-backdrop-overlay" onClick={() => setIsRegisterModalOpen(false)}>
          <div className="modal-card-dialog catalog-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-text">
                <span className="dialog-eyebrow">PATRON REGISTRATION</span>
                <h2 className="dialog-title">Enroll New Library Member</h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setIsRegisterModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterMember} className="catalog-modal-form">
              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kenjiro Nakamura"
                    value={newMemberForm.name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. member@example.com"
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98123 45678"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Membership Tier</label>
                  <select
                    value={newMemberForm.tier}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, tier: e.target.value })}
                  >
                    {TIERS.filter((t) => t !== 'All').map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Identification Proof Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Student ID, Passport, Aadhaar"
                    value={newMemberForm.idProof}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, idProof: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Membership Validity (Years)</label>
                  <select
                    value={newMemberForm.expiryYears}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, expiryYears: e.target.value })}
                  >
                    <option value={1}>1 Year Validity</option>
                    <option value={2}>2 Years Validity</option>
                    <option value={3}>3 Years Validity</option>
                    <option value={5}>5 Years (Scholar / Long-term)</option>
                  </select>
                </div>
              </div>

              <div className="form-field-item">
                <label>Address / Institutional Affiliation</label>
                <textarea
                  rows={2}
                  placeholder="Hostel, department, or residential address in Delhi NCR..."
                  value={newMemberForm.address}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, address: e.target.value })}
                />
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="dialog-secondary-btn"
                  onClick={() => setIsRegisterModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-primary-btn">
                  <Plus size={15} />
                  <span>Issue Membership Card</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MEMBER DIGITAL PASS INSPECTOR MODAL */}
      {inspectedMember && (
        <div className="modal-backdrop-overlay" onClick={() => setInspectedMember(null)}>
          <div className="modal-card-dialog book-inspector-modal member-pass-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-text">
                <span className="dialog-eyebrow">DIGITAL PATRON CARD</span>
                <h2 className="dialog-title">{inspectedMember.name}</h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setInspectedMember(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="inspector-content-body">
              {/* Digital Pass Card Graphic */}
              <div className="sora-digital-card-preview">
                <div className="card-top-row">
                  <div className="card-brand-mark">
                    <span className="card-emblem-square" />
                    <span className="card-brand-title">THE LIBRARY · NEW DELHI</span>
                  </div>
                  <span className="card-tier-pill">{inspectedMember.tier}</span>
                </div>

                <div className="card-mid-row">
                  <div className="card-holder-name">{inspectedMember.name}</div>
                  <div className="card-holder-num font-mono">{inspectedMember.memberNo}</div>
                </div>

                <div className="card-bottom-row">
                  <div className="card-meta-item">
                    <span>MEMBER SINCE</span>
                    <strong>{inspectedMember.joinDate}</strong>
                  </div>
                  <div className="card-meta-item">
                    <span>VALID UNTIL</span>
                    <strong>{inspectedMember.expiryDate}</strong>
                  </div>
                  <div className="card-qr-mark">
                    <QrCode size={40} />
                  </div>
                </div>
              </div>

              <div className="inspector-meta-grid">
                <div className="meta-card-item">
                  <span className="meta-label">Email</span>
                  <strong className="meta-value">{inspectedMember.email}</strong>
                </div>
                <div className="meta-card-item">
                  <span className="meta-label">Phone</span>
                  <strong className="meta-value">{inspectedMember.phone}</strong>
                </div>
                <div className="meta-card-item">
                  <span className="meta-label">ID Proof</span>
                  <strong className="meta-value">{inspectedMember.idProof}</strong>
                </div>
                <div className="meta-card-item">
                  <span className="meta-label">Outstanding Fines</span>
                  <strong className={`meta-value ${inspectedMember.finesDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {inspectedMember.finesDue > 0 ? `₹${inspectedMember.finesDue} Due` : '₹0 (Clear)'}
                  </strong>
                </div>
              </div>

              <div className="inspector-synopsis-box">
                <span className="synopsis-title">Address &amp; Notes</span>
                <p>{inspectedMember.address || 'No residential address on file.'}</p>
              </div>
            </div>

            <div className="modal-dialog-footer">
              <button
                type="button"
                className="dialog-secondary-btn"
                onClick={() => handleToggleStatus(inspectedMember.id)}
              >
                {inspectedMember.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
              </button>
              <button
                type="button"
                className="action-primary-btn"
                onClick={() => {
                  setEditingMember({ ...inspectedMember });
                  setInspectedMember(null);
                }}
              >
                <Edit2 size={14} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. EDIT MEMBER MODAL */}
      {editingMember && (
        <div className="modal-backdrop-overlay" onClick={() => setEditingMember(null)}>
          <div className="modal-card-dialog catalog-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-text">
                <span className="dialog-eyebrow">UPDATE PATRON</span>
                <h2 className="dialog-title">Edit Member Profile</h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setEditingMember(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="catalog-modal-form">
              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Name</label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    value={editingMember.email}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Phone</label>
                  <input
                    type="tel"
                    required
                    value={editingMember.phone}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Tier</label>
                  <select
                    value={editingMember.tier}
                    onChange={(e) => setEditingMember({ ...editingMember, tier: e.target.value })}
                  >
                    {TIERS.filter((t) => t !== 'All').map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="dialog-secondary-btn"
                  onClick={() => setEditingMember(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-primary-btn">
                  <Check size={15} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
