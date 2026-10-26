import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * SquareBlockChart
 * A pixel-block / square-block histogram replicating the reference design.
 * Each bar is constructed by stacking discrete square cells vertically,
 * with high-contrast cells for Books Issued and Books Returned.
 */
export default function SquareBlockChart({
  data = [],
  period = 'monthly',
  onPeriodChange,
  totalLoans = 10320,
}) {
  const { isDark } = useTheme();
  const [hoveredIdx, setHoveredIdx] = useState(5); // Default hovered on Jun (index 5) as in reference!

  // Y-axis tick marks
  const yTicks = [
    { value: 60000, label: '60k' },
    { value: 50000, label: '50k' },
    { value: 40000, label: '40k' },
    { value: 30000, label: '30k' },
    { value: 20000, label: '20k' },
    { value: 10000, label: '10k' },
    { value: 0, label: '0' },
  ];

  // Grid dimensions
  const svgWidth = 780;
  const svgHeight = 390;
  const paddingLeft = 48;
  const paddingRight = 18;
  const paddingTop = 16;
  const paddingBottom = 32;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // 30 vertical blocks for 60k max (each block = 2,000 units)
  const totalVerticalCells = 30;
  const cellSize = 9;
  const cellGap = 2.4;
  const stepY = cellSize + cellGap;

  const maxVal = 60000;
  const itemsCount = data.length || 12;
  const colSpacing = chartWidth / itemsCount;

  // Format numbers to 'k' format (e.g. 38k)
  const formatK = (val) => {
    if (val >= 1000) {
      const k = val / 1000;
      return Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`;
    }
    return String(val);
  };

  return (
    <div className="square-block-chart-card">
      {/* Top Header Bar */}
      <div className="chart-card-header">
        <div className="chart-card-title-wrap">
          <div className="title-row">
            <h3 className="chart-heading">CIRCULATION ACTIVITY</h3>
            <span className="info-icon-badge" title="Circulation loans and returns across the reporting period">
              ⓘ
            </span>
          </div>
          <div className="summary-legend-row">
            <div className="total-loans-display">
              <span className="summary-label">Total Loans</span>
              <span className="summary-number">{totalLoans.toLocaleString()}</span>
            </div>

            <div className="chart-legend-items">
              <div className="legend-item">
                <span className="legend-swatch swatch-issued" />
                <span className="legend-text">Books Issued</span>
              </div>
              <div className="legend-item">
                <span className="legend-swatch swatch-returned" />
                <span className="legend-text">Books Returned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Period Filter Controls */}
        <div className="chart-card-actions">
          <div className="period-pill-group" role="tablist" aria-label="Reporting interval">
            {['weekly', 'monthly', 'yearly'].map((p) => (
              <button
                key={p}
                type="button"
                className={`period-btn ${period === p ? 'active' : ''}`}
                onClick={() => onPeriodChange?.(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <button className="chart-options-menu-btn" title="Chart settings" aria-label="Chart settings">
            •••
          </button>
        </div>
      </div>

      {/* SVG Plotting Canvas */}
      <div className="chart-canvas-wrapper">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="square-block-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Pattern for background dot/square grid */}
            <pattern id="pixelGridPattern" width="10.2" height="10.2" patternUnits="userSpaceOnUse">
              <rect
                x="0"
                y="0"
                width="8"
                height="8"
                rx="0.5"
                fill={isDark ? '#0e0e13' : '#FAFAFA'}
                stroke={isDark ? '#1a1a24' : '#EEEEEE'}
                strokeWidth="0.75"
              />
            </pattern>
          </defs>

          {/* Background grid canvas */}
          <rect
            x={paddingLeft}
            y={paddingTop}
            width={chartWidth}
            height={chartHeight}
            fill={isDark ? '#0A0A0E' : 'url(#pixelGridPattern)'}
            stroke={isDark ? '#181822' : 'none'}
            strokeWidth="1"
            rx="4"
            className="chart-grid-bg"
          />

          {/* Horizontal Axis Guidelines and Y Labels */}
          {yTicks.map((tick, idx) => {
            const yPos = paddingTop + (idx / (yTicks.length - 1)) * chartHeight;
            return (
              <g key={`ytick-${tick.value}`} className="y-axis-group">
                <text
                  x={paddingLeft - 10}
                  y={yPos + 3.5}
                  textAnchor="end"
                  className="y-axis-label"
                  fill={isDark ? '#A1A1AA' : '#8E8E8E'}
                >
                  {tick.label}
                </text>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={paddingLeft + chartWidth}
                  y2={yPos}
                  stroke={isDark ? '#1F1F28' : '#EFEFEF'}
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Render Each Month's Square-Block Bar */}
          {data.map((item, colIdx) => {
            const colCenterX = paddingLeft + colIdx * colSpacing + colSpacing / 2;
            const barWidth = 2 * cellSize + cellGap; // 2 square blocks wide
            const barStartX = colCenterX - barWidth / 2;

            // Calculate stacked cell counts
            const issuedCells = Math.min(
              totalVerticalCells,
              Math.max(1, Math.round((item.issued / maxVal) * totalVerticalCells))
            );
            const returnedCells = Math.min(
              totalVerticalCells - issuedCells,
              Math.max(1, Math.round((item.returned / maxVal) * totalVerticalCells))
            );

            const isHovered = hoveredIdx === colIdx;

            return (
              <g
                key={`col-${item.key || colIdx}`}
                className={`chart-bar-column ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredIdx(colIdx)}
                onClick={() => setHoveredIdx(colIdx)}
                style={{ cursor: 'pointer' }}
              >
                {/* Transparent hit area for easy hover/touch */}
                <rect
                  x={colCenterX - colSpacing / 2}
                  y={paddingTop}
                  width={colSpacing}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Vertical Dashed Hover Guide Line */}
                {isHovered && (
                  <line
                    x1={colCenterX}
                    y1={paddingTop - 6}
                    x2={colCenterX}
                    y2={paddingTop + chartHeight}
                    stroke={isDark ? '#FFFFFF' : '#9E9E9E'}
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                )}

                {/* 2-Column Square Cells Stack */}
                {[0, 1].map((blockCol) => {
                  const cellX = barStartX + blockCol * (cellSize + cellGap);

                  return (
                    <g key={`col-part-${blockCol}`}>
                      {/* Books Issued (Pure White Cells in dark mode, Black in light mode) */}
                      {Array.from({ length: issuedCells }).map((_, rIdx) => {
                        const cellY =
                          paddingTop + chartHeight - (rIdx + 1) * stepY + cellGap;
                        return (
                          <rect
                            key={`issued-cell-${rIdx}`}
                            x={cellX}
                            y={cellY}
                            width={cellSize}
                            height={cellSize}
                            rx={0.6}
                            fill={isDark ? '#FFFFFF' : '#111111'}
                            className="pixel-cell cell-issued"
                          />
                        );
                      })}

                      {/* Books Returned (Refined Slate in dark mode, Light Gray in light mode) */}
                      {Array.from({ length: returnedCells }).map((_, rIdx) => {
                        const cellY =
                          paddingTop +
                          chartHeight -
                          (issuedCells + rIdx + 1) * stepY +
                          cellGap;
                        return (
                          <rect
                            key={`returned-cell-${rIdx}`}
                            x={cellX}
                            y={cellY}
                            width={cellSize}
                            height={cellSize}
                            rx={0.6}
                            fill={isDark ? '#4B4B58' : '#D4D4D4'}
                            className="pixel-cell cell-returned"
                          />
                        );
                      })}
                    </g>
                  );
                })}

                {/* Month X-Axis Label */}
                <text
                  x={colCenterX}
                  y={paddingTop + chartHeight + 20}
                  textAnchor="middle"
                  className={`x-axis-label ${isHovered ? 'x-label-active' : ''}`}
                  fill={isHovered ? (isDark ? '#FFFFFF' : '#111111') : (isDark ? '#A1A1AA' : '#737373')}
                >
                  {item.label?.toUpperCase() || item.key}
                </text>
              </g>
            );
          })}

          {/* Render Active Tooltip if a month is hovered */}
          {hoveredIdx !== null && data[hoveredIdx] && (() => {
            const activeItem = data[hoveredIdx];
            const colCenterX =
              paddingLeft + hoveredIdx * colSpacing + colSpacing / 2;

            // Constrain tooltip horizontally to stay inside chart
            const tooltipWidth = 145;
            const tooltipHeight = 70;
            const tooltipX = Math.min(
              chartWidth + paddingLeft - tooltipWidth,
              Math.max(paddingLeft, colCenterX + 12)
            );
            const tooltipY = Math.max(
              paddingTop,
              paddingTop + 60
            );

            return (
              <g className="chart-tooltip-group" pointerEvents="none">
                {/* Tooltip Background Card */}
                <rect
                  x={tooltipX}
                  y={tooltipY}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx="6"
                  fill={isDark ? '#181822' : '#FFFFFF'}
                  stroke={isDark ? '#2E2E3E' : '#E0E0E0'}
                  strokeWidth="1"
                  filter={isDark ? "drop-shadow(0px 4px 12px rgba(0,0,0,0.8))" : "drop-shadow(0px 4px 8px rgba(0,0,0,0.06))"}
                />

                {/* Tooltip Header: Month & Year */}
                <text
                  x={tooltipX + 12}
                  y={tooltipY + 18}
                  className="tooltip-header"
                  fill={isDark ? '#FFFFFF' : '#111111'}
                >
                  {activeItem.label} {activeItem.year || 2025}
                </text>

                {/* Tooltip Row 1: Books Issued */}
                <rect
                  x={tooltipX + 12}
                  y={tooltipY + 28}
                  width="7"
                  height="7"
                  rx="0.5"
                  fill={isDark ? '#FFFFFF' : '#111111'}
                />
                <text
                  x={tooltipX + 24}
                  y={tooltipY + 35}
                  className="tooltip-label"
                  fill={isDark ? '#A1A1AA' : '#666666'}
                >
                  Books Issued
                </text>
                <text
                  x={tooltipX + tooltipWidth - 12}
                  y={tooltipY + 35}
                  textAnchor="end"
                  className="tooltip-value"
                  fill={isDark ? '#FFFFFF' : '#111111'}
                >
                  {formatK(activeItem.issued)}
                </text>

                {/* Tooltip Row 2: Books Returned */}
                <rect
                  x={tooltipX + 12}
                  y={tooltipY + 46}
                  width="7"
                  height="7"
                  rx="0.5"
                  fill={isDark ? '#4B4B58' : '#D4D4D4'}
                />
                <text
                  x={tooltipX + 24}
                  y={tooltipY + 53}
                  className="tooltip-label"
                  fill={isDark ? '#A1A1AA' : '#666666'}
                >
                  Books Returned
                </text>
                <text
                  x={tooltipX + tooltipWidth - 12}
                  y={tooltipY + 53}
                  textAnchor="end"
                  className="tooltip-value"
                  fill={isDark ? '#FFFFFF' : '#111111'}
                >
                  {formatK(activeItem.returned)}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
