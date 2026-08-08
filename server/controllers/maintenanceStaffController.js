const MaintenanceStaff = require("../models/MaintenanceStaff");

function collapseSpaces(value) {
  return value.trim().replace(/\s+/g, " ");
}

// Ignore case AND whether words are separated by a space at all, so
// "Housekeeping" and "House Keeping" are treated as the same value.
function matchKey(value) {
  return value.toLowerCase().replace(/\s+/g, "");
}

// Reuses the existing canonical spelling/casing when the same value already
// exists (ignoring case and spacing), so typing "Housekeeping" reuses the
// existing "House Keeping" designation instead of forking into two.
async function normalizeAgainstExisting(field, value) {
  const cleaned = collapseSpaces(value);
  const existing = await MaintenanceStaff.distinct(field);
  const match = existing.find((v) => matchKey(v) === matchKey(cleaned));
  return match || cleaned;
}

exports.list = async (req, res) => {
  const { siteName, designation, search } = req.query;
  const filter = {};
  if (siteName) filter.siteName = siteName;
  if (designation) filter.designation = designation;
  if (search) {
    const re = new RegExp(search, "i");
    filter.$or = [{ name: re }, { employeeId: re }, { siteName: re }, { designation: re }];
  }
  const staff = await MaintenanceStaff.find(filter).sort({ employeeId: 1 });
  res.json(staff);
};

exports.meta = async (req, res) => {
  const [sites, designations] = await Promise.all([
    MaintenanceStaff.distinct("siteName"),
    MaintenanceStaff.distinct("designation"),
  ]);
  res.json({ sites: sites.sort(), designations: designations.sort() });
};

async function suggestNextEmployeeId() {
  const docs = await MaintenanceStaff.find({ employeeId: /^NP\d+$/ }, { employeeId: 1 });
  const max = docs.reduce((m, d) => Math.max(m, parseInt(d.employeeId.slice(2), 10)), 0);
  return `NP${max + 1}`;
}

exports.nextId = async (req, res) => {
  res.json({ employeeId: await suggestNextEmployeeId() });
};

exports.create = async (req, res) => {
  const body = { ...req.body };
  if (!body.employeeId) {
    body.employeeId = await suggestNextEmployeeId();
  }
  if (body.designation) body.designation = await normalizeAgainstExisting("designation", body.designation);
  if (body.siteName) body.siteName = await normalizeAgainstExisting("siteName", body.siteName);
  const staff = await MaintenanceStaff.create(body);
  res.status(201).json(staff);
};

exports.update = async (req, res) => {
  const body = { ...req.body };
  if (body.designation) body.designation = await normalizeAgainstExisting("designation", body.designation);
  if (body.siteName) body.siteName = await normalizeAgainstExisting("siteName", body.siteName);
  const staff = await MaintenanceStaff.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!staff) return res.status(404).json({ message: "Staff member not found" });
  res.json(staff);
};

exports.remove = async (req, res) => {
  const staff = await MaintenanceStaff.findByIdAndDelete(req.params.id);
  if (!staff) return res.status(404).json({ message: "Staff member not found" });
  res.json({ message: "Staff member deleted" });
};
