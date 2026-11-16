import { describe, it, expect } from 'vitest';
import { simulateBB84, runTrials, measure, calculateQber, channelStatus, DEFAULT_QUBITS, DEFAULT_THRESHOLD, QUBIT_OPTIONS, stateLabel } from '../lib/bb84';
import { toCsv, simulationRows, comparisonRows, trialRows } from '../lib/csv-export';
function seeded(seed: number) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
describe('BB84 scientific model', () => {
  it('defaults to 100 qubits with the requested options', () => { expect(DEFAULT_QUBITS).toBe(100); expect(QUBIT_OPTIONS).toEqual([10, 50, 100, 500, 1000]); });
  it.each([10, 100, 1000])('simulates %i qubits without ideal-channel errors', n => {
    const r = simulateBB84(n, false, seeded(42));
    expect(r.qubits).toHaveLength(n); expect(r.errors).toBe(0); expect(r.qber).toBe(0); expect(r.aliceKey).toBe(r.bobKey);
    expect(r.siftedLength).toBe(r.qubits.filter(q => q.aliceBasis === q.bobBasis).length);
  });
  it('matching measurement reproduces the bit; incompatible measurement is random', () => {
    expect(measure(1, 'X', 'X', () => 0)).toBe(1);
    expect(measure(1, 'X', 'Z', () => 0)).toBe(0);
    expect(measure(0, 'Z', 'X', () => 0.9)).toBe(1);
  });
  it('intercept-resend produces approximately 25% sifted errors without a fixed QBER', () => {
    const r = simulateBB84(100000, true, seeded(2026));
    expect(r.qber).toBeGreaterThan(24); expect(r.qber).toBeLessThan(26);
    expect(r.qubits.every(q => q.eveBasis !== null && q.eveBit !== null)).toBe(true);
    expect(r.errors).toBe(r.qubits.filter(q => q.match && q.aliceBit !== q.bobBit).length);
  });
  it('uses errors divided by sifted length and handles an empty key', () => { expect(calculateQber(13, 51)).toBeCloseTo(25.490196); expect(calculateQber(0, 0)).toBeNull(); });
  it('uses the configurable 11% warning threshold without asserting security', () => { expect(DEFAULT_THRESHOLD).toBe(11); expect(channelStatus(10.99, 11)).toBe('low'); expect(channelStatus(11, 11)).toBe('warning'); expect(channelStatus(12, 15)).toBe('low'); expect(channelStatus(null, 11)).toBe('insufficient'); });
  it('runs exactly 20 paired trials with actual measurements', () => {
    const trials = runTrials(1000, 20, seeded(99));
    expect(trials).toHaveLength(20); expect(trials.every(t => t.noEve === 0)).toBe(true);
    expect(trials.reduce((s, t) => s + (t.eve ?? 0), 0) / 20).toBeGreaterThan(20);
    expect(new Set(trials.map(t => t.eve)).size).toBeGreaterThan(1);
  });
  it('encodes all four quantum states', () => { expect(stateLabel(0, 'Z')).toBe('|0⟩'); expect(stateLabel(1, 'Z')).toBe('|1⟩'); expect(stateLabel(0, 'X')).toBe('|+⟩'); expect(stateLabel(1, 'X')).toBe('|−⟩'); });
  it('exports the actual simulation, comparison and trial numbers', () => {
    const a = simulateBB84(10, false, seeded(5)); const b = simulateBB84(10, true, seeded(6));
    expect(simulationRows(a)).toContainEqual(['QBER (%)', a.qber]);
    expect(comparisonRows(a, b)).toContainEqual(['Errors', a.errors, b.errors]);
    const t = runTrials(10, 20, seeded(7)); expect(trialRows(t)).toHaveLength(21);
    expect(toCsv([['a"b', 13, null]])).toBe('"a""b","13",""');
  });
});