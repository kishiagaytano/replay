import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../simulation-engine';
import { case001 } from '../../../../content/cases/the-flood-was-real/case';
import type { Case } from '@/lib/schema/case.schema';

/** Look up a decision's authored effects so tests assert deltas, not tuned constants. */
function decisionOf(nodeId: string, decisionId: string) {
  const node = case001.nodes.find((n) => n.id === nodeId)!;
  return node.decisions.find((d) => d.id === decisionId)!;
}

const RESPONSIBLE_PATH = [
  'open_official_source',
  'check_official_and_prepare',
  'follow_official_evacuation_guidance',
  'share_verified_rescue_update',
  'inspect_provenance',
  'explain_real_flood_vs_fabricated_visual',
  'correct_with_official_link',
  'send_structured_update',
];

const AVOIDANT_PATH = [
  'wait_for_others',
  'wait_for_more_posts',
  'wait_for_social_confirmation',
  'stay_silent_to_avoid_panic',
  'share_with_doubt',
  'dismiss_all_flood_updates',
  'delete_and_say_nothing',
  'wait_without_summary',
];

const ALARMIST_PATH = [
  'forward_unchecked',
  'reshare_without_source',
  'dismiss_as_hype',
  'amplify_unconfirmed_rescue_claim',
  'post_as_proof',
  'repost_for_awareness',
  'publicly_shame_sender',
  'send_alarmist_summary',
];

describe('SimulationEngine', () => {
  it('starts at the entry node', () => {
    const engine = new SimulationEngine(case001);
    const node = engine.getCurrentNode();
    expect(node).not.toBeNull();
    expect(node!.id).toBe(case001.entryNodeId);
  });

  it('initial state is 50 across all meters', () => {
    const engine = new SimulationEngine(case001);
    expect(engine.getState()).toEqual({
      communityTrust: 50,
      informationIntegrity: 50,
      publicSafety: 50,
    });
  });

  it('history is empty at start', () => {
    const engine = new SimulationEngine(case001);
    expect(engine.getHistory()).toHaveLength(0);
  });

  it("makeDecision applies the decision's own effects and advances", () => {
    const engine = new SimulationEngine(case001);
    const decision = decisionOf(case001.entryNodeId, 'open_official_source');

    const nextNode = engine.makeDecision('open_official_source');
    const state = engine.getState();

    // Assert the delta from 50, not a hard-coded total — meter tuning is
    // content work and must not break the engine suite.
    expect(state.communityTrust).toBe(50 + decision.effects.communityTrust);
    expect(state.informationIntegrity).toBe(50 + decision.effects.informationIntegrity);
    expect(state.publicSafety).toBe(50 + decision.effects.publicSafety);

    expect(nextNode).not.toBeNull();
    expect(nextNode!.id).toBe(decision.next);
    expect(engine.getHistory()).toHaveLength(1);
  });

  it('records the decision label and signals in history', () => {
    const engine = new SimulationEngine(case001);
    const decision = decisionOf(case001.entryNodeId, 'open_official_source');
    engine.makeDecision('open_official_source');

    const [record] = engine.getHistory();
    expect(record.nodeId).toBe(case001.entryNodeId);
    expect(record.decisionId).toBe('open_official_source');
    expect(record.decisionLabel).toBe(decision.label);
    expect(record.signals).toEqual(decision.signals);
  });

  it('makeDecision with invalid id throws', () => {
    const engine = new SimulationEngine(case001);
    expect(() => engine.makeDecision('nonexistent')).toThrow();
  });

  it('reset restores initial state', () => {
    const engine = new SimulationEngine(case001);
    engine.makeDecision('open_official_source');
    engine.reset();
    expect(engine.getState()).toEqual({
      communityTrust: 50,
      informationIntegrity: 50,
      publicSafety: 50,
    });
    expect(engine.getHistory()).toHaveLength(0);
    expect(engine.getCurrentNode()!.id).toBe(case001.entryNodeId);
  });

  it('isComplete returns true when END is reached', () => {
    const engine = new SimulationEngine(case001);
    for (const d of RESPONSIBLE_PATH) engine.makeDecision(d);
    expect(engine.isComplete()).toBe(true);
    expect(engine.getCurrentNode()).toBeNull();
  });

  it('is not complete until END is reached', () => {
    const engine = new SimulationEngine(case001);
    expect(engine.isComplete()).toBe(false);
    engine.makeDecision('open_official_source');
    expect(engine.isComplete()).toBe(false);
  });

  it('getProfile returns null before completion', () => {
    const engine = new SimulationEngine(case001);
    expect(engine.getProfile()).toBeNull();
    engine.makeDecision('open_official_source');
    expect(engine.getProfile()).toBeNull();
  });

  it('assigns the responsible profile to a consistently verifying path', () => {
    const engine = new SimulationEngine(case001);
    for (const d of RESPONSIBLE_PATH) engine.makeDecision(d);
    expect(engine.getProfile()?.id).toBe('responsible');
  });

  it('assigns the skeptical profile to repeated delayed responses', () => {
    const engine = new SimulationEngine(case001);
    for (const d of AVOIDANT_PATH) engine.makeDecision(d);
    expect(engine.getProfile()?.id).toBe('skeptical');
  });

  it('assigns the emotional profile to repeated alarmist responses', () => {
    const engine = new SimulationEngine(case001);
    for (const d of ALARMIST_PATH) engine.makeDecision(d);
    expect(engine.getProfile()?.id).toBe('emotional');
  });

  it('scores the profile only from authored profileEffects', () => {
    const engine = new SimulationEngine(case001);
    for (const d of RESPONSIBLE_PATH) engine.makeDecision(d);

    const expected = { responsible: 0, skeptical: 0, emotional: 0 };
    for (const record of engine.getHistory()) {
      expected.responsible += record.profileEffects.responsible;
      expected.skeptical += record.profileEffects.skeptical;
      expected.emotional += record.profileEffects.emotional;
    }
    expect(engine.getProfileScores()).toEqual(expected);
  });

  it('resolves an exact tie by the documented priority order', () => {
    // A one-node case where responsible and skeptical both finish tied.
    const tied: Case = {
      ...case001,
      entryNodeId: 'tie',
      nodes: [
        {
          id: 'tie',
          decisions: [
            {
              id: 'r',
              label: 'Tied option',
              effects: { communityTrust: 0, informationIntegrity: 0, publicSafety: 0 },
              profileEffects: { responsible: 1, skeptical: 1, emotional: 0 },
              signals: [],
              next: 'END',
            },
            {
              id: 's',
              label: 'Other option',
              effects: { communityTrust: 0, informationIntegrity: 0, publicSafety: 0 },
              profileEffects: { responsible: 0, skeptical: 1, emotional: 0 },
              signals: [],
              next: 'END',
            },
          ],
        },
      ],
    };

    const engine = new SimulationEngine(tied);
    engine.makeDecision('r');
    const scores = engine.getProfileScores();
    expect(scores.responsible).toBe(scores.skeptical);
    expect(engine.getProfile()?.id).toBe('responsible');
  });

  it('clamps meters at the 0 and 100 boundaries', () => {
    const engine = new SimulationEngine(case001);
    for (const d of ALARMIST_PATH) engine.makeDecision(d);
    for (const value of Object.values(engine.getState())) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });
});
