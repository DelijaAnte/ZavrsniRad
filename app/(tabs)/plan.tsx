import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { RoutineCard } from "@/components/routines/routine-card";
import { RoutineModal } from "@/components/routines/routine-modal";
import type { Routine } from "@/components/routines/types";
import { useRoutines } from "@/components/routines/routines-store";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, tintColorLight } from "@/constants/theme";
import { useTranslation } from "react-i18next";

export default function PlanScreen() {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null);
  const {
    routines,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    loading,
    saving,
    error,
  } = useRoutines();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function openCreateModal() {
    if (loading) return;
    setRoutineToEdit(null);
    setModalMode("create");
    setModalVisible(true);
  }

  function openEditModal(routine: Routine) {
    if (loading) return;
    setRoutineToEdit(routine);
    setModalMode("edit");
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setRoutineToEdit(null);
  }

  function confirmDelete(routine: Routine) {
    Alert.alert(
      t("plan.deleteRoutineTitle"),
      t("plan.deleteRoutineMessage", { name: routine.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            deleteRoutine(routine.id);
            setExpandedId((id) => (id === routine.id ? null : id));
          },
        },
      ],
    );
  }

  function handleSaveRoutine(routine: Routine) {
    if (modalMode === "edit") {
      updateRoutine(routine);
    } else {
      addRoutine(routine);
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: Colors.light.parallaxHeader,
        dark: Colors.dark.parallaxHeader,
      }}
    >
      <ThemedView style={styles.headerRow}>
        <View style={styles.headerTitles}>
          <ThemedText type="title">{t("plan.title")}</ThemedText>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t("plan.createRoutineAccessibilityLabel")}
          style={[
            styles.fabInline,
            { backgroundColor: tintColorLight },
            loading && styles.fabDisabled,
          ]}
          onPress={openCreateModal}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.fabInlineText}>+</Text>
        </TouchableOpacity>
      </ThemedView>

      {error ? (
        <ThemedView style={styles.banner}>
          <ThemedText type="defaultSemiBold">{t("plan.couldNotSyncData")}</ThemedText>
          <ThemedText>{error}</ThemedText>
        </ThemedView>
      ) : null}

      {loading ? (
        <ThemedView style={styles.loadingRow}>
          <ActivityIndicator color={tintColorLight} />
          <ThemedText>{t("plan.loadingPlans")}</ThemedText>
        </ThemedView>
      ) : null}

      {saving ? (
        <ThemedView style={styles.savingRow}>
          <ThemedText type="defaultSemiBold">{t("plan.saving")}</ThemedText>
        </ThemedView>
      ) : null}

      {!loading ? (
        <ThemedView style={[styles.section, styles.routineList]}>
          {routines.length ? (
            routines.map((item) => (
              <RoutineCard
                key={item.id}
                routine={item}
                expanded={expandedId === item.id}
                onToggleExpand={() =>
                  setExpandedId((id) => (id === item.id ? null : item.id))
                }
                onEdit={openEditModal}
                onDelete={confirmDelete}
              />
            ))
          ) : (
            <ThemedView style={styles.emptyState}>
              <ThemedText type="defaultSemiBold">{t("plan.noRoutinesYet")}</ThemedText>
              <ThemedText>
                {t("plan.tapPlusToCreateFirstRoutine")}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      ) : null}

      <RoutineModal
        visible={modalVisible}
        onClose={closeModal}
        mode={modalMode}
        initialRoutine={routineToEdit}
        onSave={handleSaveRoutine}
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
    minWidth: 0,
  },
  fabInline: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  fabInlineText: {
    fontSize: 30,
    lineHeight: 32,
    color: "#fff",
    fontWeight: "300",
  },
  section: {
    gap: 8,
  },
  routineList: {
    paddingTop: 8,
  },
  emptyState: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 6,
  },
  fabDisabled: {
    opacity: 0.45,
  },
  banner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e8c4c4",
    backgroundColor: "#fff5f5",
    gap: 4,
    marginBottom: 4,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  savingRow: {
    paddingVertical: 4,
  },
});
