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
import { Colors, tintColorLight } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

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
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const cardBg = isDark ? "#1e2224" : "#fff";
  const cardBorder = isDark ? "#2f3638" : "#eee";
  const inputBg = isDark ? "#151718" : "#fafafa";
  const inputBorder = isDark ? "#3a4044" : "#ddd";
  const mutedLabel = palette.icon;
  const removeBtnBg = isDark ? "#1e2224" : "#fff";
  const removeBtnBorder = isDark ? "#2f3638" : "#eee";

  return (
    <View
      style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
      onLayout={onLayout}
    >
      <ThemedText type="defaultSemiBold">{exercise}</ThemedText>

      {sets.length ? (
        <View style={styles.setsList}>
          <View style={styles.setRow}>
            <Text style={[styles.setIndex, styles.headerLabel]}></Text>
            <Text
              style={[
                styles.columnHeader,
                styles.columnWeight,
                { color: mutedLabel },
              ]}
            >
              kg
            </Text>
            <Text
              style={[
                styles.columnHeader,
                styles.columnReps,
                { color: mutedLabel },
              ]}
            >
              Reps
            </Text>
            <Text
              style={[
                styles.columnHeader,
                styles.columnRpe,
                { color: mutedLabel },
              ]}
            >
              RPE
            </Text>
            <View style={styles.removeButtonPlaceholder} />
          </View>
          {sets.map((s, idx) => (
            <View key={`${exercise}-${idx}`} style={styles.setRow}>
              <Text style={[styles.setIndex, { color: palette.text }]}>
                {idx + 1}
              </Text>
              <TextInput
                placeholder="—"
                placeholderTextColor={mutedLabel}
                keyboardType="decimal-pad"
                value={s.weight}
                onChangeText={(v) => onUpdateSet(idx, { weight: v })}
                style={[
                  styles.input,
                  styles.inputWeight,
                  {
                    color: palette.text,
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                  },
                ]}
              />
              <TextInput
                placeholder="—"
                placeholderTextColor={mutedLabel}
                keyboardType="number-pad"
                value={s.reps}
                onChangeText={(v) => onUpdateSet(idx, { reps: v })}
                style={[
                  styles.input,
                  styles.inputReps,
                  {
                    color: palette.text,
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                  },
                ]}
              />
              <TextInput
                placeholder="—"
                placeholderTextColor={mutedLabel}
                keyboardType="decimal-pad"
                value={s.rpe}
                onChangeText={(v) => onUpdateSet(idx, { rpe: v })}
                style={[
                  styles.input,
                  styles.inputRpe,
                  {
                    color: palette.text,
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                  },
                ]}
              />
              <TouchableOpacity
                onPress={() => onRemoveSet(idx)}
                style={[
                  styles.removeButton,
                  {
                    backgroundColor: removeBtnBg,
                    borderColor: removeBtnBorder,
                  },
                ]}
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
    fontSize: 14,
  },
  headerLabel: {
    fontWeight: "600",
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: "600",
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
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
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
    alignItems: "center",
    justifyContent: "center",
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
