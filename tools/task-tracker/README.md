# rePlay — Team Tracker

A lightweight internal task tracker for the 4-person rePlay team (Kishia · Gian · Bads · Khylle) during the **UNESCO Youth Hackathon 2026**, sprinting to the **August 7** submission target.

It answers four questions, fast:

- **What should we accomplish today?** → Dashboard
- **Who is responsible?** → Team
- **What is currently blocked?** → Dashboard (Blockers)
- **Are we on schedule to finish by Aug 7?** → Dashboard (countdown + on-schedule signal)

This is an internal dev dashboard, not a product — think Linear / GitHub Projects / Vercel dashboard. No accounts, no backend, no charts.

## Pages

| Page | What it shows |
|---|---|
| **Dashboard** | Days to Aug 7, overall progress, today's tasks, upcoming deadlines (next 3 days), current blockers, overdue. |
| **Timeline** | The sprint day by day — each day's tasks and progress, grouped by due date. |
| **Tasks** | A 4-column board (To Do · In Progress · Review · Done) with drag-and-drop, search, and filters. Create / edit / delete tasks. |
| **Team** | Each member's assigned / completed tasks and current workload. |

## Tech

- **Next.js 14** (App Router) · **TypeScript** (strict) · **Tailwind CSS**
- **Zod** for the data model (single source of truth)
- **React Context + useReducer** for state (no external state lib)
- **Native HTML5 drag-and-drop** (no dnd lib) + an accessible status `<select>` fallback for touch/keyboard
- **Supabase** (Postgres + Realtime) for the shared database, with a localStorage fallback when it's not configured

Chosen to match the principles in the repo's root `CLAUDE.md` (mobile-first, accessible, minimal dependencies, data decoupled behind an interface).

## Getting started

```bash
cd tools/task-tracker
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

## Data: two modes

The app depends only on the `TaskRepository` interface in [`src/lib/data/repository.ts`](src/lib/data/repository.ts). A factory picks the backend at startup:

- **Local only** (default, no setup): per-browser **localStorage**, seeded from [`src/lib/data/seed.ts`](src/lib/data/seed.ts). Great for local dev; changes are **not** shared.
- **Shared** (recommended for the team): **Supabase** Postgres — all four teammates read/write the same data, kept in sync live via Supabase Realtime.

A badge in the top bar shows which mode you're in (**Shared** / **Local only**). No store/component/page code differs between modes — the repository is the only swap point.

## Set up the shared database (Supabase)

One-time setup so everyone shares data on the deployed app.

1. **Create a project** at [supabase.com](https://supabase.com) (free tier is enough). Pick a region near you.
2. **Create the tables + seed data.** In the Supabase dashboard: **SQL Editor → New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql), and **Run**. (Safe to re-run.)
3. **Grab your keys.** **Project Settings → Data API** (or **API**): copy the **Project URL** and the **anon public** key.
4. **Local:** copy `.env.example` to `.env.local` and fill in:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```
   Restart `npm run dev`. The top-bar badge should read **Shared**.
5. **Vercel:** Project → **Settings → Environment Variables**, add the same two variables (Production + Preview), then **redeploy**. Everyone now shares one database.

### Editing tasks & team roles

- **Tasks:** on **Tasks**, use **New task**, or click a card title to edit / delete. Drag cards between columns (or use the per-card status menu) to change status.
- **Team roles:** on **Team**, click **Edit** on a member to change their name, role, or avatar initials.

All edits persist to whichever backend is active (shared Supabase or local).

### A note on access

`schema.sql` grants the public **anon** key full read/write (there's no login). For a private 4-person hackathon tool that's a reasonable trade-off, but **anyone with the deployed URL can edit data**. To lock it down later, enable **Supabase Auth** and change the RLS policies from `to anon` to `to authenticated`. This is intentionally left as a future step (see the repo's `CLAUDE.md` §10/§11 posture on doing the simple, honest thing first).

### Reset local data

Clear the browser keys `replay-tracker:tasks:v1` / `replay-tracker:members:v1` (DevTools → Application → Local Storage) to restore the seed.

## Project structure

```
src/
├── app/                # Dashboard, Timeline, Tasks, Team routes
├── components/         # ui/ · layout/ · dashboard/ · tasks/ · timeline/ · team/ · common/
└── lib/
    ├── schema/         # Zod schemas + inferred types (source of truth)
    ├── data/           # repository interface + Local & Supabase impls + factory + seed
    ├── store/          # Context + reducer + async persistence + realtime
    └── utils/          # constants, dates, metrics, hooks

supabase/
└── schema.sql          # run once in Supabase: tables, RLS, seed
```

The data layer:

```
repository.ts            # TaskRepository interface (the boundary)
local-repository.ts      # localStorage implementation
supabase-repository.ts   # shared Postgres implementation
supabase-client.ts       # reads NEXT_PUBLIC_SUPABASE_* env vars
repository-factory.ts    # picks Supabase if configured, else Local
```

## Data model

The 7 specified task fields — `title`, `description`, `assigneeId`, `category`, `priority`, `status`, `dueDate` — plus one documented extension: an optional `blocker` note. (The Dashboard must show "what's blocked", but `status` has no "Blocked" value, so a task is considered blocked iff a blocker note is set. Kept optional to preserve the minimal core.)

- **Status:** To Do · In Progress · Review · Done
- **Priority:** High · Medium · Low
- **Category:** Research · Proposal · Design · Frontend · Backend · Historical Cases · Testing · Pitch Video
