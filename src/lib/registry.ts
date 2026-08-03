import type { Case } from '@/lib/schema/case.schema';
import { case001 } from '../../content/cases/the-flood-was-real/case';

/**
 * Case registry — a simple lookup that maps case IDs to their case data.
 * Add new cases here as they're authored.
 */
const registry: Record<string, () => Case> = {
  'the-flood-was-real': () => case001,
};

/** Look up a case by its ID. Returns undefined if not found. */
export function getCase(id: string): Case | undefined {
  const loader = registry[id];
  if (!loader) return undefined;
  return loader();
}

/** List all available case IDs. */
export function listCaseIds(): string[] {
  return Object.keys(registry);
}

/** List all available cases with metadata. */
export function listCases(): Array<{
  id: string;
  code: string;
  title: string;
  hook?: string;
  track: string[];
  competency: string;
}> {
  return Object.entries(registry).map(([id, loader]) => {
    const c = loader();
    return {
      id,
      code: c.code,
      title: c.title,
      hook: c.hook,
      track: c.track,
      competency: c.competency,
    };
  });
}
