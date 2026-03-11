import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AnimatedPress } from "@/components/ui/animated-press";
import { AppBadge } from "@/components/ui/app-badge";
import { AppCard } from "@/components/ui/app-card";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { FadeInView } from "@/components/ui/fade-in-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useShiftStore } from "@/store";
import type { Shift } from "@/types";

// ─── Date helpers ───────────────────────────────────────────────────
const DAY_MS = 86_400_000;
type ViewMode = "week" | "month";

const startOfWeek = (d: Date): Date => {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  return copy;
};

const startOfMonth = (d: Date): Date => {
  const copy = new Date(d);
  copy.setDate(1);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const daysInMonth = (d: Date): number =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const shiftDur = (s: Shift) =>
  (
    (new Date(s.endDateTime).getTime() - new Date(s.startDateTime).getTime()) /
    3_600_000
  ).toFixed(1);

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Component ──────────────────────────────────────────────────────
export default function CalendarScreen() {
  const { colors } = useAppTheme();
  const shifts = useShiftStore((s) => s.shifts);
  const workplaces = useShiftStore((s) => s.workplaces);
  const conflicts = useShiftStore((s) => s.conflicts);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(today);

  // ── Week view data ──
  const weekDays = useMemo(() => {
    const start = startOfWeek(today);
    start.setDate(start.getDate() + weekOffset * 7);
    return Array.from(
      { length: 7 },
      (_, i) => new Date(start.getTime() + i * DAY_MS),
    );
  }, [today, weekOffset]);

  // ── Month view data ──
  const monthData = useMemo(() => {
    const ref = new Date(today);
    ref.setMonth(ref.getMonth() + monthOffset);
    const first = startOfMonth(ref);
    const totalDays = daysInMonth(ref);
    const startDay = first.getDay();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(ref.getFullYear(), ref.getMonth(), i);
      cells.push(d);
    }
    while (cells.length % 7 !== 0) cells.push(null);

    return { first, cells, ref };
  }, [today, monthOffset]);

  const weekLabel = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[6];
    if (first.getMonth() === last.getMonth()) {
      return first.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
    }
    return `${first.toLocaleDateString(undefined, { month: "short" })} – ${last.toLocaleDateString(undefined, { month: "short", year: "numeric" })}`;
  }, [weekDays]);

  const monthLabel = useMemo(
    () =>
      monthData.ref.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [monthData],
  );

  // Shift lookup map
  const shiftDateMap = useMemo(() => {
    const map = new Map<string, Shift[]>();
    for (const s of shifts) {
      if (s.status === "cancelled") continue;
      const key = new Date(s.startDateTime).toDateString();
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    return map;
  }, [shifts]);

  // Shifts for selected day
  const dayShifts = useMemo(
    () =>
      (shiftDateMap.get(selectedDate.toDateString()) ?? []).sort(
        (a, b) =>
          new Date(a.startDateTime).getTime() -
          new Date(b.startDateTime).getTime(),
      ),
    [selectedDate, shiftDateMap],
  );

  const dayTotalHrs = dayShifts.reduce(
    (acc, s) =>
      acc +
      (new Date(s.endDateTime).getTime() -
        new Date(s.startDateTime).getTime()) /
        3_600_000,
    0,
  );

  // Conflicts for selected day
  const dayConflictShiftIds = useMemo(() => {
    const ids = new Set<string>();
    const dayIds = new Set(dayShifts.map((s) => s.id));
    for (const c of conflicts) {
      if (!c.resolved && (dayIds.has(c.shiftAId) || dayIds.has(c.shiftBId))) {
        ids.add(c.shiftAId);
        ids.add(c.shiftBId);
      }
    }
    return ids;
  }, [dayShifts, conflicts]);

  const goToday = useCallback(() => {
    setWeekOffset(0);
    setMonthOffset(0);
    setSelectedDate(today);
  }, [today]);

  const navigateBack = () => {
    if (viewMode === "week") setWeekOffset((o) => o - 1);
    else setMonthOffset((o) => o - 1);
  };

  const navigateForward = () => {
    if (viewMode === "week") setWeekOffset((o) => o + 1);
    else setMonthOffset((o) => o + 1);
  };

  const now = new Date();
  const isOffToday = viewMode === "week" ? weekOffset !== 0 : monthOffset !== 0;

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ━━ Header ━━ */}
        <View style={styles.headerRow}>
          <AppText variant="largeTitle">Calendar</AppText>
          <View style={styles.headerRight}>
            {isOffToday && (
              <Pressable
                onPress={goToday}
                style={({ pressed }) => [
                  styles.todayBtn,
                  {
                    backgroundColor: colors.accent + "18",
                    borderColor: colors.accent + "44",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <AppText variant="captionBold" color={colors.accent}>
                  Today
                </AppText>
              </Pressable>
            )}
            <Pressable
              onPress={() => router.push("/add-shift")}
              style={({ pressed }) => [
                styles.addBtn,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <IconSymbol name="plus" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* ━━ View Mode Toggle ━━ */}
        <View style={[styles.toggleRow, { backgroundColor: colors.surface }]}>
          {(["week", "month"] as ViewMode[]).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setViewMode(mode)}
              style={[
                styles.toggleBtn,
                viewMode === mode && {
                  backgroundColor: colors.accent,
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                },
              ]}
            >
              <AppText
                variant="captionBold"
                color={viewMode === mode ? "#fff" : colors.textSecondary}
              >
                {mode === "week" ? "Week" : "Month"}
              </AppText>
            </Pressable>
          ))}
        </View>

        {/* ━━ Navigation ━━ */}
        <View style={styles.weekNav}>
          <Pressable onPress={navigateBack} hitSlop={12}>
            <IconSymbol
              name="chevron.left"
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>
          <AppText variant="bodyBold" style={styles.flex1} center>
            {viewMode === "week" ? weekLabel : monthLabel}
          </AppText>
          <Pressable onPress={navigateForward} hitSlop={12}>
            <IconSymbol
              name="chevron.right"
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        {/* ━━ WEEK VIEW ━━ */}
        {viewMode === "week" && (
          <View style={styles.dayStrip}>
            {weekDays.map((d) => {
              const isToday = isSameDay(d, today);
              const isSelected = isSameDay(d, selectedDate);
              const shiftCount =
                shiftDateMap.get(d.toDateString())?.length ?? 0;
              const isPast = d < today && !isToday;

              return (
                <Pressable
                  key={d.toISOString()}
                  onPress={() => setSelectedDate(d)}
                  style={({ pressed }) => [
                    styles.dayCell,
                    isSelected && {
                      backgroundColor: colors.accent,
                      borderRadius: 14,
                    },
                    pressed && !isSelected && { opacity: 0.6 },
                  ]}
                >
                  <AppText
                    variant="label"
                    color={
                      isSelected
                        ? "#fff"
                        : isPast
                          ? colors.textSecondary + "88"
                          : colors.textSecondary
                    }
                  >
                    {d.toLocaleDateString(undefined, { weekday: "narrow" })}
                  </AppText>
                  <AppText
                    variant="bodyBold"
                    color={
                      isSelected
                        ? "#fff"
                        : isToday
                          ? colors.accent
                          : isPast
                            ? colors.textSecondary + "88"
                            : colors.textPrimary
                    }
                  >
                    {d.getDate()}
                  </AppText>
                  <View
                    style={[
                      styles.shiftDot,
                      {
                        backgroundColor:
                          shiftCount > 0
                            ? isSelected
                              ? "#fff"
                              : colors.accent
                            : "transparent",
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ━━ MONTH VIEW ━━ */}
        {viewMode === "month" && (
          <View style={styles.monthGrid}>
            {/* Weekday header */}
            <View style={styles.monthWeekHeader}>
              {WEEKDAY_NAMES.map((name) => (
                <View key={name} style={styles.monthHeaderCell}>
                  <AppText variant="label" color={colors.textSecondary} center>
                    {name}
                  </AppText>
                </View>
              ))}
            </View>
            {/* Day cells */}
            <View style={styles.monthCells}>
              {monthData.cells.map((d, idx) => {
                if (!d) {
                  return <View key={`empty-${idx}`} style={styles.monthCell} />;
                }
                const isToday = isSameDay(d, today);
                const isSelected = isSameDay(d, selectedDate);
                const dayShiftsHere = shiftDateMap.get(d.toDateString());
                const isPast = d < today && !isToday;

                // Get unique workplace colors for this day
                const shiftColors = (dayShiftsHere ?? [])
                  .map(
                    (s) =>
                      workplaces.find((w) => w.id === s.workplaceId)?.color,
                  )
                  .filter((c): c is string => !!c)
                  .filter((c, i, a) => a.indexOf(c) === i)
                  .slice(0, 3);

                return (
                  <Pressable
                    key={d.toISOString()}
                    onPress={() => setSelectedDate(d)}
                    style={[
                      styles.monthCell,
                      isSelected && {
                        backgroundColor: colors.accent,
                        borderRadius: 10,
                      },
                      isToday &&
                        !isSelected && {
                          borderWidth: 1.5,
                          borderColor: colors.accent,
                          borderRadius: 10,
                        },
                    ]}
                  >
                    <AppText
                      variant={
                        isToday || isSelected ? "captionBold" : "caption"
                      }
                      color={
                        isSelected
                          ? "#fff"
                          : isToday
                            ? colors.accent
                            : isPast
                              ? colors.textSecondary + "77"
                              : colors.textPrimary
                      }
                    >
                      {d.getDate()}
                    </AppText>
                    {shiftColors.length > 0 && (
                      <View style={styles.monthDotRow}>
                        {shiftColors.map((c, i) => (
                          <View
                            key={i}
                            style={[
                              styles.monthDot,
                              {
                                backgroundColor: isSelected ? "#fff" : c,
                              },
                            ]}
                          />
                        ))}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ━━ Selected Day Summary ━━ */}
        <FadeInView delay={0} duration={300}>
          <View style={styles.daySummary}>
            <View style={styles.flex1}>
              <AppText variant="subheading">
                {isSameDay(selectedDate, today)
                  ? "Today"
                  : selectedDate.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
              </AppText>
            </View>
            {dayShifts.length > 0 && (
              <AppBadge
                label={`${dayShifts.length} shift${dayShifts.length !== 1 ? "s" : ""} · ${dayTotalHrs.toFixed(1)}h`}
                variant="accent"
              />
            )}
          </View>
        </FadeInView>

        {/* ━━ Shift Cards ━━ */}
        {dayShifts.length === 0 ? (
          <AppCard style={styles.emptyCard}>
            <View style={styles.emptyInner}>
              <IconSymbol
                name="calendar"
                size={36}
                color={colors.textSecondary + "66"}
              />
              <AppText variant="heading" center>
                No shifts
              </AppText>
              <AppText variant="body" color={colors.textSecondary} center>
                {isSameDay(selectedDate, today)
                  ? "Enjoy your day off! ☀️"
                  : "Nothing scheduled for this day"}
              </AppText>
              <Pressable
                onPress={() => router.push("/add-shift")}
                style={({ pressed }) => [
                  styles.addShiftLink,
                  {
                    backgroundColor: colors.accent + "14",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <IconSymbol
                  name="plus.circle.fill"
                  size={16}
                  color={colors.accent}
                />
                <AppText variant="captionBold" color={colors.accent}>
                  Add a shift
                </AppText>
              </Pressable>
            </View>
          </AppCard>
        ) : (
          dayShifts.map((shift, idx) => {
            const wp = workplaces.find((w) => w.id === shift.workplaceId);
            const isPast = new Date(shift.endDateTime) < now;
            const isActive =
              new Date(shift.startDateTime) <= now &&
              new Date(shift.endDateTime) >= now;
            const hasConflict = dayConflictShiftIds.has(shift.id);

            return (
              <FadeInView key={shift.id} delay={60 + idx * 50} duration={350}>
                <AnimatedPress scale={0.98}>
                  <AppCard
                    accentBorder={wp?.color}
                    style={[styles.shiftCard, isPast && { opacity: 0.5 }]}
                  >
                    <View style={styles.shiftRow}>
                      {/* Time column */}
                      <View style={styles.timeCol}>
                        <AppText variant="bodyBold">
                          {fmtTime(shift.startDateTime)}
                        </AppText>
                        <AppText variant="caption" color={colors.textSecondary}>
                          {fmtTime(shift.endDateTime)}
                        </AppText>
                      </View>

                      {/* Timeline dot + line */}
                      <View style={styles.tlCol}>
                        <View
                          style={[
                            styles.tlDot,
                            {
                              backgroundColor: isActive
                                ? colors.success
                                : hasConflict
                                  ? colors.error
                                  : (wp?.color ?? colors.accent),
                              borderColor: isActive
                                ? colors.success + "44"
                                : hasConflict
                                  ? colors.error + "44"
                                  : "transparent",
                            },
                          ]}
                        />
                        {idx < dayShifts.length - 1 && (
                          <View
                            style={[
                              styles.tlLine,
                              { backgroundColor: colors.border },
                            ]}
                          />
                        )}
                      </View>

                      {/* Info */}
                      <View style={styles.flex1}>
                        <View style={styles.shiftInfoTop}>
                          <AppText variant="bodyBold" style={styles.flex1}>
                            {shift.title}
                          </AppText>
                          {isActive && (
                            <AppBadge label="NOW" variant="success" />
                          )}
                          {hasConflict && (
                            <AppBadge label="Conflict" variant="error" />
                          )}
                          {shift.status === "pending" && (
                            <AppBadge label="Pending" variant="warning" />
                          )}
                        </View>

                        <View style={styles.wpRow}>
                          <View
                            style={[
                              styles.dot,
                              { backgroundColor: wp?.color ?? colors.accent },
                            ]}
                          />
                          <AppText
                            variant="caption"
                            color={colors.textSecondary}
                          >
                            {wp?.name ?? "Unknown"}
                          </AppText>
                          <AppText
                            variant="caption"
                            color={colors.textSecondary}
                          >
                            · {shiftDur(shift)}h
                          </AppText>
                        </View>

                        {shift.source !== "manual" && (
                          <View style={styles.sourceRow}>
                            <IconSymbol
                              name={
                                shift.source === "image_ocr"
                                  ? "camera.fill"
                                  : "arrow.triangle.2.circlepath"
                              }
                              size={12}
                              color={colors.textSecondary}
                            />
                            <AppText
                              variant="label"
                              color={colors.textSecondary}
                            >
                              {shift.source === "image_ocr"
                                ? "From photo"
                                : "Google Calendar"}
                            </AppText>
                          </View>
                        )}

                        {shift.notes && (
                          <AppText
                            variant="caption"
                            color={colors.textSecondary}
                            style={styles.notes}
                            numberOfLines={1}
                          >
                            {shift.notes}
                          </AppText>
                        )}

                        {wp?.hourlyRate && (
                          <AppText
                            variant="label"
                            color={colors.success}
                            style={styles.payLabel}
                          >
                            $
                            {(
                              parseFloat(shiftDur(shift)) * wp.hourlyRate
                            ).toFixed(2)}{" "}
                            est.
                          </AppText>
                        )}
                      </View>
                    </View>
                  </AppCard>
                </AnimatedPress>
              </FadeInView>
            );
          })
        )}

        {/* ━━ Period Summary ━━ */}
        {(() => {
          const viewDays =
            viewMode === "week"
              ? weekDays
              : monthData.cells.filter((d): d is Date => d !== null);
          const totalShifts = viewDays.reduce(
            (acc, d) => acc + (shiftDateMap.get(d.toDateString())?.length ?? 0),
            0,
          );
          const totalHrs = viewDays.reduce(
            (acc, d) =>
              acc +
              (shiftDateMap.get(d.toDateString()) ?? []).reduce(
                (h, s) =>
                  h +
                  (new Date(s.endDateTime).getTime() -
                    new Date(s.startDateTime).getTime()) /
                    3_600_000,
                0,
              ),
            0,
          );
          const totalPay = viewDays.reduce(
            (acc, d) =>
              acc +
              (shiftDateMap.get(d.toDateString()) ?? []).reduce((earn, s) => {
                const wp = workplaces.find((w) => w.id === s.workplaceId);
                const hrs =
                  (new Date(s.endDateTime).getTime() -
                    new Date(s.startDateTime).getTime()) /
                  3_600_000;
                return earn + hrs * (wp?.hourlyRate ?? 0);
              }, 0),
            0,
          );

          if (totalShifts === 0) return null;
          return (
            <AppCard style={styles.weekSummary} padding={16}>
              <AppText variant="overline" style={styles.weekSumLabel}>
                {viewMode === "week" ? "THIS WEEK" : "THIS MONTH"}
              </AppText>
              <View style={styles.weekStatsRow}>
                <View style={styles.weekStat}>
                  <AppText variant="title" color={colors.accent} center>
                    {totalShifts}
                  </AppText>
                  <AppText variant="label" center>
                    Shifts
                  </AppText>
                </View>
                <View
                  style={[
                    styles.weekStatDivider,
                    { backgroundColor: colors.border },
                  ]}
                />
                <View style={styles.weekStat}>
                  <AppText variant="title" color={colors.success} center>
                    {totalHrs.toFixed(1)}
                  </AppText>
                  <AppText variant="label" center>
                    Hours
                  </AppText>
                </View>
                <View
                  style={[
                    styles.weekStatDivider,
                    { backgroundColor: colors.border },
                  ]}
                />
                <View style={styles.weekStat}>
                  <AppText variant="title" color={colors.warning} center>
                    ${totalPay.toFixed(0)}
                  </AppText>
                  <AppText variant="label" center>
                    Est. Pay
                  </AppText>
                </View>
              </View>
            </AppCard>
          );
        })()}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AppScreen>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 12 },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  todayBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  toggleBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
  },

  // Navigation
  weekNav: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  // Week strip
  dayStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    gap: 4,
  },
  shiftDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },

  // Month grid
  monthGrid: { marginBottom: 16 },
  monthWeekHeader: { flexDirection: "row", marginBottom: 8 },
  monthHeaderCell: { flex: 1, alignItems: "center" },
  monthCells: { flexDirection: "row", flexWrap: "wrap" },
  monthCell: {
    width: "14.28%" as unknown as number,
    alignItems: "center",
    paddingVertical: 6,
    minHeight: 44,
    justifyContent: "center",
  },
  monthDotRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 2,
  },
  monthDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // Day summary
  daySummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  // Empty
  emptyCard: { marginBottom: 16 },
  emptyInner: { paddingVertical: 24, gap: 8, alignItems: "center" },
  addShiftLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },

  // Shift cards
  shiftCard: { marginBottom: 10 },
  shiftRow: { flexDirection: "row", gap: 12 },
  timeCol: { width: 52, alignItems: "flex-end" },
  tlCol: { alignItems: "center", width: 20 },
  tlDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    marginTop: 3,
  },
  tlLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    borderRadius: 1,
  },
  shiftInfoTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  wpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  notes: { marginTop: 4, fontStyle: "italic" },
  payLabel: { marginTop: 4 },

  // Summary
  weekSummary: { marginTop: 12, marginBottom: 16 },
  weekSumLabel: { marginBottom: 12 },
  weekStatsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  weekStat: { flex: 1, alignItems: "center" },
  weekStatDivider: { width: 1, height: 32 },

  // Shared
  flex1: { flex: 1 },
  bottomSpacer: { height: 100 },
});
