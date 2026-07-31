import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AppBadge } from "@/components/ui/app-badge";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { GlassHeader } from "@/components/ui/glass-header";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useShiftStore } from "@/store";
import type { ThemeTokens } from "@/theme";
import type { Shift, ShiftConflict } from "@/types";
import { getShiftWorkplaceLabel } from "@/utils/shift-labels";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const formatDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function timeUntil(iso: string): string {
  const minutes = Math.floor((new Date(iso).getTime() - Date.now()) / 60_000);

  if (minutes <= 0) {
    return "Now";
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ${minutes % 60}m`;
  }

  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

function greeting(date: Date): string {
  if (date.getHours() < 12) {
    return "Good morning";
  }

  if (date.getHours() < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function weekNumber(date: Date): number {
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );

  const day = utc.getUTCDay() || 7;

  utc.setUTCDate(utc.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));

  return Math.ceil(
    ((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
}

function startOfDay(date: Date): Date {
  const start = new Date(date);

  start.setHours(0, 0, 0, 0);

  return start;
}

function conflictShiftIds(conflicts: ShiftConflict[]): Set<string> {
  const ids = new Set<string>();

  conflicts
    .filter((conflict) => !conflict.resolved)
    .forEach((conflict) => {
      ids.add(conflict.shiftAId);
      ids.add(conflict.shiftBId);
    });

  return ids;
}

function shiftState(
  shift: Shift,
  now: Date,
): "current" | "upcoming" | "completed" | "cancelled" {
  if (shift.status === "cancelled") {
    return "cancelled";
  }

  const start = new Date(shift.startDateTime).getTime();

  const end = new Date(shift.endDateTime).getTime();

  if (start <= now.getTime() && end >= now.getTime()) {
    return "current";
  }

  return start > now.getTime() ? "upcoming" : "completed";
}

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

interface GlassSurfaceProps {
  children: React.ReactNode;
  tokens: ThemeTokens;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  strong?: boolean;
}

function GlassSurface({
  children,
  tokens,
  style,
  padding = 18,
  strong = false,
}: GlassSurfaceProps) {
  const shadow = (
    Platform.OS === "web"
      ? {
          boxShadow: `0px 8px 20px ${tokens.ambientShadow}`,
        }
      : Platform.OS === "android"
        ? { elevation: 0 }
        : {
            shadowColor: tokens.shadow,
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: tokens.mode === "dark" ? 0.16 : 0.06,
            shadowRadius: 14,
          }
  ) as ViewStyle;

  const background = strong
    ? tokens.glassBackgroundStrong
    : tokens.glassBackground;

  return (
    <View
      style={[
        styles.glass,
        {
          borderRadius: tokens.radiusLarge,
          borderColor: tokens.glassBorder,
          backgroundColor: background,
        },
        shadow,
        style,
      ]}
    >
      <BlurView
        intensity={tokens.glassBlur}
        tint={tokens.glassTint}
        style={[StyleSheet.absoluteFill, styles.decorative]}
      />

      <View
        style={[
          StyleSheet.absoluteFill,
          styles.decorative,
          { backgroundColor: background },
        ]}
      />

      <View
        style={[
          styles.glassHighlight,
          styles.decorative,
          { backgroundColor: tokens.glassHighlight },
        ]}
      />

      <View style={{ padding }}>{children}</View>
    </View>
  );
}

interface HeaderButtonProps {
  icon: IconName;
  label: string;
  tokens: ThemeTokens;
  onPress: () => void;
}

function HeaderButton({ icon, label, tokens, onPress }: HeaderButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.headerButton,
        {
          borderRadius: tokens.radiusPill,
          backgroundColor: pressed
            ? tokens.surfacePressed
            : tokens.glassBackgroundStrong,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={tokens.iconSecondary}
      />
    </Pressable>
  );
}

interface QuickActionProps {
  label: string;
  icon: IconName;
  color: string;
  tokens: ThemeTokens;
  onPress: () => void;
}

function QuickAction({
  label,
  icon,
  color,
  tokens,
  onPress,
}: QuickActionProps) {
  return (
    <View style={styles.quickWrap}>
      <GlassSurface tokens={tokens} padding={10} style={styles.quickSurface}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={onPress}
          style={({ pressed }) => [
            styles.quickButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </Pressable>
        <AppText
          variant="caption"
          color={tokens.textSecondary}
          style={styles.quickButtonText}
          numberOfLines={1}
          center
        >
          {label}
        </AppText>
      </GlassSurface>
    </View>
  );
}

interface SegmentOption {
  key: string;
  label: string;
}

interface SegmentToggleProps {
  options: SegmentOption[];
  activeKey: string;
  tokens: ThemeTokens;
  onSelect: (key: string) => void;
}

function SegmentToggle({
  options,
  activeKey,
  tokens,
  onSelect,
}: SegmentToggleProps) {
  return (
    <View
      style={[
        styles.segmentTrack,
        {
          borderRadius: tokens.radiusPill,
          backgroundColor: tokens.glassBackground,
          borderColor: tokens.glassBorder,
        },
      ]}
    >
      {options.map((option) => {
        const active = option.key === activeKey;

        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(option.key)}
            style={({ pressed }) => [
              styles.segmentItem,
              {
                borderRadius: tokens.radiusPill,
                backgroundColor: active
                  ? tokens.surfaceElevated
                  : "transparent",
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <AppText
              variant="captionBold"
              color={active ? tokens.textPrimary : tokens.textTertiary}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function HomeScreen() {
  const { tokens } = useAppTheme();

  const shifts = useShiftStore((state) => state.shifts);
  const workplaces = useShiftStore((state) => state.workplaces);
  const conflicts = useShiftStore((state) => state.conflicts);
  const user = useShiftStore((state) => state.user);

  const now = new Date();
  const todayKey = formatDayKey(now);

  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);

  const unresolvedConflicts = conflicts.filter(
    (conflict) => !conflict.resolved,
  );

  const conflictedIds = conflictShiftIds(conflicts);

  const validShifts = shifts
    .filter((shift) => shift.status !== "cancelled")
    .sort(
      (first, second) =>
        new Date(first.startDateTime).getTime() -
        new Date(second.startDateTime).getTime(),
    );

  const currentShift = validShifts.find(
    (shift) =>
      new Date(shift.startDateTime).getTime() <= now.getTime() &&
      new Date(shift.endDateTime).getTime() >= now.getTime(),
  );

  const heroShift =
    currentShift ??
    validShifts.find(
      (shift) => new Date(shift.startDateTime).getTime() > now.getTime(),
    );

  const heroWorkplaceLabel = heroShift
    ? getShiftWorkplaceLabel(heroShift, workplaces)
    : "";

  const start = startOfDay(now);

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);

    date.setDate(start.getDate() + index);

    const key = formatDayKey(date);

    const dayShifts = validShifts.filter(
      (shift) => formatDayKey(new Date(shift.startDateTime)) === key,
    );

    return {
      date,
      key,
      shifts: dayShifts,
      hasConflict: dayShifts.some((shift) => conflictedIds.has(shift.id)),
    };
  });

  const selectedDay =
    weekDays.find((day) => day.key === selectedDateKey) ?? weekDays[0];

  const selectedShifts = selectedDay?.shifts ?? [];

  const topConflict = unresolvedConflicts[0];

  const conflictA = topConflict
    ? shifts.find((shift) => shift.id === topConflict.shiftAId)
    : undefined;

  const conflictB = topConflict
    ? shifts.find((shift) => shift.id === topConflict.shiftBId)
    : undefined;

  const heroIsCurrent = heroShift
    ? shiftState(heroShift, now) === "current"
    : false;

  const heroShadow = (
    Platform.OS === "web"
      ? { boxShadow: `0px 18px 42px ${tokens.ambientShadow}` }
      : {
          shadowColor: tokens.primary,
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: tokens.mode === "dark" ? 0.3 : 0.22,
          shadowRadius: 28,
          elevation: 8,
        }
  ) as ViewStyle;

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
          <View style={styles.headerContent}>
            <View style={styles.profileGroup}>
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

              <View style={styles.profileCopy}>
                <AppText variant="overline" color={tokens.primary}>
                  ShiftBuddy
                </AppText>

                <AppText variant="caption" color={tokens.textSecondary}>
                  {greeting(now)}, {user?.name ?? "there"}
                </AppText>
              </View>
            </View>

            <View style={styles.headerActions}>
              <HeaderButton
                icon="bell-outline"
                label="View alerts"
                tokens={tokens}
                onPress={() => router.push("/conflicts")}
              />

              <HeaderButton
                icon="magnify"
                label="View shifts"
                tokens={tokens}
                onPress={() => router.push("/(tabs)/shifts")}
              />
            </View>
          </View>
        </GlassHeader>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.monthHeader}>
            <AppText variant="heading" color={tokens.textPrimary}>
              {now.toLocaleDateString(undefined, { month: "long" })}
            </AppText>

            <View
              style={[
                styles.weekBadge,
                {
                  borderRadius: tokens.radiusPill,
                  backgroundColor: tokens.primarySoft,
                },
              ]}
            >
              <AppText variant="captionBold" color={tokens.primary}>
                WEEK {weekNumber(now)}
              </AppText>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekSelector}
          >
            {weekDays.map((day) => {
              const selected = day.key === selectedDateKey;

              const dotColor = day.hasConflict
                ? tokens.conflict
                : day.shifts.length > 0
                  ? tokens.primary
                  : tokens.divider;

              return (
                <Pressable
                  key={day.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setSelectedDateKey(day.key)}
                  style={({ pressed }) => [
                    styles.dayPressable,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  {selected ? (
                    <LinearGradient
                      colors={[
                        tokens.primaryGradientStart,
                        tokens.primaryGradientEnd,
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.dayCard,
                        { borderRadius: tokens.radiusXLarge },
                      ]}
                    >
                      <AppText variant="label" color={tokens.textOnPrimary}>
                        {day.date
                          .toLocaleDateString(undefined, { weekday: "short" })
                          .toUpperCase()}
                      </AppText>

                      <AppText variant="heading" color={tokens.textOnPrimary}>
                        {day.date.getDate()}
                      </AppText>

                      <View
                        style={[
                          styles.dayDot,
                          {
                            backgroundColor: day.hasConflict
                              ? tokens.conflict
                              : tokens.textOnPrimary,
                          },
                        ]}
                      />
                    </LinearGradient>
                  ) : (
                    <GlassSurface
                      tokens={tokens}
                      padding={0}
                      style={styles.dayGlass}
                    >
                      <View style={styles.dayCard}>
                        <AppText variant="label" color={tokens.textTertiary}>
                          {day.date
                            .toLocaleDateString(undefined, { weekday: "short" })
                            .toUpperCase()}
                        </AppText>

                        <AppText variant="heading" color={tokens.textPrimary}>
                          {day.date.getDate()}
                        </AppText>

                        <View
                          style={[styles.dayDot, { backgroundColor: dotColor }]}
                        />
                      </View>
                    </GlassSurface>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <LinearGradient
            colors={[tokens.primaryGradientStart, tokens.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.hero,
              { borderRadius: tokens.radiusXLarge },
              heroShadow,
            ]}
          >
            <View
              style={[
                styles.heroOrbLarge,
                styles.decorative,
                { backgroundColor: tokens.glassHighlight },
              ]}
            />

            {heroShift ? (
              <>
                <View style={styles.heroHeader}>
                  <View style={styles.heroTitleGroup}>
                    <AppText variant="overline" color={tokens.textOnPrimary}>
                      {heroIsCurrent ? "CURRENT SHIFT" : "UPCOMING SHIFT"}
                    </AppText>

                    <AppText
                      variant="title"
                      color={tokens.textOnPrimary}
                      numberOfLines={2}
                    >
                      {heroShift.title}
                    </AppText>

                    <AppText
                      variant="body"
                      color={tokens.textOnPrimary}
                      numberOfLines={1}
                      style={styles.heroMuted}
                    >
                      {heroWorkplaceLabel || "Unassigned workplace"}
                    </AppText>
                  </View>

                  <View
                    style={[
                      styles.heroIcon,
                      {
                        borderRadius: tokens.radiusMedium,
                        backgroundColor: tokens.glassBackground,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="briefcase-outline"
                      size={24}
                      color={tokens.textOnPrimary}
                    />
                  </View>
                </View>

                <View style={styles.heroTimeRow}>
                  <View>
                    <AppText variant="label" color={tokens.textOnPrimary}>
                      STARTS
                    </AppText>

                    <AppText variant="heading" color={tokens.textOnPrimary}>
                      {formatTime(heroShift.startDateTime)}
                    </AppText>
                  </View>

                  <View
                    style={[
                      styles.heroDivider,
                      { backgroundColor: tokens.glassBorder },
                    ]}
                  />

                  <View style={styles.heroTimeEnd}>
                    <AppText variant="label" color={tokens.textOnPrimary}>
                      ENDS
                    </AppText>

                    <AppText variant="heading" color={tokens.textOnPrimary}>
                      {formatTime(heroShift.endDateTime)}
                    </AppText>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/(tabs)/shifts")}
                  style={({ pressed }) => [
                    styles.heroButton,
                    {
                      borderRadius: tokens.radiusMedium,
                      backgroundColor: tokens.textOnPrimary,
                      opacity: pressed ? 0.82 : 1,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="timer-outline"
                    size={20}
                    color={tokens.primaryPressed}
                  />

                  <AppText variant="bodyBold" color={tokens.primaryPressed}>
                    {heroIsCurrent
                      ? "Clock In Now"
                      : `Starts in ${timeUntil(heroShift.startDateTime)}`}
                  </AppText>
                </Pressable>
              </>
            ) : (
              <View style={styles.emptyHero}>
                <View
                  style={[
                    styles.heroIcon,
                    {
                      borderRadius: tokens.radiusMedium,
                      backgroundColor: tokens.glassBackground,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="calendar-check-outline"
                    size={26}
                    color={tokens.textOnPrimary}
                  />
                </View>

                <AppText variant="title" color={tokens.textOnPrimary} center>
                  Your schedule is clear
                </AppText>

                <AppText variant="body" color={tokens.textOnPrimary} center>
                  Add a shift or import a schedule to see your next assignment.
                </AppText>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/add-shift")}
                  style={({ pressed }) => [
                    styles.heroButton,
                    {
                      borderRadius: tokens.radiusMedium,
                      backgroundColor: tokens.textOnPrimary,
                      opacity: pressed ? 0.82 : 1,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={20}
                    color={tokens.primaryPressed}
                  />

                  <AppText variant="bodyBold" color={tokens.primaryPressed}>
                    Add your first shift
                  </AppText>
                </Pressable>
              </View>
            )}
          </LinearGradient>

          <View style={styles.quickGrid}>
            <QuickAction
              label="Add"
              icon="plus-box-outline"
              color={tokens.primary}
              tokens={tokens}
              onPress={() => router.push("/add-shift")}
            />

            <QuickAction
              label="Import"
              icon="cloud-upload-outline"
              color={tokens.primary}
              tokens={tokens}
              onPress={() => router.push("/upload-shift")}
            />

            <QuickAction
              label="Jobs"
              icon="briefcase-outline"
              color={tokens.success}
              tokens={tokens}
              onPress={() => router.push("/(tabs)/workplaces")}
            />

            <QuickAction
              label="Calendar"
              icon="calendar-month-outline"
              color={tokens.conflict}
              tokens={tokens}
              onPress={() => router.push("/(tabs)/calendar")}
            />
          </View>

          {topConflict && conflictA && conflictB ? (
            <GlassSurface
              tokens={tokens}
              padding={16}
              style={[
                styles.conflictCard,
                {
                  borderRadius: tokens.radiusLarge,
                  borderLeftColor: tokens.conflict,
                  backgroundColor: tokens.conflictSoft,
                },
              ]}
            >
              <View style={styles.conflictContent}>
                <View
                  style={[
                    styles.conflictIcon,
                    {
                      borderRadius: tokens.radiusMedium,
                      backgroundColor: tokens.conflictSoft,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="alert-outline"
                    size={22}
                    color={tokens.conflict}
                  />
                </View>

                <View style={styles.conflictCopy}>
                  <AppText variant="captionBold" color={tokens.conflict}>
                    CONFLICT ALERT
                  </AppText>

                  <AppText
                    variant="caption"
                    color={tokens.textSecondary}
                    numberOfLines={2}
                  >
                    {getShiftWorkplaceLabel(conflictA, workplaces)} and{" "}
                    {getShiftWorkplaceLabel(conflictB, workplaces)} overlap.
                  </AppText>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/conflicts")}
                  style={({ pressed }) => [
                    styles.solveButton,
                    {
                      borderRadius: tokens.radiusSmall,
                      backgroundColor: tokens.conflictSoft,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <AppText variant="label" color={tokens.conflict}>
                    SOLVE
                  </AppText>
                </Pressable>
              </View>
            </GlassSurface>
          ) : null}

          <View style={styles.sectionHeader}>
            <View>
              <AppText variant="heading" color={tokens.textPrimary}>
                Timeline
              </AppText>

              <AppText variant="caption" color={tokens.textSecondary}>
                {selectedDay ? formatDate(selectedDay.date) : ""}
              </AppText>
            </View>

            <SegmentToggle
              tokens={tokens}
              activeKey="today"
              options={[
                { key: "today", label: "Today" },
                { key: "list", label: "List" },
              ]}
              onSelect={(key) => {
                if (key === "list") {
                  router.push("/(tabs)/shifts");
                  return;
                }

                setSelectedDateKey(todayKey);
              }}
            />
          </View>

          {selectedShifts.length === 0 ? (
            <GlassSurface tokens={tokens} strong padding={24}>
              <View style={styles.emptyTimeline}>
                <View
                  style={[
                    styles.emptyTimelineIcon,
                    {
                      borderRadius: tokens.radiusPill,
                      backgroundColor: tokens.primarySoft,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="calendar-blank-outline"
                    size={24}
                    color={tokens.primary}
                  />
                </View>

                <AppText variant="subheading" color={tokens.textPrimary}>
                  No shifts scheduled
                </AppText>

                <AppText variant="body" color={tokens.textSecondary} center>
                  This day is free. Add a shift whenever your schedule changes.
                </AppText>
              </View>
            </GlassSurface>
          ) : (
            <View style={styles.timeline}>
              <View
                style={[
                  styles.timelineTrack,
                  { backgroundColor: tokens.primarySoft },
                ]}
              />

              {selectedShifts.map((shift) => {
                const workplace = workplaces.find(
                  (item) => item.id === shift.workplaceId,
                );

                const workplaceLabel = getShiftWorkplaceLabel(
                  shift,
                  workplaces,
                );

                const state = shiftState(shift, now);

                const current = state === "current";

                const marker = workplace?.color ?? tokens.primary;

                const badge = {
                  current: { label: "CURRENT", variant: "accent" as const },
                  upcoming: { label: "UPCOMING", variant: "accent" as const },
                  completed: {
                    label: "COMPLETED",
                    variant: "default" as const,
                  },
                  cancelled: { label: "CANCELLED", variant: "error" as const },
                }[state];

                return (
                  <View key={shift.id} style={styles.timelineItem}>
                    <View
                      style={[
                        styles.markerShell,
                        {
                          borderRadius: tokens.radiusPill,
                          backgroundColor: tokens.surfaceElevated,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.marker,
                          {
                            borderRadius: tokens.radiusPill,
                            backgroundColor: current ? tokens.primary : marker,
                          },
                        ]}
                      />
                    </View>

                    <View
                      style={[
                        styles.timelineCard,
                        {
                          borderRadius: tokens.radiusLarge,
                          backgroundColor: current
                            ? tokens.surfaceSelected
                            : tokens.surfaceElevated,
                          borderLeftColor: current ? tokens.primary : marker,
                        },
                      ]}
                    >
                      <View style={styles.timelineHeader}>
                        <View style={styles.timelineTitle}>
                          <AppText
                            variant="captionBold"
                            color={current ? tokens.primary : marker}
                          >
                            {formatTime(shift.startDateTime)} –{" "}
                            {formatTime(shift.endDateTime)}
                          </AppText>

                          <AppText
                            variant="subheading"
                            color={tokens.textPrimary}
                            numberOfLines={1}
                          >
                            {shift.title}
                          </AppText>
                        </View>

                        <AppBadge label={badge.label} variant={badge.variant} />
                      </View>

                      <View style={styles.timelineMeta}>
                        <MaterialCommunityIcons
                          name="briefcase-outline"
                          size={15}
                          color={tokens.iconSecondary}
                        />

                        <AppText
                          variant="caption"
                          color={tokens.textSecondary}
                          numberOfLines={1}
                          style={styles.flexText}
                        >
                          {workplaceLabel}
                        </AppText>
                      </View>

                      {shift.notes ? (
                        <AppText
                          variant="caption"
                          color={tokens.textTertiary}
                          numberOfLines={2}
                          style={styles.timelineNotes}
                        >
                          {shift.notes}
                        </AppText>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

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
            <MaterialCommunityIcons
              name="plus"
              size={30}
              color={tokens.textOnPrimary}
            />
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
    gap: 24,
  },

  decorative: {
    pointerEvents: "none",
  },

  glass: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },

  glassHighlight: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    opacity: 0.68,
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  profileGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  avatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  profileCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  headerActions: {
    flexDirection: "row",
    gap: 8,
  },

  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },

  weekBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  weekSelector: {
    gap: 10,
    paddingVertical: 2,
    paddingHorizontal: 1,
  },

  dayPressable: {
    width: 64,
  },

  dayGlass: {
    width: 64,
    minHeight: 90,
  },

  dayCard: {
    width: 64,
    minHeight: 90,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    padding: 22,
  },

  heroOrbLarge: {
    position: "absolute",
    top: -75,
    right: -55,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.14,
  },

  heroHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },

  heroTitleGroup: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  heroMuted: {
    opacity: 0.82,
  },

  heroIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  heroTimeRow: {
    marginTop: 24,
    paddingVertical: 17,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroDivider: {
    width: StyleSheet.hairlineWidth,
    height: 38,
    opacity: 0.5,
  },

  heroTimeEnd: {
    alignItems: "flex-end",
  },

  heroButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },

  emptyHero: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },

  quickGrid: {
    flexDirection: "row",
    width: "100%",
    alignItems: "flex-start",
    gap: 10,
  },

  quickWrap: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 6,
  },

  quickButtonText: {
    marginTop: 2,
  },

  quickSurface: {
    width: "100%",
    aspectRatio: 1,
  },

  quickButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  conflictCard: {
    borderLeftWidth: 4,
  },

  conflictContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  conflictIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  conflictCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  solveButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 2,
  },

  segmentTrack: {
    flexDirection: "row",
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
    gap: 2,
  },

  segmentItem: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },

  emptyTimeline: {
    alignItems: "center",
    gap: 8,
  },

  emptyTimelineIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  timeline: {
    position: "relative",
    gap: 18,
  },

  timelineTrack: {
    position: "absolute",
    left: 19,
    top: 8,
    bottom: 8,
    width: 2,
  },

  timelineItem: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingLeft: 2,
  },

  markerShell: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },

  marker: {
    width: 12,
    height: 12,
  },

  timelineCard: {
    flex: 1,
    minWidth: 0,
    padding: 16,
    borderLeftWidth: 4,
  },

  timelineHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  timelineTitle: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  timelineMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },

  timelineNotes: {
    marginTop: 8,
  },

  flexText: {
    flex: 1,
    minWidth: 0,
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

  bottomSpacer: {
    height: 10,
  },
});
