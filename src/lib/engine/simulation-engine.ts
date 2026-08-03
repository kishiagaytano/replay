import type { Case, SimulationNode, DecisionEffects, ProfileEffects } from '@/lib/schema/case.schema';

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
}

/**
 * Pure state machine for rePlay case simulations.
 *
 * Design principles:
 * - Stateless from the outside — all state is returned via methods.
 * - Decisions are the only way to mutate state.
 * - No side effects — engine just computes state transitions.
 */
export class SimulationEngine {
  private readonly caseData: Case;
  private currentNodeId: string;
  private state: SimulationState;
  private history: DecisionRecord[];
  private completed: boolean;

  constructor(caseData: Case) {
    this.caseData = caseData;
    this.currentNodeId = caseData.entryNodeId;
    this.state = { communityTrust: 50, informationIntegrity: 50, publicSafety: 50 };
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

  /** Returns a read-only copy of the full decision history. */
  getHistory(): DecisionRecord[] {
    return [...this.history];
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
    this.state.communityTrust = clamp(this.state.communityTrust + (decision.effects.communityTrust ?? 0));
    this.state.informationIntegrity = clamp(this.state.informationIntegrity + (decision.effects.informationIntegrity ?? 0));
    this.state.publicSafety = clamp(this.state.publicSafety + (decision.effects.publicSafety ?? 0));

    // Record history
    this.history.push({
      nodeId: node.id,
      decisionId: decision.id,
      decisionLabel: decision.label,
      effects: { ...decision.effects },
      profileEffects: { ...decision.profileEffects },
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
    this.state = { communityTrust: 50, informationIntegrity: 50, publicSafety: 50 };
    this.history = [];
    this.completed = false;
  }

  /**
   * Return the computed final personality profile from each decision's
   * behavioural signal and its three learning-indicator effects.
   * Called after the case is complete.
   */
  getProfile() {
    if (!this.completed || !this.caseData.reflection) return null;

    const scores: Record<string, number> = {
      responsible: 0,
      skeptical: 0,
      emotional: 0,
    };

    for (const record of this.history) {
      scores.responsible += record.profileEffects.responsible;
      scores.skeptical += record.profileEffects.skeptical;
      scores.emotional += record.profileEffects.emotional;

      const { communityTrust, informationIntegrity, publicSafety } = record.effects;

      // A balanced positive contribution supports responsible communication.
      scores.responsible += (
        Math.max(0, communityTrust) +
        Math.max(0, informationIntegrity) +
        Math.max(0, publicSafety)
      ) / 30;

      // Careful verification paired with dangerous delay is a skeptical pattern.
      scores.skeptical += (
        Math.max(0, informationIntegrity) + Math.max(0, -publicSafety)
      ) / 25;

      // Eroding trust or information quality signals an urgency-driven response.
      scores.emotional += (
        Math.max(0, -communityTrust) + Math.max(0, -informationIntegrity)
      ) / 20;
    }

    const profileId = Object.entries(scores).reduce(
      (bestId, [id, score]) => score > scores[bestId] ? id : bestId,
      'responsible',
    );

    return this.caseData.reflection.profiles.find((p) => p.id === profileId) ?? null;
  }
}

/** Clamp a meter value to 0–100. */
function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}
