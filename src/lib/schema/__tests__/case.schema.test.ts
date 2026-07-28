import { describe, it, expect } from 'vitest';
import { caseSchema, decisionSchema, evidenceItemSchema, sourceRefSchema } from '../case.schema';

describe('sourceRefSchema', () => {
  it('accepts a valid source reference', () => {
    const source = {
      publisher: 'PAGASA',
      title: 'Tropical Cyclone Preliminary Report',
      url: 'https://example.com/report.pdf',
      date: '2025-11-07',
    };
    expect(() => sourceRefSchema.parse(source)).not.toThrow();
  });

  it('rejects a source without publisher', () => {
    expect(() =>
      sourceRefSchema.parse({ title: 'Report', date: '2025-11-07' })
    ).toThrow();
  });
});

describe('evidenceItemSchema', () => {
  it('accepts a valid evidence item', () => {
    const item = {
      id: 'E1',
      channel: 'official-advisory',
      claim: 'Cebu placed on Red Alert',
      mediaStatus: 'authentic',
      claimAccuracy: 'accurate',
      citation: {
        publisher: 'PIA',
        title: 'Red alert status raised over Cebu',
        date: '2025-11-03',
      },
    };
    expect(() => evidenceItemSchema.parse(item)).not.toThrow();
  });
});

describe('decisionSchema', () => {
  it('accepts a valid decision with effects', () => {
    const decision = {
      id: 'verify',
      label: 'VERIFY',
      effects: { communityTrust: 10, informationIntegrity: 8, publicSafety: 5 },
      next: 'node-02',
    };
    expect(() => decisionSchema.parse(decision)).not.toThrow();
  });

  it('defaults missing effects to 0', () => {
    const decision = {
      id: 'ignore',
      label: 'IGNORE',
      effects: {},
      next: 'node-02',
    };
    const parsed = decisionSchema.parse(decision);
    expect(parsed.effects.communityTrust).toBe(0);
    expect(parsed.effects.informationIntegrity).toBe(0);
    expect(parsed.effects.publicSafety).toBe(0);
  });
});

describe('caseSchema', () => {
  it('accepts a minimal valid case', () => {
    const minimalCase = {
      id: 'the-flood-was-real',
      code: 'Case 001',
      title: 'The Flood Was Real',
      track: ['ai-mil'],
      competency: 'critical-evaluation',
      historicalContext: {
        realEvent: 'Typhoon Tino (Kalmaegi), Cebu, 2025',
        summary: 'A typhoon caused severe flooding while AI-generated images circulated.',
        dateRange: 'Nov 3-7, 2025',
        sources: [{
          publisher: 'PAGASA',
          title: 'Preliminary Report',
          date: '2025-11-07',
        }],
      },
      nodes: [{
        id: 'node-01',
        speaker: 'Lola',
        sprite: 'lola_worried',
        background: 'bg_bedroom_night',
        text: 'Anak, may Red Alert daw sa Cebu.',
        decisions: [{
          id: 'verify',
          label: 'VERIFY',
          effects: { communityTrust: 5 },
          next: 'node-02',
        }],
      }],
      entryNodeId: 'node-01',
      evidence: [{
        id: 'E1',
        channel: 'official-advisory',
        claim: 'Red Alert in Cebu',
        mediaStatus: 'authentic',
        claimAccuracy: 'accurate',
        citation: {
          publisher: 'PIA',
          title: 'Red alert status',
          date: '2025-11-03',
        },
      }],
    };
    expect(() => caseSchema.parse(minimalCase)).not.toThrow();
  });

  it('rejects a case without evidence', () => {
    const badCase = {
      id: 'test',
      code: 'T1',
      title: 'Test',
      track: ['ai-mil'],
      competency: 'critical-evaluation',
      historicalContext: {
        realEvent: 'Test event',
        summary: 'Summary',
        dateRange: '2025',
        sources: [{ publisher: 'Test', title: 'Test', date: '2025' }],
      },
      nodes: [{
        id: 'n1',
        decisions: [{ id: 'd1', label: 'OK', effects: {}, next: 'END' }],
      }],
      entryNodeId: 'n1',
      evidence: [], // Empty evidence array
    };
    expect(() => caseSchema.parse(badCase)).toThrow();
  });
});
