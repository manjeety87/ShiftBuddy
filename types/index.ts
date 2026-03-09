// ─── ShiftBuddy Core Types ──────────────────────────────────────────

/** Shift data source */
export type ShiftSource = "manual" | "image_ocr" | "google_calendar";

/** Shift status */
export type ShiftStatus = "confirmed" | "pending" | "cancelled";

/** A single work shift */
export interface Shift {
  id: string;
  source: ShiftSource;
  workplaceId: string;
  title: string;
  startDateTime: string; // ISO 8601
  endDateTime: string; // ISO 8601
  notes?: string;
  rawText?: string; // OCR original text
  externalEventId?: string; // Google Calendar event id
  status: ShiftStatus;
  createdAt: string;
  updatedAt: string;
}

/** User profile */
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
}

/** A workplace / employer */
export interface Workplace {
  id: string;
  name: string;
  color: string; // hex colour used in calendar chips
  icon?: string; // SF symbol or MaterialIcon name
  address?: string;
  hourlyRate?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** A detected conflict between two shifts */
export interface ShiftConflict {
  id: string;
  shiftAId: string;
  shiftBId: string;
  overlapMinutes: number;
  resolved: boolean;
}

/** OCR processing result (placeholder) */
export interface OCRResult {
  id: string;
  imageUri: string;
  rawText: string;
  parsedShifts: Partial<Shift>[];
  status: "pending" | "reviewed" | "confirmed";
  createdAt: string;
}

/** Calendar import source (placeholder) */
export interface CalendarImportSource {
  id: string;
  provider: "google" | "apple" | "outlook";
  accountEmail: string;
  calendarId: string;
  lastSyncAt?: string;
  enabled: boolean;
}

// ─── Theme Types ────────────────────────────────────────────────────

export type ThemeCategory = "standard" | "developer" | "premium" | "fun";

export interface ThemeTokens {
  background: string;
  surface: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  border: string;
  shadow: string;
  overlay: string;
  blurTint: "light" | "dark" | "default";
  glassOpacity: number; // 0..1  (0 = fully transparent glass card)
  radiusScale: number; // multiplier on default radii
  gradientStart: string; // primary gradient colour
  gradientEnd: string; // secondary gradient colour
  highlight: string; // subtle highlight / selection tint
  muted: string; // muted / disabled element colour
}

export interface AppTheme {
  id: string;
  name: string;
  category: ThemeCategory;
  tokens: ThemeTokens;
  isPremium: boolean; // for future paywall
}
