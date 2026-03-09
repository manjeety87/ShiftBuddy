import type { Shift, ShiftConflict, UserProfile, Workplace } from "@/types";

// ─── Helpers ────────────────────────────────────────────────────────
const now = new Date();
const iso = (d: Date) => d.toISOString();
const addHours = (d: Date, h: number) => new Date(d.getTime() + h * 3_600_000);
const addDays = (d: Date, days: number) =>
  new Date(d.getTime() + days * 86_400_000);
const today = (h: number, m = 0) => {
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d;
};

// ─── User ───────────────────────────────────────────────────────────
export const mockUser: UserProfile = {
  id: "u1",
  name: "Alex Johnson",
  email: "alex@example.com",
  avatarUrl: undefined,
  createdAt: iso(addDays(now, -90)),
};

// ─── Workplaces ─────────────────────────────────────────────────────
export const mockWorkplaces: Workplace[] = [
  {
    id: "wp1",
    name: "Blue Bottle Coffee",
    color: "#3B82F6",
    icon: "cafe",
    address: "123 Main St",
    hourlyRate: 18.5,
    notes: "Morning shifts preferred",
    createdAt: iso(addDays(now, -60)),
    updatedAt: iso(addDays(now, -2)),
  },
  {
    id: "wp2",
    name: "TechCorp Inc.",
    color: "#8B5CF6",
    icon: "briefcase",
    address: "456 Innovation Blvd",
    hourlyRate: 32.0,
    notes: "Remote on Fridays",
    createdAt: iso(addDays(now, -45)),
    updatedAt: iso(addDays(now, -1)),
  },
  {
    id: "wp3",
    name: "FreshMart Grocery",
    color: "#22C55E",
    icon: "cart",
    address: "789 Oak Ave",
    hourlyRate: 16.0,
    notes: "Weekend availability",
    createdAt: iso(addDays(now, -30)),
    updatedAt: iso(addDays(now, -3)),
  },
];

// ─── Shifts ─────────────────────────────────────────────────────────
export const mockShifts: Shift[] = [
  // Today
  {
    id: "s1",
    source: "manual",
    workplaceId: "wp1",
    title: "Morning Barista",
    startDateTime: iso(today(7)),
    endDateTime: iso(today(12)),
    notes: "Open shift",
    status: "confirmed",
    createdAt: iso(addDays(now, -5)),
    updatedAt: iso(addDays(now, -5)),
  },
  {
    id: "s2",
    source: "manual",
    workplaceId: "wp2",
    title: "Dev Sprint",
    startDateTime: iso(today(13)),
    endDateTime: iso(today(18)),
    notes: "Feature work",
    status: "confirmed",
    createdAt: iso(addDays(now, -3)),
    updatedAt: iso(addDays(now, -3)),
  },
  // Tomorrow
  {
    id: "s3",
    source: "manual",
    workplaceId: "wp3",
    title: "Stocking Shift",
    startDateTime: iso(addHours(today(6), 24)),
    endDateTime: iso(addHours(today(11), 24)),
    status: "confirmed",
    createdAt: iso(addDays(now, -2)),
    updatedAt: iso(addDays(now, -2)),
  },
  {
    id: "s4",
    source: "google_calendar",
    workplaceId: "wp2",
    title: "Architecture Review",
    startDateTime: iso(addHours(today(14), 24)),
    endDateTime: iso(addHours(today(17), 24)),
    status: "confirmed",
    externalEventId: "gcal_abc123",
    createdAt: iso(addDays(now, -1)),
    updatedAt: iso(addDays(now, -1)),
  },
  // Day after tomorrow — conflict!
  {
    id: "s5",
    source: "manual",
    workplaceId: "wp1",
    title: "Afternoon Barista",
    startDateTime: iso(addHours(today(14), 48)),
    endDateTime: iso(addHours(today(19), 48)),
    status: "confirmed",
    createdAt: iso(addDays(now, -1)),
    updatedAt: iso(addDays(now, -1)),
  },
  {
    id: "s6",
    source: "image_ocr",
    workplaceId: "wp2",
    title: "Sprint Planning",
    startDateTime: iso(addHours(today(16), 48)),
    endDateTime: iso(addHours(today(20), 48)),
    rawText: "Sprint Planning 4pm - 8pm",
    status: "pending",
    createdAt: iso(now),
    updatedAt: iso(now),
  },
  // Next week
  {
    id: "s7",
    source: "manual",
    workplaceId: "wp3",
    title: "Weekend Cashier",
    startDateTime: iso(addHours(today(9), 96)),
    endDateTime: iso(addHours(today(15), 96)),
    status: "confirmed",
    createdAt: iso(addDays(now, -1)),
    updatedAt: iso(addDays(now, -1)),
  },
  {
    id: "s8",
    source: "manual",
    workplaceId: "wp1",
    title: "Closing Shift",
    startDateTime: iso(addHours(today(16), 120)),
    endDateTime: iso(addHours(today(22), 120)),
    status: "confirmed",
    createdAt: iso(addDays(now, -1)),
    updatedAt: iso(addDays(now, -1)),
  },
];

// ─── Conflicts ──────────────────────────────────────────────────────
export const mockConflicts: ShiftConflict[] = [
  {
    id: "c1",
    shiftAId: "s5",
    shiftBId: "s6",
    overlapMinutes: 180,
    resolved: false,
  },
];
