import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { Routine } from "@/components/routines/types";

export function RoutineCard({
  routine,
  expanded,
  onPress,
}: {
  routine: Routine;
  expanded: boolean;
  onPress: () => void;
}) {
  const totalExercises = useMemo(() => {
    return routine.days.reduce(
      (sum, d) => sum + (routine.exercisesByDay[d]?.length ?? 0),
      0,
    );
  }, [routine.days, routine.exercisesByDay]);

  return (
    <TouchableOpacity
      style={styles.routineCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.routineHeader}>
        <ThemedText type="subtitle">{routine.name}</ThemedText>
        <ThemedText>{`${routine.days.length} ${routine.days.length === 1 ? "day" : "days"} • ${totalExercises} exercises`}</ThemedText>
      </View>

      {expanded ? (
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
      ) : null}
    </TouchableOpacity>
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
});
