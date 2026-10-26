import React, { useState } from 'react';
import { Search, Plus, MoreHorizontal, Check, RefreshCw } from 'lucide-react';
import TablePagination from './TablePagination';

export default function RecentLoanActivityTable({
  loans = [],
  total = 0,
  page = 1,
  limit = 10,
  search = '',
  onSearchChange,
  onPageChange,
  onOpenAddModal,
  onStatusUpdate,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Close active dropdown when clicking outside
  React.useEffect(() => {
    if (!activeMenuId) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.action-menu-anchor')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activeMenuId]);

  // Toggle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(loans.map((l) => l.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // Toggle single row selection
  const handleSelectRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Format date nicely e.g. "21 Oct 2025"
  const formatDateStr = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const [y, m, d] = dateStr.split('-');
      if (!y || !m || !d) return dateStr;
      const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Monochrome status pill styling
  const renderStatusPill = (status) => {
    const s = (status || '').toLowerCase().replace(/_/g, ' ');
    let label = 'Active';
    let pillClass = 'status-active';

    if (s.includes('overdue')) {
      label = 'Overdue';
      pillClass = 'status-overdue';
    } else if (s.includes('due')) {
      label = 'Due soon';
      pillClass = 'status-due-soon';
    } else if (s.includes('return')) {
      label = 'Returned';
      pillClass = 'status-returned';
    } else {
      label = 'Active';
      pillClass = 'status-active';
    }

    return (
      <span className={`monochrome-status-pill ${pillClass}`}>
        <span className="status-dot" />
        <span className="status-text">{label}</span>
      </span>
    );
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="recent-activity-card">
      {/* Table Header Controls */}
      <div className="table-card-header">
        <div className="title-row">
          <h3 className="table-heading">RECENT LOAN ACTIVITY</h3>
          <span className="info-icon-badge" title="Latest borrowing transactions and status log">
            ⓘ
          </span>
        </div>

        <div className="table-card-controls">
          <div className="table-search-input-wrap">
            <Search size={14} className="table-search-icon" />
            <input
              type="text"
              className="table-search-input"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn-add-transaction"
            onClick={onOpenAddModal}
          >
            <Plus size={14} className="plus-icon" />
            <span>Add Transaction</span>
          </button>

          <button className="table-options-btn" title="Table options" aria-label="Table options">
            •••
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-responsive-container">
        <table className="monochrome-table">
          <thead>
            <tr>
              <th className="th-checkbox">
                <input
                  type="checkbox"
                  className="table-checkbox"
                  checked={loans.length > 0 && selectedIds.size === loans.length}
                  onChange={handleSelectAll}
                  aria-label="Select all transactions"
                />
              </th>
              <th className="th-id">ID</th>
              <th className="th-member">MEMBER</th>
              <th className="th-book">BOOK TITLE</th>
              <th className="th-type">TYPE</th>
              <th className="th-date">ISSUE DATE</th>
              <th className="th-date">DUE DATE</th>
              <th className="th-status">STATUS</th>
              <th className="th-actions">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loans.length === 0 ? (
              <tr>
                <td colSpan="9" className="td-empty">
                  No matching loan transactions found.
                </td>
              </tr>
            ) : (
              loans.map((row, index) => {
                const isSelected = selectedIds.has(row.id);
                const isMenuOpen = activeMenuId === row.id;
                const isNearBottom = index >= loans.length - 3;

                return (
                  <tr key={`loan-row-${row.id}`} className={isSelected ? 'row-selected' : ''}>
                    <td className="td-checkbox">
                      <input
                        type="checkbox"
                        className="table-checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(row.id)}
                        aria-label={`Select transaction ${row.loan_code}`}
                      />
                    </td>
                    <td className="td-id">
                      <span className="loan-code-text">{row.loan_code}</span>
                    </td>
                    <td className="td-member">
                      <span className="member-name-text">{row.member_name}</span>
                    </td>
                    <td className="td-book">
                      <span className="book-title-text">{row.book_title}</span>
                    </td>
                    <td className="td-type">
                      <span className="type-text">{row.type || 'Loan'}</span>
                    </td>
                    <td className="td-date">
                      <span className="date-text">{formatDateStr(row.issue_date)}</span>
                    </td>
                    <td className="td-date">
                      <span className="date-text">{formatDateStr(row.due_date)}</span>
                    </td>
                    <td className="td-status">
                      {renderStatusPill(row.status)}
                    </td>
                    <td className="td-actions">
                      <div className="action-menu-anchor">
                        <button
                          type="button"
                          className="row-action-btn"
                          onClick={() => setActiveMenuId(isMenuOpen ? null : row.id)}
                          aria-label="Row action menu"
                        >
                          •••
                        </button>

                        {isMenuOpen && (
                          <div className={`row-action-dropdown ${isNearBottom ? 'dropdown-open-up' : ''}`}>
                            <button
                              onClick={() => {
                                onStatusUpdate?.(row.id, 'returned');
                                setActiveMenuId(null);
                              }}
                            >
                              Mark as Returned
                            </button>
                            <button
                              onClick={() => {
                                onStatusUpdate?.(row.id, 'due_soon');
                                setActiveMenuId(null);
                              }}
                            >
                              Mark as Due Soon
                            </button>
                            <button
                              onClick={() => {
                                onStatusUpdate?.(row.id, 'overdue');
                                setActiveMenuId(null);
                              }}
                            >
                              Mark as Overdue
                            </button>
                            <button
                              onClick={() => {
                                onStatusUpdate?.(row.id, 'active');
                                setActiveMenuId(null);
                              }}
                            >
                              Mark as Active
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={limit}
        onPageChange={onPageChange}
        itemName="records"
      />
    </div>
  );
}
