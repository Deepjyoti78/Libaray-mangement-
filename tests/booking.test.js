import test from 'node:test';
import assert from 'node:assert/strict';
import { query, getDb } from '../server/db/connection.js';
import { createReservation, getFacilityAvailability, getBookingByRef, cancelReservation } from '../server/services/bookingService.js';
import { processCheckin } from '../server/services/checkinService.js';
import { startServer } from '../server/index.js';

test('Library Booking and Check-in System - Full Specification Test Suite', async (t) => {
  let serverInstance = null;
  try {
    const health = await fetch('http://localhost:3001/api/health').catch(() => null);
    if (!health || !health.ok) {
      const init = await startServer();
      serverInstance = init?.server;
    }
  } catch (_) {}

  t.after(async () => {
    if (serverInstance) {
      await new Promise((resolve) => serverInstance.close(resolve));
    }
    const db = await getDb();
    await db.close();
  });
  // Setup: Find a valid upcoming open date (e.g. Wednesday or Thursday within advance window)
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  let testDate = null;

  for (let i = 2; i <= 10; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dayName = daysOfWeek[d.getDay()];
    if (['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].includes(dayName)) {
      testDate = d.toISOString().split('T')[0];
      break;
    }
  }

  assert.ok(testDate, 'Should find a valid upcoming open date for tests');

  // Reset standard capacities and clean prior test bookings to guarantee test isolation
  await query(`UPDATE facility_session_capacities SET capacity = 15;`);
  await query(`DELETE FROM bookings WHERE visitor_email LIKE '%@test.com' OR visitor_email LIKE '%@specialdomain.com';`);

  const runId = Date.now();

  await t.test('1. A valid reservation is created and persisted', async () => {
    const email = `traveler1_${runId}@test.com`;
    const booking = await createReservation({
      facilityId: 'reading-room',
      sessionId: 'morning',
      visitDate: testDate,
      visitorName: 'Test Traveler',
      visitorEmail: email,
      membershipNo: null,
    });

    assert.ok(booking.bookingRef.startsWith('JF-2026-'));
    assert.equal(booking.status, 'confirmed');
    assert.equal(booking.visitorEmail, email);
    assert.ok(booking.qrCodeDataUrl.startsWith('data:image/png;base64,'));

    // Check DB persistence
    const dbRes = await query(`SELECT * FROM bookings WHERE booking_ref = $1;`, [booking.bookingRef]);
    assert.equal(dbRes.rows.length, 1);
    assert.equal(dbRes.rows[0].status, 'confirmed');
  });

  await t.test('2. A full session rejects new reservations', async () => {
    // Set capacity for a test session to 1
    await query(
      `INSERT INTO facility_session_capacities (facility_id, session_id, capacity)
       VALUES ('manga-corner', 'afternoon', 1)
       ON CONFLICT (facility_id, session_id) DO UPDATE SET capacity = 1;`
    );

    // Clean any existing bookings for this slot on testDate
    await query(
      `DELETE FROM bookings WHERE facility_id = 'manga-corner' AND session_id = 'afternoon' AND visit_date = $1;`,
      [testDate]
    );

    // Book 1st slot -> succeeds
    await createReservation({
      facilityId: 'manga-corner',
      sessionId: 'afternoon',
      visitDate: testDate,
      visitorName: 'Lucky Visitor',
      visitorEmail: `lucky_${runId}@test.com`,
    });

    // Book 2nd slot -> must fail with full session error
    await assert.rejects(
      async () => {
        await createReservation({
          facilityId: 'manga-corner',
          sessionId: 'afternoon',
          visitDate: testDate,
          visitorName: 'Unlucky Visitor',
          visitorEmail: `unlucky_${runId}@test.com`,
        });
      },
      /filled up|capacity|full/i
    );

    // Reset capacity back to standard
    await query(`UPDATE facility_session_capacities SET capacity = 15 WHERE facility_id = 'manga-corner' AND session_id = 'afternoon';`);
  });

  await t.test('3. Concurrent requests cannot exceed capacity', async () => {
    // Set capacity to 2
    await query(
      `UPDATE facility_session_capacities SET capacity = 2 
       WHERE facility_id = 'reading-room' AND session_id = 'afternoon';`
    );
    await query(
      `DELETE FROM bookings WHERE facility_id = 'reading-room' AND session_id = 'afternoon' AND visit_date = $1;`,
      [testDate]
    );

    // Fire 5 simultaneous reservation requests
    const promises = [1, 2, 3, 4, 5].map((idx) =>
      createReservation({
        facilityId: 'reading-room',
        sessionId: 'afternoon',
        visitDate: testDate,
        visitorName: `Concurrent Visitor ${idx}`,
        visitorEmail: `concurrent_${runId}_${idx}@test.com`,
      }).catch((e) => e)
    );

    const results = await Promise.all(promises);
    const succeeded = results.filter((r) => r && r.bookingRef);
    const failed = results.filter((r) => r instanceof Error);

    // Exactly 2 must succeed, 3 must fail!
    assert.equal(succeeded.length, 2, 'Exactly 2 bookings should succeed for capacity of 2');
    assert.equal(failed.length, 3, 'Remaining 3 bookings must be rejected');

    // Reset capacity back to standard
    await query(`UPDATE facility_session_capacities SET capacity = 15 WHERE facility_id = 'reading-room' AND session_id = 'afternoon';`);
  });

  await t.test('4. Closed dates cannot be booked', async () => {
    // Find next Sunday (closed day)
    let closedDate = null;
    for (let i = 1; i <= 8; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      if (d.getDay() === 0) { // Sunday
        closedDate = d.toISOString().split('T')[0];
        break;
      }
    }

    await assert.rejects(
      async () => {
        await createReservation({
          facilityId: 'reading-room',
          sessionId: 'morning',
          visitDate: closedDate,
          visitorName: 'Sunday Visitor',
          visitorEmail: `sunday_${runId}@test.com`,
        });
      },
      /closed on Sundays/i
    );
  });

  await t.test('5. Invalid dates and sessions are rejected', async () => {
    // Past date
    await assert.rejects(
      async () => {
        await createReservation({
          facilityId: 'reading-room',
          sessionId: 'morning',
          visitDate: '2020-01-01',
          visitorName: 'Time Traveler',
          visitorEmail: `timetraveler_${runId}@test.com`,
        });
      },
      /past date/i
    );

    // Invalid session ID
    await assert.rejects(
      async () => {
        await createReservation({
          facilityId: 'reading-room',
          sessionId: 'midnight-ghost-session',
          visitDate: testDate,
          visitorName: 'Ghost Visitor',
          visitorEmail: `ghost_${runId}@test.com`,
        });
      },
      /Invalid or inactive session/i
    );
  });

  await t.test('6. The daily booking limit is enforced', async () => {
    const userEmail = `strictlimit_${runId}@test.com`;

    // First booking on testDate -> succeeds
    await createReservation({
      facilityId: 'reading-room',
      sessionId: 'morning',
      visitDate: testDate,
      visitorName: 'Limit Tester',
      visitorEmail: userEmail,
    });

    // Second booking on same date -> fails with daily limit error
    await assert.rejects(
      async () => {
        await createReservation({
          facilityId: 'manga-corner',
          sessionId: 'morning',
          visitDate: testDate,
          visitorName: 'Limit Tester',
          visitorEmail: userEmail,
        });
      },
      /Daily reservation limit reached/i
    );
  });

  await t.test('7. Cancellation releases capacity correctly', async () => {
    // Set capacity to 1
    await query(
      `UPDATE facility_session_capacities SET capacity = 1 
       WHERE facility_id = 'manga-corner' AND session_id = 'morning';`
    );
    await query(
      `DELETE FROM bookings WHERE facility_id = 'manga-corner' AND session_id = 'morning' AND visit_date = $1;`,
      [testDate]
    );

    // Create 1 booking -> fills capacity
    const b1 = await createReservation({
      facilityId: 'manga-corner',
      sessionId: 'morning',
      visitDate: testDate,
      visitorName: 'First Booker',
      visitorEmail: `firstbooker_${runId}@test.com`,
    });

    // Check availability -> remaining capacity 0
    let avail = await getFacilityAvailability('manga-corner', testDate);
    let morningSession = avail.sessions.find((s) => s.id === 'morning');
    assert.equal(morningSession.remainingCapacity, 0);

    // Cancel first booking
    await cancelReservation(b1.bookingRef, {
      managementToken: b1.managementToken,
      reason: 'No longer needed',
    });

    // Check availability -> remaining capacity is released back to 1!
    avail = await getFacilityAvailability('manga-corner', testDate);
    morningSession = avail.sessions.find((s) => s.id === 'morning');
    assert.equal(morningSession.remainingCapacity, 1);

    // Another person can now book!
    const b2 = await createReservation({
      facilityId: 'manga-corner',
      sessionId: 'morning',
      visitDate: testDate,
      visitorName: 'Second Booker',
      visitorEmail: `secondbooker_${runId}@test.com`,
    });
    assert.ok(b2.bookingRef);

    // Reset capacity back to standard
    await query(`UPDATE facility_session_capacities SET capacity = 15 WHERE facility_id = 'manga-corner' AND session_id = 'morning';`);
  });

  await t.test('8. A cancelled booking cannot be checked in', async () => {
    const booking = await createReservation({
      facilityId: 'reading-room',
      sessionId: 'morning',
      visitDate: testDate,
      visitorName: 'Will Cancel',
      visitorEmail: `willcancel_${runId}@test.com`,
    });

    await cancelReservation(booking.bookingRef, {
      managementToken: booking.managementToken,
      reason: 'Trip cancelled',
    });

    await assert.rejects(
      async () => {
        await processCheckin({
          payload: booking.bookingRef,
          staffUserId: 1,
        });
      },
      /cancelled/i
    );
  });

  await t.test('9. Invalid QR credentials are rejected', async () => {
    await assert.rejects(
      async () => {
        await processCheckin({
          payload: 'JF-2026-FAKE999',
          staffUserId: 1,
        });
      },
      /No booking found/i
    );
  });

  await t.test('10. A repeated check-in does not record another arrival', async () => {
    const booking = await createReservation({
      facilityId: 'reading-room',
      sessionId: 'morning',
      visitDate: testDate,
      visitorName: 'Checkin Guy',
      visitorEmail: `checkinguy_${runId}@test.com`,
    });

    // 1st Check-in -> succeeds
    const res1 = await processCheckin({
      payload: booking.bookingRef,
      staffUserId: 1,
    });
    assert.equal(res1.status, 'checked_in');

    // 2nd Check-in -> rejected as duplicate!
    await assert.rejects(
      async () => {
        await processCheckin({
          payload: booking.bookingRef,
          staffUserId: 1,
        });
      },
      /already checked in|Duplicate/i
    );
  });

  await t.test('11. An unauthorized visitor cannot access staff routes', async () => {
    const res = await fetch('http://localhost:3001/api/admin/stats');
    assert.equal(res.status, 401, 'Unauthenticated request should return 401');
  });

  await t.test('12. An unauthenticated API request cannot perform staff operations', async () => {
    const res = await fetch('http://localhost:3001/api/admin/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: 'JF-2026-TEST' }),
    });
    assert.equal(res.status, 401, 'Unauthenticated check-in should return 401');
  });

  await t.test('13. Schedule configuration changes affect availability', async () => {
    // Add closure date
    await query(
      `INSERT INTO closure_dates (override_date, is_closed, reason, created_by)
       VALUES ($1, true, 'Test National Holiday Closure', 1)
       ON CONFLICT (override_date) DO UPDATE SET is_closed = true, reason = 'Test National Holiday Closure';`,
      [testDate]
    );

    const avail = await getFacilityAvailability('reading-room', testDate);
    assert.equal(avail.available, false);
    assert.match(avail.reason, /Test National Holiday Closure/i);

    // Remove closure
    await query(`DELETE FROM closure_dates WHERE override_date = $1;`, [testDate]);

    const availAfter = await getFacilityAvailability('reading-room', testDate);
    assert.equal(availAfter.available, true);
  });

  await t.test('14. Booking retrieval does not expose private details to unauthorized users', async () => {
    const booking = await createReservation({
      facilityId: 'reading-room',
      sessionId: 'morning',
      visitDate: testDate,
      visitorName: 'Secret Reader',
      visitorEmail: `secret.reader_${runId}@specialdomain.com`,
    });

    // Without token -> rejected
    await assert.rejects(
      async () => {
        await getBookingByRef(booking.bookingRef, { managementToken: null, isStaff: false });
      },
      /Unauthorized/i
    );

    // Wrong token -> rejected
    await assert.rejects(
      async () => {
        await getBookingByRef(booking.bookingRef, { managementToken: 'invalid-token-1234', isStaff: false });
      },
      /Unauthorized/i
    );

    // With valid token -> email is masked for visitor privacy
    const retrieved = await getBookingByRef(booking.bookingRef, { managementToken: booking.managementToken, isStaff: false });
    assert.ok(retrieved.visitorEmail.includes('***'));
    assert.notEqual(retrieved.visitorEmail, `secret.reader_${runId}@specialdomain.com`);
  });
});
