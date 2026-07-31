const { GoogleGenAI } = require("@google/genai");
const { env } = require("../config/env");
const { buildSchedulePrompt } = require("../utils/build-schedule-prompt");
const { responseSchema } = require("../utils/response-schema");
const { buildIsoDateTimes } = require("../utils/date-time");

if (!env.geminiApiKey) {
  console.warn("Warning: GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({
  apiKey: env.geminiApiKey,
});

async function runGeminiScheduleExtraction({
  imageBuffer,
  mimeType,
  userName,
  aliases = [],
  workplaceName = "",
  scheduleMode = "auto",
}) {
  const base64Image = imageBuffer.toString("base64");

  const prompt = buildSchedulePrompt({
    userName,
    aliases,
    workplaceName,
  });

  const response = await ai.models.generateContent({
    model: env.geminiModel,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64Image } },
        ],
      },
      // contents: [
      //   {
      //     text: prompt,
      //   },
      //   {
      //     inlineData: {
      //       mimeType,
      //       data: base64Image,
      //     },
      //   },
    ],
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    console.log("Failed to parse Gemini response as JSON:", error);
    throw new Error(`Failed to parse Gemini JSON response: ${text}`);
  }

  const shifts = Array.isArray(parsed.shifts)
    ? parsed.shifts.map((shift, index) => {
        const title = shift.title || "Shift";
        const date = shift.date || null;
        const startTime = shift.startTime || null;
        const endTime = shift.endTime || null;
        const originalText = shift.originalText || "";
        const notes = shift.notes || "";

        const { startDateTime, endDateTime } = buildIsoDateTimes(
          date,
          startTime,
          endTime,
        );

        return {
          id: `${Date.now()}-${index}`,
          title,
          date,
          startTime,
          endTime,
          startDateTime,
          endDateTime,
          originalText,
          notes,
        };
      })
    : [];

  return {
    rawText: parsed.rawText || "",
    isWorkSchedule: Boolean(parsed.isWorkSchedule),
    matchedEmployeeName: parsed.matchedEmployeeName || "",
    userNameFound: Boolean(parsed.userNameFound),
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
    shifts,
  };
}

module.exports = { runGeminiScheduleExtraction };
