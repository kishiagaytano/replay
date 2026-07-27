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
  ('kishia', 'Kishia', 'Lead · Research / Content · QA Engineer', 'KI', 'bg-indigo-100 text-indigo-700 ring-indigo-600/20'),
  ('gian',   'Gian',   'Database Engineer',                       'GI', 'bg-sky-100 text-sky-700 ring-sky-600/20'),
  ('bads',   'Bads',   'Backend Engineer',                        'BA', 'bg-rose-100 text-rose-700 ring-rose-600/20'),
  ('khylle', 'Khylle', 'Frontend Engineer',                       'KH', 'bg-teal-100 text-teal-700 ring-teal-600/20')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Seed: tasks — the D1–D11 deliverable plan (created_at / updated_at default to
-- now()). Mirrors the shared board: concise objective per task; dependencies in
-- `blocker` (e.g. "D2; D3"). Full specs live in docs/product-definition.md.
-- ---------------------------------------------------------------------------
insert into public.tasks (id, title, description, assignee_id, category, priority, status, due_date, blocker) values
  ('d1',  'D1: Product Definition', 'Remove every ambiguity before anyone designs or builds — lock the case, loop, scope, pitch, audience, tracks, value, and success metric. See docs/product-definition.md.', 'kishia', 'research', 'high', 'review', '2026-07-27', null),
  ('d2',  'D2: Historical Content & Research', 'Assemble the verified raw material for Case 001 (Typhoon Tino, Cebu) — every message and fact with a real citation. Distinguish media authenticity from claim accuracy.', 'kishia', 'research', 'high', 'todo', '2026-07-27', 'D1'),
  ('d3',  'D3: UX Design', 'Design the whole experience as flows and wireframes first, so the schema can be derived from what the UI must show. Mobile-first.', 'khylle', 'design', 'high', 'in-progress', '2026-07-29', 'D1'),
  ('d4',  'D4: Data / Content Schema', 'One validated schema for a Case, derived from UI needs plus real data. Everything downstream builds against it.', 'gian', 'backend', 'medium', 'todo', '2026-07-30', 'D2; D3'),
  ('d5',  'D5: Case Content Authoring', 'Encode the D2 research into the D4 schema as a complete, validated, cited case file.', 'gian', 'frontend', 'medium', 'todo', '2026-08-01', 'D2; D4'),
  ('d6',  'D6: Simulation Engine', 'A pure, deterministic engine: a validated Case plus player choices produce the node, meter state, and reflection. No React, no I/O.', 'bads', 'backend', 'medium', 'todo', '2026-08-02', 'D4'),
  ('d7',  'D7: Frontend Implementation', 'Build the UI components that render engine state per the D3 UX. Mobile-first and accessible.', 'khylle', 'frontend', 'medium', 'todo', '2026-08-03', 'D3; D4'),
  ('d8',  'D8: Integration', 'Assemble the real slice — engine plus authored content plus frontend — into one case playable end-to-end, deployed.', 'bads', 'backend', 'medium', 'todo', '2026-08-04', 'D5; D6; D7'),
  ('d9',  'D9: QA / Testing', 'Prove the slice works and meets requirements before it is filmed and submitted.', 'kishia', 'testing', 'medium', 'todo', '2026-08-04', 'D8'),
  ('d10', 'D10: Proposal Document', 'The proposal PDF covering all 8 UNESCO elements — clear, concise, in UNESCO language.', 'kishia', 'proposal', 'medium', 'todo', '2026-08-05', 'D1; D2; D8'),
  ('d11', 'D11: Pitch Video', 'A 3-minute pitch video: story, solution, impact. Open with a Cebu family deciding whether an image is real — the flood was real, some images were not.', 'bads', 'pitch-video', 'low', 'todo', '2026-08-07', 'D1; D2; D8')
on conflict (id) do nothing;
