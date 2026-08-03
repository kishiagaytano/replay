import Link from 'next/link';
import { listCases } from '@/lib/registry';

/**
 * Case index — lists all available simulations.
 * Route: /cases
 */
export default function CasesPage() {
  const cases = listCases();

  return (
    <div className="min-h-screen bg-storm-bg">
      {/* Header */}
      <header className="border-b border-storm-dim/20">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="text-storm-muted hover:text-storm-text text-sm transition-colors"
          >
            &larr; Home
          </Link>
          <h1 className="text-2xl font-bold text-storm-text mt-3">Cases</h1>
          <p className="text-storm-muted text-sm mt-1">
            Choose a simulation to begin.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {cases.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-storm-dim text-sm">No cases available yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="block rounded-xl p-5 border border-storm-dim/25 hover:border-storm-accent/50 transition-colors"
                style={{ background: 'rgba(28,25,22,0.5)' }}
              >
                <div className="text-storm-accent text-xs font-semibold uppercase tracking-wider mb-2">
                  {c.code}
                </div>
                <h3 className="text-storm-text font-bold text-lg">{c.title}</h3>
                {c.hook && (
                  <p className="text-storm-muted text-sm mt-1">{c.hook}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-storm-dim">
                  <span className="px-2 py-0.5 rounded bg-storm-surface">
                    {c.competency}
                  </span>
                  {c.track.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-storm-surface">
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
