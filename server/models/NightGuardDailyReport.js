const mongoose = require("mongoose");
const { STATUS_OPTIONS } = require("../constants/reportStatus");

// A row now covers the whole overnight shift as one entry (Project, Date,
// Status, Guard Name) instead of one row per hour — Time is a fixed label,
// not a coordinator-selected value.
const TIME_SLOTS = ["9:00 PM to 6:00 AM"];

const NightGuardReportEntrySchema = new mongoose.Schema(
  {
    // Each entry picks its own date (a report is an open-ended log of rounds,
    // not scoped to a single day) — this was previously a report-level field.
    date: { type: String, required: true },
    site: { type: String, required: true },
    // No longer constrained to an enum: older submitted reports have
    // per-hour values (e.g. "9:00 PM") that must stay valid on re-save
    // (e.g. after an admin unlock) even though new rows only ever use
    // the single TIME_SLOTS value.
    timeSlot: { type: String, required: true },
    guardName: { type: String, required: true },
    status: { type: String, enum: STATUS_OPTIONS, required: true },
    linkedSubmissionId: { type: mongoose.Schema.Types.ObjectId, ref: "NightGuardSubmission", default: null },
  },
  { _id: true }
);

const NightGuardDailyReportSchema = new mongoose.Schema(
  {
    // Deprecated — older submitted reports (before per-entry dates) still
    // carry this; new reports leave it unset and use entries[].date instead.
    reportDate: { type: String },
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
