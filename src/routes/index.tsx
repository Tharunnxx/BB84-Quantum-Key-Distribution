import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight, Download, Radio, BookOpen, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLab } from '@/components/lab-context';
import { SimulationControls } from '@/components/simulation-controls';
import { ProtocolDiagram } from '@/components/protocol-diagram';
import { Metrics, ChannelStatus, KeyPanel } from '@/components/results-panel';
import { QberChart } from '@/components/lab-charts';
import { QuantumStates } from '@/components/quantum-states';
import { QubitTable } from '@/components/qubit-table';
import { downloadCsv, simulationRows } from '@/lib/csv-export';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/')({ head: () => pageHead('Overview', 'Explore BB84 quantum key distribution, intercept-resend attacks, and real simulation measurements in an interactive university laboratory.'), component: Index });
function Index() {
  const lab = useLab();
  return <div className="space-y-6">
    <div className="flex justify-between items-start gap-4 flex-wrap"><div><div className="section-label text-success mb-3">QUANTUM COMPUTING RESEARCH</div><h1 className="text-3xl font-semibold">BB84 Quantum Key Distribution</h1><p className="text-muted-foreground text-sm mt-2">Explore key generation. Observe interception. Understand quantum security.</p></div><Button variant="outline" className="mt-5" disabled={!lab.current} onClick={() => { if (lab.current) downloadCsv('bb84-experiment', simulationRows(lab.current)); }}><Download/>Export results</Button></div>
    <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap"><span className="bg-success-soft text-success border border-primary/20 px-2 py-1 rounded">PHASE 1 + 2</span><span>BB84 + fibre-length analysis</span><span className="mx-1">·</span><span>Browser simulation + SeQUeNCe runner</span></div>
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-5"><section className="lab-panel overflow-hidden"><div className="panel-head"><h2 className="font-semibold text-sm flex items-center gap-2"><Radio size={16}/>Quantum communication channel</h2><span className={`text-[10px] px-2 py-1 rounded ${lab.eve ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success'}`}>{lab.eve ? 'Eve enabled' : 'No eavesdropper'}</span></div><ProtocolDiagram eve={lab.eve} busy={lab.busy}/><ChannelStatus/></section><SimulationControls/></div>
    <div className="flex justify-between items-center"><h2 className="text-sm font-semibold">Simulation results</h2><span className="text-[10px] text-muted-foreground">{lab.current ? `${lab.current.eve ? 'Eve enabled' : 'No Eve'} · ${lab.current.qubitCount} qubits · latest run` : 'Run an experiment to generate real results'}</span></div>
    <Metrics/>
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.85fr)] gap-5"><QberChart/><KeyPanel/><QuantumStates/></div>
    <section className="flex gap-4 items-center border-y border-border py-5"><BookOpen size={22} className="text-success shrink-0"/><div className="flex-1"><h2 className="text-xs font-semibold">Why does interception leave a trace?</h2><p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Eve doesn’t know Alice’s basis. Measuring in the wrong basis can disturb a qubit, creating detectable errors in the sifted key.</p></div><Button variant="ghost" asChild size="sm"><Link to="/about">About BB84<ArrowUpRight/></Link></Button></section>
    <QubitTable/>
    <div className="flex justify-between gap-4 items-center flex-wrap"><span className="text-[11px] text-muted-foreground flex items-center gap-2"><ShieldCheck size={14}/>BB84 attack model + fibre throughput analysis · secure final key rate not claimed</span><div className="flex gap-2"><Button asChild variant="outline" size="sm"><Link to="/simulator">Open simulator<ArrowUpRight/></Link></Button><Button asChild variant="outline" size="sm"><Link to="/fibre">Fibre analysis<ArrowUpRight/></Link></Button></div></div>
  </div>;
}
