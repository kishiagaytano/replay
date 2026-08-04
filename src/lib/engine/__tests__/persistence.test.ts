import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveSimulation,
  loadSimulation,
  clearSimulation,
  computeCaseRevision,
  SAVE_VERSION,
} from '../persistence';
import { SimulationEngine } from '../simulation-engine';
import { case001 } from '../../../../content/cases/the-flood-was-real/case';

/** Minimal in-memory localStorage so persistence can be tested in node. */
function installLocalStorage() {
  const store = new Map<string, string>();
  const mock = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
  vi.stubGlobal('window', { localStorage: mock });
  vi.stubGlobal('localStorage', mock);
  return store;
}

const PATH = ['open_official_source', 'check_official_and_prepare'];
const revision = computeCaseRevision(case001);

let store: Map<string, string>;
beforeEach(() => {
  store = installLocalStorage();
});

describe('persistence', () => {
  it('round-trips a run and reproduces meters and history exactly', () => {
    saveSimulation(case001.id, revision, PATH);

    const saved = loadSimulation(case001.id, revision);
    expect(saved).not.toBeNull();
    expect(saved!.decisionIds).toEqual(PATH);
    expect(saved!.version).toBe(SAVE_VERSION);

    const original = new SimulationEngine(case001);
    for (const id of PATH) original.makeDecision(id);

    const restored = new SimulationEngine(case001);
    for (const id of saved!.decisionIds) restored.makeDecision(id);

    expect(restored.getState()).toEqual(original.getState());
    expect(restored.getHistory()).toEqual(original.getHistory());
    expect(restored.getRunSummary()).toEqual(original.getRunSummary());
  });

  it('returns null and clears the entry when the stored JSON is malformed', () => {
    store.set('replay-sim-' + case001.id, '{not json');
    expect(loadSimulation(case001.id, revision)).toBeNull();
  });

  it('returns null and clears the entry when the shape is wrong', () => {
    store.set('replay-sim-' + case001.id, JSON.stringify({ caseId: case001.id, decisionIds: 'nope' }));
    expect(loadSimulation(case001.id, revision)).toBeNull();
    expect(store.has('replay-sim-' + case001.id)).toBe(false);
  });

  it('discards a save written against a different revision of the case', () => {
    saveSimulation(case001.id, 'some-old-revision', PATH);
    expect(loadSimulation(case001.id, revision)).toBeNull();
    expect(store.has('replay-sim-' + case001.id)).toBe(false);
  });

  it('discards a save from an older version', () => {
    store.set(
      'replay-sim-' + case001.id,
      JSON.stringify({ version: 0, caseId: case001.id, caseRevision: revision, decisionIds: PATH, savedAt: 'x' }),
    );
    expect(loadSimulation(case001.id, revision)).toBeNull();
  });

  it('clears on request and returns null for an absent key', () => {
    saveSimulation(case001.id, revision, PATH);
    clearSimulation(case001.id);
    expect(loadSimulation(case001.id, revision)).toBeNull();
  });

  it('is a no-op on the server, where window is undefined', () => {
    vi.stubGlobal('window', undefined);
    expect(() => saveSimulation(case001.id, revision, PATH)).not.toThrow();
    expect(loadSimulation(case001.id, revision)).toBeNull();
    expect(() => clearSimulation(case001.id)).not.toThrow();
  });
});
