import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppBadge } from "@/components/ui/app-badge";
import { AppCard } from "@/components/ui/app-card";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useShiftStore } from "@/store";
import type { Shift } from "@/types";

// ─── Helpers ────────────────────────────────────────────────────────
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const shiftDurationHrs = (s: Shift) =>
  (
    (new Date(s.endDateTime).getTime() - new Date(s.startDateTime).getTime()) /
    3_600_000
  ).toFixed(1);

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const shifts = useShiftStore((s) => s.shifts);
  const workplaces = useShiftStore((s) => s.workplaces);
  const conflicts = useShiftStore((s) => s.conflicts);
  const user = useShiftStore((s) => s.user);

  const now = new Date();

  // ── Derived data ──
  const upcoming = shifts
    .filter((s) => s.status !== "cancelled" && new Date(s.startDateTime) > now)
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    );
  const nextShift = upcoming[0];
  const nextWp = nextShift
    ? workplaces.find((w) => w.id === nextShift.workplaceId)
    : undefined;

  const todayStr = now.toDateString();
  const todayShifts = shifts
    .filter((s) => new Date(s.startDateTime).toDateString() === todayStr)
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    );

  const todayTotalHrs = todayShifts.reduce(
    (acc, s) =>
      acc +
      (new Date(s.endDateTime).getTime() -
        new Date(s.startDateTime).getTime()) /
        3_600_000,
    0,
  );

  // Upcoming 7-day preview (exclude today)
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekShifts = shifts
    .filter((s) => {
      const d = new Date(s.startDateTime);
      return d.toDateString() !== todayStr && d > now && d < weekEnd;
    })
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    );

  const unresolvedConflicts = conflicts.filter((c) => !c.resolved);

  // ── Render ──
  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ━━ Header ━━ */}
        <View style={styles.header}>
          <View style={styles.flex1}>
            <AppText variant="body" color={colors.textSecondary}>
              {now.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </AppText>
            <AppText variant="largeTitle" style={styles.appName}>
              ShiftBuddy
            </AppText>
          </View>
          {/* Avatar placeholder */}
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: colors.accent + "22",
                borderColor: colors.accent,
              },
            ]}
          >
            <AppText variant="subheading" color={colors.accent}>
              {user.name.charAt(0)}
            </AppText>
          </View>
        </View>

        {/* ━━ Next Shift Hero Card ━━ */}
        <AppCard style={styles.heroCard} accentBorder={nextWp?.color}>
          <View style={styles.heroTop}>
            <AppText variant="overline">NEXT SHIFT</AppText>
            {nextShift && (
              <AppBadge
                label={nextShift.status === "pending" ? "Pending" : "Confirmed"}
                variant={nextShift.status === "pending" ? "warning" : "success"}
              />
            )}
          </View>
          {nextShift ? (
            <>
              <AppText variant="heading" style={styles.heroTitle}>
                {nextShift.title}
              </AppText>
              <View style={styles.heroMeta}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: nextWp?.color ?? colors.accent },
                  ]}
                />
                <AppText variant="body" color={colors.textSecondary}>
                  {nextWp?.name ?? "Unknown"}
                </AppText>
              </View>
              <View style={styles.heroTimeRow}>
                <IconSymbol
                  name="clock.fill"
                  size={16}
                  color={colors.textSecondary}
                />
                <AppText variant="bodyBold" color={colors.textPrimary}>
                  {fmtTime(nextShift.startDateTime)} –{" "}
                  {fmtTime(nextShift.endDateTime)}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  ({shiftDurationHrs(nextShift)}h)
                </AppText>
              </View>
              <AppText
                variant="caption"
                color={colors.textSecondary}
                style={styles.heroDate}
              >
                {fmtDate(nextShift.startDateTime)}
              </AppText>
            </>
          ) : (
            <View style={styles.emptyState}>
              <AppText variant="heading" center>
                All clear! 🎉
              </AppText>
              <AppText variant="body" color={colors.textSecondary} center>
                No upcoming shifts scheduled
              </AppText>
            </View>
          )}
        </AppCard>

        {/* ━━ Conflict Alert ━━ */}
        {unresolvedConflicts.length > 0 && (
          <Pressable onPress={() => router.push("/conflicts")}>
            <AppCard
              style={[
                styles.conflictCard,
                { borderColor: colors.error + "44" },
              ]}
            >
              <View style={styles.conflictInner}>
                <IconSymbol
                  name="exclamationmark.triangle.fill"
                  size={22}
                  color={colors.error}
                />
                <View style={styles.flex1}>
                  <AppText variant="bodyBold" color={colors.error}>
                    {unresolvedConflicts.length} Shift Conflict
                    {unresolvedConflicts.length > 1 ? "s" : ""}
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    Overlapping shifts detected — tap to review
                  </AppText>
                </View>
                <IconSymbol
                  name="chevron.right"
                  size={18}
                  color={colors.textSecondary}
                />
              </View>
            </AppCard>
          </Pressable>
        )}

        {/* ━━ Today's Timeline ━━ */}
        <View style={styles.sectionHeader}>
          <AppText variant="subheading">Today</AppText>
          <AppBadge
            label={`${todayShifts.length} shift${todayShifts.length !== 1 ? "s" : ""} · ${todayTotalHrs.toFixed(1)}h`}
            variant="accent"
          />
        </View>

        {todayShifts.length === 0 ? (
          <AppCard style={styles.mb16}>
            <AppText variant="body" color={colors.textSecondary} center>
              No shifts today — enjoy your day off! ☀️
            </AppText>
          </AppCard>
        ) : (
          todayShifts.map((shift, idx) => {
            const wp = workplaces.find((w) => w.id === shift.workplaceId);
            const isPast = new Date(shift.endDateTime) < now;
            const isNow =
              new Date(shift.startDateTime) <= now &&
              new Date(shift.endDateTime) >= now;
            return (
              <AppCard
                key={shift.id}
                accentBorder={wp?.color}
                style={[styles.timelineCard, isPast && { opacity: 0.55 }]}
              >
                <View style={styles.timelineRow}>
                  {/* Time column */}
                  <View style={styles.timeCol}>
                    <AppText variant="bodyBold">
                      {fmtTime(shift.startDateTime)}
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {fmtTime(shift.endDateTime)}
                    </AppText>
                  </View>
                  {/* Divider */}
                  <View style={styles.dividerCol}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: isNow
                            ? colors.success
                            : (wp?.color ?? colors.accent),
                          borderColor: isNow
                            ? colors.success + "44"
                            : "transparent",
                        },
                      ]}
                    />
                    {idx < todayShifts.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          { backgroundColor: colors.border },
                        ]}
                      />
                    )}
                  </View>
                  {/* Shift info */}
                  <View style={styles.flex1}>
                    <View style={styles.shiftInfoTop}>
                      <AppText variant="bodyBold" style={styles.flex1}>
                        {shift.title}
                      </AppText>
                      {isNow && <AppBadge label="NOW" variant="success" />}
                      {shift.status === "pending" && (
                        <AppBadge label="Pending" variant="warning" />
                      )}
                    </View>
                    <View style={styles.shiftInfoBottom}>
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: wp?.color ?? colors.accent },
                        ]}
                      />
                      <AppText variant="caption" color={colors.textSecondary}>
                        {wp?.name ?? "Unknown"} · {shiftDurationHrs(shift)}h
                      </AppText>
                    </View>
                  </View>
                </View>
              </AppCard>
            );
          })
        )}

        {/* ━━ Upcoming Week Preview ━━ */}
        {weekShifts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <AppText variant="subheading">Upcoming Week</AppText>
              <AppBadge
                label={`${weekShifts.length} shifts`}
                variant="accent"
              />
            </View>
            {weekShifts.slice(0, 5).map((shift) => {
              const wp = workplaces.find((w) => w.id === shift.workplaceId);
              return (
                <AppCard
                  key={shift.id}
                  accentBorder={wp?.color}
                  style={styles.weekCard}
                  padding={14}
                >
                  <View style={styles.weekRow}>
                    <View style={styles.weekDateCol}>
                      <AppText variant="captionBold" color={colors.accent}>
                        {new Date(shift.startDateTime).toLocaleDateString(
                          undefined,
                          {
                            weekday: "short",
                          },
                        )}
                      </AppText>
                      <AppText variant="bodyBold">
                        {new Date(shift.startDateTime).getDate()}
                      </AppText>
                    </View>
                    <View style={styles.flex1}>
                      <AppText variant="bodyBold">{shift.title}</AppText>
                      <View style={styles.weekMeta}>
                        <View
                          style={[
                            styles.dotSm,
                            { backgroundColor: wp?.color ?? colors.accent },
                          ]}
                        />
                        <AppText variant="caption" color={colors.textSecondary}>
                          {wp?.name} · {fmtTime(shift.startDateTime)} –{" "}
                          {fmtTime(shift.endDateTime)}
                        </AppText>
                      </View>
                    </View>
                    {shift.status === "pending" && (
                      <AppBadge label="Pending" variant="warning" />
                    )}
                  </View>
                </AppCard>
              );
            })}
            {weekShifts.length > 5 && (
              <AppText
                variant="captionBold"
                color={colors.accent}
                center
                style={styles.mb16}
              >
                +{weekShifts.length - 5} more shifts this week
              </AppText>
            )}
          </>
        )}

        {/* ━━ Quick Actions ━━ */}
        <AppText variant="subheading" style={styles.sectionTitle}>
          Quick Actions
        </AppText>
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => router.push("/add-shift")}
            style={({ pressed }) => [
              styles.actionCard,
              {
                backgroundColor: colors.accent + "14",
                borderColor: colors.accent + "33",
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <IconSymbol
              name="plus.circle.fill"
              size={28}
              color={colors.accent}
            />
            <AppText variant="captionBold" color={colors.accent}>
              Add Shift
            </AppText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              {
                backgroundColor: colors.success + "14",
                borderColor: colors.success + "33",
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <IconSymbol name="camera.fill" size={28} color={colors.success} />
            <AppText variant="captionBold" color={colors.success}>
              Upload
            </AppText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              {
                backgroundColor: colors.warning + "14",
                borderColor: colors.warning + "33",
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <IconSymbol
              name="arrow.triangle.2.circlepath"
              size={28}
              color={colors.warning}
            />
            <AppText variant="captionBold" color={colors.warning}>
              Sync Cal
            </AppText>
          </Pressable>
        </View>

        {/* ━━ Stats Row ━━ */}
        <View style={styles.statsRow}>
          <AppCard style={styles.statCard} padding={14}>
            <AppText variant="title" color={colors.accent} center>
              {workplaces.length}
            </AppText>
            <AppText variant="label" center>
              Jobs
            </AppText>
          </AppCard>

          <AppCard style={styles.statCard} padding={14}>
            <AppText
              variant="title"
              color={
                unresolvedConflicts.length > 0 ? colors.warning : colors.success
              }
              center
            >
              {unresolvedConflicts.length}
            </AppText>
            <AppText variant="label" center>
              Conflicts
            </AppText>
          </AppCard>

          <AppCard style={styles.statCard} padding={14}>
            <AppText variant="title" color={colors.success} center>
              {upcoming.length}
            </AppText>
            <AppText variant="label" center>
              Upcoming
            </AppText>
          </AppCard>
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AppScreen>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 12 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  appName: { marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  // Hero
  heroCard: { marginBottom: 16 },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  heroTitle: { marginBottom: 6 },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  heroTimeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroDate: { marginTop: 6 },

  emptyState: { paddingVertical: 20, gap: 4 },

  // Conflicts
  conflictCard: {
    marginBottom: 16,
    borderWidth: 1,
  },
  conflictInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // Section headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: { marginBottom: 12, marginTop: 4 },

  // Timeline
  timelineCard: { marginBottom: 10 },
  timelineRow: { flexDirection: "row", gap: 12 },
  timeCol: { width: 52, alignItems: "flex-end" },
  dividerCol: { alignItems: "center", width: 20 },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    marginTop: 3,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    borderRadius: 1,
  },
  shiftInfoTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  shiftInfoBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  // Week preview
  weekCard: { marginBottom: 8 },
  weekRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  weekDateCol: { alignItems: "center", width: 38 },
  weekMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },

  // Quick actions
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
  },

  // Stats
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, alignItems: "center" },

  // Shared
  flex1: { flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotSm: { width: 6, height: 6, borderRadius: 3 },
  mb16: { marginBottom: 16 },
  bottomSpacer: { height: 100 },
});
