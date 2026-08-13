const PATROL_SITES = [
  { label: "Garden City", slug: "garden-city" },
  { label: "Regal Garden", slug: "regal-garden" },
  { label: "Nature Park", slug: "nature-park" },
  { label: "Wildflower", slug: "wildflower" },
  { label: "School", slug: "school" },
];

function patrolSiteNavItem({ label, slug }) {
  return {
    label,
    children: [
      { label: "Submissions", path: `/security/patrol/${slug}/submissions` },
      { label: "Daily Report", path: `/security/patrol/${slug}/daily-report` },
      { label: "Admin Report View", path: `/security/patrol/${slug}/admin-report` },
    ],
  };
}

// Coordinator only needs the Security module — every other item here is
// restricted to Admin / Security Manager so it drops out of the sidebar
// (and the matching routes in App.jsx) for that role.
export const NON_COORDINATOR_ROLES = ["Admin", "Security Manager"];

export const NAV_SECTIONS = [
  {
    id: "operations",
    items: [
      { label: "Housekeeping", path: "/housekeeping", roles: NON_COORDINATOR_ROLES },
      {
        label: "Security",
        children: [
          ...PATROL_SITES.map(patrolSiteNavItem),
          {
            label: "Night Guard",
            children: [
              { label: "Submissions", path: "/security/night-guard/submissions" },
              { label: "Daily Report", path: "/security/night-guard/daily-report" },
              { label: "Admin Report View", path: "/security/night-guard/admin-report" },
            ],
          },
          { label: "Fire Mock Drill", path: "/security/fire-mock-drill/submissions" },
        ],
      },
      {
        label: "Attendance",
        roles: NON_COORDINATOR_ROLES,
        children: [
          { label: "Daily Attendance", path: "/attendance" },
          { label: "Scan Attendance", path: "/attendance/scan" },
          { label: "Attendance Records", path: "/attendance/records" },
          { label: "Team Attendance", path: "/attendance/team" },
          { label: "Site Locations", path: "/attendance/sites" },
        ],
      },
      { label: "Maintenance Staff", path: "/admin/maintenance-staff", roles: NON_COORDINATOR_ROLES },
      { label: "Guard Master Data", path: "/admin/guards", roles: NON_COORDINATOR_ROLES },
    ],
  },
];
