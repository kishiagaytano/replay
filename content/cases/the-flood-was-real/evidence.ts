/**
 * Evidence Explorer entries for Case 001.
 * Each entry maps a player-encountered message to its source, verification status, and teaching point.
 */
import type { EvidenceExplorerEntry } from '@/lib/schema/evidence.schema';
import { case001 } from './case';

/**
 * Build evidence explorer entries from the case's evidence items.
 * In the MVP, we derive these directly from the case data.
 * Future: allow richer per-player-path entries.
 */
export function getEvidenceExplorerEntries(): EvidenceExplorerEntry[] {
  return case001.evidence.map((ev) => ({
    evidenceId: ev.id,
    nodeId: ev.id, // Simplified: mapping evidence to the node it appears in
    playerEncountered: ev.claim.substring(0, 80) + '...',
    claim: ev.claim,
    mediaStatus: ev.mediaStatus,
    claimAccuracy: ev.claimAccuracy,
    verificationMethod: getVerificationMethod(ev.mediaStatus),
    publisher: ev.citation.publisher,
    publishDate: ev.citation.date,
    citation: ev.citation,
    teachingPoint: getTeachingPoint(ev.id),
  }));
}

function getVerificationMethod(mediaStatus: string): string | undefined {
  switch (mediaStatus) {
    case 'authentic':
      return 'Confirmed by official sources / news reporting';
    case 'synthetic':
      return 'AI detection markers (watermark, disclosure check) + fact-check investigation';
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
