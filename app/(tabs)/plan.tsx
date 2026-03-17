import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { RoutineCard } from "@/components/routines/routine-card";
import { RoutineModal } from "@/components/routines/routine-modal";
import type { Routine } from "@/components/routines/types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
 

export default function PlanScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function openCreateModal() {
    setModalVisible(true);
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedView style={styles.headerRow}>
        <View style={styles.headerTitles}>
          <ThemedText type="title">Routines</ThemedText>
          <ThemedText>Build and review your weekly plan.</ThemedText>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Create routine"
          style={styles.fabInline}
          onPress={openCreateModal}
          activeOpacity={0.85}
        >
          <Text style={styles.fabInlineText}>+</Text>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">All routines</ThemedText>
        {routines.length ? (
          <FlatList
            data={routines}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <RoutineCard
                routine={item}
                expanded={expandedId === item.id}
                onPress={() =>
                  setExpandedId((id) => (id === item.id ? null : item.id))
                }
              />
            )}
            scrollEnabled={false}
            contentContainerStyle={{ paddingTop: 8 }}
          />
        ) : (
          <ThemedView style={styles.emptyState}>
            <ThemedText type="defaultSemiBold">No routines yet</ThemedText>
            <ThemedText>
              Tap the + button to create your first routine.
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <RoutineModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={(routine) => setRoutines((prev) => [routine, ...prev])}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTitles: {
    flex: 1,
    gap: 4,
  },
  fabInline: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#A1CEDC",
    alignItems: "center",
    justifyContent: "center",
  },
  fabInlineText: {
    fontSize: 30,
    lineHeight: 32,
    color: "#0c2f35",
  },
  section: {
    gap: 8,
  },
  emptyState: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 6,
  },
});

