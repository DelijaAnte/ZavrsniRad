import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ExerciseProgressCharts } from "@/components/analyze/exercise-progress-charts";
import type { ExerciseProgression } from "@/components/analyze/progression";
import { ThemedText } from "@/components/themed-text";
import { Colors, tintColorLight } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

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

function deltaColor(
  delta: number | null,
  needsMoreSessions: boolean,
  neutralColor: string
): string {
  if (needsMoreSessions) return neutralColor;
  if (delta == null) return neutralColor;
  if (delta > 0) return "#1a6b4a";
  if (delta < 0) return "#8b2c2c";
  return tintColorLight;
}

/** Table vs line charts inside each exercise card. */
export type ExerciseProgressCardView = "table" | "graphs";

export function ExerciseProgressCard({
  progression,
  detailView,
}: {
  progression: ExerciseProgression;
  detailView: ExerciseProgressCardView;
}) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const cardBg = isDark ? "#1e2224" : "#fff";
  const cardBorder = isDark ? "#2f3638" : "#eee";
  const tableBorder = isDark ? "#2f3638" : "#e8e8e8";
  const rowBorder = isDark ? "#2f3638" : "#eee";
  const rowAltBg = isDark ? "#151718" : "#fafafa";
  const summaryDivider = isDark ? "#2f3638" : "#f0f0f0";

  const needsMoreSessions = progression.sessionsUsed < 2;

  const weightDeltaColor = useMemo(
    () =>
      deltaColor(progression.weightDelta, needsMoreSessions, palette.icon),
    [progression.weightDelta, needsMoreSessions, palette.icon]
  );
  const repsDeltaColor = useMemo(
    () => deltaColor(progression.repsDelta, needsMoreSessions, palette.icon),
    [progression.repsDelta, needsMoreSessions, palette.icon]
  );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor: cardBorder },
      ]}
    >
      <ThemedText type="defaultSemiBold">{progression.exercise}</ThemedText>
      <Text style={[styles.unitHint, { color: palette.icon }]}>
        Best weight & best reps per saved session on this day
      </Text>

      {detailView === "table" ? (
        <View style={[styles.sessionList, { borderColor: tableBorder }]}>
          <View
            style={[
              styles.sessionHeaderRow,
              { backgroundColor: palette.tintMuted },
            ]}
          >
            <Text style={[styles.sessionHead, styles.colDate, { color: palette.icon }]}>
              Date
            </Text>
            <Text style={[styles.sessionHead, styles.colKg, { color: palette.icon }]}>
              kg
            </Text>
            <Text style={[styles.sessionHead, styles.colReps, { color: palette.icon }]}>
              reps
            </Text>
          </View>
          {progression.rows.map((row, idx) => (
            <View
              key={`${row.at}-${idx}`}
              style={[
                styles.sessionRow,
                { borderTopColor: rowBorder },
                idx % 2 === 1 && { backgroundColor: rowAltBg },
              ]}
            >
              <Text
                style={[styles.sessionCell, styles.colDate, { color: palette.text }]}
                numberOfLines={1}
              >
                {formatShortDate(row.at)}
              </Text>
              <Text style={[styles.sessionCell, styles.colKg, { color: palette.text }]}>
                {formatDashNumber(row.kg, true)}
              </Text>
              <Text style={[styles.sessionCell, styles.colReps, { color: palette.text }]}>
                {formatDashNumber(row.reps, false)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <ExerciseProgressCharts progression={progression} />
      )}

      <View style={[styles.summary, { borderTopColor: summaryDivider }]}>
        <ThemedText type="defaultSemiBold" style={styles.summaryTitle}>
          First → latest
        </ThemedText>

        <View style={styles.metricBlock}>
          <Text style={[styles.metricLabel, { color: palette.icon }]}>
            Weight (kg)
          </Text>
          <View style={styles.metricValues}>
            <Text style={[styles.metricMain, { color: palette.text }]}>
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
          <Text style={[styles.metricLabel, { color: palette.icon }]}>
            Reps (best set)
          </Text>
          <View style={styles.metricValues}>
            <Text style={[styles.metricMain, { color: palette.text }]}>
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
          Save this day twice in your history to see change from first to latest
          session.
        </ThemedText>
      ) : (
        <ThemedText style={styles.hint}>
          {progression.sessionsUsed} session
          {progression.sessionsUsed === 1 ? "" : "s"} in your history. Δ is — when
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
    gap: 8,
  },
  unitHint: {
    fontSize: 12,
    marginTop: 2,
  },
  sessionList: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  sessionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  sessionCell: {
    fontSize: 13,
  },
  sessionHead: {
    fontWeight: "700",
    fontSize: 12,
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
    marginTop: 2,
    opacity: 0.9,
  },
});
