const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/housekeepingController");
const { uploadHousekeeping } = require("../middleware/upload");
const asyncHandler = require("../utils/asyncHandler");

router.get("/stats", asyncHandler(ctrl.stats));
router.get("/", asyncHandler(ctrl.list));
router.post("/", asyncHandler(ctrl.create));
router.put("/:id", uploadHousekeeping.single("photo"), asyncHandler(ctrl.update));
router.delete("/:id", asyncHandler(ctrl.remove));

module.exports = router;
