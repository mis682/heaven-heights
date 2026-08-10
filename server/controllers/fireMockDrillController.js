const FireMockDrill = require("../models/FireMockDrill");
const { fileToUrl } = require("../middleware/upload");

const PROJECTS = ["Regal Garden", "Neo Meridian", "Milestone", "OBC", "Eden Garden"];

exports.meta = async (req, res) => {
  res.json({ projects: PROJECTS });
};

exports.create = async (req, res) => {
  const { projectName, date } = req.body;
  if (!projectName || !date) {
    return res.status(400).json({ message: "Project and date are required" });
  }

  const panelPhoto = req.files?.panelPhoto?.[0] ? fileToUrl(req.files.panelPhoto[0]) : "";
  const videos = (req.files?.videos || []).map(fileToUrl);
  const reportAttachment = req.files?.reportAttachment?.[0] ? fileToUrl(req.files.reportAttachment[0]) : "";

  const drill = await FireMockDrill.create({ projectName, date, panelPhoto, videos, reportAttachment });
  res.status(201).json(drill);
};

exports.list = async (req, res) => {
  const { projectName, search } = req.query;
  const filter = {};
  if (projectName) filter.projectName = projectName;
  if (search) {
    const re = new RegExp(search, "i");
    filter.$or = [{ projectName: re }, { date: re }];
  }
  const drills = await FireMockDrill.find(filter).sort({ date: -1, createdAt: -1 });
  res.json(drills);
};

exports.getOne = async (req, res) => {
  const drill = await FireMockDrill.findById(req.params.id);
  if (!drill) return res.status(404).json({ message: "Not found" });
  res.json(drill);
};

exports.update = async (req, res) => {
  const existing = await FireMockDrill.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Not found" });

  const body = {};
  if (req.body.projectName) body.projectName = req.body.projectName;
  if (req.body.date) body.date = req.body.date;
  if (req.files?.panelPhoto?.[0]) body.panelPhoto = fileToUrl(req.files.panelPhoto[0]);
  if (req.files?.reportAttachment?.[0]) body.reportAttachment = fileToUrl(req.files.reportAttachment[0]);

  // Videos to keep are sent explicitly (JSON array of existing URLs) so the
  // admin can remove individual clips; newly uploaded videos are appended.
  let keepVideos = existing.videos;
  if (req.body.keepVideos !== undefined) {
    try {
      keepVideos = JSON.parse(req.body.keepVideos);
    } catch {
      keepVideos = existing.videos;
    }
  }
  const newVideos = (req.files?.videos || []).map(fileToUrl);
  body.videos = [...keepVideos, ...newVideos].slice(0, 8);

  const drill = await FireMockDrill.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  res.json(drill);
};

exports.remove = async (req, res) => {
  const drill = await FireMockDrill.findByIdAndDelete(req.params.id);
  if (!drill) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};
