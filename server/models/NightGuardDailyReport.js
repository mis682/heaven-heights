const mongoose = require("mongoose");
const { STATUS_OPTIONS } = require("../constants/reportStatus");

const TIME_SLOTS = [
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
  "12:00 AM",
  "1:00 AM",
  "2:00 AM",
  "3:00 AM",
  "4:00 AM",
  "5:00 AM",
  "6:00 AM",
];

const NightGuardReportEntrySchema = new mongoose.Schema(
  {
    site: { type: String, required: true },
    timeSlot: { type: String, enum: TIME_SLOTS, required: true },
    guardName: { type: String, required: true },
    status: { type: String, enum: STATUS_OPTIONS, required: true },
    linkedSubmissionId: { type: mongoose.Schema.Types.ObjectId, ref: "NightGuardSubmission", default: null },
  },
  { _id: true }
);

const NightGuardDailyReportSchema = new mongoose.Schema(
  {
    reportDate: { type: String, required: true },
    entries: [NightGuardReportEntrySchema],
    status: { type: String, enum: ["draft", "submitted"], default: "draft" },
    preparedBy: { type: String, default: "" },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

NightGuardDailyReportSchema.statics.STATUS_OPTIONS = STATUS_OPTIONS;
NightGuardDailyReportSchema.statics.TIME_SLOTS = TIME_SLOTS;

module.exports = mongoose.model("NightGuardDailyReport", NightGuardDailyReportSchema);
