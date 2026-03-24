import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ExerciseProgressCharts } from "@/components/analyze/exercise-progress-charts";
import type { ExerciseProgression } from "@/components/analyze/progression";
import type { ExerciseProgressCardView } from "@/components/analyze/progression-views";
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

function formatRpe(n: number | null): string {
  if (n == null) return "—";
  return Number.isInteger(n) ? `${n}` : n.toFixed(1);
}

function formatDelta(n: number | null, isKg: boolean): string {
  if (n == null) return "—";
  if (n === 0) return "0";
  const sign = n > 0 ? "+" : "−";
  const mag = Math.abs(n);
  return `${sign}${isKg ? formatKg(mag) : Math.round(mag)}`;
}

function formatRpeDelta(n: number | null): string {
  if (n == null) return "—";
  if (n === 0) return "0";
  const sign = n > 0 ? "+" : "−";
  const mag = Math.abs(n);
  return `${sign}${Number.isInteger(mag) ? mag : mag.toFixed(1)}`;
}

function deltaColorHigherIsBetter(
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

/** Lower RPE vs previous = progress (green). */
function rpeDeltaColor(
  delta: number | null,
  needsMoreSessions: boolean,
  neutralColor: string
): string {
  if (needsMoreSessions) return neutralColor;
  if (delta == null) return neutralColor;
  if (delta < 0) return "#1a6b4a";
  if (delta > 0) return "#8b2c2c";
  return tintColorLight;
}

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

  const showRpeTieBreak = useMemo(() => {
    if (progression.sessionsUsed < 2) return false;
    const wp = progression.weightPrev;
    const wl = progression.weightLast;
    const rp = progression.repsPrev;
    const rl = progression.repsLast;
    if (wp == null || wl == null || rp == null || rl == null) return false;
    return wp === wl && rp === rl;
  }, [
    progression.sessionsUsed,
    progression.weightPrev,
    progression.weightLast,
    progression.repsPrev,
    progression.repsLast,
  ]);

  const weightDeltaColor = useMemo(
    () =>
      deltaColorHigherIsBetter(
        progression.weightDelta,
        needsMoreSessions,
        palette.icon
      ),
    [progression.weightDelta, needsMoreSessions, palette.icon]
  );
  const repsDeltaColor = useMemo(
    () =>
      deltaColorHigherIsBetter(
        progression.repsDelta,
        needsMoreSessions,
        palette.icon
      ),
    [progression.repsDelta, needsMoreSessions, palette.icon]
  );
  const rpeDColor = useMemo(
    () =>
      showRpeTieBreak
        ? rpeDeltaColor(progression.rpeDelta, false, palette.icon)
        : palette.icon,
    [progression.rpeDelta, palette.icon, showRpeTieBreak]
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
        {detailView === "allSets"
          ? "Every logged set per workout"
          : "Top set (first set) per saved session on this day"}
      </Text>

      {detailView === "topSet" ? (
        <View style={[styles.sessionList, { borderColor: tableBorder }]}>
          <View
            style={[
              styles.sessionHeaderRow,
              { backgroundColor: palette.tintMuted },
            ]}
          >
            <Text
              style={[styles.sessionHead, styles.colDate, { color: palette.icon }]}
            >
              Date
            </Text>
            <Text
              style={[styles.sessionHead, styles.colKg, { color: palette.icon }]}
            >
              kg
            </Text>
            <Text
              style={[
                styles.sessionHead,
                styles.colReps,
                { color: palette.icon },
              ]}
            >
              reps
            </Text>
            {showRpeTieBreak ? (
              <Text
                style={[
                  styles.sessionHead,
                  styles.colRpe,
                  { color: palette.icon },
                ]}
              >
                RPE
              </Text>
            ) : null}
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
                style={[
                  styles.sessionCell,
                  styles.colDate,
                  { color: palette.text },
                ]}
                numberOfLines={1}
              >
                {formatShortDate(row.at)}
              </Text>
              <Text
                style={[styles.sessionCell, styles.colKg, { color: palette.text }]}
              >
                {formatDashNumber(row.kg, true)}
              </Text>
              <Text
                style={[
                  styles.sessionCell,
                  styles.colReps,
                  { color: palette.text },
                ]}
              >
                {formatDashNumber(row.reps, false)}
              </Text>
              {showRpeTieBreak ? (
                <Text
                  style={[
                    styles.sessionCell,
                    styles.colRpe,
                    { color: palette.text },
                  ]}
                >
                  {formatRpe(row.rpe)}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {detailView === "trend" ? (
        <ExerciseProgressCharts progression={progression} />
      ) : null}

      {detailView === "allSets" ? (
        <View style={styles.allSetsWrap}>
          {progression.allSetsBySession.map((block, bi) => (
            <View
              key={`${block.at}-${bi}`}
              style={[styles.sessionBlock, { borderColor: tableBorder }]}
            >
              <Text
                style={[styles.sessionBlockTitle, { color: palette.text }]}
              >
                {formatShortDate(block.at)}
              </Text>
              <View
                style={[
                  styles.miniHeader,
                  { backgroundColor: palette.tintMuted },
                ]}
              >
                <Text style={[styles.miniHead, styles.colSet, { color: palette.icon }]}>
                  Set
                </Text>
                <Text style={[styles.miniHead, styles.colKg, { color: palette.icon }]}>
                  kg
                </Text>
                <Text
                  style={[styles.miniHead, styles.colReps, { color: palette.icon }]}
                >
                  reps
                </Text>
                <Text
                  style={[styles.miniHead, styles.colRpe, { color: palette.icon }]}
                >
                  RPE
                </Text>
              </View>
              {block.sets.map((set, si) => (
                <View
                  key={si}
                  style={[
                    styles.sessionRow,
                    { borderTopColor: rowBorder },
                    si % 2 === 1 && { backgroundColor: rowAltBg },
                  ]}
                >
                  <Text
                    style={[styles.sessionCell, styles.colSet, { color: palette.text }]}
                  >
                    {si + 1}
                  </Text>
                  <Text
                    style={[styles.sessionCell, styles.colKg, { color: palette.text }]}
                  >
                    {formatDashNumber(set.kg, true)}
                  </Text>
                  <Text
                    style={[
                      styles.sessionCell,
                      styles.colReps,
                      { color: palette.text },
                    ]}
                  >
                    {formatDashNumber(set.reps, false)}
                  </Text>
                  <Text
                    style={[
                      styles.sessionCell,
                      styles.colRpe,
                      { color: palette.text },
                    ]}
                  >
                    {formatRpe(set.rpe)}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : null}

      {detailView === "topSet" ? (
        <View style={[styles.summary, { borderTopColor: summaryDivider }]}>
          <ThemedText type="defaultSemiBold" style={styles.summaryTitle}>
            Previous → latest
          </ThemedText>

          <View style={styles.metricBlock}>
            <Text style={[styles.metricLabel, { color: palette.icon }]}>
              Weight (kg)
            </Text>
            <View style={styles.metricValues}>
              <Text style={[styles.metricMain, { color: palette.text }]}>
                {formatDashNumber(progression.weightPrev, true)} →{" "}
                {formatDashNumber(progression.weightLast, true)}
              </Text>
              <Text style={[styles.metricDelta, { color: weightDeltaColor }]}>
                Δ {formatDelta(progression.weightDelta, true)}
              </Text>
            </View>
          </View>

          <View style={styles.metricBlock}>
            <Text style={[styles.metricLabel, { color: palette.icon }]}>
              Reps (top set)
            </Text>
            <View style={styles.metricValues}>
              <Text style={[styles.metricMain, { color: palette.text }]}>
                {formatDashNumber(progression.repsPrev, false)} →{" "}
                {formatDashNumber(progression.repsLast, false)}
              </Text>
              <Text style={[styles.metricDelta, { color: repsDeltaColor }]}>
                Δ {formatDelta(progression.repsDelta, false)}
              </Text>
            </View>
          </View>

          {showRpeTieBreak ? (
            <View style={styles.metricBlock}>
              <Text style={[styles.metricLabel, { color: palette.icon }]}>
                RPE (top set)
              </Text>
              <View style={styles.metricValues}>
                <Text style={[styles.metricMain, { color: palette.text }]}>
                  {formatRpe(progression.rpePrev)} →{" "}
                  {formatRpe(progression.rpeLast)}
                </Text>
                <Text style={[styles.metricDelta, { color: rpeDColor }]}>
                  Δ {formatRpeDelta(progression.rpeDelta)}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      {detailView === "topSet" ? (
        needsMoreSessions ? (
          <ThemedText style={styles.hint}>
            Log this day again to compare your latest top set to the previous
            workout.
          </ThemedText>
        ) : (
          <ThemedText style={styles.hint}>
            {progression.sessionsUsed} session
            {progression.sessionsUsed === 1 ? "" : "s"} recorded. Δ is — when a
            value is missing.
          </ThemedText>
        )
      ) : detailView === "allSets" ? (
        <ThemedText style={styles.hint}>
          {progression.sessionsUsed} workout
          {progression.sessionsUsed === 1 ? "" : "s"} with this exercise on this
          day.
        </ThemedText>
      ) : (
        <ThemedText style={styles.hint}>
          Top-set trend across {progression.sessionsUsed} session
          {progression.sessionsUsed === 1 ? "" : "s"}.
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
  colDate: {
    flex: 1,
    minWidth: 0,
    paddingRight: 6,
  },
  colSet: {
    width: 36,
    flexShrink: 0,
    fontVariant: ["tabular-nums"],
  },
  colKg: {
    width: 48,
    flexShrink: 0,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  colReps: {
    width: 40,
    flexShrink: 0,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  colRpe: {
    width: 44,
    flexShrink: 0,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  allSetsWrap: {
    marginTop: 6,
    gap: 10,
  },
  sessionBlock: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  sessionBlockTitle: {
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
  },
  miniHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  miniHead: {
    fontWeight: "700",
    fontSize: 11,
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
    fontSize: 15,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  hint: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.9,
  },
});
