import type { Case } from '@/lib/schema/case.schema';

/**
 * Case 001 — "The Flood Was Real"
 * Typhoon Tino (Kalmaegi), Cebu, Philippines
 * November 3-7, 2025
 *
 * Based on verified sources S1-S8 from the research pack.
 * Dialog is reconstructed/simulated (labeled per Source Gate rules).
 */
export const case001: Case = {
  id: 'the-flood-was-real',
  code: 'Case 001',
  title: 'The Flood Was Real',
  hook: 'The flood was real. Some of the images were not. Would you know what to trust — and when to act?',
  track: ['ai-mil', 'mil-education'],
  competency: 'critical-evaluation',
  historicalContext: {
    realEvent: 'Typhoon Tino (Kalmaegi), Cebu, Philippines',
    summary:
      'Typhoon Tino (Kalmaegi) caused severe flooding and damage across Cebu in November 2025. During the disaster, AI-generated images of destruction circulated on social media alongside authentic warning information, creating confusion about what was real. Official agencies like OCD-7 had to warn the public about synthetic media while simultaneously managing a real emergency response.',
    dateRange: 'November 3–7, 2025',
    sources: [
      { publisher: 'PAGASA', title: 'Tropical Cyclone Preliminary Report: Typhoon Tino/Kalmaegi', date: '2026-01-14', url: 'https://pubfiles.pagasa.dost.gov.ph/pagasaweb/files/tamss/weather/tcprelimsummary/PAGASA_Prelim_2025_TINO_rev1.pdf' },
      { publisher: 'PIA', title: 'Red alert status raised over Cebu', date: '2025-11-03', url: 'https://pia.gov.ph/news/red-alert-status-raised-over-cebu-evacuation-sea-travel-ban-continue-as-tino-nears/' },
      { publisher: 'DSWD', title: 'DROMIC Report #2', date: '2025-11-04', url: 'https://dromic.dswd.gov.ph/wp-content/uploads/2025/11/DSWD-DROMIC-Report-2-on-the-Effects-of-Typhoon-Tino-as-of-04-November-2025-6AM.pdf' },
      { publisher: 'PIA', title: 'Cebu launches rescue operations as flash floods trap residents', date: '2025-11-05', url: 'https://pia.gov.ph/news/cebu-launches-rescue-ops-as-flash-floods-trap-residents-during-tino-onset/' },
      { publisher: 'AFP Fact Check', title: 'AI image falsely presented as Typhoon Kalmaegi destruction', date: '2025-11-07', url: 'https://factcheck.afp.com/doc.afp.com.838C6T3' },
      { publisher: 'VERA Files', title: '"Cebu is drowning" image was AI-generated', date: '2025-11-11', url: 'https://verafiles.org/articles/fact-check-circulating-photo-of-cebu-is-drowning-ai-generated' },
      { publisher: 'PIA', title: 'OCD-7 warns of AI-generated typhoon photos circulating online', date: '2025-11-07', url: 'https://pia.gov.ph/news/ocd-7-warns-of-ai-generated-typhoon-photos-circling-online/' },
      { publisher: 'PIA', title: 'Cebu City ramps up disaster preparedness ahead of Typhoon Tino', date: '2025-11-03', url: 'https://pia.gov.ph/news/cebu-city-ramps-up-disaster-preparedness-ahead-of-typhoon-tino/' },
    ],
  },

  characters: {
    lola: { name: 'Lola' },
    maria: { name: 'Maria' },
    jeff: { name: 'Jeff' },
  },

  // ── ENTRY POINT: Node 0 is the hook scene ──
  entryNodeId: 'tino-00',

  nodes: [
    // ════════════════════════════════════════════
    // NODE 0 — THE HOOK (Notification → Phone → Choice)
    // ════════════════════════════════════════════
    {
      id: 'tino-00',
      speaker: undefined,
      sprite: undefined,
      background: 'bg_black',
      overlay: {
        type: 'notification',
        sender: 'Lola',
        text: 'Anak, may pinadala ito sa akin...',
      },
      text: '',
      vnChoices: [
        { id: 'share', label: 'SHARE', timerSeconds: 5 },
        { id: 'verify', label: 'VERIFY', timerSeconds: 5 },
        { id: 'ignore', label: 'IGNORE', timerSeconds: 5 },
      ],
      decisions: [
        {
          id: 'share',
          label: 'SHARE — Forward the message to family',
          effects: { communityTrust: -5, informationIntegrity: -3, publicSafety: 2 },
          next: 'tino-01',
        },
        {
          id: 'verify',
          label: 'VERIFY — Check if it\'s real',
          effects: { communityTrust: 8, informationIntegrity: 10, publicSafety: 5 },
          next: 'tino-01',
        },
        {
          id: 'ignore',
          label: 'IGNORE — Baka exaggerated lang',
          effects: { communityTrust: 0, informationIntegrity: -5, publicSafety: -5 },
          next: 'tino-01',
        },
      ],
    },

    // ════════════════════════════════════════════
    // NODE 1 — Red Alert: Cebu on heightened alert
    // Date: November 3, 2025
    // Sources: S2, S8
    // ════════════════════════════════════════════
    {
      id: 'tino-01',
      speaker: 'Lola',
      sprite: 'lola_worried',
      background: 'bg_bedroom_night',
      text: 'Anak, nabalitaan mo? Red Alert daw sa Cebu simula ngayong araw. Sinuspende ang klase, may evacuation. Sabi ng kumare ko, dapat daw mag-ipon tayo ng tubig at pagkain. Totoo kaya ito?',
      vnChoices: [
        { id: 'share_prepare', label: 'SHARE', timerSeconds: 5 },
        { id: 'verify_pagasa', label: 'VERIFY', timerSeconds: 5 },
        { id: 'ignore_alert', label: 'IGNORE', timerSeconds: 5 },
      ],
      decisions: [
        {
          id: 'share_prepare',
          label: 'SHARE — I-forward ang alert sa family group',
          effects: { communityTrust: 5, informationIntegrity: 0, publicSafety: 8 },
          next: 'tino-02',
          evidenceId: 'E1',
        },
        {
          id: 'verify_pagasa',
          label: 'VERIFY — I-check sa PAGASA official sources',
          effects: { communityTrust: 10, informationIntegrity: 12, publicSafety: 5 },
          next: 'tino-02',
          evidenceId: 'E1',
        },
        {
          id: 'ignore_alert',
          label: 'IGNORE — Baka exaggerated lang, bantayan na lang',
          effects: { communityTrust: -3, informationIntegrity: -5, publicSafety: -10 },
          next: 'tino-02',
          evidenceId: 'E1',
        },
      ],
    },

    // ════════════════════════════════════════════
    // NODE 2 — Life-threatening conditions warning
    // Date: November 4, 2025
    // Sources: S1, S3
    // ════════════════════════════════════════════
    {
      id: 'tino-02',
      speaker: 'Maria',
      sprite: 'maria_urgent',
      background: 'bg_bedroom_night',
      text: 'Uy! May bagong update galing PAGASA — life-threatening conditions daw habang papalapit si Tino sa atin. Sabi dito mag-stay indoors at sumunod sa mga evacuation orders. Pero may nagpopost din sa FB na parang OA naman daw... Ano ba talaga?',
      vnChoices: [
        { id: 'act_warning', label: 'ACT', timerSeconds: 4 },
        { id: 'verify_first', label: 'VERIFY', timerSeconds: 4 },
        { id: 'dismiss', label: 'DISMISS', timerSeconds: 4 },
      ],
      decisions: [
        {
          id: 'act_warning',
          label: 'ACT — Seryosohin ang warning at maghanda',
          effects: { communityTrust: 8, informationIntegrity: 5, publicSafety: 12 },
          next: 'tino-03',
          evidenceId: 'E2',
        },
        {
          id: 'verify_first',
          label: 'VERIFY — I-compare sa official PAGASA bulletin',
          effects: { communityTrust: 5, informationIntegrity: 10, publicSafety: 5 },
          next: 'tino-03',
          evidenceId: 'E2',
        },
        {
          id: 'dismiss',
          label: 'DISMISS — Sabi ng iba OA lang daw',
          effects: { communityTrust: -8, informationIntegrity: -5, publicSafety: -15 },
          next: 'tino-03',
          evidenceId: 'E2',
        },
      ],
    },

    // ════════════════════════════════════════════
    // NODE 3 — Real flash flooding + rescue ops
    // Date: November 5, 2025
    // Sources: S4
    // ════════════════════════════════════════════
    {
      id: 'tino-03',
      speaker: 'Jeff',
      sprite: 'jeff_concerned',
      background: 'bg_street_flood',
      text: 'Grabe yung mga lumalabas na balita! May flash floods sa Cebu City at iba pang areas — may mga rescue operations ongoing. May mga kaibigan ako na na-stranded. Yung mga pics na  shinishare nila, totoo talaga yung baha.',
      vnChoices: [
        { id: 'share_flood', label: 'SHARE', timerSeconds: 5 },
        { id: 'verify_context', label: 'VERIFY', timerSeconds: 5 },
        { id: 'ignore_flood', label: 'IGNORE', timerSeconds: 5 },
      ],
      decisions: [
        {
          id: 'share_flood',
          label: 'SHARE — Ipakita sa family ang totoong sitwasyon',
          effects: { communityTrust: 3, informationIntegrity: -5, publicSafety: 10 },
          next: 'tino-04',
          evidenceId: 'E3',
        },
        {
          id: 'verify_context',
          label: 'VERIFY — Check sources + add context bago i-share',
          effects: { communityTrust: 10, informationIntegrity: 12, publicSafety: 8 },
          next: 'tino-04',
          evidenceId: 'E3',
        },
        {
          id: 'ignore_flood',
          label: 'IGNORE — Iwasan ang panic, wag na pansinin',
          effects: { communityTrust: -5, informationIntegrity: -3, publicSafety: -8 },
          next: 'tino-04',
          evidenceId: 'E3',
        },
      ],
    },

    // ════════════════════════════════════════════
    // NODE 4 — AI-generated "destroyed houses" image circulates
    // Date: November 5-7, 2025
    // Sources: S5 (AFP Fact Check)
    // ════════════════════════════════════════════
    {
      id: 'tino-04',
      speaker: 'Maria',
      sprite: 'maria_skeptical',
      background: 'bg_evacuation_center',
      text: 'May bagong lumalabas na picture — mga bahay daw na winasak ni Tino. Super grabe ang damage. Pero may nagco-comment na hindi raw totoo, gawa lang daw ng AI. Paano natin malalaman kung totoo?',
      vnChoices: [
        { id: 'share_ai_image', label: 'SHARE', timerSeconds: 5 },
        { id: 'verify_image', label: 'VERIFY', timerSeconds: 5 },
        { id: 'wait_confirm', label: 'WAIT', timerSeconds: 5 },
      ],
      decisions: [
        {
          id: 'share_ai_image',
          label: 'SHARE — Ipakita sa family para aware sila',
          effects: { communityTrust: -10, informationIntegrity: -8, publicSafety: -5 },
          next: 'tino-05',
          evidenceId: 'E4',
        },
        {
          id: 'verify_image',
          label: 'VERIFY — I-reverse image search at i-check ang source',
          effects: { communityTrust: 12, informationIntegrity: 15, publicSafety: 8 },
          next: 'tino-05',
          evidenceId: 'E4',
        },
        {
          id: 'wait_confirm',
          label: 'WAIT — Hintayin ang official confirmation',
          effects: { communityTrust: 5, informationIntegrity: 5, publicSafety: 3 },
          next: 'tino-05',
          evidenceId: 'E4',
        },
      ],
    },

    // ════════════════════════════════════════════
    // NODE 5 — "Cebu is drowning" AI image goes viral
    // Date: November 6, 2025 (first posted)
    // Sources: S6 (VERA Files)
    // ════════════════════════════════════════════
    {
      id: 'tino-05',
      speaker: 'Maria',
      sprite: 'maria_urgent',
      background: 'bg_evacuation_center',
      text: 'Nakita mo yung "Cebu is drowning" na picture na viral sa TikTok at FB? Sobrang nakakatakot — para bang nasa ilalim ng dagat ang buong Cebu! Marami nagsheshare. Pero may nakita akong maliit na Gemini logo sa gilid... AI kaya ito?',
      vnChoices: [
        { id: 'share_tik', label: 'SHARE', timerSeconds: 4 },
        { id: 'verify_tik', label: 'VERIFY', timerSeconds: 4 },
        { id: 'correct_tik', label: 'CORRECT', timerSeconds: 4 },
      ],
      decisions: [
        {
          id: 'share_tik',
          label: 'SHARE — I-forward para alert ang iba',
          effects: { communityTrust: -12, informationIntegrity: -10, publicSafety: -8 },
          next: 'tino-06',
          evidenceId: 'E5',
        },
        {
          id: 'verify_tik',
          label: 'VERIFY — Hanapin ang fact-check tungkol dito',
          effects: { communityTrust: 10, informationIntegrity: 15, publicSafety: 8 },
          next: 'tino-06',
          evidenceId: 'E5',
        },
        {
          id: 'correct_tik',
          label: 'CORRECT — I-flag na AI-generated ito sa family',
          effects: { communityTrust: 15, informationIntegrity: 18, publicSafety: 10 },
          next: 'tino-06',
          evidenceId: 'E5',
        },
      ],
    },

    // ════════════════════════════════════════════
    // NODE 6 — OCD-7 official warning about AI images
    // Date: November 7, 2025
    // Sources: S7
    // ════════════════════════════════════════════
    {
      id: 'tino-06',
      speaker: 'Jeff',
      sprite: 'jeff_concerned',
      background: 'bg_classroom',
      text: 'May official warning na galing OCD Region 7! Sinasabi nila na may mga AI-generated na typhoon photos na kumakalat — yung sa Talisay, Consolacion, Mandaue. Sabi ng OCD, mag-verify daw muna bago mag-share at umasa sa official sources tulad ng PAGASA. Ano gagawin natin sa family group?',
      vnChoices: [
        { id: 'share_ocd', label: 'SHARE', timerSeconds: 5 },
        { id: 'educate', label: 'EDUCATE', timerSeconds: 5 },
        { id: 'ignore_ocd', label: 'IGNORE', timerSeconds: 5 },
      ],
      decisions: [
        {
          id: 'share_ocd',
          label: 'SHARE — I-post ang warning sa family group',
          effects: { communityTrust: 8, informationIntegrity: 10, publicSafety: 8 },
          next: 'tino-07',
          evidenceId: 'E6',
        },
        {
          id: 'educate',
          label: 'EDUCATE — I-explain paano mag-verify ng images',
          effects: { communityTrust: 15, informationIntegrity: 15, publicSafety: 12 },
          next: 'tino-07',
          evidenceId: 'E6',
        },
        {
          id: 'ignore_ocd',
          label: 'IGNORE — Medyo late na ito, move on na lang',
          effects: { communityTrust: -5, informationIntegrity: -8, publicSafety: -5 },
          next: 'tino-07',
          evidenceId: 'E6',
        },
      ],
    },

    // ════════════════════════════════════════════
    // NODE 7 — Player composes final family update (learning exercise)
    // Labeled as simulated exercise
    // ════════════════════════════════════════════
    {
      id: 'tino-07',
      speaker: undefined,
      sprite: undefined,
      background: 'bg_bedroom_night',
      overlay: {
        type: 'messenger',
        sender: 'You',
        text: 'Oras na para gumawa ng final update para sa family group. Paghiwalayin ang confirmed facts, false claims, at mga hindi pa sigurado.',
      },
      text: 'Gumawa ka ng summary para sa family — ano ang totoo, ano ang fake, at ano ang dapat gawin.',
      vnChoices: [
        { id: 'clear_summary', label: 'CLEAR', timerSeconds: 8 },
        { id: 'urgent_summary', label: 'URGENT', timerSeconds: 8 },
        { id: 'brief_summary', label: 'BRIEF', timerSeconds: 8 },
      ],
      decisions: [
        {
          id: 'clear_summary',
          label: 'CLEAR — Malinaw na paghiwalayin ang confirmed at false',
          effects: { communityTrust: 15, informationIntegrity: 18, publicSafety: 15 },
          next: 'END',
          evidenceId: 'E3',
        },
        {
          id: 'urgent_summary',
          label: 'URGENT — Focus sa safety warnings, bahala na ang details',
          effects: { communityTrust: 5, informationIntegrity: -5, publicSafety: 18 },
          next: 'END',
          evidenceId: 'E3',
        },
        {
          id: 'brief_summary',
          label: 'BRIEF — Maikli lang, tamad na mag-type',
          effects: { communityTrust: -5, informationIntegrity: -10, publicSafety: -5 },
          next: 'END',
          evidenceId: 'E3',
        },
      ],
    },
  ],

  // ── Evidence Items ──
  evidence: [
    {
      id: 'E1',
      channel: 'official-advisory',
      claim: 'Cebu placed on Red Alert; class suspensions, preemptive evacuation, sea-travel ban',
      mediaStatus: 'authentic',
      claimAccuracy: 'accurate',
      citation: {
        publisher: 'PIA',
        title: 'Red alert status raised over Cebu',
        date: '2025-11-03',
        url: 'https://pia.gov.ph/news/red-alert-status-raised-over-cebu-evacuation-sea-travel-ban-continue-as-tino-nears/',
      },
      note: 'Official advisory, paraphrased from S2/S8.',
    },
    {
      id: 'E2',
      channel: 'official-advisory',
      claim: 'Life-threatening conditions as Typhoon Tino approaches Cebu; take protective action',
      mediaStatus: 'authentic',
      claimAccuracy: 'accurate',
      citation: {
        publisher: 'DSWD',
        title: 'DROMIC Report #2 (citing PAGASA bulletin)',
        date: '2025-11-04',
        url: 'https://dromic.dswd.gov.ph/wp-content/uploads/2025/11/DSWD-DROMIC-Report-2-on-the-Effects-of-Typhoon-Tino-as-of-04-November-2025-6AM.pdf',
      },
      note: 'Paraphrased from S3 cited PAGASA bulletin. Exact wording SOURCE NEEDED.',
    },
    {
      id: 'E3',
      channel: 'facebook',
      claim: 'Real flash flooding and rescue operations across Cebu',
      mediaStatus: 'authentic',
      claimAccuracy: 'accurate',
      citation: {
        publisher: 'PIA',
        title: 'Cebu launches rescue operations as flash floods trap residents',
        date: '2025-11-05',
        url: 'https://pia.gov.ph/news/cebu-launches-rescue-ops-as-flash-floods-trap-residents-during-tino-onset/',
      },
      note: 'Real event documented by PIA. Media rights for photos: SOURCE NEEDED.',
    },
    {
      id: 'E4',
      channel: 'facebook',
      claim: 'AI-generated image falsely shown as homes destroyed by Typhoon Tino',
      mediaStatus: 'synthetic',
      claimAccuracy: 'false',
      citation: {
        publisher: 'AFP Fact Check',
        title: 'AI image falsely presented as Typhoon Kalmaegi destruction',
        date: '2025-11-07',
        url: 'https://factcheck.afp.com/doc.afp.com.838C6T3',
      },
      note: 'Synthetic image with false claim. Debunk published Nov 7. First circulation date SOURCE NEEDED.',
    },
    {
      id: 'E5',
      channel: 'tiktok',
      claim: '"Cebu is drowning" image — AI-generated, visible Gemini watermark, no disclosure',
      mediaStatus: 'synthetic',
      claimAccuracy: 'misleading',
      citation: {
        publisher: 'VERA Files',
        title: '"Cebu is drowning" image was AI-generated',
        date: '2025-11-11',
        url: 'https://verafiles.org/articles/fact-check-circulating-photo-of-cebu-is-drowning-ai-generated',
      },
      note: 'Synthetic image (Gemini mark visible). Real flooding but fabricated visual. First posted on X by @tagapagmulat Nov 6.',
    },
    {
      id: 'E6',
      channel: 'official-advisory',
      claim: 'OCD-7 warns public about AI-generated typhoon photos; urges verification and reliance on PAGASA',
      mediaStatus: 'authentic',
      claimAccuracy: 'accurate',
      citation: {
        publisher: 'PIA (reporting OCD Region 7)',
        title: 'OCD-7 warns of AI-generated typhoon photos circulating online',
        date: '2025-11-07',
        url: 'https://pia.gov.ph/news/ocd-7-warns-of-ai-generated-typhoon-photos-circling-online/',
      },
      note: 'Official warning from OCD-7. Paraphrased from S7.',
    },
  ],

  // ── Reflection / Behavioral Profiles ──
  reflection: {
    profiles: [
      {
        id: 'responsible',
        title: 'Responsible Crisis Communicator',
        description:
          'You verified uncertain content, corrected synthetic imagery respectfully, and acted on credible advisories. You were careful without being paralyzed — exactly the balance needed in an information crisis. Your family trusted your judgment because you took the time to check sources and communicate clearly.',
      },
      {
        id: 'skeptical',
        title: 'Skeptical but Delayed',
        description:
          'You avoided sharing fabricated content, which is good. But you sometimes hesitated too long to act on real warnings or to correct misinformation in your circle. In a real crisis, verified information needs to move fast too — speed and accuracy are both important.',
      },
      {
        id: 'emotional',
        title: 'Emotional Amplifier',
        description:
          'You responded to urgency and dramatic content without always verifying first. During a real disaster, sharing without checking can make it harder for accurate information to reach people who need it. The impulse to help is good — the habit of verifying before sharing makes that help effective.',
      },
    ],
  },

  // ── Community Toolkit ──
  toolkit: [
    {
      title: 'Verify Before You Share: Disaster Image Checklist',
      description:
        '1. Find the original uploader or publisher. 2. Check the date and claimed location. 3. Look for disclosure, platform labels, or provenance information. 4. Compare the claim with PAGASA, local DRRMOs, OCD, and credible news/fact-check sources. 5. Share only with accurate context and clear uncertainty.',
      source: 'Based on OCD-7 advisory (S7)',
    },
  ],
};
