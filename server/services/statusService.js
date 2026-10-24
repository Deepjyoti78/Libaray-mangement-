/**
 * Allowed status transitions map:
 * key = currentStatus, value = array of allowed next statuses
 */
const VALID_TRANSITIONS = {
  confirmed: ['checked_in', 'cancelled', 'no_show'],
  checked_in: ['completed', 'cancelled'],
  completed: [], // Terminal
  cancelled: [], // Terminal: a cancelled booking cannot be checked in or modified!
  no_show: ['cancelled'], // Can be updated if disputed
};

/**
 * Validates whether a state transition is legal
 */
export function validateStatusTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true;
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new Error(
      `Illegal booking status transition from '${currentStatus}' to '${nextStatus}'.`
    );
  }
  return true;
}

/**
 * Helper to log audit events into the database
 */
export async function logAuditEvent(db, { actorType, actorId, action, entityType, entityId, metadata = {} }) {
  try {
    await db.query(
      `INSERT INTO audit_events (actor_type, actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        actorType || 'system',
        String(actorId || 'unknown'),
        action,
        entityType || 'booking',
        String(entityId || ''),
        JSON.stringify(metadata),
      ]
    );
  } catch (err) {
    console.error('Failed to write audit event:', err.message);
  }
}
