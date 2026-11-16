import { Play, Shield, SlidersHorizontal, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLab } from './lab-context';
import { QUBIT_OPTIONS } from '@/lib/bb84';
export function SimulationControls() {
  const lab = useLab();
  return <section className="lab-panel"><div className="panel-head"><h2 className="font-semibold text-sm flex items-center gap-2"><SlidersHorizontal size={16}/>Simulation setup</h2><span className="text-[10px] text-muted-foreground">IDEAL CHANNEL</span></div>
    <div className="p-5 space-y-5"><div><label htmlFor="qubits" className="block text-xs font-medium mb-2">Number of qubits</label><select id="qubits" className="lab-select" value={lab.count} onChange={e => lab.setCount(Number(e.target.value))} disabled={lab.busy}>{QUBIT_OPTIONS.map(n => <option key={n} value={n}>{n} qubits</option>)}</select><p className="text-[10px] text-muted-foreground mt-2">Random bits and bases for every qubit.</p></div>
    <div className="border-t border-border pt-4 flex items-center justify-between"><div><label htmlFor="eve-toggle" className="flex items-center gap-2 text-xs font-medium"><Shield size={14}/>Eve attack</label><p className="mt-1.5 text-[10px] text-muted-foreground">Intercept-resend eavesdropping</p></div><Switch id="eve-toggle" checked={lab.eve} onCheckedChange={lab.setEve} disabled={lab.busy}/></div>
    <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Channel configuration</span><span className={lab.eve ? 'text-warning' : 'text-success'}>{lab.eve ? 'Alice → Eve → Bob' : 'Alice → Bob'}</span></div>
    <Button className="w-full h-10" disabled={lab.busy} onClick={() => lab.run()}>{lab.busy ? <LoaderCircle className="animate-spin"/> : <Play size={14}/>} {lab.busy ? 'Simulating…' : 'Run Simulation'}</Button>
    </div></section>;
}