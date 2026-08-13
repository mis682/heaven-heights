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

// Only Admin needs Housekeeping, Attendance and the staff/guard master data
// pages — both Security Manager and Coordinator are scoped to Security only.
export const ADMIN_ONLY_ROLES = ["Admin"];

export const NAV_SECTIONS = [
  {
    id: "operations",
    items: [
      { label: "Housekeeping", path: "/housekeeping", roles: ADMIN_ONLY_ROLES },
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
        roles: ADMIN_ONLY_ROLES,
        children: [
          { label: "Daily Attendance", path: "/attendance" },
          { label: "Scan Attendance", path: "/attendance/scan" },
          { label: "Attendance Records", path: "/attendance/records" },
          { label: "Team Attendance", path: "/attendance/team" },
          { label: "Site Locations", path: "/attendance/sites" },
        ],
      },
      { label: "Maintenance Staff", path: "/admin/maintenance-staff", roles: ADMIN_ONLY_ROLES },
      { label: "Guard Master Data", path: "/admin/guards", roles: ADMIN_ONLY_ROLES },
    ],
  },
];
