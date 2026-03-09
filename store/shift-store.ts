import {
    mockConflicts,
    mockShifts,
    mockUser,
    mockWorkplaces,
} from "@/data/mock";
import type { Shift, ShiftConflict, UserProfile, Workplace } from "@/types";
import { create } from "zustand";

interface ShiftState {
  user: UserProfile;
  workplaces: Workplace[];
  shifts: Shift[];
  conflicts: ShiftConflict[];
  // ── Actions ──
  addShift: (shift: Shift) => void;
  updateShift: (id: string, partial: Partial<Shift>) => void;
  removeShift: (id: string) => void;
  addWorkplace: (wp: Workplace) => void;
  updateWorkplace: (id: string, partial: Partial<Workplace>) => void;
  removeWorkplace: (id: string) => void;
  setConflicts: (conflicts: ShiftConflict[]) => void;
}

export const useShiftStore = create<ShiftState>((set) => ({
  user: mockUser,
  workplaces: mockWorkplaces,
  shifts: mockShifts,
  conflicts: mockConflicts,

  addShift: (shift) => set((s) => ({ shifts: [...s.shifts, shift] })),

  updateShift: (id, partial) =>
    set((s) => ({
      shifts: s.shifts.map((sh) =>
        sh.id === id
          ? { ...sh, ...partial, updatedAt: new Date().toISOString() }
          : sh,
      ),
    })),

  removeShift: (id) =>
    set((s) => ({ shifts: s.shifts.filter((sh) => sh.id !== id) })),

  addWorkplace: (wp) => set((s) => ({ workplaces: [...s.workplaces, wp] })),

  updateWorkplace: (id, partial) =>
    set((s) => ({
      workplaces: s.workplaces.map((w) =>
        w.id === id
          ? { ...w, ...partial, updatedAt: new Date().toISOString() }
          : w,
      ),
    })),

  removeWorkplace: (id) =>
    set((s) => ({ workplaces: s.workplaces.filter((w) => w.id !== id) })),

  setConflicts: (conflicts) => set({ conflicts }),
}));
