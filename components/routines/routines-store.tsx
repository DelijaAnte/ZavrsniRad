import React, { createContext, useContext, useMemo, useState } from "react";

import type { Routine } from "@/components/routines/types";

type RoutinesContextValue = {
  routines: Routine[];
  addRoutine: (routine: Routine) => void;
};

const RoutinesContext = createContext<RoutinesContextValue | null>(null);

export function RoutinesProvider({ children }: { children: React.ReactNode }) {
  const [routines, setRoutines] = useState<Routine[]>([]);

  const value = useMemo<RoutinesContextValue>(() => {
    return {
      routines,
      addRoutine: (routine) => setRoutines((prev) => [routine, ...prev]),
    };
  }, [routines]);

  return (
    <RoutinesContext.Provider value={value}>
      {children}
    </RoutinesContext.Provider>
  );
}

export function useRoutines() {
  const ctx = useContext(RoutinesContext);
  if (!ctx) {
    throw new Error("useRoutines must be used within RoutinesProvider");
  }
  return ctx;
}

