const PATROL_SITES = [
  { label: "Garden City", slug: "garden-city" },
  { label: "Regal Garden", slug: "regal-garden" },
  { label: "Nature Park", slug: "nature-park" },
  { label: "Wildflower", slug: "wildflower" },
  { label: "School", slug: "school" },
];

// Daily Report is prepared by coordinators, not security managers, so it's
// hidden from Security Manager while every other security submodule stays
// visible to all three roles.
export const DAILY_REPORT_ROLES = ["Admin", "Coordinator"];

// Garden City's 150 housekeeping checkpoints are split across 4 public forms
// so no single person has to photograph all of them in one sitting — each
// form covers a fixed, non-overlapping checkpoint range. Mirrors
// server/constants/gcHousekeepingForms.js — kept in sync manually, same
// convention as PATROL_SITES above (static, rarely changes).
export const GC_HOUSEKEEPING_FORMS = [
  { formNumber: 1, label: "GC Form 1", checkpointStart: 1, checkpointEnd: 40 },
  { formNumber: 2, label: "GC Form 2", checkpointStart: 41, checkpointEnd: 80 },
  { formNumber: 3, label: "GC Form 3", checkpointStart: 81, checkpointEnd: 120 },
  { formNumber: 4, label: "GC Form 4", checkpointStart: 121, checkpointEnd: 150 },
];

function patrolSiteNavItem({ label, slug }) {
  return {
    label,
    children: [
      { label: "Submissions", path: `/security/patrol/${slug}/submissions` },
      { label: "Daily Report", path: `/security/patrol/${slug}/daily-report`, roles: DAILY_REPORT_ROLES },
      { label: "Admin Report View", path: `/security/patrol/${slug}/admin-report` },
    ],
  };
}

// Only Admin needs Housekeeping and the staff/guard master data pages —
// both Security Manager and Coordinator are scoped to Security only.
export const ADMIN_ONLY_ROLES = ["Admin"];

// Security Manager additionally gets read access to Team Attendance and
// Attendance Records (to check their own guards' attendance) — every other
// Attendance submodule stays Admin-only.
export const ATTENDANCE_VIEW_ROLES = ["Admin", "Security Manager"];

export const NAV_SECTIONS = [
  {
    id: "operations",
    items: [
      {
        label: "Housekeeping",
        roles: DAILY_REPORT_ROLES,
        children: [
          { label: "Submissions", path: "/housekeeping/garden-city/submissions" },
          { label: "Daily Report", path: "/housekeeping/garden-city/daily-report" },
          { label: "Admin Report View", path: "/housekeeping/garden-city/admin-report" },
        ],
      },
      {
        label: "Security",
        children: [
          ...PATROL_SITES.map(patrolSiteNavItem),
          {
            label: "Night Guard",
            children: [
              { label: "Submissions", path: "/security/night-guard/submissions" },
              { label: "Daily Report", path: "/security/night-guard/daily-report", roles: DAILY_REPORT_ROLES },
              { label: "Admin Report View", path: "/security/night-guard/admin-report" },
            ],
          },
          { label: "Fire Mock Drill", path: "/security/fire-mock-drill/submissions" },
        ],
      },
      {
        label: "Attendance",
        children: [
          { label: "Daily Attendance", path: "/attendance", roles: ADMIN_ONLY_ROLES },
          { label: "Scan Attendance", path: "/attendance/scan", roles: ADMIN_ONLY_ROLES },
          { label: "Attendance Records", path: "/attendance/records", roles: ATTENDANCE_VIEW_ROLES },
          { label: "Team Attendance", path: "/attendance/team", roles: ATTENDANCE_VIEW_ROLES },
          { label: "Site Locations", path: "/attendance/sites", roles: ADMIN_ONLY_ROLES },
        ],
      },
      { label: "Maintenance Staff", path: "/admin/maintenance-staff", roles: ADMIN_ONLY_ROLES },
      { label: "Guard Master Data", path: "/admin/guards", roles: ADMIN_ONLY_ROLES },
    ],
  },
];
