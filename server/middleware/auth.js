import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { query } from '../db/connection.js';

export async function requireAuth(req, res, next) {
  try {
    let token = null;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.staff_token) {
      token = req.cookies.staff_token;
    }

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required. Please log in as library staff.',
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const staffRes = await query(
      `SELECT id, name, email, role, active FROM staff_users WHERE id = $1 AND active = true;`,
      [decoded.sub]
    );

    if (staffRes.rows.length === 0) {
      return res.status(401).json({ error: 'Staff account inactive or not found.' });
    }

    req.user = staffRes.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || (req.user.role !== role && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
    next();
  };
}
