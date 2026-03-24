import React, { useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRoutines } from "@/components/routines/routines-store";
import type { Day, Routine } from "@/components/routines/types";
import {
  ExerciseLogCard,
  RoutineDayPicker,
  useTrainLog,
} from "@/components/train";
import type { SetEntry } from "@/components/train/types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { tintColorLight } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getPreviousSetsForExercise } from "@/utils/training-data";

/** Match `ParallaxScrollView` content padding so Train looks consistent with other tabs. */
const CONTENT_PADDING = 32;

export default function TrainScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, "background");
  const { routines, workoutHistory, saveWorkoutSession, loading, saving } =
    useRoutines();
  const { log, reset, ensureExercise, addSet, removeSet, updateSet } =
    useTrainLog();

  const [routineId, setRoutineId] = useState<string | null>(null);
  const [day, setDay] = useState<Day | null>(null);

  const selectedRoutine = useMemo<Routine | null>(() => {
    if (!routineId) return null;
    return routines.find((r) => r.id === routineId) ?? null;
  }, [routineId, routines]);

  const exercisesForDay = useMemo(
    () => (day && selectedRoutine?.exercisesByDay[day]) || [],
    [day, selectedRoutine]
  );

  const previousSetsByExercise = useMemo((): Record<string, SetEntry[] | null> => {
    if (!selectedRoutine || !day) return {};
    const out: Record<string, SetEntry[] | null> = {};
    for (const ex of exercisesForDay) {
      out[ex] = getPreviousSetsForExercise(
        workoutHistory,
        selectedRoutine.id,
        day,
        ex
      );
    }
    return out;
  }, [workoutHistory, selectedRoutine, day, exercisesForDay]);

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
    <KeyboardAwareScrollView
      style={[styles.flex, { backgroundColor }]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={20}
      extraKeyboardSpace={12}
      showsVerticalScrollIndicator
      contentContainerStyle={[
        styles.scrollInner,
        {
          paddingTop: CONTENT_PADDING + insets.top,
          paddingBottom: CONTENT_PADDING + insets.bottom + 32,
          paddingHorizontal: CONTENT_PADDING,
        },
      ]}
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
                  previousSets={previousSetsByExercise[exercise] ?? undefined}
                  onLayout={() => ensureExercise(exercise)}
                  onAddSet={() => addSet(exercise)}
                  onRemoveSet={(idx) => removeSet(exercise, idx)}
                  onUpdateSet={(idx, patch) =>
                    updateSet(exercise, idx, patch)
                  }
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
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollInner: {
    gap: 16,
  },
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
