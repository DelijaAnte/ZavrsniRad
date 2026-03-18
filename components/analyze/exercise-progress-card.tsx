import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

export function ExerciseProgressCard({
  exercise,
  progress,
}: {
  exercise: string;
  progress: number;
}) {
  const progressText = useMemo(() => {
    const sign = progress >= 0 ? "+" : "";
    return `${sign}${progress}`;
  }, [progress]);

  return (
    <View style={styles.card}>
      <ThemedText type="defaultSemiBold">{exercise}</ThemedText>
      <View style={styles.row}>
        <ThemedText type="subtitle" style={styles.progressLabel}>
          Progress
        </ThemedText>
        <Text style={styles.progressValue}>{progressText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "white",
  },
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
  },
  progressLabel: {
    color: "#0c2f35",
  },
  progressValue: {
    fontWeight: "900",
    color: "#25707a",
    fontSize: 20,
  },
});

