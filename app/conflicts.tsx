import { router } from "expo-router";
import React, { useMemo } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppBadge } from "@/components/ui/app-badge";
import { AppButton } from "@/components/ui/app-button";
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

const shiftDur = (start: string, end: string) =>
  ((new Date(end).getTime() - new Date(start).getTime()) / 3_600_000).toFixed(
    1,
  );

export default function ConflictsScreen() {
  const { colors } = useAppTheme();
  const conflicts = useShiftStore((s) => s.conflicts);
  const shifts = useShiftStore((s) => s.shifts);
  const workplaces = useShiftStore((s) => s.workplaces);
  const setConflicts = useShiftStore((s) => s.setConflicts);
  const removeShift = useShiftStore((s) => s.removeShift);

  const unresolved = useMemo(
    () => conflicts.filter((c) => !c.resolved),
    [conflicts],
  );
  const resolved = useMemo(
    () => conflicts.filter((c) => c.resolved),
    [conflicts],
  );

  const handleResolve = (conflictId: string) => {
    setConflicts(
      conflicts.map((c) =>
        c.id === conflictId ? { ...c, resolved: true } : c,
      ),
    );
  };

  const handleDismissShift = (conflictId: string, shiftId: string) => {
    const shift = shifts.find((s) => s.id === shiftId);
    Alert.alert(
      "Cancel Shift?",
      `This will cancel "${shift?.title ?? "this shift"}". The conflict will be resolved.`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Cancel Shift",
          style: "destructive",
          onPress: () => {
            removeShift(shiftId);
            handleResolve(conflictId);
          },
        },
      ],
    );
  };

  return (
    <AppScreen safeTop>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <IconSymbol name="chevron.left" size={24} color={colors.accent} />
          </Pressable>
          <AppText variant="heading" style={styles.flex1} center>
            Conflicts
          </AppText>
          <View style={styles.headerSpacer} />
        </View>

        {/* ── Summary ── */}
        <AppCard style={styles.summaryCard} padding={16}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={28}
                color={unresolved.length > 0 ? colors.error : colors.success}
              />
              <AppText
                variant="title"
                color={unresolved.length > 0 ? colors.error : colors.success}
              >
                {unresolved.length}
              </AppText>
              <AppText variant="label">Unresolved</AppText>
            </View>
            <View
              style={[
                styles.summaryDivider,
                { backgroundColor: colors.border },
              ]}
            />
            <View style={styles.summaryItem}>
              <IconSymbol
                name="checkmark.circle.fill"
                size={28}
                color={colors.success}
              />
              <AppText variant="title" color={colors.success}>
                {resolved.length}
              </AppText>
              <AppText variant="label">Resolved</AppText>
            </View>
          </View>
        </AppCard>

        {/* ── Unresolved ── */}
        {unresolved.length > 0 && (
          <>
            <AppText variant="subheading" style={styles.sectionTitle}>
              Needs Attention
            </AppText>
            {unresolved.map((conflict) => {
              const shiftA = shifts.find((s) => s.id === conflict.shiftAId);
              const shiftB = shifts.find((s) => s.id === conflict.shiftBId);
              const wpA = workplaces.find((w) => w.id === shiftA?.workplaceId);
              const wpB = workplaces.find((w) => w.id === shiftB?.workplaceId);

              if (!shiftA || !shiftB) return null;

              return (
                <AppCard
                  key={conflict.id}
                  style={[
                    styles.conflictCard,
                    { borderColor: colors.error + "44" },
                  ]}
                >
                  {/* Overlap banner */}
                  <View
                    style={[
                      styles.overlapBanner,
                      { backgroundColor: colors.error + "14" },
                    ]}
                  >
                    <IconSymbol
                      name="exclamationmark.triangle.fill"
                      size={16}
                      color={colors.error}
                    />
                    <AppText variant="captionBold" color={colors.error}>
                      {conflict.overlapMinutes} min overlap
                    </AppText>
                  </View>

                  {/* Shift A */}
                  <View style={styles.shiftBlock}>
                    <View style={styles.shiftHeader}>
                      <View
                        style={[
                          styles.wpDot,
                          { backgroundColor: wpA?.color ?? colors.accent },
                        ]}
                      />
                      <AppText variant="bodyBold" style={styles.flex1}>
                        {shiftA.title}
                      </AppText>
                      <AppBadge
                        label={
                          shiftA.status === "pending" ? "Pending" : "Confirmed"
                        }
                        variant={
                          shiftA.status === "pending" ? "warning" : "success"
                        }
                      />
                    </View>
                    <View style={styles.shiftMeta}>
                      <AppText variant="caption" color={colors.textSecondary}>
                        {wpA?.name ?? "Unknown"}
                      </AppText>
                      <AppText variant="caption" color={colors.textSecondary}>
                        {fmtDate(shiftA.startDateTime)} ·{" "}
                        {fmtTime(shiftA.startDateTime)} –{" "}
                        {fmtTime(shiftA.endDateTime)} (
                        {shiftDur(shiftA.startDateTime, shiftA.endDateTime)}h)
                      </AppText>
                    </View>
                    <Pressable
                      onPress={() => handleDismissShift(conflict.id, shiftA.id)}
                      style={({ pressed }) => [
                        styles.cancelBtn,
                        {
                          borderColor: colors.error + "44",
                          opacity: pressed ? 0.6 : 1,
                        },
                      ]}
                    >
                      <IconSymbol
                        name="xmark.circle.fill"
                        size={14}
                        color={colors.error}
                      />
                      <AppText variant="captionBold" color={colors.error}>
                        Cancel this shift
                      </AppText>
                    </Pressable>
                  </View>

                  {/* VS divider */}
                  <View style={styles.vsDivider}>
                    <View
                      style={[
                        styles.vsLine,
                        { backgroundColor: colors.border },
                      ]}
                    />
                    <View
                      style={[
                        styles.vsBadge,
                        {
                          backgroundColor: colors.error + "22",
                          borderColor: colors.error + "44",
                        },
                      ]}
                    >
                      <AppText variant="captionBold" color={colors.error}>
                        VS
                      </AppText>
                    </View>
                    <View
                      style={[
                        styles.vsLine,
                        { backgroundColor: colors.border },
                      ]}
                    />
                  </View>

                  {/* Shift B */}
                  <View style={styles.shiftBlock}>
                    <View style={styles.shiftHeader}>
                      <View
                        style={[
                          styles.wpDot,
                          { backgroundColor: wpB?.color ?? colors.accent },
                        ]}
                      />
                      <AppText variant="bodyBold" style={styles.flex1}>
                        {shiftB.title}
                      </AppText>
                      <AppBadge
                        label={
                          shiftB.status === "pending" ? "Pending" : "Confirmed"
                        }
                        variant={
                          shiftB.status === "pending" ? "warning" : "success"
                        }
                      />
                    </View>
                    <View style={styles.shiftMeta}>
                      <AppText variant="caption" color={colors.textSecondary}>
                        {wpB?.name ?? "Unknown"}
                      </AppText>
                      <AppText variant="caption" color={colors.textSecondary}>
                        {fmtDate(shiftB.startDateTime)} ·{" "}
                        {fmtTime(shiftB.startDateTime)} –{" "}
                        {fmtTime(shiftB.endDateTime)} (
                        {shiftDur(shiftB.startDateTime, shiftB.endDateTime)}h)
                      </AppText>
                    </View>
                    <Pressable
                      onPress={() => handleDismissShift(conflict.id, shiftB.id)}
                      style={({ pressed }) => [
                        styles.cancelBtn,
                        {
                          borderColor: colors.error + "44",
                          opacity: pressed ? 0.6 : 1,
                        },
                      ]}
                    >
                      <IconSymbol
                        name="xmark.circle.fill"
                        size={14}
                        color={colors.error}
                      />
                      <AppText variant="captionBold" color={colors.error}>
                        Cancel this shift
                      </AppText>
                    </Pressable>
                  </View>

                  {/* Keep Both */}
                  <AppButton
                    label="Keep Both (Mark Resolved)"
                    variant="outline"
                    size="md"
                    fullWidth
                    onPress={() => handleResolve(conflict.id)}
                    leftIcon={
                      <IconSymbol
                        name="checkmark.circle.fill"
                        size={18}
                        color={colors.accent}
                      />
                    }
                    style={styles.keepBtn}
                  />
                </AppCard>
              );
            })}
          </>
        )}

        {/* ── Resolved ── */}
        {resolved.length > 0 && (
          <>
            <AppText variant="subheading" style={styles.sectionTitle}>
              Resolved
            </AppText>
            {resolved.map((conflict) => {
              const shiftA = shifts.find((s) => s.id === conflict.shiftAId);
              const shiftB = shifts.find((s) => s.id === conflict.shiftBId);
              const wpA = workplaces.find((w) => w.id === shiftA?.workplaceId);
              const wpB = workplaces.find((w) => w.id === shiftB?.workplaceId);

              return (
                <AppCard
                  key={conflict.id}
                  style={[styles.resolvedCard, { opacity: 0.6 }]}
                >
                  <View style={styles.resolvedRow}>
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={18}
                      color={colors.success}
                    />
                    <View style={styles.flex1}>
                      <AppText variant="bodyBold">
                        {shiftA?.title ?? "Deleted"} vs{" "}
                        {shiftB?.title ?? "Deleted"}
                      </AppText>
                      <AppText variant="caption" color={colors.textSecondary}>
                        {wpA?.name ?? "?"} vs {wpB?.name ?? "?"} ·{" "}
                        {conflict.overlapMinutes}min overlap
                      </AppText>
                    </View>
                    <AppBadge label="Resolved" variant="success" />
                  </View>
                </AppCard>
              );
            })}
          </>
        )}

        {/* ── Empty State ── */}
        {conflicts.length === 0 && (
          <AppCard style={styles.emptyCard}>
            <View style={styles.emptyInner}>
              <IconSymbol
                name="checkmark.circle.fill"
                size={44}
                color={colors.success}
              />
              <AppText variant="heading" center>
                No Conflicts
              </AppText>
              <AppText variant="body" color={colors.textSecondary} center>
                All your shifts are clear of overlaps! 🎉
              </AppText>
            </View>
          </AppCard>
        )}

        {/* ── All-resolved celebration ── */}
        {conflicts.length > 0 && unresolved.length === 0 && (
          <AppCard style={styles.celebrationCard} padding={20}>
            <View style={styles.emptyInner}>
              <AppText variant="heading" center>
                All Clear! ✅
              </AppText>
              <AppText variant="body" color={colors.textSecondary} center>
                All conflicts have been resolved
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
  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  headerSpacer: { width: 24 },

  // Summary
  summaryCard: { marginBottom: 20 },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryItem: { flex: 1, alignItems: "center", gap: 4 },
  summaryDivider: { width: 1, height: 48 },

  // Section
  sectionTitle: { marginBottom: 12 },

  // Conflict card
  conflictCard: { marginBottom: 16, borderWidth: 1 },
  overlapBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 14,
  },

  // Shift block
  shiftBlock: { gap: 6 },
  shiftHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shiftMeta: { gap: 2, paddingLeft: 18 },
  wpDot: { width: 10, height: 10, borderRadius: 5 },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    marginTop: 6,
    marginLeft: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },

  // VS divider
  vsDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    gap: 10,
  },
  vsLine: { flex: 1, height: 1 },
  vsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },

  // Keep both
  keepBtn: { marginTop: 14 },

  // Resolved
  resolvedCard: { marginBottom: 10 },
  resolvedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  // Empty
  emptyCard: { marginTop: 20 },
  emptyInner: { paddingVertical: 32, gap: 8, alignItems: "center" },
  celebrationCard: { marginTop: 12 },

  // Shared
  flex1: { flex: 1 },
  bottomSpacer: { height: 60 },
});
