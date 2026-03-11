/**
 * data/mock.ts — Empty defaults only. No fake data.
 * The app is fully persistence-driven (AsyncStorage).
 */
import type { Shift, ShiftConflict, UserProfile, Workplace } from "@/types";

export const mockUser: UserProfile | null = null;
export const mockWorkplaces: Workplace[] = [];
export const mockShifts: Shift[] = [];
export const mockConflicts: ShiftConflict[] = [];
