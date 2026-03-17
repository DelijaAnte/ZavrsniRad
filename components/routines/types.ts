export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type Day = (typeof DAYS)[number];

export type Routine = {
  id: string;
  name: string;
  days: Day[];
  exercisesByDay: Record<Day, string[]>;
};

