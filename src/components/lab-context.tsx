import { createContext, useContext, useState, type ReactNode } from 'react';
import { DEFAULT_QUBITS, DEFAULT_THRESHOLD, simulateBB84, runTrials, type Simulation, type Trial } from '@/lib/bb84';
import type { FibreExperiment } from '@/lib/fibre';
interface LabState {
  count: number; setCount: (n: number) => void;
  eve: boolean; setEve: (v: boolean) => void;
  threshold: number; setThreshold: (n: number) => void;
  current: Simulation | null; noEve: Simulation | null; withEve: Simulation | null;
  trials: Trial[]; trialCount: number | null; busy: boolean;
  fibreExperiment: FibreExperiment | null; setFibreExperiment: (experiment: FibreExperiment | null) => void;
  run: (attack?: boolean) => Promise<void>;
  compare: () => Promise<void>; runTwenty: () => Promise<void>;
}
const LabContext = createContext<LabState | null>(null);
const pause = () => new Promise<void>(resolve => setTimeout(resolve, 700));
export function LabProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState<number>(DEFAULT_QUBITS);
  const [eve, setEve] = useState(false);
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [current, setCurrent] = useState<Simulation | null>(null);
  const [noEve, setNoEve] = useState<Simulation | null>(null);
  const [withEve, setWithEve] = useState<Simulation | null>(null);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [trialCount, setTrialCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [fibreExperiment, setFibreExperiment] = useState<FibreExperiment | null>(null);
  async function run(attack = eve) {
    if (busy) return;
    setBusy(true); setEve(attack);
    try { await pause(); const result = simulateBB84(count, attack); setCurrent(result); if (attack) setWithEve(result); else setNoEve(result); }
    finally { setBusy(false); }
  }
  async function compare() {
    if (busy) return; setBusy(true);
    try { await pause(); const a = simulateBB84(count, false); const b = simulateBB84(count, true); setNoEve(a); setWithEve(b); setCurrent(eve ? b : a); }
    finally { setBusy(false); }
  }
  async function runTwenty() {
    if (busy) return; setBusy(true);
    try { await pause(); setTrials(runTrials(count)); setTrialCount(count); }
    finally { setBusy(false); }
  }
  return <LabContext.Provider value={{ count, setCount, eve, setEve, threshold, setThreshold, current, noEve, withEve, trials, trialCount, busy, run, compare, runTwenty, fibreExperiment, setFibreExperiment }}>{children}</LabContext.Provider>;
}
export function useLab() { const context = useContext(LabContext); if (!context) throw new Error('LabProvider is required'); return context; }