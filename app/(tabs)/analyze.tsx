import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { useRoutines } from "@/components/routines/routines-store";
import type { Day, Routine } from "@/components/routines/types";
import { RoutineDayPicker } from "@/components/train/routine-day-picker";
import { ExerciseProgressCard } from "@/components/analyze";

export default function AnalyzeScreen() {
  const { routines } = useRoutines();
  const [routineId, setRoutineId] = useState<string | null>(null);
  const [day, setDay] = useState<Day | null>(null);

  const selectedRoutine = useMemo<Routine | null>(() => {
    if (!routineId) return null;
    return routines.find((r) => r.id === routineId) ?? null;
  }, [routineId, routines]);

  const exercisesForDay = (day && selectedRoutine?.exercisesByDay[day]) || [];

  function selectRoutine(nextId: string) {
    setRoutineId(nextId);
    setDay(null);
  }

  function selectDay(nextDay: Day) {
    setDay(nextDay);
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedView style={styles.headerRow}>
        <View style={styles.headerTitles}>
          <ThemedText type="title">Analyze</ThemedText>
          <ThemedText>See progression per exercise (demo for now).</ThemedText>
        </View>
      </ThemedView>

      <RoutineDayPicker
        routines={routines}
        selectedRoutineId={routineId}
        selectedDay={day}
        onSelectRoutine={selectRoutine}
        onSelectDay={selectDay}
      />

      {selectedRoutine && day ? (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Progress</ThemedText>

          {exercisesForDay.length ? (
            <View style={styles.progressList}>
              {exercisesForDay.map((exercise, idx) => (
                <ExerciseProgressCard
                  key={exercise}
                  exercise={exercise}
                  progress={idx % 2 === 0 ? 1 : 2}
                />
              ))}
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
  section: {
    gap: 8,
  },
  progressList: {
    gap: 12,
    marginTop: 8,
  },
});

