import { z } from 'zod';

const STORAGE_KEY_PREFIX = 'replay-sim-';

/**
 * Bump when the saved shape changes. Saves from an older version are discarded
 * rather than migrated — a run is a handful of decisions, so replaying is
 * cheaper and safer than migrating.
 */
export const SAVE_VERSION = 1;

/**
 * Saved runs store only decision IDs; meters and profile are recomputed by
 * replaying them through the engine. That makes it impossible for a saved run
 * to disagree with engine logic. The trade-off is that saves are invalidated
 * when decision IDs change — hence `caseRevision`.
 */
export const savedSimulationSchema = z.object({
  version: z.literal(SAVE_VERSION),
  caseId: z.string().min(1),
  /** Content fingerprint. A mismatch discards the save instead of replaying stale IDs. */
  caseRevision: z.string().min(1),
  decisionIds: z.array(z.string().min(1)),
  savedAt: z.string().min(1),
});
export type SavedSimulation = z.infer<typeof savedSimulationSchema>;

function key(caseId: string): string {
  return STORAGE_KEY_PREFIX + caseId;
}

/**
 * Fingerprint the parts of a case that a saved run depends on: the entry node
 * and every node/decision ID, in order. Content copy or meter tuning can change
 * freely; changing the *graph* invalidates saves, which is exactly what we want.
 */
export function computeCaseRevision(caseData: {
  entryNodeId: string;
  nodes: ReadonlyArray<{ id: string; decisions: ReadonlyArray<{ id: string; next: string }> }>;
}): string {
  const parts = [caseData.entryNodeId];
  for (const node of caseData.nodes) {
    for (const decision of node.decisions) {
      parts.push(`${node.id}:${decision.id}>${decision.next}`);
    }
  }
  return djb2(parts.join('|'));
}

function djb2(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

/** Save the current simulation state to localStorage. */
export function saveSimulation(caseId: string, caseRevision: string, decisionIds: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const data: SavedSimulation = {
      version: SAVE_VERSION,
      caseId,
      caseRevision,
      decisionIds,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(key(caseId), JSON.stringify(data));
  } catch {
    // localStorage may be full or unavailable
  }
}

/**
 * Load a saved simulation. Returns null — never a partially-trusted object —
 * if the entry is absent, malformed, from an older version, or from a
 * different revision of the case content.
 */
export function loadSimulation(caseId: string, caseRevision?: string): SavedSimulation | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key(caseId));
    if (!raw) return null;

    const parsed = savedSimulationSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      clearSimulation(caseId);
      return null;
    }
    if (parsed.data.caseId !== caseId) {
      clearSimulation(caseId);
      return null;
    }
    if (caseRevision && parsed.data.caseRevision !== caseRevision) {
      // Case content changed since this run was saved.
      clearSimulation(caseId);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

/** Clear saved state for a specific case. */
export function clearSimulation(caseId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key(caseId));
  } catch {
    // ignore
  }
}
