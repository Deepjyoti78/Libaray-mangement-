import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { query, transaction } from '../db/connection.js';
import { getNowInKolkata, isValidDate } from '../utils/dates.js';
import { logAuditEvent } from './statusService.js';

const text = (max = 150) => z.string().trim().min(1).max(max);
const date = z.string().refine(isValidDate, 'A valid calendar date is required.');
const count = z.coerce.number().int().min(0).max(1000000);
const schemas = {
  books: z.object({ title: text(255), author: text(255), category: text(100), copiesTotal: count, copiesAvailable: count }).passthrough()
    .refine((book) => book.copiesAvailable <= book.copiesTotal, 'Available copies cannot exceed total copies.'),
  members: z.object({ name: text(), email: z.email().transform((value) => value.toLowerCase()), memberNo: text(50), status: z.enum(['active', 'expiring_soon', 'suspended']), expiryDate: date.nullable().optional() }).passthrough(),
  loans: z.object({ memberNo: text(50), bookTitle: text(255), issueDate: date, dueDate: date, status: z.enum(['active', 'due_soon', 'overdue', 'returned']) }).passthrough()
    .refine((loan) => loan.dueDate >= loan.issueDate, 'The due date cannot precede the issue date.'),
  fines: z.object({ memberNo: text(50), amount: z.coerce.number().positive().max(1000000), status: z.enum(['unpaid', 'paid', 'waived']), reason: text(250) }).passthrough(),
  staff: z.object({ name: text(100), email: z.email().transform((value) => value.toLowerCase()), role: z.enum(['Super Admin', 'Chief Librarian', 'Senior Librarian', 'Circulation Officer', 'Cataloger Specialist']), status: z.enum(['active', 'on_leave', 'inactive']) }).passthrough(),
  branches: z.object({ name: text(), totalSeats: count, currentOccupancy: count, status: z.enum(['open', 'closed', 'by_appointment']) }).passthrough()
    .refine((branch) => branch.currentOccupancy <= branch.totalSeats, 'Occupancy cannot exceed the number of seats.'),
};
const tables = { books: 'books', members: 'members', loans: 'loans', fines: 'fines', staff: 'staff_users', branches: 'branches' };
const dateString = (value) => value instanceof Date ? value.toISOString().slice(0, 10) : value ? String(value) : null;
const stockStatus = (available) => available === 0 ? 'lent_out' : available === 1 ? 'low_stock' : 'available';

function assertCollection(collection) {
  if (!Object.hasOwn(tables, collection)) throw Object.assign(new Error('Unknown collection.'), { status: 404 });
}

export async function listRecords(collection, db = { query }) {
  assertCollection(collection);
  let sql = `SELECT * FROM ${tables[collection]} ORDER BY id DESC`;
  if (collection === 'members') sql = `SELECT m.*,
    (SELECT COUNT(*)::int FROM loans l WHERE l.member_id = m.id AND l.status <> 'returned') AS active_loans,
    (SELECT COUNT(*)::int FROM loans l WHERE l.member_id = m.id) AS historical_loans,
    (SELECT COALESCE(SUM(amount), 0)::float FROM fines f WHERE f.member_id = m.id AND f.status = 'unpaid') AS fines_due
    FROM members m ORDER BY m.id DESC`;
  if (collection === 'loans') sql = `SELECT l.*, b.title AS book_title, b.category AS book_category, b.details AS book_details,
    m.name AS member_name, m.member_no, m.email AS member_email FROM loans l
    LEFT JOIN books b ON b.id = l.book_id LEFT JOIN members m ON m.id = l.member_id ORDER BY l.id DESC`;
  if (collection === 'fines') sql = `SELECT f.*, m.member_no, m.name AS member_name, m.email AS member_email
    FROM fines f JOIN members m ON m.id = f.member_id ORDER BY f.id DESC`;
  const { rows } = await db.query(sql);
  return rows.map((row) => {
    const base = { ...row.details, id: row.id, version: row.version };
    switch (collection) {
      case 'books': return { japaneseTitle: '', authorJa: '', language: 'Japanese / English', shelf: '', description: '', publisher: '', year: '', ...base,
        isbn: row.isbn || '', title: row.title, author: row.author, category: row.category,
        copiesTotal: row.copies_total, copiesAvailable: row.copies_available, status: stockStatus(row.copies_available) };
      case 'members': return { tier: 'General', address: '', idProof: '', expiryDate: null, ...base,
        name: row.name, email: row.email, phone: row.phone || '', memberNo: row.member_no, status: row.status,
        joinDate: dateString(row.joined_date), activeLoans: row.active_loans, totalHistoricalLoans: row.historical_loans, finesDue: row.fines_due };
      case 'loans': return { fineAmount: 0, ...base, loanCode: row.loan_code, bookId: row.book_id, memberId: row.member_id,
        bookTitle: row.book_title || '(Removed book)', bookJa: row.book_details?.japaneseTitle || '', bookCategory: row.book_category || '', shelf: row.book_details?.shelf || '',
        memberName: row.member_name || '(Removed member)', memberNo: row.member_no || '', memberEmail: row.member_email || '',
        issueDate: dateString(row.issue_date), dueDate: dateString(row.due_date), returnDate: dateString(row.return_date), status: row.status };
      case 'fines': return { itemTitle: '', loanCode: '', ratePerDay: null, incurredDate: getNowInKolkata().dateStr, dueDate: '', paymentMethod: null, paidAt: null, waivedReason: null, ...base,
        invoiceNo: row.invoice_no, memberNo: row.member_no, memberName: row.member_name, memberEmail: row.member_email, amount: Number(row.amount), status: row.status };
      case 'staff': return { phone: '', branch: '', permissions: [], lastActive: 'No activity recorded', ...base,
        name: row.name, email: row.email, role: row.role === 'admin' ? (row.details?.role === 'Chief Librarian' ? 'Chief Librarian' : 'Super Admin') : row.details?.role || 'Circulation Officer',
        status: row.active ? 'active' : row.details?.status || 'inactive', twoFactor: false };
      default: return { japaneseName: '', location: '', totalSeats: 0, currentOccupancy: 0, hours: '', supervisor: '', phone: '', email: '', status: 'open', amenities: [], volumesCount: '', ...base, name: row.name };
    }
  });
}

async function writeRecord(tx, collection, input, existing, user) {
  const result = schemas[collection].safeParse(input);
  if (!result.success) throw new Error(result.error.issues.map((issue) => issue.message).join(' '));
  const data = result.data;
  const { password, ...details } = data;
  delete details.id;
  delete details.version;
  let columns;
  let values;
  switch (collection) {
    case 'books': {
      if (existing) {
        const borrowed = existing.copies_total - existing.copies_available;
        if (data.copiesTotal < borrowed) throw new Error('Total copies cannot be less than the number currently on loan.');
        if (data.copiesAvailable !== data.copiesTotal - borrowed) throw new Error('Available copies must account for existing loans. Use loan returns to release copies.');
      }
      columns = ['isbn', 'title', 'author', 'category', 'copies_total', 'copies_available', 'details'];
      values = [data.isbn || '', data.title, data.author, data.category, data.copiesTotal, data.copiesAvailable, JSON.stringify(details)];
      break;
    }
    case 'members':
      columns = ['member_no', 'name', 'email', 'phone', 'status', 'joined_date', 'details'];
      values = [data.memberNo, data.name, data.email, data.phone || '', data.status, data.joinDate || getNowInKolkata().dateStr, JSON.stringify(details)];
      break;
    case 'loans': {
      const member = (await tx.query(`SELECT * FROM members WHERE member_no = $1 FOR SHARE`, [data.memberNo])).rows[0];
      const book = (await tx.query(`SELECT * FROM books WHERE ${data.bookId ? 'id = $1' : 'LOWER(title) = LOWER($1)'} ORDER BY id LIMIT 1 FOR UPDATE`, [data.bookId || data.bookTitle])).rows[0];
      if (!member || !book) throw new Error('Select an existing member number and an exact catalog title.');
      if (!existing && member.status !== 'active') throw new Error('This member account is not active.');
      if (!existing && member.details?.expiryDate && member.details.expiryDate < getNowInKolkata().dateStr) throw new Error('This membership has expired.');
      if (existing && (existing.book_id !== book.id || existing.member_id !== member.id)) throw new Error('The book and member on an existing loan cannot be changed.');
      if (existing?.status === 'returned' && data.status !== 'returned') throw new Error('A returned loan cannot be reopened. Create a new loan.');
      if (!existing && data.status === 'returned') throw new Error('New loans must be active.');
      if (!existing) {
        if (book.copies_available <= 0) throw new Error('There are no available copies of this book.');
        await tx.query(`UPDATE books SET copies_available = copies_available - 1, version = version + 1 WHERE id = $1`, [book.id]);
      } else if (existing.status !== 'returned' && data.status === 'returned') {
        await tx.query(`UPDATE books SET copies_available = copies_available + 1, version = version + 1 WHERE id = $1`, [book.id]);
      }
      columns = ['loan_code', 'book_id', 'member_id', 'type', 'issue_date', 'due_date', 'return_date', 'status', 'details'];
      values = [existing?.loan_code || `LN-${randomUUID().slice(0, 12).toUpperCase()}`, book.id, member.id, data.type || 'Loan', data.issueDate, data.dueDate,
        data.status === 'returned' ? existing?.return_date || getNowInKolkata().dateStr : null, data.status, JSON.stringify(details)];
      break;
    }
    case 'fines': {
      const member = (await tx.query(`SELECT id FROM members WHERE member_no = $1`, [data.memberNo])).rows[0];
      if (!member) throw new Error('Enter an existing member number.');
      if (!existing && data.status !== 'unpaid') throw new Error('New fines must start unpaid.');
      if (existing && existing.status !== 'unpaid' && data.status !== existing.status) throw new Error('A settled fine cannot be changed.');
      if (data.status === 'paid') {
        if (!data.paymentMethod?.trim()) throw new Error('A payment method is required.');
        details.paidAt = existing?.details?.paidAt || getNowInKolkata().dateStr;
      }
      if (data.status === 'waived' && !data.waivedReason?.trim()) throw new Error('A waiver reason is required.');
      columns = ['invoice_no', 'member_id', 'amount', 'status', 'details'];
      values = [existing?.invoice_no || `FINE-${randomUUID().slice(0, 12).toUpperCase()}`, member.id, data.amount, data.status, JSON.stringify(details)];
      break;
    }
    case 'staff': {
      const role = ['Super Admin', 'Chief Librarian'].includes(data.role) ? 'admin' : 'staff';
      const active = data.status === 'active';
      if (existing?.id === user.id && (role !== 'admin' || !active)) throw new Error('You cannot disable or demote your own administrator account.');
      if ((!existing || password) && (typeof password !== 'string' || password.length < 12)) throw new Error('Provide an initial password of at least 12 characters.');
      columns = ['name', 'email', 'role', 'active', 'password_hash', 'details'];
      values = [data.name, data.email, role, active, password ? await bcrypt.hash(password, 12) : existing.password_hash, JSON.stringify(details)];
      break;
    }
    default:
      columns = ['name', 'details']; values = [data.name, JSON.stringify(details)];
  }
  if (existing) {
    await tx.query(`UPDATE ${tables[collection]} SET ${columns.map((column, index) => `${column} = $${index + 1}`).join(', ')}, version = version + 1 WHERE id = $${values.length + 1}`, [...values, existing.id]);
  } else {
    await tx.query(`INSERT INTO ${tables[collection]} (${columns.join(', ')}) VALUES (${values.map((_, index) => `$${index + 1}`).join(', ')})`, values);
  }
}

export async function applyRecordChanges(collection, changes, user) {
  assertCollection(collection);
  if (collection === 'staff' && user.role !== 'admin') throw Object.assign(new Error('Administrator access required.'), { status: 403 });
  if (!Array.isArray(changes) || changes.length < 1 || changes.length > 100) throw new Error('Provide between 1 and 100 changes.');
  return transaction(async (tx) => {
    for (const change of changes) {
      if (!['create', 'update', 'delete'].includes(change.type)) throw new Error('Invalid change type.');
      let existing;
      if (change.type !== 'create') {
        if (!Number.isSafeInteger(change.id) || change.id <= 0) throw new Error('Invalid record ID.');
        existing = (await tx.query(`SELECT * FROM ${tables[collection]} WHERE id = $1 FOR UPDATE`, [change.id])).rows[0];
        if (!existing) throw Object.assign(new Error('This record no longer exists. Reload the page.'), { status: 409 });
        if (existing.version !== change.version) throw Object.assign(new Error('This record changed since you loaded it. Reload before saving.'), { status: 409 });
      }
      if (change.type === 'delete') {
        if (collection !== 'books') throw new Error('Deleting this kind of record is not supported.');
        const loans = await tx.query(`SELECT id FROM loans WHERE book_id = $1 AND status <> 'returned' LIMIT 1`, [change.id]);
        if (loans.rows.length) throw new Error('Return all outstanding loans before retiring this book.');
        await tx.query('DELETE FROM books WHERE id = $1', [change.id]);
      } else {
        await writeRecord(tx, collection, change.data, existing, user);
      }
      await logAuditEvent(tx, { actorType: 'staff', actorId: user.id, action: `RECORD_${change.type.toUpperCase()}`, entityType: collection, entityId: existing?.id || 'new' });
    }
    return listRecords(collection, tx);
  });
}

export async function getReports() {
  const [books, members, loans] = await Promise.all([listRecords('books'), listRecords('members'), listRecords('loans')]);
  const months = new Map();
  const titles = new Map();
  const categoryCounts = new Map();
  const borrowerCounts = new Map();
  let days = 0;
  let returned = 0;
  const monthRecord = (key) => {
    if (!months.has(key)) months.set(key, { month: key, issued: 0, returned: 0 });
    return months.get(key);
  };
  for (const loan of loans) {
    monthRecord(loan.issueDate.slice(0, 7)).issued++;
    borrowerCounts.set(loan.memberId, (borrowerCounts.get(loan.memberId) || 0) + 1);
    const key = loan.bookId || loan.bookTitle;
    const title = titles.get(key) || { title: loan.bookTitle, author: books.find((book) => book.id === loan.bookId)?.author || '', category: loan.bookCategory, borrows: 0 };
    title.borrows++;
    titles.set(key, title);
    if (loan.returnDate) {
      monthRecord(loan.returnDate.slice(0, 7)).returned++;
      days += (new Date(loan.returnDate) - new Date(loan.issueDate)) / 86400000;
      returned++;
    }
  }
  for (const book of books) categoryCounts.set(book.category, (categoryCounts.get(book.category) || 0) + book.copiesTotal);
  const totalCopies = books.reduce((sum, book) => sum + book.copiesTotal, 0);
  return {
    totalLoans: loans.length, activeMembers: members.filter((member) => member.status === 'active').length,
    retention: borrowerCounts.size ? Math.round([...borrowerCounts.values()].filter((number) => number > 1).length / borrowerCounts.size * 1000) / 10 : 0,
    utilization: totalCopies ? Math.round(loans.filter((loan) => loan.status !== 'returned').length / totalCopies * 1000) / 10 : 0,
    averageLoanDays: returned ? Math.round(days / returned * 10) / 10 : 0,
    monthly: [...months.values()].sort((a, b) => a.month.localeCompare(b.month)).map((month) => ({ ...month, net: `${month.issued >= month.returned ? '+' : ''}${month.issued - month.returned}` })),
    categories: [...categoryCounts].map(([name, count]) => ({ name, count, percent: totalCopies ? Math.round(count / totalCopies * 100) : 0, color: '#555555' })),
    topBooks: [...titles.values()].sort((a, b) => b.borrows - a.borrows).slice(0, 6).map((book, index) => ({ ...book, rank: index + 1 })),
  };
}
