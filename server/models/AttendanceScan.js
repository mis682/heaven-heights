const mongoose = require("mongoose");

const AttendanceScanSchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "MaintenanceStaff", required: true },
    employeeId: { type: String, required: true },
    name: { type: String, required: true },
    siteName: { type: String, required: true },
    type: { type: String, enum: ["in", "out"], required: true },
    timestamp: { type: Date, default: Date.now },
    latitude: Number,
    longitude: Number,
    address: String,
    distanceMeters: Number,
    withinGeofence: { type: Boolean, default: null },
    photo: { type: String, default: "" },
  },
  { timestamps: true }
);

AttendanceScanSchema.index({ staff: 1, timestamp: -1 });

module.exports = mongoose.model("AttendanceScan", AttendanceScanSchema);
