import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import {
  ExerciseProgressCard,
  TrainingConsistencyHeatmap,
  type ProgressionDetailView,
} from "@/components/analyze";
import {
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

const PROGRESSION_VIEWS: { key: ProgressionDetailView; label: string }[] = [
  { key: "table", label: "Table" },
  { key: "graphs", label: "Graphs" },
  { key: "consistency", label: "Consistency" },
];

export default function AnalyzeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const { routines, workoutHistory, loading } = useRoutines();
  const [progressionDetailView, setProgressionDetailView] =
    useState<ProgressionDetailView>("table");
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
    () => filterSessionsByPeriod(workoutHistory, "all"),
    [workoutHistory]
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

      <RoutineDayPicker
        routines={routines}
        selectedRoutineId={routineId}
        selectedDay={day}
        onSelectRoutine={selectRoutine}
        onSelectDay={selectDay}
      />

      {selectedRoutine && routineId && day ? (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Progression</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.progressionViewTitle}>
            View
          </ThemedText>
          <View style={styles.chipsRow}>
            {PROGRESSION_VIEWS.map(({ key, label }) => {
              const active = progressionDetailView === key;
              return (
                <TouchableOpacity
                  key={key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.chip,
                    {
                      borderColor: active
                        ? palette.tintBorder
                        : isDark
                          ? "#2f3638"
                          : "#ddd",
                      backgroundColor: active
                        ? palette.tintMuted
                        : isDark
                          ? "#1e2224"
                          : "#fff",
                    },
                  ]}
                  onPress={() => setProgressionDetailView(key)}
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
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {loading ? (
            <ThemedText>Loading history…</ThemedText>
          ) : progressionDetailView === "consistency" ? (
            <TrainingConsistencyHeatmap
              sessions={sessionsInPeriod}
              routineId={routineId}
              routineName={selectedRoutine.name}
              templateDay={day}
            />
          ) : analyzeRows.length ? (
            <View style={styles.progressList}>
              {analyzeRows.map(({ exercise, progression }) =>
                progression ? (
                  <ExerciseProgressCard
                    key={exercise}
                    progression={progression}
                    detailView={progressionDetailView}
                  />
                ) : (
                  <ThemedView
                    key={exercise}
                    style={[
                      styles.placeholderCard,
                      {
                        backgroundColor: isDark ? "#1e2224" : "#fafafa",
                        borderColor: isDark ? "#2f3638" : "#eee",
                      },
                    ]}
                  >
                    <ThemedText type="defaultSemiBold">{exercise}</ThemedText>
                    <ThemedText style={styles.muted}>
                      No saved sessions for this routine and day.
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
  progressionViewTitle: {
    marginTop: 2,
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
  },
  chipText: {
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
    gap: 6,
  },
  muted: {
    fontSize: 14,
    opacity: 0.85,
  },
});
