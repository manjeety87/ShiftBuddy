import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useShiftStore } from "@/store";

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function ShiftsTabScreen() {
  const { theme } = useAppTheme();
  const tokens = theme.tokens;

  const shifts = useShiftStore((state) => state.shifts);
  const workplaces = useShiftStore((state) => state.workplaces);

  const sortedShifts = [...shifts]
    .filter((shift) => shift.status !== "cancelled")
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    );

  return (
    <AppScreen>
      <View style={styles.screen}>
        <View style={styles.header}>
          <AppText variant="heading" color={tokens.primary}>
            Shifts
          </AppText>
          <Pressable onPress={() => router.push("/add-shift")}>
            <AppText variant="captionBold" color={tokens.primary}>
              Add Shift
            </AppText>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {sortedShifts.length === 0 ? (
            <View
              style={[
                styles.empty,
                { backgroundColor: tokens.surface_container_low },
              ]}
            >
              <AppText variant="body" color={tokens.textSecondary} center>
                No shifts yet. Add your first one.
              </AppText>
            </View>
          ) : (
            sortedShifts.map((shift) => {
              const workplace = workplaces.find(
                (w) => w.id === shift.workplaceId,
              );
              return (
                <View
                  key={shift.id}
                  style={[
                    styles.card,
                    { backgroundColor: tokens.surface_container_low },
                  ]}
                >
                  <View style={styles.rowTop}>
                    <AppText variant="bodyBold" color={tokens.textPrimary}>
                      {shift.title}
                    </AppText>
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: workplace?.color || tokens.primary },
                      ]}
                    />
                  </View>

                  <AppText variant="caption" color={tokens.textSecondary}>
                    {workplace?.name ?? "Workplace"}
                  </AppText>
                  <AppText variant="captionBold" color={tokens.primary}>
                    {fmtDateTime(shift.startDateTime)}
                  </AppText>
                </View>
              );
            })
          )}
        </ScrollView>
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
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  content: {
    gap: 10,
    paddingBottom: 140,
  },
  empty: {
    minHeight: 84,
    borderRadius: 16,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
