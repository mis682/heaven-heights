// Garden City Club forms — unlike Garden City's numbered Checkpoint-1..150
// split across fixed ranges, each Club form has its own named checklist
// (varies per floor/area), so checkpoints are stored as labels, not a
// shared numeric range. More forms get appended here as they're provided.
const GC_CLUB_FORMS = [
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
    ],
  },
];

function getFormByNumber(formNumber) {
  return GC_CLUB_FORMS.find((f) => f.formNumber === Number(formNumber));
}

module.exports = { GC_CLUB_FORMS, getFormByNumber };
