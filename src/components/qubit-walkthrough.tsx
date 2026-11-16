import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLab } from './lab-context';
import { stateLabel } from '@/lib/bb84';
export function QubitWalkthrough() {
  const { current: r } = useLab(); const [position, setPosition] = useState(0);
  const index = Math.min(position, (r?.qubitCount ?? 1) - 1); const q = r?.qubits[index];
  return <section className="lab-panel"><div className="panel-head"><h2 className="font-semibold text-sm">Step-by-Step BB84</h2><div className="flex items-center gap-2"><Button variant="outline" size="icon" aria-label="Previous Qubit" title="Previous Qubit" disabled={!q || index === 0} onClick={() => setPosition(index - 1)}><ChevronLeft/></Button><span className="text-[10px] font-mono">{q ? `${index + 1} / ${r?.qubitCount}` : '—'}</span><Button variant="outline" size="icon" aria-label="Next Qubit" title="Next Qubit" disabled={!r || index >= r.qubitCount - 1} onClick={() => setPosition(index + 1)}><ChevronRight/></Button></div></div>{q ? <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[
    ['Alice chooses', `Bit: ${q.aliceBit} · Basis: ${q.aliceBasis}`, 'A random classical bit and encoding basis.'],
    ['Alice prepares', stateLabel(q.aliceBit, q.aliceBasis), 'The bit is encoded as a single quantum state.'],
    ...(q.eveBasis !== null && q.eveBit !== null ? [['Eve intercepts', `Basis: ${q.eveBasis} · Measurement: ${q.eveBit}`, `Eve resends ${stateLabel(q.eveBit, q.eveBasis)}. A wrong basis may disturb the state.`]] : []),
    ['Bob chooses', `Basis: ${q.bobBasis}`, 'Bob chooses independently, without knowing Alice’s basis.'],
    ['Bob measures', String(q.bobBit), 'Matching prepared and measurement bases give a definite bit.'],
    ['Bases reconcile', q.match ? 'YES · matching bases' : 'NO · different bases', 'Only the bases are compared over a public classical channel.'],
    ['Sift the bit', q.match ? q.error ? 'Kept · Alice ≠ Bob' : 'Kept · Alice = Bob' : 'Discarded', q.match ? 'This position contributes to the sifted keys.' : 'This position is excluded from both sifted keys.'],
  ].map((s, i) => <div key={s[0]} className={`walk-step ${s[0] === 'Sift the bit' && q.match ? 'kept' : ''}`}><p className="section-label mb-2">STEP {i + 1} · {s[0]}</p><p className="text-lg font-mono mb-2">{s[1]}</p><p className="text-[11px] text-muted-foreground leading-relaxed">{s[2]}</p></div>)}</div> : <div className="p-8 text-center text-xs text-muted-foreground"><Check size={22} className="mx-auto mb-3"/>Select a qubit after running a simulation.</div>}</section>;
}