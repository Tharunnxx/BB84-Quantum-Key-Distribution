export type Bit = 0 | 1;
export type Basis = 'Z' | 'X';
export type RandomSource = () => number;
export const QUBIT_OPTIONS = [10, 50, 100, 500, 1000] as const;
export const DEFAULT_QUBITS = 100;
export const DEFAULT_THRESHOLD = 11;
export interface Qubit {
  position: number;
  aliceBit: Bit;
  aliceBasis: Basis;
  eveBasis: Basis | null;
  eveBit: Bit | null;
  bobBasis: Basis;
  bobBit: Bit;
  match: boolean;
  error: boolean;
}
export interface Simulation {
  id: string;
  qubitCount: number;
  eve: boolean;
  qubits: Qubit[];
  matchingBases: number;
  siftedLength: number;
  errors: number;
  qber: number | null;
  aliceKey: string;
  bobKey: string;
  createdAt: string;
}
export interface Trial {
  trial: number;
  noEve: number | null;
  eve: number | null;
  noEveLength: number;
  eveLength: number;
}
export function randomBit(random: RandomSource = Math.random): Bit {
  return random() < 0.5 ? 0 : 1;
}
export function randomBasis(random: RandomSource = Math.random): Basis {
  return randomBit(random) === 0 ? 'Z' : 'X';
}
export function stateLabel(bit: Bit, basis: Basis) {
  return basis === 'Z' ? (bit === 0 ? '|0⟩' : '|1⟩') : (bit === 0 ? '|+⟩' : '|−⟩');
}
export function measure(bit: Bit, preparedBasis: Basis, measurementBasis: Basis, random: RandomSource = Math.random): Bit {
  return preparedBasis === measurementBasis ? bit : randomBit(random);
}
export function calculateQber(errors: number, length: number): number | null {
  return length === 0 ? null : errors / length * 100;
}
export function channelStatus(qber: number | null, threshold: number) {
  return qber === null ? 'insufficient' : qber >= threshold ? 'warning' : 'low';
}
export function simulateBB84(qubitCount: number, eve: boolean, random: RandomSource = Math.random): Simulation {
  if (!Number.isInteger(qubitCount) || qubitCount < 1 || qubitCount > 100000) throw new Error('Choose a positive qubit count up to 100,000.');
  const qubits: Qubit[] = [];
  for (let i = 0; i < qubitCount; i++) {
    const aliceBit = randomBit(random);
    const aliceBasis = randomBasis(random);
    const bobBasis = randomBasis(random);
    const eveBasis = eve ? randomBasis(random) : null;
    const eveBit = eveBasis === null ? null : measure(aliceBit, aliceBasis, eveBasis, random);
    const bobBit = eveBasis !== null && eveBit !== null
      ? measure(eveBit, eveBasis, bobBasis, random)
      : measure(aliceBit, aliceBasis, bobBasis, random);
    const match = aliceBasis === bobBasis;
    qubits.push({ position: i + 1, aliceBit, aliceBasis, eveBasis, eveBit, bobBasis, bobBit, match, error: match && aliceBit !== bobBit });
  }
  const sifted = qubits.filter(q => q.match);
  const errors = sifted.filter(q => q.error).length;
  return {
    id: crypto.randomUUID(), qubitCount, eve, qubits,
    matchingBases: sifted.length, siftedLength: sifted.length, errors,
    qber: calculateQber(errors, sifted.length),
    aliceKey: sifted.map(q => q.aliceBit).join(''),
    bobKey: sifted.map(q => q.bobBit).join(''), createdAt: new Date().toISOString(),
  };
}
export function runTrials(qubitCount: number, count = 20, random: RandomSource = Math.random): Trial[] {
  return Array.from({ length: count }, (_, i) => {
    const noEve = simulateBB84(qubitCount, false, random);
    const eve = simulateBB84(qubitCount, true, random);
    return { trial: i + 1, noEve: noEve.qber, eve: eve.qber, noEveLength: noEve.siftedLength, eveLength: eve.siftedLength };
  });
}
export function average(values: (number | null)[]) {
  const valid = values.filter((v): v is number => v !== null);
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
}
export const formatQber = (value: number | null | undefined) => value == null ? '—' : `${value.toFixed(2)}%`;