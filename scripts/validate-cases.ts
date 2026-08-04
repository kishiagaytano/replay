/**
 * Validate every registered case.
 *
 * Run with `npm run validate:cases`. Exits non-zero on any error so it can gate
 * CI; warnings are printed but do not fail the run.
 */
import { allCases } from '../src/lib/registry';
import { validateCase, formatValidationIssues } from '../src/lib/schema/validate-case';

let errorCount = 0;
let warningCount = 0;

for (const { id, case: caseData } of allCases()) {
  const result = validateCase(caseData);
  errorCount += result.errors.length;
  warningCount += result.warnings.length;

  const nodeCount = result.case?.nodes.length ?? 0;
  const decisionCount = result.case?.nodes.reduce((n, node) => n + node.decisions.length, 0) ?? 0;

  if (result.ok && result.warnings.length === 0) {
    console.log(`✓ ${id} — ${nodeCount} nodes, ${decisionCount} decisions, ${result.case?.evidence.length ?? 0} evidence items`);
    continue;
  }

  console.log(`${result.ok ? '!' : '✗'} ${id}`);
  console.log(formatValidationIssues(result.issues));
}

console.log(
  `\n${errorCount} error${errorCount === 1 ? '' : 's'}, ${warningCount} warning${warningCount === 1 ? '' : 's'}.`,
);

process.exit(errorCount > 0 ? 1 : 0);
