import { z } from 'zod';

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues || result.error.errors || [];
      const formatted = issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details: formatted,
      });
    }
    req.body = result.data;
    next();
  };
}

export const createBookingSchema = z.object({
  facilityId: z.string().min(1, 'Please select a facility.'),
  sessionId: z.string().min(1, 'Please select a session.'),
  visitDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Visit date must be in YYYY-MM-DD format.'),
  visitorName: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name cannot exceed 100 characters.'),
  visitorEmail: z
    .string()
    .email('Please enter a valid email address.')
    .max(150, 'Email cannot exceed 150 characters.'),
  membershipNo: z.string().max(50).optional().nullable(),
  agreeRules: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the library visit rules to proceed.',
  }),
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(250).optional().nullable(),
});

export const staffLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export const checkinSchema = z.object({
  payload: z.union([z.string(), z.record(z.string(), z.any())]),
});
