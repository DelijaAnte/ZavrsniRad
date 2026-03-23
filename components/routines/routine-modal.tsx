import React, { useEffect, useMemo, useReducer, useRef } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { ThemedText } from "@/components/themed-text";
import type { Day, Routine } from "@/components/routines/types";
import { DAYS } from "@/components/routines/types";
import { Colors, tintColorLight } from "@/constants/theme";

type RoutineModalDraft = {
  name: string;
  selectedDays: Day[];
  activeDay: Day | null;
  exerciseText: string;
  exercisesByDay: Record<Day, string[]>;
};

function emptyDraft(): RoutineModalDraft {
  return {
    name: "",
    selectedDays: [],
    activeDay: null,
    exerciseText: "",
    exercisesByDay: {} as Record<Day, string[]>,
  };
}

type RoutineModalAction =
  | { type: "replace"; draft: RoutineModalDraft }
  | { type: "setName"; name: string }
  | { type: "setExerciseText"; text: string }
  | { type: "setActiveDay"; day: Day }
  | { type: "toggleDay"; day: Day }
  | { type: "addExercise" }
  | { type: "removeExercise"; day: Day; index: number };

function routineModalReducer(
  state: RoutineModalDraft,
  action: RoutineModalAction
): RoutineModalDraft {
  switch (action.type) {
    case "replace":
      return action.draft;
    case "setName":
      return { ...state, name: action.name };
    case "setExerciseText":
      return { ...state, exerciseText: action.text };
    case "setActiveDay":
      return { ...state, activeDay: action.day };
    case "toggleDay": {
      const { day } = action;
      const existed = state.selectedDays.includes(day);
      const selectedDays = existed
        ? state.selectedDays.filter((d) => d !== day)
        : [...state.selectedDays, day].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
      const exercisesByDay = { ...state.exercisesByDay };
      if (existed) {
        delete exercisesByDay[day];
      } else {
        exercisesByDay[day] = exercisesByDay[day] ?? [];
      }
      let activeDay = state.activeDay;
      if (!existed) {
        activeDay = activeDay ?? day;
      } else if (activeDay === day) {
        activeDay = selectedDays[0] ?? null;
      }
      return { ...state, selectedDays, exercisesByDay, activeDay };
    }
    case "addExercise": {
      const txt = state.exerciseText.trim();
      if (!txt || !state.activeDay) return state;
      return {
        ...state,
        exerciseText: "",
        exercisesByDay: {
          ...state.exercisesByDay,
          [state.activeDay]: [...(state.exercisesByDay[state.activeDay] ?? []), txt],
        },
      };
    }
    case "removeExercise":
      return {
        ...state,
        exercisesByDay: {
          ...state.exercisesByDay,
          [action.day]: (state.exercisesByDay[action.day] ?? []).filter(
            (_, i) => i !== action.index
          ),
        },
      };
    default:
      return state;
  }
}

export function RoutineModal({
  visible,
  onClose,
  mode,
  initialRoutine,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialRoutine: Routine | null;
  onSave: (routine: Routine) => void;
}) {
  const selectedChipStyle = {
    backgroundColor: Colors.light.tintMuted,
    borderColor: Colors.light.tintBorder,
  };

  const [draft, dispatch] = useReducer(routineModalReducer, undefined, emptyDraft);

  const { name, selectedDays, activeDay, exerciseText, exercisesByDay } = draft;

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && selectedDays.length > 0;
  }, [name, selectedDays.length]);

  const wasVisibleRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      wasVisibleRef.current = false;
      return;
    }
    const justOpened = !wasVisibleRef.current;
    wasVisibleRef.current = true;
    if (!justOpened) return;

    if (mode === "edit" && initialRoutine) {
      const days = initialRoutine.days.slice();
      const nextExercises = {} as Record<Day, string[]>;
      for (const d of DAYS) {
        nextExercises[d] = (initialRoutine.exercisesByDay[d] ?? []).slice();
      }
      dispatch({
        type: "replace",
        draft: {
          name: initialRoutine.name,
          selectedDays: days,
          activeDay: days[0] ?? null,
          exerciseText: "",
          exercisesByDay: nextExercises,
        },
      });
      return;
    }
    dispatch({ type: "replace", draft: emptyDraft() });
  }, [visible, mode, initialRoutine]);

  function resetDraft() {
    dispatch({ type: "replace", draft: emptyDraft() });
  }

  function close() {
    onClose();
  }

  function addExercisePress() {
    const txt = exerciseText.trim();
    if (!txt || !activeDay) return;
    const list = exercisesByDay[activeDay] ?? [];
    if (list.some((ex) => ex.trim().toLowerCase() === txt.toLowerCase())) {
      Alert.alert(
        "Duplicate exercise",
        "That exercise is already listed for this day. Use a different name or remove the duplicate first."
      );
      return;
    }
    dispatch({ type: "addExercise" });
  }

  function submitRoutine() {
    const trimmed = name.trim();
    if (!trimmed || selectedDays.length === 0) return;

    const normalized = {} as Record<Day, string[]>;
    for (const d of selectedDays) normalized[d] = (exercisesByDay[d] ?? []).slice();

    const id =
      mode === "edit" && initialRoutine ? initialRoutine.id : Date.now().toString();

    onSave({
      id,
      name: trimmed,
      days: selectedDays.slice(),
      exercisesByDay: normalized,
    });

    resetDraft();
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={close}
    >
      <Pressable style={styles.modalOverlay} onPress={close}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            bottomOffset={20}
            extraKeyboardSpace={16}
            showsVerticalScrollIndicator
            contentContainerStyle={styles.modalScrollContent}
          >
            <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
              {mode === "edit" ? "Edit routine" : "New routine"}
            </ThemedText>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <ThemedText type="defaultSemiBold">Name</ThemedText>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={close}
                style={styles.iconButton}
              >
                <Text style={styles.iconButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="e.g. Upper body split"
              value={name}
              onChangeText={(v) => dispatch({ type: "setName", name: v })}
              style={styles.input}
              accessibilityLabel="Routine name"
              returnKeyType="done"
            />

            <ThemedText type="defaultSemiBold">Days</ThemedText>
            <View style={styles.chipsRow}>
              {DAYS.map((d) => {
                const active = selectedDays.includes(d);
                return (
                  <TouchableOpacity
                    key={d}
                    onPress={() => dispatch({ type: "toggleDay", day: d })}
                    style={[styles.chip, active && selectedChipStyle]}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active && { color: tintColorLight },
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ThemedText type="defaultSemiBold">Exercises by day</ThemedText>
            {selectedDays.length ? (
              <>
                <ThemedText style={{ marginTop: 6 }}>
                  Pick a day, then add exercises for that day.
                </ThemedText>
                <View style={[styles.chipsRow, { marginTop: 10 }]}>
                  {selectedDays.map((d) => {
                    const isActive = activeDay === d;
                    return (
                      <TouchableOpacity
                        key={d}
                        onPress={() => dispatch({ type: "setActiveDay", day: d })}
                        style={[styles.chip, isActive && selectedChipStyle]}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isActive && { color: tintColorLight },
                          ]}
                        >
                          {d}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {activeDay ? (
                  <>
                    {(exercisesByDay[activeDay] ?? []).length ? (
                      <View style={{ gap: 8, marginTop: 8 }}>
                        {(exercisesByDay[activeDay] ?? []).map((ex, idx) => (
                          <View
                            key={`${activeDay}-${idx}-${ex}`}
                            style={styles.exerciseItem}
                          >
                            <Text style={styles.exerciseIndex}>{idx + 1}</Text>
                            <Text style={styles.exerciseName} numberOfLines={2}>
                              {ex}
                            </Text>
                            <TouchableOpacity
                              accessibilityRole="button"
                              accessibilityLabel={`Remove ${ex}`}
                              onPress={() =>
                                dispatch({
                                  type: "removeExercise",
                                  day: activeDay,
                                  index: idx,
                                })
                              }
                              style={styles.removeButton}
                              activeOpacity={0.85}
                            >
                              <Text style={styles.removeButtonText}>
                                Remove
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <ThemedText style={{ marginTop: 8 }}>
                        No exercises for {activeDay} yet.
                      </ThemedText>
                    )}
                  </>
                ) : (
                  <ThemedText style={{ marginTop: 8 }}>
                    Select a day to add exercises.
                  </ThemedText>
                )}
              </>
            ) : (
              <ThemedText style={{ marginTop: 8 }}>
                Select at least one day first.
              </ThemedText>
            )}

            <View style={styles.addExerciseRow}>
              <TextInput
                placeholder={
                  activeDay
                    ? `Add exercise for ${activeDay} (e.g. Bench Press 3x8)`
                    : "Select a day above"
                }
                value={exerciseText}
                onChangeText={(v) => dispatch({ type: "setExerciseText", text: v })}
                style={[styles.input, styles.exerciseInput]}
                returnKeyType="done"
                onSubmitEditing={addExercisePress}
                editable={!!activeDay}
              />
              <TouchableOpacity
                onPress={addExercisePress}
                style={[
                  styles.addButton,
                  { backgroundColor: tintColorLight },
                  !activeDay && { opacity: 0.5 },
                ]}
                activeOpacity={0.85}
                disabled={!activeDay}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={close}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: tintColorLight },
                  !canSubmit && styles.primaryButtonDisabled,
                ]}
                onPress={submitRoutine}
                disabled={!canSubmit}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>
                  {mode === "edit" ? "Save changes" : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    maxHeight: "90%",
    width: "100%",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "white",
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  iconButtonText: {
    fontSize: 22,
    lineHeight: 24,
    color: "#0c2f35",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 8,
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
  addExerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 8,
  },
  exerciseInput: {
    flex: 1,
    marginVertical: 0,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    backgroundColor: "white",
  },
  exerciseIndex: {
    width: 22,
    textAlign: "center",
    fontWeight: "700",
    color: "#0c2f35",
  },
  exerciseName: {
    flex: 1,
    color: "#0c2f35",
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "white",
  },
  removeButtonText: {
    color: "#7a2b2b",
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "white",
  },
  secondaryButtonText: {
    fontWeight: "700",
    color: "#0c2f35",
  },
  primaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  primaryButtonText: {
    fontWeight: "800",
    color: "white",
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
});
