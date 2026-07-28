import { z } from 'zod';

// ── Source Reference ──
export const sourceRefSchema = z.object({
  publisher: z.string().min(1, 'Publisher is required'),
  title: z.string().min(1, 'Title is required'),
  url: z.string().url().optional(),
  date: z.string().min(1, 'Date is required'),
  note: z.string().optional(),
});
export type SourceRef = z.infer<typeof sourceRefSchema>;

// ── Decision Effects (meter deltas) ──
export const decisionEffectsSchema = z.object({
  communityTrust: z.number().int().optional().default(0),
  informationIntegrity: z.number().int().optional().default(0),
  publicSafety: z.number().int().optional().default(0),
  decisionScore: z.number().int().optional(),
});
export type DecisionEffects = z.infer<typeof decisionEffectsSchema>;

// ── Decision ──
export const decisionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  effects: decisionEffectsSchema,
  next: z.string(), // node id or "END"
  evidenceId: z.string().optional(),
});
export type Decision = z.infer<typeof decisionSchema>;

// ── VN Overlay (device UI on top of background) ──
export const vnOverlaySchema = z.object({
  type: z.enum(['notification', 'messenger', 'facebook', 'tiktok']),
  sender: z.string().optional(),
  text: z.string().optional(),
}).optional();
export type VNOverlay = z.infer<typeof vnOverlaySchema>;

// ── VN Choice ──
export const vnChoiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  timerSeconds: z.number().int().positive().optional(),
});
export type VNChoice = z.infer<typeof vnChoiceSchema>;

// ── Simulation Node (engine data + VN presentation data) ──
export const simulationNodeSchema = z.object({
  id: z.string().min(1),
  // VN presentation fields (optional — nodes without these render in default mode)
  speaker: z.string().optional(),
  sprite: z.string().optional(),
  background: z.string().optional(),
  overlay: vnOverlaySchema,
  text: z.string().optional(),
  vnChoices: z.array(vnChoiceSchema).optional(),
  // Engine fields
  incoming: z.array(z.object({
    channel: z.enum(['messenger', 'facebook', 'tiktok', 'official-advisory', 'notification']),
    text: z.string(),
    sender: z.string().optional(),
  })).optional(),
  timerSeconds: z.number().int().positive().optional(),
  decisions: z.array(decisionSchema).min(1, 'Each node must have at least one decision'),
});
export type SimulationNode = z.infer<typeof simulationNodeSchema>;

// ── Evidence Item ──
export const evidenceItemSchema = z.object({
  id: z.string().min(1),
  channel: z.enum(['messenger', 'facebook', 'tiktok', 'official-advisory', 'notification']),
  claim: z.string().min(1, 'Claim text is required'),
  mediaStatus: z.enum(['authentic', 'synthetic', 'altered', 'miscaptioned', 'not-yet-verifiable']),
  claimAccuracy: z.enum(['accurate', 'false', 'misleading', 'unverified-at-the-time']),
  citation: sourceRefSchema,
  note: z.string().optional(),
});
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;

// ── MIL Competency ──
export const milCompetencySchema = z.enum([
  'critical-evaluation',
  'responsible-sharing',
  'source-verification',
  'understanding-synthetic-media',
]);

// ── Historical Context ──
export const historicalContextSchema = z.object({
  realEvent: z.string().min(1),
  summary: z.string().min(1),
  dateRange: z.string().min(1),
  sources: z.array(sourceRefSchema).min(1, 'At least one source is required'),
});
export type HistoricalContext = z.infer<typeof historicalContextSchema>;

// ── Behavioral Profile ──
export const behavioralProfileSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});
export type BehavioralProfile = z.infer<typeof behavioralProfileSchema>;

// ── Reflection Config ──
export const reflectionConfigSchema = z.object({
  profiles: z.array(behavioralProfileSchema).min(1),
});
export type ReflectionConfig = z.infer<typeof reflectionConfigSchema>;

// ── Toolkit Resource ──
export const toolkitResourceSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url().optional(),
  source: z.string().optional(),
});
export type ToolkitResource = z.infer<typeof toolkitResourceSchema>;

// ── Full Case Schema ──
export const caseSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
  hook: z.string().optional(), // One-liner for the pitch video
  track: z.array(z.enum(['ai-mil', 'mil-education'])).min(1),
  competency: milCompetencySchema,
  historicalContext: historicalContextSchema,
  nodes: z.array(simulationNodeSchema).min(1, 'At least one node is required'),
  entryNodeId: z.string().min(1),
  evidence: z.array(evidenceItemSchema).min(1, 'At least one evidence item is required'),
  educatorGuide: z.string().optional(), // Markdown content or file reference
  toolkit: z.array(toolkitResourceSchema).optional().default([]),
  reflection: reflectionConfigSchema.optional(),
  characters: z.record(z.string(), z.object({
    name: z.string(),
    avatar: z.string().optional(),
  })).optional(),
});
export type Case = z.infer<typeof caseSchema>;
