import type { Day, WorkoutSession } from "@/components/routines/types";
import type { ExerciseLog } from "@/components/train/types";

export type AnalyzePeriod = "week" | "month" | "all";

export type ProgressionUnit = "reps" | "kg";

export type ExerciseProgression = {
  exercise: string;
  unit: ProgressionUnit;
  firstValue: number;
  lastValue: number;
  delta: number;
  firstAt: string;
  lastAt: string;
  sessionsUsed: number;
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

function detectUnit(log: ExerciseLog, exercise: string): ProgressionUnit {
  const sets = log[exercise];
  if (!sets?.length) return "reps";
  for (const s of sets) {
    if (parseWeight(s.weight) > 0) return "kg";
  }
  return "reps";
}

function sessionValue(
  log: ExerciseLog,
  exercise: string,
  unit: ProgressionUnit
): number | null {
  const sets = log[exercise];
  if (!sets?.length) return null;
  if (unit === "kg") {
    let max = 0;
    for (const s of sets) max = Math.max(max, parseWeight(s.weight));
    return max > 0 ? max : null;
  }
  let max = 0;
  for (const s of sets) max = Math.max(max, parseReps(s.reps));
  return max > 0 ? max : null;
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

  const unit = detectUnit(relevant[relevant.length - 1].log, exercise);

  const points: { value: number; at: string }[] = [];
  for (const s of relevant) {
    const v = sessionValue(s.log, exercise, unit);
    if (v != null) points.push({ value: v, at: s.performedAt });
  }
  if (points.length < 2) {
    const only = points[0];
    if (!only) return null;
    return {
      exercise,
      unit,
      firstValue: only.value,
      lastValue: only.value,
      delta: 0,
      firstAt: only.at,
      lastAt: only.at,
      sessionsUsed: 1,
    };
  }

  const first = points[0];
  const last = points[points.length - 1];
  return {
    exercise,
    unit,
    firstValue: first.value,
    lastValue: last.value,
    delta: last.value - first.value,
    firstAt: first.at,
    lastAt: last.at,
    sessionsUsed: points.length,
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
