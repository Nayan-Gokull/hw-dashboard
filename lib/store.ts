export interface Run {
  run_id: number;
  elapsed_ms: number;
  speed_mph: number;
  speed_kmh: number;
  scale_mph: number;
  scale_kmh: number;
  timestamp: string;
  track_angle?: number;   // ramp inclination in degrees
  peak_g?: number;        // peak net G-force through the trap
}

// Module-level store — persists across requests in the same server instance.
// Replaced by Firebase in Phase 4.
const runs: Run[] = [];
let nextId = 1;

export function addRun(data: Omit<Run, 'run_id'>): Run {
  const run: Run = { run_id: nextId++, ...data };
  runs.unshift(run);
  if (runs.length > 200) runs.pop();
  return run;
}

export function getRuns(): Run[] {
  return [...runs];
}

export function getLatestRun(): Run | null {
  return runs[0] ?? null;
}
