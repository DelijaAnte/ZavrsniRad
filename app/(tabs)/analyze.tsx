import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import {
  ExerciseProgressCard,
  RoutinePRList,
  TrainingConsistencyHeatmap,
  type ExerciseProgressCardView,
  isExerciseProgressCardView,
  type ProgressionDetailView,
  personalRecordsForRoutine,
} from "@/components/analyze";
import {
  progressionForExercise,
  sortWorkoutSessionsChronologically,
} from "@/components/analyze/progression";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRoutines } from "@/components/routines/routines-store";
import type { Day, Routine } from "@/components/routines/types";
import { RoutineDayPicker } from "@/components/train/routine-day-picker";
import { Colors, tintColorLight } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "react-i18next";

const PROGRESSION_VIEW_KEYS: ProgressionDetailView[] = [
  "topSet",
  "trend",
  "allSets",
  "pr",
  "activity",
];

export default function AnalyzeScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const { routines, workoutHistory, loading } = useRoutines();
  const [progressionDetailView, setProgressionDetailView] =
    useState<ProgressionDetailView>("topSet");
  const [routineId, setRoutineId] = useState<string | null>(null);
  const [day, setDay] = useState<Day | null>(null);

  const progressionViews = useMemo(
    () =>
      PROGRESSION_VIEW_KEYS.map((key) => ({
        key,
        label: t(`analyze.views.${key}`),
      })),
    [t]
  );

  const selectedRoutine = useMemo<Routine | null>(() => {
    if (!routineId) return null;
    return routines.find((r) => r.id === routineId) ?? null;
  }, [routineId, routines]);

  const exercisesForDay = useMemo(() => {
    if (!day || !selectedRoutine) return [];
    return selectedRoutine.exercisesByDay[day] ?? [];
  }, [day, selectedRoutine]);

  const sessionsSorted = useMemo(
    () => sortWorkoutSessionsChronologically(workoutHistory),
    [workoutHistory]
  );

  const sessionsForSelectedRoutine = useMemo(() => {
    if (!routineId) return [];
    return sessionsSorted.filter((s) => s.routineId === routineId);
  }, [sessionsSorted, routineId]);

  const prRows = useMemo(() => {
    if (!selectedRoutine) return [];
    return personalRecordsForRoutine(sessionsSorted, selectedRoutine);
  }, [sessionsSorted, selectedRoutine]);

  const analyzeRows = useMemo(() => {
    if (!routineId || !day || !exercisesForDay.length) return [];
    return exercisesForDay.map((exercise) => ({
      exercise,
      progression: progressionForExercise(
        sessionsSorted,
        routineId,
        day,
        exercise
      ),
    }));
  }, [sessionsSorted, routineId, day, exercisesForDay]);

  function selectRoutine(nextId: string) {
    setRoutineId(nextId);
    setDay(null);
  }

  function selectDay(nextDay: Day) {
    setDay(nextDay);
  }

  function renderBody() {
    if (loading) {
      return <ThemedText>{t("analyze.loadingHistory")}</ThemedText>;
    }

    if (progressionDetailView === "activity") {
      if (!routineId) {
        return (
          <ThemedText>{t("analyze.selectRoutineForActivity")}</ThemedText>
        );
      }
      return (
        <TrainingConsistencyHeatmap
          sessions={sessionsForSelectedRoutine}
          dataSubtitle={t("analyze.activity.dataSubtitle")}
          emptyHint={t("analyze.activity.emptyHint")}
        />
      );
    }

    if (progressionDetailView === "pr") {
      if (!routineId || !selectedRoutine) {
        return (
          <ThemedText>{t("analyze.selectRoutineForPr")}</ThemedText>
        );
      }
      if (!prRows.length) {
        return <ThemedText>{t("analyze.noExercisesInRoutine")}</ThemedText>;
      }
      return <RoutinePRList items={prRows} />;
    }

    if (!routineId || !day) {
      return (
        <ThemedText>
          {t("analyze.selectRoutineAndDayToViewProgression")}
        </ThemedText>
      );
    }

    if (!analyzeRows.length) {
      return <ThemedText>{t("analyze.noExercisesForDay", { day })}.</ThemedText>;
    }

    const cardDetailView: ExerciseProgressCardView = isExerciseProgressCardView(
      progressionDetailView
    )
      ? progressionDetailView
      : "topSet";

    return (
      <View style={styles.progressList}>
        {analyzeRows.map(({ exercise, progression }) =>
          progression ? (
            <ExerciseProgressCard
              key={exercise}
              progression={progression}
              detailView={cardDetailView}
            />
          ) : (
            <ThemedView
              key={exercise}
              style={[
                styles.placeholderCard,
                {
                  backgroundColor: palette.surfaceMuted,
                  borderColor: palette.borderHairline,
                },
              ]}
            >
              <ThemedText type="defaultSemiBold">{exercise}</ThemedText>
              <ThemedText style={styles.muted}>
                {t("analyze.noSavedSessionsForRoutineAndDay")}
              </ThemedText>
            </ThemedView>
          )
        )}
      </View>
    );
  }

  return (
    <ParallaxScrollView>
      <ThemedView style={styles.headerRow}>
        <View style={styles.headerTitles}>
          <ThemedText type="tabScreenHeader">{t("analyze.title")}</ThemedText>
        </View>
      </ThemedView>

      <RoutineDayPicker
        routines={routines}
        selectedRoutineId={routineId}
        selectedDay={day}
        onSelectRoutine={selectRoutine}
        onSelectDay={selectDay}
      />

      {(loading || routines.length > 0) && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">{t("analyze.progressionSubtitle")}</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.progressionViewTitle}>
            {t("analyze.viewLabel")}
          </ThemedText>
          <View style={styles.chipsRow}>
            {progressionViews.map(({ key, label }) => {
              const active = progressionDetailView === key;
              return (
                <TouchableOpacity
                  key={key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.chip,
                    {
                      borderColor: active
                        ? palette.tintBorder
                        : palette.borderChip,
                      backgroundColor: active
                        ? palette.tintMuted
                        : palette.surfaceCard,
                    },
                  ]}
                  onPress={() => setProgressionDetailView(key)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active
                        ? {
                            color:
                              colorScheme === "light"
                                ? tintColorLight
                                : palette.tint,
                          }
                        : { color: isDark ? palette.text : "#0c2f35" },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {renderBody()}
        </ThemedView>
      )}
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
  progressionViewTitle: {
    marginTop: 2,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: "600",
    fontSize: 14,
  },
  section: {
    gap: 8,
  },
  progressList: {
    gap: 12,
    marginTop: 8,
  },
  placeholderCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  muted: {
    fontSize: 14,
    opacity: 0.85,
  },
});
