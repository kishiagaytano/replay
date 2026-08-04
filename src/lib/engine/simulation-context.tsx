'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import {
  SimulationEngine,
  type SimulationState,
  type DecisionRecord,
  type RunSummary,
} from './simulation-engine';
import {
  saveSimulation,
  loadSimulation,
  clearSimulation,
  computeCaseRevision,
} from './persistence';
import type { Case, SimulationNode, BehavioralProfile } from '@/lib/schema/case.schema';

// ── State ──

interface SimulationContextState {
  engine: SimulationEngine | null;
  currentNode: SimulationNode | null;
  meters: SimulationState;
  history: DecisionRecord[];
  completed: boolean;
  profile: BehavioralProfile | null;
  /** Full debrief payload. Null until the engine is initialised. */
  runSummary: RunSummary | null;
  phase: 'loading' | 'playing' | 'completed';
  caseId: string | null;
  caseTitle: string | null;
  caseRevision: string | null;
  decisionIds: string[]; // For persistence replay
}

type Action =
  | { type: 'INIT'; payload: Case }
  | { type: 'SYNC'; engine: SimulationEngine; decisionIds: string[] }
  | { type: 'RESTORE'; payload: { engine: SimulationEngine; caseData: Case; decisionIds: string[] } }
  | { type: 'RESET' };

/** Derive the renderable slice of state from the engine. Single source of truth. */
function snapshot(
  engine: SimulationEngine,
  caseData: Case,
  decisionIds: string[],
): SimulationContextState {
  const runSummary = engine.getRunSummary();
  return {
    engine,
    currentNode: engine.getCurrentNode(),
    meters: runSummary.meters,
    history: runSummary.decisions,
    completed: runSummary.completed,
    profile: runSummary.profile,
    runSummary,
    phase: runSummary.completed ? 'completed' : 'playing',
    caseId: caseData.id,
    caseTitle: caseData.title,
    caseRevision: computeCaseRevision(caseData),
    decisionIds,
  };
}

function reducer(state: SimulationContextState, action: Action): SimulationContextState {
  switch (action.type) {
    case 'INIT': {
      const engine = new SimulationEngine(action.payload);
      return snapshot(engine, action.payload, []);
    }
    case 'RESTORE': {
      const { engine, caseData, decisionIds } = action.payload;
      return snapshot(engine, caseData, decisionIds);
    }
    case 'SYNC': {
      if (!state.engine) return state;
      return snapshot(action.engine, action.engine.getCaseInfo(), action.decisionIds);
    }
    case 'RESET': {
      return { ...initialState };
    }
    default:
      return state;
  }
}

const initialState: SimulationContextState = {
  engine: null,
  currentNode: null,
  meters: { communityTrust: 50, informationIntegrity: 50, publicSafety: 50 },
  history: [],
  completed: false,
  profile: null,
  runSummary: null,
  phase: 'loading',
  caseId: null,
  caseTitle: null,
  caseRevision: null,
  decisionIds: [],
};

// ── Context ──

interface SimulationActions {
  init: (caseData: Case) => void;
  makeDecision: (decisionId: string) => void;
  reset: () => void;
}

const SimulationContext = createContext<SimulationContextState & SimulationActions>({
  ...initialState,
  init: () => {},
  makeDecision: () => {},
  reset: () => {},
});

// ── Provider ──

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const caseRef = useRef<Case | null>(null);

  const init = useCallback((caseData: Case) => {
    caseRef.current = caseData;
    const revision = computeCaseRevision(caseData);

    // A save is only replayed if it matches this exact decision graph.
    const saved = loadSimulation(caseData.id, revision);
    if (saved && saved.decisionIds.length > 0) {
      try {
        const engine = new SimulationEngine(caseData);
        for (const decisionId of saved.decisionIds) {
          engine.makeDecision(decisionId);
        }
        dispatch({
          type: 'RESTORE',
          payload: { engine, caseData, decisionIds: saved.decisionIds },
        });
        return;
      } catch {
        // If replay fails for any reason, start fresh rather than half-restored.
        clearSimulation(caseData.id);
      }
    }
    dispatch({ type: 'INIT', payload: caseData });
  }, []);

  const makeDecision = useCallback(
    (decisionId: string) => {
      const engine = state.engine;
      if (!engine || state.completed) return;
      try {
        engine.makeDecision(decisionId);
        const newDecisionIds = [...state.decisionIds, decisionId];

        if (state.caseId && state.caseRevision) {
          saveSimulation(state.caseId, state.caseRevision, newDecisionIds);
        }

        dispatch({ type: 'SYNC', engine, decisionIds: newDecisionIds });
      } catch (e) {
        console.error('Decision failed:', e);
      }
    },
    [state.engine, state.completed, state.decisionIds, state.caseId, state.caseRevision],
  );

  const reset = useCallback(() => {
    if (state.caseId) {
      clearSimulation(state.caseId);
    }
    if (caseRef.current) {
      dispatch({ type: 'INIT', payload: caseRef.current });
      return;
    }
    dispatch({ type: 'RESET' });
  }, [state.caseId]);

  const value = useMemo(
    () => ({ ...state, init, makeDecision, reset }),
    [state, init, makeDecision, reset],
  );

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

// ── Hook ──

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within a SimulationProvider');
  return ctx;
}
