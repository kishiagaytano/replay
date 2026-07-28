const STORAGE_KEY_PREFIX = 'replay-sim-';

export interface SavedSimulation {
  caseId: string;
  decisionIds: string[];
}

/** Save the current simulation state to localStorage. */
export function saveSimulation(caseId: string, decisionIds: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const data: SavedSimulation = { caseId, decisionIds };
    localStorage.setItem(STORAGE_KEY_PREFIX + caseId, JSON.stringify(data));
  } catch {
    // localStorage may be full or unavailable
  }
}

/** Load a saved simulation for a given case. */
export function loadSimulation(caseId: string): SavedSimulation | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + caseId);
    if (!raw) return null;
    return JSON.parse(raw) as SavedSimulation;
  } catch {
    return null;
  }
}

/** Clear saved state for a specific case. */
export function clearSimulation(caseId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + caseId);
  } catch {
    // ignore
  }
}
