const ExcelJS = require("exceljs");
const PatrolDailyReport = require("../models/PatrolDailyReport");
const PatrolSubmission = require("../models/PatrolSubmission");
const Project = require("../models/Project");
const { buildCheckpointReportPdf } = require("../utils/checkpointReportPdf");

exports.meta = async (req, res) => {
  res.json({
    statusOptions: PatrolDailyReport.STATUS_OPTIONS,
    timeSlots: PatrolDailyReport.TIME_SLOTS,
  });
};

// Checkpoint photos a guard captured during a given hour, to cross-check before marking status
exports.getCheckpointProof = async (req, res) => {
  const { projectId, guardName, date, slotIndex } = req.query;
  if (!projectId || !guardName || !date || slotIndex === undefined) {
    return res.status(400).json({ message: "projectId, guardName, date and slotIndex are required" });
  }

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const submissions = await PatrolSubmission.find({ projectId, guardName, submittedAt: { $gte: start, $lt: end } });
  const hour = Number(slotIndex);
  const photos = submissions.flatMap((s) => s.photos).filter((p) => new Date(p.capturedAt).getHours() === hour);

  res.json(photos);
};

exports.getReportByDate = async (req, res) => {
  const { projectId, date } = req.query;
  if (!projectId || !date) return res.status(400).json({ message: "projectId and date are required" });
  const report = await PatrolDailyReport.findOne({ projectId, reportDate: date });
  res.json(report || null);
};

exports.saveDraft = async (req, res) => {
  const { projectId, projectName, reportDate, entries, preparedBy } = req.body;
  if (!projectId || !projectName || !reportDate) {
    return res.status(400).json({ message: "projectId, projectName and reportDate are required" });
  }

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const report = await PatrolDailyReport.findOneAndUpdate(
    { projectId, reportDate, status: "draft" },
    {
      projectId,
      projectName,
      reportDate,
      checkpointCount: project.checkpointCount,
      entries: entries || [],
      preparedBy: preparedBy || "",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json(report);
};

exports.submitReport = async (req, res) => {
  const report = await PatrolDailyReport.findById(req.params.id);
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
  const report = await PatrolDailyReport.findById(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });
  report.status = "draft";
  report.submittedAt = null;
  await report.save();
  res.json(report);
};

exports.getReport = async (req, res) => {
  const report = await PatrolDailyReport.findById(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });
  res.json(report);
};

exports.listSubmittedReports = async (req, res) => {
  const { dateFrom, dateTo, projectId } = req.query;
  const filter = { status: "submitted" };
  if (projectId) filter.projectId = projectId;
  if (dateFrom || dateTo) {
    filter.reportDate = {};
    if (dateFrom) filter.reportDate.$gte = dateFrom;
    if (dateTo) filter.reportDate.$lte = dateTo;
  }

  const reports = await PatrolDailyReport.find(filter).sort({ reportDate: -1 });

  const summarized = reports.map((r) => {
    const guards = [...new Set(r.entries.map((e) => e.guardName))];
    const allStatuses = r.entries.flatMap((e) => e.checkpointStatuses);
    const present = allStatuses.filter((s) => s === "Present").length;
    const absent = allStatuses.filter((s) => s === "Absent").length;
    return {
      _id: r._id,
      reportDate: r.reportDate,
      projectName: r.projectName,
      preparedBy: r.preparedBy,
      guards,
      present,
      absent,
      submittedAt: r.submittedAt,
    };
  });

  res.json(summarized);
};

exports.exportReport = async (req, res) => {
  const report = await PatrolDailyReport.findById(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(`Patrol_${report.reportDate}`);
  const checkpointRange = report.checkpointCount > 0 ? `C1 TO C${report.checkpointCount}` : "";
  const columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Guard Name", key: "guardName", width: 24 },
    { header: "Time", key: "timeSlot", width: 22 },
    { header: "Checkpoint", key: "checkpointRange", width: 14 },
  ];
  for (let i = 1; i <= report.checkpointCount; i += 1) {
    columns.push({ header: `Checkpoint-${i}`, key: `cp${i}`, width: 16 });
  }
  sheet.columns = columns;

  report.entries.forEach((e) => {
    const row = { date: report.reportDate, guardName: e.guardName, timeSlot: e.timeSlot, checkpointRange };
    e.checkpointStatuses.forEach((status, idx) => {
      row[`cp${idx + 1}`] = status;
    });
    sheet.addRow(row);
  });
  sheet.getRow(1).font = { bold: true };

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=patrol-report-${report.projectName}-${report.reportDate}.xlsx`);
  await workbook.xlsx.write(res);
  res.end();
};

exports.exportReportPdf = async (req, res) => {
  const report = await PatrolDailyReport.findById(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=patrol-report-${report.projectName}-${report.reportDate}.pdf`);

  const doc = buildCheckpointReportPdf(report);
  doc.pipe(res);
  doc.end();
};
