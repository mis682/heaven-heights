// Garden City Club forms — unlike Garden City's numbered Checkpoint-1..150
// split across fixed ranges, each Club form has its own named checklist
// (varies per floor/area), so checkpoints are stored as labels, not a
// shared numeric range. Each checkpoint has a type: "photo" (default, a
// CameraCapture) or "text" (a short free-text answer, e.g. a PH reading).
// More forms get appended here as they're provided.
function photo(label) {
  return { label, type: "photo" };
}

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
];

function getFormByNumber(formNumber) {
  return GC_CLUB_FORMS.find((f) => f.formNumber === Number(formNumber));
}

module.exports = { GC_CLUB_FORMS, getFormByNumber };
