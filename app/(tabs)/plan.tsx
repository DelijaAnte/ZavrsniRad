import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

type Routine = {
  id: string;
  name: string;
  days: string[];
  exercises: string[];
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export default function PlanScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [exerciseText, setExerciseText] = useState("");
  const [exercises, setExercises] = useState<string[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const canSave = useMemo(() => {
    return name.trim().length > 0;
  }, [name]);

  function toggleDay(day: (typeof DAYS)[number]) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function addExercise() {
    const txt = exerciseText.trim();
    if (!txt) return;
    setExercises((s) => [...s, txt]);
    setExerciseText("");
  }

  function resetDraft() {
    setName("");
    setSelectedDays([]);
    setExercises([]);
    setExerciseText("");
  }

  function saveRoutine() {
    const trimmed = name.trim();
    if (!trimmed) return;

    const newRoutine: Routine = {
      id: Date.now().toString(),
      name: trimmed,
      days: selectedDays.slice().sort(),
      exercises: exercises.slice(),
    };

    setRoutines((r) => [newRoutine, ...r]);
    resetDraft();
    setModalVisible(false);
  }

  function renderRoutine({ item }: { item: Routine }) {
    const expanded = expandedId === item.id;

    return (
      <TouchableOpacity
        style={styles.routineCard}
        onPress={() => setExpandedId((id) => (id === item.id ? null : item.id))}
      >
        <View style={styles.routineHeader}>
          <ThemedText type="subtitle">{item.name}</ThemedText>
          <ThemedText>{`${item.days.length} days • ${item.exercises.length} exercises`}</ThemedText>
        </View>

        {expanded ? (
          <View style={styles.routineBody}>
            <ThemedText type="defaultSemiBold">Days</ThemedText>
            <Text>{item.days.join(", ") || "None"}</Text>

            <ThemedText type="defaultSemiBold">Exercises</ThemedText>
            {item.exercises.length ? (
              item.exercises.map((ex, idx) => <Text key={idx}>• {ex}</Text>)
            ) : (
              <Text>None</Text>
            )}
          </View>
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Plan</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
        >
          <ThemedText type="subtitle">Create workout routine</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Your routines</ThemedText>
        {routines.length ? (
          <FlatList
            data={routines}
            keyExtractor={(i) => i.id}
            renderItem={renderRoutine}
            scrollEnabled={false}
          />
        ) : (
          <ThemedText>No routines yet. Create one to get started.</ThemedText>
        )}
      </ThemedView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContainer}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <ThemedText type="title">Create Workout Routine</ThemedText>

              <ThemedText type="defaultSemiBold">Name</ThemedText>
              <TextInput
                placeholder="e.g. Upper body split"
                value={name}
                onChangeText={setName}
                style={styles.input}
                accessibilityLabel="Routine name"
              />

              <ThemedText type="defaultSemiBold">Days</ThemedText>
              <View style={styles.daysRow}>
                {DAYS.map((d) => {
                  const active = selectedDays.includes(d);
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => toggleDay(d)}
                      style={[
                        styles.dayButton,
                        active && styles.dayButtonActive,
                      ]}
                    >
                      <ThemedText type="defaultSemiBold">{d}</ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <ThemedText type="defaultSemiBold">Exercises</ThemedText>
              {exercises.map((ex, idx) => (
                <View key={`${idx}-${ex}`} style={styles.exerciseRow}>
                  <Text>{idx + 1}.</Text>
                  <Text style={styles.exerciseText}>{ex}</Text>
                </View>
              ))}

              <View style={styles.addExerciseRow}>
                <TextInput
                  placeholder="Add exercise"
                  value={exerciseText}
                  onChangeText={setExerciseText}
                  style={[styles.input, styles.exerciseInput]}
                />
                <TouchableOpacity onPress={addExercise} style={styles.addButton}>
                  <ThemedText type="subtitle">Add</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    resetDraft();
                    setModalVisible(false);
                  }}
                >
                  <ThemedText>Cancel</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    !canSave && styles.saveButtonDisabled,
                  ]}
                  onPress={saveRoutine}
                  disabled={!canSave}
                >
                  <ThemedText type="defaultSemiBold">Save</ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  createButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#A1CEDC",
    alignSelf: "flex-start",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    maxHeight: "90%",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 8,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  dayButtonActive: {
    backgroundColor: "#cfeff6",
    borderColor: "#7fbcc8",
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
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#A1CEDC",
  },
  routineCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 8,
  },
  routineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  routineBody: {
    marginTop: 8,
    gap: 6,
  },
  exerciseRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  exerciseText: { marginLeft: 6 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  cancelButton: {
    padding: 10,
  },
  saveButton: {
    padding: 10,
    backgroundColor: "#25707a",
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
});

