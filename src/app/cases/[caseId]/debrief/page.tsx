import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCase } from '@/lib/registry';
import { RunSummarySection } from '@/components/debrief/run-summary';

/**
 * Debrief hub — shows Historical Context, Community Toolkit, and Reflection.
 * Route: /cases/[caseId]/debrief
 */
export default async function DebriefPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseData = getCase(caseId);

  if (!caseData) notFound();

  return (
    <div className="min-h-screen bg-storm-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-storm-dim/20 bg-storm-bg/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/cases/${caseId}`}
            className="text-storm-muted hover:text-storm-text text-sm transition-colors"
          >
            &larr; Back to simulation
          </Link>
          <span className="text-storm-accent text-xs font-bold uppercase tracking-wider">
            Debrief
          </span>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        {/* ── Historical Context ── */}
        <section>
          <h2 className="text-lg font-bold text-storm-text flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-storm-accent" />
            Historical Context
          </h2>

          <div className="rounded-xl border border-storm-dim/20 p-5 space-y-4">
            <div>
              <h3 className="text-storm-accent text-sm font-bold">{caseData.historicalContext.realEvent}</h3>
              <p className="text-storm-dim text-xs mt-0.5">{caseData.historicalContext.dateRange}</p>
            </div>

            <p className="text-storm-text text-sm leading-relaxed">
              {caseData.historicalContext.summary}
            </p>

            <div className="gradient-divider" />

            <div>
              <h4 className="text-storm-dim text-xs uppercase tracking-wider font-bold mb-2">
                Sources ({caseData.historicalContext.sources.length})
              </h4>
              <div className="space-y-2">
                {caseData.historicalContext.sources.map((src, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-storm-surface p-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-storm-accent text-xs font-bold">{src.publisher}</span>
                        <p className="text-storm-text mt-0.5">{src.title}</p>
                        <p className="text-storm-dim text-xs mt-0.5">{src.date}</p>
                      </div>
                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-storm-dim hover:text-storm-accent transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                    {src.note && (
                      <p className="text-storm-dim text-xs mt-1 italic">{src.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Community Toolkit ── */}
        {caseData.toolkit && caseData.toolkit.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-storm-text flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-storm-success" />
              Community Toolkit
            </h2>

            <div className="space-y-3">
              {caseData.toolkit.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-storm-dim/20 p-5"
                >
                  <h3 className="text-storm-text font-bold text-sm mb-2">{item.title}</h3>
                  <p className="text-storm-muted text-sm leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                  {item.source && (
                    <p className="text-storm-dim text-xs mt-2 italic">Source: {item.source}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Reflection / Information Profile ── */}
        <section>
          <h2 className="text-lg font-bold text-storm-text flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-storm-accent" />
            Reflection
          </h2>
          <RunSummarySection caseData={caseData} />
        </section>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 pb-8">
          <Link
            href={`/cases/${caseId}/evidence`}
            className="inline-flex items-center gap-2 font-bold py-3 px-6 rounded-xl border border-storm-dim/30 text-storm-text hover:border-storm-accent/50 transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Evidence Explorer
          </Link>
          <Link
            href={`/cases/${caseId}`}
            className="inline-flex items-center gap-2 font-bold py-3 px-6 rounded-xl transition-all text-sm"
            style={{
              background: 'linear-gradient(135deg, #C4863A 0%, #D49A44 100%)',
              color: '#0D0C0A',
            }}
          >
            Replay Simulation
          </Link>
        </div>
      </main>
    </div>
  );
}
