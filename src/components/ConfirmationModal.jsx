import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  eyebrow = 'CONFIRMATION REQUIRED',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  icon: CustomIcon,
  confirmIcon: CustomConfirmIcon,
  detailsCard = null,
  isLoading = false,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const IconComponent = CustomIcon || (variant === 'primary' ? CheckCircle2 : AlertTriangle);
  const ConfirmIconComponent = CustomConfirmIcon;

  return (
    <div className="modal-backdrop-overlay" onClick={() => !isLoading && onClose()}>
      <div
        className={`modal-card-dialog admin-confirm-modal ${variant}-variant`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="admin-confirm-header">
          <div className={`admin-confirm-icon-wrap ${variant}`}>
            <IconComponent size={22} />
          </div>
          <div className="admin-confirm-header-text">
            <span className={`dialog-eyebrow text-${variant}`}>{eyebrow}</span>
            <h2 id="confirm-modal-title" className="dialog-title">{title}</h2>
          </div>
          <button
            type="button"
            className="dialog-close-btn"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="admin-confirm-body">
          {typeof message === 'string' ? (
            <p className="admin-confirm-prompt-message">{message}</p>
          ) : (
            message
          )}

          {detailsCard && (
            <div className="admin-confirm-details-card">
              {detailsCard}
            </div>
          )}
        </div>

        <div className="modal-dialog-footer">
          <button
            type="button"
            className="dialog-secondary-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={variant === 'primary' ? 'action-primary-btn' : 'action-danger-btn'}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {ConfirmIconComponent && <ConfirmIconComponent size={14} />}
            <span>{isLoading ? 'Processing...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
