import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

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
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Loan Transaction</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error-banner">{error}</div>}

          <div className="form-field">
            <label className="field-label">Member Full Name</label>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. Ryan Korsgaard"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label className="field-label">Book Title</label>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. Clean Code"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-field-row">
            <div className="form-field">
              <label className="field-label">Transaction Type</label>
              <select
                className="field-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Loan">Loan</option>
                <option value="Renewal">Renewal</option>
                <option value="Return">Return</option>
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">Issue Date</label>
              <input
                type="date"
                className="field-input"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label className="field-label">Due Date</label>
              <input
                type="date"
                className="field-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-confirm" disabled={loading}>
              {loading ? 'Recording...' : 'Confirm Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
