import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCase } from '@/lib/registry';
import { RevealTimeline } from '@/components/reveal/reveal-timeline';
import { LoopProgress, ContinueButton } from '@/components/loop/loop-nav';

/**
 * Historical reveal — §8 step 6.
 * Route: /cases/[caseId]/reveal
 */
export default async function RevealPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseData = getCase(caseId);
  if (!caseData) notFound();

  const reveal = caseData.historicalReveal;

  return (
    <div className="min-h-screen bg-storm-bg">
      <header className="sticky top-0 z-10 border-b border-storm-dim/20 bg-storm-bg/90 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <Link
              href={`/cases/${caseId}/play`}
              className="text-storm-muted hover:text-storm-text text-sm transition-colors"
            >
              &larr; Back to simulation
            </Link>
            <span className="text-storm-accent text-xs font-bold uppercase tracking-wider">
              Historical reveal
            </span>
          </div>
          <LoopProgress current="reveal" caseId={caseId} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <section>
          <h1 className="text-storm-text text-xl font-bold sm:text-2xl">
            {reveal?.title ?? 'What actually happened'}
          </h1>
          <p className="text-storm-dim mt-1 text-xs">
            {caseData.historicalContext.realEvent} · {caseData.historicalContext.dateRange}
          </p>
        </section>

        {reveal ? (
          <RevealTimeline reveal={reveal} />
        ) : (
          <p className="text-storm-muted rounded-xl border border-storm-dim/20 p-5 text-sm">
            This case does not yet have a documented reveal.
          </p>
        )}

        <div className="flex flex-col items-center gap-3 pb-8 pt-2 sm:flex-row sm:justify-center">
          <ContinueButton current="reveal" caseId={caseId} />
        </div>
      </main>
    </div>
  );
}
