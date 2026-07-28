'use client';

import { useEffect, useRef } from 'react';
import { useSimulation } from '@/lib/engine/simulation-context';
import { VNStage } from './vn-stage';
import type { Case } from '@/lib/schema/case.schema';

interface SimulationViewProps {
  caseData: Case;
}

/**
 * Wrapper component that initializes the simulation engine with case data.
 * Must be rendered inside a SimulationProvider.
 */
export function SimulationView({ caseData }: SimulationViewProps) {
  const { init, phase } = useSimulation();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      init(caseData);
    }
  }, [caseData, init]);

  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-storm-bg">
        <div className="text-storm-dim text-sm animate-pulse">Loading simulation...</div>
      </div>
    );
  }

  return <VNStage />;
}
