/**
 * ─── Conflict Detection ─────────────────────────────────────────────
 *
 * Detects overlapping shifts across all workplaces and returns
 * ShiftConflict objects for any pair that overlaps.
 */

import type { Shift, ShiftConflict } from "@/types";
import * as Crypto from "expo-crypto";

/**
 * Returns how many minutes two shifts overlap (0 if they don't).
 */
export function overlapMinutes(a: Shift, b: Shift): number {
  const aStart = new Date(a.startDateTime).getTime();
  const aEnd = new Date(a.endDateTime).getTime();
  const bStart = new Date(b.startDateTime).getTime();
  const bEnd = new Date(b.endDateTime).getTime();

  const overlapStart = Math.max(aStart, bStart);
  const overlapEnd = Math.min(aEnd, bEnd);

  if (overlapEnd <= overlapStart) return 0;
  return Math.round((overlapEnd - overlapStart) / 60_000);
}

/**
 * Given a list of shifts, returns all conflicting pairs.
 * Only considers non-cancelled shifts.
 */
export function detectConflicts(shifts: Shift[]): ShiftConflict[] {
  const active = shifts.filter((s) => s.status !== "cancelled");
  const conflicts: ShiftConflict[] = [];

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const minutes = overlapMinutes(active[i], active[j]);
      if (minutes > 0) {
        conflicts.push({
          id: Crypto.randomUUID(),
          shiftAId: active[i].id,
          shiftBId: active[j].id,
          overlapMinutes: minutes,
          resolved: false,
        });
      }
    }
  }

  return conflicts;
}
