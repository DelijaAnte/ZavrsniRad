import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { G, Rect, Text as SvgText } from "react-native-svg";

import { ThemedText } from "@/components/themed-text";
import type { Day, WorkoutSession } from "@/components/routines/types";
import { Colors, tintColorLight } from "@/constants/theme";
import { hexToRgba } from "@/utils/hex-to-rgba";

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function localDayStartFromIso(iso: string): number | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return startOfLocalDay(d).getTime();
}

function monthKeyFromParts(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

function contributionCountsByDayKey(
  sessions: WorkoutSession[],
  routineId: string,
  templateDay: Day
): Map<number, number> {
  const counts = new Map<number, number>();
  for (const s of sessions) {
    if (s.routineId !== routineId || s.day !== templateDay) continue;
    const key = localDayStartFromIso(s.performedAt);
    if (key == null) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function listMonthsBetween(
  rangeStart: Date,
  rangeEnd: Date
): { key: string; year: number; month: number; label: string }[] {
  const out: { key: string; year: number; month: number; label: string }[] =
    [];
  const cur = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  const endM = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);
  while (cur <= endM) {
    const y = cur.getFullYear();
    const m = cur.getMonth();
    out.push({
      key: monthKeyFromParts(y, m),
      year: y,
      month: m,
      label: cur.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
    });
    cur.setMonth(m + 1);
  }
  return out;
}

const chartSurface = Colors.light.background;

export function TrainingConsistencyHeatmap({
  sessions,
  routineId,
  routineName,
  templateDay,
}: {
  sessions: WorkoutSession[];
  routineId: string;
  routineName: string;
  templateDay: Day;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const squareSize = 28;
  const gutter = 6;
  const padX = 12;
  const cell = squareSize + gutter;

  const countsByDay = useMemo(
    () => contributionCountsByDayKey(sessions, routineId, templateDay),
    [sessions, routineId, templateDay]
  );

  const { rangeStart, rangeEnd } = useMemo(() => {
    const endDate = startOfLocalDay(new Date());
    let oldest = endDate.getTime();
    for (const s of sessions) {
      if (s.routineId !== routineId || s.day !== templateDay) continue;
      const k = localDayStartFromIso(s.performedAt);
      if (k != null) oldest = Math.min(oldest, k);
    }
    return { rangeStart: new Date(oldest), rangeEnd: endDate };
  }, [sessions, routineId, templateDay]);

  const availableMonths = useMemo(() => {
    const list = listMonthsBetween(rangeStart, rangeEnd);
    if (list.length) return list;
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return [
      {
        key: monthKeyFromParts(y, m),
        year: y,
        month: m,
        label: now.toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        }),
      },
    ];
  }, [rangeStart, rangeEnd]);

  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);

  useEffect(() => {
    const last = availableMonths[availableMonths.length - 1]?.key;
    if (!last) return;
    setSelectedMonthKey((prev) =>
      prev && availableMonths.some((x) => x.key === prev) ? prev : last
    );
  }, [availableMonths]);

  const selected = useMemo(() => {
    const key = selectedMonthKey ?? availableMonths.at(-1)?.key;
    return availableMonths.find((m) => m.key === key) ?? availableMonths[0];
  }, [availableMonths, selectedMonthKey]);

  const graphTopPad = availableMonths.length > 1 ? 10 : 22;

  const { cells, svgWidth, svgHeight } = useMemo(() => {
    if (!selected) {
      return {
        cells: [] as {
          cx: number;
          cy: number;
          dayNum: number | null;
          fill: string;
          labelFill: string;
        }[],
        svgWidth: 0,
        svgHeight: 0,
      };
    }
    const { year, month } = selected;
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const dim = monthEnd.getDate();
    const lead = monthStart.getDay();
    const total = lead + dim;
    const tail = (7 - (total % 7)) % 7;
    const gridCells = lead + dim + tail;
    const weeks = gridCells / 7;

    let maxC = 0;
    for (let d = 1; d <= dim; d++) {
      const t = new Date(year, month, d).getTime();
      const c = countsByDay.get(t) ?? 0;
      if (c > maxC) maxC = c;
    }

    const emptyFill = hexToRgba(tintColorLight, 0.08);
    const baseRgb = "10, 126, 164";

    const out: {
      cx: number;
      cy: number;
      dayNum: number | null;
      fill: string;
      labelFill: string;
    }[] = [];

    for (let i = 0; i < gridCells; i++) {
      const col = Math.floor(i / 7);
      const row = i % 7;
      const x = padX + col * cell;
      const y = graphTopPad + row * cell;
      const cx = x + squareSize / 2;
      const cy = y + squareSize / 2;
      const dayIndex = i - lead;

      if (i < lead || dayIndex >= dim) {
        out.push({
          cx,
          cy,
          dayNum: null,
          fill: "transparent",
          labelFill: Colors.light.text,
        });
        continue;
      }

      const dayNum = dayIndex + 1;
      const t = new Date(year, month, dayNum).getTime();
      const c = countsByDay.get(t) ?? 0;
      let intensity = 0;
      if (c > 0 && maxC > 0) {
        intensity = maxC === 1 ? 1 : 0.35 + (0.65 * (c - 1)) / (maxC - 1);
      }
      const fill =
        c > 0 ? `rgba(${baseRgb},${Math.min(1, intensity)})` : emptyFill;
      const labelFill = c > 0 && intensity > 0.52 ? "#fff" : Colors.light.text;
      out.push({ cx, cy, dayNum, fill, labelFill });
    }

    const w = padX * 2 + weeks * cell - gutter;
    const h = graphTopPad + 7 * cell - gutter + 10;
    return {
      cells: out,
      svgWidth: w,
      svgHeight: h,
    };
  }, [selected, countsByDay, squareSize, gutter, cell, padX, graphTopPad]);

  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: chartSurface,
      backgroundGradientTo: chartSurface,
    }),
    []
  );

  const distinctDaysWithTraining = countsByDay.size;

  const needsScroll = svgWidth > windowWidth - 48;

  return (
    <View style={styles.card}>
      <ThemedText type="defaultSemiBold">{routineName}</ThemedText>

      {distinctDaysWithTraining === 0 ? (
        <ThemedText style={styles.muted}>
          No completed sessions for this routine on {templateDay}.
        </ThemedText>
      ) : (
        <>
          {availableMonths.length > 1 ? (
            <>
              <ThemedText type="defaultSemiBold" style={styles.monthPickerTitle}>
                Month
              </ThemedText>
              <View style={styles.monthChips}>
                {availableMonths.map((m) => {
                  const active = m.key === selected?.key;
                  return (
                    <TouchableOpacity
                      key={m.key}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={[styles.monthChip, active && styles.monthChipActive]}
                      onPress={() => setSelectedMonthKey(m.key)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.monthChipText,
                          active && styles.monthChipTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}

          <View style={styles.graphWrap}>
            {needsScroll ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator
                contentContainerStyle={styles.scrollInner}
              >
                <View style={styles.scrollClip}>
                  {renderHeatmapSvg(
                    svgWidth,
                    svgHeight,
                    padX,
                    squareSize,
                    cells,
                    selected,
                    chartConfig,
                    availableMonths.length <= 1
                  )}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.graphCenter}>
                <View style={styles.scrollClip}>
                  {renderHeatmapSvg(
                    svgWidth,
                    svgHeight,
                    padX,
                    squareSize,
                    cells,
                    selected,
                    chartConfig,
                    availableMonths.length <= 1
                  )}
                </View>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

function renderHeatmapSvg(
  svgW: number,
  svgH: number,
  padX: number,
  squareSize: number,
  cells: {
    cx: number;
    cy: number;
    dayNum: number | null;
    fill: string;
    labelFill: string;
  }[],
  selected: { label: string } | undefined,
  chartConfig: { backgroundGradientFrom: string },
  showMonthTitle: boolean
) {
  return (
    <Svg width={svgW} height={svgH}>
      <Rect
        width={svgW}
        height={svgH}
        rx={12}
        ry={12}
        fill={chartConfig.backgroundGradientFrom}
      />
      {selected && showMonthTitle ? (
        <SvgText
          x={padX + 4}
          y={16}
          fontSize={13}
          fontWeight="600"
          fill={Colors.light.text}
        >
          {selected.label}
        </SvgText>
      ) : null}
      <G>
        {cells.map((c, idx) =>
          c.dayNum != null ? (
            <Rect
              key={idx}
              x={c.cx - squareSize / 2}
              y={c.cy - squareSize / 2}
              width={squareSize}
              height={squareSize}
              rx={5}
              ry={5}
              fill={c.fill}
            />
          ) : null
        )}
      </G>
      <G>
        {cells.map((c, idx) =>
          c.dayNum != null ? (
            <SvgText
              key={`t-${idx}`}
              x={c.cx}
              y={c.cy + 4}
              fontSize={13}
              fontWeight="700"
              fill={c.labelFill}
              textAnchor="middle"
            >
              {String(c.dayNum)}
            </SvgText>
          ) : null
        )}
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    gap: 10,
  },
  monthPickerTitle: {
    marginTop: 2,
    marginBottom: -4,
    fontSize: 13,
  },
  monthChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  monthChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    maxWidth: "100%",
  },
  monthChipActive: {
    backgroundColor: Colors.light.tintMuted,
    borderColor: Colors.light.tintBorder,
  },
  monthChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0c2f35",
  },
  monthChipTextActive: {
    color: tintColorLight,
  },
  graphWrap: {
    marginTop: 4,
  },
  scrollClip: {
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
  },
  scrollInner: {
    paddingVertical: 4,
  },
  graphCenter: {
    width: "100%",
    alignItems: "center",
  },
  muted: {
    fontSize: 14,
    color: "#666",
  },
});
