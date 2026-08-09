import type { Case, EvidenceItem } from '@/lib/schema/case.schema';
import type { EvidenceExplorerEntry } from '@/lib/schema/evidence.schema';
import type { DecisionRecord } from './simulation-engine';

/**
 * Evidence index — resolves which evidence item the player encountered at
 * which decision moment (Product Definition §13).
 *
 * §13 requires the Explorer to show "what the player encountered" alongside
 * the claim, the media status, and the claim accuracy. Media authenticity and
 * claim accuracy are deliberately kept as two separate fields throughout; the
 * required teaching point is that they are separate questions.
 */

/** nodeId → the evidence items that node surfaces. */
export function buildEvidenceIndex(caseData: Case): Map<string, EvidenceItem[]> {
  const byId = new Map(caseData.evidence.map((e) => [e.id, e]));
  const index = new Map<string, EvidenceItem[]>();

  for (const node of caseData.nodes) {
    const ids = new Set<string>();
    if (node.evidenceId) ids.add(node.evidenceId);
    for (const decision of node.decisions) {
      if (decision.evidenceId) ids.add(decision.evidenceId);
    }

    const items = [...ids].map((id) => byId.get(id)).filter((e): e is EvidenceItem => Boolean(e));
    if (items.length > 0) index.set(node.id, items);
  }

  return index;
}

/** Reverse lookup: evidenceId → the node where the player met it. */
export function buildNodeLookup(caseData: Case): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const [nodeId, items] of buildEvidenceIndex(caseData)) {
    for (const item of items) {
      if (!lookup.has(item.id)) lookup.set(item.id, nodeId);
    }
  }
  return lookup;
}

/**
 * The text the player actually saw at a node — the incoming message if there
 * is one, otherwise the narration or the overlay text. Never a truncated
 * restatement of the claim.
 */
export function encounterTextFor(caseData: Case, nodeId: string): string | undefined {
  const node = caseData.nodes.find((n) => n.id === nodeId);
  if (!node) return undefined;
  return node.incoming?.[0]?.text ?? node.text ?? node.overlay?.text;
}

/**
 * Build Evidence Explorer entries for a whole case.
 * Entries are ordered by the node the player met them at.
 */
export function buildEvidenceEntries(
  caseData: Case,
  options: { verificationMethodFor?: (item: EvidenceItem) => string | undefined; teachingPointFor?: (item: EvidenceItem) => string | undefined } = {},
): EvidenceExplorerEntry[] {
  const nodeLookup = buildNodeLookup(caseData);
  const nodeOrder = new Map(caseData.nodes.map((n, i) => [n.id, i]));

  return caseData.evidence
    .map((item) => {
      const nodeId = nodeLookup.get(item.id);
      return {
        evidenceId: item.id,
        nodeId: nodeId ?? item.id,
        playerEncountered:
          (nodeId ? encounterTextFor(caseData, nodeId) : undefined) ?? item.claim,
        channel: item.channel,
        claim: item.claim,
        note: item.note,
        mediaStatus: item.mediaStatus,
        claimAccuracy: item.claimAccuracy,
        verificationMethod: options.verificationMethodFor?.(item),
        citations: item.citations,
        teachingPoint: options.teachingPointFor?.(item),
      } satisfies EvidenceExplorerEntry;
    })
    .sort((a, b) => (nodeOrder.get(a.nodeId) ?? 999) - (nodeOrder.get(b.nodeId) ?? 999));
}

/**
 * Only the evidence the player actually reached on their run, in the order
 * they met it. Every node is visited in the current linear case, but this
 * stays correct if a future case branches.
 */
export function getEncounteredEvidence(
  caseData: Case,
  history: ReadonlyArray<Pick<DecisionRecord, 'nodeId'>>,
  options?: Parameters<typeof buildEvidenceEntries>[1],
): EvidenceExplorerEntry[] {
  const visited = new Set(history.map((h) => h.nodeId));
  return buildEvidenceEntries(caseData, options).filter((entry) => visited.has(entry.nodeId));
}
