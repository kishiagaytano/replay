'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { SimulationEngine, type SimulationState, type DecisionRecord } from './simulation-engine';
import { saveSimulation, loadSimulation, clearSimulation } from './persistence';
import type { Case, SimulationNode } from '@/lib/schema/case.schema';

// ── State ──

interface SimulationContextState {
  engine: SimulationEngine | null;
  currentNode: SimulationNode | null;
  meters: SimulationState;
  history: DecisionRecord[];
  completed: boolean;
  profile: { id: string; title: string; description: string } | null;
  phase: 'loading' | 'playing' | 'completed';
  caseId: string | null;
  caseTitle: string | null;
  decisionIds: string[]; // For persistence replay
}

type Action =
  | { type: 'INIT'; payload: Case }
  | { type: 'DECISION_MADE'; payload: SimulationNode | null; state: SimulationState; history: DecisionRecord[]; completed: boolean; decisionIds: string[] }
  | { type: 'RESTORE'; payload: { engine: SimulationEngine; caseData: Case; decisionIds: string[] } }
  | { type: 'RESET' };

function reducer(state: SimulationContextState, action: Action): SimulationContextState {
  switch (action.type) {
    case 'INIT': {
      const engine = new SimulationEngine(action.payload);
      return {
        engine,
        currentNode: engine.getCurrentNode(),
        meters: engine.getState(),
        history: engine.getHistory(),
        completed: engine.isComplete(),
        profile: null,
        phase: 'playing',
        caseId: action.payload.id,
        caseTitle: action.payload.title,
        decisionIds: [],
      };
    }
    case 'RESTORE': {
      const { engine, caseData } = action.payload;
      return {
        engine,
        currentNode: engine.getCurrentNode(),
        meters: engine.getState(),
        history: engine.getHistory(),
        completed: engine.isComplete(),
        profile: engine.isComplete() ? engine.getProfile() : null,
        phase: engine.isComplete() ? 'completed' : 'playing',
        caseId: caseData.id,
        caseTitle: caseData.title,
        decisionIds: action.payload.decisionIds,
      };
    }
    case 'DECISION_MADE': {
      if (!state.engine) return state;
      const profile = action.completed ? state.engine.getProfile() : null;
      return {
        ...state,
        currentNode: action.payload,
        meters: action.state,
        history: action.history,
        completed: action.completed,
        profile,
        phase: action.completed ? 'completed' : 'playing',
        decisionIds: action.decisionIds,
      };
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
  phase: 'loading',
  caseId: null,
  caseTitle: null,
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

  // On mount, check for saved state passed via the init wrapper
  const pendingRestore = useRef<{ caseData: Case; decisionIds: string[] } | null>(null);

  const init = useCallback((caseData: Case) => {
    // Check for saved state
    const saved = loadSimulation(caseData.id);
    if (saved && saved.decisionIds.length > 0) {
      // Restore by replaying decisions
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
        // If replay fails, start fresh
        clearSimulation(caseData.id);
      }
    }
    // Fresh start
    dispatch({ type: 'INIT', payload: caseData });
  }, []);

  const makeDecision = useCallback(
    (decisionId: string) => {
      if (!state.engine || state.completed) return;
      try {
        const nextNode = state.engine.makeDecision(decisionId);
        const newDecisionIds = [...state.decisionIds, decisionId];
        const newHistory = state.engine.getHistory();
        const completed = state.engine.isComplete();

        // Persist
        if (state.caseId) {
          saveSimulation(state.caseId, newDecisionIds);
          if (completed) {
            // Keep saved state so debrief pages are accessible on refresh
          }
        }

        dispatch({
          type: 'DECISION_MADE',
          payload: nextNode,
          state: state.engine.getState(),
          history: newHistory,
          completed,
          decisionIds: newDecisionIds,
        });
      } catch (e) {
        console.error('Decision failed:', e);
      }
    },
    [state.engine, state.completed, state.decisionIds, state.caseId],
  );

  const reset = useCallback(() => {
    if (state.caseId) {
      clearSimulation(state.caseId);
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
