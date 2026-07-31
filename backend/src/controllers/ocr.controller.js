const {
  runGeminiScheduleExtraction,
} = require("../services/gemini-ocr.service");

const {
  preprocessScheduleImage,
} = require("../services/image-preprocess.service");

const ALLOWED_SCHEDULE_MODES = ["auto", "personal_schedule", "team_schedule"];

function parseAliases(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(
      (alias) => typeof alias === "string" && alias.trim().length > 0,
    );
  }

  if (typeof value !== "string") {
    throw new Error("aliases must be a JSON array of strings");
  }

  const parsed = JSON.parse(value);

  if (!Array.isArray(parsed)) {
    throw new Error("aliases must be a JSON array of strings");
  }

  return parsed
    .filter((alias) => typeof alias === "string")
    .map((alias) => alias.trim())
    .filter(Boolean);
}

async function extractUserShiftsFromImage(req, res, next) {
  console.log("Received OCR request");

  try {
    const file = req.file;

    const {
      userName = "",
      aliases,
      workplaceName = "",
      preprocess = "true",
      scheduleMode = "auto",
    } = req.body ?? {};

    if (!file) {
      return res.status(400).json({
        error: "image file is required",
      });
    }

    if (!ALLOWED_SCHEDULE_MODES.includes(scheduleMode)) {
      return res.status(400).json({
        error: "scheduleMode must be auto, personal_schedule, or team_schedule",
      });
    }

    /*
     * Name is required only for team schedules.
     * Personal schedule screenshots may not show the employee name.
     */
    if (
      scheduleMode === "team_schedule" &&
      (!userName || typeof userName !== "string" || !userName.trim())
    ) {
      return res.status(400).json({
        error: "userName is required for team schedules",
      });
    }

    let aliasList;

    try {
      aliasList = parseAliases(aliases);
    } catch (error) {
      return res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "aliases must be a valid JSON array",
      });
    }

    let imageBuffer = file.buffer;
    let mimeType = file.mimetype;

    if (String(preprocess).toLowerCase() === "true") {
      const processed = await preprocessScheduleImage(file.buffer);

      imageBuffer = processed.buffer;
      mimeType = processed.mimeType;
    }

    const result = await runGeminiScheduleExtraction({
      imageBuffer,
      mimeType,
      userName: typeof userName === "string" ? userName.trim() : "",
      aliases: aliasList,
      workplaceName:
        typeof workplaceName === "string" ? workplaceName.trim() : "",
      scheduleMode,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("OCR controller error:", error);
    return next(error);
  }
}

module.exports = {
  extractUserShiftsFromImage,
};
