import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { cleanupTestDatabase, databaseReady } from './setup.js';
import { getDb, query, initializeEmbeddedDatabase } from '../server/db/connection.js';
import { config, validateProductionConfig } from '../server/config.js';
import { startServer } from '../server/index.js';
import { getNowInKolkata, getDayOfWeek } from '../server/utils/dates.js';
import { createReservation, cancelReservation } from '../server/services/bookingService.js';
import { processCheckin } from '../server/services/checkinService.js';
import { rateLimit } from '../server/middleware/rateLimit.js';
import { ensureOperationalDefaults } from '../server/db/defaults.js';

test('Database, security, booking policy, and management regressions', async (t) => {
  await databaseReady;
  let server;
  t.after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    await (await getDb()).close();
    await cleanupTestDatabase();
  });
  ({ server } = await startServer());
  if (!server.listening) await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const login = await fetch(`${base}/api/admin/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: config.demoAdmin.email, password: config.demoAdmin.password }) });
  assert.equal(login.status, 200);
  assert.equal((await login.json()).token, undefined, 'Session credentials stay in the HTTP-only cookie');
  const cookie = login.headers.get('set-cookie').split(';')[0];
  async function api(endpoint, method = 'GET', body, session = cookie) {
    const response = await fetch(`${base}/api/admin/${endpoint}`, {
      method, headers: { 'Content-Type': 'application/json', ...(session ? { Cookie: session } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, data: await response.json() };
  }
  const change = (collection, operations, session) => api(`manage/${collection}/changes`, 'POST', { changes: operations }, session);
  const create = async (collection, data) => {
    const result = await change(collection, [{ type: 'create', data }]);
    assert.equal(result.status, 200, JSON.stringify(result.data));
    return result.data.items[0];
  };
  const update = (collection, record, fields) => change(collection, [{ type: 'update', id: record.id, version: record.version, data: { ...record, ...fields } }]);
  const today = getNowInKolkata().dateStr;
  let visitDate;
  for (let offset = 2; offset < 10; offset++) {
    const date = new Date(`${today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    const candidate = date.toISOString().slice(0, 10);
    if (['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].includes(getDayOfWeek(candidate))) { visitDate = candidate; break; }
  }
  const bookingInput = (email, facilityId = 'reading-room', sessionId = 'morning') => ({ facilityId, sessionId, visitDate, visitorName: 'Regression Visitor', visitorEmail: email });

  await t.test('Initialization failures preserve all existing database files', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'library-recovery-'));
    try {
      const marker = path.join(directory, 'existing-data');
      const pid = path.join(directory, 'postmaster.pid');
      await writeFile(marker, 'keep this data');
      await writeFile(pid, 'existing lock');
      await assert.rejects(initializeEmbeddedDatabase(directory, () => ({ waitReady: Promise.reject(new Error('Disk unavailable')), close: async () => {} })), /Existing data was preserved/);
      assert.equal(await readFile(marker, 'utf8'), 'keep this data');
      assert.equal(await readFile(pid, 'utf8'), 'existing lock');
    } finally { await rm(directory, { recursive: true, force: true }); }
  });

  await t.test('Production rejects demo secrets, HTTP frontend origins, and ephemeral serverless storage', () => {
    const valid = { NODE_ENV: 'production', JWT_SECRET: 'a'.repeat(48), COOKIE_SECRET: 'b'.repeat(48), FRONTEND_ORIGIN: 'https://library.example.com', DATABASE_URL: 'postgresql://example', VERCEL: '1' };
    assert.doesNotThrow(() => validateProductionConfig(valid));
    assert.throws(() => validateProductionConfig({ ...valid, JWT_SECRET: 'fallback-secret-for-demo-purposes-only-32ch' }), /JWT_SECRET/);
    assert.throws(() => validateProductionConfig({ ...valid, FRONTEND_ORIGIN: 'http://localhost:5174' }), /HTTPS/);
    assert.throws(() => validateProductionConfig({ ...valid, DATABASE_URL: '' }), /DATABASE_URL/);
  });

  await t.test('CORS rejects untrusted origins, including misleading localhost names and unrelated Vercel sites', async () => {
    for (const origin of ['https://evil.example', 'https://localhost.evil.example', 'https://unrelated.vercel.app']) {
      const response = await fetch(`${base}/api/config`, { headers: { Origin: origin } });
      assert.equal(response.status, 403);
      assert.equal(response.headers.get('access-control-allow-origin'), null);
    }
    const response = await fetch(`${base}/api/config`, { headers: { Origin: 'http://localhost:5174' } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5174');
  });

  await t.test('Rate limits do not consume other endpoints’ allowances', () => {
    const bookings = rateLimit({ maxRequests: 8 });
    const authentication = rateLimit({ maxRequests: 5 });
    let accepted = 0;
    const response = { status: () => ({ json: () => {} }) };
    for (let i = 0; i < 8; i++) bookings({ ip: 'test-client' }, response, () => accepted++);
    authentication({ ip: 'test-client' }, response, () => accepted++);
    assert.equal(accepted, 9);
  });

  await t.test('Required membership, inactive facilities, and invalid dates are rejected', async () => {
    await query("UPDATE settings SET value = 'true' WHERE key = 'require_membership'");
    try { await assert.rejects(createReservation(bookingInput('membership@tests.invalid')), /membership ID/); }
    finally { await query("UPDATE settings SET value = 'false' WHERE key = 'require_membership'"); }
    await query("UPDATE facilities SET active = false WHERE id = 'reading-room'");
    try { await assert.rejects(createReservation(bookingInput('inactive@tests.invalid')), /inactive facility/); }
    finally { await query("UPDATE facilities SET active = true WHERE id = 'reading-room'"); }
    await assert.rejects(createReservation({ ...bookingInput('invalid@tests.invalid'), visitDate: '2026-02-30' }), /Invalid visit date/);
  });

  await t.test('Cancellation obeys its cutoff and check-in requires the booked day and session', async (clock) => {
    const booking = await createReservation(bookingInput('cutoff@tests.invalid'));
    clock.mock.timers.enable({ apis: ['Date'], now: new Date(`${visitDate}T10:30:00+05:30`) });
    await assert.rejects(cancelReservation(booking.bookingRef, { managementToken: booking.managementToken }), /cancellation closes/);
    await assert.rejects(processCheckin({ payload: booking.bookingRef, staffUserId: 1 }), /session hours/);
    clock.mock.timers.setTime(new Date(`${visitDate}T14:30:00+05:30`).getTime());
    await assert.rejects(processCheckin({ payload: booking.bookingRef, staffUserId: 1 }), /session hours/);
    clock.mock.timers.reset();
    await assert.rejects(processCheckin({ payload: booking.bookingRef, staffUserId: 1 }), /booked visit date/);
  });

  await t.test('Concurrent bookings across different slots still obey the daily visitor limit', async () => {
    const results = await Promise.allSettled([
      createReservation(bookingInput('same-person@tests.invalid')),
      createReservation(bookingInput('same-person@tests.invalid', 'manga-corner', 'afternoon')),
    ]);
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    assert.match(results.find((result) => result.status === 'rejected').reason.message, /Daily reservation limit/);
    const booked = results.find((result) => result.status === 'fulfilled').value;
    await query("UPDATE bookings SET status = 'completed' WHERE booking_ref = $1", [booked.bookingRef]);
    await assert.rejects(createReservation(bookingInput('same-person@tests.invalid', 'manga-corner', 'morning')), /Daily reservation limit/);
  });

  await t.test('Operational defaults initialize empty slots without overwriting saved configuration', async () => {
    await query("DELETE FROM facility_session_capacities WHERE facility_id = 'manga-corner' AND session_id = 'morning'");
    await ensureOperationalDefaults(await getDb());
    const capacities = (await api('settings')).data.capacities;
    assert.equal(capacities.find((row) => row.facility_id === 'manga-corner' && row.session_id === 'morning').capacity, 0);
    assert.equal(capacities.find((row) => row.facility_id === 'reading-room' && row.session_id === 'morning').capacity, 15);
    await query("UPDATE facility_session_capacities SET capacity = 8 WHERE facility_id = 'manga-corner' AND session_id = 'morning'");
  });

  await t.test('Settings and closure dates persist and invalid policy changes are rejected', async () => {
    assert.equal((await api('settings', 'PUT', { settings: { daily_booking_limit: 0 } })).status, 400);
    assert.equal((await api('settings', 'PUT', { settings: { opening_days: ['ImaginaryDay'] } })).status, 400);
    assert.equal((await api('settings', 'PUT', { settings: { advance_booking_days: 0, cancellation_cutoff_hours: 0 } })).status, 200);
    const publicConfig = await (await fetch(`${base}/api/config`)).json();
    assert.equal(publicConfig.settings.advanceBookingDays, 0);
    assert.equal(publicConfig.settings.cancellationCutoffHours, 0);
    assert.equal((await api('settings/closures', 'POST', { overrideDate: '2026-02-30' })).status, 400);
    const closure = await api('settings/closures', 'POST', { overrideDate: visitDate, reason: 'Regression closure' });
    assert.equal(closure.status, 201);
    assert.ok((await api('settings')).data.closures.some((item) => item.override_date === visitDate));
    assert.ok((await (await fetch(`${base}/api/config`)).json()).closureDates.some((item) => item.date === visitDate));
    assert.equal((await api(`settings/closures/${closure.data.id}`, 'DELETE')).status, 200);
    assert.equal((await api('settings')).data.closures.some((item) => item.override_date === visitDate), false);
    assert.equal((await api('settings', 'PUT', { settings: { advance_booking_days: 14, cancellation_cutoff_hours: 2 } })).status, 200);
    await query("ALTER TABLE audit_events ADD CONSTRAINT test_audit_failure CHECK (action <> 'SETTINGS_UPDATED') NOT VALID");
    try {
      const failedSave = await api('settings', 'PUT', { settings: { daily_booking_limit: 2 } });
      assert.equal(failedSave.status, 400, 'A failed audit write cannot report a successful save');
      assert.equal((await api('settings')).data.settings.daily_booking_limit, 1, 'The policy update rolls back with its audit event');
    } finally { await query('ALTER TABLE audit_events DROP CONSTRAINT test_audit_failure'); }
  });

  const records = {};
  await t.test('Catalog, members, branches, and fines persist and reject stale edits', async () => {
    records.book = await create('books', { title: 'Persistent Test Book', author: 'Test Author', category: 'Fiction', copiesTotal: 2, copiesAvailable: 2, shelf: 'TEST.001', japaneseTitle: 'テスト' });
    records.member = await create('members', { memberNo: 'MEM-TEST001', name: 'Persistent Member', email: 'member@tests.invalid', status: 'active', expiryDate: '2099-12-31' });
    records.branch = await create('branches', { name: 'Persistent Branch', totalSeats: 20, currentOccupancy: 0, status: 'open', amenities: ['Wi-Fi'] });
    records.fine = await create('fines', { memberNo: records.member.memberNo, amount: 75, reason: 'Late return', status: 'unpaid' });
    const updated = await update('branches', records.branch, { totalSeats: 30 });
    assert.equal(updated.status, 200);
    assert.equal((await update('branches', records.branch, { totalSeats: 40 })).status, 409);
    assert.equal((await update('fines', records.fine, { status: 'paid', paymentMethod: 'UPI', paymentReference: 'TEST-REF' })).status, 200);
    const member = (await api('manage/members')).data.items.find((item) => item.id === records.member.id);
    assert.equal(member.finesDue, 0);
    assert.equal((await api('manage/books', 'GET', undefined, '')).status, 401);
  });

  await t.test('Concurrent loans cannot exceed inventory, and returns release exactly one copy', async () => {
    const makeLoan = () => change('loans', [{ type: 'create', data: { memberNo: records.member.memberNo, bookTitle: records.book.title, issueDate: today, dueDate: '2099-01-01', status: 'active' } }]);
    const results = await Promise.all([makeLoan(), makeLoan(), makeLoan()]);
    assert.equal(results.filter((result) => result.status === 200).length, 2);
    assert.equal(results.filter((result) => result.status === 400).length, 1);
    let book = (await api('manage/books')).data.items.find((item) => item.id === records.book.id);
    assert.equal(book.copiesAvailable, 0);
    const loans = (await api('manage/loans')).data.items.filter((item) => item.bookId === book.id);
    records.loan = loans[0];
    assert.equal((await change('books', [{ type: 'delete', id: book.id, version: book.version }])).status, 400);
    const returned = await update('loans', records.loan, { status: 'returned' });
    assert.equal(returned.status, 200);
    const returnedLoan = returned.data.items.find((item) => item.id === records.loan.id);
    assert.equal(returnedLoan.returnDate, today);
    assert.equal((await update('loans', returnedLoan, { status: 'returned' })).status, 200);
    book = (await api('manage/books')).data.items.find((item) => item.id === records.book.id);
    assert.equal(book.copiesAvailable, 1);
  });

  await t.test('Staff accounts authenticate, hash passwords, and enforce administrator access', async () => {
    const password = 'UniqueStaffPassword2026!';
    records.staff = await create('staff', { name: 'Persistent Staff', email: 'staff@tests.invalid', password, role: 'Circulation Officer', status: 'active', permissions: ['Circulation'] });
    assert.equal(JSON.stringify(records.staff).includes(password), false);
    const row = (await query('SELECT password_hash, details FROM staff_users WHERE id = $1', [records.staff.id])).rows[0];
    assert.ok(await bcrypt.compare(password, row.password_hash));
    assert.equal(row.details.password, undefined);
    const response = await fetch(`${base}/api/admin/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: records.staff.email, password }) });
    assert.equal(response.status, 200);
    const staffCookie = response.headers.get('set-cookie').split(';')[0];
    assert.equal((await api('manage/staff', 'GET', undefined, staffCookie)).status, 403);
    assert.equal((await update('staff', records.staff, { status: 'on_leave' })).status, 200);
    assert.equal((await api('auth/me', 'GET', undefined, staffCookie)).status, 401);
    const self = (await api('manage/staff')).data.items.find((item) => item.id === 1);
    assert.equal((await update('staff', self, { role: 'Circulation Officer' })).status, 400);
  });

  await t.test('All management records survive closing and reopening the database; reports use actual totals', async () => {
    await (await getDb()).close();
    for (const [collection, record] of [['books', records.book], ['members', records.member], ['loans', records.loan], ['fines', records.fine], ['staff', records.staff], ['branches', records.branch]]) {
      const response = await api(`manage/${collection}`);
      assert.equal(response.status, 200);
      assert.ok(response.data.items.some((item) => item.id === record.id), `${collection} survives restart`);
    }
    const reports = (await api('reports')).data;
    const count = (await query('SELECT COUNT(*)::int AS count FROM loans')).rows[0].count;
    assert.equal(reports.totalLoans, count);
    assert.equal((await api('dashboard-analytics')).data.kpi.totalLoans, count);
    assert.ok(reports.topBooks.some((book) => book.title === records.book.title && book.borrows === 2));
  });
});
