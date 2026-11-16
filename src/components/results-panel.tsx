import { Binary, CheckCheck, KeyRound, ShieldCheck, ShieldAlert, AlertCircle, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useLab } from './lab-context';
import { channelStatus, formatQber } from '@/lib/bb84';
import { downloadCsv, simulationRows } from '@/lib/csv-export';
export function Metrics() {
  const { current: r } = useLab();
  const metrics = [
    { title: 'Qubits transmitted', value: r?.qubitCount, note: 'Randomly prepared by Alice', icon: Binary },
    { title: 'Matching bases', value: r?.matchingBases, note: 'Alice and Bob chose the same basis', icon: CheckCheck },
    { title: 'Sifted key length', value: r?.siftedLength, note: 'Bits retained after reconciliation', icon: KeyRound },
    { title: 'Quantum bit error rate', value: r ? formatQber(r.qber) : undefined, note: r ? `${r.errors} error${r.errors === 1 ? '' : 's'} in ${r.siftedLength} sifted bits` : 'Awaiting your first simulation', icon: ShieldCheck },
  ];
  return <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{metrics.map((m, i) => <section className="lab-panel p-5" key={m.title}><div className="flex items-center justify-between gap-2 mb-4"><span className="text-[11px] text-muted-foreground">{m.title}</span><m.icon size={16} className={i === 3 ? 'text-success' : 'text-muted-foreground'}/></div><div className={`metric-value ${i === 3 ? 'text-success' : ''}`} data-testid={i === 3 ? 'qber' : undefined}>{m.value ?? '—'}{i === 2 && m.value !== undefined && <span className="text-xs font-sans text-muted-foreground ml-2">bits</span>}</div><p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">{m.note}</p></section>)}</div>;
}
export function ChannelStatus() {
  const { current, threshold } = useLab();
  const status = current ? channelStatus(current.qber, threshold) : 'insufficient';
  const Icon = status === 'warning' ? ShieldAlert : status === 'low' ? ShieldCheck : AlertCircle;
  return <div className={`p-4 border-t border-border flex gap-3 ${status === 'warning' ? 'bg-warning-soft' : status === 'low' ? 'bg-success-soft' : 'bg-muted'}`}><Icon size={20} className={status === 'warning' ? 'text-warning' : 'text-success'}/><div><div className="font-medium text-xs">{status === 'warning' ? 'Possible eavesdropping' : status === 'low' ? 'Low error · channel appears secure' : current ? 'Insufficient sifted bits' : 'Channel status · awaiting simulation'}</div><p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">{status === 'warning' ? 'High QBER indicates possible eavesdropping or channel noise.' : status === 'low' ? 'Low QBER is not proof of security. Error correction and privacy amplification are still required.' : 'Run a simulation to assess the observed error rate.'} Warning threshold: {threshold}%.</p></div></div>;
}
export function KeyPanel() {
  const { current: r } = useLab();
  return <section className="lab-panel"><div className="panel-head"><h2 className="font-semibold text-sm flex items-center gap-2"><KeyRound size={15}/>Generated key</h2><span className="text-[10px] text-muted-foreground">{r ? `${r.siftedLength} BITS` : 'NO RUN YET'}</span></div><div className="p-5"><p className="section-label mb-3">Alice’s sifted key</p><div className="code-key text-sm bg-muted rounded p-3 min-h-12">{r ? r.aliceKey ? `${r.aliceKey.slice(0, 48)}${r.aliceKey.length > 48 ? '…' : ''}` : 'No matching bases in this run.' : '—'}</div><p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">Raw sifted key, not a final secure key. This phase does not perform error correction or privacy amplification.</p><div className="flex gap-2 mt-4 flex-wrap"><Dialog><DialogTrigger asChild><Button size="sm" variant="outline" disabled={!r}><Eye/>View complete keys</Button></DialogTrigger><DialogContent className="max-h-[80vh] overflow-y-auto"><DialogTitle>Sifted keys</DialogTitle><DialogDescription>Raw Alice and Bob keys before error correction and privacy amplification.</DialogDescription><h3 className="font-medium">Alice · {r?.siftedLength} bits</h3><p className="code-key text-xs bg-muted p-3 rounded">{r?.aliceKey || 'Empty key'}</p><h3 className="font-medium">Bob · {r?.siftedLength} bits</h3><p className="code-key text-xs bg-muted p-3 rounded">{r?.bobKey || 'Empty key'}</p><p className="text-xs text-muted-foreground">Differing sifted bits: {r?.errors}</p></DialogContent></Dialog><Button variant="ghost" size="sm" disabled={!r} onClick={() => { if (r) downloadCsv('bb84-experiment', simulationRows(r)); }}><Download/>Export CSV</Button></div></div></section>;
}