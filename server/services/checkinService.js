import { query, transaction } from '../db/connection.js';
import { hashToken } from '../utils/tokens.js';
import { validateStatusTransition, logAuditEvent } from './statusService.js';
import { getNowInKolkata } from '../utils/dates.js';

/**
 * Validates a scanned QR payload or manual search reference and performs check-in.
 * 
 * Supports two payload shapes:
 * 1. JSON string: { ref: 'JF-2026-XXXXX', token: '...' }
 * 2. Plain booking reference string: 'JF-2026-XXXXX' (manual search fallback)
 */
export async function processCheckin({ payload, staffUserId }) {
  let bookingRef = null;
  let checkinToken = null;

  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        bookingRef = parsed.ref;
        checkinToken = parsed.token;
      } catch {
        bookingRef = trimmed;
      }
    } else {
      bookingRef = trimmed;
    }
  } else if (typeof payload === 'object' && payload !== null) {
    bookingRef = payload.ref;
    checkinToken = payload.token;
  }

  if (!bookingRef) {
    throw new Error('Invalid check-in credential provided.');
  }

  return await transaction(async (tx) => {
    // 1. Fetch booking with row lock on bookings table
    const res = await tx.query(
      `SELECT b.*, f.name as facility_name, s.name as session_name, s.start_time, s.end_time
       FROM bookings b
       LEFT JOIN facilities f ON f.id = b.facility_id
       LEFT JOIN sessions s ON s.id = b.session_id
       WHERE UPPER(b.booking_ref) = UPPER($1) FOR UPDATE OF b;`,
      [bookingRef]
    );

    if (res.rows.length === 0) {
      throw new Error(`No booking found with reference "${bookingRef}".`);
    }

    const b = res.rows[0];

    // 2. If token is provided, verify against stored hash or token hash
    if (checkinToken) {
      const hashed = hashToken(checkinToken);
      if (hashed !== b.checkin_token_hash && checkinToken !== b.checkin_token_hash) {
        throw new Error('Invalid check-in security token.');
      }
    }

    // 3. Status checks
    if (b.status === 'checked_in') {
      const checkedInTime = b.checked_in_at
        ? new Date(b.checked_in_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })
        : 'earlier';
      throw new Error(
        `Visitor already checked in at ${checkedInTime}. Duplicate check-in rejected.`
      );
    }

    if (b.status === 'cancelled') {
      throw new Error(
        `This reservation was cancelled on ${b.cancelled_at ? new Date(b.cancelled_at).toLocaleDateString('en-IN') : 'earlier'}. Check-in denied.`
      );
    }

    if (b.status === 'completed') {
      throw new Error('This visit has already been marked completed.');
    }

    if (b.status !== 'confirmed') {
      throw new Error(`Cannot check in a reservation with status '${b.status}'.`);
    }

    // 4. Validate state transition
    validateStatusTransition(b.status, 'checked_in');

    // 5. Update record to checked_in
    const nowIso = new Date().toISOString();
    await tx.query(
      `UPDATE bookings 
       SET status = 'checked_in', 
           checked_in_at = $1, 
           checked_in_by = $2, 
           updated_at = $1 
       WHERE id = $3;`,
      [nowIso, staffUserId, b.id]
    );

    // 6. Log audit event
    await logAuditEvent(tx, {
      actorType: 'staff',
      actorId: staffUserId,
      action: 'VISITOR_CHECKED_IN',
      entityType: 'booking',
      entityId: b.booking_ref,
      metadata: {
        facilityId: b.facility_id,
        sessionId: b.session_id,
        visitDate: b.visit_date,
        visitorName: b.visitor_name,
      },
    });

    return {
      success: true,
      bookingRef: b.booking_ref,
      visitorName: b.visitor_name,
      visitorEmail: b.visitor_email,
      facilityName: b.facility_name,
      sessionName: b.session_name,
      sessionTime: `${b.start_time} - ${b.end_time}`,
      visitDate: b.visit_date instanceof Date ? b.visit_date.toISOString().split('T')[0] : String(b.visit_date),
      checkedInAt: nowIso,
      status: 'checked_in',
    };
  });
}
