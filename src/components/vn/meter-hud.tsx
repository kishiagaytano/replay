'use client';

import { useEffect, useState } from 'react';
import type { SimulationState } from '@/lib/engine/simulation-engine';

/**
 * Live meter readout shown during play (§8 step 4 — "experience consequences").
 *
 * Before D8 the meters were only visible on the completion screen, so a player
 * made seven decisions without ever seeing what they did. This surfaces the
 * three indicators continuously and flashes the delta when one changes.
 *
 * Motion is decorative: under `prefers-reduced-motion: reduce` the bars jump
 * straight to their new width and the delta is shown as static text.
 */

const METERS: Array<{ key: keyof SimulationState; label: string; short: string; color: string }> = [
  { key: 'communityTrust', label: 'Community Trust', short: 'Trust', color: '#C4863A' },
  { key: 'informationIntegrity', label: 'Information Integrity', short: 'Integrity', color: '#4A7C5C' },
  { key: 'publicSafety', label: 'Public Safety', short: 'Safety', color: '#D49A44' },
];

export function MeterHUD({ meters }: { meters: SimulationState }) {
  // Deltas are derived by comparing against the previous props during render —
  // React's documented "adjust state when props change" pattern. Doing it in an
  // effect would render the stale value first and cause a cascading render.
  const [seen, setSeen] = useState<SimulationState>(meters);
  const [deltas, setDeltas] = useState<Partial<Record<keyof SimulationState, number>>>({});

  if (seen !== meters) {
    const changed: Partial<Record<keyof SimulationState, number>> = {};
    for (const { key } of METERS) {
      const diff = meters[key] - seen[key];
      if (diff !== 0) changed[key] = diff;
    }
    setSeen(meters);
    setDeltas(changed);
  }

  const hasDeltas = Object.keys(deltas).length > 0;

  useEffect(() => {
    if (!hasDeltas) return;
    const timer = setTimeout(() => setDeltas({}), 2200);
    return () => clearTimeout(timer);
  }, [hasDeltas, deltas]);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 pt-3 sm:px-4 sm:pt-4">
      <div
        className="mx-auto flex max-w-xl gap-2 rounded-xl border border-storm-dim/25 px-3 py-2 backdrop-blur-sm sm:gap-3 sm:px-4"
        style={{ background: 'rgba(13,12,10,0.72)' }}
        role="group"
        aria-label="Learning indicators"
      >
        {METERS.map(({ key, label, short, color }) => {
          const value = meters[key];
          const delta = deltas[key];

          return (
            <div key={key} className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-1">
                <span className="truncate text-[10px] uppercase tracking-wider text-storm-dim">
                  <span className="sm:hidden">{short}</span>
                  <span className="hidden sm:inline">{label}</span>
                </span>
                <span className="flex items-baseline gap-1">
                  {delta !== undefined && (
                    <span
                      className="text-[10px] font-bold tabular-nums motion-safe:animate-fade-in"
                      style={{ color: delta > 0 ? '#4A7C5C' : '#B4553F' }}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </span>
                  )}
                  <span className="text-xs font-bold tabular-nums" style={{ color }}>
                    {value}
                  </span>
                </span>
              </div>

              <div className="mt-1 h-1 overflow-hidden rounded-full bg-storm-bg">
                <div
                  className="h-full rounded-full motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out"
                  style={{ width: `${value}%`, backgroundColor: color }}
                />
              </div>

              <span className="sr-only" aria-live="polite">
                {label}: {value} out of 100
                {delta !== undefined ? `, changed by ${delta > 0 ? '+' : ''}${delta}` : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
