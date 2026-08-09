import { describe, it, expect } from 'vitest';
import { validateCase } from '../validate-case';
import type { Case } from '../case.schema';

/** Smallest case that passes every rule; each test bends one thing. */
function baseCase(): Case {
  return {
    id: 'test-case',
    code: 'T1',
    title: 'Test Case',
    track: ['ai-mil'],
    competency: 'critical-evaluation',
    historicalContext: {
      realEvent: 'Test event',
      summary: 'Summary of the event.',
      dateRange: '2025',
      sources: [{ publisher: 'PIA', title: 'Report', date: '2025-11-03' }],
    },
    nodes: [
      {
        id: 'n1',
        evidenceId: 'E1',
        decisions: [
          {
            id: 'a',
            label: 'Check the source.',
            effects: { communityTrust: 1, informationIntegrity: 1, publicSafety: 1 },
            profileEffects: { responsible: 1, skeptical: 0, emotional: 0 },
            signals: ['checked-source'],
            next: 'n2',
          },
          {
            id: 'b',
            label: 'Forward it.',
            effects: { communityTrust: -1, informationIntegrity: -1, publicSafety: 0 },
            profileEffects: { responsible: -1, skeptical: 0, emotional: 1 },
            signals: [],
            next: 'n2',
          },
        ],
      },
      {
        id: 'n2',
        decisions: [
          {
            id: 'c',
            label: 'Send a sourced update.',
            effects: { communityTrust: 1, informationIntegrity: 1, publicSafety: 1 },
            profileEffects: { responsible: 1, skeptical: 0, emotional: 0 },
            signals: ['shared-with-context'],
            next: 'END',
          },
          {
            id: 'd',
            label: 'Say nothing.',
            effects: { communityTrust: 0, informationIntegrity: 0, publicSafety: -1 },
            profileEffects: { responsible: 0, skeptical: 1, emotional: 0 },
            signals: [],
            next: 'END',
          },
        ],
      },
    ],
    entryNodeId: 'n1',
    evidence: [
      {
        id: 'E1',
        channel: 'official-advisory',
        claim: 'A warning is active.',
        mediaStatus: 'authentic',
        claimAccuracy: 'accurate',
        citations: [{ publisher: 'PIA', title: 'Advisory', date: '2025-11-03' }],
      },
    ],
    toolkit: [],
    historicalReveal: {
      title: 'What actually happened',
      intro: 'The documented timeline.',
      beats: [
        {
          nodeId: 'n1',
          date: '2025-11-03',
          headline: 'A warning was issued',
          whatHappened: 'Officials issued a warning.',
          simulated: false,
          citations: [{ publisher: 'PIA', title: 'Advisory', date: '2025-11-03' }],
        },
        {
          nodeId: 'n2',
          date: '2025-11-04',
          headline: 'The final update was a simulated exercise',
          whatHappened: 'This moment is a reconstructed exercise, not something a real person sent.',
          simulated: true,
          citations: [{ publisher: 'PIA', title: 'Advisory', date: '2025-11-03' }],
        },
      ],
    },
    reflection: {
      profiles: [
        { id: 'responsible', title: 'Responsible', description: 'Description.' },
        { id: 'skeptical', title: 'Skeptical', description: 'Description.' },
        { id: 'emotional', title: 'Emotional', description: 'Description.' },
      ],
    },
  };
}

function codes(result: ReturnType<typeof validateCase>) {
  return result.errors.map((e) => e.code);
}

describe('validateCase', () => {
  it('accepts a well-formed case with no errors or warnings', () => {
    const result = validateCase(baseCase());
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('reports schema failures without attempting graph checks', () => {
    const result = validateCase({ id: 'broken' });
    expect(result.ok).toBe(false);
    expect(result.case).toBeUndefined();
    expect(codes(result)).toContain('SCHEMA');
  });

  it('catches a decision pointing at a node that does not exist', () => {
    const c = baseCase();
    c.nodes[0].decisions[0].next = 'nope';
    const result = validateCase(c);
    expect(result.ok).toBe(false);
    expect(codes(result)).toContain('UNKNOWN_NEXT');
  });

  it('catches a missing entry node', () => {
    const c = baseCase();
    c.entryNodeId = 'does-not-exist';
    expect(codes(validateCase(c))).toContain('ENTRY_NOT_FOUND');
  });

  it('catches an unreachable node', () => {
    const c = baseCase();
    c.nodes.push({
      id: 'orphan',
      decisions: [
        {
          id: 'x',
          label: 'A',
          effects: { communityTrust: 0, informationIntegrity: 0, publicSafety: 0 },
          profileEffects: { responsible: 0, skeptical: 0, emotional: 0 },
          signals: ['checked-source'],
          next: 'END',
        },
        {
          id: 'y',
          label: 'B',
          effects: { communityTrust: 0, informationIntegrity: 0, publicSafety: 0 },
          profileEffects: { responsible: 0, skeptical: 0, emotional: 0 },
          signals: [],
          next: 'END',
        },
      ],
    });
    expect(codes(validateCase(c))).toContain('UNREACHABLE_NODE');
  });

  it('catches a graph with no path to END', () => {
    const c = baseCase();
    c.nodes[1].decisions.forEach((d) => { d.next = 'n1'; });
    expect(codes(validateCase(c))).toContain('NO_TERMINAL_PATH');
  });

  it('enforces the 2-4 decisions per node rule from §8', () => {
    const c = baseCase();
    c.nodes[0].decisions = [c.nodes[0].decisions[0]];
    expect(codes(validateCase(c))).toContain('DECISION_COUNT');
  });

  it('catches duplicate node and decision ids', () => {
    const dupNode = baseCase();
    dupNode.nodes[1].id = 'n1';
    expect(codes(validateCase(dupNode))).toContain('DUPLICATE_NODE_ID');

    const dupDecision = baseCase();
    dupDecision.nodes[0].decisions[1].id = 'a';
    expect(codes(validateCase(dupDecision))).toContain('DUPLICATE_DECISION_ID');
  });

  it('catches an evidence reference that does not resolve', () => {
    const c = baseCase();
    c.nodes[0].evidenceId = 'E99';
    expect(codes(validateCase(c))).toContain('UNKNOWN_EVIDENCE_REF');
  });

  it('requires every profile the scorer can emit', () => {
    const c = baseCase();
    c.reflection!.profiles = c.reflection!.profiles.filter((p) => p.id !== 'emotional');
    expect(codes(validateCase(c))).toContain('PROFILE_MISMATCH');
  });

  it('requires a reflection block', () => {
    const c = baseCase();
    delete c.reflection;
    expect(codes(validateCase(c))).toContain('MISSING_REFLECTION');
  });

  it('requires a historical reveal', () => {
    const c = baseCase();
    delete c.historicalReveal;
    expect(codes(validateCase(c))).toContain('MISSING_REVEAL');
  });

  it('catches a reveal beat pointing at a node that does not exist', () => {
    const c = baseCase();
    c.historicalReveal!.beats[0].nodeId = 'ghost';
    expect(codes(validateCase(c))).toContain('UNKNOWN_REVEAL_NODE');
  });

  it('requires a simulated beat to say so in its own copy (§9)', () => {
    const c = baseCase();
    // Strip the label from both fields — either one carrying it is enough.
    c.historicalReveal!.beats[1].headline = 'The final family update';
    c.historicalReveal!.beats[1].whatHappened = 'Someone sent a final update to their family.';
    expect(codes(validateCase(c))).toContain('UNLABELED_SIMULATED_BEAT');

    // Labelling it in either field satisfies the rule.
    c.historicalReveal!.beats[1].headline = 'A reconstructed exercise';
    expect(codes(validateCase(c))).not.toContain('UNLABELED_SIMULATED_BEAT');
  });

  it('warns when a decision moment has no reveal beat', () => {
    const c = baseCase();
    c.historicalReveal!.beats = [c.historicalReveal!.beats[0]];
    const result = validateCase(c);
    expect(result.ok).toBe(true);
    expect(result.warnings.map((w) => w.code)).toContain('NODE_WITHOUT_REVEAL');
  });

  it('warns — but does not fail — on orphan evidence and untagged nodes', () => {
    const c = baseCase();
    c.nodes[0].evidenceId = undefined;
    c.nodes[1].decisions.forEach((d) => { d.signals = []; });
    const result = validateCase(c);
    expect(result.ok).toBe(true);
    const warnings = result.warnings.map((w) => w.code);
    expect(warnings).toContain('ORPHAN_EVIDENCE');
    expect(warnings).toContain('UNTAGGED_NODE');
  });
});
