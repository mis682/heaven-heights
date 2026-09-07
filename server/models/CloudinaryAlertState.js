const mongoose = require("mongoose");

// A single document tracks the highest usage threshold we've already
// emailed about, so the periodic check doesn't resend the same warning
// every cycle — only when usage climbs past a new threshold (or drops back
// down, e.g. after Cloudinary's monthly bandwidth/transformation reset, at
// which point thresholds re-arm).
const CloudinaryAlertStateSchema = new mongoose.Schema(
  {
    lastAlertedThreshold: { type: Number, default: 0 },
    lastAlertedAt: { type: Date, default: null },
    lastUsedPercent: { type: Number, default: 0 },
    // Once the primary account's usage crosses FALLBACK_THRESHOLD, new
    // uploads across the app switch to the Housekeeping account (which has
    // its own separate, mostly-unused quota) instead of failing outright.
    // Flips back once usage drops again (e.g. the monthly reset).
    useFallbackAccount: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CloudinaryAlertState", CloudinaryAlertStateSchema);
