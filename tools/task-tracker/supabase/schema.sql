-- ============================================================================
-- rePlay Team Tracker — Supabase schema + seed
-- Run this ONCE in your Supabase project: Dashboard → SQL Editor → New query →
-- paste all of this → Run. Safe to re-run (idempotent).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.members (
  id       text primary key,
  name     text not null,
  role     text not null default '',
  initials text not null,
  color    text not null
);

create table if not exists public.tasks (
  id          text primary key,
  title       text not null,
  description text not null default '',
  assignee_id text not null,
  category    text not null,
  priority    text not null,
  status      text not null,
  due_date    date not null,
  blocker     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Realtime: broadcast row changes so every teammate's board stays in sync.
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.members;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- This is a private, internal 4-person tool with NO login. We allow the public
-- (anon) key full read/write so anyone with the app can use it. That means
-- anyone who has the deployed URL can edit data. For a hackathon tracker that
-- is a fine trade-off. To lock it down later, enable Supabase Auth and replace
-- these policies with `to authenticated`.
-- ---------------------------------------------------------------------------
alter table public.tasks   enable row level security;
alter table public.members enable row level security;

drop policy if exists "tasks: anon full access"   on public.tasks;
drop policy if exists "members: anon full access" on public.members;

create policy "tasks: anon full access"
  on public.tasks for all
  to anon
  using (true) with check (true);

create policy "members: anon full access"
  on public.members for all
  to anon
  using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Seed: team members
-- ---------------------------------------------------------------------------
insert into public.members (id, name, role, initials, color) values
  ('kishia', 'Kishia', 'Lead · Product & Historical Cases', 'KI', 'bg-indigo-100 text-indigo-700 ring-indigo-600/20'),
  ('gian',   'Gian',   'Engineering · Backend & AI',        'GI', 'bg-sky-100 text-sky-700 ring-sky-600/20'),
  ('bads',   'Bads',   'Design & Frontend',                 'BA', 'bg-rose-100 text-rose-700 ring-rose-600/20'),
  ('khylle', 'Khylle', 'Research & Proposal',               'KH', 'bg-teal-100 text-teal-700 ring-teal-600/20')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Seed: tasks (created_at / updated_at default to now())
-- ---------------------------------------------------------------------------
insert into public.tasks (id, title, description, assignee_id, category, priority, status, due_date, blocker) values
  ('t-001', 'Finalize rePlay proposal draft', 'Consolidate all sections into the UNESCO idea-proposal template; tighten problem statement and one-sentence pitch.', 'khylle', 'proposal', 'high', 'review', '2026-07-28', null),
  ('t-002', 'Problem statement & source citations', 'NDRRMC / PIA / Vera Files references for the disaster-misinformation problem.', 'khylle', 'proposal', 'medium', 'done', '2026-07-24', null),
  ('t-003', 'Verify Flood Warning case evidence', 'Collect and confirm real advisories, headlines and fact-checks for the dam-release rumor timeline. No claim ships without a source.', 'kishia', 'historical-cases', 'high', 'in-progress', '2026-07-29', 'Waiting on Vera Files archive access for the dam-release advisories.'),
  ('t-004', 'Define Zod case & evidence schema', 'Implement the Case / SimulationNode / EvidenceItem schemas from CLAUDE.md section 6.', 'gian', 'backend', 'high', 'in-progress', '2026-07-28', null),
  ('t-005', 'Build simulation engine (traversal + meters)', 'Pure, deterministic engine: node traversal, meter deltas, decision scoring, reveal derivation.', 'gian', 'backend', 'high', 'todo', '2026-07-31', null),
  ('t-006', 'Scaffold Next.js project', 'Next.js App Router + TS strict + Tailwind, per CLAUDE.md.', 'bads', 'frontend', 'medium', 'done', '2026-07-25', null),
  ('t-007', 'Case player wireframes (mobile-first)', 'Feed, decision prompt, live meters — designed for a mid-range Android on mobile data.', 'bads', 'design', 'medium', 'in-progress', '2026-07-29', null),
  ('t-008', 'Author Flood Warning case content', 'Write the branching nodes + evidence items as validated content files.', 'kishia', 'historical-cases', 'high', 'todo', '2026-08-01', null),
  ('t-009', 'Build case player UI (feed + decisions)', 'Wire the interactive simulation UI to the engine.', 'gian', 'frontend', 'high', 'todo', '2026-08-02', 'Blocked until the engine (#t-005) and schema (#t-004) land.'),
  ('t-010', 'Timeline-collapse reveal animation', 'Branching timeline collapses into the real historical timeline (the money shot).', 'bads', 'design', 'medium', 'todo', '2026-08-03', null),
  ('t-011', 'Evidence Explorer component', 'Post-case view: every message, its verdict, and a citation to the real source.', 'bads', 'frontend', 'medium', 'todo', '2026-08-03', null),
  ('t-012', 'Reflection / Information Profile screen', 'Plain-language, non-judgmental insight + decision score.', 'gian', 'frontend', 'medium', 'todo', '2026-08-04', null),
  ('t-013', 'Community Toolkit resources', 'Curate real disaster-communication resources for the case unlock.', 'khylle', 'research', 'low', 'todo', '2026-08-02', null),
  ('t-014', 'Educator guide for Flood Warning', 'Discussion questions + learning outcomes.', 'khylle', 'proposal', 'low', 'todo', '2026-08-03', null),
  ('t-015', 'Write pitch video script', 'Max 3 min; open with the Lola/dam-release hook, get to the solution by 0:30.', 'kishia', 'pitch-video', 'high', 'todo', '2026-08-04', null),
  ('t-016', 'Record & edit pitch video', 'Screen-record the vertical slice; burn in English subtitles; clean audio.', 'kishia', 'pitch-video', 'high', 'todo', '2026-08-06', null),
  ('t-017', 'Accessibility & mobile QA pass', 'Keyboard nav, contrast, reduced-motion, low-bandwidth check.', 'bads', 'testing', 'medium', 'todo', '2026-08-05', null),
  ('t-018', 'Final deploy + submission dry run', 'Deploy to Vercel, verify the flagship case, rehearse the Tally submission.', 'gian', 'testing', 'high', 'todo', '2026-08-07', null)
on conflict (id) do nothing;
