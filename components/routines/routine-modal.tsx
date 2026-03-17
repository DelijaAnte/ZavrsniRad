import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { Day, Routine } from "@/components/routines/types";
import { DAYS } from "@/components/routines/types";

export function RoutineModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (routine: Routine) => void;
}) {
  const [name, setName] = useState("");
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const [activeDay, setActiveDay] = useState<Day | null>(null);
  const [exerciseText, setExerciseText] = useState("");
  const [exercisesByDay, setExercisesByDay] = useState<Record<Day, string[]>>(
    {} as Record<Day, string[]>,
  );

  const canCreate = useMemo(() => {
    return name.trim().length > 0 && selectedDays.length > 0;
  }, [name, selectedDays.length]);

  function resetDraft() {
    setName("");
    setSelectedDays([]);
    setActiveDay(null);
    setExerciseText("");
    setExercisesByDay({} as Record<Day, string[]>);
  }

  function close() {
    onClose();
  }

  function toggleDay(day: Day) {
    setSelectedDays((prev) => {
      const exists = prev.includes(day);
      const next = exists ? prev.filter((d) => d !== day) : [...prev, day];
      next.sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
      return next;
    });

    setExercisesByDay((prev) => {
      const next = { ...prev };
      const exists = selectedDays.includes(day);
      if (exists) delete next[day];
      else next[day] = next[day] ?? [];
      return next;
    });

    setActiveDay((current) => {
      const removing = selectedDays.includes(day);
      if (!removing) return current ?? day;
      if (current !== day) return current;
      const remaining = selectedDays.filter((d) => d !== day);
      return remaining[0] ?? null;
    });
  }

  function addExercise() {
    const txt = exerciseText.trim();
    if (!txt || !activeDay) return;
    setExercisesByDay((prev) => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] ?? []), txt],
    }));
    setExerciseText("");
  }

  function removeExercise(day: Day, index: number) {
    setExercisesByDay((prev) => ({
      ...prev,
      [day]: (prev[day] ?? []).filter((_, i) => i !== index),
    }));
  }

  function createRoutine() {
    const trimmed = name.trim();
    if (!trimmed || selectedDays.length === 0) return;

    const normalized = {} as Record<Day, string[]>;
    for (const d of selectedDays)
      normalized[d] = (exercisesByDay[d] ?? []).slice();

    onCreate({
      id: Date.now().toString(),
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
      onShow={resetDraft}
    >
      <Pressable style={styles.modalOverlay} onPress={close}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {/* Row sa Name labelom i gumbom × */}
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

            {/* TextInput ispod */}
            <TextInput
              placeholder="e.g. Upper body split"
              value={name}
              onChangeText={setName}
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
                    onPress={() => toggleDay(d)}
                    style={[styles.chip, active && styles.chipActive]}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
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
                        onPress={() => setActiveDay(d)}
                        style={[styles.chip, isActive && styles.chipActive]}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isActive && styles.chipTextActive,
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
                              onPress={() => removeExercise(activeDay, idx)}
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
                onChangeText={setExerciseText}
                style={[styles.input, styles.exerciseInput]}
                returnKeyType="done"
                onSubmitEditing={addExercise}
                editable={!!activeDay}
              />
              <TouchableOpacity
                onPress={addExercise}
                style={[styles.addButton, !activeDay && { opacity: 0.5 }]}
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
                  !canCreate && styles.primaryButtonDisabled,
                ]}
                onPress={createRoutine}
                disabled={!canCreate}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    borderRadius: 12,
    padding: 16,
    backgroundColor: "white",
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
  chipActive: {
    backgroundColor: "#cfeff6",
    borderColor: "#7fbcc8",
  },
  chipText: {
    color: "#0c2f35",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#0c2f35",
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
    backgroundColor: "#A1CEDC",
  },
  addButtonText: {
    color: "#0c2f35",
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
    backgroundColor: "#25707a",
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
