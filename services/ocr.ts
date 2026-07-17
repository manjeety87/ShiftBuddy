import type { Shift } from "@/types";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

function resolveApiUrl(): string {
  const web = process.env.EXPO_PUBLIC_API_URL_WEB;
  const device = process.env.EXPO_PUBLIC_API_URL_DEVICE;
  const fallback = process.env.EXPO_PUBLIC_API_URL ?? "";

  const raw = Platform.OS === "web" ? (web ?? fallback) : (device ?? fallback);

  return raw.trim().replace(/\/$/, "");
}

const API_URL = resolveApiUrl();

/** Simple fetch timeout so a device that can't reach the backend fails
 * fast with a clear message instead of hanging for ~60-75s (which on
 * Android looks exactly like "Scan Schedule doesn't work"). */
async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs = 60000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export type ScheduleMode = "auto" | "personal_schedule" | "team_schedule";

export interface OCRRequestOptions {
  scheduleMode: ScheduleMode;
  workplaceName?: string;
  aliases?: string[];
}

export interface OCRParseResult {
  rawText: string;
  isWorkSchedule: boolean;
  scheduleType: "personal_schedule" | "team_schedule" | "unknown";
  extractionModeUsed: ScheduleMode;

  userNameFound: boolean;
  matchedEmployeeName: string;
  assumedPersonalSchedule: boolean;
  needsReview: boolean;
  confidence: number;

  detectedWorkplaceName?: string;

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
  options: OCRRequestOptions,
): Promise<OCRParseResult> {
  // if (!API_URL) {
  //   throw new Error("OCR API URL is not configured.");
  // }

  if (!imageUri) {
    throw new Error("Image URI is missing.");
  }

  const formData = new FormData();

  if (Platform.OS === "web") {
    const imageResponse = await fetch(imageUri);

    if (!imageResponse.ok) {
      throw new Error(
        `Could not read the selected image (${imageResponse.status}).`,
      );
    }

    const imageBlob = await imageResponse.blob();
    const mimeType = imageBlob.type || "image/jpeg";

    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/heic": "heic",
      "image/heif": "heif",
    };

    const extension = extensionMap[mimeType] ?? "jpg";

    const fileName = `schedule-${Date.now()}.${extension}`;

    formData.append("image", imageBlob, fileName);
  } else {
    const fileName =
      imageUri.split("/").pop()?.split("?")[0] ?? `schedule-${Date.now()}.jpg`;

    const extension = fileName.split(".").pop()?.toLowerCase() ?? "jpg";

    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      heic: "image/heic",
      heif: "image/heif",
    };

    const mimeType = mimeMap[extension] ?? "image/jpeg";

    formData.append("image", {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);
  }

  /*
   * Append shared fields exactly once.
   */
  formData.append("userName", userName.trim());

  formData.append("aliases", JSON.stringify(options.aliases ?? []));

  formData.append("scheduleMode", options.scheduleMode);

  formData.append("workplaceName", options.workplaceName ?? "");

  formData.append("preprocess", "true");

  console.log("OCR URL:", `${API_URL}/api/ocr/extract`);
  console.log("OCR platform:", Platform.OS);
  console.log("OCR schedule mode:", options.scheduleMode);

  if (!API_URL) {
    throw new Error(
      "OCR server URL is not configured for this platform. Set EXPO_PUBLIC_API_URL_DEVICE (or EXPO_PUBLIC_API_URL) in .env.",
    );
  }

  let response: Response;

  try {
    response = await fetchWithTimeout(`${API_URL}/api/ocr/extract`, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    console.error("OCR network error:", error);

    const isAbort = error instanceof Error && error.name === "AbortError";

    throw new Error(
      isAbort
        ? `Timed out reaching the OCR server at ${API_URL}.`
        : `Could not connect to the OCR server at ${API_URL}. Check that the backend is running and reachable from this device.`,
    );
  }

  const responseText = await response.text();

  console.log("OCR status:", response.status);
  console.log("OCR response:", responseText);

  let responseData: unknown;

  try {
    responseData = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Backend returned invalid JSON (${response.status}): ${responseText}`,
    );
  }

  if (!response.ok) {
    const errorData = responseData as {
      error?: string;
      details?: string;
    };

    throw new Error(
      errorData.error ??
        errorData.details ??
        `OCR server error (${response.status})`,
    );
  }

  const data = responseData as Partial<OCRParseResult>;

  return {
    rawText: data.rawText ?? "",
    isWorkSchedule: data.isWorkSchedule ?? true,

    scheduleType:
      data.scheduleType ?? (data.userNameFound ? "team_schedule" : "unknown"),

    extractionModeUsed: data.extractionModeUsed ?? options.scheduleMode,

    userNameFound: data.userNameFound ?? false,

    matchedEmployeeName: data.matchedEmployeeName ?? "",

    assumedPersonalSchedule: data.assumedPersonalSchedule ?? false,

    needsReview: data.needsReview ?? !data.userNameFound,

    confidence: data.confidence ?? 0,

    detectedWorkplaceName: data.detectedWorkplaceName ?? "",

    shifts: Array.isArray(data.shifts) ? data.shifts : [],
  };
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
      isWorkSchedule: true,
      scheduleType: "team_schedule",
      extractionModeUsed: "team_schedule",
      userNameFound: false,
      matchedEmployeeName: "",
      assumedPersonalSchedule: false,
      needsReview: false,
      confidence: 0,
      detectedWorkplaceName: "",
      shifts: [],
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
    isWorkSchedule: true,
    scheduleType: "team_schedule",
    extractionModeUsed: "team_schedule",
    userNameFound: true,
    matchedEmployeeName: userName,
    assumedPersonalSchedule: false,
    needsReview: false,
    confidence: 0.75,
    detectedWorkplaceName: "BoatHouse",
    shifts,
  };
}

// ─── Public API ─────────────────────────────────────────────────────

const USE_MOCK_OCR = process.env.EXPO_PUBLIC_USE_MOCK_OCR === "true";

export const ocrService = {
  parseScheduleImage: async (
    imageUri: string,
    userName: string,
    options?: Partial<OCRRequestOptions>,
  ): Promise<OCRParseResult> => {
    if (USE_MOCK_OCR) {
      return mockParseSchedule(userName);
    }

    // if (!API_URL) {
    //   throw new Error("OCR API URL is not configured.");
    // }

    const normalizedOptions: OCRRequestOptions = {
      scheduleMode: options?.scheduleMode ?? "auto",
      workplaceName: options?.workplaceName ?? "",
      aliases: options?.aliases ?? [],
    };

    return callBackendOCR(imageUri, userName, normalizedOptions);
  },

  toShiftObjects: (
    parsed: OCRParseResult["shifts"],
    options: {
      workplaceId?: string | null;
      associationType?: "workplace" | "temporary" | "unassigned";
      temporaryWorkplaceName?: string;
    },
  ): Shift[] => {
    const now = new Date().toISOString();

    if (!Array.isArray(parsed)) {
      console.error("toShiftObjects received invalid shifts:", parsed);
      return [];
    }

    return parsed
      .filter((item) => {
        return Boolean(item && item.startDateTime && item.endDateTime);
      })
      .map((item) => ({
        id: Crypto.randomUUID(),
        source: "image_ocr" as const,

        workplaceId: options.workplaceId ?? null,

        associationType: options.associationType ?? "unassigned",

        temporaryWorkplaceName:
          options.associationType === "temporary"
            ? options.temporaryWorkplaceName?.trim() || undefined
            : undefined,

        title: item.title?.trim() || "Shift",

        startDateTime: item.startDateTime,
        endDateTime: item.endDateTime,

        notes: item.notes?.trim() || undefined,

        rawText:
          item.originalText?.trim() ||
          `${item.date ?? ""} ${item.startTime ?? ""}-${item.endTime ?? ""}`.trim(),

        status: "pending" as const,
        createdAt: now,
        updatedAt: now,
      }));
  },
};
