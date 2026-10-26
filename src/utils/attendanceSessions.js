// Walks a staff/day's scans in chronological order and pairs each "in" with
// the "out" immediately after it into its own session — so a guard who
// worked, say, a Day shift and then a Night shift on the same calendar day
// gets two separate sessions instead of one bogus ~23h block spanning both.
// An "in" with nothing after it (still open) or a leading/lone "out" (no
// preceding "in" in this group) becomes a session with just that one side.
export function pairSessions(sorted) {
  const sessions = [];
  let i = 0;
  while (i < sorted.length) {
    const cur = sorted[i];
    if (cur.type === "in" && sorted[i + 1]?.type === "out") {
      sessions.push({ in: cur, out: sorted[i + 1] });
      i += 2;
    } else {
      sessions.push(cur.type === "out" ? { in: null, out: cur } : { in: cur, out: null });
      i += 1;
    }
  }
  return sessions;
}

export function formatTotalHours(inRecord, outRecord) {
  if (!inRecord || !outRecord) return "—";
  const ms = new Date(outRecord.timestamp) - new Date(inRecord.timestamp);
  if (ms <= 0) return "—";
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}
