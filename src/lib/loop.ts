/**
 * The case loop, as a single ordered definition (§8).
 *
 * intro → simulation → reveal → evidence → reflection → toolkit
 *
 * Every screen renders "next" from this list rather than hard-coding its
 * successor, so the loop is genuinely linear and reordering it is a one-line
 * change. Before D8 these screens were reachable but not sequenced: the
 * completion screen offered evidence and debrief as a fork, and the reveal
 * did not exist.
 */
export interface LoopStep {
  key: 'intro' | 'play' | 'reveal' | 'evidence' | 'debrief';
  label: string;
  /** Short description of what the player does here. */
  blurb: string;
  href: (caseId: string) => string;
}

export const LOOP: LoopStep[] = [
  {
    key: 'intro',
    label: 'Brief',
    blurb: 'What this case is and what you are being asked to do',
    href: (id) => `/cases/${id}`,
  },
  {
    key: 'play',
    label: 'Simulation',
    blurb: 'Receive, assess, decide, and watch the consequences',
    href: (id) => `/cases/${id}/play`,
  },
  {
    key: 'reveal',
    label: 'What happened',
    blurb: 'Your path collapses into the documented timeline',
    href: (id) => `/cases/${id}/reveal`,
  },
  {
    key: 'evidence',
    label: 'Evidence',
    blurb: 'Every item traced to its source and verification status',
    href: (id) => `/cases/${id}/evidence`,
  },
  {
    key: 'debrief',
    label: 'Reflection & toolkit',
    blurb: 'Your information profile and what to carry forward',
    href: (id) => `/cases/${id}/debrief`,
  },
];

export function stepIndex(key: LoopStep['key']): number {
  return LOOP.findIndex((s) => s.key === key);
}

export function nextStep(key: LoopStep['key']): LoopStep | null {
  const i = stepIndex(key);
  return i >= 0 && i < LOOP.length - 1 ? LOOP[i + 1] : null;
}

export function previousStep(key: LoopStep['key']): LoopStep | null {
  const i = stepIndex(key);
  return i > 0 ? LOOP[i - 1] : null;
}
