import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCase } from '@/lib/registry';

/**
 * Evidence Explorer page.
 * Shows every evidence item encountered during the simulation with verification
 * status, claim accuracy, citations, and teaching points.
 * Route: /cases/[caseId]/evidence
 */
export default async function EvidencePage({
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
            Evidence Explorer
          </span>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-xl font-bold text-storm-text">{caseData.title}</h1>
          <p className="text-storm-muted text-sm mt-1">
            {caseData.evidence.length} evidence item{caseData.evidence.length !== 1 ? 's' : ''} &middot; Tap to expand
          </p>
        </div>

        <div className="gradient-divider" />

        {/* Evidence list */}
        <div className="space-y-4">
          {caseData.evidence.map((item) => (
            <details
              key={item.id}
              className="group rounded-xl border border-storm-dim/20 overflow-hidden transition-colors hover:border-storm-dim/40"
            >
              <summary className="p-4 cursor-pointer list-none flex items-start gap-3">
                {/* Status indicator */}
                <StatusBadge status={item.mediaStatus} accuracy={item.claimAccuracy} />

                {/* Claim preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <ChannelTag channel={item.channel} />
                    <span className="text-storm-dim text-xs">{item.id}</span>
                  </div>
                  <p className="text-storm-text text-sm leading-relaxed line-clamp-2">
                    {item.claim}
                  </p>
                </div>

                {/* Chevron */}
                <svg
                  className="w-4 h-4 text-storm-dim mt-1 transition-transform group-open:rotate-180 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>

              {/* Expanded detail */}
              <div className="px-4 pb-4 space-y-3 animate-slide-up">
                <div className="gradient-divider" />

                {/* Media status + claim accuracy */}
                <div className="grid grid-cols-2 gap-3">
                  <DetailBox
                    label="Media Status"
                    value={formatMediaStatus(item.mediaStatus)}
                    color={getStatusColor(item.mediaStatus)}
                  />
                  <DetailBox
                    label="Claim Accuracy"
                    value={formatClaimAccuracy(item.claimAccuracy)}
                    color={getAccuracyColor(item.claimAccuracy)}
                  />
                </div>

                {/* Citation */}
                <div className="rounded-lg bg-storm-surface p-3">
                  <div className="text-storm-dim text-xs uppercase tracking-wider mb-1">
                    Source
                  </div>
                  <p className="text-storm-text text-sm">{item.citation.publisher}</p>
                  <p className="text-storm-muted text-xs mt-0.5">{item.citation.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-storm-dim">
                    <span>{item.citation.date}</span>
                    {item.citation.url && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-storm-dim" />
                        <a
                          href={item.citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-storm-accent hover:underline"
                        >
                          View source
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Note */}
                {item.note && (
                  <p className="text-storm-dim text-xs italic">{item.note}</p>
                )}
              </div>
            </details>
          ))}
        </div>

        {/* Back link */}
        <div className="text-center pt-4">
          <Link
            href={`/cases/${caseId}`}
            className="inline-flex items-center gap-1 text-storm-muted hover:text-storm-text text-sm transition-colors"
          >
            &larr; Return to simulation
          </Link>
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ──

function StatusBadge({
  status,
  accuracy,
}: {
  status: string;
  accuracy: string;
}) {
  const color = status === 'authentic' ? '#4A7C5C' : '#8C2E2E';
  return (
    <div
      className="w-3 h-3 rounded-full mt-1.5 shrink-0"
      style={{ backgroundColor: color }}
      title={`${status} / ${accuracy}`}
    />
  );
}

function ChannelTag({ channel }: { channel: string }) {
  const labels: Record<string, string> = {
    messenger: 'Messenger',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    'official-advisory': 'Official',
    notification: 'Notification',
  };
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-storm-surface text-storm-dim">
      {labels[channel] ?? channel}
    </span>
  );
}

function DetailBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-storm-surface p-3">
      <div className="text-storm-dim text-xs uppercase tracking-wider mb-1">{label}</div>
      <div className="text-sm font-semibold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function formatMediaStatus(status: string): string {
  const map: Record<string, string> = {
    authentic: 'Authentic',
    synthetic: 'AI-Generated',
    altered: 'Altered',
    miscaptioned: 'Miscaptioned',
    'not-yet-verifiable': 'Not Yet Verifiable',
  };
  return map[status] ?? status;
}

function formatClaimAccuracy(accuracy: string): string {
  const map: Record<string, string> = {
    accurate: 'Accurate',
    false: 'False',
    misleading: 'Misleading',
    'unverified-at-the-time': 'Unverified',
  };
  return map[accuracy] ?? accuracy;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'authentic': return '#4A7C5C';
    case 'synthetic': return '#C4863A';
    default: return '#9A9284';
  }
}

function getAccuracyColor(accuracy: string): string {
  switch (accuracy) {
    case 'accurate': return '#4A7C5C';
    case 'false': return '#8C2E2E';
    case 'misleading': return '#C4863A';
    default: return '#9A9284';
  }
}
