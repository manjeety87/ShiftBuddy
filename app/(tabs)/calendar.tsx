import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

import { AppCard } from "@/components/ui/app-card";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassHeader } from "@/components/ui/glass-header";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useShiftStore } from "@/store";
import type { Shift } from "@/types";
import { getShiftWorkplaceLabel } from "@/utils/shift-labels";

type CalendarCell = {
  date: Date;
  key: string;
  currentMonth: boolean;
};

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_DAY_DOTS = 4;

const formatDayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

const fmtHours = (hours: number) =>
  Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

function buildMonthGrid(visibleMonth: Date): CalendarCell[] {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayOffset = index - firstWeekday + 1;
    const date = new Date(year, month, dayOffset);

    return {
      date,
      key: formatDayKey(date),
      currentMonth: date.getMonth() === month,
    };
  });
}

export default function CalendarScreen() {
  const { tokens } = useAppTheme();

  const user = useShiftStore((state) => state.user);
  const shifts = useShiftStore((state) => state.shifts);
  const workplaces = useShiftStore((state) => state.workplaces);
  const conflicts = useShiftStore((state) => state.conflicts);

  const now = new Date();
  const todayKey = formatDayKey(now);

  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(now));
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(now));

  const selectedKey = formatDayKey(selectedDate);
  const isSelectedToday = selectedKey === todayKey;

  const activeShifts = shifts.filter((shift) => shift.status !== "cancelled");

  const conflictedShiftIds = new Set(
    conflicts
      .filter((conflict) => !conflict.resolved)
      .flatMap((conflict) => [conflict.shiftAId, conflict.shiftBId]),
  );

  const shiftsByDay = useMemo(() => {
    const map = new Map<string, typeof activeShifts>();

    for (const shift of activeShifts) {
      const key = formatDayKey(new Date(shift.startDateTime));
      const existing = map.get(key);

      if (existing) {
        existing.push(shift);
      } else {
        map.set(key, [shift]);
      }
    }

    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shifts]);

  const dotColorForShift = (shift: Shift) => {
    if (conflictedShiftIds.has(shift.id)) {
      return tokens.conflict;
    }

    const workplace = workplaces.find((item) => item.id === shift.workplaceId);

    return workplace?.color ?? tokens.primary;
  };

  const cells = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);

  const monthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const monthHours = cells
    .filter((cell) => cell.currentMonth)
    .reduce((sum, cell) => {
      const dayShifts = shiftsByDay.get(cell.key) ?? [];

      return (
        sum +
        dayShifts.reduce(
          (daySum, shift) =>
            daySum +
            (new Date(shift.endDateTime).getTime() -
              new Date(shift.startDateTime).getTime()) /
              3_600_000,
          0,
        )
      );
    }, 0);

  const selectedDayShifts = (shiftsByDay.get(selectedKey) ?? []).sort(
    (a, b) =>
      new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime(),
  );

  const selectedDayHours = selectedDayShifts.reduce(
    (sum, shift) =>
      sum +
      (new Date(shift.endDateTime).getTime() -
        new Date(shift.startDateTime).getTime()) /
        3_600_000,
    0,
  );

  const selectDate = (date: Date) => {
    setSelectedDate(startOfDay(date));

    if (
      date.getMonth() !== visibleMonth.getMonth() ||
      date.getFullYear() !== visibleMonth.getFullYear()
    ) {
      setVisibleMonth(startOfMonth(date));
    }
  };

  const goToToday = () => {
    setVisibleMonth(startOfMonth(now));
    setSelectedDate(startOfDay(now));
  };

  const fabShadow = (
    Platform.OS === "web"
      ? { boxShadow: `0px 14px 30px ${tokens.ambientShadow}` }
      : {
          shadowColor: tokens.primary,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.28,
          shadowRadius: 18,
          elevation: 8,
        }
  ) as ViewStyle;

  return (
    <AppScreen safeTop={false}>
      <View style={styles.screen}>
        <GlassHeader>
          <View style={styles.headerRow}>
            <View style={styles.brandRow}>
              <View
                style={[
                  styles.avatar,
                  {
                    borderRadius: tokens.radiusPill,
                    backgroundColor: tokens.surfaceSelected,
                  },
                ]}
              >
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <AppText variant="subheading" color={tokens.primary}>
                    {user?.name?.charAt(0)?.toUpperCase() ?? "S"}
                  </AppText>
                )}
              </View>

              <AppText variant="heading" color={tokens.primary}>
                ShiftBuddy
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View alerts"
              onPress={() => router.push("/conflicts")}
              style={({ pressed }) => [
                styles.headerButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <IconSymbol name="bell.fill" size={22} color={tokens.primary} />
            </Pressable>
          </View>
        </GlassHeader>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.overview}>
            <View style={styles.overviewLeft}>
              <AppText variant="overline" color={tokens.textTertiary}>
                Calendar Overview
              </AppText>

              <View style={styles.titleRow}>
                <AppText variant="title" color={tokens.textPrimary}>
                  {monthLabel}
                </AppText>

                <AppText variant="bodyBold" color={tokens.primary}>
                  {fmtHours(monthHours)} hrs scheduled
                </AppText>
              </View>
            </View>

            <View style={styles.navRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setVisibleMonth((month) => addMonths(month, -1))}
                style={({ pressed }) => [
                  styles.navButton,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <IconSymbol
                  name="chevron.left"
                  size={20}
                  color={tokens.textSecondary}
                />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={goToToday}
                style={({ pressed }) => [
                  styles.todayButton,
                  {
                    borderRadius: tokens.radiusPill,
                    backgroundColor: tokens.surfaceElevated,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <AppText variant="bodyBold" color={tokens.primary}>
                  Today
                </AppText>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => setVisibleMonth((month) => addMonths(month, 1))}
                style={({ pressed }) => [
                  styles.navButton,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <IconSymbol
                  name="chevron.right"
                  size={20}
                  color={tokens.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <AppCard tier="container" padding={20}>
            <View
              style={[styles.weekdayRow, { borderBottomColor: tokens.divider }]}
            >
              {WEEKDAY_NAMES.map((weekday) => (
                <View key={weekday} style={styles.weekdayCell}>
                  <AppText variant="label" color={tokens.textSecondary} center>
                    {weekday}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={styles.monthGrid}>
              {cells.map((cell) => {
                const isSelected = cell.key === selectedKey;
                const isToday = cell.key === todayKey;
                const dayShifts = shiftsByDay.get(cell.key) ?? [];
                const dots = dayShifts
                  .slice(0, MAX_DAY_DOTS)
                  .map((shift) => dotColorForShift(shift));

                return (
                  <Pressable
                    key={cell.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => selectDate(cell.date)}
                    style={({ pressed }) => [
                      styles.monthCell,
                      !cell.currentMonth && styles.mutedCell,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View
                      style={[
                        styles.dayCircle,
                        isSelected && { backgroundColor: tokens.primary },
                        !isSelected &&
                          isToday &&
                          cell.currentMonth && {
                            borderWidth: 1.5,
                            borderColor: tokens.primary,
                          },
                      ]}
                    >
                      <AppText
                        variant={isSelected ? "bodyBold" : "body"}
                        color={
                          isSelected ? tokens.textOnPrimary : tokens.textPrimary
                        }
                      >
                        {cell.date.getDate()}
                      </AppText>
                    </View>

                    <View style={styles.dotRow}>
                      {dots.map((color, index) => (
                        <View
                          key={index}
                          style={[styles.dayDot, { backgroundColor: color }]}
                        />
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </AppCard>

          <GlassCard padding={24}>
            <View style={styles.agendaHeader}>
              <View style={styles.flexText}>
                <AppText variant="overline" color={tokens.primary}>
                  {isSelectedToday ? "Today" : "Selected Day"}
                </AppText>

                <AppText variant="heading" color={tokens.textPrimary}>
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </AppText>
              </View>

              <View
                style={[
                  styles.agendaPill,
                  {
                    borderRadius: tokens.radiusPill,
                    backgroundColor: tokens.primarySoft,
                  },
                ]}
              >
                <AppText variant="bodyBold" color={tokens.primary}>
                  {fmtHours(selectedDayHours)} hrs
                  {isSelectedToday ? " Today" : ""}
                </AppText>
              </View>
            </View>

            {selectedDayShifts.length === 0 ? (
              <View style={styles.emptyAgenda}>
                <View
                  style={[
                    styles.emptyAgendaIcon,
                    {
                      borderRadius: tokens.radiusPill,
                      backgroundColor: tokens.primarySoft,
                    },
                  ]}
                >
                  <IconSymbol
                    name="calendar.badge.plus"
                    size={22}
                    color={tokens.primary}
                  />
                </View>

                <AppText variant="body" color={tokens.textSecondary} center>
                  No shifts scheduled for this day.
                </AppText>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/add-shift")}
                  style={({ pressed }) => [
                    styles.addTaskRow,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <IconSymbol
                    name="plus.circle.fill"
                    size={18}
                    color={tokens.primary}
                  />
                  <AppText variant="bodyBold" color={tokens.primary}>
                    Add a shift
                  </AppText>
                </Pressable>
              </View>
            ) : (
              <View style={styles.timeline}>
                <View
                  style={[
                    styles.timelineLine,
                    { backgroundColor: tokens.divider },
                  ]}
                />

                {selectedDayShifts.map((shift) => {
                  const markerColor = dotColorForShift(shift);

                  return (
                    <View key={shift.id} style={styles.timelineItem}>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor: markerColor,
                            borderColor: tokens.surfaceElevated,
                          },
                        ]}
                      />

                      <AppCard accentBorder={markerColor} padding={16}>
                        <View style={styles.shiftHeader}>
                          <AppText
                            variant="subheading"
                            color={tokens.textPrimary}
                            numberOfLines={1}
                            style={styles.flexText}
                          >
                            {shift.title}
                          </AppText>

                          <View
                            style={[
                              styles.timePill,
                              {
                                borderRadius: tokens.radiusSmall,
                                backgroundColor: tokens.primarySoft,
                              },
                            ]}
                          >
                            <AppText variant="label" color={tokens.primary}>
                              {fmtTime(shift.startDateTime)} –{" "}
                              {fmtTime(shift.endDateTime)}
                            </AppText>
                          </View>
                        </View>

                        <View style={styles.shiftLocation}>
                          <IconSymbol
                            name="mappin.and.ellipse"
                            size={14}
                            color={tokens.textSecondary}
                          />

                          <AppText
                            variant="caption"
                            color={tokens.textSecondary}
                            numberOfLines={1}
                            style={styles.flexText}
                          >
                            {getShiftWorkplaceLabel(shift, workplaces)}
                          </AppText>
                        </View>
                      </AppCard>
                    </View>
                  );
                })}

                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/add-shift")}
                  style={({ pressed }) => [
                    styles.addTaskRow,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <IconSymbol
                    name="plus.circle.fill"
                    size={18}
                    color={tokens.primary}
                  />
                  <AppText variant="bodyBold" color={tokens.primary}>
                    Add specific task
                  </AppText>
                </Pressable>
              </View>
            )}
          </GlassCard>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add shift"
          onPress={() => router.push("/add-shift")}
          style={({ pressed }) => [
            styles.fab,
            {
              borderRadius: tokens.radiusLarge,
              opacity: pressed ? 0.78 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
            fabShadow,
          ]}
        >
          <LinearGradient
            colors={[tokens.primaryGradientStart, tokens.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <IconSymbol name="plus" size={28} color={tokens.textOnPrimary} />
          </LinearGradient>
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 150,
    gap: 20,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatar: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  overview: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },

  overviewLeft: {
    flex: 1,
    minWidth: 180,
    gap: 6,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    flexWrap: "wrap",
  },

  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  navButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  todayButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
  },

  weekdayRow: {
    flexDirection: "row",
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  weekdayCell: {
    flex: 1,
    alignItems: "center",
  },

  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  monthCell: {
    width: `${100 / 7}%`,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    gap: 4,
  },

  mutedCell: {
    opacity: 0.3,
  },

  dayCircle: {
    width: 38,
    height: 38,
    // Exact half-width, not 999: on this device, an oversized borderRadius
    // isn't clamped down to the box size the way it is on iOS/web — it
    // inflates the shape instead of clipping to a circle. overflow:
    // "hidden" (below) is what actually fixes the earlier square-fill
    // bug; the radius just needs to match the known, fixed 38x38 box.
    borderRadius: 19,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  dotRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 3,
    minHeight: 5,
  },

  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },

  agendaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 20,
  },

  agendaPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  emptyAgenda: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },

  emptyAgendaIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },

  addTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 4,
  },

  timeline: {
    position: "relative",
    gap: 18,
  },

  timelineLine: {
    position: "absolute",
    left: 11,
    top: 6,
    bottom: 6,
    width: 1,
  },

  timelineItem: {
    position: "relative",
    paddingLeft: 36,
  },

  timelineDot: {
    position: "absolute",
    left: 4,
    top: 14,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
  },

  shiftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },

  flexText: {
    flex: 1,
    minWidth: 0,
  },

  timePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  shiftLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  bottomSpacer: {
    height: 10,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 96,
    overflow: "hidden",
  },

  fabGradient: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
});
