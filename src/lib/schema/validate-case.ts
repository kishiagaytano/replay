import { caseSchema, type Case } from './case.schema';

/**
 * Case validation — the contract between authored content and the engine.
 *
 * Zod checks the *shape* of a case. This module checks everything a shape
 * cannot express: that the decision graph is connected, that every reference
 * resolves, and that the case honours the structural rules locked in the
 * Product Definition (§8 decision counts, §11 profile set, §15 MVP size).
 *
 * A case that passes `validateCase` cannot soft-lock the simulation.
 */

export type CaseIssueCode =
  // shape
  | 'SCHEMA'
  // graph
  | 'ENTRY_NOT_FOUND'
  | 'DUPLICATE_NODE_ID'
  | 'DUPLICATE_DECISION_ID'
  | 'UNKNOWN_NEXT'
  | 'UNREACHABLE_NODE'
  | 'NO_TERMINAL_PATH'
  // references
  | 'UNKNOWN_EVIDENCE_REF'
  | 'DUPLICATE_EVIDENCE_ID'
  | 'ORPHAN_EVIDENCE'
  // product-definition rules
  | 'DECISION_COUNT'
  | 'PROFILE_MISMATCH'
  | 'MISSING_REFLECTION'
  | 'UNTAGGED_NODE'
  // historical reveal
  | 'MISSING_REVEAL'
  | 'UNKNOWN_REVEAL_NODE'
  | 'NODE_WITHOUT_REVEAL'
  | 'UNLABELED_SIMULATED_BEAT';

export interface CaseValidationIssue {
  level: 'error' | 'warning';
  code: CaseIssueCode;
  message: string;
  nodeId?: string;
  decisionId?: string;
}

export interface CaseValidationResult {
  ok: boolean;
  /** Present only when the shape parsed; may still carry graph errors. */
  case?: Case;
  issues: CaseValidationIssue[];
  errors: CaseValidationIssue[];
  warnings: CaseValidationIssue[];
}

/** The three profile IDs the scorer can emit (§11). */
export const REQUIRED_PROFILE_IDS = ['responsible', 'skeptical', 'emotional'] as const;

/** §8: "Each node presents only the 2–4 choices that make sense in that situation." */
const MIN_DECISIONS = 2;
const MAX_DECISIONS = 4;

export function validateCase(data: unknown): CaseValidationResult {
  const issues: CaseValidationIssue[] = [];

  // ── Pass 1: shape ──
  const parsed = caseSchema.safeParse(data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      issues.push({
        level: 'error',
        code: 'SCHEMA',
        message: `${issue.path.join('.') || '(root)'}: ${issue.message}`,
      });
    }
    return finalise(issues, undefined);
  }

  const caseData = parsed.data;

  // ── Pass 2: graph and references ──
  const nodeIds = new Set<string>();
  for (const node of caseData.nodes) {
    if (nodeIds.has(node.id)) {
      issues.push({
        level: 'error',
        code: 'DUPLICATE_NODE_ID',
        message: `Node id "${node.id}" is used more than once.`,
        nodeId: node.id,
      });
    }
    nodeIds.add(node.id);
  }

  const evidenceIds = new Set<string>();
  for (const item of caseData.evidence) {
    if (evidenceIds.has(item.id)) {
      issues.push({
        level: 'error',
        code: 'DUPLICATE_EVIDENCE_ID',
        message: `Evidence id "${item.id}" is used more than once.`,
      });
    }
    evidenceIds.add(item.id);
  }

  if (!nodeIds.has(caseData.entryNodeId)) {
    issues.push({
      level: 'error',
      code: 'ENTRY_NOT_FOUND',
      message: `entryNodeId "${caseData.entryNodeId}" does not match any node.`,
    });
  }

  const referencedEvidence = new Set<string>();

  for (const node of caseData.nodes) {
    // Decision count (§8)
    if (node.decisions.length < MIN_DECISIONS || node.decisions.length > MAX_DECISIONS) {
      issues.push({
        level: 'error',
        code: 'DECISION_COUNT',
        message: `Node "${node.id}" has ${node.decisions.length} decisions; the Product Definition (§8) requires ${MIN_DECISIONS}–${MAX_DECISIONS}.`,
        nodeId: node.id,
      });
    }

    // Node-level evidence reference
    if (node.evidenceId) {
      referencedEvidence.add(node.evidenceId);
      if (!evidenceIds.has(node.evidenceId)) {
        issues.push({
          level: 'error',
          code: 'UNKNOWN_EVIDENCE_REF',
          message: `Node "${node.id}" references evidence "${node.evidenceId}", which does not exist.`,
          nodeId: node.id,
        });
      }
    }

    const decisionIds = new Set<string>();
    let nodeHasSignals = false;

    for (const decision of node.decisions) {
      if (decisionIds.has(decision.id)) {
        issues.push({
          level: 'error',
          code: 'DUPLICATE_DECISION_ID',
          message: `Node "${node.id}" uses decision id "${decision.id}" more than once.`,
          nodeId: node.id,
          decisionId: decision.id,
        });
      }
      decisionIds.add(decision.id);

      if (decision.next !== 'END' && !nodeIds.has(decision.next)) {
        issues.push({
          level: 'error',
          code: 'UNKNOWN_NEXT',
          message: `Decision "${decision.id}" on node "${node.id}" points to "${decision.next}", which is neither a node id nor "END".`,
          nodeId: node.id,
          decisionId: decision.id,
        });
      }

      if (decision.evidenceId) {
        referencedEvidence.add(decision.evidenceId);
        if (!evidenceIds.has(decision.evidenceId)) {
          issues.push({
            level: 'error',
            code: 'UNKNOWN_EVIDENCE_REF',
            message: `Decision "${decision.id}" on node "${node.id}" references evidence "${decision.evidenceId}", which does not exist.`,
            nodeId: node.id,
            decisionId: decision.id,
          });
        }
      }

      if (decision.signals.length > 0) nodeHasSignals = true;
    }

    // A node where no option demonstrates any §12 check contributes nothing to
    // the reflection. Usually a content oversight rather than a hard error.
    if (!nodeHasSignals) {
      issues.push({
        level: 'warning',
        code: 'UNTAGGED_NODE',
        message: `No decision on node "${node.id}" is tagged with a learning signal, so this moment cannot inform the reflection (§12).`,
        nodeId: node.id,
      });
    }
  }

  // Reachability from the entry node
  if (nodeIds.has(caseData.entryNodeId)) {
    const byId = new Map(caseData.nodes.map((n) => [n.id, n]));
    const reached = new Set<string>([caseData.entryNodeId]);
    const queue = [caseData.entryNodeId];
    let reachesEnd = false;

    while (queue.length > 0) {
      const current = byId.get(queue.shift()!);
      if (!current) continue;
      for (const decision of current.decisions) {
        if (decision.next === 'END') {
          reachesEnd = true;
          continue;
        }
        if (byId.has(decision.next) && !reached.has(decision.next)) {
          reached.add(decision.next);
          queue.push(decision.next);
        }
      }
    }

    for (const node of caseData.nodes) {
      if (!reached.has(node.id)) {
        issues.push({
          level: 'error',
          code: 'UNREACHABLE_NODE',
          message: `Node "${node.id}" cannot be reached from the entry node.`,
          nodeId: node.id,
        });
      }
    }

    if (!reachesEnd) {
      issues.push({
        level: 'error',
        code: 'NO_TERMINAL_PATH',
        message: 'No decision path reaches "END"; the simulation can never complete.',
      });
    }
  }

  // Evidence that no node or decision surfaces cannot appear in the Explorer
  // as something "the player encountered" (§13).
  for (const item of caseData.evidence) {
    if (!referencedEvidence.has(item.id)) {
      issues.push({
        level: 'warning',
        code: 'ORPHAN_EVIDENCE',
        message: `Evidence "${item.id}" is not referenced by any node or decision.`,
      });
    }
  }

  // Reflection profiles must cover every profile the scorer can emit (§11).
  if (!caseData.reflection) {
    issues.push({
      level: 'error',
      code: 'MISSING_REFLECTION',
      message: 'The case has no reflection block, so no behavioural profile can be shown (§12, §15).',
    });
  } else {
    const profileIds = new Set(caseData.reflection.profiles.map((p) => p.id));
    for (const required of REQUIRED_PROFILE_IDS) {
      if (!profileIds.has(required)) {
        issues.push({
          level: 'error',
          code: 'PROFILE_MISMATCH',
          message: `Reflection is missing the "${required}" profile, which the scorer can return.`,
        });
      }
    }
  }

  // The historical reveal is a required MVP element (§8 step 6, §15).
  if (!caseData.historicalReveal) {
    issues.push({
      level: 'error',
      code: 'MISSING_REVEAL',
      message: 'The case has no historicalReveal, so the player\'s path never collapses into the documented timeline (§8 step 6, §15).',
    });
  } else {
    const revealed = new Set<string>();

    for (const beat of caseData.historicalReveal.beats) {
      if (beat.nodeId) {
        revealed.add(beat.nodeId);
        if (!nodeIds.has(beat.nodeId)) {
          issues.push({
            level: 'error',
            code: 'UNKNOWN_REVEAL_NODE',
            message: `Reveal beat "${beat.headline}" references node "${beat.nodeId}", which does not exist.`,
            nodeId: beat.nodeId,
          });
        }
      }

      // §9: a reconstructed exercise must never read as something a real
      // person did. Requiring the label in the copy keeps that guarantee
      // even if a future UI stops rendering the `simulated` flag.
      if (beat.simulated && !/simulat|reconstruct|exercise/i.test(beat.whatHappened + beat.headline)) {
        issues.push({
          level: 'error',
          code: 'UNLABELED_SIMULATED_BEAT',
          message: `Reveal beat "${beat.headline}" is marked simulated but its text does not say so (§9 requires the label).`,
        });
      }
    }

    // Every decision moment the player lived through should have a counterpart
    // in the reveal, or the collapse into the real timeline has a hole in it.
    for (const node of caseData.nodes) {
      if (node.id !== caseData.entryNodeId && !revealed.has(node.id)) {
        issues.push({
          level: 'warning',
          code: 'NODE_WITHOUT_REVEAL',
          message: `Node "${node.id}" has no matching reveal beat, so the player never learns what actually happened at that moment.`,
          nodeId: node.id,
        });
      }
    }
  }

  return finalise(issues, caseData);
}

function finalise(issues: CaseValidationIssue[], caseData: Case | undefined): CaseValidationResult {
  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');
  return { ok: errors.length === 0, case: caseData, issues, errors, warnings };
}

/** Human-readable report, used by the CLI validator and dev-mode registry checks. */
export function formatValidationIssues(issues: CaseValidationIssue[]): string {
  if (issues.length === 0) return 'No issues.';
  return issues
    .map((i) => {
      const where = [i.nodeId, i.decisionId].filter(Boolean).join(' › ');
      return `  [${i.level.toUpperCase()}] ${i.code}${where ? ` (${where})` : ''}: ${i.message}`;
    })
    .join('\n');
}

/** Throws on any error. Use at authoring time, never in a render path. */
export function assertValidCase(data: unknown, label = 'case'): Case {
  const result = validateCase(data);
  if (!result.ok) {
    throw new Error(`Invalid ${label}:\n${formatValidationIssues(result.errors)}`);
  }
  return result.case!;
}
