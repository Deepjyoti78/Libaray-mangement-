import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { config } from '../config.js';
import { query, transaction } from '../db/connection.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { validateBody, staffLoginSchema, checkinSchema } from '../middleware/validate.js';
import { processCheckin } from '../services/checkinService.js';
import { getBookingByRef, cancelReservation } from '../services/bookingService.js';
import { validateStatusTransition, logAuditEvent } from '../services/statusService.js';
import { getNowInKolkata, isValidDate } from '../utils/dates.js';
import { applyRecordChanges, listRecords, getReports } from '../services/managementService.js';

const router = express.Router();

/**
 * POST /api/admin/auth/login
 * Staff login with rate limiting, password hash verification, and secure cookie/token.
 */
router.post(
  '/auth/login',
  rateLimit({ windowMs: 60000, maxRequests: 5, message: 'Too many login attempts. Please wait 1 minute.' }),
  validateBody(staffLoginSchema),
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const cleanEmail = email.trim().toLowerCase();

      const userRes = await query(
        `SELECT id, name, email, password_hash, role, active 
         FROM staff_users 
         WHERE LOWER(email) = $1;`,
        [cleanEmail]
      );

      if (userRes.rows.length === 0 || !userRes.rows[0].active) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const user = userRes.rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Generate JWT
      const token = jwt.sign(
        { sub: user.id, email: user.email, role: user.role, name: user.name },
        config.jwtSecret,
        { expiresIn: config.tokenExpiry }
      );

      // Set httpOnly cookie
      res.cookie('staff_token', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
      });

      await logAuditEvent({ query }, {
        actorType: 'staff',
        actorId: user.id,
        action: 'STAFF_LOGIN',
        entityType: 'staff_user',
        entityId: user.email,
        metadata: { ip: req.ip },
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Authentication failed.' });
    }
  }
);

/**
 * POST /api/admin/auth/logout
 */
router.post('/auth/logout', (req, res) => {
  res.clearCookie('staff_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * GET /api/admin/auth/me
 */
router.get('/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

/**
 * GET /api/admin/stats?date=YYYY-MM-DD
 * Operational summary for dashboard
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const selectedDate = req.query.date || getNowInKolkata().dateStr;

    // Daily totals
    const countsRes = await query(
      `SELECT 
         COUNT(*)::int as total_bookings,
         COUNT(*) FILTER (WHERE status = 'confirmed')::int as expected_count,
         COUNT(*) FILTER (WHERE status = 'checked_in')::int as checked_in_count,
         COUNT(*) FILTER (WHERE status = 'completed')::int as completed_count,
         COUNT(*) FILTER (WHERE status = 'cancelled')::int as cancelled_count,
         COUNT(*) FILTER (WHERE status = 'no_show')::int as no_show_count
       FROM bookings 
       WHERE visit_date = $1;`,
      [selectedDate]
    );

    // Capacity breakdown by facility and session
    const capacityRes = await query(
      `SELECT f.id as facility_id, f.name as facility_name,
              s.id as session_id, s.name as session_name, s.start_time, s.end_time,
              COALESCE(fsc.capacity, 10) as total_capacity,
              (
                SELECT COUNT(*)::int FROM bookings b
                WHERE b.visit_date = $1
                  AND b.facility_id = f.id
                  AND b.session_id = s.id
                  AND b.status IN ('confirmed', 'checked_in')
              ) as booked_count
       FROM facilities f
       CROSS JOIN sessions s
       LEFT JOIN facility_session_capacities fsc
         ON fsc.facility_id = f.id AND fsc.session_id = s.id
       WHERE f.active = true AND s.active = true
       ORDER BY f.name, s.start_time;`,
      [selectedDate]
    );

    // Upcoming next 5 reservations for the day
    const upcomingRes = await query(
      `SELECT b.booking_ref, b.visitor_name, b.visitor_email, b.facility_id, f.name as facility_name,
              b.session_id, s.name as session_name, s.start_time, s.end_time, b.status, b.created_at
       FROM bookings b
       LEFT JOIN facilities f ON f.id = b.facility_id
       LEFT JOIN sessions s ON s.id = b.session_id
       WHERE b.visit_date = $1 AND b.status IN ('confirmed', 'checked_in')
       ORDER BY s.start_time ASC, b.created_at ASC
       LIMIT 8;`,
      [selectedDate]
    );

    res.json({
      date: selectedDate,
      summary: countsRes.rows[0] || {
        total_bookings: 0,
        expected_count: 0,
        checked_in_count: 0,
        completed_count: 0,
        cancelled_count: 0,
        no_show_count: 0,
      },
      capacityBreakdown: capacityRes.rows.map((r) => ({
        ...r,
        remaining_capacity: Math.max(0, parseInt(r.total_capacity, 10) - parseInt(r.booked_count, 10)),
      })),
      upcomingBookings: upcomingRes.rows,
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Failed to load dashboard metrics.' });
  }
});

/**
 * GET /api/admin/bookings
 * Reservation management list with filters and search
 */
router.get('/bookings', requireAuth, async (req, res) => {
  try {
    const { date, facilityId, sessionId, status, search, limit = 50, offset = 0 } = req.query;

    let whereClauses = [];
    let params = [];
    let pIdx = 1;

    if (date) {
      whereClauses.push(`b.visit_date = $${pIdx++}`);
      params.push(date);
    }
    if (facilityId) {
      whereClauses.push(`b.facility_id = $${pIdx++}`);
      params.push(facilityId);
    }
    if (sessionId) {
      whereClauses.push(`b.session_id = $${pIdx++}`);
      params.push(sessionId);
    }
    if (status) {
      whereClauses.push(`b.status = $${pIdx++}`);
      params.push(status);
    }
    if (search) {
      whereClauses.push(
        `(LOWER(b.booking_ref) LIKE $${pIdx} OR LOWER(b.visitor_name) LIKE $${pIdx} OR LOWER(b.visitor_email) LIKE $${pIdx})`
      );
      params.push(`%${search.trim().toLowerCase()}%`);
      pIdx++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(*)::int as total FROM bookings b ${whereSql};`, params);
    const total = countRes.rows[0]?.total || 0;

    const dataSql = `
      SELECT b.id, b.booking_ref, b.facility_id, f.name as facility_name,
             b.session_id, s.name as session_name, s.start_time, s.end_time,
             b.visit_date, b.visitor_name, b.visitor_email, b.membership_no,
             b.status, b.created_at, b.cancelled_at, b.cancellation_reason,
             b.checked_in_at, u.name as checked_in_by_name
      FROM bookings b
      LEFT JOIN facilities f ON f.id = b.facility_id
      LEFT JOIN sessions s ON s.id = b.session_id
      LEFT JOIN staff_users u ON u.id = b.checked_in_by
      ${whereSql}
      ORDER BY b.visit_date DESC, s.start_time ASC, b.created_at DESC
      LIMIT $${pIdx++} OFFSET $${pIdx++};
    `;

    const dataRes = await query(dataSql, [...params, parseInt(limit, 10), parseInt(offset, 10)]);

    res.json({
      total,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      bookings: dataRes.rows.map((b) => ({
        ...b,
        visit_date: b.visit_date instanceof Date ? b.visit_date.toISOString().split('T')[0] : String(b.visit_date),
      })),
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to retrieve bookings list.' });
  }
});

/**
 * GET /api/admin/bookings/:ref
 * Detailed view of reservation with staff audit history
 */
router.get('/bookings/:ref', requireAuth, async (req, res) => {
  try {
    const booking = await getBookingByRef(req.params.ref, { isStaff: true });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const auditRes = await query(
      `SELECT * FROM audit_events 
       WHERE entity_type = 'booking' AND entity_id = $1 
       ORDER BY created_at DESC;`,
      [req.params.ref]
    );

    res.json({
      booking,
      auditHistory: auditRes.rows,
    });
  } catch {
    res.status(500).json({ error: 'Failed to load booking details.' });
  }
});

/**
 * POST /api/admin/check-in
 * QR code scanner or manual reference check-in endpoint
 */
router.post(
  '/check-in',
  requireAuth,
  validateBody(checkinSchema),
  async (req, res) => {
    try {
      const result = await processCheckin({
        payload: req.body.payload,
        staffUserId: req.user.id,
      });

      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Check-in validation failed.' });
    }
  }
);

/**
 * POST /api/admin/bookings/:ref/status
 * Manually update status (e.g. cancel, mark completed, or mark no-show)
 */
router.post('/bookings/:ref/status', requireAuth, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const { ref } = req.params;

    if (!['cancelled', 'completed', 'no_show', 'checked_in'].includes(status)) {
      return res.status(400).json({ error: 'Invalid target status requested.' });
    }

    if (status === 'cancelled') {
      const result = await cancelReservation(ref, {
        isStaff: true,
        staffId: req.user.id,
        reason: reason || 'Cancelled by staff administrator',
      });
      return res.json(result);
    }
    if (status === 'checked_in') {
      return res.json(await processCheckin({ payload: ref, staffUserId: req.user.id }));
    }

    // Execute state transition
    const result = await transaction(async (tx) => {
      const bRes = await tx.query(`SELECT * FROM bookings WHERE booking_ref = $1 FOR UPDATE;`, [ref]);
      if (bRes.rows.length === 0) throw new Error('Booking not found.');
      const b = bRes.rows[0];

      validateStatusTransition(b.status, status);

      const nowIso = new Date().toISOString();
      await tx.query(
        `UPDATE bookings SET status = $1, updated_at = $2 WHERE id = $3;`,
        [status, nowIso, b.id]
      );

      await logAuditEvent(tx, {
        actorType: 'staff',
        actorId: req.user.id,
        action: `STATUS_CHANGED_TO_${status.toUpperCase()}`,
        entityType: 'booking',
        entityId: ref,
        metadata: { previousStatus: b.status, newStatus: status, reason },
      });

      return { success: true, bookingRef: ref, previousStatus: b.status, newStatus: status };
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/admin/settings
 */
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const settingsRes = await query(`SELECT key, value, description FROM settings;`);
    const capacitiesRes = await query(
      `SELECT fsc.facility_id, f.name as facility_name,
              fsc.session_id, s.name as session_name,
              fsc.capacity
       FROM facility_session_capacities fsc
       JOIN facilities f ON f.id = fsc.facility_id
       JOIN sessions s ON s.id = fsc.session_id
       ORDER BY f.name, s.start_time;`
    );
    const closuresRes = await query(
      `SELECT id, override_date, is_closed, reason, created_at 
       FROM closure_dates 
       ORDER BY override_date ASC;`
    );

    const settingsMap = {};
    settingsRes.rows.forEach((r) => {
      try { settingsMap[r.key] = JSON.parse(r.value); } catch { settingsMap[r.key] = r.value; }
    });

    res.json({
      settings: settingsMap,
      capacities: capacitiesRes.rows,
      closures: closuresRes.rows.map((c) => ({
        ...c,
        override_date: c.override_date instanceof Date ? c.override_date.toISOString().split('T')[0] : String(c.override_date),
      })),
    });
  } catch {
    res.status(500).json({ error: 'Failed to load settings.' });
  }
});

/**
 * PUT /api/admin/settings
 * Update settings and capacities
 */
router.put('/settings', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const settingsSchema = z.object({
      daily_booking_limit: z.coerce.number().int().min(1).max(20).optional(),
      advance_booking_days: z.coerce.number().int().min(0).max(365).optional(),
      cancellation_cutoff_hours: z.coerce.number().min(0).max(8760).optional(),
      opening_days: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])).max(7).optional(),
      require_membership: z.boolean().optional(),
      standard_loan_days: z.coerce.number().int().min(1).max(365).optional(),
      max_active_loans_general: z.coerce.number().int().min(1).max(100).optional(),
      max_active_loans_scholar: z.coerce.number().int().min(1).max(100).optional(),
      overdue_fine_per_day: z.coerce.number().min(0).max(10000).optional(),
    }).strict();
    const { settings, capacities } = z.object({
      settings: settingsSchema.default({}),
      capacities: z.array(z.object({ facility_id: z.string().min(1), session_id: z.string().min(1), capacity: z.coerce.number().int().min(0).max(1000000) }).passthrough()).max(100).default([]),
    }).parse(req.body);

    await transaction(async (tx) => {
      for (const [key, val] of Object.entries(settings)) {
        const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
        await tx.query(
          `INSERT INTO settings (key, value) VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();`,
          [key, valStr]
        );
      }

      for (const cap of capacities) {
        if (cap.facility_id && cap.session_id && cap.capacity !== undefined) {
          await tx.query(
            `INSERT INTO facility_session_capacities (facility_id, session_id, capacity)
             VALUES ($1, $2, $3)
             ON CONFLICT (facility_id, session_id) DO UPDATE SET capacity = EXCLUDED.capacity;`,
            [cap.facility_id, cap.session_id, parseInt(cap.capacity, 10)]
          );
        }
      }

      await logAuditEvent(tx, {
        actorType: 'staff',
        actorId: req.user.id,
        action: 'SETTINGS_UPDATED',
        entityType: 'settings',
        entityId: 'all',
        metadata: { settings, capacities },
      });
    });

    res.json({ success: true, message: 'Settings saved successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/admin/settings/closures
 */
router.post('/settings/closures', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { overrideDate, isClosed = true, reason } = req.body;
    if (!isValidDate(overrideDate) || typeof isClosed !== 'boolean') {
      return res.status(400).json({ error: 'Valid overrideDate (YYYY-MM-DD) is required.' });
    }

    const result = await query(
      `INSERT INTO closure_dates (override_date, is_closed, reason, created_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (override_date) DO UPDATE SET is_closed = EXCLUDED.is_closed, reason = EXCLUDED.reason
       RETURNING *;`,
      [overrideDate, isClosed, reason || 'Library Closed', req.user.id]
    );

    await logAuditEvent({ query }, {
      actorType: 'staff',
      actorId: req.user.id,
      action: 'CLOSURE_DATE_ADDED',
      entityType: 'closure_date',
      entityId: overrideDate,
      metadata: { reason },
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/admin/settings/closures/:id
 */
router.delete('/settings/closures/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await query(`DELETE FROM closure_dates WHERE id = $1;`, [req.params.id]);
    res.json({ success: true, message: 'Closure date override removed.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/admin/audit
 */
router.get('/audit', requireAuth, async (req, res) => {
  try {
    const logsRes = await query(
      `SELECT a.*, u.name as actor_name 
       FROM audit_events a
       LEFT JOIN staff_users u ON u.id::text = a.actor_id AND a.actor_type = 'staff'
       ORDER BY a.created_at DESC 
       LIMIT 50;`
    );
    res.json(logsRes.rows);
  } catch {
    res.status(500).json({ error: 'Failed to retrieve audit events.' });
  }
});

/**
 * GET /api/admin/dashboard-analytics
 * KPI totals, book categories, and overdue trend
 */
router.get('/dashboard-analytics', requireAuth, async (req, res, next) => {
  try {
    const reports = await getReports();
    const books = await listRecords('books');
    const loans = await listRecords('loans');
    const overdue = loans.filter((loan) => loan.status !== 'returned' && loan.dueDate < getNowInKolkata().dateStr);
    const trend = new Map();
    overdue.forEach((loan) => trend.set(loan.dueDate, (trend.get(loan.dueDate) || 0) + 1));
    res.json({
      kpi: { totalBooks: books.reduce((sum, book) => sum + book.copiesTotal, 0), totalLoans: reports.totalLoans, activeMembers: reports.activeMembers, overdueItems: overdue.length, trends: {} },
      categories: reports.categories.map((category) => ({ ...category, percentage: category.percent })),
      overdueTrend: [...trend].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count })),
    });
  } catch (error) { next(error); }
});

router.get('/circulation', requireAuth, async (req, res, next) => {
  try {
    const period = req.query.period || 'monthly';
    if (!['monthly', 'weekly', 'yearly'].includes(period)) return res.status(400).json({ error: 'Invalid circulation period.' });
    const year = Number(req.query.year || getNowInKolkata().dateStr.slice(0, 4));
    if (!Number.isInteger(year) || year < 1900 || year > 9999) return res.status(400).json({ error: 'Invalid year.' });
    const unit = { monthly: 'month', weekly: 'week', yearly: 'year' }[period];
    const loans = await listRecords('loans');
    const buckets = new Map();
    const bucket = (date) => {
      let key = date.slice(0, unit === 'year' ? 4 : 7);
      if (unit === 'week') {
        const monday = new Date(date + 'T12:00:00Z');
        monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
        key = monday.toISOString().slice(0, 10);
      }
      if (!buckets.has(key)) buckets.set(key, { key, label: key, year: Number(date.slice(0, 4)), issued: 0, returned: 0 });
      return buckets.get(key);
    };
    for (const loan of loans) {
      if (unit === 'year' || loan.issueDate.startsWith(String(year))) bucket(loan.issueDate).issued++;
      if (loan.returnDate && (unit === 'year' || loan.returnDate.startsWith(String(year)))) bucket(loan.returnDate).returned++;
    }
    res.json({ period, year, totalLoans: loans.length, data: [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key)).map((row) => ({ ...row, total: row.issued + row.returned })) });
  } catch (error) { next(error); }
});

/**
 * GET /api/admin/loans
 * Recent transaction records with search and status filtering
 */
router.get('/loans', requireAuth, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    let whereClauses = [];
    let params = [];
    let pIdx = 1;

    if (status && status !== 'all') {
      whereClauses.push(`l.status = $${pIdx++}`);
      params.push(status);
    }

    if (search) {
      whereClauses.push(`(
        LOWER(l.loan_code) LIKE $${pIdx} OR 
        LOWER(b.title) LIKE $${pIdx} OR 
        LOWER(m.name) LIKE $${pIdx}
      )`);
      params.push(`%${search.trim().toLowerCase()}%`);
      pIdx++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRes = await query(`
      SELECT COUNT(*)::int as total
      FROM loans l
      LEFT JOIN books b ON b.id = l.book_id
      LEFT JOIN members m ON m.id = l.member_id
      ${whereSql};
    `, params);

    const total = countRes.rows[0]?.total || 0;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const dataRes = await query(`
      SELECT l.id, l.loan_code, l.type, l.issue_date, l.due_date, l.return_date, l.status,
             b.title as book_title, b.category as book_category,
             m.name as member_name, m.member_no, m.email as member_email
      FROM loans l
      LEFT JOIN books b ON b.id = l.book_id
      LEFT JOIN members m ON m.id = l.member_id
      ${whereSql}
      ORDER BY l.loan_code ASC
      LIMIT $${pIdx++} OFFSET $${pIdx++};
    `, [...params, parseInt(limit, 10), offset]);

    res.json({
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      loans: dataRes.rows.map((r) => ({
        ...r,
        issue_date: r.issue_date instanceof Date ? r.issue_date.toISOString().split('T')[0] : String(r.issue_date),
        due_date: r.due_date instanceof Date ? r.due_date.toISOString().split('T')[0] : String(r.due_date),
      })),
    });
  } catch {
    res.status(500).json({ error: 'Failed to retrieve loans list.' });
  }
});

/**
 * POST /api/admin/loans
 * Issue new book loan transaction
 */
router.post('/loans', requireAuth, async (req, res) => {
  try {
    const { memberNo, memberName, bookTitle, type = 'Loan', issueDate, dueDate } = req.body;
    let number = memberNo;
    if (!number && memberName) {
      const matches = await query('SELECT member_no FROM members WHERE LOWER(name) = LOWER($1)', [memberName.trim()]);
      if (matches.rows.length === 1) number = matches.rows[0].member_no;
    }
    if (!number) throw new Error('Enter a valid member number, or the unique name of an existing member.');
    const today = getNowInKolkata().dateStr;
    const due = new Date(today + 'T12:00:00Z');
    due.setUTCDate(due.getUTCDate() + 14);
    const items = await applyRecordChanges('loans', [{ type: 'create', data: { memberNo: number, bookTitle, type, issueDate: issueDate || today, dueDate: dueDate || due.toISOString().slice(0, 10), status: 'active' } }], req.user);
    const loan = items[0];
    res.status(201).json({ success: true, loan: { ...loan, loan_code: loan.loanCode } });
  } catch (error) { res.status(error.status || 400).json({ error: error.message }); }
});

router.patch('/loans/:id/status', requireAuth, async (req, res) => {
  try {
    const items = await listRecords('loans');
    const existing = items.find((loan) => loan.id === Number(req.params.id));
    if (!existing) return res.status(404).json({ error: 'Loan not found.' });
    await applyRecordChanges('loans', [{ type: 'update', id: existing.id, version: existing.version, data: { ...existing, status: req.body.status } }], req.user);
    res.json({ success: true });
  } catch (error) { res.status(error.status || 400).json({ error: error.message }); }
});

/**
 * GET /api/admin/search
 * Global omni-search for books and members
 */
router.get('/search', requireAuth, async (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    if (!q) {
      return res.json({ books: [], members: [] });
    }

    const booksRes = await query(`
      SELECT id, title, author, category, isbn
      FROM books
      WHERE LOWER(title) LIKE $1 OR LOWER(author) LIKE $1 OR LOWER(category) LIKE $1
      LIMIT 5;
    `, [`%${q}%`]);

    const membersRes = await query(`
      SELECT id, member_no, name, email, phone, status
      FROM members
      WHERE LOWER(name) LIKE $1 OR LOWER(email) LIKE $1 OR LOWER(member_no) LIKE $1
      LIMIT 5;
    `, [`%${q}%`]);

    res.json({
      books: booksRes.rows,
      members: membersRes.rows,
    });
  } catch {
    res.status(500).json({ error: 'Search failed.' });
  }
});

export default router;

