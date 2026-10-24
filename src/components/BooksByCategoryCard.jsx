import React from 'react';

export default function BooksByCategoryCard({ categories = [], totalBooks = 12480 }) {
  // Max count used for normalizing the bar width
  const maxCategoryCount = Math.max(
    ...categories.map((c) => c.count),
    4200
  );

  return (
    <div className="analytics-sub-card category-card">
      <div className="sub-card-header">
        <div className="title-row">
          <h3 className="sub-card-heading">BOOKS BY CATEGORY</h3>
          <span className="info-icon-badge" title="Catalog distribution across genres">
            ⓘ
          </span>
        </div>
        <button className="sub-card-options-btn" title="Category options" aria-label="Category options">
          •••
        </button>
      </div>

      <div className="category-summary-row">
        <span className="summary-label">Total Books</span>
        <span className="summary-number">{totalBooks.toLocaleString()}</span>
      </div>

      <div className="categories-list">
        {categories.map((cat) => {
          const pct = Math.min(100, Math.round((cat.count / maxCategoryCount) * 100));

          return (
            <div key={cat.name} className="category-bar-row">
              <span className="category-name">{cat.name}</span>

              <div className="category-track">
                <div
                  className="category-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <span className="category-count">{cat.count.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
