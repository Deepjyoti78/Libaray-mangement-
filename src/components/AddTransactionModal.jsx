import React, { useState } from 'react';
import { X, Check, ArrowLeftRight, Calendar, User, BookOpen, Clock, AlertCircle } from 'lucide-react';

export default function AddTransactionModal({ isOpen, onClose, onCreated }) {
  const [memberName, setMemberName] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [type, setType] = useState('Loan');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePresetDays = (days) => {
    const base = issueDate ? new Date(issueDate) : new Date();
    const newDue = new Date(base.getTime() + days * 86400000);
    setDueDate(newDue.toISOString().split('T')[0]);
  };

  const handleIssueDateChange = (val) => {
    setIssueDate(val);
    if (val) {
      const base = new Date(val);
      const newDue = new Date(base.getTime() + 14 * 86400000);
      setDueDate(newDue.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!memberName.trim() || !bookTitle.trim()) {
      setError('Member name and Book title are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          memberName: memberName.trim(),
          bookTitle: bookTitle.trim(),
          type,
          issueDate,
          dueDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue book');

      onCreated?.(data.loan);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card-dialog add-transaction-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-header-text">
            <span className="dialog-eyebrow">
              <ArrowLeftRight size={12} className="eyebrow-icon" />
              CIRCULATION DESK
            </span>
            <h2 className="dialog-title">Add Loan Transaction</h2>
          </div>
          <button
            type="button"
            className="dialog-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="catalog-modal-form add-transaction-form">
          {error && (
            <div className="dialog-error-banner">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Member Name */}
          <div className="form-field-item">
            <label htmlFor="txn-member-name">
              Member Full Name <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <User size={15} className="field-adornment-icon" />
              <input
                id="txn-member-name"
                type="text"
                placeholder="e.g. Ryan Korsgaard or Aoi Kinoshita"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          {/* Book Title */}
          <div className="form-field-item">
            <label htmlFor="txn-book-title">
              Book Title <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <BookOpen size={15} className="field-adornment-icon" />
              <input
                id="txn-book-title"
                type="text"
                placeholder="e.g. Clean Code or Norwegian Wood"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Transaction Type Segmented Selection */}
          <div className="form-field-item">
            <label>Transaction Type</label>
            <div className="transaction-type-selector" role="radiogroup" aria-label="Transaction Type">
              {['Loan', 'Renewal', 'Return'].map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={type === t}
                  className={`type-pill-btn ${type === t ? 'active' : ''}`}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range: Issue Date & Due Date side-by-side in 2 columns */}
          <div className="form-grid-2col dates-grid-row">
            <div className="form-field-item">
              <label htmlFor="txn-issue-date">
                <Calendar size={13} className="label-icon" />
                Issue Date <span className="required-star">*</span>
              </label>
              <input
                id="txn-issue-date"
                type="date"
                value={issueDate}
                onChange={(e) => handleIssueDateChange(e.target.value)}
                required
              />
            </div>

            <div className="form-field-item">
              <label htmlFor="txn-due-date">
                <Clock size={13} className="label-icon" />
                Due Date <span className="required-star">*</span>
              </label>
              <input
                id="txn-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Quick Duration Presets */}
          <div className="duration-presets-row">
            <span className="presets-caption">Quick Presets:</span>
            <button
              type="button"
              className="duration-chip-btn"
              onClick={() => handlePresetDays(7)}
            >
              +7 Days
            </button>
            <button
              type="button"
              className="duration-chip-btn active"
              onClick={() => handlePresetDays(14)}
            >
              +14 Days (Standard)
            </button>
            <button
              type="button"
              className="duration-chip-btn"
              onClick={() => handlePresetDays(21)}
            >
              +21 Days
            </button>
            <button
              type="button"
              className="duration-chip-btn"
              onClick={() => handlePresetDays(28)}
            >
              +28 Days
            </button>
          </div>

          {/* Footer Actions */}
          <div className="modal-dialog-footer">
            <button
              type="button"
              className="dialog-secondary-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="action-primary-btn"
              disabled={loading}
            >
              <Check size={16} />
              <span>{loading ? 'Recording...' : 'Confirm Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
