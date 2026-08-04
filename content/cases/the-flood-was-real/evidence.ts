/**
 * Evidence Explorer entries for Case 001.
 * Each entry maps a player-encountered message to its source, verification status, and teaching point.
 */
import type { EvidenceItem } from '@/lib/schema/case.schema';
import type { EvidenceExplorerEntry } from '@/lib/schema/evidence.schema';
import { buildEvidenceEntries, getEncounteredEvidence } from '@/lib/engine/evidence-index';
import type { DecisionRecord } from '@/lib/engine/simulation-engine';
import { case001 } from './case';

const options = {
  verificationMethodFor: (item: EvidenceItem) => getVerificationMethod(item.mediaStatus),
  teachingPointFor: (item: EvidenceItem) => getTeachingPoint(item.id),
};

/**
 * All evidence for the case, ordered by the node where the player meets it.
 * `playerEncountered` is the actual node text the player saw, resolved through
 * the node ⇄ evidence links in the case content — not a truncated claim.
 */
export function getEvidenceExplorerEntries(): EvidenceExplorerEntry[] {
  return buildEvidenceEntries(case001, options);
}

/** Only the evidence reached on a specific run. */
export function getEncounteredEvidenceEntries(
  history: ReadonlyArray<Pick<DecisionRecord, 'nodeId'>>,
): EvidenceExplorerEntry[] {
  return getEncounteredEvidence(case001, history, options);
}

function getVerificationMethod(mediaStatus: string): string | undefined {
  switch (mediaStatus) {
    case 'authentic':
      return 'Confirmed by official sources / news reporting';
    case 'synthetic':
      return 'Provenance and disclosure checks by a fact-checking organisation (an AI-detection score alone is not proof)';
    case 'altered':
      return 'Reverse image search + source verification';
    case 'miscaptioned':
      return 'Cross-referenced date/location with official records';
    case 'not-yet-verifiable':
      return 'No authoritative source available at the time; pending verification';
    default:
      return undefined;
  }
}

function getTeachingPoint(evidenceId: string): string | undefined {
  switch (evidenceId) {
    case 'E4':
    case 'E5':
      return 'The authenticity of an image and the accuracy of its caption are separate questions. ' +
        'A real disaster does not mean every image is real. An AI-generated image can refer to a real event. ' +
        'Always verify the source before sharing.';
    default:
      return undefined;
  }
}
