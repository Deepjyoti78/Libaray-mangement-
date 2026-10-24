// Lightweight in-memory rate limiter

const requestRecords = new Map();

/**
 * Creates rate limiter middleware
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxRequests - Max allowed requests per IP within the window
 * @param {string} message - Custom error message
 */
export function rateLimit({ windowMs = 60000, maxRequests = 10, message = 'Too many requests. Please try again later.' } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const record = requestRecords.get(ip) || [];
    // Filter timestamps within window
    const recent = record.filter((t) => now - t < windowMs);

    if (recent.length >= maxRequests) {
      return res.status(429).json({
        error: message,
        retryAfterMs: windowMs - (now - recent[0]),
      });
    }

    recent.push(now);
    requestRecords.set(ip, recent);

    // Periodic cleanup
    if (Math.random() < 0.05) {
      for (const [key, timestamps] of requestRecords.entries()) {
        const active = timestamps.filter((t) => now - t < windowMs);
        if (active.length === 0) requestRecords.delete(key);
        else requestRecords.set(key, active);
      }
    }

    next();
  };
}
