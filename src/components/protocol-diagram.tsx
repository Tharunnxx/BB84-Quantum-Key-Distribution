import { UserRound, ShieldAlert, ArrowRight, Radio } from 'lucide-react';
export function ProtocolDiagram({ eve, busy = false }: { eve: boolean; busy?: boolean }) {
  return <div className={`protocol-grid ${busy ? 'is-running' : ''}`}>
    <div className="protocol-flow">
      <div className="protocol-person"><div className="protocol-avatar"><UserRound size={25}/></div><strong className="text-sm">Alice</strong><p className="text-[10px] text-muted-foreground mt-1">Sender</p></div>
      <Channel label={eve ? 'Intercept' : 'Quantum channel'}/>
      {eve && <><div className="protocol-person"><div className="protocol-avatar eve"><ShieldAlert size={25}/></div><strong className="text-sm text-warning">Eve</strong><p className="text-[10px] text-muted-foreground mt-1">Eavesdropper</p></div><Channel label="Re-send"/></>}
      <div className="protocol-person"><div className="protocol-avatar bob"><UserRound size={25}/></div><strong className="text-sm">Bob</strong><p className="text-[10px] text-muted-foreground mt-1">Receiver</p></div>
    </div>
    <div className="protocol-steps"><Radio size={12} className="text-success"/>Prepare <ArrowRight size={11}/>Transmit{eve && <><ArrowRight size={11}/>Intercept & re-send</>}<ArrowRight size={11}/>Measure<ArrowRight size={11}/>Reconcile<ArrowRight size={11}/>Sift</div>
  </div>;
}
function Channel({ label }: { label: string }) { return <div className="quantum-channel"><p className="text-[10px] text-muted-foreground mb-2">{label}</p><div className="channel-wire"><span className="photon">0</span><span className="photon">+</span><span className="photon">1</span></div><p className="text-[9px] text-success mt-1">Single-qubit states</p></div>; }