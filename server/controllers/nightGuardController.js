const ExcelJS = require("exceljs");
const NightGuardSubmission = require("../models/NightGuardSubmission");
const NightGuardDailyReport = require("../models/NightGuardDailyReport");
const { fileToUrl } = require("../middleware/upload");
const { notifyWebhook } = require("../utils/webhook");

exports.meta = async (req, res) => {
  res.json({
    statusOptions: NightGuardDailyReport.STATUS_OPTIONS,
    timeSlots: NightGuardDailyReport.TIME_SLOTS,
    sites: ["One Business Center", "Hyde Park", "Milestone", "GST", "Garden City", "Regal Garden", "Nature Park"],
  });
};

// --- Guard proof-of-presence submissions ---

exports.createSubmission = async (req, res) => {
  const { guardName, projectName, capturedAt, geoLocation } = req.body;
  if (!guardName || !projectName || !req.file) {
    return res.status(400).json({ message: "guardName, projectName and guardPhoto are required" });
  }

  let geo = {};
  try {
    geo = geoLocation ? JSON.parse(geoLocation) : {};
  } catch {
    geo = {};
  }

  const submission = await NightGuardSubmission.create({
    guardName,
    projectName,
    guardPhotoUrl: fileToUrl(req.file),
    capturedAt: capturedAt ? new Date(capturedAt) : new Date(),
    geoLocation: geo,
  });

  const blocks = [
    { type: "section", text: { type: "mrkdwn", text: `🌙 *${guardName}* checked in for Night Guard at *${projectName}*` } },
    {
      type: "image",
      image_url: submission.guardPhotoUrl,
      alt_text: "Proof of presence",
      title: { type: "plain_text", text: "Proof of presence" },
    },
  ];

  notifyWebhook({
    type: "night_guard",
    guardName,
    projectName,
    guardPhotoUrl: submission.guardPhotoUrl,
    capturedAt: submission.capturedAt,
    message: `🌙 *${guardName}* checked in for Night Guard at *${projectName}*\n\n${submission.guardPhotoUrl}`,
    blocks,
    blocksJson: JSON.stringify(blocks),
  });

  res.status(201).json(submission);
};

exports.listSubmissions = async (req, res) => {
  const { site, date, hour } = req.query;
  const filter = {};
  if (site) filter.projectName = site;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    filter.capturedAt = { $gte: start, $lt: end };
  }
  let submissions = await NightGuardSubmission.find(filter).sort({ capturedAt: -1 });
  if (hour) {
    submissions = submissions.filter((s) => formatHour(s.capturedAt) === hour);
  }
  res.json(submissions);
};

function formatHour(date) {
  const d = new Date(date);
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:00 ${ampm}`;
}

// --- Coordinator daily report builder ---

exports.getReportByDate = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: "date query param is required" });
  const report = await NightGuardDailyReport.findOne({ reportDate: date });
  res.json(report || null);
};

exports.saveDraft = async (req, res) => {
  const { reportDate, entries, preparedBy } = req.body;
  if (!reportDate) return res.status(400).json({ message: "reportDate is required" });

  const report = await NightGuardDailyReport.findOneAndUpdate(
    { reportDate, status: "draft" },
    { reportDate, entries: entries || [], preparedBy: preparedBy || "" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json(report);
};

exports.submitReport = async (req, res) => {
  const report = await NightGuardDailyReport.findById(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });
  if (report.status === "submitted") {
    return res.status(400).json({ message: "Report already submitted" });
  }
  if (report.entries.length === 0) {
    return res.status(400).json({ message: "Cannot submit a report with no entries" });
  }
  report.status = "submitted";
  report.submittedAt = new Date();
  await report.save();
  res.json(report);
};

exports.unlockReport = async (req, res) => {
  const report = await NightGuardDailyReport.findById(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });
  report.status = "draft";
  report.submittedAt = null;
  await report.save();
  res.json(report);
};

exports.getReport = async (req, res) => {
  const report = await NightGuardDailyReport.findById(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });
  res.json(report);
};

// --- Admin dashboard ---

exports.listSubmittedReports = async (req, res) => {
  const { dateFrom, dateTo, site } = req.query;
  const filter = { status: "submitted" };
  if (dateFrom || dateTo) {
    filter.reportDate = {};
    if (dateFrom) filter.reportDate.$gte = dateFrom;
    if (dateTo) filter.reportDate.$lte = dateTo;
  }
  if (site) filter["entries.site"] = site;

  const reports = await NightGuardDailyReport.find(filter).sort({ reportDate: -1 });

  const summarized = reports.map((r) => {
    const sites = [...new Set(r.entries.map((e) => e.site))];
    const present = r.entries.filter((e) => e.status === "Present").length;
    const absent = r.entries.filter((e) => e.status === "Absent").length;
    return {
      _id: r._id,
      reportDate: r.reportDate,
      preparedBy: r.preparedBy,
      sites,
      present,
      absent,
      submittedAt: r.submittedAt,
    };
  });

  res.json(summarized);
};

exports.exportReport = async (req, res) => {
  const report = await NightGuardDailyReport.findById(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });

  const [y, m, d] = report.reportDate.split("-").map(Number);
  const dateHeader = `${m}/${d}/${y}`;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(`NightGuard_${report.reportDate}`);
  sheet.columns = [
    { header: "Site", key: "site", width: 22 },
    { header: "Time", key: "timeSlot", width: 12 },
    { header: dateHeader, key: "status", width: 18 },
    { header: "Guard Name", key: "guardName", width: 24 },
  ];
  report.entries.forEach((e) => {
    sheet.addRow({ site: e.site, timeSlot: e.timeSlot, status: e.status, guardName: e.guardName });
  });

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.getCell(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBFBFBF" } };
  headerRow.getCell(4).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF00" } };

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=night-guard-report-${report.reportDate}.xlsx`);
  await workbook.xlsx.write(res);
  res.end();
};
