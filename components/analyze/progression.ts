import type { Day, WorkoutSession } from "@/components/routines/types";
import type { ExerciseLog, SetEntry } from "@/components/train/types";

/** First working set per saved session (chronological). */
export type SessionMetricRow = {
  at: string;
  kg: number | null;
  reps: number | null;
  rpe: number | null;
};

export type SessionAllSetsRow = {
  at: string;
  sets: { kg: number | null; reps: number | null; rpe: number | null }[];
};

export type ExerciseProgression = {
  exercise: string;
  sessionsUsed: number;
  /** Matching sessions, oldest first — first set only. */
  rows: SessionMetricRow[];
  /** Every logged set per session, same order as rows / sessions. */
  allSetsBySession: SessionAllSetsRow[];
  weightPrev: number | null;
  weightLast: number | null;
  weightDelta: number | null;
  repsPrev: number | null;
  repsLast: number | null;
  repsDelta: number | null;
  rpePrev: number | null;
  rpeLast: number | null;
  /** last − previous; lower is better (use inverted colors). */
  rpeDelta: number | null;
  prevAt: string;
  lastAt: string;
};

function parseWeight(raw: string): number {
  const t = raw.trim().replace(",", ".");
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : 0;
}

function parseReps(raw: string): number {
  const t = raw.trim();
  const n = Number.parseInt(t, 10);
  return Number.isFinite(n) ? n : 0;
}

function parseRpe(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n)) return null;
  return n;
}

function metricsFromSetEntry(s: SetEntry): {
  kg: number | null;
  reps: number | null;
  rpe: number | null;
} {
  const kgRaw = parseWeight(s.weight);
  const repsRaw = parseReps(s.reps);
  const rpeRaw = parseRpe(s.rpe);
  return {
    kg: kgRaw > 0 ? kgRaw : null,
    reps: repsRaw > 0 ? repsRaw : null,
    rpe: rpeRaw != null && rpeRaw > 0 ? rpeRaw : null,
  };
}

function firstSetMetricsForExercise(
  log: ExerciseLog,
  exercise: string
): { kg: number | null; reps: number | null; rpe: number | null } {
  const sets = log[exercise];
  if (!sets?.length) return { kg: null, reps: null, rpe: null };
  return metricsFromSetEntry(sets[0]);
}

function allSetsMetricsForExercise(
  log: ExerciseLog,
  exercise: string
): { kg: number | null; reps: number | null; rpe: number | null }[] {
  const sets = log[exercise];
  if (!sets?.length) return [];
  return sets.map(metricsFromSetEntry);
}

/** Valid sessions only, oldest first. */
export function sortWorkoutSessionsChronologically(
  sessions: WorkoutSession[]
): WorkoutSession[] {
  return sessions
    .filter((s) => {
      const t = new Date(s.performedAt).getTime();
      return !Number.isNaN(t);
    })
    .sort(
      (a, b) =>
        new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime()
    );
}

export function progressionForExercise(
  sessionsSorted: WorkoutSession[],
  routineId: string,
  day: Day,
  exercise: string
): ExerciseProgression | null {
  const relevant = sessionsSorted.filter(
    (s) =>
      s.routineId === routineId &&
      s.day === day &&
      Boolean(s.log[exercise]?.length)
  );
  if (!relevant.length) return null;

  const rows: SessionMetricRow[] = relevant.map((s) => {
    const { kg, reps, rpe } = firstSetMetricsForExercise(s.log, exercise);
    return { at: s.performedAt, kg, reps, rpe };
  });

  const allSetsBySession: SessionAllSetsRow[] = relevant.map((s) => ({
    at: s.performedAt,
    sets: allSetsMetricsForExercise(s.log, exercise),
  }));

  const n = rows.length;
  const last = rows[n - 1];
  const prev = n >= 2 ? rows[n - 2] : null;

  const weightDelta =
    prev && last.kg != null && prev.kg != null
      ? last.kg - prev.kg
      : null;
  const repsDelta =
    prev && last.reps != null && prev.reps != null
      ? last.reps - prev.reps
      : null;
  const rpeDelta =
    prev && last.rpe != null && prev.rpe != null
      ? last.rpe - prev.rpe
      : null;

  return {
    exercise,
    sessionsUsed: n,
    rows,
    allSetsBySession,
    weightPrev: prev?.kg ?? null,
    weightLast: last.kg,
    weightDelta,
    repsPrev: prev?.reps ?? null,
    repsLast: last.reps,
    repsDelta,
    rpePrev: prev?.rpe ?? null,
    rpeLast: last.rpe,
    rpeDelta,
    prevAt: prev?.at ?? "",
    lastAt: last.at,
  };
}

export function progressionsForDay(
  sessionsSorted: WorkoutSession[],
  routineId: string,
  day: Day,
  exerciseNames: string[]
): ExerciseProgression[] {
  const out: ExerciseProgression[] = [];
  for (const name of exerciseNames) {
    const p = progressionForExercise(sessionsSorted, routineId, day, name);
    if (p) out.push(p);
  }
  return out;
}
