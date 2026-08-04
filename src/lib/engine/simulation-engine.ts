import type {
  Case,
  SimulationNode,
  DecisionEffects,
  ProfileEffects,
  BehavioralProfile,
  LearningSignal,
} from '@/lib/schema/case.schema';
import {
  buildReflection,
  countSignalOpportunities,
  countSignalsDemonstrated,
  type ReflectionLine,
  type SignalTally,
} from './reflection';

/**
 * Tracks the three meters tracked throughout a simulation.
 * All start at 50 (neutral midpoint).
 */
export interface SimulationState {
  communityTrust: number;
  informationIntegrity: number;
  publicSafety: number;
}

/**
 * One entry in the player's decision history.
 */
export interface DecisionRecord {
  nodeId: string;
  decisionId: string;
  decisionLabel: string;
  effects: DecisionEffects;
  profileEffects: ProfileEffects;
  /** The §12 checks this option demonstrated. */
  signals: LearningSignal[];
  /** Meter values *after* this decision was applied. */
  metersAfter: SimulationState;
}

/**
 * Everything the debrief needs, in a plain serializable object.
 * This is the contract the frontend renders against.
 */
export interface RunSummary {
  caseId: string;
  caseTitle: string;
  completed: boolean;
  meters: SimulationState;
  decisions: DecisionRecord[];
  signalsDemonstrated: SignalTally;
  signalOpportunities: SignalTally;
  profile: BehavioralProfile | null;
  /** Raw profile scores, exposed so the result is explainable rather than opaque. */
  profileScores: Record<string, number>;
  reflection: ReflectionLine[];
}

/**
 * On an exact tie, profiles are chosen in this fixed, documented order.
 * Least-punitive description first, per §11 ("descriptive, not shaming").
 */
const PROFILE_PRIORITY = ['responsible', 'skeptical', 'emotional'] as const;

const STARTING_METERS: SimulationState = {
  communityTrust: 50,
  informationIntegrity: 50,
  publicSafety: 50,
};

/**
 * Pure state machine for rePlay case simulations.
 *
 * Design principles:
 * - Stateless from the outside — all state is returned via methods.
 * - Decisions are the only way to mutate state.
 * - No side effects — engine just computes state transitions.
 * - No framework imports: this file depends on types and pure helpers only.
 */
export class SimulationEngine {
  private readonly caseData: Case;
  private readonly opportunities: SignalTally;
  private currentNodeId: string;
  private state: SimulationState;
  private history: DecisionRecord[];
  private completed: boolean;

  constructor(caseData: Case) {
    this.caseData = caseData;
    this.opportunities = countSignalOpportunities(caseData);
    this.currentNodeId = caseData.entryNodeId;
    this.state = { ...STARTING_METERS };
    this.history = [];
    this.completed = false;
  }

  // ── Accessors ──

  /** Returns the current node object, or null if at END / case is complete. */
  getCurrentNode(): SimulationNode | null {
    if (this.completed) return null;
    return this.caseData.nodes.find((n) => n.id === this.currentNodeId) ?? null;
  }

  /** Returns a read-only snapshot of the current meter state. */
  getState(): SimulationState {
    return { ...this.state };
  }

  /** Returns a deep copy of the full decision history — callers cannot mutate engine state. */
  getHistory(): DecisionRecord[] {
    return this.history.map((r) => ({
      ...r,
      effects: { ...r.effects },
      profileEffects: { ...r.profileEffects },
      signals: [...r.signals],
      metersAfter: { ...r.metersAfter },
    }));
  }

  /** True after the engine has reached the terminal END state. */
  isComplete(): boolean {
    return this.completed;
  }

  /** Returns the case metadata. */
  getCaseInfo(): Case {
    return this.caseData;
  }

  // ── Actions ──

  /**
   * Execute a decision on the current node.
   * Returns the newly-active node, or null if the case is finished.
   * Throws if the decision ID is invalid for the current node.
   */
  makeDecision(decisionId: string): SimulationNode | null {
    const node = this.getCurrentNode();
    if (!node) throw new Error('No active node — simulation is complete.');

    const decision = node.decisions.find((d) => d.id === decisionId);
    if (!decision) {
      throw new Error(
        `Decision "${decisionId}" not found on node "${node.id}". Available: ${node.decisions.map((d) => d.id).join(', ')}`,
      );
    }

    // Apply effects
    this.state = {
      communityTrust: clamp(this.state.communityTrust + decision.effects.communityTrust),
      informationIntegrity: clamp(this.state.informationIntegrity + decision.effects.informationIntegrity),
      publicSafety: clamp(this.state.publicSafety + decision.effects.publicSafety),
    };

    // Record history
    this.history.push({
      nodeId: node.id,
      decisionId: decision.id,
      decisionLabel: decision.label,
      effects: { ...decision.effects },
      profileEffects: { ...decision.profileEffects },
      signals: [...decision.signals],
      metersAfter: { ...this.state },
    });

    // Advance
    if (decision.next === 'END') {
      this.completed = true;
      return null;
    }

    this.currentNodeId = decision.next;
    return this.getCurrentNode();
  }

  /**
   * Resets the engine to its initial state (same as a fresh constructor call).
   */
  reset(): void {
    this.currentNodeId = this.caseData.entryNodeId;
    this.state = { ...STARTING_METERS };
    this.history = [];
    this.completed = false;
  }

  // ── Scoring ──

  /**
   * Sum the behavioural signal the content author encoded on each decision.
   *
   * Deliberately the *only* input to the profile. An earlier version also
   * derived scores from meter deltas divided by undocumented constants; that
   * double-counted the same authorial intent and made the result impossible to
   * explain. §12 requires scoring to preserve the meanings defined in the
   * Product Definition, so the profile now reads exactly what the author wrote.
   */
  getProfileScores(): Record<string, number> {
    const scores: Record<string, number> = { responsible: 0, skeptical: 0, emotional: 0 };
    for (const record of this.history) {
      scores.responsible += record.profileEffects.responsible;
      scores.skeptical += record.profileEffects.skeptical;
      scores.emotional += record.profileEffects.emotional;
    }
    return scores;
  }

  /**
   * Return the computed behavioural profile.
   * Called after the case is complete; returns null before then.
   */
  getProfile(): BehavioralProfile | null {
    if (!this.completed || !this.caseData.reflection) return null;

    const scores = this.getProfileScores();

    // Highest score wins; exact ties resolve by PROFILE_PRIORITY order.
    let winner: string = PROFILE_PRIORITY[0];
    for (const id of PROFILE_PRIORITY) {
      if (scores[id] > scores[winner]) winner = id;
    }

    return this.caseData.reflection.profiles.find((p) => p.id === winner) ?? null;
  }

  /** Signals the player has demonstrated so far. */
  getSignalsDemonstrated(): SignalTally {
    return countSignalsDemonstrated(this.history);
  }

  /** Signals this case offers across all its decision moments. */
  getSignalOpportunities(): SignalTally {
    return { ...this.opportunities };
  }

  /**
   * The full serializable run summary: meters, history, signal tallies,
   * profile, and the rule-based reflection. This is what the debrief renders.
   */
  getRunSummary(): RunSummary {
    const demonstrated = this.getSignalsDemonstrated();
    return {
      caseId: this.caseData.id,
      caseTitle: this.caseData.title,
      completed: this.completed,
      meters: this.getState(),
      decisions: this.getHistory(),
      signalsDemonstrated: demonstrated,
      signalOpportunities: this.getSignalOpportunities(),
      profile: this.getProfile(),
      profileScores: this.getProfileScores(),
      reflection: buildReflection(demonstrated, this.opportunities),
    };
  }
}

/** Clamp a meter value to 0–100. */
function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}
