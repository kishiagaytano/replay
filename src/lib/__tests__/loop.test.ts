import { describe, it, expect } from 'vitest';
import { LOOP, nextStep, previousStep, stepIndex } from '../loop';
import { allCases } from '../registry';

/**
 * D8 integration checks: the loop is a single ordered path (§8), and the case
 * content actually supports every screen that path visits.
 */

describe('case loop', () => {
  it('matches the §8 sequence', () => {
    expect(LOOP.map((s) => s.key)).toEqual([
      'intro',
      'play',
      'reveal',
      'evidence',
      'debrief',
    ]);
  });

  it('links each step to the next, ending at the debrief', () => {
    expect(nextStep('intro')?.key).toBe('play');
    expect(nextStep('play')?.key).toBe('reveal');
    expect(nextStep('reveal')?.key).toBe('evidence');
    expect(nextStep('evidence')?.key).toBe('debrief');
    expect(nextStep('debrief')).toBeNull();
  });

  it('links each step back to the previous, starting at the intro', () => {
    expect(previousStep('intro')).toBeNull();
    expect(previousStep('debrief')?.key).toBe('evidence');
  });

  it('builds routes under the case id', () => {
    for (const step of LOOP) {
      const href = step.href('the-flood-was-real');
      expect(href.startsWith('/cases/the-flood-was-real')).toBe(true);
    }
    expect(LOOP[0].href('x')).toBe('/cases/x');
    expect(nextStep('intro')!.href('x')).toBe('/cases/x/play');
  });

  it('has a unique key and a non-empty label for every step', () => {
    const keys = LOOP.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const step of LOOP) {
      expect(step.label.length).toBeGreaterThan(0);
      expect(step.blurb.length).toBeGreaterThan(0);
      expect(stepIndex(step.key)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe.each(allCases())('$id — supports every loop screen', ({ case: caseData }) => {
  it('has the content the intro screen renders', () => {
    expect(caseData.title).toBeTruthy();
    expect(caseData.historicalContext.summary).toBeTruthy();
    expect(caseData.historicalContext.dateRange).toBeTruthy();
  });

  it('has a historical reveal with cited beats', () => {
    const reveal = caseData.historicalReveal;
    expect(reveal).toBeDefined();
    expect(reveal!.beats.length).toBeGreaterThan(0);
    for (const beat of reveal!.beats) {
      expect(beat.citations.length).toBeGreaterThanOrEqual(1);
      for (const citation of beat.citations) {
        expect(citation.publisher).toBeTruthy();
        expect(citation.date).toBeTruthy();
      }
    }
  });

  it('covers every decision moment after the hook with a reveal beat', () => {
    const covered = new Set(
      caseData.historicalReveal!.beats.map((b) => b.nodeId).filter(Boolean),
    );
    for (const node of caseData.nodes) {
      if (node.id === caseData.entryNodeId) continue;
      expect(covered.has(node.id)).toBe(true);
    }
  });

  it('labels every simulated beat in its own copy (§9)', () => {
    for (const beat of caseData.historicalReveal!.beats) {
      if (!beat.simulated) continue;
      expect(`${beat.headline} ${beat.whatHappened}`).toMatch(/simulat|reconstruct|exercise/i);
    }
  });

  it('cites only sources already in the case register (§18, fabrication guard §19)', () => {
    // Matching on URL rather than publisher name: the URL is the identity of a
    // source, and this is what stops a reveal beat from introducing a document
    // the team never vetted.
    const registered = new Set(
      caseData.historicalContext.sources.map((s) => s.url).filter(Boolean),
    );

    for (const beat of caseData.historicalReveal!.beats) {
      for (const citation of beat.citations) {
        expect(citation.url).toBeTruthy();
        expect(registered.has(citation.url)).toBe(true);
      }
    }
  });

  it('has a toolkit card for the final loop screen', () => {
    expect(caseData.toolkit?.length ?? 0).toBeGreaterThanOrEqual(1);
  });
});
