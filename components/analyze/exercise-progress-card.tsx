import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ExerciseProgression } from "@/components/analyze/progression";
import { ThemedText } from "@/components/themed-text";

function formatKg(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatDashNumber(n: number | null, isKg: boolean): string {
  if (n == null) return "—";
  return isKg ? formatKg(n) : `${Math.round(n)}`;
}

function formatDelta(n: number | null, isKg: boolean): string {
  if (n == null) return "—";
  if (n === 0) return "0";
  const sign = n > 0 ? "+" : "−";
  const mag = Math.abs(n);
  return `${sign}${isKg ? formatKg(mag) : Math.round(mag)}`;
}

function deltaColor(delta: number | null, needsMoreSessions: boolean): string {
  if (needsMoreSessions) return "#666";
  if (delta == null) return "#666";
  if (delta > 0) return "#1a6b4a";
  if (delta < 0) return "#8b2c2c";
  return "#25707a";
}

export function ExerciseProgressCard({
  progression,
}: {
  progression: ExerciseProgression;
}) {
  const needsMoreSessions = progression.sessionsUsed < 2;

  const weightDeltaColor = useMemo(
    () => deltaColor(progression.weightDelta, needsMoreSessions),
    [progression.weightDelta, needsMoreSessions]
  );
  const repsDeltaColor = useMemo(
    () => deltaColor(progression.repsDelta, needsMoreSessions),
    [progression.repsDelta, needsMoreSessions]
  );

  return (
    <View style={styles.card}>
      <ThemedText type="defaultSemiBold">{progression.exercise}</ThemedText>
      <Text style={styles.unitHint}>
        Best weight & best reps per saved session on this day
      </Text>

      <View style={styles.sessionList}>
        <View style={styles.sessionHeaderRow}>
          <Text style={[styles.sessionHead, styles.colDate]}>Date</Text>
          <Text style={[styles.sessionHead, styles.colKg]}>kg</Text>
          <Text style={[styles.sessionHead, styles.colReps]}>reps</Text>
        </View>
        {progression.rows.map((row, idx) => (
          <View
            key={`${row.at}-${idx}`}
            style={[
              styles.sessionRow,
              idx % 2 === 1 && styles.sessionRowAlt,
            ]}
          >
            <Text style={[styles.sessionCell, styles.colDate]} numberOfLines={1}>
              {formatShortDate(row.at)}
            </Text>
            <Text style={[styles.sessionCell, styles.colKg]}>
              {formatDashNumber(row.kg, true)}
            </Text>
            <Text style={[styles.sessionCell, styles.colReps]}>
              {formatDashNumber(row.reps, false)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <ThemedText type="defaultSemiBold" style={styles.summaryTitle}>
          First → latest in period
        </ThemedText>

        <View style={styles.metricBlock}>
          <Text style={styles.metricLabel}>Weight (kg)</Text>
          <View style={styles.metricValues}>
            <Text style={styles.metricMain}>
              {formatDashNumber(progression.weightFirst, true)} →{" "}
              {formatDashNumber(progression.weightLast, true)}
            </Text>
            <Text
              style={[
                styles.metricDelta,
                { color: weightDeltaColor },
              ]}
            >
              Δ {formatDelta(progression.weightDelta, true)}
            </Text>
          </View>
        </View>

        <View style={styles.metricBlock}>
          <Text style={styles.metricLabel}>Reps (best set)</Text>
          <View style={styles.metricValues}>
            <Text style={styles.metricMain}>
              {formatDashNumber(progression.repsFirst, false)} →{" "}
              {formatDashNumber(progression.repsLast, false)}
            </Text>
            <Text
              style={[
                styles.metricDelta,
                { color: repsDeltaColor },
              ]}
            >
              Δ {formatDelta(progression.repsDelta, false)}
            </Text>
          </View>
        </View>
      </View>

      {needsMoreSessions ? (
        <ThemedText style={styles.hint}>
          Save this day twice in the period to see change from first to latest
          session.
        </ThemedText>
      ) : (
        <ThemedText style={styles.hint}>
          {progression.sessionsUsed} session
          {progression.sessionsUsed === 1 ? "" : "s"} in this period. Δ is — when
          the first or latest session is missing that field.
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
    gap: 8,
  },
  unitHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  sessionList: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 8,
    overflow: "hidden",
  },
  sessionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f4f7",
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 0,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  sessionRowAlt: {
    backgroundColor: "#fafafa",
  },
  sessionCell: {
    fontSize: 13,
    color: "#0c2f35",
  },
  sessionHead: {
    fontWeight: "700",
    fontSize: 12,
    color: "#444",
  },
  /** Same flex + widths on header and body so columns line up. */
  colDate: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  colKg: {
    width: 56,
    flexShrink: 0,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  colReps: {
    width: 48,
    flexShrink: 0,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  summary: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 10,
  },
  summaryTitle: {
    fontSize: 14,
  },
  metricBlock: {
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  metricValues: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  metricMain: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0c2f35",
    flex: 1,
    minWidth: 120,
  },
  metricDelta: {
    fontSize: 17,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  hint: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});
