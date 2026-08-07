const HousekeepingTask = require("../models/HousekeepingTask");
const { fileToUrl } = require("../middleware/upload");

exports.list = async (req, res) => {
  const { block, staff, status, date } = req.query;
  const filter = {};
  if (block) filter.block = block;
  if (staff) filter.assignedStaff = staff;
  if (status) filter.status = status;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    filter.scheduledDate = { $gte: start, $lt: end };
  }
  const tasks = await HousekeepingTask.find(filter)
    .populate("assignedStaff", "name employeeId department")
    .sort({ createdAt: -1 });
  res.json(tasks);
};

exports.stats = async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const [all, today, scheduled, pending, completed, skipped] = await Promise.all([
    HousekeepingTask.countDocuments({}),
    HousekeepingTask.countDocuments({ scheduledDate: { $gte: startOfToday, $lt: endOfToday } }),
    HousekeepingTask.countDocuments({ status: "Scheduled" }),
    HousekeepingTask.countDocuments({ status: { $in: ["Pending", "Overdue"] } }),
    HousekeepingTask.countDocuments({ status: "Completed" }),
    HousekeepingTask.countDocuments({ status: "Skipped" }),
  ]);

  res.json({ all, today, scheduled, pending, completed, skipped });
};

exports.create = async (req, res) => {
  const task = await HousekeepingTask.create(req.body);
  res.status(201).json(task);
};

exports.update = async (req, res) => {
  const body = { ...req.body };
  if (req.file) {
    body.completionPhotoUrl = fileToUrl(req.file);
  }
  const task = await HousekeepingTask.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
};

exports.remove = async (req, res) => {
  const task = await HousekeepingTask.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json({ message: "Task deleted" });
};
