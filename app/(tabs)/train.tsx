import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { useRoutines } from "@/components/routines/routines-store";
import type { Day, Routine } from "@/components/routines/types";
import {
  ExerciseLogCard,
  RoutineDayPicker,
  useTrainLog,
} from "@/components/train";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function TrainScreen() {
  const { routines } = useRoutines();
  const { log, reset, ensureExercise, addSet, removeSet, updateSet } =
    useTrainLog();

  const [routineId, setRoutineId] = useState<string | null>(null);
  const [day, setDay] = useState<Day | null>(null);

  const selectedRoutine = useMemo<Routine | null>(() => {
    if (!routineId) return null;
    return routines.find((r) => r.id === routineId) ?? null;
  }, [routineId, routines]);

  const exercisesForDay =
    (day && selectedRoutine?.exercisesByDay[day]) || [];

  function selectRoutine(nextId: string) {
    setRoutineId(nextId);
    setDay(null);
    reset();
  }

  function selectDay(nextDay: Day) {
    setDay(nextDay);
    reset();
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedView style={styles.headerRow}>
        <View style={styles.headerTitles}>
          <ThemedText type="title">Train</ThemedText>
          <ThemedText>Pick a routine and log today&apos;s work.</ThemedText>
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
          <ThemedText type="subtitle">Exercises</ThemedText>
          {exercisesForDay.length ? (
            <View style={styles.exerciseList}>
              {exercisesForDay.map((exercise) => (
                <ExerciseLogCard
                  key={exercise}
                  exercise={exercise}
                  sets={log[exercise] ?? []}
                  onLayout={() => ensureExercise(exercise)}
                  onAddSet={() => addSet(exercise)}
                  onRemoveSet={(idx) => removeSet(exercise, idx)}
                  onUpdateSet={(idx, patch) => updateSet(exercise, idx, patch)}
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
  exerciseList: {
    gap: 12,
  },
});
