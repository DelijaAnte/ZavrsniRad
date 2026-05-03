import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

import { ThemedText } from "@/components/themed-text";
import type { Routine } from "@/components/routines/types";
import { Colors, tintColorLight } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

/** Metadata line on light cards — blue-gray per design reference */
const META_MUTED_LIGHT = "#546E7A";

export function RoutineCard({
  routine,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
}: {
  routine: Routine;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: (routine: Routine) => void;
  onDelete: (routine: Routine) => void;
}) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const totalExercises = useMemo(() => {
    return routine.days.reduce(
      (sum, d) => sum + (routine.exercisesByDay[d]?.length ?? 0),
      0,
    );
  }, [routine.days, routine.exercisesByDay]);

  const cardBg = palette.surfaceCard;
  const cardBorder = palette.borderCard;
  const dividerBorder = palette.borderDivider;
  const metaColor = isDark ? palette.icon : META_MUTED_LIGHT;

  const cardShadow = isDark
    ? {}
    : {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      };

  return (
    <View
      style={[
        styles.routineCard,
        { backgroundColor: cardBg, borderColor: cardBorder },
        cardShadow,
      ]}
    >
      <TouchableOpacity
        style={styles.headerPress}
        onPress={onToggleExpand}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? t("routineCard.collapse") : t("routineCard.expand")} ${routine.name}`}
      >
        <View style={styles.routineHeader}>
          <ThemedText type="subtitle" style={styles.routineTitle} numberOfLines={3}>
            {routine.name}
          </ThemedText>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={18} color={metaColor} />
              <Text style={[styles.metaText, { color: metaColor }]}>
                {routine.days.length}{" "}
                {routine.days.length === 1
                  ? t("routineCard.daySingular")
                  : t("routineCard.dayPlural")}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="barbell-outline" size={18} color={metaColor} />
              <Text style={[styles.metaText, { color: metaColor }]}>
                {t("routineCard.exerciseCount", { count: totalExercises })}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {expanded ? (
        <>
          <View style={styles.routineBody}>
            <ThemedText type="defaultSemiBold">{t("routineCard.daysLabel")}</ThemedText>
            <ThemedText>
              {routine.days.length
                ? routine.days.map((d) => t(`days.short.${d}`)).join(", ")
                : t("routineCard.none")}
            </ThemedText>

            <ThemedText type="defaultSemiBold">{t("routineCard.exercisesLabel")}</ThemedText>
            {routine.days.length ? (
              routine.days.map((day) => {
                const list = routine.exercisesByDay[day] ?? [];
                return (
                  <View key={day} style={{ gap: 4 }}>
                    <ThemedText style={styles.dayHeader}>
                      {t(`days.short.${day}`)}
                    </ThemedText>
                    {list.length ? (
                      list.map((ex, idx) => (
                        <ThemedText key={`${day}-${idx}-${ex}`}>
                          • {ex}
                        </ThemedText>
                      ))
                    ) : (
                      <ThemedText>• ({t("routineCard.noExercises")})</ThemedText>
                    )}
                  </View>
                );
              })
            ) : (
              <ThemedText>{t("routineCard.none")}</ThemedText>
            )}
          </View>

          <View style={[styles.actions, { borderTopColor: dividerBorder }]}>
            <TouchableOpacity
              style={[
                styles.actionSecondary,
                {
                  borderColor: palette.tintBorder,
                  backgroundColor: palette.tintMuted,
                },
              ]}
              onPress={() => onEdit(routine)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`${t("routineCard.editAccessibilityPrefix")} ${routine.name}`}
            >
              <Text
                style={[
                  styles.actionSecondaryText,
                  {
                    color:
                      colorScheme === "light" ? tintColorLight : palette.tint,
                  },
                ]}
              >
                {t("routineCard.edit")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionDanger}
              onPress={() => onDelete(routine)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`${t("routineCard.deleteAccessibilityPrefix")} ${routine.name}`}
            >
              <Text style={styles.actionDangerText}>{t("routineCard.delete")}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  routineCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  headerPress: {
    borderRadius: 10,
  },
  routineHeader: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
  },
  routineTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: 20,
    rowGap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
  },
  routineBody: {
    marginTop: 12,
    gap: 6,
  },
  dayHeader: {
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  actionSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionSecondaryText: {
    fontWeight: "800",
  },
  actionDanger: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e8c4c4",
    backgroundColor: "#fff5f5",
  },
  actionDangerText: {
    fontWeight: "800",
    color: "#8b2c2c",
  },
});
