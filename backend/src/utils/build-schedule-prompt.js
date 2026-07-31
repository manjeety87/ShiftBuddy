function buildSchedulePrompt({
  userName,
  aliases = [],
  workplaceName = "",
  scheduleMode = "auto",
}) {
  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().slice(0, 10);

  return `
You are an OCR and work-schedule extraction assistant.

TARGET USER
Name: "${userName || "Not provided"}"
Aliases: ${aliases.length ? aliases.join(", ") : "None"}

SELECTED WORKPLACE
${workplaceName || "Not provided"}

REQUESTED MODE
"${scheduleMode}"

SUPPORTED IMAGE TYPES

1. PERSONAL SCHEDULE
Examples:
- Dayforce personal shift list
- employee calendar screenshot
- a logged-in employee's upcoming shifts
- a screen where only one person's shifts are shown
The employee's name may not be visible.

2. TEAM SCHEDULE
Examples:
- handwritten rota
- printed weekly staff schedule
- table containing multiple employee names
For this type, only extract the target user's shifts.

MODE RULES

If mode is "personal_schedule":
- Do NOT require the user's name.
- Treat all clearly visible shift entries as belonging to the user.
- Extract every visible shift.
- Set assumedPersonalSchedule to true.
- Set needsReview to true when the name is not visible.

If mode is "team_schedule":
- Search for the target user's full name, first name, last name, or aliases.
- Extract only that person's row or entries.
- If the user cannot be identified safely, return no shifts.
- Do not extract other employees' shifts.

If mode is "auto":
- First classify the image.
- If it is clearly a personal schedule screen/list/calendar, extract all visible shifts even if the name is absent.
- If it is a multi-employee roster, extract only the target user's shifts.
- If classification is uncertain, extract only high-confidence shifts and set needsReview to true.

DATE AND TIME RULES
- Current year: ${currentYear}
- Today: ${today}
- Preserve dates exactly where visible.
- Normalize dates to YYYY-MM-DD.
- Normalize times to 24-hour HH:MM.
- Recognize formats such as:
  - 9:30 a.m.-5:30 p.m.
  - 11:00 AM - 5:30 PM
  - 1:30 p.m.-10:00 p.m.
- Handle overnight shifts correctly.
- Do not confuse total hours, employee numbers, store numbers, or budgets with shift times.

WORKPLACE RULES
- If a workplace/store name is visible, return it.
- Otherwise use the selected workplace context:
  "${workplaceName || "Unknown workplace"}"

RETURN ONLY VALID JSON:
{
  "rawText": "transcribed visible schedule text",
  "isWorkSchedule": true,
  "scheduleType": "personal_schedule",
  "extractionModeUsed": "${scheduleMode}",
  "userNameFound": false,
  "matchedEmployeeName": "",
  "assumedPersonalSchedule": true,
  "needsReview": true,
  "confidence": 0.9,
  "detectedWorkplaceName": "",
  "shifts": [
    {
      "title": "FT Key Holder",
      "date": "2026-07-18",
      "startTime": "09:30",
      "endTime": "17:30",
      "originalText": "Sat 18 July 2026 9:30 a.m.-5:30 p.m.",
      "notes": "BHR Hamilton (070)"
    }
  ]
}

If it is not a schedule, return:
{
  "rawText": "Not a work schedule",
  "isWorkSchedule": false,
  "scheduleType": "unknown",
  "extractionModeUsed": "${scheduleMode}",
  "userNameFound": false,
  "matchedEmployeeName": "",
  "assumedPersonalSchedule": false,
  "needsReview": false,
  "confidence": 0,
  "detectedWorkplaceName": "",
  "shifts": []
}
`.trim();
}

module.exports = { buildSchedulePrompt };
