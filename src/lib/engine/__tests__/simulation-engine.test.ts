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
    const nextNode = engine.makeDecision('open_official_source');
    // The hook decision checks the source before responding to the group.
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
    engine.makeDecision('open_official_source');
    engine.reset();
    expect(engine.getState()).toEqual({ communityTrust: 50, informationIntegrity: 50, publicSafety: 50 });
    expect(engine.getHistory()).toHaveLength(0);
    expect(engine.getCurrentNode()!.id).toBe(case001.entryNodeId);
  });

  it('isComplete returns true when END is reached', () => {
    const engine = new SimulationEngine(case001);
    // Play through all nodes
    const path = [
      'open_official_source',
      'check_official_and_prepare',
      'follow_official_evacuation_guidance',
      'share_verified_rescue_update',
      'inspect_provenance',
      'explain_real_flood_vs_fabricated_visual',
      'correct_with_official_link',
      'send_structured_update',
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

    const path = ['open_official_source', 'check_official_and_prepare', 'follow_official_evacuation_guidance', 'share_verified_rescue_update', 'inspect_provenance', 'explain_real_flood_vs_fabricated_visual', 'correct_with_official_link', 'send_structured_update'];
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
    engine.makeDecision('open_official_source');
    expect(engine.isComplete()).toBe(false);
  });

  it('assigns the skeptical profile to repeated delayed responses', () => {
    const engine = new SimulationEngine(case001);
    const path = [
      'wait_for_others',
      'wait_for_more_posts',
      'wait_for_social_confirmation',
      'stay_silent_to_avoid_panic',
      'share_with_doubt',
      'dismiss_all_flood_updates',
      'delete_and_say_nothing',
      'wait_without_summary',
    ];
    for (const decision of path) engine.makeDecision(decision);
    expect(engine.getProfile()?.id).toBe('skeptical');
  });

  it('assigns the emotional profile to repeated alarmist responses', () => {
    const engine = new SimulationEngine(case001);
    const path = [
      'forward_unchecked',
      'reshare_without_source',
      'dismiss_as_hype',
      'amplify_unconfirmed_rescue_claim',
      'post_as_proof',
      'repost_for_awareness',
      'publicly_shame_sender',
      'send_alarmist_summary',
    ];
    for (const decision of path) engine.makeDecision(decision);
    expect(engine.getProfile()?.id).toBe('emotional');
  });
});
