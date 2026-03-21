import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ExerciseProgressCard } from "@/components/analyze";
import {
  type AnalyzePeriod,
  filterSessionsByPeriod,
  progressionForExercise,
} from "@/components/analyze/progression";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRoutines } from "@/components/routines/routines-store";
import type { Day, Routine } from "@/components/routines/types";
import { RoutineDayPicker } from "@/components/train/routine-day-picker";
import { Colors, tintColorLight } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const PERIODS: { key: AnalyzePeriod; label: string }[] = [
  { key: "week", label: "1 week" },
  { key: "month", label: "1 month" },
  { key: "all", label: "All time" },
];

export default function AnalyzeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { routines, workoutHistory, loading } = useRoutines();
  const [period, setPeriod] = useState<AnalyzePeriod>("month");
  const [routineId, setRoutineId] = useState<string | null>(null);
  const [day, setDay] = useState<Day | null>(null);

  const selectedRoutine = useMemo<Routine | null>(() => {
    if (!routineId) return null;
    return routines.find((r) => r.id === routineId) ?? null;
  }, [routineId, routines]);

  const exercisesForDay = useMemo(() => {
    if (!day || !selectedRoutine) return [];
    return selectedRoutine.exercisesByDay[day] ?? [];
  }, [day, selectedRoutine]);

  const sessionsInPeriod = useMemo(
    () => filterSessionsByPeriod(workoutHistory, period),
    [workoutHistory, period]
  );

  const analyzeRows = useMemo(() => {
    if (!routineId || !day || !exercisesForDay.length) return [];
    return exercisesForDay.map((exercise) => ({
      exercise,
      progression: progressionForExercise(
        sessionsInPeriod,
        routineId,
        day,
        exercise
      ),
    }));
  }, [sessionsInPeriod, routineId, day, exercisesForDay]);

  function selectRoutine(nextId: string) {
    setRoutineId(nextId);
    setDay(null);
  }

  function selectDay(nextDay: Day) {
    setDay(nextDay);
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: Colors.light.parallaxHeader,
        dark: Colors.dark.parallaxHeader,
      }}
    >
      <ThemedView style={styles.headerRow}>
        <View style={styles.headerTitles}>
          <ThemedText type="title">Analyze</ThemedText>
        </View>
      </ThemedView>

      <ThemedText type="defaultSemiBold" style={styles.periodTitle}>
        Period
      </ThemedText>
      <View style={styles.chipsRow}>
        {PERIODS.map(({ key, label }) => {
          const active = period === key;
          return (
            <TouchableOpacity
              key={key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                styles.chip,
                active && {
                  backgroundColor: palette.tintMuted,
                  borderColor: palette.tintBorder,
                },
              ]}
              onPress={() => setPeriod(key)}
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
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <RoutineDayPicker
        routines={routines}
        selectedRoutineId={routineId}
        selectedDay={day}
        onSelectRoutine={selectRoutine}
        onSelectDay={selectDay}
      />

      {selectedRoutine && day ? (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Progression</ThemedText>

          {loading ? (
            <ThemedText>Loading history…</ThemedText>
          ) : analyzeRows.length ? (
            <View style={styles.progressList}>
              {analyzeRows.map(({ exercise, progression }) =>
                progression ? (
                  <ExerciseProgressCard
                    key={exercise}
                    progression={progression}
                  />
                ) : (
                  <ThemedView key={exercise} style={styles.placeholderCard}>
                    <ThemedText type="defaultSemiBold">{exercise}</ThemedText>
                    <ThemedText style={styles.muted}>
                      No saved sessions in this period for this routine and day.
                    </ThemedText>
                  </ThemedView>
                )
              )}
            </View>
          ) : (
            <ThemedText>No exercises for {day}.</ThemedText>
          )}
        </ThemedView>
      ) : null}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTitles: {
    flex: 1,
    gap: 4,
  },
  periodTitle: {
    marginTop: 4,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
  },
  chipText: {
    color: "#0c2f35",
    fontWeight: "600",
    fontSize: 14,
  },
  section: {
    gap: 8,
  },
  progressList: {
    gap: 12,
    marginTop: 8,
  },
  placeholderCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
    gap: 6,
  },
  muted: {
    color: "#666",
    fontSize: 14,
  },
});
