import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCase } from '@/lib/registry';
import { getEvidenceExplorerEntries } from '../../../../../content/cases/the-flood-was-real/evidence';
import { LoopProgress, ContinueButton } from '@/components/loop/loop-nav';

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

  // Entries come from the D6 evidence index, so each item is tied to the node
  // where the player met it and carries the text they actually saw (§13).
  const entries = getEvidenceExplorerEntries();

  return (
    <div className="min-h-screen bg-storm-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-storm-dim/20 bg-storm-bg/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <Link
              href={`/cases/${caseId}/reveal`}
              className="text-storm-muted hover:text-storm-text text-sm transition-colors"
            >
              &larr; Back to the reveal
            </Link>
            <span className="text-storm-accent text-xs font-bold uppercase tracking-wider">
              Evidence Explorer
            </span>
          </div>
          <LoopProgress current="evidence" caseId={caseId} />
        </div>
      </header>

      {/* Body */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-xl font-bold text-storm-text">{caseData.title}</h1>
          <p className="text-storm-muted text-sm mt-1">
            {entries.length} evidence item{entries.length !== 1 ? 's' : ''} &middot; Tap to expand
          </p>
        </div>

        <div className="gradient-divider" />

        {/* Evidence list */}
        <div className="space-y-4">
          {entries.map((item) => (
            <details
              key={item.evidenceId}
              className="group rounded-xl border border-storm-dim/20 overflow-hidden transition-colors hover:border-storm-dim/40"
            >
              <summary className="p-4 cursor-pointer list-none flex items-start gap-3">
                {/* Status indicator */}
                <StatusBadge status={item.mediaStatus} accuracy={item.claimAccuracy} />

                {/* Claim preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <ChannelTag channel={item.channel} />
                    <span className="text-storm-dim text-xs">{item.evidenceId}</span>
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

                {/* What the player actually saw at this moment */}
                <div>
                  <div className="text-storm-dim text-xs uppercase tracking-wider mb-1">
                    What you encountered
                  </div>
                  <p className="text-storm-muted text-sm leading-relaxed rounded-lg bg-storm-surface p-3">
                    {item.playerEncountered}
                  </p>
                </div>

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

                {item.verificationMethod && (
                  <div>
                    <div className="text-storm-dim text-xs uppercase tracking-wider mb-1">
                      How it was verified
                    </div>
                    <p className="text-storm-muted text-sm leading-relaxed">{item.verificationMethod}</p>
                  </div>
                )}

                {/* Sources */}
                <div className="space-y-2">
                  <div className="text-storm-dim text-xs uppercase tracking-wider">
                    Source{item.citations.length !== 1 ? 's' : ''}
                  </div>
                  {item.citations.map((source, index) => (
                    <div key={`${source.url ?? source.title}-${index}`} className="rounded-lg bg-storm-surface p-3">
                      <p className="text-storm-text text-sm">{source.publisher}</p>
                      <p className="text-storm-muted text-xs mt-0.5">{source.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-storm-dim">
                        <span>{source.date}</span>
                        {source.url && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-storm-dim" />
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-storm-accent hover:underline"
                            >
                              View source
                            </a>
                          </>
                        )}
                      </div>
                      {source.note && <p className="text-storm-dim text-xs mt-1 italic">{source.note}</p>}
                    </div>
                  ))}
                </div>

                {item.teachingPoint && (
                  <p className="text-storm-text text-xs leading-relaxed border-l-2 border-storm-accent pl-3">
                    {item.teachingPoint}
                  </p>
                )}

                {/* Note */}
                {item.note && (
                  <p className="text-storm-dim text-xs italic">{item.note}</p>
                )}
              </div>
            </details>
          ))}
        </div>

        {/* Continue the loop */}
        <div className="flex flex-col items-center gap-3 pt-4 pb-4 sm:flex-row sm:justify-center">
          <ContinueButton current="evidence" caseId={caseId} />
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
