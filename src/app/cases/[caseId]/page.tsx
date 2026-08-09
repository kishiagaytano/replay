import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCase } from '@/lib/registry';
import { LoopProgress, ContinueButton } from '@/components/loop/loop-nav';
import { LOOP } from '@/lib/loop';

/**
 * Case brief — the entry point of the loop.
 * Route: /cases/[caseId]
 *
 * Before D8 this route dropped the player straight into the first decision
 * with no framing. §6 requires the player to understand what they can and
 * cannot influence before they start, and §19 requires simulated dialogue to
 * be labelled as such up front.
 */
export default async function CaseIntroPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseData = getCase(caseId);
  if (!caseData) notFound();

  return (
    <div className="min-h-screen bg-storm-bg">
      <header className="sticky top-0 z-10 border-b border-storm-dim/20 bg-storm-bg/90 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <Link href="/cases" className="text-storm-muted hover:text-storm-text text-sm transition-colors">
              &larr; All cases
            </Link>
            <span className="text-storm-accent text-xs font-bold uppercase tracking-wider">
              {caseData.code}
            </span>
          </div>
          <LoopProgress current="intro" caseId={caseId} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-4 py-8">
        <section>
          <h1 className="text-storm-text text-2xl font-bold sm:text-3xl">{caseData.title}</h1>
          {caseData.hook && (
            <p className="text-storm-accent mt-3 text-sm leading-relaxed sm:text-base">
              {caseData.hook}
            </p>
          )}
        </section>

        <section className="rounded-xl border border-storm-dim/20 p-5">
          <h2 className="text-storm-dim text-xs font-bold uppercase tracking-wider">
            The situation
          </h2>
          <p className="text-storm-dim mt-1 text-xs">
            {caseData.historicalContext.realEvent} · {caseData.historicalContext.dateRange}
          </p>
          <p className="text-storm-muted mt-3 text-sm leading-relaxed">
            {caseData.historicalContext.summary}
          </p>
        </section>

        <section className="rounded-xl border border-storm-dim/20 p-5">
          <h2 className="text-storm-dim text-xs font-bold uppercase tracking-wider">
            Your role
          </h2>
          <p className="text-storm-muted mt-3 text-sm leading-relaxed">
            You are a student in Cebu helping your family make sense of typhoon information
            arriving through a family group chat. You decide what to forward, what to question,
            and when to act.
          </p>
          <p className="text-storm-muted mt-3 text-sm leading-relaxed">
            You cannot change the storm, the flooding, or what officials did. Those already
            happened. What you can change is how information moved through your family.
          </p>
        </section>

        <section className="rounded-xl border border-storm-dim/20 p-5">
          <h2 className="text-storm-dim text-xs font-bold uppercase tracking-wider">
            What to expect
          </h2>
          <ol className="mt-3 space-y-2">
            {LOOP.slice(1).map((step, i) => (
              <li key={step.key} className="flex gap-3 text-sm">
                <span className="text-storm-accent shrink-0 font-bold tabular-nums">{i + 1}.</span>
                <span>
                  <span className="text-storm-text font-bold">{step.label}</span>
                  <span className="text-storm-muted"> — {step.blurb}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="text-storm-dim mt-4 text-xs">About 6–8 minutes.</p>
        </section>

        <section className="rounded-xl border border-storm-dim/30 bg-storm-surface p-5">
          <h2 className="text-storm-text text-xs font-bold uppercase tracking-wider">
            Before you start
          </h2>
          <p className="text-storm-muted mt-2 text-sm leading-relaxed">
            The events, advisories, and fact-checks in this case are real and are cited
            throughout. The family messages are <strong className="text-storm-text">written for
            this simulation</strong> — they are not real messages that real people sent. The three
            indicators you will see are educational, not a measure of real-world outcomes.
          </p>
        </section>

        <div className="flex flex-col items-center gap-3 pb-8 sm:flex-row sm:justify-center">
          <ContinueButton current="intro" caseId={caseId} label="Start the simulation" />
        </div>
      </main>
    </div>
  );
}
