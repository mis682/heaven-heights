const PatrolSubmission = require("../models/PatrolSubmission");

// A generic patrol site has no externally fixed per-checkpoint schedule the
// way Garden City does, and (unlike Garden City) the coordinator's manually
// picked time-slot label on a daily-report entry turns out not to reliably
// reflect when a guard's round actually happened either — so neither is a
// trustworthy "expected time" to diff against.
//
// Instead, a round is defined purely from the guard's own actual photos:
// it starts the moment they capture checkpoint 1, and every other
// checkpoint is expected to follow within this many minutes of that.
const ROUND_WINDOW_MINUTES = 60;

// Computes Guard KPI for a project directly from PatrolSubmission photos —
// no daily-report data involved. For each guard, every checkpoint-1 capture
// within [from, to] starts a round; the round's window runs until the next
// round starts (so a very late checkpoint is still attributed to the round
// it belongs to, not miscounted into the next one) or a 24h cap for the
// last round. Every checkpoint captured within ROUND_WINDOW_MINUTES of the
// round's start is on time; captured later (but still within the round's
// window) is late; never captured within the round's window is no_photo —
// each checkpoint counts independently, so a handful of late/missed
// checkpoints only dent that round's contribution, not the whole thing.
async function computeGenericGuardKpi({ projectId, from, to, checkpointCount }) {
  const rangeStart = new Date(`${from}T00:00:00+05:30`);
  const rangeEnd = new Date(`${to}T23:59:59.999+05:30`);
  // A trailing buffer so the last in-range round has a real "next round"
  // (or at least more data) to bound its window against, instead of always
  // falling back to the 24h cap.
  const fetchEnd = new Date(rangeEnd.getTime() + 6 * 60 * 60 * 1000);

  const docs = await PatrolSubmission.find({
    projectId,
    "photos.capturedAt": { $gte: rangeStart, $lt: fetchEnd },
  }).select("guardName photos");

  const byGuard = new Map();
  docs.forEach((doc) => {
    doc.photos.forEach((p) => {
      if (p.capturedAt < rangeStart || p.capturedAt >= fetchEnd) return;
      if (!byGuard.has(doc.guardName)) byGuard.set(doc.guardName, []);
      byGuard.get(doc.guardName).push({ checkpointId: p.checkpointId, capturedAt: p.capturedAt });
    });
  });

  const rows = [];

  byGuard.forEach((photos, guardName) => {
    photos.sort((a, b) => a.capturedAt - b.capturedAt);

    const allRoundStarts = photos.filter((p) => p.checkpointId === 1).map((p) => p.capturedAt);
    // A round whose checkpoint 1 only exists to bound the previous round's
    // window (i.e. it fell in the trailing buffer, after `to`) isn't itself
    // reported on.
    const countedRoundStarts = allRoundStarts.filter((t) => t >= rangeStart && t <= rangeEnd);
    if (countedRoundStarts.length === 0) return;

    const byCheckpoint = new Map();
    photos.forEach((p) => {
      if (!byCheckpoint.has(p.checkpointId)) byCheckpoint.set(p.checkpointId, []);
      byCheckpoint.get(p.checkpointId).push(p.capturedAt);
    });

    let total = 0;
    let onTime = 0;
    let late = 0;
    let noPhoto = 0;
    const lateDetails = [];

    countedRoundStarts.forEach((start) => {
      const startIdx = allRoundStarts.indexOf(start);
      const windowEnd = allRoundStarts[startIdx + 1] || new Date(start.getTime() + 24 * 60 * 60 * 1000);
      const onTimeCutoff = new Date(start.getTime() + ROUND_WINDOW_MINUTES * 60 * 1000);

      for (let cp = 1; cp <= checkpointCount; cp += 1) {
        total += 1;
        const captures = byCheckpoint.get(cp) || [];
        const match = captures.find((t) => t >= start && t < windowEnd);

        if (!match) {
          noPhoto += 1;
          lateDetails.push({ roundStart: start, checkpointId: cp, lateByMinutes: null });
        } else if (match > onTimeCutoff) {
          late += 1;
          lateDetails.push({ roundStart: start, checkpointId: cp, lateByMinutes: Math.round((match - onTimeCutoff) / 60000) });
        } else {
          onTime += 1;
        }
      }
    });

    rows.push({
      guardName,
      total,
      onTime,
      late,
      noPhoto,
      onTimePercent: total > 0 ? Math.round((onTime / total) * 100) : 0,
      lateDetails,
    });
  });

  rows.sort((a, b) => a.guardName.localeCompare(b.guardName));
  return rows;
}

module.exports = { computeGenericGuardKpi, ROUND_WINDOW_MINUTES };
