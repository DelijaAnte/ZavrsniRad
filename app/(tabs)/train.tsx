import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
import { Colors, tintColorLight } from "@/constants/theme";

export default function TrainScreen() {
  const { routines, saveWorkoutSession, loading, saving } = useRoutines();
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

  async function handleSaveSession() {
    if (!selectedRoutine || !day) return;
    const { error } = await saveWorkoutSession({
      routineId: selectedRoutine.id,
      day,
      log,
    });
    if (error) {
      Alert.alert("Could not save", error);
      return;
    }
    Alert.alert("Saved", "This session was saved to your account.");
    reset();
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
          <ThemedText type="title">Train</ThemedText>
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
              {exercisesForDay.map((exercise, index) => (
                <ExerciseLogCard
                  key={`${selectedRoutine.id}-${day}-${index}`}
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

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Save workout session"
            style={[
              styles.saveSession,
              { backgroundColor: tintColorLight },
              (loading || saving) && styles.saveSessionDisabled,
            ]}
            onPress={() => void handleSaveSession()}
            disabled={loading || saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveSessionText}>
              {saving ? "Saving…" : "Save session"}
            </Text>
          </TouchableOpacity>
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
  saveSession: {
    marginTop: 16,
    alignSelf: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  saveSessionDisabled: {
    opacity: 0.55,
  },
  saveSessionText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
