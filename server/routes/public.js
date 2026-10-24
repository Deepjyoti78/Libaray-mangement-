import express from 'express';
import { getPublicConfig, getFacilityAvailability, createReservation, getBookingByRef, cancelReservation } from '../services/bookingService.js';
import { validateBody, createBookingSchema, cancelBookingSchema } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

/**
 * GET /api/config
 * Returns public facilities, sessions, opening days, and rules.
 */
router.get('/config', async (req, res) => {
  try {
    const config = await getPublicConfig();
    res.json(config);
  } catch (err) {
    console.error('Error fetching config:', err);
    res.status(500).json({ error: 'Failed to load library configuration.' });
  }
});

/**
 * GET /api/availability?facilityId=...&date=YYYY-MM-DD
 * Returns real-time capacity and availability for a selected facility and date.
 */
router.get('/availability', async (req, res) => {
  try {
    const { facilityId, date } = req.query;

    if (!facilityId || !date) {
      return res.status(400).json({ error: 'facilityId and date (YYYY-MM-DD) are required.' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD.' });
    }

    const availability = await getFacilityAvailability(facilityId, date);
    res.json(availability);
  } catch (err) {
    console.error('Error checking availability:', err);
    res.status(500).json({ error: err.message || 'Failed to check slot availability.' });
  }
});

/**
 * POST /api/bookings
 * Creates a persistent reservation with atomic capacity checks.
 */
router.post(
  '/bookings',
  rateLimit({ windowMs: 60000, maxRequests: 8, message: 'Too many booking attempts. Please slow down.' }),
  validateBody(createBookingSchema),
  async (req, res) => {
    try {
      const reservation = await createReservation(req.body);
      res.status(201).json({
        success: true,
        message: 'Reservation confirmed successfully.',
        booking: reservation,
      });
    } catch (err) {
      console.error('Booking creation error:', err.message);
      res.status(400).json({ error: err.message || 'Could not complete reservation.' });
    }
  }
);

/**
 * GET /api/bookings/:ref
 * Retrieves an authorized booking confirmation using management token.
 */
router.get('/bookings/:ref', async (req, res) => {
  try {
    const { ref } = req.params;
    const token = req.query.token || req.headers['x-management-token'];

    if (!token) {
      return res.status(401).json({ error: 'Management token is required to view reservation details.' });
    }

    const booking = await getBookingByRef(ref, { managementToken: token });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    res.json(booking);
  } catch (err) {
    if (err.message.includes('Unauthorized')) {
      return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to retrieve reservation details.' });
  }
});

/**
 * POST /api/bookings/:ref/cancel
 * Cancels a reservation using management token and releases capacity immediately.
 */
router.post(
  '/bookings/:ref/cancel',
  validateBody(cancelBookingSchema),
  async (req, res) => {
    try {
      const { ref } = req.params;
      const token = req.query.token || req.headers['x-management-token'] || req.body.token;

      if (!token) {
        return res.status(401).json({ error: 'Management token is required to cancel reservation.' });
      }

      const result = await cancelReservation(ref, {
        managementToken: token,
        reason: req.body.reason,
      });

      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Failed to cancel reservation.' });
    }
  }
);

export default router;
