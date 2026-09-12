// Regal Garden Club forms — same shape as reserveClubForms.js (named
// checklists per form, since each form's checklist is its own distinct
// list, not a shared numeric range). Each checkpoint has a type: "photo"
// (default) or "text", and is required unless explicitly marked
// { required: false }. Starts empty; 2 forms get appended as provided.
function photo(label, opts = {}) {
  return { label, type: "photo", ...opts };
}

const REGAL_GARDEN_CLUB_FORMS = [];

function getFormByNumber(formNumber) {
  return REGAL_GARDEN_CLUB_FORMS.find((f) => f.formNumber === Number(formNumber));
}

module.exports = { REGAL_GARDEN_CLUB_FORMS, getFormByNumber, photo };
