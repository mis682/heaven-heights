const mongoose = require("mongoose");

const SiteLocationSchema = new mongoose.Schema(
  {
    siteName: { type: String, required: true, unique: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    radiusMeters: { type: Number, default: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteLocation", SiteLocationSchema);
