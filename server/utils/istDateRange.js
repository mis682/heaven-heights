const DAY_MS = 24 * 60 * 60 * 1000;

// India has no DST, so a fixed +05:30 offset always gives the correct IST
// wall-clock day boundary regardless of the server's own OS timezone
// (Render's containers run in UTC) — using the server-local Date
// constructor here would silently compute UTC-day boundaries instead,
// misfiling any entry captured between IST midnight and 5:30 AM.
function istDayStart(dateStr) {
  return new Date(`${dateStr}T00:00:00+05:30`);
}

function buildIstDateRangeFilter(dateFrom, dateTo) {
  const range = {};
  if (dateFrom) range.$gte = istDayStart(dateFrom);
  if (dateTo) range.$lt = new Date(istDayStart(dateTo).getTime() + DAY_MS);
  return Object.keys(range).length ? range : null;
}

module.exports = { istDayStart, buildIstDateRangeFilter };
