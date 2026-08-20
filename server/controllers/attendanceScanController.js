const ExcelJS = require("exceljs");
const MaintenanceStaff = require("../models/MaintenanceStaff");
const SiteLocation = require("../models/SiteLocation");
const AttendanceScan = require("../models/AttendanceScan");
const { fileToUrl } = require("../middleware/upload");
const { haversineMeters } = require("../utils/geo");
const { buildTeamAttendancePdf } = require("../utils/teamAttendancePdf");
const { istDateKey, istHour, istDayStart } = require("../utils/istDateRange");

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function presentPercent(days) {
  const relevant = days.filter((d) => d.status);
  if (!relevant.length) return 0;
  return Math.round((relevant.filter((d) => d.status === "P").length / relevant.length) * 100);
}

function statusTotals(days) {
  return {
    totalPresent: days.filter((d) => d.status === "P").length,
    totalAbsent: days.filter((d) => d.status === "A").length,
    totalHalfDay: days.filter((d) => d.status === "HD").length,
    totalSinglePunch: days.filter((d) => d.status === "SP").length,
  };
}

// A shift open with an "in" scan is treated as still open (its next scan is
// the matching "out") as long as it's within this many hours — covers night
// shifts that punch in one evening and out the next morning. Past this, an
// old unclosed "in" is treated as abandoned and the next scan starts fresh.
// Non-night staff get a much shorter window: without it, someone who forgets
// to punch out and scans again the next morning has that scan wrongly
// absorbed as the previous day's punch-out (merging two separate days into
// one bogus ~18h+ entry) instead of starting a fresh day.
const NIGHT_SHIFT_RESET_HOURS = 18;
const DEFAULT_SHIFT_RESET_HOURS = 12;
const DAY_MS = 24 * 60 * 60 * 1000;

const toDateKey = istDateKey;

// Noon is the pivot for guessing what a "fresh chain" scan (no open "in" to
// pair with) actually means, per shift:
// - Night shift, before noon: a night runs ~9 PM-6 AM, so a fresh scan this
//   early is never someone starting a new shift — it's a guard who forgot to
//   punch in the previous evening and is only scanning once, at the end of
//   the night. Treated as that night's punch-out (dated to the night it
//   started, i.e. yesterday).
// - Day shift, noon or after: a day shift starts in the morning, so a fresh
//   scan this late is never a genuine start — it's a guard who forgot the
//   morning punch-in and is only scanning once, at the end of the day.
//   Treated as today's punch-out instead of a same-day punch-in (which would
//   otherwise wrongly swallow tomorrow's real punch-in as its matching out).
// Both cases show correctly as Punch Out / Single Punch instead of starting
// a bogus open shift that the next real scan then incorrectly closes.
const CATCHUP_NOON_HOUR = 12;

// Determines whether this scan is a punch-in or punch-out, and which day's
// shift it belongs to. An "out" inherits the "in" scan's shiftDate, so a
// night shift that crosses midnight still counts as one day's attendance —
// the day the guard punched IN, not the day they punched out.
function determineNextPunch(lastRecord, shift) {
  const now = new Date();
  const resetHours = shift === "night" ? NIGHT_SHIFT_RESET_HOURS : DEFAULT_SHIFT_RESET_HOURS;
  const freshChain =
    !lastRecord || lastRecord.type === "out" || (now - new Date(lastRecord.timestamp)) / 3600000 > resetHours;

  if (freshChain) {
    const hour = istHour(now);
    if (shift === "night" && hour < CATCHUP_NOON_HOUR) {
      const yesterday = new Date(now.getTime() - 24 * 3600000);
      return { type: "out", shiftDate: toDateKey(yesterday) };
    }
    if (shift === "day" && hour >= CATCHUP_NOON_HOUR) {
      return { type: "out", shiftDate: toDateKey(now) };
    }
    return { type: "in", shiftDate: toDateKey(now) };
  }
  return { type: "out", shiftDate: lastRecord.shiftDate || toDateKey(lastRecord.timestamp) };
}

// Guards rotate between sites daily, so their assigned "home" site in the
// roster doesn't reflect where they're actually posted on a given day —
// the geofence check is skipped for them, but stays enforced for everyone
// else (housekeeping, gardeners, drivers, etc.) who work a fixed site.
function isSecurityGuard(designation) {
  return (designation || "").toLowerCase().replace(/\s+/g, "") === "securityguard";
}

exports.lookup = async (req, res) => {
  const staff = await MaintenanceStaff.findOne({ employeeId: req.params.employeeId });
  if (!staff) return res.status(404).json({ message: "Yeh QR code kisi bhi staff se match nahi hua" });

  const lastRecord = await AttendanceScan.findOne({ staff: staff._id }).sort({ timestamp: -1 });
  const { type: nextType } = determineNextPunch(lastRecord);

  res.json({
    staff: {
      _id: staff._id,
      employeeId: staff.employeeId,
      name: staff.name,
      designation: staff.designation,
      siteName: staff.siteName,
      photo: staff.photo,
    },
    nextType,
  });
};

exports.scan = async (req, res) => {
  const { employeeId, latitude, longitude, address, shift } = req.body;
  const staff = await MaintenanceStaff.findOne({ employeeId });
  if (!staff) return res.status(404).json({ message: "Yeh QR code kisi bhi staff se match nahi hua" });

  const lastRecord = await AttendanceScan.findOne({ staff: staff._id }).sort({ timestamp: -1 });
  const { type, shiftDate } = determineNextPunch(lastRecord, shift === "day" || shift === "night" ? shift : null);

  let distanceMeters = null;
  let withinGeofence = null;

  if (!isSecurityGuard(staff.designation)) {
    const siteLocation = await SiteLocation.findOne({ siteName: staff.siteName });
    if (siteLocation) {
      const hasCoords = latitude != null && longitude != null && latitude !== "" && longitude !== "";
      if (!hasCoords) {
        // A site with a configured lock must not silently skip the geofence
        // just because the device failed to hand back a location — that would
        // let anyone punch in/out from anywhere by denying location access.
        return res.status(400).json({
          message: "Location capture nahi ho payi — device ki location ON karke dobara try karein.",
        });
      }
      distanceMeters = haversineMeters(Number(latitude), Number(longitude), siteLocation.latitude, siteLocation.longitude);
      withinGeofence = distanceMeters <= siteLocation.radiusMeters;
      if (!withinGeofence) {
        return res.status(400).json({
          message: `Aap site se ${Math.round(distanceMeters)}m door hain — attendance sirf ${siteLocation.radiusMeters}m ke andar capture hoti hai.`,
          distanceMeters,
          withinGeofence,
        });
      }
    }
  }

  const record = await AttendanceScan.create({
    staff: staff._id,
    employeeId: staff.employeeId,
    name: staff.name,
    siteName: staff.siteName,
    type,
    shiftDate,
    shift: shift === "day" || shift === "night" ? shift : null,
    latitude: latitude != null && latitude !== "" ? Number(latitude) : undefined,
    longitude: longitude != null && longitude !== "" ? Number(longitude) : undefined,
    address,
    distanceMeters,
    withinGeofence,
    photo: req.file ? fileToUrl(req.file) : "",
  });

  res.status(201).json({
    type,
    staffName: staff.name,
    timestamp: record.timestamp,
    distanceMeters,
    withinGeofence,
  });
};

exports.records = async (req, res) => {
  const { siteName, search, date } = req.query;
  const filter = {};
  if (siteName) filter.siteName = siteName;
  if (search) {
    const re = new RegExp(search, "i");
    filter.$or = [{ name: re }, { employeeId: re }, { siteName: re }];
  }
  if (date) {
    // The Date column shown to coordinators is each record's shiftDate, not
    // its raw scan time — an overnight shift's punch-out can physically
    // happen a day later than the day it's attributed to. Query a window
    // wide enough to catch that, then filter precisely by the same
    // shiftDate (falling back to the IST calendar day for older records
    // from before shiftDate existed) so the filter matches what's displayed.
    const dayStart = istDayStart(date).getTime();
    filter.timestamp = { $gte: new Date(dayStart - DAY_MS), $lt: new Date(dayStart + 2 * DAY_MS) };
  }
  let records = await AttendanceScan.find(filter).sort({ timestamp: -1 }).limit(date ? 2000 : 500);
  if (date) {
    records = records.filter((r) => (r.shiftDate || istDateKey(r.timestamp)) === date).slice(0, 500);
  }
  res.json(records);
};

// First scan of the day = punch in, last scan = punch out, everything in
// between is ignored. Status is derived from the resulting duration:
// 0 scans -> Absent, 1 scan -> Single Punch, <5h -> Absent,
// 5h-5h30m -> Half Day, >5h30m -> Present.
async function computeMonthSummary({ month, year, search }) {
  const y = Number(year);
  const m = Number(month);
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  const daysInMonth = end.getDate();

  const staffFilter = {};
  if (search) {
    const re = new RegExp(search, "i");
    staffFilter.$or = [{ name: re }, { employeeId: re }, { siteName: re }];
  }
  const staffList = await MaintenanceStaff.find(staffFilter).sort({ employeeId: 1 });

  // Widen the raw query by a day on each side so a night shift that punches
  // in on the last evening of one month and out early the next month (or
  // vice versa) is still fetched — it's then bucketed by shiftDate below,
  // not by the query window.
  const queryStart = new Date(start.getTime() - 24 * 3600000);
  const queryEnd = new Date(end.getTime() + 24 * 3600000);
  const scans = await AttendanceScan.find({ timestamp: { $gte: queryStart, $lte: queryEnd } }).sort({ timestamp: 1 });

  const monthPrefix = `${y}-${String(m).padStart(2, "0")}`;
  const byStaffDay = new Map();
  scans.forEach((s) => {
    const shiftDate = s.shiftDate || toDateKey(s.timestamp);
    if (!shiftDate.startsWith(monthPrefix)) return;
    const day = Number(shiftDate.slice(-2));
    const key = `${s.employeeId}__${day}`;
    if (!byStaffDay.has(key)) byStaffDay.set(key, []);
    byStaffDay.get(key).push(s);
  });

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === y && today.getMonth() + 1 === m;
  const lastRelevantDay = isCurrentMonth ? today.getDate() : daysInMonth;

  const rows = staffList.map((staff) => {
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      if (day > lastRelevantDay) {
        days.push({ day, status: null });
        continue;
      }
      const dayScans = byStaffDay.get(`${staff.employeeId}__${day}`) || [];
      if (dayScans.length === 0) {
        days.push({ day, status: "A", totalHours: 0 });
      } else if (dayScans.length === 1) {
        const t = dayScans[0].timestamp;
        days.push({ day, status: "SP", punchIn: t, punchOut: t, totalHours: 0 });
      } else {
        const punchIn = dayScans[0].timestamp;
        const punchOut = dayScans[dayScans.length - 1].timestamp;
        const hours = (new Date(punchOut) - new Date(punchIn)) / 3600000;
        let status;
        if (hours < 5) status = "A";
        else if (hours <= 5.5) status = "HD";
        else status = "P";
        days.push({ day, status, punchIn, punchOut, totalHours: Math.round(hours * 100) / 100 });
      }
    }
    return {
      employeeId: staff.employeeId,
      name: staff.name,
      siteName: staff.siteName,
      designation: staff.designation,
      companyName: staff.companyName || "",
      photo: staff.photo,
      days,
    };
  });

  return { daysInMonth, rows, month: m, year: y };
}

exports.monthSummary = async (req, res) => {
  const summary = await computeMonthSummary(req.query);
  res.json(summary);
};

exports.exportTeamAttendanceExcel = async (req, res) => {
  const { daysInMonth, rows, month, year } = await computeMonthSummary(req.query);

  const FILL = { P: "FF22C55E", A: "FFEF4444", HD: "FF3B82F6", SP: "FFF59E0B" };

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(`Attendance ${MONTH_NAMES[month - 1]} ${year}`);
  const columns = [
    { header: "Name", key: "name", width: 24 },
    { header: "Company", key: "companyName", width: 30 },
    { header: "Employee ID", key: "employeeId", width: 14 },
    { header: "Site", key: "siteName", width: 22 },
    { header: "Present %", key: "presentPercent", width: 10 },
    { header: "Total Present", key: "totalPresent", width: 12 },
    { header: "Total Absent", key: "totalAbsent", width: 12 },
    { header: "Total Half Day", key: "totalHalfDay", width: 13 },
    { header: "Total Single Punch", key: "totalSinglePunch", width: 15 },
  ];
  const fixedColumnCount = columns.length;
  for (let d = 1; d <= daysInMonth; d += 1) columns.push({ header: String(d), key: `day${d}`, width: 5 });
  sheet.columns = columns;

  rows.forEach((row) => {
    const totals = statusTotals(row.days);
    const rowData = {
      name: row.name,
      companyName: row.companyName,
      employeeId: row.employeeId,
      siteName: row.siteName,
      presentPercent: `${presentPercent(row.days)}%`,
      ...totals,
    };
    row.days.forEach((d) => {
      rowData[`day${d.day}`] = d.status || "";
    });
    const excelRow = sheet.addRow(rowData);
    row.days.forEach((d, idx) => {
      if (!d.status) return;
      const cell = excelRow.getCell(fixedColumnCount + 1 + idx);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: FILL[d.status] } };
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      cell.alignment = { horizontal: "center" };
    });
  });
  sheet.getRow(1).font = { bold: true };

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=team-attendance-${year}-${String(month).padStart(2, "0")}.xlsx`
  );
  await workbook.xlsx.write(res);
  res.end();
};

exports.exportTeamAttendancePdf = async (req, res) => {
  const { daysInMonth, rows, month, year } = await computeMonthSummary(req.query);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=team-attendance-${year}-${String(month).padStart(2, "0")}.pdf`
  );

  const doc = buildTeamAttendancePdf({
    daysInMonth,
    rows: rows.map((r) => ({ ...r, presentPercent: presentPercent(r.days), ...statusTotals(r.days) })),
    monthLabel: `${MONTH_NAMES[month - 1]} ${year}`,
  });
  doc.pipe(res);
  doc.end();
};

exports.remove = async (req, res) => {
  const record = await AttendanceScan.findByIdAndDelete(req.params.id);
  if (!record) return res.status(404).json({ message: "Record not found" });
  res.json({ message: "Attendance record deleted" });
};
