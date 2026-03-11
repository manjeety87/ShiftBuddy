/**
 * ─── Shift Store ────────────────────────────────────────────────────
 *
 * Fully persistent via AsyncStorage. No mock data.
 *
 * Call `hydrate()` once on app startup to load saved data.
 * All mutations persist automatically.
 * Conflict detection runs automatically after every shift change.
 */

import type { Shift, ShiftConflict, UserProfile, Workplace } from "@/types";
import { detectConflicts } from "@/utils/conflicts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

// ─── Storage keys ────────────────────────────────────────────────────
const KEYS = {
  user: "shiftbuddy_user",
  workplaces: "shiftbuddy_workplaces",
  shifts: "shiftbuddy_shifts",
} as const;

async function save<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function load<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

// ─── State interface ─────────────────────────────────────────────────
interface ShiftState {
  user: UserProfile | null;
  workplaces: Workplace[];
  shifts: Shift[];
  conflicts: ShiftConflict[];
  hydrated: boolean;

  // ── Bootstrap ──
  hydrate: () => Promise<void>;

  // ── User ──
  setUser: (user: UserProfile) => void;
  updateUser: (partial: Partial<UserProfile>) => void;

  // ── Shifts ──
  addShift: (shift: Shift) => void;
  updateShift: (id: string, partial: Partial<Shift>) => void;
  removeShift: (id: string) => void;
  cancelShift: (id: string) => void;

  // ── Workplaces ──
  addWorkplace: (wp: Workplace) => void;
  updateWorkplace: (id: string, partial: Partial<Workplace>) => void;
  removeWorkplace: (id: string) => void;

  // ── Conflicts ──
  resolveConflict: (conflictId: string) => void;
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  user: null,
  workplaces: [],
  shifts: [],
  conflicts: [],
  hydrated: false,

  // ── Bootstrap ──────────────────────────────────────────────────

  hydrate: async () => {
    try {
      const [user, workplaces, shifts] = await Promise.all([
        load<UserProfile>(KEYS.user),
        load<Workplace[]>(KEYS.workplaces),
        load<Shift[]>(KEYS.shifts),
      ]);
      const loadedShifts = shifts ?? [];
      set({
        user: user ?? null,
        workplaces: workplaces ?? [],
        shifts: loadedShifts,
        conflicts: detectConflicts(loadedShifts),
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  // ── User ───────────────────────────────────────────────────────

  setUser: (user) => {
    set({ user });
    save(KEYS.user, user).catch(console.warn);
  },

  updateUser: (partial) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...partial };
    set({ user: updated });
    save(KEYS.user, updated).catch(console.warn);
  },

  // ── Shifts ─────────────────────────────────────────────────────

  addShift: (shift) => {
    set((s) => {
      if (s.shifts.some((e) => e.id === shift.id)) return s; // dedup guard
      const updated = [...s.shifts, shift];
      save(KEYS.shifts, updated).catch(console.warn);
      return { shifts: updated, conflicts: detectConflicts(updated) };
    });
  },

  updateShift: (id, partial) => {
    set((s) => {
      const updated = s.shifts.map((sh) =>
        sh.id === id
          ? { ...sh, ...partial, updatedAt: new Date().toISOString() }
          : sh,
      );
      save(KEYS.shifts, updated).catch(console.warn);
      return { shifts: updated, conflicts: detectConflicts(updated) };
    });
  },

  removeShift: (id) => {
    set((s) => {
      const updated = s.shifts.filter((sh) => sh.id !== id);
      save(KEYS.shifts, updated).catch(console.warn);
      return { shifts: updated, conflicts: detectConflicts(updated) };
    });
  },

  cancelShift: (id) => {
    set((s) => {
      const updated = s.shifts.map((sh) =>
        sh.id === id
          ? {
              ...sh,
              status: "cancelled" as const,
              updatedAt: new Date().toISOString(),
            }
          : sh,
      );
      save(KEYS.shifts, updated).catch(console.warn);
      return { shifts: updated, conflicts: detectConflicts(updated) };
    });
  },

  // ── Workplaces ─────────────────────────────────────────────────

  addWorkplace: (wp) => {
    set((s) => {
      const updated = [...s.workplaces, wp];
      save(KEYS.workplaces, updated).catch(console.warn);
      return { workplaces: updated };
    });
  },

  updateWorkplace: (id, partial) => {
    set((s) => {
      const updated = s.workplaces.map((w) =>
        w.id === id
          ? { ...w, ...partial, updatedAt: new Date().toISOString() }
          : w,
      );
      save(KEYS.workplaces, updated).catch(console.warn);
      return { workplaces: updated };
    });
  },

  removeWorkplace: (id) => {
    set((s) => {
      const updated = s.workplaces.filter((w) => w.id !== id);
      save(KEYS.workplaces, updated).catch(console.warn);
      return { workplaces: updated };
    });
  },

  // ── Conflicts ──────────────────────────────────────────────────

  resolveConflict: (conflictId) => {
    set((s) => ({
      conflicts: s.conflicts.map((c) =>
        c.id === conflictId ? { ...c, resolved: true } : c,
      ),
    }));
  },
}));
