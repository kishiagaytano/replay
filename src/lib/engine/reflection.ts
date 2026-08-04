import {
  LEARNING_SIGNALS,
  type Case,
  type LearningSignal,
} from '@/lib/schema/case.schema';

/**
 * Rule-based reflection (Product Definition §12).
 *
 * Deterministic, generated from recorded player decisions, free of generative
 * AI, and written in plain, encouraging language. §11 is explicit that the
 * output is *descriptive, not shaming* — no line in this module may say
 * "wrong", "failed", "incorrect", or equivalent.
 */

export type SignalTally = Record<LearningSignal, number>;

export interface ReflectionLine {
  signal: LearningSignal;
  /** Times the player demonstrated this check. */
  demonstrated: number;
  /** Moments where at least one option offered this check. */
  opportunities: number;
  tone: 'affirming' | 'encouraging' | 'instructive';
  text: string;
}

/** Thresholds on demonstrated / opportunities. Documented, not incidental. */
const AFFIRMING_AT = 0.7;
const ENCOURAGING_AT = 0.3;

const LABELS: Record<LearningSignal, string> = {
  'checked-source': 'checking where information came from',
  'checked-date-location': 'checking the date and location of what you saw',
  'sought-official-confirmation': 'going to an official source to confirm',
  'shared-with-context': 'adding context when you passed something on',
  'acted-on-credible-warning': 'acting on credible warnings',
  'communicated-uncertainty': 'saying clearly when something was not yet confirmed',
};

const COPY: Record<LearningSignal, Record<ReflectionLine['tone'], string>> = {
  'checked-source': {
    affirming:
      'You looked for where information came from before you used it. That habit is what separates a careful reader from a fast one.',
    encouraging:
      'You checked the origin of some posts. Making that the first move every time is the next step.',
    instructive:
      'Finding the original uploader or publisher is the quickest way to tell a real report from a repost of something else.',
  },
  'checked-date-location': {
    affirming:
      'You checked whether the date and place actually matched the claim. Real photos are often reused from other events.',
    encouraging:
      'You sometimes checked the date and location. A real image carrying a mismatched caption is one of the most common forms of disaster misinformation.',
    instructive:
      'A photo can be authentic and still be from another year or another province. Date and location are worth checking on their own.',
  },
  'sought-official-confirmation': {
    affirming:
      'You went to official sources such as PAGASA and OCD when it mattered. During a storm they update faster and more accurately than social replies.',
    encouraging:
      'You checked official sources at some points. Making them your default reference makes the rest of the checks much faster.',
    instructive:
      'PAGASA, your local DRRMO, and OCD publish the authoritative version. Comparing a post against them resolves most uncertainty quickly.',
  },
  'shared-with-context': {
    affirming:
      'When you passed information on, you brought its source and meaning with it. That is what makes a family group useful in an emergency.',
    encouraging:
      'You added context to some of what you shared. Context is what turns a forwarded message into something your family can act on.',
    instructive:
      'A message shared with its source, date, and what it means for your family travels much better than the message alone.',
  },
  'acted-on-credible-warning': {
    affirming:
      'You acted on credible warnings instead of waiting for perfect certainty. In a real typhoon that timing matters.',
    encouraging:
      'You acted on some credible warnings. Verified information needs to move quickly too — accuracy and speed both count.',
    instructive:
      'Verifying protects people, and so does acting in time. When an official warning is confirmed, moving early is the careful choice.',
  },
  'communicated-uncertainty': {
    affirming:
      'You said plainly when something was still unconfirmed. That keeps people informed without spreading either panic or false certainty.',
    encouraging:
      'You flagged uncertainty at some moments. Naming what is confirmed, what is false, and what is still unclear is a skill worth repeating.',
    instructive:
      '"Unverified" and "false" are different things, and saying which one you mean helps your family judge for themselves.',
  },
};

function emptyTally(): SignalTally {
  return Object.fromEntries(LEARNING_SIGNALS.map((s) => [s, 0])) as SignalTally;
}

/**
 * How many decision moments offer each signal at all. Counted per node, so a
 * node with three options that each check the source still counts once.
 */
export function countSignalOpportunities(caseData: Case): SignalTally {
  const tally = emptyTally();
  for (const node of caseData.nodes) {
    const available = new Set<LearningSignal>();
    for (const decision of node.decisions) {
      for (const signal of decision.signals) available.add(signal);
    }
    for (const signal of available) tally[signal] += 1;
  }
  return tally;
}

/** How many times the player actually demonstrated each signal. */
export function countSignalsDemonstrated(
  records: ReadonlyArray<{ signals: readonly LearningSignal[] }>,
): SignalTally {
  const tally = emptyTally();
  for (const record of records) {
    for (const signal of record.signals) tally[signal] += 1;
  }
  return tally;
}

function toneFor(demonstrated: number, opportunities: number): ReflectionLine['tone'] {
  if (opportunities === 0) return 'instructive';
  const ratio = demonstrated / opportunities;
  if (ratio >= AFFIRMING_AT) return 'affirming';
  if (ratio >= ENCOURAGING_AT) return 'encouraging';
  return 'instructive';
}

/**
 * Build the reflection. Pure: the same tallies always produce the same lines,
 * in the same order (the §12 order of the six checks).
 */
export function buildReflection(
  demonstrated: SignalTally,
  opportunities: SignalTally,
): ReflectionLine[] {
  return LEARNING_SIGNALS
    // A check the case never offers cannot be reflected on.
    .filter((signal) => opportunities[signal] > 0)
    .map((signal) => {
      const tone = toneFor(demonstrated[signal], opportunities[signal]);
      return {
        signal,
        demonstrated: demonstrated[signal],
        opportunities: opportunities[signal],
        tone,
        text: COPY[signal][tone],
      };
    });
}

/** Short plain-language label for a signal, for UI headings. */
export function signalLabel(signal: LearningSignal): string {
  return LABELS[signal];
}
