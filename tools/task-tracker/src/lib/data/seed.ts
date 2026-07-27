import type { Member, Task } from "@/lib/schema/task.schema";

/**
 * Local mock data — the fallback used ONLY when Supabase isn't configured.
 *
 * It mirrors the team's live D1–D11 deliverable plan (same tasks, owners,
 * order, and dependencies) so the fallback is never a stale, different plan.
 * The full deliverable specs live in `docs/product-definition.md` and the
 * shared board; the descriptions here are concise objectives. Dependencies are
 * recorded in `blocker` (e.g. "D2; D3"), matching the shared board's convention.
 */

export const TEAM_MEMBERS: Member[] = [
  {
    id: "kishia",
    name: "Kishia",
    role: "Lead · Research / Content · QA Engineer",
    initials: "KI",
    color: "bg-indigo-100 text-indigo-700 ring-indigo-600/20",
  },
  {
    id: "gian",
    name: "Gian",
    role: "Database Engineer",
    initials: "GI",
    color: "bg-sky-100 text-sky-700 ring-sky-600/20",
  },
  {
    id: "bads",
    name: "Bads",
    role: "Backend Engineer",
    initials: "BA",
    color: "bg-rose-100 text-rose-700 ring-rose-600/20",
  },
  {
    id: "khylle",
    name: "Khylle",
    role: "Frontend Engineer",
    initials: "KH",
    color: "bg-teal-100 text-teal-700 ring-teal-600/20",
  },
];

const iso = (date: string, hour = 9): string =>
  new Date(`${date}T${String(hour).padStart(2, "0")}:00:00.000Z`).toISOString();

const created = iso("2026-07-26");

export const SEED_TASKS: Task[] = [
  {
    id: "d1",
    title: "D1: Product Definition",
    description:
      "Remove every ambiguity before anyone designs or builds — lock the case, loop, scope, pitch, audience, tracks, value, and success metric. See docs/product-definition.md.",
    assigneeId: "kishia",
    category: "research",
    priority: "high",
    status: "review",
    dueDate: "2026-07-27",
    blocker: null,
    createdAt: created,
    updatedAt: iso("2026-07-27"),
  },
  {
    id: "d2",
    title: "D2: Historical Content & Research",
    description:
      "Assemble the verified raw material for Case 001 (Typhoon Tino, Cebu) — every message and fact with a real citation. Distinguish media authenticity from claim accuracy.",
    assigneeId: "kishia",
    category: "research",
    priority: "high",
    status: "todo",
    dueDate: "2026-07-27",
    blocker: "D1",
    createdAt: created,
    updatedAt: created,
  },
  {
    id: "d3",
    title: "D3: UX Design",
    description:
      "Design the whole experience as flows and wireframes first, so the schema can be derived from what the UI must show. Mobile-first.",
    assigneeId: "khylle",
    category: "design",
    priority: "high",
    status: "in-progress",
    dueDate: "2026-07-29",
    blocker: "D1",
    createdAt: created,
    updatedAt: created,
  },
  {
    id: "d4",
    title: "D4: Data / Content Schema",
    description:
      "One validated schema for a Case, derived from UI needs plus real data. Everything downstream builds against it.",
    assigneeId: "gian",
    category: "backend",
    priority: "medium",
    status: "todo",
    dueDate: "2026-07-30",
    blocker: "D2; D3",
    createdAt: created,
    updatedAt: created,
  },
  {
    id: "d5",
    title: "D5: Case Content Authoring",
    description:
      "Encode the D2 research into the D4 schema as a complete, validated, cited case file.",
    assigneeId: "gian",
    category: "frontend",
    priority: "medium",
    status: "todo",
    dueDate: "2026-08-01",
    blocker: "D2; D4",
    createdAt: created,
    updatedAt: created,
  },
  {
    id: "d6",
    title: "D6: Simulation Engine",
    description:
      "A pure, deterministic engine: a validated Case plus player choices produce the node, meter state, and reflection. No React, no I/O.",
    assigneeId: "bads",
    category: "backend",
    priority: "medium",
    status: "todo",
    dueDate: "2026-08-02",
    blocker: "D4",
    createdAt: created,
    updatedAt: created,
  },
  {
    id: "d7",
    title: "D7: Frontend Implementation",
    description:
      "Build the UI components that render engine state per the D3 UX. Mobile-first and accessible.",
    assigneeId: "khylle",
    category: "frontend",
    priority: "medium",
    status: "todo",
    dueDate: "2026-08-03",
    blocker: "D3; D4",
    createdAt: created,
    updatedAt: created,
  },
  {
    id: "d8",
    title: "D8: Integration",
    description:
      "Assemble the real slice — engine plus authored content plus frontend — into one case playable end-to-end, deployed.",
    assigneeId: "bads",
    category: "backend",
    priority: "medium",
    status: "todo",
    dueDate: "2026-08-04",
    blocker: "D5; D6; D7",
    createdAt: created,
    updatedAt: created,
  },
  {
    id: "d9",
    title: "D9: QA / Testing",
    description:
      "Prove the slice works and meets requirements before it is filmed and submitted.",
    assigneeId: "kishia",
    category: "testing",
    priority: "medium",
    status: "todo",
    dueDate: "2026-08-04",
    blocker: "D8",
    createdAt: created,
    updatedAt: created,
  },
  {
    id: "d10",
    title: "D10: Proposal Document",
    description:
      "The proposal PDF covering all 8 UNESCO elements — clear, concise, in UNESCO language.",
    assigneeId: "kishia",
    category: "proposal",
    priority: "medium",
    status: "todo",
    dueDate: "2026-08-05",
    blocker: "D1; D2; D8",
    createdAt: created,
    updatedAt: created,
  },
  {
    id: "d11",
    title: "D11: Pitch Video",
    description:
      "A 3-minute pitch video: story, solution, impact. Open with a Cebu family deciding whether an image is real — the flood was real, some images were not.",
    assigneeId: "bads",
    category: "pitch-video",
    priority: "low",
    status: "todo",
    dueDate: "2026-08-07",
    blocker: "D1; D2; D8",
    createdAt: created,
    updatedAt: created,
  },
];
