import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useShiftStore } from "@/store";
import type { ThemeTokens } from "@/theme";

type CalendarCell = {
  day: number;
  muted?: boolean;
  dot?: boolean;
};

const alphaColor = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized;

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const buildStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: tokens.background,
    },
    meshTopLeft: {
      position: "absolute",
      top: 0,
      left: 0,
      width: 240,
      height: 240,
      borderRadius: 120,
      backgroundColor: alphaColor(tokens.primary, 0.05),
    },
    meshTopRight: {
      position: "absolute",
      top: 24,
      right: 0,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: alphaColor(tokens.primary, 0.03),
    },
    meshBottomRight: {
      position: "absolute",
      right: 0,
      bottom: 120,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: alphaColor(tokens.primary, 0.05),
    },
    meshBottomLeft: {
      position: "absolute",
      left: 0,
      bottom: 120,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: alphaColor(tokens.primary, 0.14),
    },
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: alphaColor(tokens.surface, 0.8),
      borderBottomWidth: 1,
      borderBottomColor: alphaColor(tokens.border, 0.12),
    },
    headerInner: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 16,
      width: "100%",
      maxWidth: 1120,
      alignSelf: "center",
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      overflow: "hidden",
      backgroundColor: alphaColor(tokens.primary, 0.2),
      alignItems: "center",
      justifyContent: "center",
    },
    brandTitle: {
      color: tokens.primary,
      fontFamily: "Manrope",
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "800",
      letterSpacing: -0.4,
    },
    headerButton: {
      padding: 8,
      borderRadius: 999,
    },
    main: {
      flex: 1,
      width: "100%",
      maxWidth: 1120,
      alignSelf: "center",
      paddingHorizontal: 24,
      paddingTop: 96,
      paddingBottom: 180,
    },
    overview: {
      width: "100%",
      gap: 24,
      marginBottom: 24,
    },
    overviewLeft: {
      gap: 4,
    },
    eyebrow: {
      color: tokens.textTertiary,
      fontFamily: "Inter",
      fontSize: 10,
      lineHeight: 12,
      fontWeight: "600",
      letterSpacing: 1.8,
      textTransform: "uppercase",
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 12,
      flexWrap: "wrap",
    },
    monthTitle: {
      color: tokens.textPrimary,
      fontFamily: "Manrope",
      fontSize: 38,
      lineHeight: 44,
      fontWeight: "800",
      letterSpacing: -1,
    },
    summaryText: {
      color: tokens.primary,
      fontFamily: "Inter",
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "700",
    },
    navRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 8,
    },
    navButton: {
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 999,
      backgroundColor: "transparent",
    },
    todayButton: {
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: tokens.surface,
    },
    calendarShell: {
      width: "100%",
      borderRadius: 24,
      padding: 24,
      backgroundColor: alphaColor(tokens.surface, 0.96),
      shadowColor: tokens.primary,
      shadowOpacity: 0.04,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 3,
      marginBottom: 24,
    },
    weekdayRow: {
      flexDirection: "row",
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: alphaColor(tokens.border, 0.1),
    },
    weekdayCell: {
      flex: 1,
      alignItems: "center",
    },
    weekdayLabel: {
      color: tokens.textSecondary,
      fontFamily: "Inter",
      fontSize: 10,
      lineHeight: 12,
      fontWeight: "700",
      letterSpacing: 1.6,
      textTransform: "uppercase",
    },
    monthGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 16,
    },
    monthCell: {
      width: "14.285714%",
      minHeight: 54,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 6,
    },
    mutedCell: {
      opacity: 0.2,
    },
    selectedCell: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: tokens.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    dayNumber: {
      color: tokens.textPrimary,
      fontFamily: "Inter",
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "500",
    },
    selectedDayNumber: {
      color: tokens.textOnPrimary,
      fontWeight: "700",
    },
    dayDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 4,
      backgroundColor: tokens.primary,
    },
    selectedDot: {
      backgroundColor: tokens.textOnPrimary,
      width: 4,
      height: 4,
      borderRadius: 2,
      marginTop: 4,
    },
    agendaPanel: {
      width: "100%",
      borderRadius: 32,
      padding: 32,
      backgroundColor: tokens.glassBackgroundStrong,
      borderWidth: 1,
      borderColor: alphaColor(tokens.surface, 0.4),
      shadowColor: tokens.primary,
      shadowOpacity: 0.08,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 4,
      gap: 24,
    },
    agendaHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 16,
    },
    agendaEyebrow: {
      color: tokens.primary,
      fontFamily: "Inter",
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "700",
      letterSpacing: 1.8,
      textTransform: "uppercase",
    },
    agendaTitle: {
      color: tokens.textPrimary,
      fontFamily: "Manrope",
      fontSize: 24,
      lineHeight: 30,
      fontWeight: "700",
      letterSpacing: -0.4,
    },
    agendaPill: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: alphaColor(tokens.primary, 0.1),
    },
    agendaPillText: {
      color: tokens.primary,
      fontFamily: "Inter",
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "700",
    },
    timeline: {
      position: "relative",
      gap: 32,
      marginTop: 8,
    },
    timelineLine: {
      position: "absolute",
      left: 12,
      top: 8,
      bottom: 8,
      width: 1,
      backgroundColor: alphaColor(tokens.border, 0.3),
    },
    timelineItem: {
      position: "relative",
      paddingLeft: 48,
    },
    timelineDot: {
      position: "absolute",
      left: 6,
      top: 16,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: tokens.primary,
      borderWidth: 4,
      borderColor: tokens.surface,
    },
    shiftCard: {
      borderRadius: 24,
      borderLeftWidth: 4,
      borderLeftColor: tokens.primary,
      backgroundColor: alphaColor(tokens.surface, 0.82),
      padding: 20,
      shadowColor: tokens.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },
    shiftHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 8,
    },
    shiftTitle: {
      color: tokens.textPrimary,
      fontFamily: "Manrope",
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "700",
      flex: 1,
    },
    timePill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: alphaColor(tokens.primary, 0.08),
    },
    timePillText: {
      color: tokens.primary,
      fontFamily: "Inter",
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "700",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    shiftLocation: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    shiftLocationText: {
      color: tokens.textSecondary,
      fontFamily: "Inter",
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "500",
    },
    addSpecificTask: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      alignSelf: "flex-start",
      paddingVertical: 4,
    },
    addSpecificTaskText: {
      color: tokens.primary,
      fontFamily: "Inter",
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "700",
    },
    fab: {
      position: "absolute",
      right: 32,
      bottom: 112,
      zIndex: 60,
      width: 64,
      height: 64,
      borderRadius: 32,
      overflow: "hidden",
      shadowColor: tokens.primary,
      shadowOpacity: 0.3,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    fabInner: {
      width: 64,
      height: 64,
      alignItems: "center",
      justifyContent: "center",
    },
  });

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CALENDAR_CELLS: CalendarCell[] = [
  { day: 27, muted: true },
  { day: 28, muted: true },
  { day: 29, muted: true },
  { day: 30, muted: true },
  { day: 31, muted: true },
  { day: 1, dot: true },
  { day: 2 },
  { day: 3 },
  { day: 4, dot: true },
  { day: 5, dot: true },
  { day: 6 },
  { day: 7 },
  { day: 8, dot: true },
  { day: 9 },
  { day: 10 },
  { day: 11, dot: true },
  { day: 12 },
  { day: 13 },
  { day: 14, dot: true },
  { day: 15 },
  { day: 16 },
  { day: 17 },
  { day: 18, dot: true },
  { day: 19 },
  { day: 20, dot: true },
  { day: 21 },
  { day: 22 },
  { day: 23 },
];

export default function CalendarScreen() {
  const { tokens } = useAppTheme();
  const styles = useMemo(() => buildStyles(tokens), [tokens]);
  const user = useShiftStore((state) => state.user);

  const [selectedDay, setSelectedDay] = useState(8);

  return (
    <AppScreen
      safeBottom={false}
      showLiquidBackground={false}
      style={styles.screen}
    >
      <View style={styles.meshTopLeft} />
      <View style={styles.meshTopRight} />
      <View style={styles.meshBottomRight} />
      <View style={styles.meshBottomLeft} />

      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.brandRow}>
            <View style={styles.avatar}>
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={{ width: 40, height: 40 }}
                />
              ) : (
                <AppText
                  style={{
                    color: tokens.primary,
                    fontFamily: "Inter",
                    fontSize: 16,
                    lineHeight: 20,
                    fontWeight: "700",
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() ?? "S"}
                </AppText>
              )}
            </View>
            <AppText style={styles.brandTitle}>ShiftBuddy</AppText>
          </View>

          <Pressable style={styles.headerButton} accessibilityRole="button">
            <IconSymbol name="bell.fill" size={24} color={tokens.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.main}
      >
        <View style={styles.overview}>
          <View style={styles.overviewLeft}>
            <AppText style={styles.eyebrow}>Calendar Overview</AppText>
            <View style={styles.titleRow}>
              <AppText style={styles.monthTitle}>September 2024</AppText>
              <AppText style={styles.summaryText}>42.5 hrs scheduled</AppText>
            </View>
          </View>

          <View style={styles.navRow}>
            <Pressable style={styles.navButton} accessibilityRole="button">
              <IconSymbol
                name="chevron.left"
                size={22}
                color={tokens.textSecondary}
              />
            </Pressable>
            <Pressable style={styles.todayButton} accessibilityRole="button">
              <AppText
                style={{
                  color: tokens.primary,
                  fontFamily: "Inter",
                  fontSize: 14,
                  lineHeight: 20,
                  fontWeight: "700",
                }}
              >
                Today
              </AppText>
            </Pressable>
            <Pressable style={styles.navButton} accessibilityRole="button">
              <IconSymbol
                name="chevron.right"
                size={22}
                color={tokens.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.calendarShell}>
          <View style={styles.weekdayRow}>
            {WEEKDAY_NAMES.map((weekday) => (
              <View key={weekday} style={styles.weekdayCell}>
                <AppText style={styles.weekdayLabel}>{weekday}</AppText>
              </View>
            ))}
          </View>

          <View style={styles.monthGrid}>
            {CALENDAR_CELLS.map((cell) => {
              const isSelected = selectedDay === cell.day;

              return (
                <Pressable
                  key={cell.day}
                  accessibilityRole="button"
                  onPress={() => setSelectedDay(cell.day)}
                  style={({ pressed }) => [
                    styles.monthCell,
                    cell.muted && styles.mutedCell,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  {isSelected ? (
                    <View style={styles.selectedCell}>
                      <AppText
                        style={[styles.dayNumber, styles.selectedDayNumber]}
                      >
                        {cell.day}
                      </AppText>
                      {cell.dot && <View style={styles.selectedDot} />}
                    </View>
                  ) : (
                    <>
                      <AppText style={styles.dayNumber}>{cell.day}</AppText>
                      {cell.dot && <View style={styles.dayDot} />}
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.agendaPanel}>
          <View style={styles.agendaHeader}>
            <View>
              <AppText style={styles.agendaEyebrow}>Selected Day</AppText>
              <AppText style={styles.agendaTitle}>
                Sunday, Sept {selectedDay}
              </AppText>
            </View>
            <View style={styles.agendaPill}>
              <AppText style={styles.agendaPillText}>8.5 hrs Today</AppText>
            </View>
          </View>

          <View style={styles.timeline}>
            <View style={styles.timelineLine} />

            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.shiftCard}>
                <View style={styles.shiftHeader}>
                  <AppText style={styles.shiftTitle}>
                    Senior Care - Morning
                  </AppText>
                  <View style={styles.timePill}>
                    <AppText style={styles.timePillText}>07:00 — 11:30</AppText>
                  </View>
                </View>
                <View style={styles.shiftLocation}>
                  <IconSymbol
                    name="location.fill"
                    size={14}
                    color={tokens.textSecondary}
                  />
                  <AppText style={styles.shiftLocationText}>
                    St. Mary&apos;s Medical Wing
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.shiftCard}>
                <View style={styles.shiftHeader}>
                  <AppText style={styles.shiftTitle}>Staff Supervision</AppText>
                  <View style={styles.timePill}>
                    <AppText style={styles.timePillText}>13:00 — 17:00</AppText>
                  </View>
                </View>
                <View style={styles.shiftLocation}>
                  <IconSymbol
                    name="location.fill"
                    size={14}
                    color={tokens.textSecondary}
                  />
                  <AppText style={styles.shiftLocationText}>
                    Central Hub Office
                  </AppText>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/add-shift")}
              style={styles.addSpecificTask}
            >
              <IconSymbol
                name="plus.circle.fill"
                size={18}
                color={tokens.primary}
              />
              <AppText style={styles.addSpecificTaskText}>
                Add specific task
              </AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/add-shift")}
        style={styles.fab}
      >
        <LinearGradient
          colors={[tokens.primary, tokens.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabInner}
        >
          <IconSymbol name="plus" size={30} color={tokens.textOnPrimary} />
        </LinearGradient>
      </Pressable>
    </AppScreen>
  );
}
