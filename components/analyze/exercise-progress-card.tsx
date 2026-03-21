import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ExerciseProgression } from "@/components/analyze/progression";
import { ThemedText } from "@/components/themed-text";

function formatMetric(value: number, unit: ExerciseProgression["unit"]): string {
  if (unit === "kg") {
    return Number.isInteger(value) ? `${value}` : value.toFixed(1);
  }
  return `${Math.round(value)}`;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function ExerciseProgressCard({
  progression,
}: {
  progression: ExerciseProgression;
}) {
  const unitLabel = progression.unit === "kg" ? "kg (best set)" : "reps (best set)";

  const deltaText = useMemo(() => {
    const d = progression.delta;
    if (d === 0) return "0";
    const sign = d > 0 ? "+" : "";
    return `${sign}${formatMetric(d, progression.unit)}`;
  }, [progression.delta, progression.unit]);

  const needsMoreSessions = progression.sessionsUsed < 2;

  const deltaColor = useMemo(() => {
    if (needsMoreSessions) return "#666";
    if (progression.delta > 0) return "#1a6b4a";
    if (progression.delta < 0) return "#8b2c2c";
    return "#25707a";
  }, [needsMoreSessions, progression.delta]);

  return (
    <View style={styles.card}>
      <ThemedText type="defaultSemiBold">{progression.exercise}</ThemedText>
      <Text style={styles.unitHint}>{unitLabel}</Text>

      <View style={styles.valuesRow}>
        <View style={styles.valueBlock}>
          <Text style={styles.valueLabel}>First</Text>
          <Text style={styles.valueNum}>
            {formatMetric(progression.firstValue, progression.unit)}
          </Text>
          <Text style={styles.valueDate}>{formatShortDate(progression.firstAt)}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <View style={styles.valueBlock}>
          <Text style={styles.valueLabel}>Latest</Text>
          <Text style={styles.valueNum}>
            {formatMetric(progression.lastValue, progression.unit)}
          </Text>
          <Text style={styles.valueDate}>{formatShortDate(progression.lastAt)}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <ThemedText type="subtitle" style={styles.progressLabel}>
          Change
        </ThemedText>
        <Text style={[styles.progressValue, { color: deltaColor }]}>
          {deltaText}
        </Text>
      </View>

      {needsMoreSessions ? (
        <ThemedText style={styles.hint}>
          Log this exercise on two different days in this period to see change vs
          your first log.
        </ThemedText>
      ) : (
        <ThemedText style={styles.hint}>
          Based on {progression.sessionsUsed} logged sessions in this period.
        </ThemedText>
      )}
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
    gap: 6,
  },
  unitHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  valuesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 8,
  },
  valueBlock: {
    flex: 1,
    gap: 2,
  },
  valueLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  valueNum: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0c2f35",
  },
  valueDate: {
    fontSize: 11,
    color: "#888",
  },
  arrow: {
    fontSize: 18,
    fontWeight: "700",
    color: "#25707a",
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  progressLabel: {
    color: "#0c2f35",
  },
  progressValue: {
    fontWeight: "900",
    fontSize: 22,
  },
  hint: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});
