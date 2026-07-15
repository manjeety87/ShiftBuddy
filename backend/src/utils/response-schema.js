const responseSchema = {
  type: "OBJECT",
  properties: {
    rawText: { type: "STRING" },
    isWorkSchedule: { type: "BOOLEAN" },
    matchedEmployeeName: { type: "STRING" },
    userNameFound: { type: "BOOLEAN" },
    confidence: { type: "NUMBER" },
    shifts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          date: { type: "STRING" },
          startTime: { type: "STRING" },
          endTime: { type: "STRING" },
          originalText: { type: "STRING" },
          notes: { type: "STRING" },
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
    "matchedEmployeeName",
    "userNameFound",
    "confidence",
    "shifts",
  ],
};

module.exports = { responseSchema };
