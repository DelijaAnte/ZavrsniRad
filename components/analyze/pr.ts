import type { Day, Routine, WorkoutSession } from "@/components/routines/types";

import { metricsFromSetEntry } from "./progression";

export type ExercisePersonalRecord = {
  exercise: string;
  kg: number;
  reps: number;
  rpe: number | null;
  performedAt: string;
  day: Day;
};

/** Unique exercise names in template order (first occurrence wins). */
export function uniqueExerciseNamesForRoutine(routine: Routine): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const d of routine.days) {
    for (const name of routine.exercisesByDay[d] ?? []) {
      if (!seen.has(name)) {
        seen.add(name);
        out.push(name);
      }
    }
  }
  return out;
}

/** True if candidate A beats B: higher kg, then higher reps at same kg; tie → later date. */
function beatsPrCandidate(
  kgA: number,
  repsA: number,
  timeA: number,
  kgB: number,
  repsB: number,
  timeB: number
): boolean {
  if (kgA !== kgB) return kgA > kgB;
  if (repsA !== repsB) return repsA > repsB;
  return timeA >= timeB;
}

export function personalRecordForExercise(
  sessionsSorted: WorkoutSession[],
  routineId: string,
  exercise: string
): ExercisePersonalRecord | null {
  let bestKg = 0;
  let bestReps = 0;
  let bestTime = 0;
  let bestRpe: number | null = null;
  let bestAt = "";
  let bestDay: Day = "Mon";
  let found = false;

  for (const s of sessionsSorted) {
    if (s.routineId !== routineId) continue;
    const sets = s.log[exercise];
    if (!sets?.length) continue;
    const t = new Date(s.performedAt).getTime();
    if (Number.isNaN(t)) continue;

    for (const entry of sets) {
      const { kg, reps, rpe } = metricsFromSetEntry(entry);
      if (kg == null || reps == null) continue;
      if (!beatsPrCandidate(kg, reps, t, bestKg, bestReps, bestTime)) continue;
      found = true;
      bestKg = kg;
      bestReps = reps;
      bestTime = t;
      bestRpe = rpe;
      bestAt = s.performedAt;
      bestDay = s.day;
    }
  }

  if (!found) return null;
  return {
    exercise,
    kg: bestKg,
    reps: bestReps,
    rpe: bestRpe,
    performedAt: bestAt,
    day: bestDay,
  };
}

export function personalRecordsForRoutine(
  sessionsSorted: WorkoutSession[],
  routine: Routine
): { exercise: string; record: ExercisePersonalRecord | null }[] {
  const names = uniqueExerciseNamesForRoutine(routine);
  return names.map((exercise) => ({
    exercise,
    record: personalRecordForExercise(sessionsSorted, routine.id, exercise),
  }));
}
