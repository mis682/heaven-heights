const mongoose = require("mongoose");

const HousekeepingTaskSchema = new mongoose.Schema(
  {
    areaName: { type: String, required: true, trim: true },
    taskType: {
      type: String,
      enum: ["Sweeping", "Mopping", "Deep Clean", "Dusting", "Window Cleaning", "Waste Disposal"],
      required: true,
    },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    block: { type: String, required: true, trim: true },
    floor: { type: String, trim: true, default: "" },
    frequency: { type: String, enum: ["Daily", "Weekly"], default: "Daily" },
    scheduledDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Scheduled", "Pending", "Completed", "Skipped", "Overdue"],
      default: "Scheduled",
    },
    completionPhotoUrl: { type: String, default: "" },
    verifiedBy: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HousekeepingTask", HousekeepingTaskSchema);
