import type { ProgressSummary } from "@/lib/utils/metrics";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { STATUS_LIST } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";

/** Overall progress + a slim per-status breakdown (no charts — CLAUDE.md §8). */
export function StatusBreakdown({ progress }: { progress: ProgressSummary }) {
  return (
    <div>
      <div className="flex items-end justify-between">
        <span className="text-sm text-slate-500">
          {progress.done} of {progress.total} tasks done
        </span>
        <span className="text-2xl font-semibold tabular-nums text-slate-900">{progress.percent}%</span>
      </div>
      <ProgressBar percent={progress.percent} className="mt-2" label="Overall progress" />

      <dl className="mt-4 grid grid-cols-4 gap-2">
        {STATUS_LIST.map((s) => (
          <div key={s.id} className="rounded-lg bg-slate-50 px-2 py-2 text-center">
            <dt className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
              <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
              {s.label}
            </dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-slate-800">
              {progress.byStatus[s.id]}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
