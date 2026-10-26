import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function OverdueTrendChart({ data = [] }) {
  const { isDark } = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // SVG Dimensions
  const svgWidth = 360;
  const svgHeight = 125;
  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 12;
  const paddingBottom = 24;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxOverdue = 4000;
  const totalVerticalCells = 10;
  const cellSize = 5;
  const cellGap = 1.8;
  const stepY = cellSize + cellGap;

  const count = data.length || 20;
  const barSpacing = chartWidth / count;

  return (
    <div className="analytics-sub-card overdue-trend-card">
      <div className="sub-card-header">
        <div className="title-row">
          <h3 className="sub-card-heading">OVERDUE TREND</h3>
          <span className="info-icon-badge" title="Daily overdue loan volume">
            ⓘ
          </span>
        </div>
        <button className="sub-card-options-btn" title="Trend options" aria-label="Trend options">
          •••
        </button>
      </div>

      <div className="overdue-canvas-wrapper">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="overdue-trend-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y Axis Guide lines & Labels */}
          {[
            { val: 4000, label: '4k' },
            { val: 3000, label: '3k' },
            { val: 2000, label: '2k' },
            { val: 1000, label: '1k' },
            { val: 0, label: '0' },
          ].map((tick, idx, arr) => {
            const y = paddingTop + (idx / (arr.length - 1)) * chartHeight;
            return (
              <g key={`y-${tick.label}`} className="overdue-y-line">
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="overdue-y-label"
                  fill={isDark ? '#A1A1AA' : '#8E8E8E'}
                >
                  {tick.label}
                </text>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + chartWidth}
                  y2={y}
                  stroke={isDark ? '#20202A' : '#EFEFEF'}
                  strokeWidth="0.8"
                />
              </g>
            );
          })}

          {/* Render Stacked Pixel-Block Bars */}
          {data.map((item, idx) => {
            const xCenter = paddingLeft + idx * barSpacing + barSpacing / 2;
            const barW = cellSize;
            const x = xCenter - barW / 2;

            const cellsToFill = Math.min(
              totalVerticalCells,
              Math.max(1, Math.round((item.count / maxOverdue) * totalVerticalCells))
            );

            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={`overdue-bar-${idx}`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Hit area */}
                <rect
                  x={xCenter - barSpacing / 2}
                  y={paddingTop}
                  width={barSpacing}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Vertical Stack of square blocks */}
                {Array.from({ length: cellsToFill }).map((_, cIdx) => {
                  const y = paddingTop + chartHeight - (cIdx + 1) * stepY + cellGap;
                  return (
                    <rect
                      key={`overdue-cell-${cIdx}`}
                      x={x}
                      y={y}
                      width={cellSize}
                      height={cellSize}
                      rx={0.5}
                      fill={isDark ? (isHovered ? '#FFFFFF' : '#D4D4D8') : (isHovered ? '#000000' : '#111111')}
                      className="overdue-pixel-cell"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* X Axis Bottom Labels */}
          <text
            x={paddingLeft}
            y={paddingTop + chartHeight + 16}
            textAnchor="start"
            className="overdue-x-label"
            fill={isDark ? '#A1A1AA' : '#8E8E8E'}
          >
            1 NOV
          </text>
          <text
            x={paddingLeft + chartWidth}
            y={paddingTop + chartHeight + 16}
            textAnchor="end"
            className="overdue-x-label"
            fill={isDark ? '#A1A1AA' : '#8E8E8E'}
          >
            30 NOV 2025
          </text>

          {/* Tooltip on hover */}
          {hoveredIndex !== null && data[hoveredIndex] && (() => {
            const itm = data[hoveredIndex];
            const xCenter = paddingLeft + hoveredIndex * barSpacing + barSpacing / 2;
            const ttW = 90;
            const ttH = 34;
            const ttX = Math.min(paddingLeft + chartWidth - ttW, Math.max(paddingLeft, xCenter - ttW / 2));
            const ttY = Math.max(0, paddingTop - 4);

            return (
              <g pointerEvents="none">
                <rect
                  x={ttX}
                  y={ttY}
                  width={ttW}
                  height={ttH}
                  rx="4"
                  fill={isDark ? '#181822' : '#FFFFFF'}
                  stroke={isDark ? '#2E2E3E' : '#E0E0E0'}
                  strokeWidth="0.8"
                  filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.3))"
                />
                <text x={ttX + ttW / 2} y={ttY + 14} textAnchor="middle" className="overdue-tt-date" fill={isDark ? '#A1A1AA' : '#666666'}>
                  {itm.date}
                </text>
                <text x={ttX + ttW / 2} y={ttY + 27} textAnchor="middle" className="overdue-tt-count" fill={isDark ? '#FFFFFF' : '#111111'}>
                  {itm.count.toLocaleString()} overdue
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
