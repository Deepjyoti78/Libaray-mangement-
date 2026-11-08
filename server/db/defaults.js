// Essential booking configuration, independent of demo visitors and inventory.
// New production spaces remain unbookable until staff set their real capacity.
export async function ensureOperationalDefaults(db) {
  await db.query(`INSERT INTO facilities (id, name, description, active) VALUES
    ('reading-room', 'Reading Room', 'Quiet reading and study.', true),
    ('manga-corner', 'Manga Corner', 'Japanese manga collection.', true)
    ON CONFLICT (id) DO NOTHING`);
  await db.query(`INSERT INTO sessions (id, name, start_time, end_time, active) VALUES
    ('morning', 'Morning Session', '11:00', '14:30', true),
    ('afternoon', 'Afternoon Session', '15:00', '18:30', true)
    ON CONFLICT (id) DO NOTHING`);
  await db.query(`INSERT INTO facility_session_capacities (facility_id, session_id, capacity)
    SELECT f.id, s.id, 0 FROM facilities f CROSS JOIN sessions s ON CONFLICT DO NOTHING`);
  const settings = {
    daily_booking_limit: 1, advance_booking_days: 14, cancellation_cutoff_hours: 2,
    opening_days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], require_membership: false,
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.query('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT DO NOTHING', [key, JSON.stringify(value)]);
  }
}
