const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/projectController");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", asyncHandler(ctrl.list));
router.get("/:slug", asyncHandler(ctrl.getBySlug));

module.exports = router;
