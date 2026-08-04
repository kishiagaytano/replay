# D6 — Simulation Engine / Backend

## Purpose

This change completes the deterministic simulation layer: the case-content
contract, the state machine, scoring, the rule-based reflection required by
Product Definition §12, evidence resolution, and session persistence.

No server, database, or authentication is introduced. §15 excludes all three
from the MVP. The engine runs in the browser; "backend" in this project means
the validated contract and pure logic in `src/lib/`, not a network service.

---

## Case contract

### `Decision.signals` — new

Every decision now declares which of the six §12 checks it demonstrates:

```ts
signals: ['checked-source', 'sought-official-confirmation']
```

The six permitted values are fixed by §12 and defined once, in
`learningSignalSchema`:

`checked-source` · `checked-date-location` · `sought-official-confirmation` ·
`shared-with-context` · `acted-on-credible-warning` · `communicated-uncertainty`

Adding or renaming a value requires a signed-off revision of the Product
Definition, because the reflection copy and the scope contract both depend on
this list.

> The tags currently on Case 001 are a **draft** derived from each decision's
> own label. Which decisions demonstrate which check is content, not code, and
> is flagged in `case.ts` for review by Gigi and Kish. Retagging requires no
> engine change.

### `SimulationNode.evidenceId` — new

Nodes now link to the evidence artifact the player encounters there. Previously
`Decision.evidenceId` existed in the schema but no content used it, so the
Evidence Explorer had to fake the node mapping.

---

## Case validation — `src/lib/schema/validate-case.ts`

Zod checks the *shape* of a case. `validateCase()` checks everything a shape
cannot express, in two passes: schema first, then graph and references.

| Code | Level | Catches |
|---|---|---|
| `SCHEMA` | error | Any zod shape failure |
| `ENTRY_NOT_FOUND` | error | `entryNodeId` matches no node |
| `DUPLICATE_NODE_ID` / `DUPLICATE_DECISION_ID` | error | Ambiguous IDs |
| `UNKNOWN_NEXT` | error | `next` is neither a node ID nor `END` |
| `UNREACHABLE_NODE` | error | Node not reachable from the entry node |
| `NO_TERMINAL_PATH` | error | No path reaches `END` — unwinnable case |
| `UNKNOWN_EVIDENCE_REF` | error | `evidenceId` resolves to nothing |
| `DUPLICATE_EVIDENCE_ID` | error | Ambiguous evidence IDs |
| `DECISION_COUNT` | error | Node has fewer than 2 or more than 4 options (§8) |
| `PROFILE_MISMATCH` | error | A profile the scorer can emit is missing (§11) |
| `MISSING_REFLECTION` | error | No reflection block (§12, §15) |
| `ORPHAN_EVIDENCE` | warning | Evidence no node or decision surfaces |
| `UNTAGGED_NODE` | warning | No option at a node carries a learning signal |

**A case that passes `validateCase` with no errors cannot soft-lock the
simulation.** That is the guarantee this module exists to provide.

Wired in three places:

- `npm run validate:cases` — prints a report, exits non-zero on any error, so
  it can gate CI.
- `getCase()` in the registry validates once per case outside production and
  logs errors and warnings to the console, so a bad content edit surfaces while
  authoring rather than in the browser.
- The test suite asserts zero errors *and* zero warnings for every registered
  case.

---

## Engine changes — `src/lib/engine/simulation-engine.ts`

### Profile scoring is now explainable

`getProfile()` previously blended the authored `profileEffects` with heuristics
derived from meter deltas divided by `30`, `25` and `20`. Those constants were
undocumented, they double-counted intent the content author had already encoded,
and the tie-break resolved by accident of `reduce` order.

Scoring is now the sum of `profileEffects` alone. Exact ties resolve by a fixed,
documented priority — `responsible` → `skeptical` → `emotional` — which shows the
least-punitive description first, per §11. `getProfileScores()` exposes the raw
totals so the result can be shown to the player rather than asserted at them.

All three profile paths still resolve to the same profiles as before this change.

### `DecisionRecord` carries more

Added `signals` (the checks the option demonstrated) and `metersAfter` (meter
values after the decision was applied), so the debrief can show how the run
moved without re-simulating. `getHistory()` now returns a deep copy; callers
cannot mutate engine state through it.

### `getRunSummary(): RunSummary` — new

One serializable object containing everything the debrief needs: meters,
decision history, signal tallies, profile, profile scores, and the reflection.
This is the contract the frontend renders against.

```ts
interface RunSummary {
  caseId: string;
  caseTitle: string;
  completed: boolean;
  meters: SimulationState;
  decisions: DecisionRecord[];
  signalsDemonstrated: SignalTally;
  signalOpportunities: SignalTally;
  profile: BehavioralProfile | null;
  profileScores: Record<string, number>;
  reflection: ReflectionLine[];
}
```

The engine still imports nothing but types and pure helpers — no React, no
framework, no I/O.

---

## Reflection — `src/lib/engine/reflection.ts`

Deterministic, rule-based, generated from recorded decisions, free of generative
AI (§12).

Two tallies drive it:

- **opportunities** — how many decision moments offer each check at all,
  counted once per node so a node with three source-checking options still
  counts as one opportunity;
- **demonstrated** — how many times the player took an option carrying that
  check.

The ratio selects one of three tones, per check:

| Ratio | Tone |
|---|---|
| ≥ 0.70 | affirming |
| 0.30 – 0.70 | encouraging |
| < 0.30 | instructive |

Copy for all eighteen combinations is written out in full and reviewed against
§11's "descriptive, not shaming" rule. A test asserts that no generated line
contains punitive language on any path.

Lines always appear in the §12 order of the six checks, and a check the case
never offers produces no line.

---

## Evidence index — `src/lib/engine/evidence-index.ts`

Resolves evidence to the node where the player met it, using the node and
decision `evidenceId` links. Replaces the previous `nodeId: ev.id` placeholder
and the `claim.substring(0, 80) + '...'` stand-in for "what the player
encountered" (§13).

- `buildEvidenceIndex(case)` — `nodeId → EvidenceItem[]`
- `buildEvidenceEntries(case, options)` — all entries, ordered by node
- `getEncounteredEvidence(case, history, options)` — only what this run reached

Media authenticity and claim accuracy remain two separate fields throughout, as
§13 requires. They are never collapsed into a single "is it fake" flag.

---

## Persistence — `src/lib/engine/persistence.ts`

Saved runs still store only decision IDs and are restored by replaying them
through the engine, so a saved run can never disagree with engine logic.

Hardened:

- The stored payload is validated with zod on load. `JSON.parse(raw) as
  SavedSimulation` — a blind cast — is gone. A malformed entry returns `null`
  and is cleared, never partially trusted.
- `version` (`SAVE_VERSION`) discards saves from an older shape.
- `caseRevision`, from `computeCaseRevision()`, fingerprints the entry node and
  every node/decision/next triple. Copy edits and meter tuning do not invalidate
  saves; changing the decision graph does. This is what stops a content edit
  from breaking every tester's saved run mid-demo.
- `savedAt` (ISO timestamp) for debugging tester sessions.

---

## Debrief — reflection now renders

`debrief/page.tsx` is a server component and cannot see the player's run, which
lives in client context. `src/components/debrief/run-summary.tsx` bridges the
two: it mounts its own provider, rehydrates the run from the saved decision IDs,
and renders the profile, the six reflection lines with progress indicators, and
a collapsible "How this was calculated" panel showing the raw profile scores.

It contains no scoring logic. Everything it displays comes from `RunSummary`.

---

## Tests

83 passing (was 27).

| File | Covers |
|---|---|
| `schema/__tests__/validate-case.test.ts` | Every issue code, plus the clean case |
| `engine/__tests__/traversal.test.ts` | **All 49,152 paths** through Case 001: every path terminates, meters stay 0–100 at every step, every path yields a valid profile |
| `engine/__tests__/run-summary.test.ts` | Determinism, tallies, tone selection, no punitive language, JSON-serializability, history immutability |
| `engine/__tests__/persistence.test.ts` | Round-trip fidelity, malformed / stale / wrong-version saves, server-side no-op |
| `content/…/__tests__/scope-contract.test.ts` | §15 MVP scope and §9 node matrix as executable checks |
| `engine/__tests__/simulation-engine.test.ts` | Rewritten to assert deltas against authored `effects` instead of hard-coded totals, so meter tuning no longer breaks the engine suite |

The traversal test collects failures and asserts once at the end; a per-step
`expect` across ~400k decisions dominated the runtime of the entire suite.

---

## Verification

- `npm test` — 83 passed, 9 files
- `npm run validate:cases` — 0 errors, 0 warnings; exits 1 on a deliberately
  broken edge (verified by pointing a `next` at a non-existent node)
- `tsc --noEmit` over `src/lib`, `content`, `src/components/debrief`, and
  `scripts` — clean

`npm run build` was not run in the authoring environment and should be run
locally before merging.

---

## Follow-ups

1. **Content review of the draft signal tags** — Gigi and Kish. This is the only
   item blocking the reflection from being demo-final.
2. **`npm run build`** locally to confirm the new client component composes with
   the App Router.
3. **Evidence Explorer page** can now switch from all-evidence to
   `getEncounteredEvidenceEntries(history)` if the team wants the Explorer to
   show only what the player actually met.
4. **Wire `validate:cases` into CI** alongside `npm test`.
