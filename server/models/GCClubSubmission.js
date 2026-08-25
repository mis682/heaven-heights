const mongoose = require("mongoose");

const GCClubSubmissionSchema = new mongoose.Schema(
  {
    formNumber: { type: Number, required: true },
    submittedBy: { type: String, required: true, trim: true },
    submittedAt: { type: Date, default: Date.now },
    photos: [
      {
        checkpointLabel: { type: String, required: true },
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

module.exports = mongoose.model("GCClubSubmission", GCClubSubmissionSchema);
