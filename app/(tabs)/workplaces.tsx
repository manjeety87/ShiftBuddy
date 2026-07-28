import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppCard } from "@/components/ui/app-card";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { GlassHeader } from "@/components/ui/glass-header";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useShiftStore } from "@/store";
import type { Shift, Workplace } from "@/types";

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const shiftHours = (shift: Shift) =>
  Math.max(
    0,
    (new Date(shift.endDateTime).getTime() -
      new Date(shift.startDateTime).getTime()) /
      3_600_000,
  );

function weekStart(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day));
  start.setHours(0, 0, 0, 0);
  return start;
}

export default function WorkplacesScreen() {
  const { tokens } = useAppTheme();
  const user = useShiftStore((s) => s.user);
  const workplaces = useShiftStore((s) => s.workplaces);
  const shifts = useShiftStore((s) => s.shifts);
  const conflicts = useShiftStore((s) => s.conflicts);

  const now = useMemo(() => new Date(), []);
  const weekStartDate = useMemo(() => weekStart(now), [now]);
  const weekEndDate = useMemo(() => {
    const end = new Date(weekStartDate);
    end.setDate(end.getDate() + 7);
    return end;
  }, [weekStartDate]);

  const wpStats = useMemo(() => {
    const map = new Map<
      string,
      {
        totalShifts: number;
        totalHours: number;
        weeklyHours: number;
        upcoming: number;
        earnings: number;
        nextShiftTitle: string | null;
        nextShiftTime: string | null;
        nextShiftDate: string | null;
      }
    >();

    for (const wp of workplaces) {
      const wpShifts = shifts.filter(
        (s) => s.workplaceId === wp.id && s.status !== "cancelled",
      );

      const totalHours = wpShifts.reduce(
        (acc, shift) => acc + shiftHours(shift),
        0,
      );

      const weeklyHours = wpShifts
        .filter((shift) => {
          const start = new Date(shift.startDateTime);
          return start >= weekStartDate && start < weekEndDate;
        })
        .reduce((acc, shift) => acc + shiftHours(shift), 0);

      const upcomingShifts = wpShifts.filter(
        (shift) => new Date(shift.startDateTime) > now,
      );

      const next = upcomingShifts.sort(
        (a, b) =>
          new Date(a.startDateTime).getTime() -
          new Date(b.startDateTime).getTime(),
      )[0];

      map.set(wp.id, {
        totalShifts: wpShifts.length,
        totalHours,
        weeklyHours,
        upcoming: upcomingShifts.length,
        earnings: totalHours * (wp.hourlyRate ?? 0),
        nextShiftTitle: next?.title ?? null,
        nextShiftTime: next
          ? `${fmtTime(next.startDateTime)} – ${fmtTime(next.endDateTime)}`
          : null,
        nextShiftDate: next ? fmtDate(next.startDateTime) : null,
      });
    }

    return map;
  }, [workplaces, shifts, now, weekStartDate, weekEndDate]);

  const statValues = Array.from(wpStats.values());
  const totalEarnings = statValues.reduce((acc, s) => acc + s.earnings, 0);
  const totalWeeklyHours = statValues.reduce(
    (acc, s) => acc + s.weeklyHours,
    0,
  );

  const featuredWorkplace: Workplace | null =
    workplaces.length === 0
      ? null
      : [...workplaces].sort(
          (a, b) =>
            (wpStats.get(b.id)?.weeklyHours ?? 0) -
            (wpStats.get(a.id)?.weeklyHours ?? 0),
        )[0];

  const otherWorkplaces = workplaces.filter(
    (wp) => wp.id !== featuredWorkplace?.id,
  );

  const unresolvedConflicts = conflicts.filter((c) => !c.resolved).length;

  const goToEdit = (id: string) => router.push(`/add-workplace?id=${id}`);

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
              <MaterialCommunityIcons
                name="bell-outline"
                size={22}
                color={tokens.primary}
              />
            </Pressable>
          </View>
        </GlassHeader>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.overview}>
            <View style={styles.overviewLeft}>
              <AppText variant="overline" color={tokens.primary}>
                Management Dashboard
              </AppText>
              <AppText variant="largeTitle" color={tokens.textPrimary}>
                Your Workplaces
              </AppText>
            </View>

            <View
              style={[
                styles.avgPill,
                {
                  borderRadius: tokens.radiusMedium,
                  backgroundColor: tokens.glassBackgroundStrong,
                  borderColor: tokens.glassBorder,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="trending-up"
                size={16}
                color={tokens.primary}
              />
              <AppText variant="captionBold" color={tokens.textPrimary}>
                {totalWeeklyHours.toFixed(1)} hrs / week
              </AppText>
            </View>
          </View>

          {featuredWorkplace ? (
            <FeaturedWorkplaceCard
              workplace={featuredWorkplace}
              stats={wpStats.get(featuredWorkplace.id)!}
              weeklyShare={
                totalWeeklyHours > 0
                  ? (wpStats.get(featuredWorkplace.id)!.weeklyHours /
                      totalWeeklyHours) *
                    100
                  : 0
              }
              onEdit={() => goToEdit(featuredWorkplace.id)}
              onManage={() => router.push("/(tabs)/shifts")}
            />
          ) : null}

          <View style={styles.grid}>
            {otherWorkplaces.map((wp) => (
              <CompactWorkplaceCard
                key={wp.id}
                workplace={wp}
                stats={wpStats.get(wp.id)!}
                onEdit={() => goToEdit(wp.id)}
              />
            ))}

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/add-workplace")}
              style={({ pressed }) => [
                styles.gridItem,
                styles.addTile,
                {
                  borderRadius: tokens.radiusXLarge,
                  borderColor: tokens.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.addIcon,
                  {
                    borderRadius: tokens.radiusPill,
                    backgroundColor: tokens.surfaceMuted,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={26}
                  color={tokens.primary}
                />
              </View>
              <AppText variant="bodyBold" color={tokens.textSecondary}>
                Add Workplace
              </AppText>
            </Pressable>

            <AppCard style={styles.gridItem} padding={18}>
              <View style={styles.statsCardRow}>
                <View
                  style={[
                    styles.statsIcon,
                    {
                      borderRadius: tokens.radiusPill,
                      backgroundColor: tokens.warningSoft,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="cash-multiple"
                    size={20}
                    color={tokens.warning}
                  />
                </View>
                <View style={styles.flexText}>
                  <AppText variant="label" color={tokens.textSecondary}>
                    EST. EARNINGS
                  </AppText>
                  <AppText variant="heading" color={tokens.textPrimary}>
                    ${totalEarnings.toFixed(2)}
                  </AppText>
                </View>
              </View>
            </AppCard>
          </View>

          {workplaces.length === 0 && (
            <AppCard style={styles.emptyCard}>
              <View style={styles.emptyInner}>
                <MaterialCommunityIcons
                  name="briefcase-outline"
                  size={40}
                  color={tokens.textSecondary}
                />
                <AppText variant="heading" color={tokens.textPrimary} center>
                  No workplaces yet
                </AppText>
                <AppText variant="body" color={tokens.textSecondary} center>
                  Add your first job to start tracking shifts
                </AppText>
              </View>
            </AppCard>
          )}

          {featuredWorkplace && (
            <View
              style={[
                styles.infoBanner,
                {
                  borderRadius: tokens.radiusLarge,
                  backgroundColor: tokens.primarySoft,
                  borderColor: tokens.border,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color={tokens.primary}
              />
              <AppText
                variant="caption"
                color={tokens.textSecondary}
                style={styles.flexText}
              >
                Your workplaces are ranked by this week&apos;s activity.
                Shifts from{" "}
                <AppText variant="captionBold" color={tokens.textPrimary}>
                  {featuredWorkplace.name}
                </AppText>{" "}
                have the highest priority in your calendar this week.
                {unresolvedConflicts > 0
                  ? ` You have ${unresolvedConflicts} unresolved conflict${
                      unresolvedConflicts === 1 ? "" : "s"
                    } that need your attention.`
                  : " No scheduling conflicts right now."}
              </AppText>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </AppScreen>
  );
}

interface WorkplaceStats {
  totalShifts: number;
  totalHours: number;
  weeklyHours: number;
  upcoming: number;
  earnings: number;
  nextShiftTitle: string | null;
  nextShiftTime: string | null;
  nextShiftDate: string | null;
}

function FeaturedWorkplaceCard({
  workplace,
  stats,
  weeklyShare,
  onEdit,
  onManage,
}: {
  workplace: Workplace;
  stats: WorkplaceStats;
  weeklyShare: number;
  onEdit: () => void;
  onManage: () => void;
}) {
  const { tokens } = useAppTheme();

  return (
    <AppCard accentBorder={workplace.color} padding={22}>
      <View style={styles.featuredHeader}>
        <View
          style={[
            styles.featuredIcon,
            {
              borderRadius: tokens.radiusMedium,
              backgroundColor: workplace.color,
            },
          ]}
        >
          <MaterialCommunityIcons name="briefcase" size={26} color="#fff" />
        </View>

        <View
          style={[
            styles.activeBadge,
            {
              borderRadius: tokens.radiusPill,
              backgroundColor: tokens.primarySoft,
            },
          ]}
        >
          <AppText variant="label" color={tokens.primary}>
            ACTIVE
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit workplace"
          hitSlop={10}
          onPress={onEdit}
          style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={20}
            color={tokens.textSecondary}
          />
        </Pressable>
      </View>

      <AppText variant="title" color={tokens.textPrimary} style={styles.featuredName}>
        {workplace.name}
      </AppText>

      {workplace.notes ? (
        <AppText variant="body" color={tokens.textSecondary} numberOfLines={2}>
          {workplace.notes}
        </AppText>
      ) : null}

      <View
        style={[
          styles.loadCard,
          {
            borderRadius: tokens.radiusMedium,
            backgroundColor: tokens.surfaceMuted,
          },
        ]}
      >
        <View style={styles.loadHeader}>
          <AppText variant="label" color={tokens.textSecondary}>
            WEEKLY LOAD
          </AppText>
          <AppText variant="captionBold" color={tokens.primary}>
            {stats.weeklyHours.toFixed(1)}h this week
          </AppText>
        </View>

        <View
          style={[
            styles.loadTrack,
            {
              borderRadius: tokens.radiusPill,
              backgroundColor: tokens.surfaceSelected,
            },
          ]}
        >
          <View
            style={[
              styles.loadFill,
              {
                borderRadius: tokens.radiusPill,
                backgroundColor: tokens.primary,
                width: `${Math.min(100, Math.max(4, weeklyShare))}%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.featuredFooter}>
        <AppText variant="caption" color={tokens.textSecondary}>
          {stats.totalShifts} shift{stats.totalShifts === 1 ? "" : "s"} ·{" "}
          {stats.totalHours.toFixed(1)}h total
        </AppText>

        <Pressable
          accessibilityRole="button"
          onPress={onManage}
          style={({ pressed }) => [
            styles.manageRow,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <AppText variant="bodyBold" color={tokens.primary}>
            Manage Shifts
          </AppText>
          <MaterialCommunityIcons
            name="arrow-right"
            size={16}
            color={tokens.primary}
          />
        </Pressable>
      </View>
    </AppCard>
  );
}

function CompactWorkplaceCard({
  workplace,
  stats,
  onEdit,
}: {
  workplace: Workplace;
  stats: WorkplaceStats;
  onEdit: () => void;
}) {
  const { tokens } = useAppTheme();

  return (
    <AppCard accentBorder={workplace.color} style={styles.gridItem} padding={18}>
      <View style={styles.compactHeader}>
        <View
          style={[styles.compactBar, { backgroundColor: workplace.color }]}
        />
        <View style={styles.flexText}>
          <AppText variant="bodyBold" color={tokens.textPrimary} numberOfLines={1}>
            {workplace.name}
          </AppText>
          {workplace.notes ? (
            <AppText
              variant="caption"
              color={tokens.textSecondary}
              numberOfLines={1}
            >
              {workplace.notes}
            </AppText>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit workplace"
          hitSlop={10}
          onPress={onEdit}
          style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={16}
            color={tokens.textSecondary}
          />
        </Pressable>
      </View>

      <View style={styles.compactFooter}>
        <View>
          <AppText variant="label" color={tokens.textSecondary}>
            THIS WEEK
          </AppText>
          <AppText variant="heading" color={tokens.textPrimary}>
            {stats.weeklyHours.toFixed(1)}
            <AppText variant="caption" color={tokens.textSecondary}>
              {" "}
              hrs
            </AppText>
          </AppText>
        </View>

        <MaterialCommunityIcons
          name="chart-bar"
          size={20}
          color={tokens.textTertiary}
        />
      </View>
    </AppCard>
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },

  overviewLeft: {
    flex: 1,
    minWidth: 180,
    gap: 4,
  },

  avgPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: StyleSheet.hairlineWidth,
  },

  featuredHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  featuredIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  activeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: "auto",
  },

  featuredName: {
    marginBottom: 4,
  },

  loadCard: {
    padding: 14,
    marginTop: 16,
    gap: 8,
  },

  loadHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  loadTrack: {
    height: 8,
    overflow: "hidden",
  },

  loadFill: {
    height: 8,
  },

  featuredFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
  },

  manageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  gridItem: {
    width: "47%",
    flexGrow: 1,
  },

  addTile: {
    minHeight: 140,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 2,
    borderStyle: "dashed",
  },

  addIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  statsCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  statsIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  compactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  compactBar: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },

  compactFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  flexText: {
    flex: 1,
    minWidth: 0,
  },

  emptyCard: {
    marginTop: 8,
  },

  emptyInner: {
    paddingVertical: 40,
    gap: 10,
    alignItems: "center",
  },

  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },

  bottomSpacer: {
    height: 10,
  },
});
