const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/nightGuardController");
const { upload } = require("../middleware/upload");
const asyncHandler = require("../utils/asyncHandler");

router.get("/meta", asyncHandler(ctrl.meta));

router.post("/submissions", upload.single("guardPhoto"), asyncHandler(ctrl.createSubmission));
router.get("/submissions", asyncHandler(ctrl.listSubmissions));

router.get("/reports/submitted", asyncHandler(ctrl.listSubmittedReports));
router.get("/reports/by-date", asyncHandler(ctrl.getReportByDate));
router.post("/reports/draft", asyncHandler(ctrl.saveDraft));
router.post("/reports/:id/submit", asyncHandler(ctrl.submitReport));
router.post("/reports/:id/unlock", asyncHandler(ctrl.unlockReport));
router.get("/reports/:id/export", asyncHandler(ctrl.exportReport));
router.get("/reports/:id", asyncHandler(ctrl.getReport));

module.exports = router;
