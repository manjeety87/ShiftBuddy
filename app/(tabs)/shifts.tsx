import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { IconSymbol, type IconName } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useShiftStore } from "@/store";
import { resolveFontFamily } from "@/theme/design-system";
import type { ThemeTokens } from "@/theme/types";
import type { Shift, ShiftSource, ShiftStatus } from "@/types";
import { getShiftWorkplaceLabel } from "@/utils/shift-labels";
import { LinearGradient } from "expo-linear-gradient";

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const formatDayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function groupLabel(date: Date, now: Date): string {
  if (formatDayKey(date) === formatDayKey(now)) {
    return "Today";
  }

  if (formatDayKey(date) === formatDayKey(addDays(now, 1))) {
    return "Tomorrow";
  }

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function statusMeta(
  status: ShiftStatus,
  tokens: ThemeTokens,
): { label: string; bg: string; fg: string } {
  if (status === "pending") {
    return { label: "Pending", bg: tokens.warningSoft, fg: tokens.warning };
  }

  if (status === "cancelled") {
    return { label: "Cancelled", bg: tokens.errorSoft, fg: tokens.error };
  }

  return { label: "Confirmed", bg: tokens.successSoft, fg: tokens.success };
}

function sourceMeta(
  source: ShiftSource,
  tokens: ThemeTokens,
): { label: string; icon: IconName; bg: string; fg: string } {
  if (source === "manual") {
    return {
      label: "Manual",
      icon: "pencil.fill",
      bg: tokens.surfaceSelected,
      fg: tokens.textSecondary,
    };
  }

  if (source === "google_calendar") {
    return {
      label: "Synced",
      icon: "arrow.triangle.2.circlepath",
      bg: tokens.successSoft,
      fg: tokens.success,
    };
  }

  return {
    label: "OCR",
    icon: "doc.text.viewfinder",
    bg: `${tokens.primary}1A`,
    fg: tokens.primary,
  };
}

export default function ShiftsTabScreen() {
  const { tokens } = useAppTheme();

  const shifts = useShiftStore((state) => state.shifts);
  const workplaces = useShiftStore((state) => state.workplaces);
  const removeShifts = useShiftStore((state) => state.removeShifts);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectionMode = selectedIds.size > 0;

  const now = new Date();

  const upcomingShifts = useMemo(
    () =>
      [...shifts]
        .filter(
          (shift) =>
            shift.status !== "cancelled" &&
            new Date(shift.endDateTime).getTime() >= now.getTime(),
        )
        .sort(
          (a, b) =>
            new Date(a.startDateTime).getTime() -
            new Date(b.startDateTime).getTime(),
        ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shifts],
  );

  const sevenDaysOut = now.getTime() + 7 * 86_400_000;

  const next7DayShifts = upcomingShifts.filter(
    (shift) => new Date(shift.startDateTime).getTime() < sevenDaysOut,
  );

  const estimatedPayout = next7DayShifts.reduce((sum, shift) => {
    const workplace = workplaces.find((wp) => wp.id === shift.workplaceId);
    const hours =
      (new Date(shift.endDateTime).getTime() -
        new Date(shift.startDateTime).getTime()) /
      3_600_000;

    return sum + hours * (workplace?.hourlyRate ?? 0);
  }, 0);

  const dayGroups = useMemo(() => {
    const groups: { key: string; date: Date; shifts: Shift[] }[] = [];
    const indexByKey = new Map<string, number>();

    for (const shift of upcomingShifts) {
      const date = new Date(shift.startDateTime);
      const key = formatDayKey(date);

      if (!indexByKey.has(key)) {
        indexByKey.set(key, groups.length);
        groups.push({ key, date, shifts: [] });
      }

      groups[indexByKey.get(key)!].shifts.push(shift);
    }

    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upcomingShifts]);

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const toggleSelection = (shiftId: string) => {
    setSelectedIds((current) => {
      const updated = new Set(current);

      if (updated.has(shiftId)) {
        updated.delete(shiftId);
      } else {
        updated.add(shiftId);
      }

      return updated;
    });
  };

  const handleShiftPress = (shift: Shift) => {
    if (selectionMode) {
      toggleSelection(shift.id);
      return;
    }

    router.push(`/add-shift?id=${shift.id}`);
  };

  const handleShiftLongPress = (shiftId: string) => {
    toggleSelection(shiftId);
  };

  const selectAll = () => {
    if (selectedIds.size === upcomingShifts.length) {
      clearSelection();
      return;
    }

    setSelectedIds(new Set(upcomingShifts.map((shift) => shift.id)));
  };

  const confirmDeleteSelected = () => {
    const ids = Array.from(selectedIds);
    const count = ids.length;

    if (count === 0) return;

    const performDelete = () => {
      removeShifts(ids);
      clearSelection();
    };

    const title = count === 1 ? "Delete Shift?" : `Delete ${count} Shifts?`;

    const message =
      count === 1
        ? "This shift will be permanently removed from your schedule."
        : "These shifts will be permanently removed from your schedule.";

    if (Platform.OS === "web") {
      const confirmed = window.confirm(`${title}\n\n${message}`);

      if (confirmed) {
        performDelete();
      }

      return;
    }

    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: performDelete },
    ]);
  };

  return (
    <AppScreen>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          {selectionMode ? (
            <>
              <Pressable
                onPress={clearSelection}
                hitSlop={12}
                style={styles.headerIconButton}
              >
                <IconSymbol name="xmark" size={20} color={tokens.textPrimary} />
              </Pressable>

              <View style={styles.selectionHeaderText}>
                <AppText variant="subheading" color={tokens.textPrimary}>
                  {selectedIds.size} selected
                </AppText>

                <Pressable onPress={selectAll}>
                  <AppText variant="captionBold" color={tokens.primary}>
                    {selectedIds.size === upcomingShifts.length
                      ? "Clear All"
                      : "Select All"}
                  </AppText>
                </Pressable>
              </View>

              <Pressable
                onPress={confirmDeleteSelected}
                hitSlop={12}
                style={[
                  styles.deleteButton,
                  { backgroundColor: `${tokens.error}18` },
                ]}
              >
                <IconSymbol name="trash.fill" size={19} color={tokens.error} />
              </Pressable>
            </>
          ) : (
            <View style={styles.editorial}>
              <AppText
                variant="label"
                color={tokens.textSecondary}
                style={styles.eyebrow}
              >
                Your Schedule
              </AppText>

              <AppText variant="title" color={tokens.textPrimary}>
                Upcoming Shifts
              </AppText>

              {upcomingShifts.length > 0 && (
                <AppText
                  variant="caption"
                  color={tokens.textSecondary}
                  style={styles.hint}
                >
                  Long press a shift to select it
                </AppText>
              )}

              <View style={styles.statsRow}>
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: tokens.glassBackgroundStrong,
                      borderColor: tokens.glassBorder,
                    },
                  ]}
                >
                  <AppText
                    variant="captionBold"
                    color={tokens.textSecondary}
                    style={styles.statLabel}
                  >
                    Next 7 Days
                  </AppText>

                  <AppText
                    color={tokens.primary}
                    style={styles.statValue}
                  >
                    {next7DayShifts.length}{" "}
                    {next7DayShifts.length === 1 ? "Shift" : "Shifts"}
                  </AppText>
                </View>

                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: tokens.glassBackgroundStrong,
                      borderColor: tokens.glassBorder,
                    },
                  ]}
                >
                  <AppText
                    variant="captionBold"
                    color={tokens.textSecondary}
                    style={styles.statLabel}
                  >
                    Est. Payout
                  </AppText>

                  <AppText color={tokens.textPrimary} style={styles.statValue}>
                    ${estimatedPayout.toFixed(2)}
                  </AppText>
                </View>
              </View>
            </View>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {upcomingShifts.length === 0 ? (
            <View
              style={[
                styles.empty,
                { backgroundColor: tokens.surface_container_low },
              ]}
            >
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: `${tokens.primary}18` },
                ]}
              >
                <IconSymbol
                  name="calendar.badge.plus"
                  size={30}
                  color={tokens.primary}
                />
              </View>

              <AppText variant="subheading" color={tokens.textPrimary} center>
                No upcoming shifts
              </AppText>

              <AppText
                variant="body"
                color={tokens.textSecondary}
                center
                style={styles.emptyText}
              >
                Add a shift manually or upload a schedule image to get started.
              </AppText>

              <View style={styles.emptyActions}>
                <Pressable
                  onPress={() => router.push("/add-shift")}
                  style={[styles.emptyBtn, { backgroundColor: tokens.primary }]}
                >
                  <IconSymbol
                    name="plus.circle.fill"
                    size={18}
                    color={tokens.textOnPrimary}
                  />
                  <AppText variant="bodyBold" color={tokens.textOnPrimary}>
                    Add Shift
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={() => router.push("/upload-shift")}
                  style={[
                    styles.emptyBtn,
                    styles.emptyBtnOutline,
                    { borderColor: tokens.border },
                  ]}
                >
                  <IconSymbol
                    name="camera.fill"
                    size={18}
                    color={tokens.primary}
                  />
                  <AppText variant="bodyBold" color={tokens.primary}>
                    Upload Schedule
                  </AppText>
                </Pressable>
              </View>
            </View>
          ) : (
            dayGroups.map((group) => (
              <View key={group.key} style={styles.dateGroup}>
                <View style={styles.dateGroupHeader}>
                  <AppText
                    variant="captionBold"
                    color={tokens.textSecondary}
                    style={styles.dateGroupLabel}
                  >
                    {groupLabel(group.date, now)}
                  </AppText>

                  <View
                    style={[
                      styles.dateGroupLine,
                      { backgroundColor: tokens.border },
                    ]}
                  />
                </View>

                {group.shifts.map((shift) => {
                  const workplace = workplaces.find(
                    (item) => item.id === shift.workplaceId,
                  );

                  const workplaceLabel = getShiftWorkplaceLabel(
                    shift,
                    workplaces,
                  );

                  const selected = selectedIds.has(shift.id);

                  const markerColor =
                    shift.associationType === "temporary"
                      ? tokens.conflict
                      : shift.associationType === "unassigned"
                      ? tokens.textTertiary
                      : workplace?.color || tokens.primary;

                  const status = statusMeta(shift.status, tokens);
                  const source = sourceMeta(shift.source, tokens);

                  return (
                    <Pressable
                      key={shift.id}
                      onPress={() => handleShiftPress(shift)}
                      onLongPress={() => handleShiftLongPress(shift.id)}
                      delayLongPress={350}
                      style={[
                        styles.card,
                        {
                          backgroundColor: selected
                            ? `${tokens.primary}18`
                            : tokens.glassBackground,
                          borderColor: selected
                            ? tokens.primary
                            : tokens.glassBorder,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.cardAccent,
                          { backgroundColor: markerColor },
                        ]}
                      />

                      <View style={styles.cardRowTop}>
                        <View style={styles.cardTitleBlock}>
                          <AppText
                            color={tokens.textPrimary}
                            numberOfLines={1}
                            style={styles.cardTitle}
                          >
                            {shift.title}
                          </AppText>

                          <View style={styles.locationRow}>
                            <IconSymbol
                              name="location.fill"
                              size={13}
                              color={tokens.textSecondary}
                            />

                            <AppText
                              variant="caption"
                              color={tokens.textSecondary}
                              numberOfLines={1}
                              style={styles.flexShrink}
                            >
                              {workplaceLabel}
                            </AppText>
                          </View>
                        </View>

                        <View style={styles.pillColumn}>
                          <View
                            style={[styles.pill, { backgroundColor: status.bg }]}
                          >
                            <AppText
                              color={status.fg}
                              style={styles.pillText}
                            >
                              {status.label}
                            </AppText>
                          </View>

                          <View
                            style={[
                              styles.pill,
                              styles.pillRow,
                              { backgroundColor: source.bg },
                            ]}
                          >
                            <IconSymbol
                              name={source.icon}
                              size={11}
                              color={source.fg}
                            />
                            <AppText
                              color={source.fg}
                              style={styles.pillText}
                            >
                              {source.label}
                            </AppText>
                          </View>
                        </View>
                      </View>

                      <View style={styles.cardRowBottom}>
                        <View style={styles.timePair}>
                          <View style={styles.timeBlock}>
                            <AppText
                              variant="caption"
                              color={tokens.textSecondary}
                            >
                              Start
                            </AppText>

                            <AppText
                              color={tokens.textPrimary}
                              style={styles.timeValue}
                            >
                              {fmtTime(shift.startDateTime)}
                            </AppText>
                          </View>

                          <View
                            style={[
                              styles.timeDivider,
                              { backgroundColor: tokens.divider },
                            ]}
                          />

                          <View style={styles.timeBlock}>
                            <AppText
                              variant="caption"
                              color={tokens.textSecondary}
                            >
                              End
                            </AppText>

                            <AppText
                              color={tokens.textPrimary}
                              style={styles.timeValue}
                            >
                              {fmtTime(shift.endDateTime)}
                            </AppText>
                          </View>
                        </View>

                        {selectionMode ? (
                          <View
                            style={[
                              styles.checkbox,
                              {
                                borderColor: selected
                                  ? tokens.primary
                                  : tokens.border,
                                backgroundColor: selected
                                  ? tokens.primary
                                  : "transparent",
                              },
                            ]}
                          >
                            {selected && (
                              <IconSymbol
                                name="checkmark.circle.fill"
                                size={14}
                                color={tokens.textOnPrimary}
                              />
                            )}
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.chevronButton,
                              { backgroundColor: `${tokens.primary}12` },
                            ]}
                          >
                            <IconSymbol
                              name="chevron.right"
                              size={16}
                              color={tokens.primary}
                            />
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))
          )}
        </ScrollView>

        {!selectionMode && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add shift"
            onPress={() => router.push("/add-shift")}
            style={({ pressed }) => [
              styles.fab,
              {
                shadowColor: tokens.primary,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <LinearGradient
              colors={[tokens.primaryGradientStart, tokens.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <IconSymbol name="plus" size={26} color={tokens.textOnPrimary} />
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },

  header: {
    minHeight: 44,
    marginBottom: 20,
  },

  editorial: {
    gap: 2,
  },

  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },

  hint: {
    marginTop: 2,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },

  statCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },

  statLabel: {
    textTransform: "uppercase",
    letterSpacing: -0.2,
  },

  statValue: {
    fontFamily: resolveFontFamily("Inter", 700),
    fontSize: 22,
    fontWeight: "700",
  },

  selectionHeaderText: {
    flex: 1,
    gap: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    gap: 22,
    paddingBottom: 140,
  },

  empty: {
    minHeight: 330,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyText: {
    marginTop: 7,
    lineHeight: 21,
    maxWidth: 280,
  },

  emptyActions: {
    width: "100%",
    gap: 10,
    marginTop: 22,
  },

  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 50,
    borderRadius: 16,
  },

  emptyBtnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },

  dateGroup: {
    gap: 12,
  },

  dateGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 2,
  },

  dateGroupLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  dateGroupLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    opacity: 0.5,
  },

  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    padding: 18,
    paddingLeft: 22,
    gap: 16,
  },

  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },

  cardRowTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  cardTitleBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  cardTitle: {
    fontFamily: resolveFontFamily("Manrope", 700),
    fontSize: 17,
    fontWeight: "700",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  flexShrink: {
    flexShrink: 1,
  },

  pillColumn: {
    alignItems: "flex-end",
    gap: 6,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  pillRow: {
    flexDirection: "row",
  },

  pillText: {
    fontFamily: resolveFontFamily("Inter", 700),
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  cardRowBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  timePair: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  timeBlock: {
    gap: 2,
  },

  timeValue: {
    fontFamily: resolveFontFamily("Inter", 700),
    fontSize: 15,
    fontWeight: "700",
  },

  timeDivider: {
    width: StyleSheet.hairlineWidth,
    height: 30,
  },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  chevronButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  fab: {
    position: "absolute",
    right: 4,
    bottom: 96,
    borderRadius: 28,
    overflow: "hidden",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },

  fabGradient: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
});
