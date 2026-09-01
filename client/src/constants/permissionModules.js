// Mirrors server/constants/permissionModules.js — kept in sync manually,
// same convention as the GC/Reserve Club form definitions in navConfig.js.
export const PERMISSION_MODULES = [
  { key: "attendance", label: "Attendance" },
  { key: "patrol", label: "Security Patrol" },
  { key: "nightGuard", label: "Night Guard" },
  { key: "fireMockDrill", label: "Fire Mock Drill" },
  { key: "gcHousekeeping", label: "Garden City Housekeeping" },
  { key: "gcClub", label: "Garden City Club" },
  { key: "reserveClub", label: "Neoteric Reserve Club" },
  { key: "maintenanceStaff", label: "Maintenance Staff" },
  { key: "guards", label: "Guard Master Data" },
  { key: "projects", label: "Projects" },
  { key: "siteLocations", label: "Site Locations" },
  { key: "media", label: "Media" },
  { key: "users", label: "User Management" },
];

// Roles are now admin-editable DB records (see api/roles.js) rather than a
// fixed list — this file only defines the fixed catalog of feature modules.
export function emptyPermissions() {
  const perms = {};
  for (const m of PERMISSION_MODULES) perms[m.key] = { view: false, edit: false, delete: false };
  return perms;
}
