import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/theme';
import { BarChart2, TrendingUp, Users, Clock, Download } from 'lucide-react';




export default function AdminReportsPage() {
  const { isDark } = useTheme();
  const [report, setReport] = useState({ monthly: [], topBooks: [], categories: [], totalLoans: 0, retention: 0, utilization: 0, averageLoanDays: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch('/api/admin/reports', { credentials: 'include', signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load reports.');
        if (!controller.signal.aborted) setReport(data);
      } catch (cause) { if (!controller.signal.aborted) setError(cause.message); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, []);

  // Export full report CSV
  const handleExportFullReport = () => {
    const headers = ['Month', 'Volumes Issued', 'Volumes Returned', 'Net Circulation'];
    const rows = report.monthly.map((r) => [
      `"${r.month}"`,
      r.issued,
      r.returned,
      `"${r.net}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sora_Circulation_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-bookings-page admin-reports-page">
      {error && <p role="alert">{error}</p>}
      {loading && <p role="status">Loading reports…</p>}
      {/* 1. Page Header */}
      <div className="bookings-header-wrap">
        <div className="bookings-header-titles">
          <span className="bookings-eyebrow">SORA INTELLIGENCE &amp; OPERATIONAL METRICS</span>
          <h1 className="bookings-main-title">Reports &amp; Circulation Analytics</h1>
          <p className="bookings-subtitle">
            Detailed analysis of book loans, patron traffic, collection turnover, and historical circulation data.
          </p>
        </div>

        <div className="bookings-header-actions">
          <button
            type="button"
            className="action-pill-btn"
            onClick={handleExportFullReport}
            title="Download annual circulation report"
          >
            <Download size={14} className="pill-cal-icon" />
            <span>Export Circulation Report</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div className="bookings-kpi-grid">
        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">TOTAL CIRCULATION</span>
            <div className="kpi-icon-wrap"><BarChart2 size={17} /></div>
          </div>
          <div className="kpi-main-number">{report.totalLoans.toLocaleString()} Loans</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend positive">Recorded lending transactions</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">PATRON RETENTION</span>
            <div className="kpi-icon-wrap"><Users size={17} /></div>
          </div>
          <div className="kpi-main-number">{report.retention}%</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend positive">Active borrowers returning</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">COLLECTION UTILIZATION</span>
            <div className="kpi-icon-wrap"><TrendingUp size={17} /></div>
          </div>
          <div className="kpi-main-number">{report.utilization}%</div>
          <div className="kpi-footer-row">
            <span className="kpi-sub-label">High active turnover</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">AVG. LOAN DURATION</span>
            <div className="kpi-icon-wrap"><Clock size={17} /></div>
          </div>
          <div className="kpi-main-number">{report.averageLoanDays} Days</div>
          <div className="kpi-footer-row">
            <span className="kpi-sub-label">Standard 14-day policy</span>
          </div>
        </div>
      </div>

      {/* 3. Monthly Circulation Table & Progress */}
      <div className="reports-analytics-grid">
        {/* Monthly table */}
        <div className="reports-card-panel">
          <div className="reports-card-header">
            <div className="reports-card-title-box">
              <h2 className="reports-card-title">Monthly Lending &amp; Return Flow</h2>
              <span className="reports-card-subtitle">Volume transactions processed through circulation desk</span>
            </div>
          </div>

          <div className="reports-mini-table-wrap">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Issued</th>
                  <th>Returned</th>
                  <th>Net Growth</th>
                  <th>Turnover Bar</th>
                </tr>
              </thead>
              <tbody>
                {report.monthly.map((m) => (
                  <tr key={m.month}>
                    <td style={{ fontWeight: 600, color: isDark ? '#FFFFFF' : '#111111' }}>{m.month}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px', color: isDark ? '#E4E4E7' : '#111111' }}>{m.issued.toLocaleString()}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px', color: isDark ? '#D4D4D8' : '#333333' }}>{m.returned.toLocaleString()}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: m.net.startsWith('+')
                            ? (isDark ? '#34D399' : '#047857')
                            : (isDark ? '#F87171' : '#B91C1C'),
                        }}
                      >
                        {m.net}
                      </span>
                    </td>
                    <td>
                      <div className="mini-chart-bar-track">
                        <div
                          className="mini-chart-bar-fill"
                          style={{
                            width: `${Math.min(100, (m.issued / Math.max(1, ...report.monthly.map((row) => row.issued))) * 100)}%`,
                            backgroundColor: isDark ? '#FFFFFF' : '#111111',
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Share & Top Titles */}
        <div className="reports-card-panel">
          <div className="reports-card-header">
            <div className="reports-card-title-box">
              <h2 className="reports-card-title">Category Distribution</h2>
              <span className="reports-card-subtitle">Collection composition across subjects</span>
            </div>
          </div>

          <div className="category-bars-list">
            {report.categories.map((cat, idx) => {
              const darkColors = ['#FFFFFF', '#E4E4E7', '#A1A1AA', '#71717A', '#52525B'];
              return (
                <div key={cat.name} className="cat-bar-item">
                  <div className="cat-bar-labels">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-count-pct">
                      {cat.count.toLocaleString()} copies ({cat.percent}%)
                    </span>
                  </div>
                  <div className="copies-progress-track">
                    <div
                      className="copies-progress-bar"
                      style={{
                        width: `${cat.percent}%`,
                        backgroundColor: isDark ? (darkColors[idx] || '#FFFFFF') : cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Borrowed Titles */}
          <div className="reports-top-titles-section">
            <h3 className="section-small-title">Most Borrowed Volumes</h3>
            <div className="top-titles-list">
              {report.topBooks.slice(0, 5).map((b) => (
                <div key={b.rank} className="top-title-row">
                  <div className="top-rank-badge">#{b.rank}</div>
                  <div className="top-title-text">
                    <span className="top-book-name">{b.title}</span>
                    <span className="top-author">{b.author} · {b.category}</span>
                  </div>
                  <div className="top-borrow-count font-mono font-semibold">
                    {b.borrows} loans
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
