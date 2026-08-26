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
];

function getFormByNumber(formNumber) {
  return RESERVE_CLUB_FORMS.find((f) => f.formNumber === Number(formNumber));
}

module.exports = { RESERVE_CLUB_FORMS, getFormByNumber, photo };
