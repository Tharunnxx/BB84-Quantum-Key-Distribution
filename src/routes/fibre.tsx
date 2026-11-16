import { createFileRoute } from '@tanstack/react-router';
import { FibreAnalysis } from '@/components/fibre-analysis';
import { pageHead } from '@/lib/page-head';

export const Route = createFileRoute('/fibre')({
  head: () => pageHead('Fibre Analysis', 'Analyse BB84 throughput versus fibre length with the included SeQUeNCe distance experiment.'),
  component: FibreAnalysis,
});
