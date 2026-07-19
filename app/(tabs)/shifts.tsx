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

import { AppButton } from "@/components/ui/app-button";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useShiftStore } from "@/store";
import type { Shift } from "@/types";
import { getShiftWorkplaceLabel } from "@/utils/shift-labels";

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function ShiftsTabScreen() {
  const { theme } = useAppTheme();
  const tokens = theme.tokens;

  const shifts = useShiftStore((state) => state.shifts);
  const workplaces = useShiftStore((state) => state.workplaces);
  const removeShifts = useShiftStore((state) => state.removeShifts);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectionMode = selectedIds.size > 0;

  const sortedShifts = useMemo(
    () =>
      [...shifts]
        .filter((shift) => shift.status !== "cancelled")
        .sort(
          (a, b) =>
            new Date(a.startDateTime).getTime() -
            new Date(b.startDateTime).getTime(),
        ),
    [shifts],
  );

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

    // router.push({
    //   pathname: "/edit-shift",
    //   params: {
    //     id: shift.id,
    //   },
    // });
  };

  const handleShiftLongPress = (shiftId: string) => {
    toggleSelection(shiftId);
  };

  const selectAll = () => {
    if (selectedIds.size === sortedShifts.length) {
      clearSelection();
      return;
    }

    setSelectedIds(new Set(sortedShifts.map((shift) => shift.id)));
  };

  // const confirmDeleteSelected = () => {
  //   const count = selectedIds.size;

  //   if (count === 0) return;

  //   Alert.alert(
  //     count === 1 ? "Delete Shift?" : `Delete ${count} Shifts?`,
  //     count === 1
  //       ? "This shift will be permanently removed from your schedule."
  //       : "These shifts will be permanently removed from your schedule.",
  //     [
  //       {
  //         text: "Cancel",
  //         style: "cancel",
  //       },
  //       {
  //         text: "Delete",
  //         style: "destructive",
  //         onPress: () => {
  //           for (const id of selectedIds) {
  //             removeShift(id);
  //           }

  //           clearSelection();
  //         },
  //       },
  //     ],
  //   );
  // };

  const confirmDeleteSelected = () => {
    const ids = Array.from(selectedIds);
    const count = ids.length;

    if (count === 0) return;

    const performDelete = () => {
      console.log("Deleting selected shifts:", ids);

      removeShifts(ids);
      clearSelection();
    };

    const title = count === 1 ? "Delete Shift?" : `Delete ${count} Shifts?`;

    const message =
      count === 1
        ? "This shift will be permanently removed from your schedule."
        : "These shifts will be permanently removed from your schedule.";

    /*
     * React Native Web does not reliably support Alert.alert
     * button callbacks, so use the browser confirmation dialog.
     */
    if (Platform.OS === "web") {
      const confirmed = window.confirm(`${title}\n\n${message}`);

      if (confirmed) {
        performDelete();
      }

      return;
    }

    Alert.alert(title, message, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: performDelete,
      },
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
                    {selectedIds.size === sortedShifts.length
                      ? "Clear All"
                      : "Select All"}
                  </AppText>
                </Pressable>
              </View>

              <Pressable
                onPress={() => {
                  console.log("Trash pressed", Array.from(selectedIds));
                  confirmDeleteSelected();
                }}
                hitSlop={12}
                style={[
                  styles.deleteButton,
                  {
                    backgroundColor: `${tokens.error}18`,
                  },
                ]}
              >
                <IconSymbol name="trash.fill" size={19} color={tokens.error} />
              </Pressable>
            </>
          ) : (
            <>
              <View>
                <AppText variant="heading" color={tokens.primary}>
                  Shifts
                </AppText>

                {sortedShifts.length > 0 && (
                  <AppText variant="caption" color={tokens.textSecondary}>
                    Tap to edit · Long press to select
                  </AppText>
                )}
              </View>

              <Pressable
                onPress={() => router.push("/add-shift")}
                style={[
                  styles.addHeaderButton,
                  {
                    backgroundColor: `${tokens.primary}18`,
                  },
                ]}
              >
                <IconSymbol
                  name="plus.circle.fill"
                  size={18}
                  color={tokens.primary}
                />

                <AppText variant="captionBold" color={tokens.primary}>
                  Add Shift
                </AppText>
              </Pressable>
            </>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {sortedShifts.length === 0 ? (
            <View
              style={[
                styles.empty,
                {
                  backgroundColor: tokens.surface_container_low,
                },
              ]}
            >
              <View
                style={[
                  styles.emptyIcon,
                  {
                    backgroundColor: `${tokens.primary}18`,
                  },
                ]}
              >
                <IconSymbol
                  name="calendar.badge.plus"
                  size={30}
                  color={tokens.primary}
                />
              </View>

              <AppText variant="subheading" color={tokens.textPrimary} center>
                No shifts added yet
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
                <AppButton
                  label="Add Shift"
                  variant="primary"
                  size="md"
                  fullWidth
                  onPress={() => router.push("/add-shift")}
                  leftIcon={
                    <IconSymbol
                      name="plus.circle.fill"
                      size={18}
                      color="#fff"
                    />
                  }
                />

                <AppButton
                  label="Upload Schedule"
                  variant="outline"
                  size="md"
                  fullWidth
                  onPress={() => router.push("/upload-shift")}
                  leftIcon={
                    <IconSymbol
                      name="camera.fill"
                      size={18}
                      color={tokens.primary}
                    />
                  }
                />
              </View>
            </View>
          ) : (
            sortedShifts.map((shift) => {
              const workplace = workplaces.find(
                (item) => item.id === shift.workplaceId,
              );

              const workplaceLabel = getShiftWorkplaceLabel(shift, workplaces);

              const selected = selectedIds.has(shift.id);

              const markerColor =
                shift.associationType === "temporary"
                  ? tokens.tertiary
                  : shift.associationType === "unassigned"
                    ? tokens.outline
                    : workplace?.color || tokens.primary;

              return (
                <Pressable
                  key={shift.id}
                  onPress={() => handleShiftPress(shift)}
                  onLongPress={() => handleShiftLongPress(shift.id)}
                  delayLongPress={350}
                  style={({ pressed }) => [
                    styles.card,
                    {
                      backgroundColor: selected
                        ? `${tokens.primary}18`
                        : pressed
                          ? tokens.surface_container
                          : tokens.surface_container_low,

                      borderColor: selected ? tokens.primary : "transparent",
                    },
                  ]}
                >
                  <View style={styles.cardRow}>
                    {/* Checkbox appears while selecting */}
                    {selectionMode && (
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: selected
                              ? tokens.primary
                              : tokens.outline_variant,

                            backgroundColor: selected
                              ? tokens.primary
                              : "transparent",
                          },
                        ]}
                      >
                        {selected && (
                          <IconSymbol
                            name="checkmark"
                            size={14}
                            color={tokens.surface_darkest}
                          />
                        )}
                      </View>
                    )}

                    <View style={styles.shiftContent}>
                      <View style={styles.rowTop}>
                        <View style={styles.titleArea}>
                          <AppText
                            variant="bodyBold"
                            color={tokens.textPrimary}
                            numberOfLines={1}
                          >
                            {shift.title}
                          </AppText>

                          <View
                            style={[
                              styles.dot,
                              {
                                backgroundColor: markerColor,
                              },
                            ]}
                          />
                        </View>

                        {!selectionMode && (
                          <IconSymbol
                            name="chevron.right"
                            size={16}
                            color={tokens.textSecondary}
                          />
                        )}
                      </View>

                      <AppText variant="caption" color={tokens.textSecondary}>
                        {workplaceLabel}
                      </AppText>

                      <View style={styles.timeRow}>
                        <IconSymbol
                          name="calendar"
                          size={14}
                          color={tokens.primary}
                        />

                        <AppText variant="captionBold" color={tokens.primary}>
                          {fmtDateTime(shift.startDateTime)}
                        </AppText>
                      </View>

                      <AppText variant="caption" color={tokens.textSecondary}>
                        {fmtTime(shift.startDateTime)} –{" "}
                        {fmtTime(shift.endDateTime)}
                      </AppText>
                    </View>
                  </View>
                </Pressable>
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
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },

  selectionHeaderText: {
    flex: 1,
    gap: 2,
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

  addHeaderButton: {
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  content: {
    gap: 10,
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

  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  shiftContent: {
    flex: 1,
    gap: 5,
  },

  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  titleArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
});
