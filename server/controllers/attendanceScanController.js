const MaintenanceStaff = require("../models/MaintenanceStaff");
const SiteLocation = require("../models/SiteLocation");
const AttendanceScan = require("../models/AttendanceScan");
const { fileToUrl } = require("../middleware/upload");
const { haversineMeters } = require("../utils/geo");

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

exports.remove = async (req, res) => {
  const record = await AttendanceScan.findByIdAndDelete(req.params.id);
  if (!record) return res.status(404).json({ message: "Record not found" });
  res.json({ message: "Attendance record deleted" });
};
