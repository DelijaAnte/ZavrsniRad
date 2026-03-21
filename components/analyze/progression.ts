import type { Day, WorkoutSession } from "@/components/routines/types";
import type { ExerciseLog } from "@/components/train/types";

export type AnalyzePeriod = "week" | "month" | "all";

/** One saved training for this exercise: best load and best reps in that session. */
export type SessionMetricRow = {
  at: string;
  kg: number | null;
  reps: number | null;
};

export type ExerciseProgression = {
  exercise: string;
  sessionsUsed: number;
  /** Every matching session in the period, oldest first. */
  rows: SessionMetricRow[];
  weightFirst: number | null;
  weightLast: number | null;
  weightDelta: number | null;
  repsFirst: number | null;
  repsLast: number | null;
  repsDelta: number | null;
  firstAt: string;
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

function bestKgAndRepsForExercise(
  log: ExerciseLog,
  exercise: string
): { kg: number | null; reps: number | null } {
  const sets = log[exercise];
  if (!sets?.length) return { kg: null, reps: null };
  let maxKg = 0;
  let maxReps = 0;
  for (const s of sets) {
    maxKg = Math.max(maxKg, parseWeight(s.weight));
    maxReps = Math.max(maxReps, parseReps(s.reps));
  }
  return {
    kg: maxKg > 0 ? maxKg : null,
    reps: maxReps > 0 ? maxReps : null,
  };
}

export function filterSessionsByPeriod(
  sessions: WorkoutSession[],
  period: AnalyzePeriod,
  now = new Date()
): WorkoutSession[] {
  const end = now.getTime();
  let start = 0;
  if (period === "week") {
    start = end - 7 * 24 * 60 * 60 * 1000;
  } else if (period === "month") {
    start = end - 30 * 24 * 60 * 60 * 1000;
  }
  return sessions
    .filter((s) => {
      const t = new Date(s.performedAt).getTime();
      if (Number.isNaN(t)) return false;
      if (period === "all") return true;
      return t >= start && t <= end;
    })
    .sort(
      (a, b) =>
        new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime()
    );
}

export function progressionForExercise(
  sessionsInPeriod: WorkoutSession[],
  routineId: string,
  day: Day,
  exercise: string
): ExerciseProgression | null {
  const relevant = sessionsInPeriod.filter(
    (s) =>
      s.routineId === routineId &&
      s.day === day &&
      Boolean(s.log[exercise]?.length)
  );
  if (!relevant.length) return null;

  const rows: SessionMetricRow[] = relevant.map((s) => {
    const { kg, reps } = bestKgAndRepsForExercise(s.log, exercise);
    return { at: s.performedAt, kg, reps };
  });

  const first = rows[0];
  const last = rows[rows.length - 1];

  const weightDelta =
    first.kg != null && last.kg != null ? last.kg - first.kg : null;
  const repsDelta =
    first.reps != null && last.reps != null ? last.reps - first.reps : null;

  return {
    exercise,
    sessionsUsed: rows.length,
    rows,
    weightFirst: first.kg,
    weightLast: last.kg,
    weightDelta,
    repsFirst: first.reps,
    repsLast: last.reps,
    repsDelta,
    firstAt: first.at,
    lastAt: last.at,
  };
}

export function progressionsForDay(
  sessionsInPeriod: WorkoutSession[],
  routineId: string,
  day: Day,
  exerciseNames: string[]
): ExerciseProgression[] {
  const out: ExerciseProgression[] = [];
  for (const name of exerciseNames) {
    const p = progressionForExercise(sessionsInPeriod, routineId, day, name);
    if (p) out.push(p);
  }
  return out;
}
