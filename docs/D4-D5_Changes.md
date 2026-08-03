# D4–D5 Schema and Decision-Flow Changes

## Purpose

This change removes unused case metadata and eliminates the duplicate choice
representation in simulation nodes. A case now describes each selectable option
once, as a decision, rather than maintaining separate UI-choice and game-logic
records that have to stay in sync.

## Case schema changes

### Removed `Case.characters`

`Case.characters` was removed from `caseSchema` and from Case 001.

It was an unused character roster. The visual-novel UI already presents a
character from each `SimulationNode`:

- `speaker` provides the displayed name.
- `sprite` selects the rendered character asset.

Removing the roster does not remove Lola, Maria, or Jeff from the simulation.
Their scene-level `speaker` and `sprite` fields remain in the case content.

### Removed `Case.educatorGuide`

`Case.educatorGuide` was removed from `caseSchema`.

It had no frontend page, engine use, or content consumer. Keeping it in the
validated contract would allow content that the application cannot present.

## Simulation node decision-flow changes

### Removed `VNChoice` and `SimulationNode.vnChoices`

The separate `vnChoiceSchema`, `VNChoice` type, and `SimulationNode.vnChoices`
field were removed.

Previously, every option was duplicated:

```ts
vnChoices: [{ id: 'verify', label: 'VERIFY', timerSeconds: 5 }]
decisions: [{ id: 'verify', label: 'VERIFY — Check the source', effects: { /* ... */ }, next: 'node-02' }]
```

Both records had to use the same ID. A mismatch could show a button that did
not execute a decision, or leave a valid decision inaccessible in the UI.

### `Decision` is now the single source of truth

`Decision` now includes an optional `timerSeconds` field. The Case 001 choice
timers were moved from `vnChoices` into their matching decisions.

Each `SimulationNode.decisions` entry now provides:

- `id` — stable option identifier;
- `label` — player-facing decision text;
- `timerSeconds` — optional countdown for that option;
- `effects` — meter changes applied by the simulation engine;
- `next` — next node ID or `END`.

The visual-novel UI renders `node.decisions` directly and passes the selected
decision ID to the simulation engine. No ID matching between two arrays is
required.

```text
SimulationNode.decisions[]
  → choice buttons in the UI
  → selected decision ID
  → effects applied by the engine
  → next node or END
```

### Removed node-level `timerSeconds`

The node-level timer field was removed because the current UI does not use it.
Countdown timing is now owned by the individual decision it affects.

## Files changed

- `src/lib/schema/case.schema.ts`
- `content/cases/the-flood-was-real/case.ts`
- `src/components/vn/choice-prompt.tsx`
- `src/components/vn/vn-stage.tsx`
- `src/lib/schema/__tests__/case.schema.test.ts`

## Verification

- `npm test` passed: 23 tests.
- `npm run build` passed.

The repository-wide lint command still reports pre-existing issues in scripts,
generated `tools/task-tracker/.next` files, and existing React hook diagnostics.
Those issues are outside this schema-focused change.
