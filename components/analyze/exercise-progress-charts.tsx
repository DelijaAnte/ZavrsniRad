import React, { useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

import type { ExerciseProgression } from "@/components/analyze/progression";
import { ThemedText } from "@/components/themed-text";
import { Colors, tintColorLight } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { hexToRgba } from "@/utils/hex-to-rgba";
import { useTranslation } from "react-i18next";

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function ExerciseProgressCharts({
  progression,
}: {
  progression: ExerciseProgression;
}) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const chartSurface =
    colorScheme === "dark" ? palette.surfaceMuted : Colors.light.background;
  const chartLabel = palette.text;
  const chartGrid = palette.icon;

  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = Math.max(220, windowWidth - 32 * 2 - 12 * 2);

  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: chartSurface,
      backgroundGradientTo: chartSurface,
      color: (opacity = 1) => hexToRgba(tintColorLight, opacity),
      labelColor: (opacity = 1) => hexToRgba(chartLabel, opacity * 0.88),
      propsForDots: {
        r: "4",
        strokeWidth: 2,
        stroke: tintColorLight,
      },
      propsForBackgroundLines: {
        stroke: hexToRgba(chartGrid, 0.2),
      },
    }),
    [chartSurface, chartLabel, chartGrid]
  );

  const weightSeries = useMemo(() => {
    const pts = progression.rows.filter(
      (r): r is typeof r & { kg: number } => r.kg != null
    );
    if (!pts.length) return null;
    return {
      labels: pts.map((p) => formatShortDate(p.at)),
      data: pts.map((p) => p.kg),
    };
  }, [progression.rows]);

  const repsSeries = useMemo(() => {
    const pts = progression.rows.filter(
      (r): r is typeof r & { reps: number } => r.reps != null
    );
    if (!pts.length) return null;
    return {
      labels: pts.map((p) => formatShortDate(p.at)),
      data: pts.map((p) => p.reps),
    };
  }, [progression.rows]);

  const chartHeight = 200;

  return (
    <View style={styles.wrap}>
      {weightSeries ? (
        <View style={styles.chartBlock}>
          <ThemedText style={styles.caption}>{t("analyze.charts.weightCaption")}</ThemedText>
          <LineChart
            data={{
              labels: weightSeries.labels,
              datasets: [{ data: weightSeries.data }],
            }}
            width={chartWidth}
            height={chartHeight}
            chartConfig={{ ...chartConfig, decimalPlaces: 1 }}
            bezier
            style={styles.chart}
            horizontalLabelRotation={
              weightSeries.labels.length > 5 ? -35 : 0
            }
            withInnerLines
            withOuterLines={false}
          />
        </View>
      ) : (
        <ThemedText style={styles.muted}>{t("analyze.charts.noWeightValues")}</ThemedText>
      )}

      {repsSeries ? (
        <View style={styles.chartBlock}>
          <ThemedText style={styles.caption}>{t("analyze.charts.repsCaption")}</ThemedText>
          <LineChart
            data={{
              labels: repsSeries.labels,
              datasets: [{ data: repsSeries.data }],
            }}
            width={chartWidth}
            height={chartHeight}
            chartConfig={{ ...chartConfig, decimalPlaces: 0 }}
            bezier
            style={styles.chart}
            horizontalLabelRotation={
              repsSeries.labels.length > 5 ? -35 : 0
            }
            withInnerLines
            withOuterLines={false}
          />
        </View>
      ) : (
        <ThemedText style={styles.muted}>{t("analyze.charts.noRepValues")}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 6,
    gap: 10,
  },
  chartBlock: {
    gap: 6,
  },
  caption: {
    fontSize: 12,
    fontWeight: "600",
  },
  chart: {
    marginVertical: 4,
    marginLeft: -12,
    borderRadius: 12,
  },
  muted: {
    fontSize: 13,
  },
});
