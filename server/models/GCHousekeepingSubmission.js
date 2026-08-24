const mongoose = require("mongoose");

const GCHousekeepingSubmissionSchema = new mongoose.Schema(
  {
    formNumber: { type: Number, required: true, enum: [1, 2, 3, 4] },
    submittedBy: { type: String, required: true, trim: true },
    submittedAt: { type: Date, default: Date.now },
    photos: [
      {
        checkpointId: { type: Number, required: true },
        photoUrl: { type: String, required: true },
        capturedAt: Date,
        geoLocation: {
          lat: Number,
          lng: Number,
          address: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("GCHousekeepingSubmission", GCHousekeepingSubmissionSchema);
