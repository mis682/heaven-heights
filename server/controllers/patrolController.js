const PatrolSubmission = require("../models/PatrolSubmission");
const Project = require("../models/Project");
const Checkpoint = require("../models/Checkpoint");
const { fileToUrl } = require("../middleware/upload");
const { notifyWebhook } = require("../utils/webhook");

exports.createSubmission = async (req, res) => {
  const { guardName, projectId, projectName } = req.body;
  if (!guardName || !projectId || !projectName) {
    return res.status(400).json({ message: "guardName, projectId and projectName are required" });
  }

  let meta = [];
  try {
    meta = req.body.meta ? JSON.parse(req.body.meta) : [];
  } catch {
    return res.status(400).json({ message: "Invalid meta payload" });
  }

  const files = req.files || [];
  const photos = files.map((file, idx) => {
    const info = meta[idx] || {};
    return {
      checkpointId: info.checkpointId,
      photoUrl: fileToUrl(file),
      capturedAt: info.capturedAt ? new Date(info.capturedAt) : new Date(),
      geoLocation: info.geoLocation || {},
    };
  });

  const submission = await PatrolSubmission.create({
    guardName,
    projectId,
    projectName,
    photos,
  });

  const checkpointDocs = await Checkpoint.find({ projectId, checkpointId: { $in: photos.map((p) => p.checkpointId) } });
  const checkpointNameById = new Map(checkpointDocs.map((c) => [c.checkpointId, c.name]));
  const checkpoints = photos.map((p) => ({
    name: checkpointNameById.get(p.checkpointId) || `Checkpoint ${p.checkpointId}`,
    photoUrl: p.photoUrl,
    capturedAt: p.capturedAt,
  }));

  const messageLines = [
    `🛡️ *${guardName}* submitted a Patrol Checkpoint form for *${projectName}*`,
    "",
    ...checkpoints.map((c) => `${c.name}: ${c.photoUrl}`),
  ];

  // Slack only renders an inline, already-expanded image for bot-posted
  // messages via Block Kit's "image" block — a plain-text URL just gets a
  // generic collapsed link preview, not a visible thumbnail.
  const blocks = [
    { type: "section", text: { type: "mrkdwn", text: `🛡️ *${guardName}* submitted a Patrol Checkpoint form for *${projectName}*` } },
    ...checkpoints.map((c) => ({
      type: "image",
      image_url: c.photoUrl,
      alt_text: c.name,
      title: { type: "plain_text", text: c.name },
    })),
  ];

  notifyWebhook({
    type: "patrol_checkpoint",
    guardName,
    projectName,
    checkpointsCovered: photos.length,
    checkpoints,
    submittedAt: submission.submittedAt,
    message: messageLines.join("\n"),
    blocks,
    blocksJson: JSON.stringify(blocks),
  });

  res.status(201).json(submission);
};

exports.listSubmissions = async (req, res) => {
  const { projectId, date } = req.query;
  const filter = {};
  if (projectId) filter.projectId = projectId;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    filter.submittedAt = { $gte: start, $lt: end };
  }

  const submissions = await PatrolSubmission.find(filter).sort({ submittedAt: -1 });
  const withCounts = await Promise.all(
    submissions.map(async (s) => {
      const project = await Project.findById(s.projectId);
      return {
        _id: s._id,
        guardName: s.guardName,
        projectName: s.projectName,
        submittedAt: s.submittedAt,
        checkpointsCovered: s.photos.length,
        checkpointCount: project ? project.checkpointCount : 0,
      };
    })
  );

  res.json(withCounts);
};

exports.getSubmission = async (req, res) => {
  const submission = await PatrolSubmission.findById(req.params.id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });
  res.json(submission);
};
