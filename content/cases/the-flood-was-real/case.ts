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

  // ── ENTRY POINT: Node 0 is the hook scene ──
  entryNodeId: 'tino-00',

  nodes: [
    {
      id: 'tino-00',
      background: 'bg_black',
      overlay: {
        type: 'notification',
        sender: 'Lola',
        text: 'Anak, may pinadala ito sa akin...',
      },
      text: 'A relative has forwarded a Red Alert message to the family group. This is a simulated message. What should you do first?',
      decisions: [
        {
          id: 'open_official_source',
          timerSeconds: 5,
          label: 'Open the linked official advisory before responding to the group.',
          effects: { communityTrust: 8, informationIntegrity: 10, publicSafety: 5 },
          profileEffects: { responsible: 3, skeptical: -1, emotional: -2 },
          next: 'tino-01',
        },
        {
          id: 'forward_unchecked',
          timerSeconds: 5,
          label: 'Forward the message immediately without checking where it came from.',
          effects: { communityTrust: -4, informationIntegrity: -8, publicSafety: 1 },
          profileEffects: { responsible: -2, skeptical: 0, emotional: 2 },
          next: 'tino-01',
        },
        {
          id: 'wait_for_others',
          timerSeconds: 5,
          label: 'Wait for someone else to confirm the message before doing anything.',
          effects: { communityTrust: -2, informationIntegrity: 1, publicSafety: -5 },
          profileEffects: { responsible: -1, skeptical: 3, emotional: -1 },
          next: 'tino-01',
        },
      ],
    },

    // ════════════════════════════════════════════
    // ════════════════════════════════════════════
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
      decisions: [
        {
          id: 'check_official_and_prepare',
          timerSeconds: 5,
          label: 'Check the official advisory, then share the source and a family preparation checklist.',
          effects: { communityTrust: 12, informationIntegrity: 15, publicSafety: 14 },
          profileEffects: { responsible: 3, skeptical: -1, emotional: -2 },
          next: 'tino-02',
        },
        {
          id: 'coordinate_family_needs',
          timerSeconds: 5,
          label: 'Ask who needs help preparing, then relay the verified Red Alert guidance.',
          effects: { communityTrust: 10, informationIntegrity: 8, publicSafety: 12 },
          profileEffects: { responsible: 3, skeptical: -1, emotional: -1 },
          next: 'tino-02',
        },
        {
          id: 'reshare_without_source',
          timerSeconds: 5,
          label: 'Forward the alert immediately without checking or adding the official source.',
          effects: { communityTrust: -4, informationIntegrity: -8, publicSafety: 3 },
          profileEffects: { responsible: -2, skeptical: 0, emotional: 2 },
          next: 'tino-02',
        },
        {
          id: 'wait_for_more_posts',
          timerSeconds: 5,
          label: 'Wait for more social-media posts before the family starts preparing.',
          effects: { communityTrust: -3, informationIntegrity: 1, publicSafety: -12 },
          profileEffects: { responsible: -1, skeptical: 3, emotional: -1 },
          next: 'tino-02',
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
      decisions: [
        {
          id: 'follow_official_evacuation_guidance',
          timerSeconds: 4,
          label: 'Treat the warning as credible: prepare now and follow any evacuation order.',
          effects: { communityTrust: 12, informationIntegrity: 10, publicSafety: 16 },
          profileEffects: { responsible: 3, skeptical: -1, emotional: -2 },
          next: 'tino-03',
        },
        {
          id: 'send_actionable_guidance',
          timerSeconds: 4,
          label: 'Send the official warning with clear, practical steps for the family.',
          effects: { communityTrust: 10, informationIntegrity: 12, publicSafety: 14 },
          profileEffects: { responsible: 3, skeptical: -1, emotional: -1 },
          next: 'tino-03',
        },
        {
          id: 'wait_for_social_confirmation',
          timerSeconds: 4,
          label: 'Wait until more people post about it before changing the family plan.',
          effects: { communityTrust: -4, informationIntegrity: 1, publicSafety: -15 },
          profileEffects: { responsible: -1, skeptical: 3, emotional: -1 },
          next: 'tino-03',
        },
        {
          id: 'dismiss_as_hype',
          timerSeconds: 4,
          label: 'Tell the group the warning is probably hype and there is no need to prepare.',
          effects: { communityTrust: -8, informationIntegrity: -8, publicSafety: -17 },
          profileEffects: { responsible: -3, skeptical: -1, emotional: 3 },
          next: 'tino-03',
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
      decisions: [
        {
          id: 'share_verified_rescue_update',
          timerSeconds: 5,
          label: 'Share the verified rescue update with its date, location, and official source.',
          effects: { communityTrust: 10, informationIntegrity: 15, publicSafety: 14 },
          profileEffects: { responsible: 3, skeptical: -1, emotional: -2 },
          next: 'tino-04',
        },
        {
          id: 'check_location_and_add_context',
          timerSeconds: 5,
          label: 'Confirm the location and add useful safety context before sharing.',
          effects: { communityTrust: 8, informationIntegrity: 16, publicSafety: 11 },
          profileEffects: { responsible: 3, skeptical: -1, emotional: -2 },
          next: 'tino-04',
        },
        {
          id: 'amplify_unconfirmed_rescue_claim',
          timerSeconds: 5,
          label: 'Add unconfirmed rescue details to make the update feel more urgent.',
          effects: { communityTrust: -8, informationIntegrity: -12, publicSafety: -5 },
          profileEffects: { responsible: -3, skeptical: -1, emotional: 3 },
          next: 'tino-04',
        },
        {
          id: 'stay_silent_to_avoid_panic',
          timerSeconds: 5,
          label: 'Stay silent because sharing any flood update might cause panic.',
          effects: { communityTrust: -4, informationIntegrity: 2, publicSafety: -10 },
          profileEffects: { responsible: -1, skeptical: 3, emotional: -1 },
          next: 'tino-04',
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
      decisions: [
        {
          id: 'inspect_provenance',
          timerSeconds: 5,
          label: 'Pause sharing and inspect the uploader, date, location, and disclosure.',
          effects: { communityTrust: 9, informationIntegrity: 16, publicSafety: 6 },
          profileEffects: { responsible: 3, skeptical: -1, emotional: -2 },
          next: 'tino-05',
        },
        {
          id: 'label_unverified_and_redirect',
          timerSeconds: 5,
          label: 'Tell the family the image is unverified, then redirect them to official safety updates.',
          effects: { communityTrust: 12, informationIntegrity: 14, publicSafety: 12 },
          profileEffects: { responsible: 3, skeptical: -1, emotional: -2 },
          next: 'tino-05',
        },
        {
          id: 'share_with_doubt',
          timerSeconds: 5,
          label: 'Share it with “not sure if real” but without checking the source.',
          effects: { communityTrust: -3, informationIntegrity: -7, publicSafety: -3 },
          profileEffects: { responsible: -2, skeptical: 1, emotional: 1 },
          next: 'tino-05',
        },
        {
          id: 'post_as_proof',
          timerSeconds: 5,
          label: 'Post the image as proof of the damage so everyone will take the storm seriously.',
          effects: { communityTrust: -10, informationIntegrity: -15, publicSafety: -8 },
          profileEffects: { responsible: -3, skeptical: -1, emotional: 3 },
          next: 'tino-05',
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
      decisions: [
        {
          id: 'explain_real_flood_vs_fabricated_visual',
          timerSeconds: 4,
          label: 'Explain that flooding is real, but this visual needs verification; point to official updates.',
          effects: { communityTrust: 15, informationIntegrity: 18, publicSafety: 13 },
          profileEffects: { responsible: 3, skeptical: -1, emotional: -3 },
          next: 'tino-06',
        },
        {
          id: 'check_original_and_watermark',
          timerSeconds: 4,
          label: 'Check the original post, the visible watermark, and whether the image has a disclosure.',
          effects: { communityTrust: 10, informationIntegrity: 18, publicSafety: 8 },
          profileEffects: { responsible: 3, skeptical: -1, emotional: -2 },
          next: 'tino-06',
        },
        {
          id: 'dismiss_all_flood_updates',
          timerSeconds: 4,
          label: 'Assume all flood updates are fake and tell the family to ignore them.',
          effects: { communityTrust: -6, informationIntegrity: -4, publicSafety: -13 },
          profileEffects: { responsible: -2, skeptical: 3, emotional: -1 },
          next: 'tino-06',
        },
        {
          id: 'repost_for_awareness',
          timerSeconds: 4,
          label: 'Repost the image because frightening visuals will make people pay attention.',
          effects: { communityTrust: -10, informationIntegrity: -15, publicSafety: -6 },
          profileEffects: { responsible: -3, skeptical: -1, emotional: 3 },
          next: 'tino-06',
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
      decisions: [
        {
          id: 'correct_with_official_link',
          timerSeconds: 5,
          label: 'Correct the earlier misinformation respectfully and include the OCD-7 or PAGASA link.',
          effects: { communityTrust: 14, informationIntegrity: 15, publicSafety: 12 },
          profileEffects: { responsible: 3, skeptical: -1, emotional: -2 },
          next: 'tino-07',
        },
        {
          id: 'share_verification_checklist',
          timerSeconds: 5,
          label: 'Share a short verification checklist and direct the group to official updates.',
          effects: { communityTrust: 12, informationIntegrity: 14, publicSafety: 10 },
          profileEffects: { responsible: 3, skeptical: -1, emotional: -2 },
          next: 'tino-07',
        },
        {
          id: 'delete_and_say_nothing',
          timerSeconds: 5,
          label: 'Delete your earlier share but say nothing to the family about the correction.',
          effects: { communityTrust: -3, informationIntegrity: 2, publicSafety: -5 },
          profileEffects: { responsible: -1, skeptical: 3, emotional: -1 },
          next: 'tino-07',
        },
        {
          id: 'publicly_shame_sender',
          timerSeconds: 5,
          label: 'Call out the sender harshly in the group without offering a verified correction.',
          effects: { communityTrust: -10, informationIntegrity: 3, publicSafety: 0 },
          profileEffects: { responsible: -2, skeptical: 0, emotional: 2 },
          next: 'tino-07',
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
      decisions: [
        {
          id: 'send_structured_update',
          timerSeconds: 8,
          label: 'Send a sourced update that separates confirmed, false, uncertain, and actionable information.',
          effects: { communityTrust: 16, informationIntegrity: 18, publicSafety: 16 },
          profileEffects: { responsible: 3, skeptical: -1, emotional: -3 },
          next: 'END',
        },
        {
          id: 'send_safety_first_update',
          timerSeconds: 8,
          label: 'Send a concise safety-first update with an official source and clear uncertainty.',
          effects: { communityTrust: 12, informationIntegrity: 11, publicSafety: 17 },
          profileEffects: { responsible: 2, skeptical: 0, emotional: -1 },
          next: 'END',
        },
        {
          id: 'wait_without_summary',
          timerSeconds: 8,
          label: 'Tell the family only to wait for official news, without summarizing what is known now.',
          effects: { communityTrust: -2, informationIntegrity: 3, publicSafety: -6 },
          profileEffects: { responsible: -1, skeptical: 3, emotional: -1 },
          next: 'END',
        },
        {
          id: 'send_alarmist_summary',
          timerSeconds: 8,
          label: 'Send an alarming summary built around dramatic claims and images without citations.',
          effects: { communityTrust: -10, informationIntegrity: -13, publicSafety: -10 },
          profileEffects: { responsible: -3, skeptical: -1, emotional: 3 },
          next: 'END',
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
      citations: [
        {
          publisher: 'Philippine Information Agency',
          title: 'Red alert status raised over Cebu',
          date: '2025-11-03',
          url: 'https://pia.gov.ph/news/red-alert-status-raised-over-cebu-evacuation-sea-travel-ban-continue-as-tino-nears/',
        },
        {
          publisher: 'Philippine Information Agency',
          title: 'Cebu City ramps up disaster preparedness ahead of Typhoon Tino',
          date: '2025-11-03',
          url: 'https://pia.gov.ph/news/cebu-city-ramps-up-disaster-preparedness-ahead-of-typhoon-tino/',
        },
      ],
      note: 'Official advisory, paraphrased from S2/S8.',
    },
    {
      id: 'E2',
      channel: 'official-advisory',
      claim: 'Life-threatening conditions as Typhoon Tino approaches Cebu; take protective action',
      mediaStatus: 'authentic',
      claimAccuracy: 'accurate',
      citations: [
        {
          publisher: 'DOST-PAGASA',
          title: 'Tropical Cyclone Preliminary Report: Typhoon Tino / Kalmaegi',
          date: '2026-01-14',
          url: 'https://pubfiles.pagasa.dost.gov.ph/pagasaweb/files/tamss/weather/tcprelimsummary/PAGASA_Prelim_2025_TINO_rev1.pdf',
        },
        {
          publisher: 'Department of Social Welfare and Development',
          title: 'DROMIC Report #2',
          date: '2025-11-04',
          url: 'https://dromic.dswd.gov.ph/wp-content/uploads/2025/11/DSWD-DROMIC-Report-2-on-the-Effects-of-Typhoon-Tino-as-of-04-November-2025-6AM.pdf',
        },
      ],
      note: 'Paraphrased from S3 cited PAGASA bulletin. Exact wording SOURCE NEEDED.',
    },
    {
      id: 'E3',
      channel: 'facebook',
      claim: 'Real flash flooding and rescue operations across Cebu',
      mediaStatus: 'authentic',
      claimAccuracy: 'accurate',
      citations: [{
        publisher: 'PIA',
        title: 'Cebu launches rescue operations as flash floods trap residents',
        date: '2025-11-05',
        url: 'https://pia.gov.ph/news/cebu-launches-rescue-ops-as-flash-floods-trap-residents-during-tino-onset/',
      }],
      note: 'Real event documented by PIA. Media rights for photos: SOURCE NEEDED.',
    },
    {
      id: 'E4',
      channel: 'facebook',
      claim: 'AI-generated image falsely shown as homes destroyed by Typhoon Tino',
      mediaStatus: 'synthetic',
      claimAccuracy: 'false',
      citations: [{
        publisher: 'AFP Fact Check',
        title: 'AI image falsely presented as Typhoon Kalmaegi destruction',
        date: '2025-11-07',
        url: 'https://factcheck.afp.com/doc.afp.com.838C6T3',
      }],
      note: 'Synthetic image with false claim. Debunk published Nov 7. First circulation date SOURCE NEEDED.',
    },
    {
      id: 'E5',
      channel: 'tiktok',
      claim: '"Cebu is drowning" image — AI-generated, visible Gemini watermark, no disclosure',
      mediaStatus: 'synthetic',
      claimAccuracy: 'misleading',
      citations: [{
        publisher: 'VERA Files',
        title: '"Cebu is drowning" image was AI-generated',
        date: '2025-11-11',
        url: 'https://verafiles.org/articles/fact-check-circulating-photo-of-cebu-is-drowning-ai-generated',
      }],
      note: 'Synthetic image (Gemini mark visible). Real flooding but fabricated visual. First posted on X by @tagapagmulat Nov 6.',
    },
    {
      id: 'E6',
      channel: 'official-advisory',
      claim: 'OCD-7 warns public about AI-generated typhoon photos; urges verification and reliance on PAGASA',
      mediaStatus: 'authentic',
      claimAccuracy: 'accurate',
      citations: [{
        publisher: 'PIA (reporting OCD Region 7)',
        title: 'OCD-7 warns of AI-generated typhoon photos circulating online',
        date: '2025-11-07',
        url: 'https://pia.gov.ph/news/ocd-7-warns-of-ai-generated-typhoon-photos-circling-online/',
      }],
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
