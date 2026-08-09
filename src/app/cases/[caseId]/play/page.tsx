import { notFound } from 'next/navigation';
import { getCase } from '@/lib/registry';
import { SimulationProvider } from '@/lib/engine/simulation-context';
import { SimulationView } from '@/components/vn/simulation-view';

/**
 * Dynamic simulation route — loads any case by ID from the registry.
 * Route: /cases/[caseId]
 */
export default async function CasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseData = getCase(caseId);

  if (!caseData) {
    notFound();
  }

  return (
    <SimulationProvider>
      <SimulationView caseData={caseData} />
    </SimulationProvider>
  );
}
