import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../simulation-engine';
import { case001 } from '../../../../content/cases/the-flood-was-real/case';
import { LEARNING_SIGNALS } from '@/lib/schema/case.schema';

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

function play(path: string[]) {
  const engine = new SimulationEngine(case001);
  for (const id of path) engine.makeDecision(id);
  return engine;
}

describe('signal tallies', () => {
  it('counts opportunities once per node, not once per option', () => {
    const opportunities = new SimulationEngine(case001).getSignalOpportunities();
    for (const signal of LEARNING_SIGNALS) {
      expect(opportunities[signal]).toBeLessThanOrEqual(case001.nodes.length);
      expect(opportunities[signal]).toBeGreaterThanOrEqual(0);
    }
    // Every signal the case teaches must be offered somewhere.
    const offered = Object.values(opportunities).filter((n) => n > 0).length;
    expect(offered).toBe(LEARNING_SIGNALS.length);
  });

  it('never records more demonstrations than there are opportunities', () => {
    for (const path of [RESPONSIBLE_PATH, AVOIDANT_PATH]) {
      const summary = play(path).getRunSummary();
      for (const signal of LEARNING_SIGNALS) {
        expect(summary.signalsDemonstrated[signal]).toBeLessThanOrEqual(
          summary.signalOpportunities[signal],
        );
      }
    }
  });
});

describe('reflection', () => {
  it('is empty before any decision and populated after completion', () => {
    const fresh = new SimulationEngine(case001).getRunSummary();
    expect(fresh.completed).toBe(false);
    expect(fresh.profile).toBeNull();
    // Lines still exist (the case offers the checks) but nothing is demonstrated.
    expect(fresh.reflection.every((l) => l.demonstrated === 0)).toBe(true);

    const done = play(RESPONSIBLE_PATH).getRunSummary();
    expect(done.completed).toBe(true);
    expect(done.reflection.length).toBeGreaterThan(0);
  });

  it('is deterministic — identical input produces identical output', () => {
    expect(play(RESPONSIBLE_PATH).getRunSummary()).toEqual(play(RESPONSIBLE_PATH).getRunSummary());
    expect(play(AVOIDANT_PATH).getRunSummary()).toEqual(play(AVOIDANT_PATH).getRunSummary());
  });

  it('affirms a thorough run and instructs an avoidant one', () => {
    const thorough = play(RESPONSIBLE_PATH).getRunSummary();
    const avoidant = play(AVOIDANT_PATH).getRunSummary();

    expect(thorough.reflection.some((l) => l.tone === 'affirming')).toBe(true);
    expect(avoidant.reflection.every((l) => l.tone !== 'affirming')).toBe(true);
  });

  it('never uses punitive language, per §11', () => {
    const banned = /\b(wrong|failed|fail|incorrect|bad|stupid|should have)\b/i;
    for (const path of [RESPONSIBLE_PATH, AVOIDANT_PATH]) {
      for (const line of play(path).getRunSummary().reflection) {
        expect(line.text).not.toMatch(banned);
      }
    }
  });

  it('reports lines in the fixed §12 order', () => {
    const order = play(RESPONSIBLE_PATH).getRunSummary().reflection.map((l) => l.signal);
    const expected = LEARNING_SIGNALS.filter((s) => order.includes(s));
    expect(order).toEqual(expected);
  });
});

describe('run summary', () => {
  it('is JSON-serializable so it can cross the server/client boundary', () => {
    const summary = play(RESPONSIBLE_PATH).getRunSummary();
    expect(JSON.parse(JSON.stringify(summary))).toEqual(summary);
  });

  it('records meters after each decision', () => {
    const engine = play(RESPONSIBLE_PATH);
    const history = engine.getHistory();
    expect(history).toHaveLength(RESPONSIBLE_PATH.length);
    expect(history.at(-1)!.metersAfter).toEqual(engine.getState());
    for (const record of history) {
      for (const value of Object.values(record.metersAfter)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });

  it('exposes profile scores that explain the chosen profile', () => {
    const summary = play(RESPONSIBLE_PATH).getRunSummary();
    const best = Object.entries(summary.profileScores).sort((a, b) => b[1] - a[1])[0][0];
    expect(summary.profile?.id).toBe(best);
  });

  it('getHistory returns copies that cannot mutate engine state', () => {
    const engine = play(RESPONSIBLE_PATH);
    const history = engine.getHistory();
    history[0].metersAfter.communityTrust = -999;
    history[0].signals.push('checked-source');
    expect(engine.getHistory()[0].metersAfter.communityTrust).not.toBe(-999);
  });
});
