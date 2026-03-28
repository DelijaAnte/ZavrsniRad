import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ExercisePersonalRecord } from "@/components/analyze/pr";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "react-i18next";

function formatKg(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RoutinePRList({
  items,
}: {
  items: { exercise: string; record: ExercisePersonalRecord | null }[];
}) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { t } = useTranslation();
  const cardBg = palette.surfaceCard;
  const cardBorder = palette.borderHairline;

  return (
    <View style={styles.list}>
      {items.map(({ exercise, record }) => (
        <View
          key={exercise}
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <ThemedText type="defaultSemiBold">{exercise}</ThemedText>
          {record ? (
            <>
              <Text style={[styles.prLine, { color: palette.text }]}>
                {formatKg(record.kg)} kg × {record.reps} reps
              </Text>
              <Text style={[styles.meta, { color: palette.icon }]}>
                {formatShortDate(record.performedAt)} · {t(`days.short.${record.day}`)}
                {record.rpe != null ? ` · RPE ${record.rpe}` : ""}
              </Text>
            </>
          ) : (
            <ThemedText style={styles.empty}>
              No logged sets for this exercise in this routine.
            </ThemedText>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
    marginTop: 8,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  prLine: {
    fontSize: 17,
    fontWeight: "800",
    marginTop: 2,
  },
  meta: {
    fontSize: 13,
  },
  empty: {
    fontSize: 14,
    opacity: 0.85,
    marginTop: 2,
  },
});
