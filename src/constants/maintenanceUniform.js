// Mirrors backend/constants/maintenanceUniformStatus.js — kept in sync
// manually, same convention as PERMISSION_MODULES / the club form lists.
export const MAINTENANCE_UNIFORM_SITES = [
  "Garden City",
  "Regal Garden",
  "Nature Park",
  "One Business Center",
  "Neoteric Reserve",
  "Garden City Club",
  "GST",
  "Hyde Park",
  "Milestone",
  "Neo Meridian",
  "Regal Garden Club",
];

export const MAINTENANCE_UNIFORM_DESIGNATIONS = ["Security Guard", "House Keeping", "Gardener"];

// The Daily Report is split across two coordinators, each responsible for a
// fixed set of sites — picking a report name scopes the Daily Report page to
// just that coordinator's sites/staff.
export const MAINTENANCE_UNIFORM_REPORT_FORMATS = {
  "Priyanka Report": ["One Business Center", "Garden City", "Garden City Club", "Nature Park"],
  "Niketa Report": ["Milestone", "Regal Garden", "GST", "Neo Meridian", "Neoteric Reserve", "Hyde Park", "Regal Garden Club"],
};
