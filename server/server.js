require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees");
const guardRoutes = require("./routes/guards");
const projectRoutes = require("./routes/projects");
const housekeepingRoutes = require("./routes/housekeeping");
const patrolRoutes = require("./routes/patrol");
const patrolReportRoutes = require("./routes/patrolReports");
const nightguardRoutes = require("./routes/nightguard");
const attendanceRoutes = require("./routes/attendance");
const maintenanceStaffRoutes = require("./routes/maintenanceStaff");
const siteLocationRoutes = require("./routes/siteLocations");
const attendanceScanRoutes = require("./routes/attendanceScan");
const fireMockDrillRoutes = require("./routes/fireMockDrill");
const gardenCityPatrolReportRoutes = require("./routes/gardenCityPatrolReport");
const mediaRoutes = require("./routes/media");
const { checkCloudinaryUsageAndAlert } = require("./utils/cloudinaryUsageAlert");
const { archiveOldMedia } = require("./utils/archiveOldMedia");
const { runDailyBackup } = require("./utils/dailyBackup");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/guards", guardRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/housekeeping", housekeepingRoutes);
app.use("/api/patrol", patrolRoutes);
app.use("/api/patrol-reports", patrolReportRoutes);
app.use("/api/nightguard", nightguardRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/maintenance-staff", maintenanceStaffRoutes);
app.use("/api/site-locations", siteLocationRoutes);
app.use("/api/attendance-scan", attendanceScanRoutes);
app.use("/api/fire-mock-drill", fireMockDrillRoutes);
app.use("/api/garden-city-patrol-report", gardenCityPatrolReportRoutes);
app.use("/api/media", mediaRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const clientDist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(clientDist, "index.html")));
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

const CLOUDINARY_CHECK_INTERVAL_MS = 12 * 60 * 60 * 1000;
const ARCHIVE_INTERVAL_MS = 24 * 60 * 60 * 1000;
const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
    checkCloudinaryUsageAndAlert().catch((err) => console.error("[cloudinary-usage-alert] failed", err));
    setInterval(() => {
      checkCloudinaryUsageAndAlert().catch((err) => console.error("[cloudinary-usage-alert] failed", err));
    }, CLOUDINARY_CHECK_INTERVAL_MS);

    archiveOldMedia().catch((err) => console.error("[archive] failed", err));
    setInterval(() => {
      archiveOldMedia().catch((err) => console.error("[archive] failed", err));
    }, ARCHIVE_INTERVAL_MS);

    runDailyBackup().catch((err) => console.error("[daily-backup] failed", err));
    setInterval(() => {
      runDailyBackup().catch((err) => console.error("[daily-backup] failed", err));
    }, BACKUP_INTERVAL_MS);
  })
  .catch((err) => {
    console.error("[server] failed to connect to MongoDB", err);
    process.exit(1);
  });
