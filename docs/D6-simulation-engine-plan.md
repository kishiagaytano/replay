# D6 — Simulation Engine / Backend: Work Plan

**Owner:** Bads (Backend Engineer)
**Depends on:** D1 Product Definition (locked), D2 Case Research Pack, D4–D5 Schema & Decision-Flow Changes
**Target:** August 7, 2026 (internal completion target, §1 of the Product Definition)

---

## 0. Scope: what "backend" means in this project

Read §15 of the Product Definition before writing any code. It **explicitly excludes**
user accounts, authentication, and a production database. There is no server to build.

D6 is therefore the **deterministic simulation layer** that lives in `src/lib/` and the
contracts it enforces on case content:

| In scope for D6 | Out of scope |
|---|---|
| `src/lib/engine/simulation-engine.ts` — state machine | REST/GraphQL API routes |
| `src/lib/engine/simulation-context.tsx` — React binding | Postgres / Prisma / any DB |
| `src/lib/engine/persistence.ts` — session save/restore | Auth, sessions, user records |
| `src/lib/schema/*.ts` — validated case contract | Server-side rendering of player state |
| Case validation, scoring, reflection, evidence index | Anything in §15 "Explicitly excluded" |

> If someone asks "where's the backend?", the answer is: the engine **is** the backend.
> It runs in the browser because the MVP has one case, no accounts, and no shared state.
> Do not add a database to make the deliverable look bigger — that breaks the scope contract.

---

## 1. Where the code stands today (audit)

I read the current `main` state. Here's the honest picture.

### Working

- `SimulationEngine` is a clean, side-effect-free class: `getCurrentNode`, `getState`,
  `getHistory`, `isComplete`, `makeDecision`, `reset`, `getProfile`.
- Meters start at 50, clamp to 0–100, and apply `decision.effects` correctly.
- `SimulationProvider` restores a run by **replaying decision IDs**, which is the right
  choice — it means saved state can never diverge from engine logic.
- Case 001 content is structurally sound: 8 nodes (`tino-00` hook + `tino-01`…`tino-07`
  = **7 decision moments**, matching §9), 31 decisions total, 6 evidence entries
  (§15 requires ≥6), 3 profiles, 1 toolkit card.
- Zod schemas cover Case, Node, Decision, Evidence, SourceRef.
- 23 tests pass.

### Gaps — this is your D6 work list

| # | Gap | Why it matters | Severity |
|---|---|---|---|
| G1 | **No case graph validation.** Nothing checks that `entryNodeId` exists, that every `decision.next` resolves to a real node or `END`, that every node is reachable, or that no node is a dead end. | A typo in `next:` ships a soft-locked simulation. This is the single highest-value backend artifact you can produce. | **High** |
| G2 | **Reflection is not implemented.** §12 requires a rule-based reflection over six named checks (source · date/location · official confirmation · context · acting on warnings · communicating uncertainty). The engine has no representation of those six checks. `debrief/page.tsx` has an empty `{/* ── Reflection Profiles ── */}` comment. | This is a **required MVP deliverable** (§15). It is currently missing entirely. | **High** |
| G3 | **Profile scoring uses unexplained magic numbers.** `getProfile()` blends explicit `profileEffects` with heuristics derived from meter deltas divided by 30, 25 and 20. Nobody can justify those constants to a judge, and the tie-break silently defaults to `responsible`. | §12 says scoring "must preserve the meanings defined in this document." Derived heuristics dilute meanings the content author already encoded in `profileEffects`. | **High** |
| G4 | **Evidence is never linked to nodes.** `Decision.evidenceId` exists in the schema but **zero** decisions use it. `getEvidenceExplorerEntries()` fakes the link with `nodeId: ev.id` and truncates the claim with `.substring(0, 80)`. | §13 requires the Explorer to show "what the player encountered." Right now it shows a truncated claim, not the encounter. | **Medium** |
| G5 | **Schema allows content the spec forbids.** `decisions` has `.min(1)`; §8 mandates **2–4** choices per node. Nothing validates that `evidenceId`, `sprite`, or `background` references resolve. | Invalid content passes validation and fails at runtime or on screen. | **Medium** |
| G6 | **Persistence does no validation and has no version.** `loadSimulation` does `JSON.parse(raw) as SavedSimulation` — a blind cast. A malformed or stale entry is trusted until replay throws. | Content edits silently invalidate every tester's saved run mid-demo. | **Medium** |
| G7 | **No meter history.** `DecisionRecord` stores the delta but not the resulting meter values. | The debrief can't show how meters moved across the run. | **Low** |
| G8 | **Debrief can't see the run.** `debrief/page.tsx` is a server component that only reads case data; profile and meters live in client context. | The profile the engine computes is never rendered. | **Medium** |

---

## 2. Recommended sequence

Do them in this order. Each step is independently shippable and testable.

### Step 1 — `validateCase()` (G1, G5) — *start here*

New file: `src/lib/schema/validate-case.ts`

```ts
export interface CaseValidationIssue {
  level: 'error' | 'warning';
  code: string;      // 'UNKNOWN_NEXT' | 'UNREACHABLE_NODE' | ...
  message: string;
  nodeId?: string;
  decisionId?: string;
}

export function validateCase(data: unknown): {
  ok: boolean;
  case?: Case;
  issues: CaseValidationIssue[];
};
```

Layer it in two passes:

1. **Shape** — run `caseSchema.safeParse(data)`. Map Zod issues to `CaseValidationIssue`.
2. **Graph & references** — only if the shape passed:
   - `entryNodeId` resolves to a node → else `ENTRY_NOT_FOUND`
   - node IDs are unique → else `DUPLICATE_NODE_ID`
   - every `decision.next` is `'END'` or a known node ID → else `UNKNOWN_NEXT`
   - decision IDs are unique **within** a node → else `DUPLICATE_DECISION_ID`
   - every node is reachable from `entryNodeId` (BFS) → else `UNREACHABLE_NODE`
   - `'END'` is reachable → else `NO_TERMINAL_PATH`
   - every node has 2–4 decisions (§8) → else `DECISION_COUNT` *(warning on the hook node if you want to allow 3)*
   - every `decision.evidenceId`, if present, resolves to an evidence item → else `UNKNOWN_EVIDENCE_REF`
   - `reflection.profiles` contains exactly the three IDs the scorer emits → else `PROFILE_MISMATCH`

Then wire it in:

- **Test:** `content/cases/the-flood-was-real/__tests__/case.validation.test.ts` asserts
  `validateCase(case001).ok === true` with zero errors.
- **Registry:** validate on load in dev (`if (process.env.NODE_ENV !== 'production')`) so a
  bad edit fails loudly at the point of authoring, not in the browser.
- Optionally add an `npm run validate:cases` script — a nice thing to show in the demo.

**Why first:** it is self-contained, it protects everyone else's work (especially Gigi's
content authoring), and it is the clearest evidence of a real backend contribution.

### Step 2 — Learning signals + reflection (G2, G3)

This is the deliverable §12 requires and it does not exist yet. Two parts.

**2a. Add a `signals` field to `Decision`** in `case.schema.ts`:

```ts
export const learningSignalSchema = z.enum([
  'checked-source',
  'checked-date-location',
  'sought-official-confirmation',
  'shared-with-context',
  'acted-on-credible-warning',
  'communicated-uncertainty',
]);

// inside decisionSchema:
signals: z.array(learningSignalSchema).default([]),
```

These six values are lifted verbatim from §12 — do not invent new ones without a
Product Definition revision. Gigi tags each of the 31 decisions with the signals it
demonstrates. This is a **content** task; coordinate the handoff, don't guess the tags
yourself.

**2b. Replace the heuristic scoring** in `getProfile()`:

```ts
getRunSummary(): RunSummary   // new: serializable, everything the debrief needs
```

```ts
interface RunSummary {
  caseId: string;
  meters: SimulationState;
  decisions: DecisionRecord[];
  signalCounts: Record<LearningSignal, number>;   // times demonstrated
  signalOpportunities: Record<LearningSignal, number>; // times available
  profile: BehavioralProfile;
  profileScores: Record<string, number>;          // for transparency
  reflection: ReflectionLine[];                    // rule-based, deterministic
}
```

Scoring rules, kept explainable:

- Profile score = **sum of `profileEffects` only**. Drop the `/30`, `/25`, `/20` derived
  terms. The content author already encoded intent per decision; deriving a second signal
  from meter deltas double-counts it and makes the result impossible to explain.
- Ties: break by a fixed, documented priority order, not by `reduce` accident.
- Reflection lines are generated from `signalCounts` vs `signalOpportunities` with a
  simple threshold table, e.g.:

  | Ratio | Tone | Example line |
  |---|---|---|
  | ≥ 0.7 | affirming | "You checked where information came from in 5 of 7 moments." |
  | 0.3–0.7 | encouraging | "You sometimes checked the date and location — building that into a habit is the next step." |
  | < 0.3 | instructive, never punitive | "Official sources like PAGASA confirm what's real faster than social replies do." |

  §11 is explicit: **descriptive, not shaming.** No "wrong," "failed," or "incorrect"
  anywhere in the generated copy. Write the strings so they read fine at every threshold.

- Keep it **pure**: same decision IDs in → identical reflection out. Test that directly.

### Step 3 — Evidence index (G4)

New: `src/lib/engine/evidence-index.ts`

```ts
export function buildEvidenceIndex(caseData: Case): Map<string, EvidenceItem[]>; // nodeId → evidence
export function getEncounteredEvidence(caseData: Case, history: DecisionRecord[]): EvidenceExplorerEntry[];
```

Ask Gigi to populate `evidenceId` on the decisions (or add a node-level `evidenceId`,
which is probably cleaner given the case is linear — each node surfaces one artifact).
Then replace the `substring(0, 80)` hack in `content/cases/.../evidence.ts` with the real
node text the player saw.

Keep the §13 rule in the engine's shape: **media status and claim accuracy are separate
fields** and must never be collapsed into one "is it fake" boolean.

### Step 4 — Harden persistence (G6, G7)

In `persistence.ts`:

- Define a zod schema for the saved payload and `safeParse` it in `loadSimulation`.
  Return `null` on failure instead of casting.
- Add `version: 1` and a `caseRevision` string. Bump `caseRevision` whenever decision IDs
  change; mismatched saves are discarded cleanly instead of throwing during replay.
- Add `savedAt` (ISO string) — useful for the demo and for debugging tester sessions.

In `simulation-engine.ts`, extend `DecisionRecord` with `metersAfter: SimulationState`
so the debrief can chart the run without re-simulating.

### Step 5 — Expose the run to the debrief (G8)

`debrief/page.tsx` is a server component and cannot read client context. Add a client
component — `src/components/debrief/run-summary.tsx` — that calls `useSimulation()`,
reads `getRunSummary()`, and renders profile + reflection under the existing empty
`{/* ── Reflection Profiles ── */}` marker. Handle the "no completed run" case with a
prompt to play the simulation.

This is a boundary you own even though it renders UI: define the `RunSummary` shape and
hand Khylle a stable contract to style against. Agree on it **before** he builds the layout.

### Step 6 — Tests (do this alongside, not at the end)

Add to `src/lib/engine/__tests__/`:

- **Exhaustive traversal** — walk every decision at every node; assert no throw, meters
  stay within 0–100, and every path terminates at `END`.
- **Determinism** — the same decision sequence produces an identical `RunSummary`
  (deep-equal), run twice.
- **Profile boundaries** — one path per profile, plus a deliberate near-tie to prove the
  tie-break rule is stable rather than incidental.
- **Persistence round-trip** — save → load → replay reproduces meters and history exactly;
  a corrupted or stale entry returns `null` without throwing.
- **Spec conformance** — 7 decision moments, 2–4 options each, ≥6 evidence entries,
  3 profiles, 1 toolkit card. This test *is* the §15 scope contract in executable form.

The existing engine tests hard-code expected meter values (`58`, `60`, `55`). Those break
on any content tuning. Prefer asserting the **delta** against the decision's declared
`effects` so the test survives balance changes.

---

## 3. Definition of done for D6

- [ ] `validateCase()` exists, is covered by tests, and Case 001 passes with zero errors
- [ ] Every `decision.next` and `evidenceId` reference is machine-verified
- [ ] Six §12 learning signals modelled in the schema and tagged across all 31 decisions
- [ ] `getRunSummary()` returns a serializable summary with profile + reflection
- [ ] Profile scoring is explainable — no undocumented constants
- [ ] Reflection copy is descriptive at every threshold; no punitive language (§11)
- [ ] Evidence resolves to the node where the player encountered it (§13)
- [ ] Persistence validates input, carries a version, and fails closed
- [ ] Reflection renders on the debrief page
- [ ] `npm test` and `npm run build` both pass
- [ ] Short `docs/D6_Engine_Spec.md` written in the same style as `D4-D5_Changes.md`

---

## 4. Coordination notes

- **Gigi (Case Data Architect)** owns tagging the 31 decisions with learning signals and
  populating `evidenceId`. You own the schema and validator; she owns the values. Send her
  the signal enum and the validator error messages as soon as Step 1 lands — the validator
  is her feedback loop.
- **Khylle (Frontend)** needs the `RunSummary` shape locked before he builds the debrief
  layout. Publish the TypeScript interface early, even before it's implemented.
- **Kish (Lead/QA)** should review the reflection copy against §11's "descriptive, not
  shaming" rule and §12's six checks. Generated strings are player-facing content, so they
  go through content review, not just code review.

## 5. Traps specific to this codebase

- `AGENTS.md` warns that this is **Next.js 16** and differs from what most references
  assume. Check `node_modules/next/dist/docs/` before touching anything app-router-shaped.
- Keep the engine **framework-free**. `simulation-engine.ts` currently imports nothing but
  types — preserve that. It's why the engine is trivially testable, and it's what lets you
  claim a real backend layer.
- §11 locks **one historical timeline**. The graph is deliberately linear: all four
  decisions at each node converge on the same next node. Don't "improve" this into
  branching paths — choices change the player's *profile*, not history.
- §19's fabrication guard applies to generated reflection text too. Reflection may describe
  the player's behavior; it may not assert new historical facts.
