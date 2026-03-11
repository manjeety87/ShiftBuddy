/**
 * ─── ShiftBuddy API Service ─────────────────────────────────────────
 *
 * Database-ready service layer. All CRUD operations are routed through
 * this module.
 *
 * LOCAL MODE  — when BASE_URL is empty, every method resolves instantly
 *               and the Zustand store manages state in-memory.
 *
 * REMOTE MODE — set BASE_URL to your backend (e.g. "https://api.shiftbuddy.com")
 *               and every method will make a real HTTP request. The
 *               Zustand store still applies optimistic local updates for
 *               instant UI feedback; the API call happens in the
 *               background and can roll back on failure.
 *
 * To switch to a real database:
 *   1. Set BASE_URL below (or read from env / config)
 *   2. Ensure your backend implements the REST endpoints listed here
 *   3. Optionally add auth headers in `request()`
 */

import type { Shift, ShiftConflict, UserProfile, Workplace } from "@/types";

// ━━━ Configuration ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 🔧 REPLACE THIS with your real backend URL to enable remote mode.
 * Leave empty for local-only (in-memory) operation.
 *
 * Examples:
 *   ""                                → local mode
 *   "http://localhost:3001/api"       → local dev server
 *   "https://api.shiftbuddy.com/v1"  → production
 */
export const BASE_URL = "";

/**
 * Optional auth token. When set, it's sent as a Bearer token
 * on every request.
 */
let authToken = "";
export const setAuthToken = (token: string) => {
  authToken = token;
};

// ━━━ Helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** True when a real backend is configured. */
export const isRemoteMode = () => BASE_URL.length > 0;

/**
 * Generic fetch wrapper with error handling, auth, and JSON parsing.
 */
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };

  const res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${res.statusText} – ${body}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ━━━ API Methods ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Every method returns a Promise so callers use the same async pattern
// regardless of local vs remote mode.
//
// In LOCAL mode the promise resolves instantly (the actual state change
// happens in the Zustand store before calling these).
//
// In REMOTE mode the promise resolves after the server confirms.

export const api = {
  // ── Shifts ──────────────────────────────────────────────────────

  shifts: {
    /** GET /shifts */
    getAll: async (): Promise<Shift[]> => {
      if (!isRemoteMode()) return []; // handled locally
      return request<Shift[]>("/shifts");
    },

    /** GET /shifts/:id */
    getById: async (id: string): Promise<Shift | null> => {
      if (!isRemoteMode()) return null;
      return request<Shift>(`/shifts/${id}`);
    },

    /** POST /shifts */
    create: async (shift: Shift): Promise<Shift> => {
      if (!isRemoteMode()) return shift; // local store handles it
      return request<Shift>("/shifts", {
        method: "POST",
        body: JSON.stringify(shift),
      });
    },

    /** PATCH /shifts/:id */
    update: async (id: string, partial: Partial<Shift>): Promise<Shift> => {
      if (!isRemoteMode()) return { id, ...partial } as Shift;
      return request<Shift>(`/shifts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(partial),
      });
    },

    /** DELETE /shifts/:id */
    remove: async (id: string): Promise<void> => {
      if (!isRemoteMode()) return;
      return request<void>(`/shifts/${id}`, { method: "DELETE" });
    },

    /**
     * POST /shifts/:id/cancel
     * Marks a shift as "cancelled" (does NOT delete it from the DB).
     */
    cancel: async (id: string): Promise<Shift> => {
      if (!isRemoteMode()) return { id, status: "cancelled" } as Shift;
      return request<Shift>(`/shifts/${id}/cancel`, { method: "POST" });
    },
  },

  // ── Workplaces ──────────────────────────────────────────────────

  workplaces: {
    /** GET /workplaces */
    getAll: async (): Promise<Workplace[]> => {
      if (!isRemoteMode()) return [];
      return request<Workplace[]>("/workplaces");
    },

    /** POST /workplaces */
    create: async (wp: Workplace): Promise<Workplace> => {
      if (!isRemoteMode()) return wp;
      return request<Workplace>("/workplaces", {
        method: "POST",
        body: JSON.stringify(wp),
      });
    },

    /** PATCH /workplaces/:id */
    update: async (
      id: string,
      partial: Partial<Workplace>,
    ): Promise<Workplace> => {
      if (!isRemoteMode()) return { id, ...partial } as Workplace;
      return request<Workplace>(`/workplaces/${id}`, {
        method: "PATCH",
        body: JSON.stringify(partial),
      });
    },

    /** DELETE /workplaces/:id */
    remove: async (id: string): Promise<void> => {
      if (!isRemoteMode()) return;
      return request<void>(`/workplaces/${id}`, { method: "DELETE" });
    },
  },

  // ── Conflicts ───────────────────────────────────────────────────

  conflicts: {
    /** GET /conflicts */
    getAll: async (): Promise<ShiftConflict[]> => {
      if (!isRemoteMode()) return [];
      return request<ShiftConflict[]>("/conflicts");
    },

    /**
     * POST /conflicts/:id/resolve
     * Marks a conflict as resolved on the server.
     */
    resolve: async (id: string): Promise<ShiftConflict> => {
      if (!isRemoteMode()) return { id, resolved: true } as ShiftConflict;
      return request<ShiftConflict>(`/conflicts/${id}/resolve`, {
        method: "POST",
      });
    },
  },

  // ── User / Auth ─────────────────────────────────────────────────

  user: {
    /** GET /user/me */
    getProfile: async (): Promise<UserProfile | null> => {
      if (!isRemoteMode()) return null;
      return request<UserProfile>("/user/me");
    },

    /** PATCH /user/me */
    updateProfile: async (
      partial: Partial<UserProfile>,
    ): Promise<UserProfile> => {
      if (!isRemoteMode()) return partial as UserProfile;
      return request<UserProfile>("/user/me", {
        method: "PATCH",
        body: JSON.stringify(partial),
      });
    },
  },
};
