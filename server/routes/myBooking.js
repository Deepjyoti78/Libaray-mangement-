import express from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { query } from '../db/connection.js';
import { getBookingByRef } from '../services/bookingService.js';

const router = express.Router();

const lookupSchema = z.object({
  bookingRef: z.string().min(4, 'Please enter your booking reference.'),
  email: z.string().email('Please enter the email address used when booking.'),
});

/**
 * POST /api/my-booking/lookup
 * Securely retrieves reservation details only when booking reference AND visitor email match.
 */
router.post(
  '/lookup',
  rateLimit({ windowMs: 60000, maxRequests: 10, message: 'Too many lookup attempts. Please wait a moment.' }),
  validateBody(lookupSchema),
  async (req, res) => {
    try {
      const { bookingRef, email } = req.body;
      const cleanRef = bookingRef.trim().toUpperCase();
      const cleanEmail = email.trim().toLowerCase();

      // Look up booking by reference and verified email
      const dbRes = await query(
        `SELECT booking_ref, management_token 
         FROM bookings 
         WHERE UPPER(booking_ref) = $1 AND LOWER(visitor_email) = $2;`,
        [cleanRef, cleanEmail]
      );

      if (dbRes.rows.length === 0) {
        // Return generic error to avoid email enumeration
        return res.status(404).json({
          error: 'No matching reservation found with this booking reference and email address.',
        });
      }

      const match = dbRes.rows[0];
      const booking = await getBookingByRef(match.booking_ref, {
        managementToken: match.management_token,
      });

      res.json({
        success: true,
        booking,
      });
    } catch (err) {
      console.error('Error during booking lookup:', err);
      res.status(500).json({ error: 'Failed to look up reservation details.' });
    }
  }
);

export default router;
