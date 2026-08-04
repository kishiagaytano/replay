import type { Case } from '@/lib/schema/case.schema';
import { validateCase, formatValidationIssues } from '@/lib/schema/validate-case';
import { case001 } from '../../content/cases/the-flood-was-real/case';

/**
 * Case registry — a simple lookup that maps case IDs to their case data.
 * Add new cases here as they're authored.
 */
const registry: Record<string, () => Case> = {
  'the-flood-was-real': () => case001,
};

/**
 * Outside production, every case is validated the first time it is loaded, so
 * a broken decision graph surfaces at authoring time rather than as a
 * soft-locked simulation in the browser. Production skips the check: content
 * is static and already verified by `npm run validate:cases` in CI.
 */
const validated = new Set<string>();

function checkInDev(id: string, caseData: Case): void {
  if (process.env.NODE_ENV === 'production') return;
  if (validated.has(id)) return;
  validated.add(id);

  const result = validateCase(caseData);
  if (!result.ok) {
    console.error(`[rePlay] Case "${id}" failed validation:\n${formatValidationIssues(result.errors)}`);
  }
  if (result.warnings.length > 0) {
    console.warn(`[rePlay] Case "${id}" validation warnings:\n${formatValidationIssues(result.warnings)}`);
  }
}

/** Look up a case by its ID. Returns undefined if not found. */
export function getCase(id: string): Case | undefined {
  const loader = registry[id];
  if (!loader) return undefined;
  const caseData = loader();
  checkInDev(id, caseData);
  return caseData;
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

/** Every registered case, for validation scripts and tests. */
export function allCases(): Array<{ id: string; case: Case }> {
  return Object.entries(registry).map(([id, loader]) => ({ id, case: loader() }));
}
