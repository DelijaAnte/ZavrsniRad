import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { SetEntry } from "@/components/train/types";
import { ThemedText } from "@/components/themed-text";
import { tintColorLight } from "@/constants/theme";

type Props = {
  exercise: string;
  sets: SetEntry[];
  onLayout: () => void;
  onAddSet: () => void;
  onRemoveSet: (index: number) => void;
  onUpdateSet: (index: number, patch: Partial<SetEntry>) => void;
};

export function ExerciseLogCard({
  exercise,
  sets,
  onLayout,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: Props) {
  return (
    <View style={styles.card} onLayout={onLayout}>
      <ThemedText type="defaultSemiBold">{exercise}</ThemedText>

      {sets.length ? (
        <View style={styles.setsList}>
          <View style={styles.setRow}>
            <Text style={[styles.setIndex, styles.headerLabel]}></Text>
            <Text style={[styles.columnHeader, styles.columnWeight]}>kg</Text>
            <Text style={[styles.columnHeader, styles.columnReps]}>Reps</Text>
            <Text style={[styles.columnHeader, styles.columnRpe]}>RPE</Text>
            <View style={styles.removeButtonPlaceholder} />
          </View>
          {sets.map((s, idx) => (
            <View key={`${exercise}-${idx}`} style={styles.setRow}>
              <Text style={styles.setIndex}>{idx + 1}</Text>
              <TextInput
                placeholder="—"
                keyboardType="decimal-pad"
                value={s.weight}
                onChangeText={(v) => onUpdateSet(idx, { weight: v })}
                style={[styles.input, styles.inputWeight]}
              />
              <TextInput
                placeholder="—"
                keyboardType="number-pad"
                value={s.reps}
                onChangeText={(v) => onUpdateSet(idx, { reps: v })}
                style={[styles.input, styles.inputReps]}
              />
              <TextInput
                placeholder="—"
                keyboardType="decimal-pad"
                value={s.rpe}
                onChangeText={(v) => onUpdateSet(idx, { rpe: v })}
                style={[styles.input, styles.inputRpe]}
              />
              <TouchableOpacity
                onPress={() => onRemoveSet(idx)}
                style={styles.removeButton}
                activeOpacity={0.85}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <ThemedText style={styles.noSets}>Add your first set.</ThemedText>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onAddSet}
          style={styles.addButton}
          activeOpacity={0.85}
        >
          <Text style={styles.addButtonText}>+ Set</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "white",
  },
  setsList: {
    gap: 6,
    marginTop: 10,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  setIndex: {
    width: 24,
    textAlign: "center",
    fontWeight: "700",
    color: "#0c2f35",
    fontSize: 14,
  },
  headerLabel: {
    fontWeight: "600",
    color: "#666",
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  columnWeight: { flex: 1.2, minWidth: 44 },
  columnReps: { flex: 1.2, minWidth: 44 },
  columnRpe: { flex: 1, minWidth: 36 },
  removeButtonPlaceholder: {
    width: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    fontSize: 15,
    textAlign: "center",
  },
  inputWeight: { flex: 1.2, minWidth: 44 },
  inputReps: { flex: 1.2, minWidth: 44 },
  inputRpe: { flex: 1, minWidth: 36 },
  removeButton: {
    width: 32,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  removeButtonText: {
    fontWeight: "700",
    fontSize: 18,
    color: "#7a2b2b",
  },
  noSets: {
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: tintColorLight,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
});
