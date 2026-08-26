// Neoteric Reserve Club forms — same shape as gcClubForms.js (named
// checklists per form, since each form's checklist is its own distinct
// list, not a shared numeric range). Each checkpoint has a type: "photo"
// (default) or "text", and is required unless explicitly marked
// { required: false }. Starts empty; 8 forms get appended as provided.
function photo(label, opts = {}) {
  return { label, type: "photo", ...opts };
}

const RESERVE_CLUB_FORMS = [
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
];

function getFormByNumber(formNumber) {
  return RESERVE_CLUB_FORMS.find((f) => f.formNumber === Number(formNumber));
}

module.exports = { RESERVE_CLUB_FORMS, getFormByNumber, photo };
