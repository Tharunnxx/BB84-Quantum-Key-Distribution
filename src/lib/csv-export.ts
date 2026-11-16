import type { Simulation, Trial } from './bb84';
import type { FibreExperiment } from './fibre';
export function toCsv(rows: (string | number | null)[][]) {
  return rows.map(row => row.map(cell => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
}
export function downloadCsv(name: string, rows: (string | number | null)[][]) {
  const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url; link.download = `${name}.csv`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function simulationRows(result: Simulation): (string | number | null)[][] {
  return [
    ['Experiment', result.eve ? 'Intercept-resend Eve' : 'No Eve'],
    ['Qubits', result.qubitCount], ['Matching bases', result.matchingBases],
    ['Sifted key length', result.siftedLength], ['Errors', result.errors], ['QBER (%)', result.qber],
    ['Alice sifted key (not post-processed)', result.aliceKey], ['Bob sifted key (not post-processed)', result.bobKey],
    ['Created at', result.createdAt], [],
    ['Position', 'Alice bit', 'Alice basis', 'Eve basis', 'Eve bit', 'Bob basis', 'Bob bit', 'Match', 'Error'],
    ...result.qubits.map(q => [q.position, q.aliceBit, q.aliceBasis, q.eveBasis, q.eveBit, q.bobBasis, q.bobBit, q.match ? 'Yes' : 'No', q.error ? 'Yes' : 'No']),
  ];
}
export function comparisonRows(noEve: Simulation, eve: Simulation): (string | number | null)[][] {
  return [['Metric', 'No Eve', 'Eve'], ['Qubits', noEve.qubitCount, eve.qubitCount], ['Matching bases', noEve.matchingBases, eve.matchingBases], ['Sifted key length', noEve.siftedLength, eve.siftedLength], ['Errors', noEve.errors, eve.errors], ['QBER (%)', noEve.qber, eve.qber], ['Post-processed final key length', null, null]];
}
export function trialRows(trials: Trial[]): (string | number | null)[][] {
  return [['Trial', 'No Eve QBER (%)', 'Eve QBER (%)', 'No Eve sifted length', 'Eve sifted length'], ...trials.map(t => [t.trial, t.noEve, t.eve, t.noEveLength, t.eveLength])];
}
export function fibreRows(result: FibreExperiment): (string | number | null)[][] {
  return [
    ['Source', result.source],
    ['Model version', result.modelVersion],
    ['SeQUeNCe version', result.sequenceVersion],
    ['Seed', result.seed],
    ['Repetitions', result.repetitions],
    ['Attenuation (dB/km)', result.parameters.attenuationDbPerKm],
    ['Detector efficiency', result.parameters.detectorEfficiency],
    ['Dark count rate (Hz)', result.parameters.darkCountRateHz],
    ['Source rate (Hz)', result.parameters.sourceRateHz],
    ['Mean photon number', result.parameters.meanPhotonNumber],
    ['Simulation duration (s)', result.parameters.simulationDurationSeconds],
    [],
    ['Fibre length (km)', 'Sifted key rate (bits/s)', 'Secure key rate (bits/s)', 'QBER (%)', 'Standard error', 'Latency (ns)'],
    ...result.points.map((point) => [
      point.fibreLengthKm,
      point.siftedKeyRateBitsPerSecond,
      point.secureKeyRateBitsPerSecond,
      point.qberPercent,
      point.standardError,
      point.latencyNs ?? null,
    ]),
  ];
}
