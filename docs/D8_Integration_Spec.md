# D8 — Integration & Preview Deploy

## Purpose

Assemble the real slice: engine (D6) + authored content + frontend (D7) into one
case playable end-to-end, deployed to a preview URL.

Scope is the one case and the full loop. Production hardening is out (phase 6).

---

## What D8 found

D7's definition of done was "all loop screens implemented and navigable." Three
pieces of the §8 loop did not exist in the codebase when integration started:

| Missing | Consequence |
|---|---|
| The historical reveal — no component, no route, no content | §8 step 6 and §15's "one documented historical reveal" were unmet. D8's own DoD requires "the reveal shows real cited sources." |
| Live meters during play | §8 step 4 is "experience consequences." Meters existed only on the completion screen, so a player made seven decisions seeing nothing change. |
| A case intro | `/cases/[caseId]` dropped straight into the first decision with no framing of the player's role or the §6 responsibility boundary. |

These were built as part of D8 rather than deferred, since the loop cannot be
assembled around holes.

A fourth item was a genuine integration mismatch of the kind D8 anticipates: the
Evidence Explorer read `caseData.evidence` directly and ignored the D6 evidence
index entirely.

---

## The loop is now one ordered path

`src/lib/loop.ts` defines the sequence once:

```
intro → play → reveal → evidence → debrief
```

Every screen renders its "continue" control from this list rather than
hard-coding a successor. Before D8 the completion screen offered Evidence and
Debrief as two side-by-side cards — a fork, not a loop.

| Route | Screen |
|---|---|
| `/cases/[caseId]` | Case brief (new) |
| `/cases/[caseId]/play` | Simulation (moved from the bare `[caseId]` route) |
| `/cases/[caseId]/reveal` | Historical reveal (new) |
| `/cases/[caseId]/evidence` | Evidence Explorer (rewired) |
| `/cases/[caseId]/debrief` | Reflection + toolkit |

`LoopProgress` shows position in the sequence on every screen; completed steps
are clickable so a player can go back without losing their run.

---

## Historical reveal

### Contract

`historicalReveal` was added to the case schema:

```ts
{
  title: string;
  intro: string;
  beats: Array<{
    nodeId?: string;         // the decision moment this corresponds to
    date: string;            // what was knowable, and when
    headline: string;
    whatHappened: string;
    confirmedLater?: string; // verification that arrived afterwards
    simulated?: boolean;     // reconstructed exercise, must be labeled
    citations: SourceRef[];  // at least one, enforced by schema
  }>;
  closing?: string;
}
```

The `date` / `confirmedLater` split exists to honour §9's knowable-vs-later rule.
The AFP debunk (Nov 7) and the VERA Files debunk (Nov 11) are shown as
*later* verification, explicitly framed as unavailable at the moment the player
had to decide — not as knowledge they already had.

### Content

Seven beats, one per decision moment. **No new claim, quotation, time, or figure
was introduced.** Every beat cites a source already registered in §18 of the
Product Definition, and a test enforces this by URL: a reveal citation whose URL
is not in the case's own source register fails the build.

Node 7's beat is marked `simulated` and says so in its own copy, per §9's rule
that a reconstructed exercise must never read as something a real person did.

### New validator rules

| Code | Level | Catches |
|---|---|---|
| `MISSING_REVEAL` | error | Case has no reveal (§8 step 6, §15) |
| `UNKNOWN_REVEAL_NODE` | error | Beat references a node that doesn't exist |
| `UNLABELED_SIMULATED_BEAT` | error | `simulated: true` but the copy doesn't say so |
| `NODE_WITHOUT_REVEAL` | warning | A decision moment the player lived through has no beat |

---

## Live meters

`MeterHUD` pins the three indicators above the scene during play and flashes the
delta for ~2s when one changes. Values are announced to screen readers via an
`aria-live` region.

Deltas are derived by comparing against previous props **during render** — the
documented "adjust state when props change" pattern — rather than in an effect,
which would render the stale value first and trip the repo's
`react-hooks/set-state-in-effect` rule.

The choice prompt's top padding was increased so options clear the HUD.

---

## Evidence Explorer rewiring

Now built from `getEvidenceExplorerEntries()`, so each item carries:

- **what the player encountered** — the real node text they saw, resolved
  through the node ⇄ evidence links, replacing the previous
  `claim.substring(0, 80) + '...'` placeholder;
- **how it was verified** — the verification method;
- **the teaching point** on the synthetic-media items.

`channel` and `note` were added to `EvidenceExplorerEntry` so the Explorer keeps
its channel tags and provenance notes after the switch. Media authenticity and
claim accuracy remain two separate fields, per §13.

---

## Accessibility & motion

- A global `prefers-reduced-motion: reduce` block disables animation and
  transitions app-wide. Every animation here is decorative — the same content is
  present either way — so a blanket rule is safer than per-component audits.
- `usePrefersReducedMotion()` (`useSyncExternalStore`) gives components the value
  correctly on first client render and reacts to mid-session changes. The reveal
  uses it to render the full timeline immediately instead of staggering.
- Backgrounds carry meaningful `alt` text, or `aria-hidden` when purely
  decorative.
- 44px minimum tap targets under 400px width.

---

## Media / low-bandwidth

Only the opening scene's background is `priority`; later scenes are `loading="lazy"`
and stream in as the player reaches them, which matters on mobile data. Pixel art
stays `unoptimized` deliberately — optimisation resamples it and destroys the
pixel grid.

---

## Deployment

`vercel.json` sets the build command so **content validation gates every deploy**:

```json
{ "buildCommand": "npm run validate:cases && npm run build" }
```

A case with a broken decision graph, an unresolved evidence reference, or an
uncited reveal beat cannot reach the preview URL.

### First-time setup

1. Push the branch to GitHub.
2. At vercel.com → **Add New → Project**, import `kishiagaytano/replay`.
3. Framework preset: Next.js (auto-detected). Root directory: repo root.
4. No environment variables are required.
5. Deploy. Every subsequent push to the branch gets its own preview URL, and the
   PR gets a comment linking to it.

`npm run validate:cases` was also added to `package.json` — it was missing from
this branch even though `scripts/validate-cases.ts` and `tsconfig.scripts.json`
were both present.

---

## Verification

- `npm test` — **98 passed** (was 87), 10 files
- `npm run validate:cases` — 0 errors, 0 warnings
- `npm run build` — ✓, 8 routes including `/play` and `/reveal`
- `npx eslint` on all files added in D8 — clean
- **Headless Chromium at 390×844** (iPhone 14 viewport), full loop walked
  end-to-end: all five screens returned 200, **no console errors, no page
  errors, and no horizontal overflow on any screen**. Screenshots captured per
  screen.

### New tests

`src/lib/__tests__/loop.test.ts` covers the loop order and next/previous links,
and asserts per case that: the reveal exists with cited beats; every decision
moment after the hook has a beat; simulated beats are labelled in their own copy;
and every reveal citation URL appears in the case's registered sources.

---

## Still open

1. **Real-device check.** The 390×844 headless pass is a viewport check, not a
   device check. D8's DoD says "verify on a real phone" — do that against the
   Vercel preview URL once it's live.
2. **Pixel art assets** were not present in the integration workspace, so the
   scenes rendered on their gradient fallbacks. Confirm the PNGs load on the
   preview.
3. **Draft signal tags** in `case.ts` still need Gigi and Kish's content review —
   carried over from D6.
4. **Reveal copy** should get the same Cebu-aware review §20 requires of other
   player-facing historical text.
