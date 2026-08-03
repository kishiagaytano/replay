import { z } from 'zod';
import { sourceRefSchema, evidenceItemSchema } from './case.schema';

// Re-export the evidence item schema with additional evidence-specific types
export { sourceRefSchema, evidenceItemSchema };
export type { SourceRef, EvidenceItem } from './case.schema';

// Evidence explorer entry (what the player sees in the post-game explorer)
export const evidenceExplorerEntrySchema = z.object({
  evidenceId: z.string().min(1),
  nodeId: z.string().min(1),
  playerEncountered: z.string().min(1), // What the player saw
  claim: z.string().min(1),
  mediaStatus: z.enum(['authentic', 'synthetic', 'altered', 'miscaptioned', 'not-yet-verifiable']),
  claimAccuracy: z.enum(['accurate', 'false', 'misleading', 'unverified-at-the-time']),
  verificationMethod: z.string().optional(),
  citations: z.array(sourceRefSchema).min(1),
  teachingPoint: z.string().optional(),
});
export type EvidenceExplorerEntry = z.infer<typeof evidenceExplorerEntrySchema>;

// Teaching point about the separation of image authenticity and claim accuracy
export const TEACHING_POINT =
  'The authenticity of an image and the accuracy of its caption are separate questions. ' +
  'A real photo may carry a false date or location. An AI-generated image may refer to a disaster ' +
  'that genuinely occurred. Visual anomalies may be clues, but provenance, source checking, ' +
  'reverse search, disclosure, and official confirmation are stronger methods than an AI-detection score alone.';
