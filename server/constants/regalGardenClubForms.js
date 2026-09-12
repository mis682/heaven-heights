// Regal Garden Club forms — same shape as reserveClubForms.js (named
// checklists per form, since each form's checklist is its own distinct
// list, not a shared numeric range). Each checkpoint has a type: "photo"
// (default) or "text", and is required unless explicitly marked
// { required: false }. Starts empty; 2 forms get appended as provided.
function photo(label, opts = {}) {
  return { label, type: "photo", ...opts };
}

const REGAL_GARDEN_CLUB_FORMS = [
  {
    formNumber: 1,
    label: "RG Club Form",
    checkpoints: [
      "Main Entrance Area (1st Floor)",
      "Lift Cleaning",
      "Zym Room Cleaning",
      "Resturant Room Cleaning (2nd Floor)-1",
      "Resturant Room Cleaning (2nd Floor)-2",
      "2nd Floor-1",
      "2nd Floor-2",
      "Terrace Image-1",
      "Terrace Image-2",
      "Swimming Pool Filter Room",
      "Sports Area",
    ].map(photo),
  },
];

function getFormByNumber(formNumber) {
  return REGAL_GARDEN_CLUB_FORMS.find((f) => f.formNumber === Number(formNumber));
}

module.exports = { REGAL_GARDEN_CLUB_FORMS, getFormByNumber, photo };
