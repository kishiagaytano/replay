import Link from 'next/link';
import { LOOP, nextStep, stepIndex, type LoopStep } from '@/lib/loop';

/**
 * Progress indicator + "continue" control shared by every loop screen.
 * Keeps the player moving forward through §8's sequence instead of
 * guessing which link to click next.
 */
export function LoopProgress({
  current,
  caseId,
}: {
  current: LoopStep['key'];
  caseId: string;
}) {
  const currentIndex = stepIndex(current);

  return (
    <nav aria-label="Case progress" className="w-full">
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {LOOP.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={step.key} className="flex-1">
              <Bar active={active} done={done} />
              {done ? (
                <Link
                  href={step.href(caseId)}
                  className="mt-1.5 hidden text-[10px] uppercase tracking-wider text-storm-dim hover:text-storm-accent transition-colors sm:block"
                >
                  {step.label}
                </Link>
              ) : (
                <span
                  className={`mt-1.5 hidden text-[10px] uppercase tracking-wider sm:block ${
                    active ? 'text-storm-accent font-bold' : 'text-storm-dim'
                  }`}
                >
                  {step.label}
                </span>
              )}
              <span className="sr-only">
                {step.label}
                {active ? ' (current step)' : done ? ' (completed)' : ''}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Bar({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div
      className={`h-1 rounded-full transition-colors ${
        active ? 'bg-storm-accent' : done ? 'bg-storm-accent/40' : 'bg-storm-dim/25'
      }`}
    />
  );
}

export function ContinueButton({
  current,
  caseId,
  label,
}: {
  current: LoopStep['key'];
  caseId: string;
  label?: string;
}) {
  const next = nextStep(current);
  if (!next) return null;

  return (
    <Link
      href={next.href(caseId)}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all sm:w-auto"
      style={{
        background: 'linear-gradient(135deg, #C4863A 0%, #D49A44 100%)',
        color: '#0D0C0A',
      }}
    >
      {label ?? `Continue to ${next.label}`}
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </Link>
  );
}
