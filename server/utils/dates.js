// Indian Standard Time (Asia/Kolkata) date utilities

const TIMEZONE = 'Asia/Kolkata';

/**
 * Returns current date/time parts in Asia/Kolkata timezone
 */
export function getNowInKolkata() {
  const now = new Date();
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = dtf.formatToParts(now);
  const find = (type) => parts.find((p) => p.type === type)?.value || '';

  const dateStr = `${find('year')}-${find('month')}-${find('day')}`;
  const timeStr = `${find('hour')}:${find('minute')}`;
  const dayName = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, weekday: 'long' }).format(now);

  return {
    dateStr, // YYYY-MM-DD
    timeStr, // HH:MM
    dayName, // Tuesday, etc.
    raw: now,
  };
}

/**
 * Gets day of week name for a YYYY-MM-DD date string in Asia/Kolkata
 */
export function getDayOfWeek(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Construct date at noon UTC to avoid daylight/local shifts
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, weekday: 'long' }).format(d);
}

/**
 * Checks if target date is in the past compared to current Asia/Kolkata date
 */
export function isDateInPast(dateStr) {
  const current = getNowInKolkata();
  return dateStr < current.dateStr;
}

/**
 * Checks if target date is beyond the maximum advance booking window
 */
export function isDateBeyondAdvanceWindow(dateStr, maxDays) {
  const current = getNowInKolkata();
  const [cy, cm, cd] = current.dateStr.split('-').map(Number);
  const [ty, tm, td] = dateStr.split('-').map(Number);

  const currMs = Date.UTC(cy, cm - 1, cd);
  const targetMs = Date.UTC(ty, tm - 1, td);
  const diffDays = Math.round((targetMs - currMs) / (1000 * 60 * 60 * 24));

  return diffDays > maxDays;
}

/**
 * Checks if a session on today's date has already ended or started
 */
export function hasSessionEndedToday(dateStr, sessionEndTime) {
  const current = getNowInKolkata();
  if (dateStr < current.dateStr) return true;
  if (dateStr > current.dateStr) return false;
  return current.timeStr > sessionEndTime;
}
