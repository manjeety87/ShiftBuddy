import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppBadge } from "@/components/ui/app-badge";
import { AppCard } from "@/components/ui/app-card";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useShiftStore } from "@/store";

// ─── Helpers ────────────────────────────────────────────────────────
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export default function WorkplacesScreen() {
  const { colors } = useAppTheme();
  const workplaces = useShiftStore((s) => s.workplaces);
  const shifts = useShiftStore((s) => s.shifts);

  const now = useMemo(() => new Date(), []);

  // Per-workplace derived stats
  const wpStats = useMemo(() => {
    const map = new Map<
      string,
      {
        total: number;
        upcoming: number;
        hours: number;
        earnings: number;
        nextShiftTitle: string | null;
        nextShiftTime: string | null;
        nextShiftDate: string | null;
      }
    >();
    for (const wp of workplaces) {
      const wpShifts = shifts.filter((s) => s.workplaceId === wp.id);
      const upcomingShifts = wpShifts.filter(
        (s) => new Date(s.startDateTime) > now && s.status !== "cancelled",
      );
      const hours = wpShifts.reduce(
        (acc, s) =>
          acc +
          (new Date(s.endDateTime).getTime() -
            new Date(s.startDateTime).getTime()) /
            3_600_000,
        0,
      );
      const next = upcomingShifts.sort(
        (a, b) =>
          new Date(a.startDateTime).getTime() -
          new Date(b.startDateTime).getTime(),
      )[0];
      map.set(wp.id, {
        total: wpShifts.length,
        upcoming: upcomingShifts.length,
        hours,
        earnings: hours * (wp.hourlyRate ?? 0),
        nextShiftTitle: next?.title ?? null,
        nextShiftTime: next
          ? `${fmtTime(next.startDateTime)} – ${fmtTime(next.endDateTime)}`
          : null,
        nextShiftDate: next ? fmtDate(next.startDateTime) : null,
      });
    }
    return map;
  }, [workplaces, shifts, now]);

  // Totals
  const totalEarnings = Array.from(wpStats.values()).reduce(
    (acc, s) => acc + s.earnings,
    0,
  );
  const totalHours = Array.from(wpStats.values()).reduce(
    (acc, s) => acc + s.hours,
    0,
  );

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ━━ Header ━━ */}
        <View style={styles.headerRow}>
          <View style={styles.flex1}>
            <AppText variant="largeTitle">Jobs</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {workplaces.length} workplace{workplaces.length !== 1 ? "s" : ""}
            </AppText>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.addBtn,
              {
                backgroundColor: colors.accent,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
            <AppText variant="captionBold" color="#fff">
              Add Job
            </AppText>
          </Pressable>
        </View>

        {/* ━━ Overview Stats ━━ */}
        <View style={styles.overviewRow}>
          <AppCard style={styles.overviewCard} padding={14}>
            <AppText variant="title" color={colors.accent} center>
              {workplaces.length}
            </AppText>
            <AppText variant="label" center>
              Jobs
            </AppText>
          </AppCard>
          <AppCard style={styles.overviewCard} padding={14}>
            <AppText variant="title" color={colors.success} center>
              {totalHours.toFixed(0)}
            </AppText>
            <AppText variant="label" center>
              Total Hrs
            </AppText>
          </AppCard>
          <AppCard style={styles.overviewCard} padding={14}>
            <AppText variant="title" color={colors.warning} center>
              ${totalEarnings.toFixed(0)}
            </AppText>
            <AppText variant="label" center>
              Est. Pay
            </AppText>
          </AppCard>
        </View>

        {/* ━━ Workplace Cards ━━ */}
        {workplaces.map((wp) => {
          const stats = wpStats.get(wp.id)!;
          return (
            <AppCard key={wp.id} accentBorder={wp.color} style={styles.card}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.colorBadge,
                    {
                      backgroundColor: wp.color + "22",
                      borderColor: wp.color + "44",
                    },
                  ]}
                >
                  <IconSymbol
                    name="briefcase.fill"
                    size={18}
                    color={wp.color}
                  />
                </View>
                <View style={styles.flex1}>
                  <AppText variant="heading">{wp.name}</AppText>
                  {wp.hourlyRate !== undefined && (
                    <AppText variant="caption" color={colors.textSecondary}>
                      ${wp.hourlyRate.toFixed(2)}/hr
                    </AppText>
                  )}
                </View>
                <Pressable
                  hitSlop={10}
                  style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                >
                  <IconSymbol
                    name="pencil"
                    size={18}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>

              {/* Mini Stats Row */}
              <View style={styles.miniStats}>
                <View
                  style={[
                    styles.miniStatPill,
                    { backgroundColor: colors.accent + "14" },
                  ]}
                >
                  <AppText variant="captionBold" color={colors.accent}>
                    {stats.total} shifts
                  </AppText>
                </View>
                <View
                  style={[
                    styles.miniStatPill,
                    { backgroundColor: colors.success + "14" },
                  ]}
                >
                  <AppText variant="captionBold" color={colors.success}>
                    {stats.hours.toFixed(1)}h
                  </AppText>
                </View>
                <View
                  style={[
                    styles.miniStatPill,
                    { backgroundColor: colors.warning + "14" },
                  ]}
                >
                  <AppText variant="captionBold" color={colors.warning}>
                    ${stats.earnings.toFixed(0)}
                  </AppText>
                </View>
                {stats.upcoming > 0 && (
                  <AppBadge
                    label={`${stats.upcoming} upcoming`}
                    variant="accent"
                  />
                )}
              </View>

              {/* Details */}
              <View style={styles.detailsSection}>
                {wp.address && (
                  <View style={styles.detailRow}>
                    <IconSymbol
                      name="mappin"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <AppText variant="caption" color={colors.textSecondary}>
                      {wp.address}
                    </AppText>
                  </View>
                )}
                {wp.notes && (
                  <View style={styles.detailRow}>
                    <IconSymbol
                      name="note.text"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <AppText
                      variant="caption"
                      color={colors.textSecondary}
                      style={styles.flex1}
                      numberOfLines={2}
                    >
                      {wp.notes}
                    </AppText>
                  </View>
                )}
              </View>

              {/* Next Shift Preview */}
              {stats.nextShiftTitle && (
                <View
                  style={[
                    styles.nextShift,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.flex1}>
                    <AppText variant="overline">NEXT SHIFT</AppText>
                    <AppText variant="bodyBold" style={styles.nextTitle}>
                      {stats.nextShiftTitle}
                    </AppText>
                    <View style={styles.nextMeta}>
                      <IconSymbol
                        name="clock.fill"
                        size={12}
                        color={colors.textSecondary}
                      />
                      <AppText variant="caption" color={colors.textSecondary}>
                        {stats.nextShiftDate} · {stats.nextShiftTime}
                      </AppText>
                    </View>
                  </View>
                  <IconSymbol
                    name="chevron.right"
                    size={16}
                    color={colors.textSecondary}
                  />
                </View>
              )}
            </AppCard>
          );
        })}

        {/* Empty State */}
        {workplaces.length === 0 && (
          <AppCard style={styles.emptyCard}>
            <View style={styles.emptyInner}>
              <IconSymbol
                name="briefcase.fill"
                size={40}
                color={colors.textSecondary}
              />
              <AppText variant="heading" center>
                No workplaces yet
              </AppText>
              <AppText variant="body" color={colors.textSecondary} center>
                Add your first job to start tracking shifts
              </AppText>
            </View>
          </AppCard>
        )}

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
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

  // Overview
  overviewRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  overviewCard: { flex: 1, alignItems: "center" },

  // Card
  card: { marginBottom: 16 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  colorBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Mini stats
  miniStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  miniStatPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  // Details
  detailsSection: { gap: 6, marginBottom: 4 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Next shift
  nextShift: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  nextTitle: { marginTop: 2 },
  nextMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },

  // Empty
  emptyCard: { marginTop: 20 },
  emptyInner: { paddingVertical: 40, gap: 10, alignItems: "center" },

  // Shared
  flex1: { flex: 1 },
  bottomSpacer: { height: 100 },
});
