const PATROL_SITES = [
  { label: "Garden City", slug: "garden-city" },
  { label: "Regal Garden", slug: "regal-garden" },
  { label: "Nature Park", slug: "nature-park" },
  { label: "Wildflower", slug: "wildflower" },
  { label: "School", slug: "school" },
];

// Daily Report requires "edit" on the module — Coordinator's default
// permissions include edit on housekeeping/patrol/nightGuard, Security
// Manager's don't, so this preserves the original role split while now
// being driven by each user's actual permissions rather than their role name.

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

// Garden City Club forms — unlike Garden City's numbered Checkpoint-1..150
// split across fixed ranges, each Club form has its own named checklist (it
// varies per floor/area), so checkpoints are labels, not a numeric range.
// Each checkpoint has a type: "photo" (default, a CameraCapture) or "text"
// (a short free-text answer, e.g. a PH reading), and is required unless
// explicitly marked { required: false } (e.g. AC Duct Cleaning, only
// applicable on Sundays). Mirrors server/constants/gcClubForms.js — kept in
// sync manually. More forms get appended here as they're provided.
function photo(label, opts = {}) {
  return { label, type: "photo", ...opts };
}

export const GC_CLUB_FORMS = [
  {
    formNumber: 1,
    label: "First Floor Form",
    checkpoints: [
      "Gym",
      "Gym Light",
      "Resturant",
      "Resturant Reception",
      "Resturant Light",
      "Office Room",
      "Office Room Light",
      "Common Floor",
      "Stairs",
      "WC-1 (Male Washroom)",
      "WC-2 (Male Washroom)",
      "Urinal (Male Washroom)",
      "Shower Area (Male Washroom)",
      "Changing Room (Male Washroom)",
      "Washbasin or Mirror (Male Washroom)",
      "Floor (Male Washroom)",
      "Dustbin (Male Washroom)",
      "WC-1 (Female Washroom)",
      "WC-2 (Female Washroom)",
      "Washbasin or Mirror (Female Washroom)",
      "Dustbin (Female Washroom)",
      "Floor (Female Washroom)",
      "Shower Area (Female Washroom)",
      "Changing Room (Female Washroom)",
      "Utility Room (Female Washroom)",
      "Common area Light",
      "Open Terrace",
      "Store Room",
    ].map(photo),
  },
  {
    formNumber: 2,
    label: "Swimming Pool Form",
    checkpoints: [
      photo("Swimming Pool Image-1"),
      photo("Swimming Pool Image-2"),
      photo("Pool Outside area"),
      photo("Shower Area"),
      photo("PH level Pic"),
      { label: "PH level", type: "text" },
    ],
  },
  {
    formNumber: 3,
    label: "Room Floor Form",
    checkpoints: [
      "Bed (Room-1)",
      "Cabinet (Room-1)",
      "Dustbin (Room-1)",
      "Washroom WC (Room-1)",
      "Washbasin or mirror (Room-1)",
      "Bed (Room-2)",
      "Cabinet (Room-2)",
      "Dustbin (Room-2)",
      "Washroom WC (Room-2)",
      "Washbasin or mirror (Room-2)",
      "Bed (Room-3)",
      "Cabinet (Room-3)",
      "Dustbin (Room-3)",
      "Washroom WC (Room-3)",
      "Washbasin or mirror (Room-3)",
      "Bed (Room-4)",
      "Cabinet (Room-4)",
      "Dustbin (Room-4)",
      "Washroom WC (Room-4)",
      "Washbasin or mirror (Room-4)",
    ].map(photo),
  },
  {
    formNumber: 4,
    label: "Second Floor Form",
    checkpoints: [
      "Banquet Hall -1",
      "Banquet Hall-2",
      "Banquet Hall Light",
      "Floor Pic",
      "Open Terrace",
      "Stairs",
      "Store Room",
      "WC-1 (Male Washroom)",
      "WC-2 (Male Washroom)",
      "WC-3 (Male Washroom)",
      "Urinal (Male Washroom)",
      "Washbasin or Mirror (Male Washroom)",
      "Floor (Male Washroom)",
      "Dustbin (Male Washroom)",
      "WC-1 (Female Washroom)",
      "WC-2 (Female Washroom)",
      "Washbasin or Mirror (Female Washroom)",
      "Dustbin (Female Washroom)",
      "Floor (Female Washroom)",
      "Common Area Light",
    ].map(photo),
  },
  {
    formNumber: 5,
    label: "Terrace Floor Form",
    checkpoints: [
      photo("Party Hall"),
      photo("Party Hall Light"),
      photo("WC-1 (Washroom)"),
      photo("WC-2 (Washroom)"),
      photo("Washbasin or Mirror (Washroom)"),
      photo("Dustbin (Washroom)"),
      photo("Floor (Washroom)"),
      photo("Open Terrace -1"),
      photo("Open Terrace-2"),
      photo("Store Room"),
      photo("AC Duct Cleaning (Only Sunday) (Optional)", { required: false }),
    ],
  },
  {
    formNumber: 6,
    label: "Ground Floor Form",
    checkpoints: [
      photo("Front gate Mirror"),
      photo("Floor"),
      photo("Recption"),
      photo("Reception Chandelier Light"),
      photo("Cafeteria"),
      photo("Cafeteria Light"),
      photo("Banquet Hall"),
      photo("Banquet Hall Light (Optional)", { required: false }),
      photo("Kitchen"),
      photo("Stairs"),
      photo("WC-1 (Male Washroom)"),
      photo("WC-2 (Male Washroom)"),
      photo("WC-3 (Male Washroom)"),
      photo("Urinal (Male Washroom)"),
      photo("Washbasin or Mirror (Male Washroom)"),
      photo("Floor (Male Washroom)"),
      photo("Dustbin (Male Washroom)"),
      photo("WC-1 (Female Washroom)"),
      photo("WC-2 (Female Washroom)"),
      photo("Washbasin or Mirror (Female Washroom)"),
      photo("Dustbin (Female Washroom)"),
      photo("Floor (Female Washroom)"),
      photo("Main gate Light"),
      photo("Common Area Light"),
    ],
  },
];

// Neoteric Reserve Club forms — same shape as GC_CLUB_FORMS (named
// checklists per form, photo/text checkpoint types, optional checkpoints).
// Mirrors server/constants/reserveClubForms.js — kept in sync manually.
// Starts empty; 8 forms get appended here as they're provided.
export const RESERVE_CLUB_FORMS = [
  {
    formNumber: 1,
    label: "Room 1 & 2 Form",
    checkpoints: [
      "Bed Pic (Room-1)",
      "Tea Table Pic (Room-1)",
      "Dustbin Pic (Room-1)",
      "Mirror Cabinet (Room-1)",
      "WC (Room-1 Washroom)",
      "Washbasin+Mirror (Room-1 Washroom)",
      "Bed Pic (Room-2)",
      "Tea table (Room-2)",
      "Dustbin (Room-2)",
      "Mirror cabinet (Room-2)",
      "WC (Room 2 Washroom)",
      "Washbasin+Mirror (Room-2 Washroom)",
      "Floor",
    ].map((label) => photo(label, { required: false })),
  },
  {
    formNumber: 2,
    label: "Meditation+E Lounge+Banquet Hall+Terrace+Fountain Form",
    checkpoints: [
      photo("Mirror(Meditation Room)"),
      photo("Floor (Meditation Room)"),
      photo("Cabin-1"),
      photo("Cabin-2"),
      photo("Cafe Area (E-Launge)"),
      photo("Floor (E-Launge)"),
      photo("Lights (E- Launge)"),
      photo("Lights (Conference Room)"),
      photo("Floor (Conference Room)"),
      photo("Banquet Hall -1"),
      photo("Banquet Hall-2"),
      photo("Banquet Hall -3"),
      photo("Banquet Hall -4"),
      photo("Fountain-1"),
      photo("Fountain-2"),
      photo("Fountain-3"),
      photo("Open Area"),
      photo("Terrace Kitchen"),
      photo("Jacuzzi Area"),
      photo("Upper Terrace Area"),
      photo("Stairs"),
      photo("Tennis Court", { required: false }),
      photo("AC Duct Cleaning (only Sunday)", { required: false }),
    ],
  },
  {
    formNumber: 3,
    label: "Second Floor Washroom Form",
    checkpoints: [
      "WC Pic (Male Washroom)",
      "Washbasin+Mirror (Male Washroom)",
      "Dustbin (Male Washroom)",
      "Floor (Male Washroom)",
      "Urinal -1+2+3 (Male Washroom)",
      "Shower Area (Male Washroom)",
      "Steam (Male Washroom)",
      "Sauna (Male Washroom)",
      "WC-1 (Female Washroom)",
      "WC-2 (Female Washroom)",
      "Washbasin-1 + Mirror (Female Washroom)",
      "Washbasin-2 +Mirror (Female Washroom)",
      "Dustbin (Female Washroom)",
      "Floor (Female Washroom)",
      "Shower Area (Female Washroom)",
      "Steam (Female Washroom)",
      "Sauna (Female Washroom)",
      "Floor",
      "Stair Case",
    ].map(photo),
  },
  {
    formNumber: 4,
    label: "Gym Form",
    checkpoints: ["Lights+Floor", "Machine", "(Accessories +Mirror)", "Fridge Bottle+Towel", "Dustbin"].map(photo),
  },
  {
    formNumber: 5,
    label: "Swimming Pool Form",
    checkpoints: [
      photo("Swimming Pool-1"),
      photo("Swimming Pool-2"),
      photo("Pool Outside Area"),
      photo("Shower Area"),
      photo("Mirror Pic"),
      { label: "PH Level (Short Answer)", type: "text" },
      photo("PH level"),
    ],
  },
];

function patrolSiteNavItem({ label, slug }) {
  return {
    label,
    children: [
      { label: "Submissions", path: `/security/patrol/${slug}/submissions` },
      {
        label: "Daily Report",
        path: `/security/patrol/${slug}/daily-report`,
        permission: { module: "patrol", action: "edit" },
      },
      { label: "Admin Report View", path: `/security/patrol/${slug}/admin-report` },
    ],
  };
}

export const NAV_SECTIONS = [
  {
    id: "operations",
    items: [
      {
        label: "Housekeeping",
        children: [
          {
            label: "Garden City",
            permission: { module: "gcHousekeeping", action: "view" },
            children: [
              { label: "Submissions", path: "/housekeeping/garden-city/submissions" },
              {
                label: "Daily Report",
                path: "/housekeeping/garden-city/daily-report",
                permission: { module: "gcHousekeeping", action: "edit" },
              },
              { label: "Admin Report View", path: "/housekeeping/garden-city/admin-report" },
            ],
          },
          {
            label: "Garden City Club",
            permission: { module: "gcClub", action: "view" },
            children: [
              { label: "Submissions", path: "/housekeeping/garden-city-club/submissions" },
              {
                label: "Daily Report",
                path: "/housekeeping/garden-city-club/daily-report",
                permission: { module: "gcClub", action: "edit" },
              },
              { label: "Admin Report View", path: "/housekeeping/garden-city-club/admin-report" },
            ],
          },
          {
            label: "Neoteric Reserve Club",
            permission: { module: "reserveClub", action: "view" },
            children: [
              { label: "Submissions", path: "/housekeeping/reserve-club/submissions" },
              {
                label: "Daily Report",
                path: "/housekeeping/reserve-club/daily-report",
                permission: { module: "reserveClub", action: "edit" },
              },
              { label: "Admin Report View", path: "/housekeeping/reserve-club/admin-report" },
            ],
          },
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
              {
                label: "Daily Report",
                path: "/security/night-guard/daily-report",
                permission: { module: "nightGuard", action: "edit" },
              },
              { label: "Admin Report View", path: "/security/night-guard/admin-report" },
            ],
          },
          { label: "Fire Mock Drill", path: "/security/fire-mock-drill/submissions" },
        ],
      },
      {
        label: "Attendance",
        children: [
          { label: "Daily Attendance", path: "/attendance", permission: { module: "attendance", action: "edit" } },
          { label: "Scan Attendance", path: "/attendance/scan", permission: { module: "attendance", action: "edit" } },
          { label: "Attendance Records", path: "/attendance/records", permission: { module: "attendance", action: "view" } },
          { label: "Team Attendance", path: "/attendance/team", permission: { module: "attendance", action: "view" } },
          { label: "Site Locations", path: "/attendance/sites", permission: { module: "siteLocations", action: "edit" } },
        ],
      },
      {
        label: "Maintenance Staff",
        path: "/admin/maintenance-staff",
        permission: { module: "maintenanceStaff", action: "view" },
      },
      { label: "Guard Master Data", path: "/admin/guards", permission: { module: "guards", action: "view" } },
      { label: "User Management", path: "/admin/users", permission: { module: "users", action: "view" } },
    ],
  },
];
