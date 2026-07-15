import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

import { AppBadge } from "@/components/ui/app-badge";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useShiftStore } from "@/store";
import type { Shift } from "@/types";

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const shiftDurationHours = (shift: Shift) => {
  const ms =
    new Date(shift.endDateTime).getTime() -
    new Date(shift.startDateTime).getTime();
  return ms / 3_600_000;
};

const timeUntil = (iso: string) => {
  const diffMs = new Date(iso).getTime() - Date.now();
  if (diffMs <= 0) return "Now";
  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h`;
  }

  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
};

export default function HomeScreen() {
  const { theme } = useAppTheme();
  const tokens = theme.tokens;

  const shifts = useShiftStore((state) => state.shifts);
  const workplaces = useShiftStore((state) => state.workplaces);
  const conflicts = useShiftStore((state) => state.conflicts);
  const user = useShiftStore((state) => state.user);

  const now = new Date();
  const todayKey = now.toDateString();

  const upcoming = shifts
    .filter(
      (shift) =>
        shift.status !== "cancelled" &&
        new Date(shift.startDateTime).getTime() > now.getTime(),
    )
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    );

  const nextShift = upcoming[0];
  const nextWorkplace = nextShift
    ? workplaces.find((workplace) => workplace.id === nextShift.workplaceId)
    : undefined;

  const todayShifts = shifts
    .filter(
      (shift) => new Date(shift.startDateTime).toDateString() === todayKey,
    )
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    );

  const unresolvedConflicts = conflicts.filter(
    (conflict) => !conflict.resolved,
  );
  const topConflict = unresolvedConflicts[0];

  const conflictShiftA = topConflict
    ? shifts.find((shift) => shift.id === topConflict.shiftAId)
    : undefined;
  const conflictShiftB = topConflict
    ? shifts.find((shift) => shift.id === topConflict.shiftBId)
    : undefined;

  const conflictWorkplaceA = conflictShiftA
    ? workplaces.find(
        (workplace) => workplace.id === conflictShiftA.workplaceId,
      )
    : undefined;
  const conflictWorkplaceB = conflictShiftB
    ? workplaces.find(
        (workplace) => workplace.id === conflictShiftB.workplaceId,
      )
    : undefined;

  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);

  const weekBuckets = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);

    const shiftsForDay = shifts.filter((shift) => {
      const shiftDate = new Date(shift.startDateTime);
      return (
        shift.status !== "cancelled" &&
        shiftDate.getFullYear() === day.getFullYear() &&
        shiftDate.getMonth() === day.getMonth() &&
        shiftDate.getDate() === day.getDate()
      );
    });

    const totalHours = shiftsForDay.reduce(
      (acc, shift) => acc + shiftDurationHours(shift),
      0,
    );

    return {
      key: day.toDateString(),
      day,
      totalHours,
      hasConflict: shiftsForDay.length > 1,
    };
  });

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const workplaceSummary = workplaces
    .map((workplace) => {
      const monthlyCount = shifts.filter((shift) => {
        const start = new Date(shift.startDateTime);
        return (
          shift.status !== "cancelled" &&
          shift.workplaceId === workplace.id &&
          start >= monthStart &&
          start <= monthEnd
        );
      }).length;

      return {
        ...workplace,
        monthlyCount,
      };
    })
    .sort((a, b) => b.monthlyCount - a.monthlyCount)
    .slice(0, 3);

  return (
    <AppScreen>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.header,
              {
                backgroundColor: `${tokens.surface}B3`,
              },
            ]}
          >
            <View style={styles.brandRow}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: tokens.surface_container,
                    },
                  ]}
                >
                  {user?.avatarUrl ? (
                    <Image
                      source={{ uri: user.avatarUrl }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <AppText
                      variant="subheading"
                      color={tokens.primary}
                      style={styles.brandInitial}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() ?? "S"}
                    </AppText>
                  )}
                </View>
                <AppText
                  variant="heading"
                  color={tokens.primary}
                  style={styles.brandText}
                >
                  ShiftBuddy
                </AppText>
              </View>
              <View
                style={[
                  styles.quickIcon,
                  { backgroundColor: `${tokens.primary}1A` },
                ]}
              >
                <IconSymbol
                  name="plus.circle.fill"
                  size={22}
                  style={{ borderRadius: 12 }}
                  color={tokens.primary}
                />
              </View>
              {/* <AppText variant="caption" color={tokens.textSecondary}> */}

              {/* </AppText>
              </View> */}
            </View>

            <Pressable
              onPress={() => router.push("/(tabs)/settings")}
              hitSlop={10}
              style={({ pressed }) => [
                styles.headerAction,
                {
                  backgroundColor: pressed
                    ? tokens.surface_container_high
                    : "transparent",
                },
              ]}
            >
              <IconSymbol name="bell.fill" size={18} color={tokens.primary} />
            </Pressable>
          </View>

          <LinearGradient
            colors={["#c5d9ff", "#adc6ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroOrb} />

            <View style={styles.heroTopRow}>
              <View
                style={[
                  styles.heroChip,
                  { backgroundColor: `${tokens.surface_darkest}1F` },
                ]}
              >
                <AppText variant="label" color={tokens.surface_darkest}>
                  NEXT SHIFT
                </AppText>
              </View>

              <View style={styles.heroRight}>
                <AppText
                  variant="captionBold"
                  color={`${tokens.surface_darkest}B3`}
                >
                  STARTING IN
                </AppText>
                <AppText variant="title" color={tokens.surface_darkest}>
                  {nextShift ? timeUntil(nextShift.startDateTime) : "-"}
                </AppText>
              </View>
            </View>

            {nextShift ? (
              <>
                <AppText
                  variant="title"
                  color={tokens.surface_darkest}
                  style={styles.heroTitle}
                >
                  {nextWorkplace?.name ?? "Upcoming Shift"}
                </AppText>
                <AppText
                  variant="bodyBold"
                  color={`${tokens.surface_darkest}D1`}
                  style={styles.heroSubtitle}
                >
                  {nextShift.title}
                </AppText>

                <View style={styles.heroMetaWrap}>
                  <View style={styles.heroMetaItem}>
                    <IconSymbol
                      name="clock.fill"
                      size={14}
                      color={`${tokens.surface_darkest}A6`}
                    />
                    <AppText variant="bodyBold" color={tokens.surface_darkest}>
                      {fmtTime(nextShift.startDateTime)} -{" "}
                      {fmtTime(nextShift.endDateTime)}
                    </AppText>
                  </View>
                  <View style={styles.heroMetaItem}>
                    <IconSymbol
                      name="mappin.and.ellipse"
                      size={14}
                      color={`${tokens.surface_darkest}A6`}
                    />
                    <AppText variant="bodyBold" color={tokens.surface_darkest}>
                      {fmtDate(nextShift.startDateTime)}
                    </AppText>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.heroEmpty}>
                <AppText variant="heading" color={tokens.surface_darkest}>
                  All clear
                </AppText>
                <AppText variant="body" color={`${tokens.surface_darkest}BF`}>
                  No upcoming shifts right now
                </AppText>
              </View>
            )}
          </LinearGradient>

          <View style={styles.quickActionGrid}>
            <Pressable
              onPress={() => router.push("/add-shift")}
              style={({ pressed }) => [
                styles.quickCard,
                {
                  borderRadius: 12,
                  backgroundColor: pressed
                    ? tokens.surface_container_high
                    : tokens.surface_container,
                  borderColor: `${tokens.outline_variant}26`,
                },
              ]}
            >
              <View
                style={[
                  styles.quickIcon,
                  { backgroundColor: `${tokens.primary}1A` },
                ]}
              >
                <IconSymbol
                  name="plus.circle.fill"
                  size={22}
                  style={{ borderRadius: 12 }}
                  color={tokens.primary}
                />
              </View>
              <AppText variant="label" color={tokens.textSecondary}>
                ADD SHIFT
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => router.push("/upload-shift")}
              style={({ pressed }) => [
                styles.quickCard,
                {
                  backgroundColor: pressed
                    ? tokens.surface_container_high
                    : tokens.surface_container,
                  borderColor: `${tokens.outline_variant}26`,
                },
              ]}
            >
              <View
                style={[
                  styles.quickIcon,
                  { backgroundColor: `${tokens.tertiary}1A` },
                ]}
              >
                <IconSymbol
                  name="camera.fill"
                  size={22}
                  color={tokens.tertiary}
                />
              </View>
              <AppText variant="label" color={tokens.textSecondary}>
                UPLOAD
              </AppText>
            </Pressable>
          </View>

          <View style={styles.sectionGroup}>
            <View style={styles.sectionHeaderLeft}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={17}
                color={tokens.tertiary}
              />
              <AppText variant="subheading" color={tokens.tertiary}>
                Conflict Detected
              </AppText>
            </View>

            <View
              style={[
                styles.conflictCard,
                {
                  backgroundColor: tokens.surface_container_low,
                  borderLeftColor: tokens.tertiary,
                },
              ]}
            >
              <View
                style={[
                  styles.conflictGlow,
                  { backgroundColor: `${tokens.tertiary}14` },
                ]}
              />

              {topConflict && conflictShiftA && conflictShiftB ? (
                <>
                  <AppText
                    variant="body"
                    color={tokens.textSecondary}
                    style={styles.conflictIntro}
                  >
                    You have two overlapping assignments on{" "}
                    {fmtDate(conflictShiftA.startDateTime)}.
                  </AppText>

                  <View style={styles.conflictRows}>
                    <View
                      style={[
                        styles.conflictRow,
                        {
                          backgroundColor: tokens.surface_container,
                        },
                      ]}
                    >
                      <View>
                        <AppText variant="captionBold" color={tokens.primary}>
                          {conflictWorkplaceA?.name ?? "Workplace"}
                        </AppText>
                        <AppText variant="bodyBold" color={tokens.textPrimary}>
                          {conflictShiftA.title}
                        </AppText>
                      </View>
                      <AppText variant="caption" color={tokens.textSecondary}>
                        {fmtTime(conflictShiftA.startDateTime)} -{" "}
                        {fmtTime(conflictShiftA.endDateTime)}
                      </AppText>
                    </View>

                    <View
                      style={[
                        styles.conflictRow,
                        {
                          backgroundColor: tokens.surface_container,
                        },
                      ]}
                    >
                      <View>
                        <AppText variant="captionBold" color={tokens.tertiary}>
                          {conflictWorkplaceB?.name ?? "Workplace"}
                        </AppText>
                        <AppText variant="bodyBold" color={tokens.textPrimary}>
                          {conflictShiftB.title}
                        </AppText>
                      </View>
                      <AppText variant="caption" color={tokens.textSecondary}>
                        {fmtTime(conflictShiftB.startDateTime)} -{" "}
                        {fmtTime(conflictShiftB.endDateTime)}
                      </AppText>
                    </View>
                  </View>
                </>
              ) : (
                <AppText
                  variant="body"
                  color={tokens.textSecondary}
                  style={styles.conflictIntro}
                >
                  No overlapping assignments right now.
                </AppText>
              )}

              <Pressable
                onPress={() => router.push("/conflicts")}
                style={({ pressed }) => [
                  styles.resolveButton,
                  {
                    backgroundColor: tokens.surface_container_highest,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <AppText
                  variant="bodyBold"
                  color={topConflict ? tokens.tertiary : tokens.textSecondary}
                  center
                  style={topConflict ? undefined : styles.resolveTextMuted}
                >
                  Resolve Scheduling
                </AppText>
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionGroup}>
            <View style={styles.scheduleHeader}>
              <AppText variant="subheading" color={tokens.textPrimary}>
                Today&apos;s Schedule
              </AppText>
              <AppText variant="label" color={tokens.outline}>
                {now.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </AppText>
            </View>

            {todayShifts.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: tokens.surface_container_low,
                  },
                ]}
              >
                <AppText variant="body" color={tokens.textSecondary} center>
                  No shifts scheduled for today
                </AppText>
              </View>
            ) : (
              todayShifts.map((shift) => {
                const workplace = workplaces.find(
                  (item) => item.id === shift.workplaceId,
                );

                const ended =
                  new Date(shift.endDateTime).getTime() < now.getTime();
                const ongoing =
                  new Date(shift.startDateTime).getTime() <= now.getTime() &&
                  new Date(shift.endDateTime).getTime() >= now.getTime();

                const cardStyle: ViewStyle = {
                  backgroundColor: ongoing
                    ? tokens.surface_container
                    : tokens.surface_container_low,
                };

                return (
                  <View key={shift.id} style={[styles.scheduleCard, cardStyle]}>
                    <View style={styles.scheduleRow}>
                      <View style={styles.scheduleLeft}>
                        <View
                          style={[
                            styles.scheduleMarker,
                            {
                              backgroundColor:
                                workplace?.color ?? tokens.primary,
                              opacity: ended ? 0.45 : 1,
                            },
                          ]}
                        />
                        <View>
                          <AppText
                            variant="bodyBold"
                            color={tokens.textPrimary}
                          >
                            {workplace?.name ?? "Workplace"}
                          </AppText>
                          <AppText
                            variant="caption"
                            color={tokens.textSecondary}
                          >
                            {shift.title}
                          </AppText>
                        </View>
                      </View>

                      <View style={styles.scheduleRight}>
                        <AppText
                          variant="bodyBold"
                          color={ongoing ? tokens.primary : tokens.textPrimary}
                        >
                          {fmtTime(shift.startDateTime)} -{" "}
                          {fmtTime(shift.endDateTime)}
                        </AppText>
                        <AppBadge
                          label={
                            ongoing
                              ? "UPCOMING"
                              : ended
                                ? "COMPLETED"
                                : shift.status.toUpperCase()
                          }
                          variant={
                            ongoing ? "accent" : ended ? "default" : "warning"
                          }
                        />
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <View style={styles.sectionGroup}>
            <AppText
              variant="subheading"
              color={tokens.textPrimary}
              style={styles.sectionTitleSpacing}
            >
              This Week
            </AppText>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.weekScroll}
            >
              {weekBuckets.map((bucket) => {
                const isToday = bucket.key === todayKey;
                return (
                  <View
                    key={bucket.key}
                    style={[
                      styles.weekCard,
                      {
                        backgroundColor: isToday
                          ? `${tokens.primary_container}29`
                          : tokens.surface_container_low,
                      },
                    ]}
                  >
                    <AppText
                      variant="label"
                      color={isToday ? tokens.primary : tokens.textSecondary}
                    >
                      {bucket.day.toLocaleDateString(undefined, {
                        weekday: "short",
                        day: "numeric",
                      })}
                    </AppText>

                    <View
                      style={[
                        styles.weekBar,
                        {
                          backgroundColor: bucket.hasConflict
                            ? `${tokens.tertiary}99`
                            : isToday
                              ? tokens.primary
                              : `${tokens.primary}4D`,
                        },
                      ]}
                    />

                    <AppText
                      variant="heading"
                      color={isToday ? tokens.primary : tokens.textPrimary}
                    >
                      {bucket.totalHours.toFixed(0)}h
                    </AppText>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.sectionGroup}>
            <View style={styles.sectionHeaderInline}>
              <AppText variant="subheading" color={tokens.textPrimary}>
                Workplaces
              </AppText>
              <Pressable onPress={() => router.push("/(tabs)/workplaces")}>
                <AppText variant="captionBold" color={tokens.primary}>
                  Manage
                </AppText>
              </Pressable>
            </View>

            {workplaceSummary.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: tokens.surface_container_low,
                  },
                ]}
              >
                <AppText variant="body" color={tokens.textSecondary} center>
                  Add your first workplace to start tracking
                </AppText>
              </View>
            ) : (
              workplaceSummary.map((workplace) => (
                <Pressable
                  key={workplace.id}
                  onPress={() => router.push("/(tabs)/workplaces")}
                  style={({ pressed }) => [
                    styles.workplaceCard,
                    {
                      backgroundColor: pressed
                        ? tokens.surface_container
                        : tokens.surface_container_low,
                    },
                  ]}
                >
                  <View style={styles.workplaceLeft}>
                    <View
                      style={[
                        styles.workplaceDot,
                        {
                          backgroundColor: workplace.color || tokens.primary,
                        },
                      ]}
                    />
                    <AppText variant="bodyBold" color={tokens.textPrimary}>
                      {workplace.name}
                    </AppText>
                  </View>

                  <AppText variant="captionBold" color={tokens.textSecondary}>
                    {workplace.monthlyCount} shifts/mo
                  </AppText>
                </Pressable>
              ))
            )}
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>

        <Pressable
          onPress={() => router.push("/add-shift")}
          style={({ pressed }) => [
            styles.fab,
            {
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <LinearGradient
            colors={["#c5d9ff", "#adc6ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <IconSymbol name="plus" size={30} color={tokens.surface_darkest} />
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
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 150,
    gap: 20,
  },
  header: {
    minHeight: 64,
    borderRadius: 20,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  brandInitial: {
    fontWeight: "800",
  },
  brandText: {
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    borderRadius: 26,
    padding: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.4,
    shadowRadius: 48,
    elevation: 16,
  },
  heroOrb: {
    position: "absolute",
    right: -40,
    top: -36,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  heroChip: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  heroRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  heroTitle: {
    marginBottom: 2,
  },
  heroSubtitle: {
    marginBottom: 16,
  },
  heroMetaWrap: {
    gap: 8,
  },
  heroMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  heroEmpty: {
    gap: 6,
    paddingVertical: 6,
  },
  quickActionGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 106,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  quickIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionGroup: {
    gap: 12,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 2,
  },
  conflictCard: {
    borderRadius: 24,
    padding: 18,
    borderLeftWidth: 4,
    overflow: "hidden",
  },
  conflictGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  conflictIntro: {
    marginBottom: 10,
  },
  conflictRows: {
    gap: 8,
  },
  conflictRow: {
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  resolveButton: {
    marginTop: 14,
    borderRadius: 999,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  resolveTextMuted: {
    opacity: 0.9,
  },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  emptyCard: {
    borderRadius: 18,
    minHeight: 74,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  scheduleCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  scheduleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  scheduleRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  scheduleMarker: {
    width: 5,
    height: 36,
    borderRadius: 4,
  },
  sectionTitleSpacing: {
    paddingHorizontal: 2,
  },
  weekScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  weekCard: {
    minWidth: 114,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  weekBar: {
    width: 40,
    height: 4,
    borderRadius: 3,
  },
  sectionHeaderInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  workplaceCard: {
    borderRadius: 16,
    paddingHorizontal: 14,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  workplaceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  workplaceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bottomSpace: {
    height: 8,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 94,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.36,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 24,
    elevation: 10,
  },
  fabGradient: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
});
