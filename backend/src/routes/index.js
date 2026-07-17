const express = require("express");

const healthRoutes = require("./health.routes");
const ocrRoutes = require("./ocr.routes");

const router = express.Router();

router.use("/ocr", ocrRoutes);
router.use("/health", healthRoutes);

module.exports = router;
