import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DeadlinePill } from "@/components/layout/DeadlinePill";
import { ConnectionBadge } from "@/components/layout/ConnectionBadge";

/**
 * App frame: fixed sidebar on desktop, stacked top nav on mobile (CLAUDE.md §8
 * mobile-first). The brand mark doubles as the product identity.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-slate-200 bg-white px-4 py-3 lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-4 lg:py-5">
        <div className="mb-0 flex items-center justify-between lg:mb-6 lg:block">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              r
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">rePlay</p>
              <p className="text-[11px] text-slate-400">Team Tracker</p>
            </div>
          </div>
          <div className="lg:hidden">
            <DeadlinePill />
          </div>
        </div>
        <div className="mt-3 lg:mt-0">
          <Sidebar />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur lg:flex">
          <p className="text-sm text-slate-500">UNESCO Youth Hackathon 2026 · sprint to Aug 7</p>
          <div className="flex items-center gap-3">
            <ConnectionBadge />
            <DeadlinePill />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
