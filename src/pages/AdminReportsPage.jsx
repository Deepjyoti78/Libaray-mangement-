import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart2,
  TrendingUp,
  Users,
  Clock,
  Download,
  Calendar,
  BookOpen,
  Filter,
  CheckCircle2,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

const MONTHLY_CIRCULATION = [
  { month: 'Jan 2026', issued: 2850, returned: 2620, net: '+230' },
  { month: 'Feb 2026', issued: 3120, returned: 2980, net: '+140' },
  { month: 'Mar 2026', issued: 3450, returned: 3310, net: '+140' },
  { month: 'Apr 2026', issued: 3980, returned: 3720, net: '+260' },
  { month: 'May 2026', issued: 2900, returned: 3100, net: '-200' },
  { month: 'Jun 2026', issued: 4120, returned: 3890, net: '+230' },
  { month: 'Jul 2026', issued: 3680, returned: 3510, net: '+170' },
  { month: 'Aug 2026', issued: 3790, returned: 3640, net: '+150' },
  { month: 'Sep 2026', issued: 4050, returned: 3880, net: '+170' },
  { month: 'Oct 2026', issued: 4320, returned: 4180, net: '+140' },
];

const TOP_BORROWED_BOOKS = [
  { rank: 1, title: 'Norwegian Wood', author: 'Haruki Murakami', category: 'Fiction', borrows: 428, turnover: '94%' },
  { rank: 2, title: 'One Piece: Romance Dawn (Vol. 1)', author: 'Eiichiro Oda', category: 'Manga', borrows: 392, turnover: '98%' },
  { rank: 3, title: 'Kokoro', author: 'Natsume Soseki', category: 'Literature', borrows: 310, turnover: '85%' },
  { rank: 4, title: 'Your Name (Kimi no Na wa)', author: 'Makoto Shinkai', category: 'Fiction', borrows: 285, turnover: '92%' },
  { rank: 5, title: 'Demon Slayer (Vol. 1)', author: 'Koyoharu Gotouge', category: 'Manga', borrows: 274, turnover: '89%' },
  { rank: 6, title: 'Modern Japanese Architecture', author: 'Kengo Kuma', category: 'Arts & Culture', borrows: 215, turnover: '76%' },
  { rank: 7, title: 'Snow Country', author: 'Yasunari Kawabata', category: 'Literature', borrows: 198, turnover: '78%' },
  { rank: 8, title: 'AI & Robotics in Japan', author: 'Dr. Hiroshi Ishiguro', category: 'Science & Tech', borrows: 165, turnover: '70%' },
];

const CATEGORY_DISTRIBUTION = [
  { name: 'Fiction', count: 3820, percent: 31, color: '#1A1A1A' },
  { name: 'Manga & Graphic Novels', count: 3200, percent: 26, color: '#333333' },
  { name: 'Science & Tech', count: 2460, percent: 20, color: '#555555' },
  { name: 'Japanese History', count: 1840, percent: 15, color: '#777777' },
  { name: 'Arts & Traditional Crafts', count: 1160, percent: 8, color: '#999999' },
];

export default function AdminReportsPage() {
  const { isDark } = useTheme();
  const [reportPeriod, setReportPeriod] = useState('2026');

  // Export full report CSV
  const handleExportFullReport = () => {
    const headers = ['Month', 'Volumes Issued', 'Volumes Returned', 'Net Circulation'];
    const rows = MONTHLY_CIRCULATION.map((r) => [
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
            <span>Export Full Annual Report</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div className="bookings-kpi-grid">
        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">ANNUAL CIRCULATION</span>
            <div className="kpi-icon-wrap"><BarChart2 size={17} /></div>
          </div>
          <div className="kpi-main-number">36,260 Loans</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend positive">+14.2% YoY growth</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">PATRON RETENTION</span>
            <div className="kpi-icon-wrap"><Users size={17} /></div>
          </div>
          <div className="kpi-main-number">94.2%</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend positive">Active borrowers returning</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">COLLECTION UTILIZATION</span>
            <div className="kpi-icon-wrap"><TrendingUp size={17} /></div>
          </div>
          <div className="kpi-main-number">68.5%</div>
          <div className="kpi-footer-row">
            <span className="kpi-sub-label">High active turnover</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">AVG. LOAN DURATION</span>
            <div className="kpi-icon-wrap"><Clock size={17} /></div>
          </div>
          <div className="kpi-main-number">11.4 Days</div>
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
              <h2 className="reports-card-title">Monthly Lending &amp; Return Flow (2026)</h2>
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
                {MONTHLY_CIRCULATION.map((m) => (
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
                            width: `${Math.min(100, (m.issued / 4500) * 100)}%`,
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
            {CATEGORY_DISTRIBUTION.map((cat, idx) => {
              const darkColors = ['#FFFFFF', '#E4E4E7', '#A1A1AA', '#71717A', '#52525B'];
              return (
                <div key={cat.name} className="cat-bar-item">
                  <div className="cat-bar-labels">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-count-pct">
                      {cat.count.toLocaleString()} titles ({cat.percent}%)
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
              {TOP_BORROWED_BOOKS.slice(0, 5).map((b) => (
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
