# rePlay — Product Definition & Scope Contract

## 1. Document Metadata

| Field | Value |
|---|---|
| **Document** | Product Definition & Scope Contract |
| **Product** | rePlay |
| **Case** | Case 001 — *The Flood Was Real* |
| **Proposed case id** | `the-flood-was-real` (kebab-case, stable) |
| **Historical setting** | Typhoon Tino (Kalmaegi), Cebu, Philippines |
| **Reconstruction window** | November 3–7, 2025 |
| **Version** | 1.0 (signed off — locked) |
| **Prepared** | 2026-07-27 |
| **Signed off** | 2026-07-27 |
| **Internal completion target** | August 7, 2026 |
| **Status** | **Locked (decisions only).** Approved by the team; scope is frozen. No UI design, schema, database, backend logic, or frontend code is authorized by this document. |

> **Source-of-truth statement.** This document is the scope contract for the rePlay MVP. When a later idea conflicts with it, the team must either reject the idea or formally revise this document (with sign-off) before proceeding. **Upon sign-off, this document supersedes any conflicting Case 001 / flagship-case references in `CLAUDE.md`; `CLAUDE.md` is to be corrected in a separate, approved change** (see §20–§22).

---

## 2. Decision Summary

| Decision | Locked definition |
|---|---|
| Product | rePlay |
| Case 001 | *The Flood Was Real* |
| Historical event | Typhoon Tino (Kalmaegi) and the disaster-information crisis surrounding severe flooding in Cebu |
| Reconstruction window | November 3–7, 2025 |
| Central dilemma | Real flooding and legitimate emergency warnings circulated alongside AI-generated disaster imagery. The player must verify media **without becoming so skeptical that they ignore real danger.** |
| Primary audience | Filipino learners aged 16–24 who are mobile-first, regularly use Facebook / Messenger / TikTok, live in or have family in disaster-prone communities, and have limited formal training in verifying synthetic media |
| Player role | An 18-year-old student in Cebu helping their family interpret typhoon information through a simulated family Messenger group |
| Format | Mobile-first web app with a decision-based game simulation |
| Tracks | AI and MIL **+** MIL Education |
| Primary MIL competency | Critical evaluation of content |
| Primary UNESCO value | Quality Education (SDG 4) |
| Supporting UNESCO value | Inclusion and Diversity |
| Core loop | receive → assess → decide → meter consequences → changing information → one historical reveal → Evidence Explorer → rule-based reflection → one toolkit card |
| Decision vocabulary | Verify · Share with context · Wait · Ignore · Ask / check an official source |
| Meters | Community Trust · Information Integrity · Public Safety |
| Behavioral profiles | Responsible Crisis Communicator · Skeptical but Delayed · Emotional Amplifier |
| MVP size | 1 case · 7 decision moments · 3 meters · 3 behavioral profiles · 1 historical reveal · ≥ 6 evidence entries · 1 rule-based reflection · 1 toolkit card |
| Target play time | 6–8 minutes |
| MVP language | English |
| AI inside the MVP | None (no generative dialogue, no adaptive AI) |

---

## 3. Locked Product Pitch, Case Hook & Tagline

**Product pitch** (use consistently in the proposal, pitch script, website copy, and project documentation):

> rePlay is a gamified web platform that transforms verified Philippine information crises into interactive, evidence-based simulations, empowering youth to build media and information literacy through real-world decision-making, reflection, and historical replay.

**Case-specific hook:**

> The flood was real. Some of the images were not. Would you know what to trust—and when to act?

**Product tagline:**

> History already happened. Your decisions do not have to repeat it.

---

## 4. Problem

During disasters, young people receive official advisories, eyewitness reports, reposted photographs, emotional appeals, and synthetic media through the same social channels. The difficulty is not merely identifying whether one image is fake. A person must decide:

- whether the source is credible;
- whether the date and location match the claim;
- whether the information is relevant to their family;
- whether to share, wait, verify, ask, or act;
- and how to communicate uncertainty without spreading panic or dismissing real danger.

Typhoon Tino provides a documented Philippine case in which severe flooding in Cebu was **real**, while AI-generated disaster images were **also** circulated as if they showed actual typhoon damage.

---

## 5. Product Promise & Learning Outcomes

After completing Case 001, the player should be better able to:

1. verify a disaster post by checking its source, date, location, and supporting evidence;
2. distinguish **image authenticity** from **claim accuracy**;
3. recognize that fabricated content can circulate during a genuine emergency;
4. communicate uncertainty responsibly; and
5. act on credible emergency information without waiting for perfect certainty.

The product **does not** promise that players become expert fact-checkers after one case. It gives them a safe environment to practice responsible decisions under pressure.

---

## 6. Player Definition & Responsibility Boundary

**The player is:** an 18-year-old student in Cebu helping their family interpret typhoon information arriving through a simulated family Messenger group, Facebook posts, local updates, and government advisories during and immediately after Typhoon Tino.

**The player CAN influence:**

- what is forwarded to the simulated family group;
- whether uncertainty is clearly communicated;
- whether official advisories are prioritized;
- whether misleading media is corrected;
- whether the family receives useful, verified action guidance.

**The player CANNOT influence:**

- the typhoon's path;
- rainfall or flooding;
- official government actions;
- the real historical outcome;
- the existence of misinformation outside the simulated group.

> **Boundary rationale.** This prevents the product from implying that one learner could have prevented the disaster.

---

## 7. Historical & Information Scope

**Included**

- official preparedness and evacuation guidance before the storm;
- official typhoon and hazard information;
- documented severe flooding and rescue operations in Cebu;
- a documented AI-generated image falsely presented as typhoon destruction;
- the documented "Cebu is drowning" AI-generated image;
- official OCD-7 guidance warning against sharing AI-generated disaster imagery;
- a final, clearly-labeled learner-created family update that separates confirmed, unverified, and false information.

**Excluded**

- a complete documentary history of Typhoon Tino;
- political blame or a conclusion about the causes of Cebu flooding;
- graphic images of victims or deceased persons;
- unsourced social-media rumors;
- invented quotations presented as historical;
- casualty totals unless essential and tied to a dated official report;
- claims that an AI detector alone proves an image is synthetic;
- any content outside the November 3–7, 2025 window unless used only as later verification evidence.

**Chronology rule.** PAGASA's revised preliminary report (**S1**) is the authority for meteorological chronology. When a secondary report conflicts with PAGASA on dates, landfalls, or storm status, the case follows PAGASA and records the discrepancy in the provenance notes. Exact times may appear **only** when a source provides them, and all displayed times **must** state the time zone.

---

## 8. Core Experience

The player completes this sequence:

1. **Receive** — a time-stamped information item arrives through a simulated channel.
2. **Assess** — the player inspects its source, date, location, context, and available evidence.
3. **Decide** — the player chooses from 2–4 context-appropriate actions.
4. **Experience consequences** — the three meters update and the family group reacts.
5. **Continue under changing information** — later information may confirm, contradict, or contextualize earlier content.
6. **Historical reveal** — the player's branching path collapses into the single documented historical timeline.
7. **Evidence Explorer** — each important item is labeled and traced to its source.
8. **Reflection / Information Profile** — a deterministic profile explains the player's decision habits.
9. **Community Toolkit** — the player receives one concise disaster-media verification resource.

**Platform action vocabulary:** Verify · Share with context · Wait · Ignore · Ask / check an official source.
Not every decision moment displays every action. **Each node presents only the 2–4 choices that make sense in that situation;** the specific subset per node is finalized during case authoring (§9, §20).

---

## 9. Seven-Node Evidence Matrix

> **Reconstruction rule.** Nodes 1–6 are grounded in documented information. **Node 7 is a simulated learning exercise and must be labeled as such — it must never be presented as a message a real person sent during the event.** Exact player-facing wording is written **only after** the source artifact for each node is approved (§20). Actions listed below are the *decision focus*, not final copy.

| Node | Historical / learning moment | Primary source(s) | Knowable-at | Media & claim status | Player decision focus |
|---|---|---|---|---|---|
| **1** | Cebu placed on heightened alert; classes, evacuations, and preparedness measures announced | S2, S8 | Nov 3, 2025 | Authentic official guidance | Whether to treat the warning as relevant and begin preparation |
| **2** | Life-threatening conditions reported as Tino approaches/passes Cebu | S1, S3 | Nov 4, 2025 (per S3; chronology per S1) | Authentic official warning | Whether to prioritize official warnings and communicate urgent action |
| **3** | Real flash flooding and rescue operations documented across Cebu | S4 | Nov 5, 2025 | Authentic media, accurate claim | Whether to share verified local safety information without exaggeration |
| **4** | An AI-generated image shared as if it shows homes destroyed by Tino | S5 | Circulating during window; formally debunked Nov 7 (S5) | **Synthetic image, false claim** | Whether to inspect provenance, disclosure, and claim context before sharing |
| **5** | The "Cebu is drowning" AI-generated image circulates without disclosure | S6 | Circulating during window; formally debunked Nov 11 (S6) | **Synthetic image; real flooding but fabricated visual + unsupported causal framing** | Whether to separate the real flood from a fabricated visual and unsupported framing |
| **6** | OCD-7 warns the public about AI-generated typhoon images and urges reliance on official sources | S7 | Nov 7, 2025 | Authentic official warning | Whether to correct earlier content and redirect the family to reliable updates |
| **7** | The player prepares a final family update *(simulated exercise)* | S1–S7 | N/A — learning exercise | **Reconstructed / simulation — must be labeled** | Whether to clearly label what is confirmed, false, uncertain, and actionable |

> **Knowable-vs-later note.** The AI images at Nodes 4–5 *circulated* during the window, but their authoritative debunks (**S5** AFP, Nov 7; **S6** VERA Files, Nov 11) are **later verification evidence**. The simulation must not present the later debunk as knowledge the player already had at the moment of decision; the debunk belongs in the Evidence Explorer (§13). `SOURCE NEEDED:` first-documented circulation date/time (with time zone) of the S5 and S6 images, to be confirmed during authoring.

---

## 10. Meter Definitions

All meters range from low to high; **higher is desirable.** They are **educational simulation indicators** — they do **not** represent real lives saved, real public behavior, or a scientifically validated impact model.

**Community Trust** — whether the simulated family sees the player as careful, transparent, respectful, and useful. Improves when the player explains uncertainty, corrects misinformation respectfully, shares credible and relevant updates, and avoids false certainty.

**Information Integrity** — whether information circulating in the simulated group is accurate, contextualized, and traceable. Improves when the player checks the original source, verifies dates and locations, distinguishes authentic media from accurate claims, and adds context before sharing.

**Public Safety** — whether the family is prepared and responding appropriately to credible information. Improves when the player follows verified warnings, communicates actionable guidance, avoids dangerous delays, and does not let fabricated media distract from real hazards.

---

## 11. Behavioral Profiles & Historical Reveal

There is only **one historical timeline.** The product must not invent alternate versions of what happened. Player choices change the player's *path and profile*, not history.

At the end, the player receives one of three **rule-based, descriptive** profiles:

| Profile | Description |
|---|---|
| **Responsible Crisis Communicator** | Verified uncertain content, corrected synthetic imagery respectfully, and acted on credible advisories. |
| **Skeptical but Delayed** | Avoided fabricated content but became too hesitant to communicate or act on credible warnings. |
| **Emotional Amplifier** | Repeatedly responded to urgency, dramatic imagery, or social proof without sufficient verification. |

> The profile is **descriptive, not shaming.** The interface must **not** display "wrong," "failed," or similar punitive language during the simulation.

---

## 12. Reflection & Scoring Definition

Reflection **is included** in the MVP and is:

- deterministic;
- rule-based;
- generated from recorded player decisions;
- **free of generative AI**;
- written in plain, encouraging language.

The reflection evaluates whether the player: checked sources · checked date and location · sought official confirmation · shared with appropriate context · acted on credible warnings · communicated uncertainty.

> Exact score weights and meter deltas belong in the later engine specification. They must **preserve the meanings defined in this document.**

---

## 13. Evidence Explorer Requirements

For each major information item, the Evidence Explorer must show:

- what the player encountered;
- the claim being made;
- whether the media was **authentic, synthetic, altered, miscaptioned, or not-yet-verifiable**;
- whether the accompanying **claim** was accurate;
- the verification method used by the source;
- the original publisher;
- the publication date;
- a link or citation.

**Required teaching point:**

> The authenticity of an image and the accuracy of its caption are **separate questions.**

A real photo may carry a false date or location. An AI-generated image may refer to a disaster that genuinely occurred. Visual anomalies may be clues, but **provenance, source checking, reverse search, disclosure, and official confirmation are stronger methods** than an AI-detection score alone.

---

## 14. Community Toolkit Definition

The MVP unlocks **one** toolkit card:

**Verify Before You Share: Disaster Image Checklist**

1. Find the original uploader or publisher.
2. Check the date and claimed location.
3. Look for disclosure, platform labels, or provenance information.
4. Compare the claim with PAGASA, local DRRMOs, OCD, and credible news / fact-check sources.
5. Share only with accurate context and clear uncertainty.

The toolkit cites **S7** as the official basis for the verification guidance and links players to **PAGASA** as the authorized weather-warning source.

---

## 15. MVP Scope Contract

**Included**

- [ ] one complete Case 001
- [ ] seven decision moments
- [ ] 2–4 options per decision
- [ ] three live meters
- [ ] one documented historical reveal
- [ ] at least six evidence entries
- [ ] three behavioral profiles
- [ ] one rule-based reflection
- [ ] one toolkit card
- [ ] 6–8 minute target completion time
- [ ] mobile-first responsive use
- [ ] English MVP copy
- [ ] local, structured case content
- [ ] source validation

**Explicitly excluded** (none may enter the MVP unless this document is revised and signed off again)

- user accounts · authentication · a production database · multiple cases
- AI-generated dialogue or feedback · adaptive AI
- contributor pipeline · educator dashboard · classroom analytics
- regional-language localization · Cebuano localization
- social sharing · multiplayer · push notifications
- complex achievements · a full content-management system

---

## 16. Demo Success Metric

> The MVP demo succeeds when **at least four of five first-time testers** complete the 6–8-minute case **without facilitator help** and correctly apply **at least three of four checks — source, date, location, and official confirmation —** to a new disaster post presented after the case.

Supporting observations may include whether testers: understand why a fake image does not make the disaster fake; can explain the difference between "unverified" and "false"; can identify the official source they would check next.

> **No learning-improvement percentage may be claimed until testing has actually been conducted.**

---

## 17. Competition Alignment

| Element | Locked position |
|---|---|
| UNESCO theme | Play Your Part: Youth Designing the Future of Media and Information Literacy |
| Format | App/Website with a game-based simulation |
| Track 1 | AI and MIL |
| Track 2 | MIL Education |
| Primary MIL competency | Critical evaluation of content |
| Primary value | Quality Education (SDG 4) |
| Supporting value | Inclusion and Diversity |
| Inclusion approach | Mobile-first, plain-language, low-complexity interaction for Filipino youth in disaster-prone communities |
| Innovation claim | Playable information history: learners make decisions inside a verified real information crisis, then compare their path with the documented timeline |
| Feasibility proof | One complete, source-backed vertical slice rather than multiple unfinished cases |

---

## 18. Source & Evidence Register

> All eight sources are preserved verbatim (publisher, date, use, URL). Source dates must be preserved so the Evidence Explorer can distinguish what was knowable at each moment from what was confirmed later.

**S1 — PAGASA Tropical Cyclone Preliminary Report: Typhoon Tino / Kalmaegi**
- Publisher: DOST-PAGASA · Report period: Oct 31 – Nov 7, 2025 · Revision: Jan 14, 2026
- Use: **Authoritative** storm chronology, status, landfalls, rainfall, and official product issuances.
- URL: https://pubfiles.pagasa.dost.gov.ph/pagasaweb/files/tamss/weather/tcprelimsummary/PAGASA_Prelim_2025_TINO_rev1.pdf

**S2 — Red alert status raised over Cebu**
- Publisher: Philippine Information Agency · Date: Nov 3, 2025
- Use: Red Alert status, class suspensions, preemptive evacuation, sea-travel suspension, official preparedness guidance.
- URL: https://pia.gov.ph/news/red-alert-status-raised-over-cebu-evacuation-sea-travel-ban-continue-as-tino-nears/

**S3 — DSWD DROMIC Report #2**
- Publisher: Department of Social Welfare and Development · Report time: Nov 4, 2025, 6:00 AM
- Use: Near-event official hazard context and the PAGASA bulletin describing life-threatening conditions as Tino approached Cebu.
- URL: https://dromic.dswd.gov.ph/wp-content/uploads/2025/11/DSWD-DROMIC-Report-2-on-the-Effects-of-Typhoon-Tino-as-of-04-November-2025-6AM.pdf

**S4 — Cebu launches rescue operations as flash floods trap residents**
- Publisher: Philippine Information Agency · Date: Nov 5, 2025
- Use: Documented **real** flooding, affected Cebu communities, rooftop rescues, and government response.
- URL: https://pia.gov.ph/news/cebu-launches-rescue-ops-as-flash-floods-trap-residents-during-tino-onset/

**S5 — AI image falsely presented as Typhoon Kalmaegi destruction**
- Publisher: AFP Fact Check · Date: Nov 7, 2025
- Use: Documented AI-generated image of destroyed houses; provenance checks, disclosure trail, Google AI marking, supporting visual inconsistencies.
- URL: https://factcheck.afp.com/doc.afp.com.838C6T3

**S6 — "Cebu is drowning" image was AI-generated**
- Publisher: VERA Files · Date: Nov 11, 2025
- Use: Documented viral AI-generated Cebu flood image, missing disclosure, visible Gemini mark, reposting context, and distinction between fabricated imagery and real flooding.
- URL: https://verafiles.org/articles/fact-check-circulating-photo-of-cebu-is-drowning-ai-generated

**S7 — OCD-7 warning on AI-generated typhoon photos**
- Publisher: Philippine Information Agency, reporting Office of Civil Defense Region 7 guidance · Date: Nov 7, 2025
- Use: Official warning about AI-generated flood imagery in Cebu and guidance to verify content and rely on authorized sources such as PAGASA.
- URL: https://pia.gov.ph/news/ocd-7-warns-of-ai-generated-typhoon-photos-circling-online/

**S8 — Cebu City disaster preparedness measures**
- Publisher: Philippine Information Agency · Date: Nov 3, 2025
- Use: Preparedness measures, evacuation centers, emergency coordination, and advice for residents in coastal and riverside areas.
- URL: https://pia.gov.ph/news/cebu-city-ramps-up-disaster-preparedness-ahead-of-typhoon-tino/

---

## 19. Source Rules & Ethical Safeguards

1. Use **S1** for meteorological chronology over secondary reporting.
2. Use government and official-agency sources for warnings, evacuations, and response.
3. Use AFP (**S5**) and VERA Files (**S6**) for the specific misinformation artifacts they verified.
4. **Do not** treat AI-detection scores as standalone proof.
5. **Do not** reproduce a social-media post as an exact historical artifact unless its wording and provenance are documented.
6. Clearly label reconstructed family dialogue as **simulation dialogue**.
7. **Do not** use graphic victim imagery.
8. **Do not** republish third-party photographs until attribution, copyright, and prototype-use conditions are checked.
9. Preserve source dates so the Evidence Explorer can distinguish what was knowable at each moment from what was confirmed later.
10. Maintain a provenance note for every player-facing historical claim.

> **Fabrication guard.** No exact posts, family messages, timestamps, quotations, or casualty figures may be invented. Where a required detail cannot be verified from a source, the authoring artifact must write `SOURCE NEEDED` rather than guess.

---

## 20. Source Gate Before Design or Development

This Product Definition may be approved now, but **case authoring cannot be marked complete** until:

- [ ] Every node has at least one approved source.
- [ ] Every historical message is marked as **exact, paraphrased, or reconstructed**.
- [ ] Exact times and time zones are verified.
- [ ] The team has checked media-use and attribution requirements.
- [ ] No graphic or privacy-violating imagery is included.
- [ ] A Cebu-aware reviewer checks local context and terminology.
- [ ] All source links are archived or backed up.
- [ ] The final chronological evidence table has been reviewed by Kish.
- [ ] Claims from later fact-checks are not presented as knowledge the player had earlier.
- [ ] Any conflict between sources is recorded and resolved using the source hierarchy.

---

## 21. Definition of Done

This Product Definition is complete when:

- [x] **Kish** approves the case, pitch, audience, loop, scope, and success metric.
- [x] **Gigi** confirms the source-backed content can be represented as structured data.
- [x] **Bads** confirms the core loop and outcomes are technically interpretable without inventing product behavior.
- [x] **Khylle** confirms the player journey is clear enough to wireframe without making new product decisions.
- [x] All four members understand what is explicitly excluded (§15).
- [x] The team signs §22.
- [x] Conflicting references in `CLAUDE.md` are updated in a separate approved change.

---

## 22. Team Sign-off & Change Control

**Sign-off**

| Member | Role | Approved | Date |
|---|---|---|---|
| Kish | Lead · Research / Content · QA | ☑ | 2026-07-27 |
| Gigi | Case Data Architect | ☑ | 2026-07-27 |
| Bads | Backend Engineer | ☑ | 2026-07-27 |
| Khylle | Frontend Engineer | ☑ | 2026-07-27 |

**Change-control log**

| Version | Date | Author | Summary |
|---|---|---|---|
| 0.1 | 2026-07-27 | Team (drafted for review) | Initial formalization of Case 001 — *The Flood Was Real* (Typhoon Tino, Cebu). Supersedes the older "Flood Warning" reference case pending sign-off and a separate `CLAUDE.md` update. |
| 1.0 | 2026-07-27 | Team | **Signed off — scope locked.** `CLAUDE.md` conflicts already reconciled (commit `ca6ea63`). Gigi's role recorded as **Case Data Architect**. D2 (case research pack) authorized to begin. |

> No excluded item (§15) may enter the MVP, and no locked decision (§2) may change, without a new version row here and renewed sign-off above.
