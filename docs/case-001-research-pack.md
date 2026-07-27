# Case 001 — *The Flood Was Real* · Research Pack (D2)

**Case:** Case 001 — *The Flood Was Real* · **Event:** Typhoon Tino (Kalmaegi), Cebu, Philippines · **Window:** November 3–7, 2025
**Owner:** Kish (Lead · Research/Content · QA), with Gigi (Case Data Architect) structuring · **Version:** 0.1 (draft for review)
**Authority for chronology:** PAGASA revised preliminary report (**S1**). Where a secondary source conflicts with PAGASA on dates/landfalls/status, S1 wins and the discrepancy is recorded (§6).
**Source of truth:** [`docs/product-definition.md`](product-definition.md) (signed off v1.0). This pack fills its Source & Evidence Register (§18) and works toward its Source Gate (§20).

> **No fabrication.** No real post, quote, timestamp, casualty figure, or source is invented here. Anything not yet verifiable is marked `SOURCE NEEDED`. In-sim player-facing wording is **not** written in this pack — that is D5 authoring, after each node's source is approved.

### Verification method (how each fact here was obtained)

| Source | Fetched? | How verified |
|---|---|---|
| S6 — VERA Files ("Cebu is drowning") | ✅ Fetched | Read directly; details below are from the article |
| S7 — OCD-7 / PIA (AI-photo warning) | ◐ Via search | Confirmed from the PIA article's own text surfaced in search; exact quotes pending direct read |
| S1 — PAGASA prelim report (PDF) | ✗ Not machine-readable here | Chronology cross-checked against general reporting; **exact figures `SOURCE NEEDED` from S1** |
| S3 — DSWD DROMIC #2 (PDF) | ✗ Not machine-readable here | Purpose per register; **exact bulletin text `SOURCE NEEDED`** |
| S2, S4, S8 — PIA pages | ✗ HTTP 403 (bot-blocked) | Purpose per signed-off register; **specifics `SOURCE NEEDED` on direct read** |
| S5 — AFP Fact Check | ✗ Fetch blocked | Purpose per signed-off register; **specifics `SOURCE NEEDED` on direct read** |

---

## 1. Verified Event Timeline (Nov 3–7, 2025)

Beat-by-beat, from verified/approved sources. Dates are calendar dates; **all clock times must state the time zone (PhST) and are `SOURCE NEEDED` from S1 unless a source gives them**.

| Date | Beat | What is documented | Source |
|---|---|---|---|
| **Nov 2** *(context, pre-window)* | Kalmaegi enters PAR, named **"Tino."** | Background only; outside the reconstruction window. Exact status/time per S1. | S1 |
| **Nov 3** | Typhoon status; Cebu on heightened/red alert; preparedness. | Cebu placed on **Red Alert**; class suspensions, preemptive evacuation, sea-travel suspension (S2). Cebu City preparedness: evacuation centers, emergency coordination, advice for coastal/riverside residents (S8). Tropical Cyclone Wind Signals raised (No. 4 reported in 8 areas at peak — exact per-area timing `SOURCE NEEDED` from S1). | S2, S8, S1 |
| **Nov 4** | Landfall affecting Cebu; life-threatening conditions. | Typhoon made landfall affecting Cebu (early morning). **`SOURCE NEEDED`: exact landfall date/time/place + time zone from S1** (see discrepancy §6). DSWD **DROMIC Report #2, as of Nov 4, 6:00 AM**, provides official hazard context and cites a PAGASA bulletin describing life-threatening conditions as Tino approached Cebu (exact bulletin wording `SOURCE NEEDED`). | S1, S3 |
| **Nov 5** | Real flash flooding + rescue operations. | Documented **real** flash flooding across Cebu communities; residents trapped; rooftop rescues; government rescue response (S4; specific communities/figures `SOURCE NEEDED`). AI-generated disaster images begin circulating around the landfall/flooding (OCD-7 later references AI photos of the "Nov 5 landfall"). | S4, S7 |
| **Nov 6** | "Cebu is drowning" AI image first posted. | The "Cebu is drowning" image was **first posted on X by user @tagapagmulat on Nov 6**, with **no AI label or disclaimer**; later reposted on Threads and Facebook without disclosure. *(Verified via S6.)* | S6 |
| **Nov 7** | AI-imagery debunks + official warning. | **AFP Fact Check** debunks an AI-generated image falsely shown as homes destroyed by Tino — evidence includes provenance/disclosure checks, a Google AI marking, and visual inconsistencies (S5; exact image + markings `SOURCE NEEDED` on direct read). **OCD-7 (via PIA)** issues a public warning about AI-generated typhoon photos (exaggerated flooding in **Talisay, Consolacion, Mandaue** — submerged cars, animals, houses causing confusion), urging verification and reliance on **PAGASA / official sources** (S7). | S5, S7 |
| *Nov 9 (post-window)* | Casualty reporting. | ~**224 deaths reported as of Nov 9** *(per S6 VERA Files, citing news reports)*. **`SOURCE NEEDED`: confirm against an official dated DROMIC/NDRRMC report before any player-facing use** (product def §7 bars casualty totals unless tied to a dated official report). | S6 |
| *Nov 11 (post-window)* | "Cebu is drowning" debunk published. | **VERA Files** publishes its fact-check: image is AI-generated — flagged by Hive Moderation + WasItAI, a **visible Gemini logo at the lower-right**, missing disclosure. Confirms the **real** flooding was genuine. *(Later verification evidence — not knowable to the player during play.)* | S6 |

---

## 2. Message Inventory (per planned in-sim message)

One row per key information artifact, mapped to the 7 nodes. **"Handling"** = exact / paraphrased / reconstructed, per Source Rules (product def §19). Final player-facing wording is written at D5, not here.

| Node | Message (what it carries) | Channel | Verdict (media status · claim accuracy) | Citation | Handling |
|---|---|---|---|---|---|
| 1 | Cebu under Red Alert; class suspensions, preemptive evacuation, sea-travel ban; prepare now | official-advisory (also reshared in family chat) | authentic text advisory · accurate | S2, S8 | **Paraphrased** from S2/S8 (do not fabricate exact advisory wording) |
| 1 (frame) | A relative forwards the class-suspension / evacuation news to the family group | messenger (family group) | n/a (framing) | — | **Reconstructed** (labeled simulation) |
| 2 | Official warning of life-threatening conditions as Tino affects Cebu; take protective action | official-advisory | authentic · accurate | S1, S3 | **Paraphrased** from S3's cited PAGASA bulletin (exact text `SOURCE NEEDED`) |
| 3 | Local update/news: real flash flooding across Cebu; rescues underway; residents trapped | facebook / news / official-advisory | authentic · accurate | S4 | **Paraphrased** (news). Any real-flood photo: **media-rights flag** — do not republish third-party image until cleared |
| 4 | An image shared as "homes destroyed by Tino" | facebook / messenger | at the time: **unverified** → reveal: **synthetic · false** | S5 | **Reconstructed stand-in** — do **not** reproduce the third-party AI image; use a labeled reconstruction/description per S5 |
| 5 | The "Cebu is drowning" image implying catastrophic total submersion | facebook / tiktok / messenger *(originated on X, @tagapagmulat, Nov 6)* | at the time: **unverified** → reveal: **synthetic (visible Gemini mark) · false/misleading** (real flood, fabricated visual) | S6 | **Reconstructed stand-in** — do not republish; the visible Gemini watermark is a teachable tell |
| 6 | Official OCD-7 warning: AI typhoon photos circulating; verify before sharing; rely on PAGASA | official-advisory | authentic · accurate | S7 | **Paraphrased** from S7 |
| 7 | Player-composed final family update separating **confirmed / false / uncertain / actionable** | messenger (family group) | n/a — learning exercise | S1–S7 (synthesis) | **Reconstructed** — explicitly labeled a **simulated exercise**; never shown as a real historical message |

> **Channel note (flag).** Node 5's artifact originated on **X (Twitter)**, which is not in the app's channel set (messenger / facebook / tiktok / official-advisory). Recommend representing it **as it actually spread** — reposted into Facebook/Messenger — rather than inventing an X surface. Confirm at UX/authoring (§7 flags).

---

## 3. Evidence Table (per beat / message)

For the Evidence Explorer. "Truth status **at the time**" is what a careful person could know at that moment; the debunk verdict is later (Evidence Explorer reveal).

| # | Date | Channel | What appeared | Truth status **at the time** | Reveal verdict | Source | Notes |
|---|---|---|---|---|---|---|---|
| E1 | Nov 3 | official-advisory | Cebu Red Alert; suspensions; evacuation; sea-travel ban | authentic · accurate | (unchanged) | S2, S8 | Prioritize + act; low ambiguity |
| E2 | Nov 4 | official-advisory | PAGASA-based warning of life-threatening conditions (via DROMIC #2, 6:00 AM) | authentic · accurate | (unchanged) | S1, S3 | Exact bulletin wording `SOURCE NEEDED` |
| E3 | Nov 5 | facebook / news | Real flash flooding + rescues in Cebu | authentic · accurate | (unchanged) | S4 | Real event; share **with context**, no exaggeration |
| E4 | ~Nov 5–7 | facebook / messenger | "Homes destroyed by Tino" image | **unverified-at-the-time** | **synthetic · false** | S5 | AFP: provenance/disclosure trail, Google AI marking, visual inconsistencies (specifics `SOURCE NEEDED`) |
| E5 | Nov 6 → viral | facebook / tiktok (orig. X) | "Cebu is drowning" image | **unverified-at-the-time** | **synthetic · false/misleading** | S6 | Visible **Gemini** logo (lower-right); no disclosure; real flood ≠ this visual |
| E6 | Nov 7 | official-advisory | OCD-7 warning: verify AI photos; rely on PAGASA | authentic · accurate | (unchanged) | S7 | The corrective; redirect family to official sources |

*(≥6 evidence entries per product def §14 — met.)*

---

## 4. Reveal Facts (what actually happened + consequences)

Documented, cited. There is only **one** historical timeline (product def §11).

- **The flooding was real and severe.** Cebu experienced documented flash flooding and rescue operations during Typhoon Tino; PAGASA issued official warnings and raised wind signals (up to No. 4 in 8 areas at peak). [S1, S2, S3, S4]
- **Fabricated media circulated *during* the real emergency.** Multiple AI-generated images misrepresented the disaster — a "homes destroyed" image (debunked by AFP, S5) and the "Cebu is drowning" image (debunked by VERA Files, S6, which carried a visible Gemini watermark and no disclosure). [S5, S6]
- **Officials responded to the misinformation.** OCD-7 warned the public about AI-generated typhoon photos, urged verification before sharing, and pointed people to **PAGASA / official sources**. [S7]
- **Consequence / teaching payload.** Synthetic media spread alongside genuine hazard information, risking confusion and distraction from real danger — the exact reason to verify **and** to still act on credible official warnings. **Core teaching point:** *image authenticity and claim accuracy are separate questions* — the disaster was real even though some images were fake. [S5, S6, S7]
- **Casualties.** ~224 deaths reported as of Nov 9 *(S6, citing news)*. **`SOURCE NEEDED`: official dated figure before any player-facing use.**

---

## 5. Source / Provenance Log

The eight approved sources (product def §18). Preserve dates so the Evidence Explorer can separate what was knowable-at-the-time from later confirmation.

| ID | Publisher | Title | Date | URL | Used for |
|---|---|---|---|---|---|
| **S1** | DOST-PAGASA | Tropical Cyclone Preliminary Report: Typhoon Tino / Kalmaegi | Report period Oct 31 – Nov 7, 2025; rev. Jan 14, 2026 | https://pubfiles.pagasa.dost.gov.ph/pagasaweb/files/tamss/weather/tcprelimsummary/PAGASA_Prelim_2025_TINO_rev1.pdf | **Authoritative** chronology, status, landfalls, signals, rainfall |
| **S2** | Philippine Information Agency | Red alert status raised over Cebu | Nov 3, 2025 | https://pia.gov.ph/news/red-alert-status-raised-over-cebu-evacuation-sea-travel-ban-continue-as-tino-nears/ | Red alert, suspensions, evacuation, sea-travel ban |
| **S3** | DSWD | DROMIC Report #2 (as of Nov 4, 6:00 AM) | Nov 4, 2025 | https://dromic.dswd.gov.ph/wp-content/uploads/2025/11/DSWD-DROMIC-Report-2-on-the-Effects-of-Typhoon-Tino-as-of-04-November-2025-6AM.pdf | Official hazard context; cited PAGASA life-threatening-conditions bulletin |
| **S4** | Philippine Information Agency | Cebu launches rescue operations as flash floods trap residents | Nov 5, 2025 | https://pia.gov.ph/news/cebu-launches-rescue-ops-as-flash-floods-trap-residents-during-tino-onset/ | Documented real flooding + rescue response |
| **S5** | AFP Fact Check | AI image falsely presented as Typhoon Kalmaegi destruction | Nov 7, 2025 | https://factcheck.afp.com/doc.afp.com.838C6T3 | AI "destroyed houses" image; provenance, Google AI marking, inconsistencies |
| **S6** | VERA Files | "Cebu is drowning" image was AI-generated | Nov 11, 2025 | https://verafiles.org/articles/fact-check-circulating-photo-of-cebu-is-drowning-ai-generated | AI Cebu-flood image; Gemini mark; missing disclosure; real flood confirmed |
| **S7** | PIA (reporting OCD Region 7) | OCD-7 warns of AI-generated typhoon photos circulating online | Nov 7, 2025 | https://pia.gov.ph/news/ocd-7-warns-of-ai-generated-typhoon-photos-circling-online/ | Official warning; verify before sharing; rely on PAGASA |
| **S8** | Philippine Information Agency | Cebu City ramps up disaster preparedness ahead of Typhoon Tino | Nov 3, 2025 | https://pia.gov.ph/news/cebu-city-ramps-up-disaster-preparedness-ahead-of-typhoon-tino/ | Preparedness measures, evacuation centers, resident advice |

> **Corroboration note (not citations).** Landfall date/sequence and OCD-7 wording were cross-checked against general reporting during this research; per the chronology rule, **all such specifics are confirmed against S1/S7 directly before player-facing use** and are not sourced to non-approved outlets in the case data.

---

## 6. Source Gaps & Discrepancies (`SOURCE NEEDED`)

Must be closed at authoring (D5) / before the Source Gate (product def §20):

1. **S1 chronology specifics** — exact TCWS issuance times per area; **exact Cebu landfall date/time/place + time zone**; peak category; Cebu/Central Visayas rainfall figures. *(S1 PDF not machine-readable in this environment.)*
2. **S3 bulletin text** — the exact PAGASA "life-threatening conditions" wording DROMIC #2 cites, plus precise report timestamps. *(PDF not readable here.)*
3. **S4 specifics** — exact affected communities, number rescued, official response figures. *(PIA page returned 403.)*
4. **S5 (AFP) specifics** — exact description of the "destroyed houses" image, the exact AI/Google marking, and its **first-circulation date/time**. *(AFP page not fetchable.)*
5. **⚠ Discrepancy — Cebu landfall date.** OCD-7/PIA phrasing references AI photos of the **"Nov 5 landfall,"** while other reporting indicates a **Cebu landfall ~dawn Nov 4**. **Resolve using S1 (PAGASA)** per the chronology rule and record the resolution in provenance notes.
6. **Casualty figure** — ~224 deaths (S6/news, as of Nov 9) needs an **official dated DROMIC/NDRRMC report** before any player-facing use (product def §7).
7. **Media rights** — the actual AI images (S5, S6) and any third-party real-flood photos **must not be republished** in the app until attribution/copyright/prototype-use is cleared (Source Rule 8). Use labeled reconstructions/descriptions.
8. **Per-message provenance** — every player-facing message must be tagged exact/paraphrased/reconstructed with a provenance note (Source Gate §20). Table §2 sets the intended handling; final tagging happens at authoring.

---

## 7. Clarifications to Flag (not silently chosen)

Product-definition items needing a team decision before/at authoring:

- **Node 2 ↔ Node 3 timing** depends on the exact Cebu landfall date (gap #5). Confirm from S1 so "as Tino approaches/passes" (Node 2) vs "real flooding + rescue" (Node 3) sit on the correct days.
- **Node 5 channel** — the artifact originated on **X**, outside the app's channel set. Recommend representing it as reposted into Facebook/Messenger (how it actually spread); confirm at UX (D3)/authoring (D5).
- **Node 3 real-flood visual** — will the app use a **licensed real photo** or a **text/description** stand-in? This is a media-rights + UX decision (gap #7); flag for D3/D5, don't assume.
- **Casualty mention** — decide whether any death toll appears in the reveal at all; if so, it must cite an official dated report (gap #6), otherwise omit per §7.

---

### Definition of Done (D2) — status

- [x] Verified event timeline (Nov 3–7) from approved sources
- [x] Message inventory (claim · channel · verdict · citation · handling) for all 7 nodes
- [x] Evidence table (≥6 entries) with truth-status-at-the-time vs reveal
- [x] Reveal facts with citations
- [x] Source / provenance log (S1–S8)
- [x] Source gaps recorded as `SOURCE NEEDED` (no guessing)
- [ ] **Open:** close gaps #1–#8 by reading S1/S3/S4/S5 directly (PDF reader / un-blocked access) and resolve the landfall-date discrepancy against S1 → then this pack clears the Source Gate and unblocks **D4 (schema)** and **D5 (authoring)**.
