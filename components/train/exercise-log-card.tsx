import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import type { SetEntry } from "@/components/train/types";
import { ThemedText } from "@/components/themed-text";
import { Colors, tintColorLight } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Props = {
  exercise: string;
  sets: SetEntry[];
  /** Sets from the most recent saved session for this routine/day (same indices as today). */
  previousSets?: SetEntry[] | null;
  onLayout: () => void;
  onAddSet: () => void;
  onRemoveSet: (index: number) => void;
  onUpdateSet: (index: number, patch: Partial<SetEntry>) => void;
};

export function ExerciseLogCard({
  exercise,
  sets,
  previousSets,
  onLayout,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: Props) {
  const { t } = useTranslation();
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
            <View style={styles.indexCol} />
            <Text
              style={[
                styles.columnHeader,
                styles.columnWeight,
                { color: mutedLabel },
              ]}
            >
              {t("train.setColumns.kg")}
            </Text>
            <Text
              style={[
                styles.columnHeader,
                styles.columnReps,
                { color: mutedLabel },
              ]}
            >
              {t("train.setColumns.reps")}
            </Text>
            <Text
              style={[
                styles.columnHeader,
                styles.columnRpe,
                { color: mutedLabel },
              ]}
            >
              {t("train.setColumns.rpe")}
            </Text>
            <View style={styles.removeButtonPlaceholder} />
          </View>
          {sets.map((s, idx) => {
            const prev = previousSets?.[idx];
            const pw = prev?.weight.trim() ?? "";
            const pr = prev?.reps.trim() ?? "";
            const pp = prev?.rpe.trim() ?? "";
            const showLastSession = Boolean(pw || pr || pp);
            return (
              <View key={`${exercise}-${idx}`} style={styles.setBlock}>
                <View style={styles.setRow}>
                  <View style={styles.indexCol}>
                    <Text style={[styles.setIndex, { color: palette.text }]}>
                      {idx + 1}
                    </Text>
                  </View>
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
                {showLastSession ? (
                  <View style={styles.setRow}>
                    <View style={styles.indexCol}>
                      <Text
                        style={[
                          styles.lastSessionLabel,
                          { color: mutedLabel },
                        ]}
                      >
                        {t("train.lastSessionLabel")}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.lastSessionValue,
                        styles.inputWeight,
                        { color: mutedLabel },
                      ]}
                    >
                      {pw ? `${pw} kg` : "—"}
                    </Text>
                    <Text
                      style={[
                        styles.lastSessionValue,
                        styles.inputReps,
                        { color: mutedLabel },
                      ]}
                    >
                      {pr ? pr : "—"}
                    </Text>
                    <Text
                      style={[
                        styles.lastSessionValue,
                        styles.inputRpe,
                        { color: mutedLabel },
                      ]}
                    >
                      {pp ? pp : "—"}
                    </Text>
                    <View style={styles.removeButtonPlaceholder} />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : (
        <ThemedText style={styles.noSets}>
          {t("train.addFirstSetHint")}
        </ThemedText>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onAddSet}
          style={styles.addButton}
          activeOpacity={0.85}
        >
          <Text style={styles.addButtonText}>{t("train.addSetButton")}</Text>
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
    gap: 8,
    marginTop: 10,
  },
  setBlock: {
    gap: 4,
  },
  indexCol: {
    width: 62,
    alignItems: "center",
    justifyContent: "center",
  },
  lastSessionLabel: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 12,
  },
  lastSessionValue: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  setIndex: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 14,
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
