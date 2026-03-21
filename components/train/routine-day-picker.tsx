import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { Day, Routine } from "@/components/routines/types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, tintColorLight } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

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
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const selectedRoutine = routines.find((r) => r.id === selectedRoutineId) ?? null;
  const availableDays = selectedRoutine?.days ?? [];

  return (
    <>
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Routine</ThemedText>
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
                    active && {
                      backgroundColor: palette.tintMuted,
                      borderColor: palette.tintBorder,
                    },
                  ]}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && {
                        color:
                          colorScheme === "light" ? tintColorLight : palette.tint,
                      },
                    ]}
                  >
                    {r.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <ThemedView style={styles.emptyState}>
            <ThemedText type="defaultSemiBold">No routines yet</ThemedText>
            <ThemedText>Create a routine in the Plan tab first.</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {selectedRoutine ? (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Day</ThemedText>
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
                      active && {
                        backgroundColor: palette.tintMuted,
                        borderColor: palette.tintBorder,
                      },
                    ]}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active && {
                          color:
                            colorScheme === "light"
                              ? tintColorLight
                              : palette.tint,
                        },
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <ThemedText>This routine has no days selected.</ThemedText>
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
    borderColor: "#eee",
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
    borderColor: "#ddd",
    backgroundColor: "white",
  },
  chipText: {
    color: "#0c2f35",
    fontWeight: "600",
  },
});
