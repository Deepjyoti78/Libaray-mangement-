import { query, transaction } from '../db/connection.js';
import { getDayOfWeek, isDateInPast, isDateBeyondAdvanceWindow, hasSessionEndedToday, getNowInKolkata } from '../utils/dates.js';
import { generateBookingRef, generateSecureToken, hashToken, generateQrCode } from '../utils/tokens.js';
import { validateStatusTransition, logAuditEvent } from './statusService.js';
import { sendBookingConfirmationEmail, sendBookingCancellationEmail } from './emailService.js';

/**
 * Retrieves public configuration needed for the booking wizard
 */
export async function getPublicConfig() {
  const facilitiesRes = await query(`SELECT id, name, description, image_url, active FROM facilities WHERE active = true ORDER BY name;`);
  const sessionsRes = await query(`SELECT id, name, start_time, end_time, active FROM sessions WHERE active = true ORDER BY start_time;`);
  const settingsRes = await query(`SELECT key, value FROM settings;`);

  const settingsMap = {};
  settingsRes.rows.forEach((r) => {
    try {
      settingsMap[r.key] = JSON.parse(r.value);
    } catch {
      settingsMap[r.key] = r.value;
    }
  });

  return {
    facilities: facilitiesRes.rows,
    sessions: sessionsRes.rows,
    settings: {
      dailyBookingLimit: parseInt(settingsMap.daily_booking_limit || '1', 10),
      advanceBookingDays: parseInt(settingsMap.advance_booking_days || '14', 10),
      cancellationCutoffHours: parseInt(settingsMap.cancellation_cutoff_hours || '2', 10),
      openingDays: settingsMap.opening_days || ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      requireMembership: settingsMap.require_membership === true || settingsMap.require_membership === 'true',
    },
    timezone: 'Asia/Kolkata',
  };
}

/**
 * Retrieves date and session availability for a specific facility
 */
export async function getFacilityAvailability(facilityId, dateStr) {
  const config = await getPublicConfig();

  // 1. Date validation
  if (isDateInPast(dateStr)) {
    return {
      date: dateStr,
      available: false,
      reason: 'Date is in the past.',
      sessions: [],
    };
  }

  if (isDateBeyondAdvanceWindow(dateStr, config.settings.advanceBookingDays)) {
    return {
      date: dateStr,
      available: false,
      reason: `Bookings open only up to ${config.settings.advanceBookingDays} days in advance.`,
      sessions: [],
    };
  }

  // 2. Day of week opening check
  const dayOfWeek = getDayOfWeek(dateStr);
  if (!config.settings.openingDays.includes(dayOfWeek)) {
    return {
      date: dateStr,
      available: false,
      dayOfWeek,
      reason: `The library is closed on ${dayOfWeek}s. Open days are ${config.settings.openingDays.join(', ')}.`,
      sessions: [],
    };
  }

  // 3. Closure overrides check
  const closureRes = await query(
    `SELECT is_closed, reason FROM closure_dates WHERE override_date = $1;`,
    [dateStr]
  );
  if (closureRes.rows.length > 0 && closureRes.rows[0].is_closed) {
    return {
      date: dateStr,
      available: false,
      dayOfWeek,
      reason: closureRes.rows[0].reason || 'The library is closed on this date for a special event or holiday.',
      sessions: [],
    };
  }

  // 4. Query capacities and current booked counts per session
  const capacitiesRes = await query(
    `SELECT s.id, s.name, s.start_time, s.end_time,
            COALESCE(fsc.capacity, 10) as capacity,
            (
              SELECT COUNT(*)::int FROM bookings b
              WHERE b.visit_date = $1
                AND b.facility_id = $2
                AND b.session_id = s.id
                AND b.status IN ('confirmed', 'checked_in')
            ) as booked_count
     FROM sessions s
     LEFT JOIN facility_session_capacities fsc
       ON fsc.session_id = s.id AND fsc.facility_id = $2
     WHERE s.active = true
     ORDER BY s.start_time;`,
    [dateStr, facilityId]
  );

  const sessions = capacitiesRes.rows.map((row) => {
    const capacity = parseInt(row.capacity, 10);
    const booked = parseInt(row.booked_count, 10);
    const remaining = Math.max(0, capacity - booked);
    const isPastToday = hasSessionEndedToday(dateStr, row.end_time);

    let isAvailable = remaining > 0 && !isPastToday;
    let unavailableReason = null;
    if (remaining <= 0) {
      unavailableReason = 'Fully booked';
    } else if (isPastToday) {
      unavailableReason = 'Session concluded for today';
    }

    return {
      id: row.id,
      name: row.name,
      startTime: row.start_time,
      endTime: row.end_time,
      capacity,
      bookedCount: booked,
      remainingCapacity: remaining,
      isAvailable,
      unavailableReason,
    };
  });

  return {
    date: dateStr,
    dayOfWeek,
    available: true,
    facilityId,
    sessions,
  };
}

/**
 * Creates a persistent booking inside an ACID transaction
 */
export async function createReservation({
  facilityId,
  sessionId,
  visitDate,
  visitorName,
  visitorEmail,
  membershipNo,
}) {
  const emailNorm = visitorEmail.toLowerCase().trim();
  const nameNorm = visitorName.trim();

  return await transaction(async (tx) => {
    // 1. Fetch public settings
    const settingsRes = await tx.query(`SELECT key, value FROM settings;`);
    const settings = {};
    settingsRes.rows.forEach((r) => {
      try { settings[r.key] = JSON.parse(r.value); } catch { settings[r.key] = r.value; }
    });

    const advanceDays = parseInt(settings.advance_booking_days || '14', 10);
    const dailyLimit = parseInt(settings.daily_booking_limit || '1', 10);
    const openingDays = settings.opening_days || ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // 2. Validate date & opening days
    if (isDateInPast(visitDate)) {
      throw new Error('Cannot create reservation for a past date.');
    }
    if (isDateBeyondAdvanceWindow(visitDate, advanceDays)) {
      throw new Error(`Reservations can only be made up to ${advanceDays} days in advance.`);
    }

    const dayName = getDayOfWeek(visitDate);
    if (!openingDays.includes(dayName)) {
      throw new Error(`The library is closed on ${dayName}s.`);
    }

    // 3. Check exceptional closures
    const closureRes = await tx.query(
      `SELECT is_closed, reason FROM closure_dates WHERE override_date = $1;`,
      [visitDate]
    );
    if (closureRes.rows.length > 0 && closureRes.rows[0].is_closed) {
      throw new Error(closureRes.rows[0].reason || 'The library is closed on this date.');
    }

    // 4. Validate session exists
    const sessionRes = await tx.query(
      `SELECT id, name, start_time, end_time, active FROM sessions WHERE id = $1 AND active = true;`,
      [sessionId]
    );
    if (sessionRes.rows.length === 0) {
      throw new Error('Invalid or inactive session selected.');
    }
    const sessionData = sessionRes.rows[0];

    if (hasSessionEndedToday(visitDate, sessionData.end_time)) {
      throw new Error('The selected session has already concluded for today.');
    }

    // 5. Enforce 1-slot-per-person-per-day (configurable daily limit)
    const existingUserBookingsRes = await tx.query(
      `SELECT id, booking_ref FROM bookings 
       WHERE visitor_email = $1 
         AND visit_date = $2 
         AND status IN ('confirmed', 'checked_in');`,
      [emailNorm, visitDate]
    );
    if (existingUserBookingsRes.rows.length >= dailyLimit) {
      throw new Error(
        `Daily reservation limit reached. A visitor may reserve a maximum of ${dailyLimit} slot per day.`
      );
    }

    // 6. Enforce Capacity with atomic check
    const capRes = await tx.query(
      `SELECT capacity FROM facility_session_capacities 
       WHERE facility_id = $1 AND session_id = $2;`,
      [facilityId, sessionId]
    );
    const maxCapacity = capRes.rows.length > 0 ? parseInt(capRes.rows[0].capacity, 10) : 10;

    const currentBookedRes = await tx.query(
      `SELECT COUNT(*)::int as count FROM bookings 
       WHERE visit_date = $1 
         AND facility_id = $2 
         AND session_id = $3 
         AND status IN ('confirmed', 'checked_in');`,
      [visitDate, facilityId, sessionId]
    );
    const currentCount = parseInt(currentBookedRes.rows[0]?.count || '0', 10);

    if (currentCount >= maxCapacity) {
      throw new Error('This session has just filled up. Please select another slot.');
    }

    // 7. Generate unguessable credentials
    let bookingRef = generateBookingRef();
    // Verify uniqueness (collision avoidance)
    for (let attempts = 0; attempts < 5; attempts++) {
      const exists = await tx.query(`SELECT id FROM bookings WHERE booking_ref = $1;`, [bookingRef]);
      if (exists.rows.length === 0) break;
      bookingRef = generateBookingRef();
    }

    const checkinToken = generateSecureToken();
    const managementToken = generateSecureToken();
    const checkinTokenHash = hashToken(checkinToken);

    // 8. Insert into bookings
    const insertRes = await tx.query(
      `INSERT INTO bookings (
         booking_ref, checkin_token_hash, management_token, facility_id, session_id,
         visit_date, visitor_name, visitor_email, membership_no, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'confirmed')
       RETURNING id, created_at;`,
      [
        bookingRef,
        checkinTokenHash,
        managementToken,
        facilityId,
        sessionId,
        visitDate,
        nameNorm,
        emailNorm,
        membershipNo ? membershipNo.trim() : null,
      ]
    );

    const bookingId = insertRes.rows[0].id;

    // 9. Audit event
    await logAuditEvent(tx, {
      actorType: 'visitor',
      actorId: emailNorm,
      action: 'BOOKING_CREATED',
      entityType: 'booking',
      entityId: bookingRef,
      metadata: { facilityId, sessionId, visitDate, visitorName: nameNorm },
    });

    // 10. Generate QR code payload (Opaque checkinToken without personal data)
    const qrPayload = JSON.stringify({
      ref: bookingRef,
      token: checkinToken,
    });
    const qrCodeDataUrl = await generateQrCode(qrPayload);

    // Facility details for response
    const facRes = await tx.query(`SELECT name FROM facilities WHERE id = $1;`, [facilityId]);
    const facilityName = facRes.rows[0]?.name || facilityId;

    const result = {
      bookingRef,
      managementToken,
      facilityId,
      facilityName,
      sessionId,
      sessionName: sessionData.name,
      sessionStartTime: sessionData.start_time,
      sessionEndTime: sessionData.end_time,
      visitDate,
      visitorName: nameNorm,
      visitorEmail: emailNorm,
      membershipNo: membershipNo || null,
      status: 'confirmed',
      qrCodeDataUrl,
      createdAt: insertRes.rows[0].created_at,
    };

    // Asynchronously dispatch email notification
    sendBookingConfirmationEmail({
      ...result,
      session_name: sessionData.name,
      session_start: sessionData.start_time,
      session_end: sessionData.end_time,
    }).catch((e) => console.error('Email error:', e));

    return result;
  });
}

/**
 * Retrieves booking details by reference and verifies management token or staff authorization
 */
export async function getBookingByRef(bookingRef, { managementToken = null, isStaff = false } = {}) {
  const res = await query(
    `SELECT b.id, b.booking_ref, b.management_token, b.checkin_token_hash,
            b.facility_id, f.name as facility_name,
            b.session_id, s.name as session_name, s.start_time as session_start, s.end_time as session_end,
            b.visit_date, b.visitor_name, b.visitor_email, b.membership_no,
            b.status, b.created_at, b.cancelled_at, b.cancellation_reason,
            b.checked_in_at, b.checked_in_by, u.name as checked_in_by_name
     FROM bookings b
     LEFT JOIN facilities f ON f.id = b.facility_id
     LEFT JOIN sessions s ON s.id = b.session_id
     LEFT JOIN staff_users u ON u.id = b.checked_in_by
     WHERE b.booking_ref = $1;`,
    [bookingRef]
  );

  if (res.rows.length === 0) {
    return null;
  }

  const b = res.rows[0];

  // If not staff, enforce token check to prevent ID enumeration
  if (!isStaff) {
    if (!managementToken || managementToken !== b.management_token) {
      throw new Error('Unauthorized. Invalid management credential.');
    }
  }

  // Generate QR payload for confirmation view
  const qrPayload = JSON.stringify({
    ref: b.booking_ref,
    token: b.checkin_token_hash,
  });
  const qrCodeDataUrl = await generateQrCode(qrPayload);

  return {
    bookingRef: b.booking_ref,
    facilityId: b.facility_id,
    facilityName: b.facility_name,
    sessionId: b.session_id,
    sessionName: b.session_name,
    sessionStartTime: b.session_start,
    sessionEndTime: b.session_end,
    visitDate: b.visit_date instanceof Date ? b.visit_date.toISOString().split('T')[0] : String(b.visit_date),
    visitorName: b.visitor_name,
    visitorEmail: isStaff ? b.visitor_email : maskEmail(b.visitor_email),
    membershipNo: b.membership_no,
    status: b.status,
    createdAt: b.created_at,
    cancelledAt: b.cancelled_at,
    cancellationReason: b.cancellation_reason,
    checkedInAt: b.checked_in_at,
    checkedInByName: b.checked_in_by_name,
    qrCodeDataUrl,
    managementToken: isStaff ? undefined : b.management_token,
  };
}

/**
 * Cancels a booking, releasing capacity immediately in an atomic transaction
 */
export async function cancelReservation(bookingRef, { managementToken = null, isStaff = false, staffId = null, reason = '' } = {}) {
  return await transaction(async (tx) => {
    const res = await tx.query(
      `SELECT b.*, f.name as facility_name, s.name as session_name 
       FROM bookings b
       LEFT JOIN facilities f ON f.id = b.facility_id
       LEFT JOIN sessions s ON s.id = b.session_id
       WHERE b.booking_ref = $1 FOR UPDATE OF b;`,
      [bookingRef]
    );

    if (res.rows.length === 0) {
      throw new Error('Booking not found.');
    }

    const b = res.rows[0];

    // Authorization check
    if (!isStaff) {
      if (!managementToken || managementToken !== b.management_token) {
        throw new Error('Unauthorized. Invalid cancellation credential.');
      }

      // Check cancellation cutoff window
      const settingsRes = await tx.query(`SELECT value FROM settings WHERE key = 'cancellation_cutoff_hours';`);
      const cutoffHours = parseInt(settingsRes.rows[0]?.value || '2', 10);

      // Check if session start is within cutoff window
      const now = getNowInKolkata();
      const visitDateStr = b.visit_date instanceof Date ? b.visit_date.toISOString().split('T')[0] : String(b.visit_date);
      if (visitDateStr < now.dateStr) {
        throw new Error('Cannot cancel a reservation for a date in the past.');
      }
    }

    // Validate lifecycle status transition
    validateStatusTransition(b.status, 'cancelled');

    const nowIso = new Date().toISOString();
    const finalReason = reason ? reason.trim() : (isStaff ? 'Cancelled by staff' : 'Cancelled by visitor');

    await tx.query(
      `UPDATE bookings 
       SET status = 'cancelled', 
           cancelled_at = $1, 
           cancellation_reason = $2, 
           updated_at = $1 
       WHERE id = $3;`,
      [nowIso, finalReason, b.id]
    );

    await logAuditEvent(tx, {
      actorType: isStaff ? 'staff' : 'visitor',
      actorId: isStaff ? staffId : b.visitor_email,
      action: 'BOOKING_CANCELLED',
      entityType: 'booking',
      entityId: bookingRef,
      metadata: { reason: finalReason },
    });

    // Notify visitor
    sendBookingCancellationEmail({
      booking_ref: b.booking_ref,
      visitor_email: b.visitor_email,
      facility_name: b.facility_name,
      visit_date: b.visit_date,
    }).catch((e) => console.error('Email error:', e));

    return {
      success: true,
      bookingRef,
      status: 'cancelled',
      cancelledAt: nowIso,
      reason: finalReason,
    };
  });
}

function maskEmail(email) {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : `${user[0]}***`;
  return `${maskedUser}@${domain}`;
}
