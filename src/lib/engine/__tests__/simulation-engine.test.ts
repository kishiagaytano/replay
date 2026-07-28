import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../simulation-engine';
import { case001 } from '../../../../content/cases/the-flood-was-real/case';

describe('SimulationEngine', () => {
  it('starts at the entry node', () => {
    const engine = new SimulationEngine(case001);
    const node = engine.getCurrentNode();
    expect(node).not.toBeNull();
    expect(node!.id).toBe(case001.entryNodeId);
  });

  it('initial state is 50 across all meters', () => {
    const engine = new SimulationEngine(case001);
    const state = engine.getState();
    expect(state.communityTrust).toBe(50);
    expect(state.informationIntegrity).toBe(50);
    expect(state.publicSafety).toBe(50);
  });

  it('history is empty at start', () => {
    const engine = new SimulationEngine(case001);
    expect(engine.getHistory()).toHaveLength(0);
  });

  it('makeDecision applies effects and advances', () => {
    const engine = new SimulationEngine(case001);
    const nextNode = engine.makeDecision('verify');
    // "verify" on tino-00 has effects: communityTrust: 8, informationIntegrity: 10, publicSafety: 5
    const state = engine.getState();
    expect(state.communityTrust).toBe(58);
    expect(state.informationIntegrity).toBe(60);
    expect(state.publicSafety).toBe(55);
    expect(nextNode).not.toBeNull();
    expect(engine.getHistory()).toHaveLength(1);
  });

  it('makeDecision with invalid id throws', () => {
    const engine = new SimulationEngine(case001);
    expect(() => engine.makeDecision('nonexistent')).toThrow();
  });

  it('reset restores initial state', () => {
    const engine = new SimulationEngine(case001);
    engine.makeDecision('verify');
    engine.reset();
    expect(engine.getState()).toEqual({ communityTrust: 50, informationIntegrity: 50, publicSafety: 50 });
    expect(engine.getHistory()).toHaveLength(0);
    expect(engine.getCurrentNode()!.id).toBe(case001.entryNodeId);
  });

  it('isComplete returns true when END is reached', () => {
    const engine = new SimulationEngine(case001);
    // Play through all nodes
    const path = [
      'verify',   // tino-00 → tino-01
      'verify_pagasa', // tino-01 → tino-02
      'verify_first',  // tino-02 → tino-03
      'verify_context', // tino-03 → tino-04
      'verify_image',   // tino-04 → tino-05
      'verify_tik',     // tino-05 → tino-06
      'educate',        // tino-06 → tino-07
      'clear_summary',  // tino-07 → END
    ];
    for (const d of path) {
      engine.makeDecision(d);
    }
    expect(engine.isComplete()).toBe(true);
    expect(engine.getCurrentNode()).toBeNull();
  });

  it('getProfile returns a profile after completion', () => {
    const engine = new SimulationEngine(case001);
    expect(engine.getProfile()).toBeNull(); // not completed

    const path = ['verify', 'verify_pagasa', 'verify_first', 'verify_context', 'verify_image', 'verify_tik', 'educate', 'clear_summary'];
    for (const d of path) {
      engine.makeDecision(d);
    }
    const profile = engine.getProfile();
    expect(profile).not.toBeNull();
    expect(profile!.id).toBe('responsible');
  });

  it('is not complete until END is reached', () => {
    const engine = new SimulationEngine(case001);
    expect(engine.isComplete()).toBe(false);
    engine.makeDecision('verify');
    expect(engine.isComplete()).toBe(false);
  });
});
