import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { getDb } from './connection.js';
import { config } from '../config.js';

export async function seed() {
  console.log('Seeding demo database...');
  const db = await getDb();

  // 1. Facilities
  await db.query(`
    INSERT INTO facilities (id, name, description, image_url, active, policy_json)
    VALUES 
      ('reading-room', 'Reading Room', 'A calm sanctuary for quiet reading, study and research with natural light and wooden seating.', '/images/library-reading-area.webp', true, '{"capacity_note": "Fictional demo capacity: 15 seats"}'),
      ('manga-corner', 'Manga Corner', 'Curated collection of Japanese manga volumes, tankōbon and graphic novels for in-library browsing.', '/images/library-study-room.webp', true, '{"capacity_note": "Fictional demo capacity: 8 seats"}')
    ON CONFLICT (id) DO UPDATE SET 
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      image_url = EXCLUDED.image_url,
      active = EXCLUDED.active;
  `);

  // 2. Sessions
  await db.query(`
    INSERT INTO sessions (id, name, start_time, end_time, active)
    VALUES
      ('morning', 'Morning Session', '11:00', '14:30', true),
      ('afternoon', 'Afternoon Session', '15:00', '18:30', true)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      start_time = EXCLUDED.start_time,
      end_time = EXCLUDED.end_time,
      active = EXCLUDED.active;
  `);

  // 3. Capacities (Fictional demo capacities)
  await db.query(`
    INSERT INTO facility_session_capacities (facility_id, session_id, capacity)
    VALUES
      ('reading-room', 'morning', 15),
      ('reading-room', 'afternoon', 15),
      ('manga-corner', 'morning', 8),
      ('manga-corner', 'afternoon', 8)
    ON CONFLICT (facility_id, session_id) DO UPDATE SET
      capacity = EXCLUDED.capacity;
  `);

  // 4. Default Settings
  const defaultSettings = [
    ['daily_booking_limit', '1', 'Maximum slots a visitor can book on the same calendar date'],
    ['advance_booking_days', '14', 'Maximum days ahead a visitor can reserve a slot'],
    ['cancellation_cutoff_hours', '2', 'Hours before session start that online cancellation is allowed'],
    ['opening_days', JSON.stringify(['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']), 'Days of the week the library is open for visits'],
    ['require_membership', 'false', 'Whether visitor must supply a membership ID to complete booking'],
  ];

  for (const [key, value, description] of defaultSettings) {
    await db.query(`
      INSERT INTO settings (key, value, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        description = EXCLUDED.description;
    `, [key, value, description]);
  }

  // 5. Staff User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(config.demoAdmin.password, salt);

  const staffRes = await db.query(`
    INSERT INTO staff_users (name, email, password_hash, role, active)
    VALUES ($1, $2, $3, 'admin', true)
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      password_hash = EXCLUDED.password_hash,
      role = 'admin',
      active = true
    RETURNING id;
  `, [config.demoAdmin.name, config.demoAdmin.email, passwordHash]);

  const staffId = staffRes.rows[0]?.id || 1;

  // 6. Demo Bookings (Upcoming, Checked-in, Cancelled, Completed)
  // Calculate relative dates for testing
  const now = new Date();
  const formatDate = (d) => d.toISOString().split('T')[0];

  const today = formatDate(now);
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = formatDate(tomorrowDate);

  const dayAfterDate = new Date(now);
  dayAfterDate.setDate(dayAfterDate.getDate() + 2);
  const dayAfter = formatDate(dayAfterDate);

  const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

  // Clear existing demo bookings to prevent accumulation on repeat seeds
  await db.query(`DELETE FROM bookings WHERE visitor_email LIKE '%@example.com' OR visitor_email LIKE '%@demo.delhi';`);

  const demoBookings = [
    {
      ref: 'JF-2026-D1001',
      token: 'demo-checkin-token-1001',
      mgToken: 'demo-mg-token-1001',
      facility: 'reading-room',
      session: 'morning',
      date: today,
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      status: 'confirmed',
    },
    {
      ref: 'JF-2026-D1002',
      token: 'demo-checkin-token-1002',
      mgToken: 'demo-mg-token-1002',
      facility: 'reading-room',
      session: 'morning',
      date: today,
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      status: 'checked_in',
      checked_in_at: new Date().toISOString(),
      checked_in_by: staffId,
    },
    {
      ref: 'JF-2026-D1003',
      token: 'demo-checkin-token-1003',
      mgToken: 'demo-mg-token-1003',
      facility: 'manga-corner',
      session: 'afternoon',
      date: today,
      name: 'Rohan Verma',
      email: 'rohan.verma@example.com',
      status: 'confirmed',
    },
    {
      ref: 'JF-2026-D1004',
      token: 'demo-checkin-token-1004',
      mgToken: 'demo-mg-token-1004',
      facility: 'reading-room',
      session: 'afternoon',
      date: tomorrow,
      name: 'Ananya Sen',
      email: 'ananya.sen@example.com',
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: 'Schedule conflict',
    },
    {
      ref: 'JF-2026-D1005',
      token: 'demo-checkin-token-1005',
      mgToken: 'demo-mg-token-1005',
      facility: 'manga-corner',
      session: 'morning',
      date: tomorrow,
      name: 'Vikram Mehta',
      email: 'vikram.mehta@example.com',
      status: 'confirmed',
    },
    {
      ref: 'JF-2026-D1006',
      token: 'demo-checkin-token-1006',
      mgToken: 'demo-mg-token-1006',
      facility: 'reading-room',
      session: 'morning',
      date: dayAfter,
      name: 'Meera Nair',
      email: 'meera.nair@example.com',
      status: 'completed',
    },
  ];

  for (const b of demoBookings) {
    await db.query(`
      INSERT INTO bookings (
        booking_ref, checkin_token_hash, management_token, facility_id, session_id,
        visit_date, visitor_name, visitor_email, status, checked_in_at, checked_in_by,
        cancelled_at, cancellation_reason
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (booking_ref) DO NOTHING;
    `, [
      b.ref,
      hashToken(b.token),
      b.mgToken,
      b.facility,
      b.session,
      b.date,
      b.name,
      b.email,
      b.status,
      b.checked_in_at || null,
      b.checked_in_by || null,
      b.cancelled_at || null,
      b.cancellation_reason || null,
    ]);
  }

  // 7. Audit log for seeding
  await db.query(`
    INSERT INTO audit_events (actor_type, actor_id, action, entity_type, entity_id, metadata)
    VALUES ('system', 'seed-script', 'SYSTEM_INITIALIZED', 'database', 'all', '{"note": "Demo dataset initialized with staff admin and sample bookings"}');
  `);

  // 8. Seed Library Catalog Books
  await db.query(`DELETE FROM books;`);
  const sampleBooks = [
    { isbn: '978-0132350884', title: 'Clean Code', author: 'Robert C. Martin', category: 'Fiction', total: 620, available: 580 },
    { isbn: '978-0735211292', title: 'Atomic Habits', author: 'James Clear', category: 'Fiction', total: 750, available: 690 },
    { isbn: '978-0451524935', title: '1984', author: 'George Orwell', category: 'Fiction', total: 820, available: 740 },
    { isbn: '978-0375704024', title: 'Norwegian Wood', author: 'Haruki Murakami', category: 'Fiction', total: 780, available: 710 },
    { isbn: '978-0743273565', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', total: 850, available: 790 },
    { isbn: '978-0201616224', title: 'The Pragmatic Programmer', author: 'David Thomas, Andrew Hunt', category: 'Science & Tech', total: 680, available: 610 },
    { isbn: '978-1449373320', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', category: 'Science & Tech', total: 740, available: 660 },
    { isbn: '978-0262033848', title: 'Structure and Interpretation of Computer Programs', author: 'Harold Abelson', category: 'Science & Tech', total: 540, available: 490 },
    { isbn: '978-0136042594', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', category: 'Science & Tech', total: 500, available: 450 },
    { isbn: '978-0062316097', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', category: 'History', total: 640, available: 590 },
    { isbn: '978-0393317558', title: 'Guns, Germs, and Steel', author: 'Jared Diamond', category: 'History', total: 590, available: 520 },
    { isbn: '978-1101912379', title: 'The Silk Roads', author: 'Peter Frankopan', category: 'History', total: 610, available: 550 },
    { isbn: '978-0486451336', title: 'Kokoro', author: 'Natsume Soseki', category: 'Literature', total: 520, available: 470 },
    { isbn: '978-0679761044', title: 'Snow Country', author: 'Yasunari Kawabata', category: 'Literature', total: 540, available: 490 },
    { isbn: '978-0060883287', title: 'One Hundred Years of Solitude', author: 'Gabriel Garcia Marquez', category: 'Literature', total: 560, available: 510 },
    { isbn: '978-0199571123', title: 'Oxford English Reference Compendium', author: 'Oxford Press', category: 'Reference', total: 450, available: 420 },
    { isbn: '978-0226287058', title: 'The Chicago Manual of Style', author: 'University of Chicago', category: 'Reference', total: 430, available: 410 },
    { isbn: '978-0415309837', title: 'Modern Japanese Grammar Reference', author: 'M. McGloin', category: 'Reference', total: 430, available: 400 },
    { isbn: '978-0143126393', title: 'Art of Living', author: 'Epictetus', category: 'Other', total: 480, available: 440 },
    { isbn: '978-3721200430', title: 'Graphic Design Manual', author: 'Armin Hofmann', category: 'Other', total: 470, available: 430 },
    { isbn: '978-0393976540', title: 'Architecture and Urbanism Studies', author: 'Kenneth Frampton', category: 'Other', total: 480, available: 440 },
  ];

  for (const bk of sampleBooks) {
    await db.query(`
      INSERT INTO books (isbn, title, author, category, copies_total, copies_available)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, [bk.isbn, bk.title, bk.author, bk.category, bk.total, bk.available]);
  }

  // 9. Seed Library Members
  await db.query(`DELETE FROM members;`);
  const sampleMembers = [
    { no: 'MEM-04910', name: 'Ryan Korsgaard', email: 'ryan.k@example.com', phone: '+91 98765 43210' },
    { no: 'MEM-04911', name: 'Madelyn Lubin', email: 'madelyn.l@example.com', phone: '+91 98765 43211' },
    { no: 'MEM-04912', name: 'Abram Bergson', email: 'abram.b@example.com', phone: '+91 98765 43212' },
    { no: 'MEM-04913', name: 'Phillip Mango', email: 'phillip.m@example.com', phone: '+91 98765 43213' },
    { no: 'MEM-04914', name: 'Sophia Alva', email: 'sophia.a@example.com', phone: '+91 98765 43214' },
    { no: 'MEM-04915', name: 'Elena Rostova', email: 'elena.r@example.com', phone: '+91 98765 43215' },
    { no: 'MEM-04916', name: 'Kenji Sato', email: 'kenji.s@example.com', phone: '+91 98765 43216' },
    { no: 'MEM-04917', name: 'Marcus Brody', email: 'marcus.b@example.com', phone: '+91 98765 43217' },
    { no: 'MEM-04918', name: 'Daniel Vance', email: 'daniel.v@example.com', phone: '+91 98765 43218' },
    { no: 'MEM-04919', name: 'Chloe Martin', email: 'chloe.m@example.com', phone: '+91 98765 43219' },
  ];

  for (const m of sampleMembers) {
    await db.query(`
      INSERT INTO members (member_no, name, email, phone, status, joined_date)
      VALUES ($1, $2, $3, $4, 'active', '2024-01-15');
    `, [m.no, m.name, m.email, m.phone]);
  }

  // 10. Seed Loans Transactions (Matching reference screenshot exactly)
  await db.query(`DELETE FROM loans;`);
  const sampleLoans = [
    { code: '#04910', bookTitle: 'Clean Code', memberName: 'Ryan Korsgaard', type: 'Loan', issue: '2025-10-21', due: '2025-11-04', status: 'active' },
    { code: '#04911', bookTitle: 'Atomic Habits', memberName: 'Madelyn Lubin', type: 'Loan', issue: '2025-10-19', due: '2025-11-02', status: 'due_soon' },
    { code: '#04912', bookTitle: 'The Pragmatic Programmer', memberName: 'Abram Bergson', type: 'Loan', issue: '2025-10-08', due: '2025-10-22', status: 'overdue' },
    { code: '#04913', bookTitle: 'Sapiens', memberName: 'Phillip Mango', type: 'Loan', issue: '2025-10-20', due: '2025-11-03', status: 'active' },
    { code: '#04914', bookTitle: 'Designing Data-Intensive Applications', memberName: 'Sophia Alva', type: 'Loan', issue: '2025-10-15', due: '2025-10-29', status: 'active' },
    { code: '#04915', bookTitle: 'Norwegian Wood', memberName: 'Elena Rostova', type: 'Loan', issue: '2025-10-05', due: '2025-10-19', status: 'overdue' },
    { code: '#04916', bookTitle: 'Kokoro', memberName: 'Kenji Sato', type: 'Loan', issue: '2025-10-22', due: '2025-11-05', status: 'active' },
    { code: '#04917', bookTitle: 'The Silk Roads', memberName: 'Marcus Brody', type: 'Return', issue: '2025-10-12', due: '2025-10-26', status: 'returned' },
    { code: '#04918', bookTitle: '1984', memberName: 'Daniel Vance', type: 'Loan', issue: '2025-10-23', due: '2025-11-06', status: 'active' },
    { code: '#04919', bookTitle: 'Art of Living', memberName: 'Chloe Martin', type: 'Renewal', issue: '2025-10-18', due: '2025-11-01', status: 'due_soon' },
  ];

  for (const l of sampleLoans) {
    const bRes = await db.query(`SELECT id FROM books WHERE title LIKE $1 LIMIT 1;`, [`%${l.bookTitle}%`]);
    const mRes = await db.query(`SELECT id FROM members WHERE name = $1 LIMIT 1;`, [l.memberName]);
    const bookId = bRes.rows[0]?.id || null;
    const memberId = mRes.rows[0]?.id || null;

    await db.query(`
      INSERT INTO loans (loan_code, book_id, member_id, type, issue_date, due_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (loan_code) DO NOTHING;
    `, [l.code, bookId, memberId, l.type, l.issue, l.due, l.status]);
  }

  // 11. Seed Monthly Circulation Statistics (Reproducing the Pixel Chart)
  await db.query(`DELETE FROM circulation_stats;`);
  const monthlyStats = [
    { key: 'JAN', label: 'Jan', year: 2025, issued: 12000, returned: 8000, order: 1 },
    { key: 'FEB', label: 'Feb', year: 2025, issued: 16000, returned: 12000, order: 2 },
    { key: 'MAR', label: 'Mar', year: 2025, issued: 14000, returned: 9000, order: 3 },
    { key: 'APR', label: 'Apr', year: 2025, issued: 18000, returned: 22000, order: 4 },
    { key: 'MAY', label: 'May', year: 2025, issued: 10000, returned: 15000, order: 5 },
    { key: 'JUN', label: 'Jun', year: 2025, issued: 38000, returned: 18000, order: 6 },
    { key: 'JUL', label: 'Jul', year: 2025, issued: 14000, returned: 16000, order: 7 },
    { key: 'AUG', label: 'Aug', year: 2025, issued: 12000, returned: 10000, order: 8 },
    { key: 'SEP', label: 'Sep', year: 2025, issued: 17000, returned: 14000, order: 9 },
    { key: 'OCT', label: 'Oct', year: 2025, issued: 19000, returned: 24000, order: 10 },
    { key: 'NOV', label: 'Nov', year: 2025, issued: 15000, returned: 18000, order: 11 },
    { key: 'DEC', label: 'Dec', year: 2025, issued: 11000, returned: 16000, order: 12 },
  ];

  for (const s of monthlyStats) {
    await db.query(`
      INSERT INTO circulation_stats (period_type, period_key, year, period_label, issued_count, returned_count, sort_order)
      VALUES ('monthly', $1, $2, $3, $4, $5, $6);
    `, [s.key, s.year, s.label, s.issued, s.returned, s.order]);
  }

  // Weekly Stats (last 8 weeks)
  const weeklyStats = [
    { key: 'W40', label: 'Wk 40', year: 2025, issued: 4200, returned: 3100, order: 1 },
    { key: 'W41', label: 'Wk 41', year: 2025, issued: 3900, returned: 4500, order: 2 },
    { key: 'W42', label: 'Wk 42', year: 2025, issued: 5100, returned: 3800, order: 3 },
    { key: 'W43', label: 'Wk 43', year: 2025, issued: 4800, returned: 5200, order: 4 },
    { key: 'W44', label: 'Wk 44', year: 2025, issued: 6200, returned: 4100, order: 5 },
    { key: 'W45', label: 'Wk 45', year: 2025, issued: 7800, returned: 6300, order: 6 },
    { key: 'W46', label: 'Wk 46', year: 2025, issued: 5400, returned: 4900, order: 7 },
    { key: 'W47', label: 'Wk 47', year: 2025, issued: 4600, returned: 5100, order: 8 },
  ];
  for (const w of weeklyStats) {
    await db.query(`
      INSERT INTO circulation_stats (period_type, period_key, year, period_label, issued_count, returned_count, sort_order)
      VALUES ('weekly', $1, $2, $3, $4, $5, $6);
    `, [w.key, w.year, w.label, w.issued, w.returned, w.order]);
  }

  // Yearly Stats
  const yearlyStats = [
    { key: '2020', label: '2020', year: 2020, issued: 120000, returned: 110000, order: 1 },
    { key: '2021', label: '2021', year: 2021, issued: 145000, returned: 138000, order: 2 },
    { key: '2022', label: '2022', year: 2022, issued: 180000, returned: 172000, order: 3 },
    { key: '2023', label: '2023', year: 2023, issued: 210000, returned: 198000, order: 4 },
    { key: '2024', label: '2024', year: 2024, issued: 228000, returned: 215000, order: 5 },
    { key: '2025', label: '2025', year: 2025, issued: 245000, returned: 232000, order: 6 },
  ];
  for (const y of yearlyStats) {
    await db.query(`
      INSERT INTO circulation_stats (period_type, period_key, year, period_label, issued_count, returned_count, sort_order)
      VALUES ('yearly', $1, $2, $3, $4, $5, $6);
    `, [y.key, y.year, y.label, y.issued, y.returned, y.order]);
  }

  // 12. Seed Overdue Daily Trend Data (1 Nov - 30 Nov 2025)
  await db.query(`DELETE FROM overdue_daily_stats;`);
  const overdueValues = [
    1200, 1500, 2100, 2400, 3100, 1800, 2200, 1400, 1900, 2500,
    3300, 2100, 1700, 1300, 1900, 2200, 2600, 3200, 2800, 2100,
    1800, 2400, 2900, 3100, 2500, 2200, 1900, 1600, 1400, 1100
  ];
  for (let i = 0; i < overdueValues.length; i++) {
    const day = String(i + 1).padStart(2, '0');
    const dateStr = `2025-11-${day}`;
    await db.query(`
      INSERT INTO overdue_daily_stats (stat_date, overdue_count)
      VALUES ($1, $2)
      ON CONFLICT (stat_date) DO UPDATE SET overdue_count = EXCLUDED.overdue_count;
    `, [dateStr, overdueValues[i]]);
  }

  console.log('Demo database seeded successfully.');
  console.log(`Admin user: ${config.demoAdmin.email} / ${config.demoAdmin.password}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed()
    .then(async () => {
      const db = await getDb();
      await db.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
