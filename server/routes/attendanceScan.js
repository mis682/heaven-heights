const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/attendanceScanController");
const asyncHandler = require("../utils/asyncHandler");
const { upload } = require("../middleware/upload");

router.get("/records", asyncHandler(ctrl.records));
router.get("/lookup/:employeeId", asyncHandler(ctrl.lookup));
router.post("/", upload.single("photo"), asyncHandler(ctrl.scan));
router.delete("/:id", asyncHandler(ctrl.remove));

module.exports = router;
