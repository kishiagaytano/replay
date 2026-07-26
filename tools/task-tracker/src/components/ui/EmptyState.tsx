import type { ReactNode } from "react";

export function EmptyState({ icon, title, hint }: { icon?: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center dark:border-slate-700">
      {icon ? <div className="mb-2 text-slate-300 dark:text-slate-600">{icon}</div> : null}
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p> : null}
    </div>
  );
}
