import { describe, it, expect } from 'vitest';
import { caseSchema } from '@/lib/schema/case.schema';
import { case001 } from '../case';

describe('Case 001 validation', () => {
  it('validates against the case schema', () => {
    const result = caseSchema.safeParse(case001);
    if (!result.success) {
      console.error('Validation errors:', JSON.stringify(result.error, null, 2));
    }
    expect(result.success).toBe(true);
  });

  it('has the hook plus 7 evidence-matrix nodes', () => {
    expect(case001.nodes).toHaveLength(8);
  });

  it('has at least 6 evidence items', () => {
    expect(case001.evidence.length).toBeGreaterThanOrEqual(6);
  });

  it('has 3 behavioral profiles', () => {
    expect(case001.reflection?.profiles).toHaveLength(3);
  });

  it('all node decisions point to existing nodes or END', () => {
    const nodeIds = new Set(case001.nodes.map((n) => n.id));
    for (const node of case001.nodes) {
      for (const decision of node.decisions) {
        if (decision.next !== 'END') {
          expect(nodeIds.has(decision.next)).toBe(true);
        }
      }
    }
  });

  it('gives every decision complete meter and profile effects', () => {
    for (const node of case001.nodes) {
      expect(node.decisions.length).toBeGreaterThanOrEqual(2);
      expect(node.decisions.length).toBeLessThanOrEqual(4);
      for (const decision of node.decisions) {
        expect(decision.effects).toHaveProperty('communityTrust');
        expect(decision.effects).toHaveProperty('informationIntegrity');
        expect(decision.effects).toHaveProperty('publicSafety');
        expect(decision.profileEffects).toHaveProperty('responsible');
        expect(decision.profileEffects).toHaveProperty('skeptical');
        expect(decision.profileEffects).toHaveProperty('emotional');
      }
    }
  });

  it('entry node exists in the nodes array', () => {
    const nodeIds = case001.nodes.map((n) => n.id);
    expect(nodeIds).toContain(case001.entryNodeId);
  });
});
