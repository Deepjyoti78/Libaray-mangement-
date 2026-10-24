import React from 'react';

/**
 * KpiCard
 * Four equal-width cards in a single row with monochrome outline icons,
 * large bold numerical values, miniature vertical-bar sparklines, and trend footers.
 */
export default function KpiCard({
  icon: Icon,
  label,
  value,
  subtext,
  trend = '+0.94 last month',
  sparklineData = [8, 14, 18, 12, 22, 26, 20, 28],
}) {
  const maxVal = Math.max(...sparklineData, 30);

  return (
    <div className="kpi-metric-card">
      <div className="kpi-card-top">
        <div className="kpi-icon-wrap">
          <Icon size={18} strokeWidth={1.8} className="kpi-icon" />
        </div>

        <div className="kpi-content">
          <span className="kpi-label">{label}</span>
          <div className="kpi-value-row">
            <span className="kpi-value">{typeof value === 'number' ? value.toLocaleString() : value}</span>
          </div>
          {subtext && <span className="kpi-subtext">{subtext}</span>}
        </div>

        {/* Miniature vertical-bar sparkline graphic */}
        <div className="kpi-sparkline" aria-hidden="true">
          {sparklineData.map((h, i) => {
            const barHeightPct = Math.max(15, Math.min(100, Math.round((h / maxVal) * 100)));
            const isLatest = i >= sparklineData.length - 2;
            return (
              <div
                key={`bar-${i}`}
                className={`spark-bar ${isLatest ? 'spark-bar-dark' : 'spark-bar-light'}`}
                style={{ height: `${barHeightPct}%` }}
              />
            );
          })}
        </div>
      </div>

      <div className="kpi-footer">
        <span className="kpi-info-icon" title="Compared to previous monthly cycle">ⓘ</span>
        <span className="kpi-trend">
          <span className="trend-arrow">⌃</span> {trend}
        </span>
      </div>
    </div>
  );
}
