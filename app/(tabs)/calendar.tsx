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

const startOfWeek = (d: Date): Date => {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay(); // 0=Sun
  copy.setDate(copy.getDate() - day); // back to Sunday
  return copy;
};

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const shiftDur = (s: Shift) =>
  (
    (new Date(s.endDateTime).getTime() - new Date(s.startDateTime).getTime()) /
    3_600_000
  ).toFixed(1);

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

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(today);

  // Week days (Sun-Sat) for current offset
  const weekDays = useMemo(() => {
    const start = startOfWeek(today);
    start.setDate(start.getDate() + weekOffset * 7);
    return Array.from(
      { length: 7 },
      (_, i) => new Date(start.getTime() + i * DAY_MS),
    );
  }, [today, weekOffset]);

  // Month/year label for the week strip
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

  // Shifts with shift dates pre-computed for quick lookup
  const shiftDateMap = useMemo(() => {
    const map = new Map<string, Shift[]>();
    for (const s of shifts) {
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
    setSelectedDate(today);
  }, [today]);

  const now = new Date();

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ━━ Header ━━ */}
        <View style={styles.headerRow}>
          <AppText variant="largeTitle">Calendar</AppText>
          {weekOffset !== 0 && (
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
        </View>

        {/* ━━ Week Navigator ━━ */}
        <View style={styles.weekNav}>
          <Pressable onPress={() => setWeekOffset((o) => o - 1)} hitSlop={12}>
            <IconSymbol
              name="chevron.left"
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>
          <AppText variant="bodyBold" style={styles.flex1} center>
            {weekLabel}
          </AppText>
          <Pressable onPress={() => setWeekOffset((o) => o + 1)} hitSlop={12}>
            <IconSymbol
              name="chevron.right"
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        {/* ━━ Day Strip ━━ */}
        <View style={styles.dayStrip}>
          {weekDays.map((d) => {
            const isToday = isSameDay(d, today);
            const isSelected = isSameDay(d, selectedDate);
            const hasShifts = shiftDateMap.has(d.toDateString());
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
                {/* Shift indicator dot */}
                <View
                  style={[
                    styles.shiftDot,
                    {
                      backgroundColor: hasShifts
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
              <AppText variant="heading" center>
                No shifts
              </AppText>
              <AppText variant="body" color={colors.textSecondary} center>
                {isSameDay(selectedDate, today)
                  ? "Enjoy your day off! ☀️"
                  : "Nothing scheduled for this day"}
              </AppText>
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

                        {/* Workplace + duration */}
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

                        {/* Source tag */}
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
                                : shift.source === "google_calendar"
                                  ? "Google Calendar"
                                  : "Apple Calendar"}
                            </AppText>
                          </View>
                        )}

                        {/* Notes */}
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
                      </View>
                    </View>
                  </AppCard>
                </AnimatedPress>
              </FadeInView>
            );
          })
        )}

        {/* ━━ All Shifts This Week ━━ */}
        {(() => {
          const weekShiftCount = weekDays.reduce(
            (acc, d) => acc + (shiftDateMap.get(d.toDateString())?.length ?? 0),
            0,
          );
          const weekHrs = weekDays.reduce(
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
          if (weekShiftCount === 0) return null;
          return (
            <AppCard style={styles.weekSummary} padding={16}>
              <AppText variant="overline" style={styles.weekSumLabel}>
                THIS WEEK
              </AppText>
              <View style={styles.weekStatsRow}>
                <View style={styles.weekStat}>
                  <AppText variant="title" color={colors.accent} center>
                    {weekShiftCount}
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
                    {weekHrs.toFixed(1)}
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
                    $
                    {weekDays
                      .reduce(
                        (acc, d) =>
                          acc +
                          (shiftDateMap.get(d.toDateString()) ?? []).reduce(
                            (earn, s) => {
                              const wp = workplaces.find(
                                (w) => w.id === s.workplaceId,
                              );
                              const hrs =
                                (new Date(s.endDateTime).getTime() -
                                  new Date(s.startDateTime).getTime()) /
                                3_600_000;
                              return earn + hrs * (wp?.hourlyRate ?? 0);
                            },
                            0,
                          ),
                        0,
                      )
                      .toFixed(0)}
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
    marginBottom: 16,
  },
  todayBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },

  // Week nav
  weekNav: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  // Day strip
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

  // Day summary
  daySummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  // Empty
  emptyCard: { marginBottom: 16 },
  emptyInner: { paddingVertical: 24, gap: 6 },

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

  // Week summary
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
