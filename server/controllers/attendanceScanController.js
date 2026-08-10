const ExcelJS = require("exceljs");
const MaintenanceStaff = require("../models/MaintenanceStaff");
const SiteLocation = require("../models/SiteLocation");
const AttendanceScan = require("../models/AttendanceScan");
const { fileToUrl } = require("../middleware/upload");
const { haversineMeters } = require("../utils/geo");
const { buildTeamAttendancePdf } = require("../utils/teamAttendancePdf");

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function presentPercent(days) {
  const relevant = days.filter((d) => d.status);
  if (!relevant.length) return 0;
  return Math.round((relevant.filter((d) => d.status === "P").length / relevant.length) * 100);
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

exports.lookup = async (req, res) => {
  const staff = await MaintenanceStaff.findOne({ employeeId: req.params.employeeId });
  if (!staff) return res.status(404).json({ message: "Yeh QR code kisi bhi staff se match nahi hua" });

  const lastRecord = await AttendanceScan.findOne({ staff: staff._id, timestamp: { $gte: startOfToday() } }).sort({
    timestamp: -1,
  });
  const nextType = !lastRecord || lastRecord.type === "out" ? "in" : "out";

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
  const { employeeId, latitude, longitude, address } = req.body;
  const staff = await MaintenanceStaff.findOne({ employeeId });
  if (!staff) return res.status(404).json({ message: "Yeh QR code kisi bhi staff se match nahi hua" });

  const lastRecord = await AttendanceScan.findOne({ staff: staff._id, timestamp: { $gte: startOfToday() } }).sort({
    timestamp: -1,
  });
  const type = !lastRecord || lastRecord.type === "out" ? "in" : "out";

  const siteLocation = await SiteLocation.findOne({ siteName: staff.siteName });
  let distanceMeters = null;
  let withinGeofence = null;

  if (siteLocation && latitude != null && longitude != null && latitude !== "" && longitude !== "") {
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

  const record = await AttendanceScan.create({
    staff: staff._id,
    employeeId: staff.employeeId,
    name: staff.name,
    siteName: staff.siteName,
    type,
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
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.timestamp = { $gte: start, $lte: end };
  }
  const records = await AttendanceScan.find(filter).sort({ timestamp: -1 }).limit(500);
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

  const scans = await AttendanceScan.find({ timestamp: { $gte: start, $lte: end } }).sort({ timestamp: 1 });

  const byStaffDay = new Map();
  scans.forEach((s) => {
    const day = new Date(s.timestamp).getDate();
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
    { header: "Employee ID", key: "employeeId", width: 14 },
    { header: "Site", key: "siteName", width: 22 },
    { header: "Present %", key: "presentPercent", width: 10 },
  ];
  for (let d = 1; d <= daysInMonth; d += 1) columns.push({ header: String(d), key: `day${d}`, width: 5 });
  sheet.columns = columns;

  rows.forEach((row) => {
    const rowData = {
      name: row.name,
      employeeId: row.employeeId,
      siteName: row.siteName,
      presentPercent: `${presentPercent(row.days)}%`,
    };
    row.days.forEach((d) => {
      rowData[`day${d.day}`] = d.status || "";
    });
    const excelRow = sheet.addRow(rowData);
    row.days.forEach((d, idx) => {
      if (!d.status) return;
      const cell = excelRow.getCell(5 + idx);
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
    rows: rows.map((r) => ({ ...r, presentPercent: presentPercent(r.days) })),
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
