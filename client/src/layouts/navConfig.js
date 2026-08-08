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

export const NAV_SECTIONS = [
  {
    id: "operations",
    items: [
      { label: "Housekeeping", path: "/housekeeping" },
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
        ],
      },
      { label: "Attendance", path: "/attendance" },
      { label: "Maintenance Staff", path: "/admin/maintenance-staff" },
      { label: "Guard Master Data", path: "/admin/guards" },
    ],
  },
];
