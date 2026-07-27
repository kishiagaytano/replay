# CLAUDE.md — rePlay Engineering Handbook

> **This is the permanent engineering handbook for the rePlay repository.**
> Every Claude coding session (and every human contributor) should read this before writing code.
> It exists so no one ever has to re-explain what rePlay is, how it should be built, or what "good" looks like here.
>
> If a future decision contradicts this document, update this document in the same change. This file is the source of truth.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Product Philosophy](#2-core-product-philosophy)
3. [MVP Scope](#3-mvp-scope)
4. [Technical Stack](#4-technical-stack)
5. [Repository Structure](#5-repository-structure)
6. [The Case Content Model (Architectural Core)](#6-the-case-content-model-architectural-core)
7. [Coding Standards](#7-coding-standards)
8. [UI / UX Principles](#8-ui--ux-principles)
9. [Gameplay Principles](#9-gameplay-principles)
10. [AI Principles](#10-ai-principles)
11. [Data Principles](#11-data-principles)
12. [Team Workflow](#12-team-workflow)
13. [Current Sprint](#13-current-sprint)
14. [Development Roadmap](#14-development-roadmap)
15. [Instructions for Every Future Claude Session](#15-instructions-for-every-future-claude-session)

---

## 1. Project Overview

### What rePlay is

**rePlay is a gamified web platform that turns verified Philippine information crises into immersive, decision-based simulations.** Players relive real documented events — a typhoon flood, an election misinformation wave, an AI-enabled scam — exactly as they unfolded, making decisions under the same uncertainty real people faced at the time. After each case, the simulation collapses into the *actual historical timeline*, revealing what really happened, the evidence behind every message, and the consequences of each choice.

It is not a quiz app and not a fact-checker. It is **playable information history**: a living, growing archive of teachable information cases that educators, journalists, and institutions can contribute to over time.

### Vision

A Philippines — and eventually a world — where media and information literacy is learned by *experiencing* real information crises in a safe space, not by memorizing definitions. rePlay becomes a national (then global) repository of playable information history that classrooms, newsrooms, and communities return to whenever a new crisis needs to be understood.

### Mission

To help young people practice **responsible decision-making under uncertainty** — the skill that actually matters when information is incomplete, emotional, and fast-moving — by reconstructing verified real events and letting learners live through them, make choices, and see the documented consequences.

### Elevator pitch (use verbatim)

> **History already happened. Your decisions do not have to repeat it.**
> rePlay is a gamified web platform that transforms verified Philippine information crises into interactive, evidence-based simulations, empowering youth to build media and information literacy through real-world decision-making, reflection, and historical replay.

**Case-specific hook:** *"The flood was real. Some of the images were not. Would you know what to trust—and when to act?"*

**One line for the pitch video / judges:** *"We turned real information crises into the world's first playable classroom."*

> The locked wording for the pitch, hook, and tagline lives in [`docs/product-definition.md`](docs/product-definition.md) §3 — the source of truth for Case 001.

### UNESCO context

This project is built for the **UNESCO Youth Hackathon 2026 — "Play Your Part: Youth Designing the Future of Media and Information Literacy."**

- **Organizer:** UNESCO Media and Information Literacy (MIL) Unit.
- **Team:** Kishia · Gian · Bads · Khylle (all aged 18–30).
- **Chosen challenge tracks:** **AI and MIL** + **MIL Education** (straddle strategy — AI relevance + concrete educational mechanism).
- **Format category:** App/Website (with strong Game characteristics).
- **UNESCO value embodied:** Quality Education (SDG 4) + Inclusion & Diversity.
- **What is submitted:** A **proposal document (PDF)** + a **pitch video (≤ 3 minutes)** — NOT a required production product. A working prototype dramatically strengthens the *feasibility* score, which is why we are building one.
- **Hard external deadline:** 16 August 2026 (23:59 Paris time). **Internal target: fully finished and submitted by 7 August 2026.**
- **Judging rubric:** Innovation & Creativity · Feasibility & Sustainability · Impact & Inclusion · Relevance to MIL. Use UNESCO vocabulary ("information ecosystems," "digital citizenship," "critical thinking," "prebunking," "information integrity"). Speak like a public-interest project, never like a startup.

### Competition goals

1. **Build a functional web app** demonstrating **at least one complete historical case** end-to-end (branching decisions → historical replay → evidence explorer → reflection/profile → community toolkit). This is our differentiator against ~1,200 competing teams who will submit mockups.
2. Produce screen-recordable footage for the pitch video — the interface *is* the demo (money shot: branching timeline collapsing into the real historical timeline with real advisories/headlines).
3. Prove **feasibility & sustainability**: a costed pilot, a named partner (Vera Files, DepEd), and a contributor model that survives without permanent grant money.

### Why this project exists

Young Filipinos make high-stakes decisions from online information every day — whether to evacuate during a typhoon, trust a scholarship post, or send money after a convincing message — but they have **no safe space to practice** evaluating information under pressure. We teach people what misinformation *looks like*; we rarely teach them how to *decide well* when information is incomplete, emotional, and changing. rePlay is that practice space, grounded in real Philippine events so the stakes and the lessons are authentic.

---

## 2. Core Product Philosophy

These five principles are the soul of rePlay. **Every feature, PR, and design choice must serve them.** When a "cool" feature conflicts with one of these, the feature loses.

### 2.1 Playable Information History

We do not invent scenarios. Every case is a **reconstruction of a real, documented Philippine information event**, assembled from verified government advisories, fact-check reports, news timelines, and documented public posts. The genre we are inventing is *playable information history* — history you make decisions inside of.

### 2.2 Experiential Media Literacy

Media literacy here is a **skill built through doing**, not knowledge delivered through instruction. Players develop judgment by evaluating competing sources, verifying evidence, resisting emotional manipulation, and living with the consequences — the opposite of a multiple-choice quiz. **If a design turns rePlay into a quiz, reject it.**

### 2.3 Evidence-First Design

Every message, post, advisory, and outcome a player encounters is backed by a **citation to a real source**. The Evidence Explorer is not a bonus feature — it is proof of our integrity and the reason judges (and educators) will trust us. **No claim ships without a source.**

### 2.4 Historical Replay (the core mechanic)

The single mechanic we would keep if we had to cut everything else: the player experiences an event under original uncertainty, makes decisions, and then the simulation **collapses into the actual historical timeline** so they can compare their choices to what really happened and why. This "reveal" is the emotional and educational payload.

### 2.5 Learning Through Decision-Making, Not Quizzes

rePlay never says "correct/incorrect" mid-scenario. It teaches *judgment*, not answers. It shows how each choice moves **Community Trust, Information Integrity, and Public Safety**, then reveals the documented reality afterward. The takeaway is a transferable habit ("verify before sharing"), not a memorized fact.

---

## 3. MVP Scope

The MVP must let a player complete **one full case** on a phone, plus the scaffolding that proves the platform is a *growing archive*, not a one-off game.

### 3.1 Must Have (MVP — required for submission)

- **One complete, verified case, end-to-end.** Flagship case: **Case 001 — "The Flood Was Real"** (Typhoon Tino / Kalmaegi, Cebu, Nov 3–7 2025 — real flooding circulating alongside AI-generated disaster imagery). Fully sourced. See [`docs/product-definition.md`](docs/product-definition.md) for the locked scope contract.
- **Case player / simulation engine** driven by declarative case content (see §6). Supports:
  - Timed information "feed" (simulated Messenger/Facebook/TikTok/official-advisory messages arriving over time).
  - **Branching decisions** (Verify / Share with context / Wait / Ignore / Ask or check an official source) — each node presents only the 2–4 that fit the situation, each altering state.
  - Live **state meters**: Community Trust, Information Integrity, Public Safety.
- **Historical Replay reveal**: branching timeline collapses into the real timeline; real advisories, headlines, fact-checks, and dates shown.
- **Evidence Explorer**: for every message encountered, show its verification status + a citation to the real source.
- **Reflection / Information Profile**: end-of-case summary of the player's behavior ("You relied on urgency more than evidence," "You verified before sharing") + a decision score.
- **Community Toolkit unlock**: real-world, downloadable/linkable resources tied to the case (Case 001 card: "Verify Before You Share: Disaster Image Checklist").
- **Case library / landing page** listing cases (even if only one is live) — establishes the "archive" framing.
- **Mobile-first responsive UI**, accessible, Filipino-forward copy with English support.
- **Educator Guide** for the case (discussion questions + learning outcomes), viewable/printable.

### 3.2 Nice to Have (if time permits before deadline)

- A **second case** in a different domain (e.g., election misinformation or AI-scam) to prove the engine generalizes.
- **Pre/post assessment** flow to demonstrate the measurable metric (evidence-based decision-making score improvement).
- **Low-bandwidth mode** (compressed media, text-first fallback).
- Basic **anonymous local profile** (localStorage) tracking cases completed and score history — no accounts.
- Filipino ↔ English **language toggle** for UI chrome.
- Shareable end-of-case result card (for the "would you have decided right?" hook).

### 3.3 Future Roadmap (explicitly out of MVP scope)

- **Contributor pipeline**: authenticated educators/journalists submit new cases; fact-check partners validate before publication.
- **Accounts & classroom management** (educator dashboards, cohort tracking, assignment of cases).
- **Adaptive difficulty / personalized reflection** via responsible AI (see §10) — never touching historical facts.
- **Regional-language support** (Cebuano, Ilocano, Hiligaynon) beyond Filipino/English.
- **Offline educator toolkit** and printable case packs at scale.
- **International expansion**: other countries contribute their own localized cases into the same engine.
- **Public analytics / accessibility features** (captions, high-contrast, screen-reader passes) hardened to WCAG AA+.

> **Scope rule:** If a task is in "Future Roadmap," do not build it during the hackathon sprint unless explicitly re-prioritized in [§13 Current Sprint](#13-current-sprint). Protect the "one polished complete case" above breadth.

---

## 4. Technical Stack

Chosen for a small youth team on a tight timeline that still needs to **scale into a living archive**. Bias: boring, well-documented, free-tier-friendly, low operational burden.

| Layer | Choice | Justification |
|---|---|---|
| **Framework** | **Next.js (App Router, React)** | Content-heavy + interactive; SSG/SSR for fast mobile loads; file-based routing; huge ecosystem; deploys free on Vercel. Lets us ship static case content *and* interactive simulation in one codebase. |
| **Language** | **TypeScript (strict mode)** | Type safety is non-negotiable for a schema-driven case engine. Catches malformed case content at build time. |
| **Styling** | **Tailwind CSS** + a small set of local UI primitives | Fast, consistent, mobile-first by default; no heavy component library to fight. Design tokens live in `tailwind.config`. |
| **Content model** | **Declarative case files (TypeScript/JSON) validated by Zod** | Cases are *data*, not code (see §6). Zod schemas validate every case at build/CI time so no unsourced or malformed case can ship. |
| **Simulation state** | **Framework-agnostic engine in `/lib/engine` + React state** | The branching simulation is a finite-state graph. Keep the interpreter pure and UI-independent; drive React with a typed reducer / lightweight store (Zustand only if global state genuinely warrants it). |
| **Backend** | **None for MVP.** Content-as-code, static-first. | We do not need a server to demo one case. Avoid premature infrastructure. |
| **Database** | **Deferred. Supabase (Postgres) when needed** — behind an interface. | Only introduced for profiles/analytics/contributions (post-MVP). MVP profile state = localStorage. Never couple case content to a DB. |
| **Authentication** | **None for MVP.** Anonymous local profile only. | Accounts add friction + scope with zero demo value. Add Supabase Auth only when educators/contributors need it (Future Roadmap). |
| **Deployment** | **Vercel** (preview deploys per PR) | Zero-config for Next.js; instant preview URLs are perfect for team review and for recording the pitch video. |
| **Testing** | **Vitest** (unit — engine + schema), **Playwright** (one happy-path e2e of the flagship case) | Protect the engine and the one case that must work in the video. |
| **Tooling** | ESLint + Prettier + TypeScript strict; Husky pre-commit (lint + typecheck) | Keep the codebase clean under hackathon pressure. |

**Dependency rule:** Prefer the platform and small, well-maintained libraries. Every new dependency must be justified in the PR. Do not add a state-management, animation, or component library "just in case" — see §15.

---

## 5. Repository Structure

Designed so **content, engine, and UI stay decoupled** — the key to a maintainable living archive.

```
replay/
├── CLAUDE.md                  # This handbook (source of truth)
├── README.md                  # Public-facing intro + local dev setup
├── docs/                      # Project docs
│   ├── proposal/              # UNESCO proposal drafts & final PDF
│   ├── decisions/             # ADRs — architecture decision records
│   └── case-authoring.md      # How to author a new verified case
├── public/                    # Static assets (images, audio, fonts)
│   └── cases/<case-id>/       # Per-case media (compressed, alt-texted)
├── content/
│   └── cases/                 # ← THE ARCHIVE. One folder per case.
│       └── the-flood-was-real/ # Case 001 (flagship)
│           ├── case.ts        # Case definition (validated by Zod schema)
│           ├── evidence.ts     # Evidence items + citations
│           ├── educator.md     # Educator guide (discussion + outcomes)
│           └── sources.md      # Full source list / provenance log
├── src/
│   ├── app/                   # Next.js App Router routes
│   │   ├── page.tsx           # Landing / case library
│   │   ├── cases/[id]/        # Case player route
│   │   └── about/             # Mission, team, methodology
│   ├── lib/
│   │   ├── engine/            # Pure simulation engine (no React)
│   │   │   ├── types.ts       # Core domain types
│   │   │   ├── machine.ts     # State-graph interpreter
│   │   │   ├── scoring.ts     # Decision-score + meter logic
│   │   │   └── engine.test.ts
│   │   ├── schema/            # Zod schemas for case content
│   │   │   ├── case.schema.ts
│   │   │   └── evidence.schema.ts
│   │   ├── content/           # Case loading + build-time validation
│   │   └── utils/
│   ├── components/
│   │   ├── ui/                # Generic primitives (Button, Card, Meter…)
│   │   ├── player/            # Simulation UI (Feed, DecisionPrompt, Meters)
│   │   ├── evidence/          # Evidence Explorer
│   │   ├── reflection/        # Information Profile / reveal
│   │   └── toolkit/           # Community Toolkit
│   ├── styles/                # Global CSS, design tokens
│   └── i18n/                  # Filipino/English strings
├── tests/e2e/                 # Playwright flagship-case walkthrough
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Non-negotiable boundaries:**

- `content/cases/*` is **data**. It imports from `src/lib/schema` (for types) and nothing else. A case must never import a React component or contain logic.
- `src/lib/engine/*` is **pure** — no React, no `window`, no fetch. It takes a validated case + player input and returns new state. This makes it testable and reusable (web, future native, future server).
- `src/components/*` renders engine state. Components never own historical facts or business rules.

---

## 6. The Case Content Model (Architectural Core)

> **Read this section before touching gameplay.** rePlay lives or dies on this abstraction. A "case" is a declarative, verified, schema-validated data structure that the engine interprets. Adding a new case must NEVER require changing the engine.

### 6.1 Every case has a standardized structure

Mandated by the product design — all five parts are required:

1. **Historical Context** — what actually happened (headline, date, location, summary).
2. **Playable Simulation** — the branching decision experience.
3. **Evidence Explorer** — original advisories, fact-checks, news, each cited.
4. **Educator Guide** — discussion questions + learning outcomes.
5. **Community Toolkit** — real-world actions and resources.

### 6.2 Conceptual schema (illustrative — implement with Zod in `src/lib/schema`)

```ts
type Case = {
  id: string;                 // "the-flood-was-real"
  code: string;               // "Case 001" — player-facing
  title: string;              // "The Flood Was Real"
  track: ("ai-mil" | "mil-education" | ...)[];
  competency: MILCompetency;  // strongest ONE, e.g. "critical-evaluation"
  historicalContext: {
    realEvent: string;        // e.g. "Typhoon Tino (Kalmaegi), Cebu, 2025"
    summary: string;
    dateRange: string;
    sources: SourceRef[];     // REQUIRED — provenance for the reconstruction
  };
  nodes: SimulationNode[];    // the branching graph (see 6.3)
  entryNodeId: string;
  evidence: EvidenceItem[];   // every message maps to an evidence item
  educatorGuide: MarkdownRef;
  toolkit: ToolkitResource[];
  reflection: ReflectionConfig;
};

type SimulationNode = {
  id: string;
  incoming: IncomingInfo[];   // messages that "arrive" (with source/channel)
  timerSeconds?: number;      // optional pressure
  decisions: Decision[];      // Verify / Share with context / Wait / Ignore / Ask (2–4 per node)
};

type Decision = {
  id: string;
  label: string;
  effects: {                  // deltas applied to meters
    communityTrust?: number;
    informationIntegrity?: number;
    publicSafety?: number;
    decisionScore?: number;
  };
  next: string | "END";       // next node id
  evidenceId?: string;        // links the choice to what it was really about
};

type EvidenceItem = {
  id: string;
  channel: "messenger" | "facebook" | "tiktok" | "official-advisory" | ...;
  claim: string;
  // Media authenticity and claim accuracy are SEPARATE questions (§13 teaching
  // point): a real photo can carry a false caption; a synthetic image can refer
  // to a real event. Record both.
  mediaStatus: "authentic" | "synthetic" | "altered" | "miscaptioned" | "not-yet-verifiable";
  claimAccuracy: "accurate" | "false" | "misleading" | "unverified-at-the-time";
  citation: SourceRef;        // REQUIRED — no evidence without a source
};

type SourceRef = {
  publisher: string;          // e.g. "PAGASA", "Vera Files", "NDRRMC"
  title: string;
  url?: string;
  date: string;
  note?: string;
};
```

### 6.3 Engine contract

- The engine consumes a **validated `Case`** and the **player's decision history**, and produces the **current node**, the **meter state**, and (at END) the **reflection payload**.
- The engine is **deterministic and pure**. Same case + same choices ⇒ same result. This is what makes the Historical Replay reveal trustworthy and testable.
- The **reveal** is derived from `historicalContext` + `evidence` — the engine maps the player's path onto the real timeline. It never fabricates the real timeline; it reads it from the case data.

### 6.4 Authoring rule

Authoring a case = writing a `content/cases/<id>/` folder that passes the Zod schema in CI. If it fails validation (missing citation, dangling node id, unsourced claim), **the build fails**. See `docs/case-authoring.md`.

---

## 7. Coding Standards

### TypeScript rules

- **`strict: true`.** No implicit `any`. No `@ts-ignore` without a one-line justification comment.
- **`unknown` over `any`.** Validate external/content data with Zod at the boundary; trust types inside.
- Prefer **`type` aliases** for domain models; **discriminated unions** for node/decision/evidence variants.
- Derive types from Zod schemas (`z.infer`) so the schema is the single source of truth — never let a hand-written type and a schema drift.
- No non-null assertions (`!`) except where provably safe with a comment.

### Naming conventions

- Files: `kebab-case.ts`; React components: `PascalCase.tsx`.
- Components/types: `PascalCase`; functions/vars: `camelCase`; constants: `UPPER_SNAKE_CASE`.
- Case ids and content keys: `kebab-case` and stable forever (they appear in URLs and citations).
- Booleans read as predicates: `isVerified`, `hasEvidence`, `canAdvance`.

### Component structure

- **One component per file.** Co-locate a component's styles/subparts in its folder.
- Presentational vs. container split: components in `components/*` render props/state; data loading and engine calls live in route files or hooks.
- Keep components small and focused. If a component exceeds ~150 lines or juggles multiple responsibilities, split it.
- Server Components by default (Next App Router); mark `"use client"` only where interactivity requires it (the simulation player does; static content pages don't).

### Reusable architecture

- **Engine, schema, and UI are decoupled** (see §5). Never leak React into `lib/engine`. Never leak historical facts into components.
- Shared UI lives in `components/ui`. Don't reinvent a Button/Card/Meter per feature.
- Prefer composition over configuration flags. Small pieces that combine beat one god-component with 12 booleans.

### State management

- **Engine state** is owned by the pure engine and threaded through a typed reducer/hook. Do not scatter simulation logic across components.
- **UI state** (open panels, toggles) stays local (`useState`).
- **Global state** (language, local profile) via a minimal store (Context or Zustand) — introduced only when prop-drilling genuinely hurts.
- No Redux. No global mutable singletons.

### API conventions (when a backend arrives — post-MVP)

- All server access goes through a typed client in `lib/content` / `lib/api`; components never `fetch` raw.
- Validate every response with Zod at the boundary.
- REST-ish, resource-named routes; consistent error shape `{ error: { code, message } }`.
- The content layer must expose the **same interface** whether cases come from local files (MVP) or a database (future) — so swapping the source never touches the engine or UI.

### Documentation style

- Public functions/types in `lib/engine` and `lib/schema` get a short JSDoc: what it does + why, not restating the code.
- Comment the **why**, never the obvious **what**. Historical/pedagogical decisions in case data get a `note` field or a line in `sources.md`.
- Record significant architecture choices as ADRs in `docs/decisions/` (short: context, decision, consequences).

---

## 8. UI / UX Principles

### Visual identity

- **Tone:** hopeful/empowering, calm, credible — a public-interest civic tool, not a startup or a game with loot boxes. Serious subject, warm delivery.
- **Motif:** the "replay/timeline" — branching paths that resolve into a single real timeline. The signature moment is the **collapse animation** (branching → real history).
- **Palette & type:** define as design tokens in `tailwind.config`. High legibility first; restrained, purposeful color. Meters (Community Trust / Information Integrity / Public Safety) get consistent, colorblind-safe hues used nowhere else.

### Design language

- Content-forward and uncluttered. The information feed and decisions are the stars — chrome recedes.
- Reuse primitives; consistent spacing scale; consistent card/panel treatment across Simulation, Evidence Explorer, Reflection, Toolkit.

### Accessibility (a core value, not a nice-to-have — this is an inclusion project)

- Semantic HTML; keyboard navigable; visible focus states.
- Sufficient contrast (target WCAG AA); never encode meaning in color alone (meters need labels/icons too).
- All media has alt text/captions. Plan for screen-reader passes.
- Copy is plain-language and Filipino-forward; avoid jargon in player-facing text.

### Animations

- Motion serves comprehension (the timeline collapse, meter changes, arriving messages) — never decoration for its own sake.
- Respect `prefers-reduced-motion`; provide non-animated fallbacks.
- Keep animations cheap (transform/opacity) for low-end mobile.

### Mobile-first philosophy

- **Design for a mid-range Android phone on mobile data first**, then scale up. Our audience is mobile-first, disaster-prone, sometimes low-bandwidth.
- Touch targets ≥ 44px; single-column layouts; no hover-only interactions.
- Budget performance: lazy-load case media, compress aggressively, keep JS lean. Plan for a low-bandwidth mode.

### Educational tone

- Never shame the player mid-scenario; no "WRONG." Reveal consequences and evidence, then let them reflect.
- The reveal should feel like insight, not a grade. The Information Profile is descriptive and encouraging ("You verified before sharing").

---

## 9. Gameplay Principles

How replay cases work — the loop, in order:

### Historical Replay (core loop)

1. **Enter the reconstructed event.** Information arrives over time through simulated channels (Messenger, Facebook, TikTok, official advisories) matching how it really spread.
2. **Decide under uncertainty.** At each node the player chooses from the action vocabulary — **Verify, Share with context, Wait, Ignore, Ask or check an official source** (only the 2–4 that fit the node are shown; choices vary per case). A timer may add pressure.
3. **See live consequences.** Choices move **Community Trust, Information Integrity, Public Safety** in real time — no "correct/incorrect."
4. **The reveal.** At the end, the branching timeline **collapses into the real historical timeline** — real headlines, real PAGASA/OCD/PIA advisories, real fact-checks, real dates — banner: *"This scenario was reconstructed from verified Philippine sources."*

### Branching decisions

- Decisions form a **directed graph of nodes** (see §6.3), not a linear script. Multiple paths, converging reveal.
- Every decision links to an **evidence item** so the post-game explorer can show what that choice was really about.
- Branch design is authored in case data; the engine is generic.

### Evidence Explorer

- Post-case, the player can inspect **every message they saw**: the claim, its **media status** (authentic / synthetic / altered / miscaptioned / not-yet-verifiable), its **claim accuracy** (accurate / false / misleading / unverified-at-the-time), and a **citation to the real source**. Authenticity and accuracy are separate questions (§13 of the product definition). This is the integrity layer.

### Community Toolkit

- Each case unlocks **real-world, actionable resources** (Case 001: "Verify Before You Share: Disaster Image Checklist") — the bridge from "played a game" to "changed behavior." Real links/downloads, tied to the case's domain.

### Reflection engine

- Analyzes the player's decision pattern and produces plain-language, non-judgmental insight ("You relied on urgency more than evidence," "You verified before sharing") plus a **decision score** and, where assessment exists, an improvement delta. Deterministic and rule-based (no generative AI). Case 001 resolves to one of three locked behavioral profiles: **Responsible Crisis Communicator**, **Skeptical but Delayed**, or **Emotional Amplifier** — descriptive, never punitive.

### Player profile (Information Profile)

- MVP: a **local, anonymous** profile (localStorage) storing cases completed and score history — no accounts.
- Future: authenticated profiles, cross-case growth tracking, educator-visible cohort progress.

---

## 10. AI Principles

rePlay uses AI carefully and transparently. The line is bright and absolute.

### The one inviolable rule

**AI MUST NEVER INVENT, ALTER, GENERATE, OR EMBELLISH HISTORY.** Every historical fact, message, advisory, timeline, verdict, and source in a case comes from **verified evidence curated by humans** (educators / fact-check partners). AI does not decide what happened.

### Where AI IS allowed (post-MVP, optional, clearly labeled)

- Personalizing **reflection feedback** phrasing based on the player's decision pattern (drawing only on facts already in the case).
- Adaptive **difficulty/pacing** (which authored node to surface next), within the authored graph.
- Drafting **assistance** for educators authoring cases — always human-reviewed and source-checked before publication.
- Helping learners **recognize** AI-generated content, deepfakes, and algorithmic amplification (AI as subject matter).

### Where AI is NOT allowed

- Generating or modifying historical facts, timelines, quotes, advisories, or verdicts.
- Fabricating sources or citations.
- Auto-publishing any case content without human + fact-check review.
- Any player-facing claim presented as fact that isn't traceable to a `SourceRef`.

### Responsible-AI requirements

- Anything AI-generated in the product must be **visibly labeled as AI-generated**.
- AI is a threat we teach about *and* a tool we use — but for facts, it is neither: **facts are human-verified only.**
- For the MVP we ship **no generative AI in the critical path.** The flagship case is fully authored and sourced. Do not add AI to hit a deadline.

---

## 11. Data Principles

### Verified sources only

Every case is built **exclusively** from verified evidence: government advisories (PAGASA, NDRRMC, PIA), reputable news archives, and fact-check reports (Vera Files and peers). No source, no ship.

### Historical reconstruction, done honestly

We reconstruct real events without introducing bias, oversimplification, or accidental misinformation. When the real public was uncertain at a moment, the case marks evidence `unverified-at-the-time` rather than pretending clarity existed.

### Fact-check integration

Cases are designed to be **reviewed by educators and fact-checking partners before publication**. Build the schema and process so a reviewer can trace every claim to its source (`sources.md` + `SourceRef` on every evidence item).

### Citations

- Every `EvidenceItem` carries a `SourceRef` (publisher, title, date, url where public).
- Every case's `historicalContext` cites the sources behind the reconstruction.
- Player-facing Evidence Explorer surfaces these citations directly.

### Evidence validation

- Zod schemas enforce that required citations exist; **CI fails a case with a missing/malformed source or a dangling reference.**
- A case is not "done" until its `sources.md` provenance log is complete and, for anything beyond MVP demo, has passed human/partner review.

---

## 12. Team Workflow

Team: Kishia · Gian · Bads · Khylle. Keep process lightweight but disciplined — we are on a deadline and code must stay reviewable.

### Git workflow

- **`main` is always deployable.** Never commit directly to `main`.
- **Feature branches** off `main`, one focused piece of work each.
- Open a PR early; Vercel preview deploys let the team (and video recording) see it live.

### Branching strategy

- Naming: `feat/<short-desc>`, `fix/<short-desc>`, `content/<case-id>`, `docs/<short-desc>`, `chore/<short-desc>`.
- Keep branches short-lived; rebase/merge `main` frequently to avoid drift.

### Commit conventions

- **Conventional Commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `content:`.
- Imperative, present tense: `feat: add decision timer to simulation node`.
- Small, logical commits over giant dumps. Commit message explains *why* when it isn't obvious.

### Pull request expectations

- One reviewer minimum before merge (whoever didn't write it).
- PR description: what changed, why, how to test, and screenshots/preview link for UI.
- CI must pass: typecheck, lint, unit tests, and **case-schema validation**.
- New dependencies must be justified in the PR (see §15).
- Update `CLAUDE.md`/docs in the same PR when a decision changes.

### Code review expectations

- Review for: correctness, adherence to this handbook (esp. engine/UI/content boundaries), historical accuracy of any case data, accessibility, and readability.
- Be kind and specific. Prefer suggestions over demands; explain the "why."
- Block only on real problems (bugs, principle violations, unsourced claims), not style the linter already covers.

---

## 13. Current Sprint

**As of repository initialization (July 2026). Update this section as work progresses.**

State: repo is empty and not yet under git. Nothing built yet.

### Immediate priorities (in order)

1. **Initialize the project skeleton**: Next.js + TypeScript (strict) + Tailwind + ESLint/Prettier + Vitest; the folder structure from §5; `README.md` with local dev setup. Set up git + `main` + first PR.
2. **Define the Zod case & evidence schemas** (`src/lib/schema`) and derive domain types. This is the backbone — do it before UI.
3. **Build the pure simulation engine** (`src/lib/engine`) with unit tests: node traversal, meter/scoring math, deterministic reveal derivation. No React yet.
4. **Author the flagship case** `content/cases/the-flood-was-real/` (Case 001, with real cited sources) that validates against the schema, following [`docs/product-definition.md`](docs/product-definition.md) and clearing its Source Gate (§20). Coordinate the *content/verification* work with the team; engineers can start with a sourced draft.
5. **Build the case player UI** (feed, decision prompt, live meters) wired to the engine, `"use client"`, mobile-first.
6. **Build the reveal → Evidence Explorer → Reflection/Profile → Community Toolkit** flow for the flagship case.
7. **Landing / case library page** framing rePlay as a growing archive.
8. **Polish for the pitch video**: the timeline-collapse money shot, mobile framing, subtitles-friendly visuals; deploy to Vercel.

**Sprint guardrail:** depth over breadth. One flawless, fully-sourced case that screen-records beautifully beats three half-built ones. Everything not needed to demo one complete case is deferred (see §3.3).

---

## 14. Development Roadmap

Milestones from foundation to deployment. Hackathon milestones (M0–M4) precede the deadline; M5+ are the sustainability story we pitch.

- **M0 — Foundation.** Tooling, structure, CI (typecheck + lint + tests + schema validation), Vercel preview deploys, git workflow live.
- **M1 — Engine & Schema.** Zod case/evidence schemas; pure, tested simulation engine (traversal, meters, scoring, reveal derivation). Content decoupled from UI proven by tests.
- **M2 — Flagship Case Content.** Case 001 "The Flood Was Real" authored and fully cited; passes schema validation and the Source Gate (product definition §20); `sources.md` complete; educator guide + toolkit drafted.
- **M3 — Playable Vertical Slice.** Full loop for the flagship case on mobile: simulation → reveal → evidence → reflection/profile → toolkit. This is the demoable product.
- **M4 — Submission Polish.** Landing/library page, accessibility passes, low-bandwidth considerations, pitch-video money shots, final deploy. **Submit by 7 Aug 2026 (hard cutoff 16 Aug).**
- **M5 — Second Case & Assessment.** Prove the engine generalizes; add pre/post assessment to evidence the impact metric.
- **M6 — Contributor Pipeline.** Authenticated case authoring + fact-check review workflow; introduce Supabase behind the content interface.
- **M7 — Classrooms & Scale.** Educator accounts/dashboards, localization (Filipino + regional languages), offline toolkits, public analytics — the living-archive vision at scale.

---

## 15. Instructions for Every Future Claude Session

Persistent directives. Follow these on every task in this repo.

1. **Never sacrifice educational value for flashy features.** rePlay is a learning tool first. If a feature looks cool but weakens the learning loop or the evidence-first integrity, don't build it.
2. **Always preserve historical accuracy.** Never let code, content, or AI invent, alter, or embellish a historical fact. No claim without a `SourceRef`. If content lacks a source, flag it — do not fill the gap yourself.
3. **Protect the boundaries.** Content is data, the engine is pure, components render state. Never leak React into the engine or historical facts into components. If a change blurs these lines, stop and reconsider.
4. **Prioritize maintainability.** Write code the team can read and extend six months from now. Clear names, small units, comment the *why*. This is an open-source-quality project, not throwaway hackathon code.
5. **Avoid unnecessary dependencies.** Prefer the platform and what's already here. Every new dependency needs a real justification in the PR. No "just in case" libraries.
6. **Prefer scalable solutions.** Build so adding the 2nd, 20th, and 200th case never requires touching the engine. When choosing between a quick hack and a slightly-more-effort scalable pattern, choose scalable — unless the sprint explicitly calls for a throwaway spike.
7. **Think like a senior software architect.** Consider trade-offs, edge cases, accessibility, and the mobile-first/low-bandwidth reality before coding. Design the abstraction before writing the implementation.
8. **Respect the scope.** Don't build Future Roadmap items during the hackathon sprint unless §13 says so. Depth over breadth: one flawless complete case.
9. **Speak UNESCO, not startup.** In copy, docs, and naming, use public-interest language ("communities," "learners," "information integrity," "digital citizenship," "inclusion," "sustainability") — never "users," "market," "growth," "monetization."
10. **Mobile-first, accessible, inclusive — always.** Every UI change must work on a mid-range Android phone on mobile data, be keyboard-navigable, and not encode meaning in color alone.
11. **Keep this handbook current.** If you make a decision that changes anything in this file, update `CLAUDE.md` (and add an ADR in `docs/decisions/`) in the same change.
12. **Read before you write.** Understand the existing engine, schema, and content conventions before adding to them. Match the surrounding code's style and idioms.
13. **Don't fabricate results.** If tests fail, say so with the output. If a step was skipped, say so. Report status honestly.

---

*rePlay — "We turned real information crises into the world's first playable classroom."*
*Built for the UNESCO Youth Hackathon 2026 by Kishia, Gian, Bads, and Khylle.*
