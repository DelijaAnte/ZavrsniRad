import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { Routine } from "@/components/routines/types";

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
  const totalExercises = useMemo(() => {
    return routine.days.reduce(
      (sum, d) => sum + (routine.exercisesByDay[d]?.length ?? 0),
      0,
    );
  }, [routine.days, routine.exercisesByDay]);

  return (
    <View style={styles.routineCard}>
      <TouchableOpacity
        style={styles.headerPress}
        onPress={onToggleExpand}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? "Collapse" : "Expand"} ${routine.name}`}
      >
        <View style={styles.routineHeader}>
          <ThemedText type="subtitle">{routine.name}</ThemedText>
          <ThemedText>{`${routine.days.length} ${routine.days.length === 1 ? "day" : "days"} • ${totalExercises} exercises`}</ThemedText>
        </View>
      </TouchableOpacity>

      {expanded ? (
        <>
          <View style={styles.routineBody}>
            <ThemedText type="defaultSemiBold">Days</ThemedText>
            <Text>{routine.days.join(", ") || "None"}</Text>

            <ThemedText type="defaultSemiBold">Exercises</ThemedText>
            {routine.days.length ? (
              routine.days.map((day) => {
                const list = routine.exercisesByDay[day] ?? [];
                return (
                  <View key={day} style={{ gap: 4 }}>
                    <Text style={styles.dayHeader}>{day}</Text>
                    {list.length ? (
                      list.map((ex, idx) => (
                        <Text key={`${day}-${idx}-${ex}`}>• {ex}</Text>
                      ))
                    ) : (
                      <Text>• (no exercises)</Text>
                    )}
                  </View>
                );
              })
            ) : (
              <Text>None</Text>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionSecondary}
              onPress={() => onEdit(routine)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${routine.name}`}
            >
              <Text style={styles.actionSecondaryText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionDanger}
              onPress={() => onDelete(routine)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${routine.name}`}
            >
              <Text style={styles.actionDangerText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  routineCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 8,
  },
  headerPress: {
    borderRadius: 6,
  },
  routineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  routineBody: {
    marginTop: 8,
    gap: 6,
  },
  dayHeader: {
    fontWeight: "700",
    color: "#0c2f35",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#7fbcc8",
    backgroundColor: "#e8f6f9",
  },
  actionSecondaryText: {
    fontWeight: "800",
    color: "#0c2f35",
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
