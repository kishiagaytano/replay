import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../simulation-engine';
import { validateCase } from '@/lib/schema/validate-case';
import { allCases } from '@/lib/registry';
import { computeCaseRevision } from '../persistence';
import type { Case } from '@/lib/schema/case.schema';

/**
 * Exhaustive traversal: every decision at every reachable node, on every
 * distinct path. This is the test that proves no authored option can soft-lock
 * the simulation or push a meter out of range.
 */

const PATH_LIMIT = 200_000;

function enumeratePaths(caseData: Case): string[][] {
  const byId = new Map(caseData.nodes.map((n) => [n.id, n]));
  const complete: string[][] = [];
  const stack: Array<{ nodeId: string; path: string[] }> = [
    { nodeId: caseData.entryNodeId, path: [] },
  ];

  while (stack.length > 0) {
    if (complete.length > PATH_LIMIT) {
      throw new Error('Path explosion — the case graph may contain a cycle.');
    }
    const { nodeId, path } = stack.pop()!;
    const node = byId.get(nodeId);
    if (!node) continue;

    for (const decision of node.decisions) {
      const next = [...path, decision.id];
      if (decision.next === 'END') complete.push(next);
      else stack.push({ nodeId: decision.next, path: next });
    }
  }

  return complete;
}

const cases = allCases().map(({ id, case: caseData }) => ({
  id,
  caseData,
  paths: enumeratePaths(caseData),
}));

describe.each(cases)('$id — case integrity', ({ caseData, paths }) => {
  it('passes validation with no errors', () => {
    const result = validateCase(caseData);
    if (!result.ok) console.error(JSON.stringify(result.errors, null, 2));
    expect(result.errors).toEqual([]);
  });

  it('reports no validation warnings', () => {
    expect(validateCase(caseData).warnings).toEqual([]);
  });

  it('enumerates at least one complete path', () => {
    expect(paths.length).toBeGreaterThan(0);
  });

  // Failures are collected and asserted once at the end: a per-step `expect`
  // across ~400k decisions dominates the runtime of the whole suite.
  it('every path terminates cleanly, with meters inside 0-100 and a valid profile', { timeout: 120_000 }, () => {
    const validProfileIds = new Set(caseData.reflection?.profiles.map((p) => p.id) ?? []);
    const failures: string[] = [];

    for (const path of paths) {
      const engine = new SimulationEngine(caseData);

      for (const decisionId of path) {
        engine.makeDecision(decisionId);
        const meters = engine.getState();
        for (const [meter, value] of Object.entries(meters)) {
          if (value < 0 || value > 100) {
            failures.push(`${path.join(' > ')}: ${meter} out of range (${value})`);
          }
        }
      }

      if (!engine.isComplete()) failures.push(`${path.join(' > ')}: did not complete`);
      if (engine.getCurrentNode() !== null) failures.push(`${path.join(' > ')}: node still active`);

      const profile = engine.getProfile();
      if (!profile) failures.push(`${path.join(' > ')}: no profile assigned`);
      else if (!validProfileIds.has(profile.id)) {
        failures.push(`${path.join(' > ')}: unknown profile "${profile.id}"`);
      }
    }

    expect(failures.slice(0, 10)).toEqual([]);
  });

  it('has a stable case revision fingerprint', () => {
    expect(computeCaseRevision(caseData)).toBe(computeCaseRevision(caseData));
    expect(computeCaseRevision(caseData)).toMatch(/^[a-z0-9]+$/);
  });

  it('changing the decision graph changes the revision fingerprint', () => {
    const before = computeCaseRevision(caseData);
    const mutated: Case = {
      ...caseData,
      nodes: caseData.nodes.map((n, i) =>
        i === 0 ? { ...n, decisions: n.decisions.slice(0, -1) } : n,
      ),
    };
    expect(computeCaseRevision(mutated)).not.toBe(before);
  });

  it(`rejects a decision id that isn't on the current node without mutating state`, () => {
    const engine = new SimulationEngine(caseData);
    expect(() => engine.makeDecision('__not_a_real_decision__')).toThrow();
    expect(engine.getHistory()).toEqual([]);
    expect(engine.getState()).toEqual({
      communityTrust: 50,
      informationIntegrity: 50,
      publicSafety: 50,
    });
  });

  it('refuses further decisions once complete', () => {
    const engine = new SimulationEngine(caseData);
    for (const decisionId of paths[0]) engine.makeDecision(decisionId);
    expect(() => engine.makeDecision(paths[0][0])).toThrow();
  });
});
