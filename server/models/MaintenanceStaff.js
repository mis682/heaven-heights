const mongoose = require("mongoose");

const MaintenanceStaffSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true },
    siteName: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    photo: { type: String, default: "" },
  },
  { timestamps: true }
);

MaintenanceStaffSchema.index({ siteName: 1, designation: 1 });

module.exports = mongoose.model("MaintenanceStaff", MaintenanceStaffSchema);
