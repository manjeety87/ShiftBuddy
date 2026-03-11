// /**
//  * ─── OCR Service ────────────────────────────────────────────────────
//  *
//  * Sends the schedule image to the ShiftBuddy backend which calls
//  * Gemini Vision on the server side — the API key never reaches the app.
//  *
//  * REAL MODE  → POST to EXPO_PUBLIC_API_URL/api/ocr (backend running)
//  * MOCK MODE  → Falls back to sample data when no API URL is set
//  */

// import type { Shift } from "@/types";
// import * as Crypto from "expo-crypto";

// // Backend URL — set EXPO_PUBLIC_API_URL in .env (e.g. http://192.168.1.x:3000)
// const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");

// export interface OCRParseResult {
//   rawText: string;
//   isWorkSchedule?: boolean;
//   matchedEmployeeName?: string;
//   userNameFound: boolean;
//   confidence?: number;
//   shifts: {
//     id?: string;
//     title: string;
//     date: string;
//     startTime: string;
//     endTime: string;
//     startDateTime: string;
//     endDateTime: string;
//     originalText?: string;
//     notes?: string;
//   }[];
// }

// // ─── Backend OCR call ────────────────────────────────────────────────

// async function callBackendOCR(
//   imageUri: string,
//   userName: string,
// ): Promise<OCRParseResult> {
//   const fileName = imageUri.split("/").pop() || "schedule.jpg";
//   const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";

//   const mimeMap: Record<string, string> = {
//     jpg: "image/jpeg",
//     jpeg: "image/jpeg",
//     png: "image/png",
//     webp: "image/webp",
//     heic: "image/heic",
//   };

//   const mimeType = mimeMap[ext] ?? "image/jpeg";

//   const formData = new FormData();

//   formData.append("image", {
//     uri: imageUri,
//     name: fileName,
//     type: mimeType,
//   } as any);

//   formData.append("userName", userName);
//   formData.append("aliases", JSON.stringify([userName]));
//   formData.append("workplaceName", "INC");
//   formData.append("preprocess", "true");

//   const res = await fetch(`${API_URL}/api/ocr/extract`, {
//     method: "POST",
//     body: formData,
//   });

//   const raw = await res.text();
//   console.log("OCR status:", res.status);
//   console.log("OCR raw response:", raw);

//   let data: unknown;
//   try {
//     data = JSON.parse(raw);
//   } catch {
//     throw new Error(`Invalid JSON response from server: ${raw}`);
//   }

//   if (!res.ok) {
//     const err = data as { error?: string };
//     throw new Error(err.error ?? `Server error (${res.status})`);
//   }

//   return data as OCRParseResult;
// }

// // ─── Mock Fallback (demo mode when backend URL not set) ────────────

// const MOCK_RAW_TEXT = `
// WEEKLY SCHEDULE - MARCH 2026
// Employee Schedule for International Clothiers

// Mon  03/09  Manjeet Yadav    9:00 AM - 3:00 PM
// Tue  03/10  Manjeet Yadav    2:00 PM - 8:00 PM
// Wed  03/11  Sarah Johnson    9:00 AM - 5:00 PM
// Thu  03/12  Manjeet Yadav   10:00 AM - 6:00 PM
// Fri  03/13  Mike Chen        8:00 AM - 4:00 PM
// Sat  03/14  Manjeet Yadav   12:00 PM - 6:00 PM

// Manager: David Park
// `.trim();

// function mockParseSchedule(userName: string): OCRParseResult {
//   const nameLower = userName.toLowerCase();
//   const nameFound = MOCK_RAW_TEXT.toLowerCase().includes(nameLower);

//   if (!nameFound) {
//     return { rawText: MOCK_RAW_TEXT, shifts: [], userNameFound: false };
//   }

//   const now = new Date();
//   const baseDate = new Date(now);
//   baseDate.setHours(0, 0, 0, 0);

//   const mockShifts = [
//     { title: "Morning Shift", dayOffset: 1, startHour: 9, endHour: 15 },
//     { title: "Afternoon Shift", dayOffset: 2, startHour: 14, endHour: 20 },
//     { title: "Mid-Day Shift", dayOffset: 4, startHour: 10, endHour: 18 },
//     { title: "Weekend Shift", dayOffset: 6, startHour: 12, endHour: 18 },
//   ];

//   const shifts = mockShifts.map((ms) => {
//     const start = new Date(baseDate);
//     start.setDate(start.getDate() + ms.dayOffset);
//     start.setHours(ms.startHour, 0, 0, 0);

//     const end = new Date(baseDate);
//     end.setDate(end.getDate() + ms.dayOffset);
//     end.setHours(ms.endHour, 0, 0, 0);

//     const dateStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;

//     return {
//       title: ms.title,
//       date: dateStr,
//       startTime: `${String(ms.startHour).padStart(2, "0")}:00`,
//       endTime: `${String(ms.endHour).padStart(2, "0")}:00`,
//       startDateTime: start.toISOString(),
//       endDateTime: end.toISOString(),
//       rawText: `${userName} ${ms.startHour}:00 - ${ms.endHour}:00`,
//     };
//   });

//   return { rawText: MOCK_RAW_TEXT, shifts, userNameFound: true };
// }

// // ─── Public API ─────────────────────────────────────────────────────

// export const ocrService = {
//   /**
//    * Parse a schedule image and extract shifts for the given user.
//    * Calls the backend OCR API which proxies Gemini — no key in the app.
//    * Falls back to demo data if EXPO_PUBLIC_API_URL is not set.
//    */
//   parseScheduleImage: async (
//     imageUri: string,
//     userName: string,
//   ): Promise<OCRParseResult> => {
//     if (API_URL) {
//       return callBackendOCR(imageUri, userName);
//     }
//     // Demo mode — no backend configured
//     await new Promise((r) => setTimeout(r, 1500));
//     return mockParseSchedule(userName);
//   },

//   /**
//    * Convert parsed OCR shifts into full Shift objects ready to be
//    * added to the store.
//    */
//   toShiftObjects: (
//     parsed: OCRParseResult["shifts"],
//     workplaceId: string,
//   ): Shift[] => {
//     const now = new Date().toISOString();
//     return parsed.map((p) => ({
//       id: Crypto.randomUUID(),
//       source: "image_ocr" as const,
//       workplaceId,
//       title: p.title,
//       startDateTime: p.startDateTime,
//       endDateTime: p.endDateTime,
//       rawText: p.originalText ?? "",
//       status: "pending" as const,
//       createdAt: now,
//       updatedAt: now,
//     }));
//   },
// };

/**
 * ─── OCR Service ────────────────────────────────────────────────────
 *
 * Sends the schedule image to the ShiftBuddy backend which calls
 * Gemini Vision on the server side — the API key never reaches the app.
 *
 * REAL MODE  → POST to EXPO_PUBLIC_API_URL/api/ocr/extract
 * MOCK MODE  → Falls back to sample data when no API URL is set
 */

import type { Shift } from "@/types";
import * as Crypto from "expo-crypto";

// Backend URL — set EXPO_PUBLIC_API_URL in .env (e.g. http://192.168.1.x:3000)
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export interface OCRParseResult {
  rawText: string;
  isWorkSchedule?: boolean;
  matchedEmployeeName?: string;
  userNameFound: boolean;
  confidence?: number;
  shifts: {
    id?: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    startDateTime: string;
    endDateTime: string;
    originalText?: string;
    notes?: string;
  }[];
}

// ─── Backend OCR call ────────────────────────────────────────────────

async function callBackendOCR(
  imageUri: string,
  userName: string,
): Promise<OCRParseResult> {
  const fileName = imageUri.split("/").pop() || "schedule.jpg";
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";

  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
  };

  const mimeType = mimeMap[ext] ?? "image/jpeg";

  const formData = new FormData();

  formData.append("image", {
    uri: imageUri,
    name: fileName,
    type: mimeType,
  } as any);

  formData.append("userName", userName);
  formData.append("aliases", JSON.stringify([userName]));
  formData.append("workplaceName", "INC");
  formData.append("preprocess", "true");

  const res = await fetch(`${API_URL}/api/ocr/extract`, {
    method: "POST",
    body: formData,
  });

  const raw = await res.text();
  console.log("OCR status:", res.status);
  console.log("OCR raw response:", raw);

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON response from server: ${raw}`);
  }

  if (!res.ok) {
    const err = data as { error?: string };
    throw new Error(err.error ?? `Server error (${res.status})`);
  }

  return data as OCRParseResult;
}

// ─── Mock Fallback (demo mode when backend URL not set) ────────────

const MOCK_RAW_TEXT = `
WEEKLY SCHEDULE - MARCH 2026
Employee Schedule for International Clothiers

Mon  03/09  Manjeet Yadav    9:00 AM - 3:00 PM
Tue  03/10  Manjeet Yadav    2:00 PM - 8:00 PM
Wed  03/11  Sarah Johnson    9:00 AM - 5:00 PM
Thu  03/12  Manjeet Yadav   10:00 AM - 6:00 PM
Fri  03/13  Mike Chen        8:00 AM - 4:00 PM
Sat  03/14  Manjeet Yadav   12:00 PM - 6:00 PM

Manager: David Park
`.trim();

function mockParseSchedule(userName: string): OCRParseResult {
  const nameLower = userName.toLowerCase();
  const nameFound = MOCK_RAW_TEXT.toLowerCase().includes(nameLower);

  if (!nameFound) {
    return {
      rawText: MOCK_RAW_TEXT,
      shifts: [],
      userNameFound: false,
      isWorkSchedule: true,
      matchedEmployeeName: "",
      confidence: 0,
    };
  }

  const now = new Date();
  const baseDate = new Date(now);
  baseDate.setHours(0, 0, 0, 0);

  const mockShifts = [
    { title: "Morning Shift", dayOffset: 1, startHour: 9, endHour: 15 },
    { title: "Afternoon Shift", dayOffset: 2, startHour: 14, endHour: 20 },
    { title: "Mid-Day Shift", dayOffset: 4, startHour: 10, endHour: 18 },
    { title: "Weekend Shift", dayOffset: 6, startHour: 12, endHour: 18 },
  ];

  const shifts = mockShifts.map((ms) => {
    const start = new Date(baseDate);
    start.setDate(start.getDate() + ms.dayOffset);
    start.setHours(ms.startHour, 0, 0, 0);

    const end = new Date(baseDate);
    end.setDate(end.getDate() + ms.dayOffset);
    end.setHours(ms.endHour, 0, 0, 0);

    const dateStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;

    return {
      title: ms.title,
      date: dateStr,
      startTime: `${String(ms.startHour).padStart(2, "0")}:00`,
      endTime: `${String(ms.endHour).padStart(2, "0")}:00`,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      originalText: `${userName} ${ms.startHour}:00 - ${ms.endHour}:00`,
    };
  });

  return {
    rawText: MOCK_RAW_TEXT,
    shifts,
    userNameFound: true,
    isWorkSchedule: true,
    matchedEmployeeName: userName,
    confidence: 0.75,
  };
}

// ─── Public API ─────────────────────────────────────────────────────

export const ocrService = {
  parseScheduleImage: async (
    imageUri: string,
    userName: string,
  ): Promise<OCRParseResult> => {
    if (API_URL) {
      return callBackendOCR(imageUri, userName);
    }
    await new Promise((r) => setTimeout(r, 1500));
    return mockParseSchedule(userName);
  },

  toShiftObjects: (
    parsed: OCRParseResult["shifts"],
    workplaceId: string,
  ): Shift[] => {
    const now = new Date().toISOString();
    return parsed.map((p) => ({
      id: Crypto.randomUUID(),
      source: "image_ocr" as const,
      workplaceId,
      title: p.title,
      startDateTime: p.startDateTime,
      endDateTime: p.endDateTime,
      rawText: p.originalText ?? "",
      status: "pending" as const,
      createdAt: now,
      updatedAt: now,
    }));
  },
};
