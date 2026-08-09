'use client';

import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks/use-reduced-motion';
import type { HistoricalReveal, RevealBeat } from '@/lib/schema/case.schema';

/**
 * The historical reveal (§8 step 6).
 *
 * Beats appear in sequence — the "collapse" from the player's branching path
 * into the single documented timeline (§11). The animation is decorative: with
 * `prefers-reduced-motion: reduce`, every beat is rendered immediately and no
 * transition runs. Content is identical either way.
 */
export function RevealTimeline({ reveal }: { reveal: HistoricalReveal }) {
  const instant = usePrefersReducedMotion();
  const [staged, setStaged] = useState(0);

  // With reduced motion the whole timeline is present immediately; the
  // staging state is simply not consulted.
  const shown = instant ? reveal.beats.length : staged;
  const allShown = shown >= reveal.beats.length;

  useEffect(() => {
    if (instant) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < reveal.beats.length; i += 1) {
      timers.push(
        setTimeout(() => {
          if (!cancelled) setStaged((n) => Math.max(n, i + 1));
        }, 260 * (i + 1)),
      );
    }
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reveal.beats.length, instant]);

  return (
    <div className="space-y-6">
      <p className="text-storm-muted text-sm leading-relaxed">{reveal.intro}</p>

      {!allShown && !instant && (
        <button
          type="button"
          onClick={() => setStaged(reveal.beats.length)}
          className="text-storm-dim hover:text-storm-accent text-xs underline underline-offset-4 transition-colors"
        >
          Show everything now
        </button>
      )}

      <ol className="relative space-y-4 border-l border-storm-dim/25 pl-5 sm:pl-6">
        {reveal.beats.map((beat, i) => (
          <BeatCard key={`${beat.headline}-${i}`} beat={beat} visible={i < shown} instant={instant} />
        ))}
      </ol>

      {reveal.closing && (
        <p
          className={`border-l-2 border-storm-accent pl-4 text-storm-text text-sm leading-relaxed italic transition-opacity duration-500 ${
            allShown ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {reveal.closing}
        </p>
      )}
    </div>
  );
}

function BeatCard({
  beat,
  visible,
  instant,
}: {
  beat: RevealBeat;
  visible: boolean;
  instant: boolean;
}) {
  return (
    <li
      className={
        instant
          ? 'relative'
          : `relative transition-all duration-500 ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`
      }
      aria-hidden={!visible && !instant}
    >
      <span
        className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-storm-bg sm:-left-[30px]"
        style={{ backgroundColor: beat.simulated ? '#6B6357' : '#C4863A' }}
        aria-hidden="true"
      />

      <div className="rounded-xl border border-storm-dim/20 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-storm-dim text-xs tabular-nums">{beat.date}</span>
          {beat.simulated && (
            <span className="rounded-full border border-storm-dim/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-storm-dim">
              Simulated exercise
            </span>
          )}
        </div>

        <h3 className="text-storm-text mt-1 text-sm font-bold sm:text-base">{beat.headline}</h3>
        <p className="text-storm-muted mt-1.5 text-sm leading-relaxed">{beat.whatHappened}</p>

        {beat.confirmedLater && (
          <p className="text-storm-dim mt-3 rounded-lg bg-storm-surface p-3 text-xs leading-relaxed">
            <span className="font-bold uppercase tracking-wider">Confirmed later — </span>
            {beat.confirmedLater}
          </p>
        )}

        <ul className="mt-3 space-y-1.5">
          {beat.citations.map((source, i) => (
            <li key={i} className="text-xs">
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-storm-accent hover:underline"
                >
                  {source.publisher} — {source.title}
                </a>
              ) : (
                <span className="text-storm-dim">
                  {source.publisher} — {source.title}
                </span>
              )}
              <span className="text-storm-dim"> ({source.date})</span>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
