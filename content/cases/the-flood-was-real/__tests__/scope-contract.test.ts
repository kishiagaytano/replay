import { describe, it, expect } from 'vitest';
import { case001 } from '../case';
import { getEvidenceExplorerEntries } from '../evidence';
import { LEARNING_SIGNALS } from '@/lib/schema/case.schema';
import { buildEvidenceIndex } from '@/lib/engine/evidence-index';

/**
 * The MVP Scope Contract (§15) and Seven-Node Evidence Matrix (§9) expressed as
 * executable checks. If a change here fails, the change is out of scope — fix
 * the content, or revise and re-sign the Product Definition.
 */
describe('Case 001 — MVP scope contract (§15)', () => {
  it('has seven decision moments plus the hook node', () => {
    // §9 defines nodes 1-7; tino-00 is the hook that opens the simulation.
    expect(case001.nodes).toHaveLength(8);
    const matrixNodes = case001.nodes.filter((n) => n.id !== 'tino-00');
    expect(matrixNodes).toHaveLength(7);
  });

  it('offers 2-4 options at every decision moment (§8)', () => {
    for (const node of case001.nodes) {
      expect(node.decisions.length).toBeGreaterThanOrEqual(2);
      expect(node.decisions.length).toBeLessThanOrEqual(4);
    }
  });

  it('has at least six evidence entries', () => {
    expect(case001.evidence.length).toBeGreaterThanOrEqual(6);
  });

  it('has exactly three behavioural profiles', () => {
    expect(case001.reflection?.profiles).toHaveLength(3);
    expect(case001.reflection?.profiles.map((p) => p.id).sort()).toEqual([
      'emotional',
      'responsible',
      'skeptical',
    ]);
  });

  it('has exactly one toolkit card', () => {
    expect(case001.toolkit).toHaveLength(1);
  });

  it('declares both competition tracks and the primary MIL competency (§17)', () => {
    expect(case001.track.sort()).toEqual(['ai-mil', 'mil-education']);
    expect(case001.competency).toBe('critical-evaluation');
  });
});

describe('Case 001 — learning signals (§12)', () => {
  it('tags every decision with a signals array', () => {
    for (const node of case001.nodes) {
      for (const decision of node.decisions) {
        expect(Array.isArray(decision.signals)).toBe(true);
      }
    }
  });

  it('offers every one of the six §12 checks somewhere in the case', () => {
    const offered = new Set(
      case001.nodes.flatMap((n) => n.decisions.flatMap((d) => d.signals)),
    );
    for (const signal of LEARNING_SIGNALS) {
      expect(offered.has(signal)).toBe(true);
    }
  });

  it('gives at least one option per node that demonstrates a check', () => {
    for (const node of case001.nodes) {
      expect(node.decisions.some((d) => d.signals.length > 0)).toBe(true);
    }
  });
});

describe('Case 001 — evidence linkage (§13)', () => {
  it('links every evidence item to the node where the player meets it', () => {
    const index = buildEvidenceIndex(case001);
    const linked = new Set([...index.values()].flat().map((e) => e.id));
    for (const item of case001.evidence) {
      expect(linked.has(item.id)).toBe(true);
    }
  });

  it('shows the text the player actually saw, not a truncated claim', () => {
    for (const entry of getEvidenceExplorerEntries()) {
      expect(entry.playerEncountered.endsWith('...')).toBe(false);
      expect(entry.playerEncountered.length).toBeGreaterThan(0);
    }
  });

  it('keeps media authenticity and claim accuracy as separate fields', () => {
    for (const entry of getEvidenceExplorerEntries()) {
      expect(entry).toHaveProperty('mediaStatus');
      expect(entry).toHaveProperty('claimAccuracy');
    }
    // The teaching point only holds if the case contains a synthetic image
    // whose underlying event was real.
    const synthetic = case001.evidence.filter((e) => e.mediaStatus === 'synthetic');
    expect(synthetic.length).toBeGreaterThan(0);
  });

  it('cites at least one source for every evidence item (§19)', () => {
    for (const item of case001.evidence) {
      expect(item.citations.length).toBeGreaterThanOrEqual(1);
      for (const citation of item.citations) {
        expect(citation.publisher).toBeTruthy();
        expect(citation.date).toBeTruthy();
      }
    }
  });
});
