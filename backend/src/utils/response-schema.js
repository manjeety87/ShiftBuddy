const responseSchema = {
  type: "OBJECT",
  properties: {
    rawText: {
      type: "STRING",
    },
    isWorkSchedule: {
      type: "BOOLEAN",
    },
    scheduleType: {
      type: "STRING",
      enum: ["personal_schedule", "team_schedule", "unknown"],
    },
    extractionModeUsed: {
      type: "STRING",
      enum: ["auto", "personal_schedule", "team_schedule"],
    },
    userNameFound: {
      type: "BOOLEAN",
    },
    matchedEmployeeName: {
      type: "STRING",
    },
    assumedPersonalSchedule: {
      type: "BOOLEAN",
    },
    needsReview: {
      type: "BOOLEAN",
    },
    confidence: {
      type: "NUMBER",
    },
    detectedWorkplaceName: {
      type: "STRING",
    },
    shifts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: {
            type: "STRING",
          },
          date: {
            type: "STRING",
          },
          startTime: {
            type: "STRING",
          },
          endTime: {
            type: "STRING",
          },
          originalText: {
            type: "STRING",
          },
          notes: {
            type: "STRING",
          },
        },
        required: [
          "title",
          "date",
          "startTime",
          "endTime",
          "originalText",
          "notes",
        ],
      },
    },
  },
  required: [
    "rawText",
    "isWorkSchedule",
    "scheduleType",
    "extractionModeUsed",
    "userNameFound",
    "matchedEmployeeName",
    "assumedPersonalSchedule",
    "needsReview",
    "confidence",
    "detectedWorkplaceName",
    "shifts",
  ],
};

module.exports = {
  responseSchema,
};
