import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable Table Pagination Component
 * Matches the Japanese monochrome editorial aesthetic across all admin tables:
 * [ < ] [ 1 ] [ 2 ] ... [ 4 ] [ > ]
 */
export default function TablePagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  itemName = 'records',
  className = '',
}) {
  if (!totalItems || totalItems === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={`table-pagination-bar ${className}`}>
      <span className="pagination-info">
        Showing <strong className="pagination-highlight">{start}</strong> to{' '}
        <strong className="pagination-highlight">{end}</strong> of{' '}
        <strong className="pagination-highlight">{totalItems}</strong> {itemName}
      </span>

      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn"
          onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          title="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNo) => {
          // Show first, last, and window around current page
          if (
            pageNo === 1 ||
            pageNo === totalPages ||
            (pageNo >= currentPage - 1 && pageNo <= currentPage + 1)
          ) {
            return (
              <button
                key={pageNo}
                type="button"
                className={`pagination-number ${currentPage === pageNo ? 'active' : ''}`}
                onClick={() => onPageChange?.(pageNo)}
                aria-label={`Page ${pageNo}`}
                aria-current={currentPage === pageNo ? 'page' : undefined}
              >
                {pageNo}
              </button>
            );
          }
          if (pageNo === currentPage - 2 || pageNo === currentPage + 2) {
            return (
              <span key={pageNo} className="pagination-ellipsis">
                …
              </span>
            );
          }
          return null;
        })}

        <button
          type="button"
          className="pagination-btn"
          onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          title="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
