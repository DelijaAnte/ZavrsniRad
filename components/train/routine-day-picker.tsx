import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { Day, Routine } from "@/components/routines/types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, tintColorLight } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "react-i18next";

type Props = {
  routines: Routine[];
  selectedRoutineId: string | null;
  selectedDay: Day | null;
  onSelectRoutine: (id: string) => void;
  onSelectDay: (day: Day) => void;
};

export function RoutineDayPicker({
  routines,
  selectedRoutineId,
  selectedDay,
  onSelectRoutine,
  onSelectDay,
}: Props) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const selectedRoutine = routines.find((r) => r.id === selectedRoutineId) ?? null;
  const availableDays = selectedRoutine?.days ?? [];

  return (
    <>
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">{t("routineDayPicker.routineSubtitle")}</ThemedText>
        {routines.length ? (
          <View style={styles.chipsRow}>
            {routines.map((r) => {
              const active = selectedRoutineId === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => onSelectRoutine(r.id)}
                  style={[
                    styles.chip,
                    {
                      borderColor: active
                        ? palette.tintBorder
                        : palette.borderChip,
                      backgroundColor: active
                        ? palette.tintMuted
                        : palette.surfaceCard,
                    },
                  ]}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active
                        ? {
                            color:
                              colorScheme === "light"
                                ? tintColorLight
                                : palette.tint,
                          }
                        : { color: isDark ? palette.text : "#0c2f35" },
                    ]}
                  >
                    {r.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <ThemedView
            style={[
              styles.emptyState,
              {
                borderColor: palette.borderHairline,
                backgroundColor: isDark ? palette.surfaceCard : undefined,
              },
            ]}
          >
            <ThemedText type="defaultSemiBold">{t("routineDayPicker.noRoutinesYet")}</ThemedText>
            <ThemedText>{t("routineDayPicker.createRoutineFirst")}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {selectedRoutine ? (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">{t("routineDayPicker.daySubtitle")}</ThemedText>
          {availableDays.length ? (
            <View style={styles.chipsRow}>
              {availableDays.map((d) => {
                const active = selectedDay === d;
                return (
                  <TouchableOpacity
                    key={d}
                    onPress={() => onSelectDay(d)}
                    style={[
                      styles.chip,
                      {
                        borderColor: active
                          ? palette.tintBorder
                          : palette.borderChip,
                        backgroundColor: active
                          ? palette.tintMuted
                          : palette.surfaceCard,
                      },
                    ]}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active
                          ? {
                              color:
                                colorScheme === "light"
                                  ? tintColorLight
                                  : palette.tint,
                            }
                          : { color: isDark ? palette.text : "#0c2f35" },
                      ]}
                    >
                      {t(`days.short.${d}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <ThemedText>{t("routineDayPicker.noDaysSelected")}</ThemedText>
          )}
        </ThemedView>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  emptyState: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: "600",
  },
});
