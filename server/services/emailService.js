import nodemailer from 'nodemailer';
import { config } from '../config.js';

let transporter = null;

if (config.email.host && config.email.user) {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
}

/**
 * Sends a booking confirmation email or logs to terminal/dev log if unconfigured.
 */
export async function sendBookingConfirmationEmail(booking) {
  const ref = booking.booking_ref || booking.bookingRef;
  const email = booking.visitor_email || booking.visitorEmail;
  const name = booking.visitor_name || booking.visitorName;
  const facility = booking.facility_name || booking.facilityName || booking.facility_id || booking.facilityId;
  const date = booking.visit_date || booking.visitDate;
  const session = booking.session_name || booking.sessionName || booking.session_id || booking.sessionId;
  const startTime = booking.session_start || booking.sessionStartTime || '';
  const endTime = booking.session_end || booking.sessionEndTime || '';
  const managementToken = booking.management_token || booking.managementToken || '';

  const subject = `Your Library Visit Reservation [${ref}]`;
  const textContent = `
Thank you for reserving a slot at The Library, Japan Foundation New Delhi.

RESERVATION DETAILS:
Booking Reference: ${ref}
Facility: ${facility}
Date: ${date}
Session: ${session} (${startTime} - ${endTime})
Visitor: ${name}

CHECK-IN INSTRUCTIONS:
Please arrive at the circulation desk during your session hours and present your booking QR code or reference.
Address: 5A, Ring Road, Lajpat Nagar-IV, New Delhi 110024.

To view or manage your reservation:
${config.frontendOrigin}/booking/confirmation/${ref}?token=${managementToken}

(This is an independent student prototype for educational demonstration purposes).
`.trim();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: config.email.from,
        to: email,
        subject,
        text: textContent,
      });
      return { delivered: true, messageId: info.messageId };
    } catch (err) {
      console.error('Failed to send confirmation email via SMTP:', err.message);
      return { delivered: false, error: err.message };
    }
  }

  // Development Fallback: clearly report that email delivery is simulated/logged
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('📧 [DEV EMAIL SERVICE] Simulated Delivery (SMTP Unconfigured)');
  console.log(`To: ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Reference: ${ref}`);
  console.log('─────────────────────────────────────────────────────────────────');

  return {
    delivered: false,
    mode: 'development_fallback',
    message: 'SMTP not configured in environment. Booking confirmation logged to server output.',
  };
}

/**
 * Sends a booking cancellation email
 */
export async function sendBookingCancellationEmail(booking) {
  const ref = booking.booking_ref || booking.bookingRef;
  const email = booking.visitor_email || booking.visitorEmail;
  const facility = booking.facility_name || booking.facilityName || booking.facility_id || booking.facilityId;
  const date = booking.visit_date || booking.visitDate;

  const subject = `Reservation Cancelled [${ref}]`;
  const textContent = `
Your reservation ${ref} for ${date} (${facility}) has been cancelled.
The reserved capacity has been released for other visitors.
`.trim();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: config.email.from,
        to: email,
        subject,
        text: textContent,
      });
      return { delivered: true };
    } catch (err) {
      return { delivered: false, error: err.message };
    }
  }

  console.log('─────────────────────────────────────────────────────────────────');
  console.log('📧 [DEV EMAIL SERVICE] Simulated Cancellation Notice');
  console.log(`To: ${email}`);
  console.log(`Subject: ${subject}`);
  console.log('─────────────────────────────────────────────────────────────────');

  return { delivered: false, mode: 'development_fallback' };
}
