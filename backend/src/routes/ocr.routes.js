const express = require("express");
const { upload } = require("../middleware/upload");
const { extractUserShiftsFromImage } = require("../controllers/ocr.controller");

const router = express.Router();

// multipart/form-data
// fields:
// - image (file)
// - userName (text)
// - aliases (optional JSON array string)
// - workplaceName (optional)
// - preprocess (optional: true/false)
router.post("/extract", upload.single("image"), extractUserShiftsFromImage);

module.exports = router;
