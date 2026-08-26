// Neoteric Reserve Club forms — same shape as gcClubForms.js (named
// checklists per form, since each form's checklist is its own distinct
// list, not a shared numeric range). Each checkpoint has a type: "photo"
// (default) or "text", and is required unless explicitly marked
// { required: false }. Starts empty; 8 forms get appended as provided.
function photo(label, opts = {}) {
  return { label, type: "photo", ...opts };
}

const RESERVE_CLUB_FORMS = [];

function getFormByNumber(formNumber) {
  return RESERVE_CLUB_FORMS.find((f) => f.formNumber === Number(formNumber));
}

module.exports = { RESERVE_CLUB_FORMS, getFormByNumber, photo };
