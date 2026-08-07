const Project = require("../models/Project");
const Checkpoint = require("../models/Checkpoint");

exports.list = async (req, res) => {
  const { module: mod } = req.query;
  const filter = {};
  if (mod) filter.module = mod;
  const projects = await Project.find(filter).sort({ name: 1 });
  res.json(projects);
};

exports.getBySlug = async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug });
  if (!project) return res.status(404).json({ message: "Project not found" });
  const checkpoints = await Checkpoint.find({ projectId: project._id }).sort({ order: 1 });
  res.json({ project, checkpoints });
};
