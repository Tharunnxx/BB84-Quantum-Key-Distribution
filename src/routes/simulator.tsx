import { createFileRoute } from '@tanstack/react-router';
import { useLab } from '@/components/lab-context';
import { SimulationControls } from '@/components/simulation-controls';
import { ProtocolDiagram } from '@/components/protocol-diagram';
import { Metrics, ChannelStatus, KeyPanel } from '@/components/results-panel';
import { QubitTable } from '@/components/qubit-table';
import { QubitWalkthrough } from '@/components/qubit-walkthrough';
import { QuantumStates } from '@/components/quantum-states';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/simulator')({ head: () => pageHead('BB84 Simulator', 'Run ideal-channel BB84 with or without an intercept-resend Eve, inspect each qubit, and trace basis reconciliation and sifted keys.'), component: Simulator });
function Simulator() {
  const lab = useLab();
  return <div className="space-y-6"><div><p className="section-label text-success mb-3">INTERACTIVE LABORATORY</p><h1 className="text-3xl font-semibold">BB84 Simulator</h1><p className="text-sm text-muted-foreground mt-2">From a single quantum state to a sifted key.</p></div>
    <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5"><SimulationControls/><section className="lab-panel overflow-hidden"><div className="panel-head"><h2 className="font-semibold">Protocol in motion</h2><span className="text-xs text-muted-foreground">{lab.eve ? 'Intercept-resend' : 'Ideal channel'}</span></div><ProtocolDiagram eve={lab.eve} busy={lab.busy}/><ChannelStatus/></section></div>
    <Metrics/><QubitWalkthrough/><QubitTable/><div className="grid md:grid-cols-2 gap-5"><KeyPanel/><QuantumStates/></div>
  </div>;
}