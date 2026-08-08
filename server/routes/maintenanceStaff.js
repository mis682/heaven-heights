const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/maintenanceStaffController");
const asyncHandler = require("../utils/asyncHandler");

router.get("/meta", asyncHandler(ctrl.meta));
router.get("/next-id", asyncHandler(ctrl.nextId));
router.get("/", asyncHandler(ctrl.list));
router.post("/", asyncHandler(ctrl.create));
router.put("/:id", asyncHandler(ctrl.update));
router.delete("/:id", asyncHandler(ctrl.remove));

module.exports = router;
