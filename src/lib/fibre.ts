export interface FibreParameters {
  attenuationDbPerKm: number;
  detectorEfficiency: number;
  darkCountRateHz: number;
  sourceRateHz: number;
  meanPhotonNumber: number;
  simulationDurationSeconds: number;
}

export interface FibrePoint {
  fibreLengthKm: number;
  siftedKeyRateBitsPerSecond: number;
  secureKeyRateBitsPerSecond: number | null;
  qberPercent: number | null;
  standardError: number | null;
  latencyNs?: number | null;
}

export interface FibreExperiment {
  id: string;
  modelVersion: string;
  sequenceVersion: string;
  seed: number;
  repetitions: number;
  source: 'analytical-preview' | 'sequence-csv';
  parameters: FibreParameters;
  points: FibrePoint[];
}

export const DEFAULT_FIBRE_PARAMETERS: FibreParameters = {
  attenuationDbPerKm: 0.2,
  detectorEfficiency: 0.8,
  darkCountRateHz: 10,
  sourceRateHz: 80_000_000,
  meanPhotonNumber: 0.1,
  simulationDurationSeconds: 6,
};

export const DEFAULT_FIBRE_LENGTHS_KM = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Browser-side reference curve. This is deliberately labelled as an analytical
 * preview; it is not a replacement for the SeQUeNCe discrete-event run.
 */
export function buildAnalyticalPreview(
  parameters: FibreParameters = DEFAULT_FIBRE_PARAMETERS,
  lengthsKm = DEFAULT_FIBRE_LENGTHS_KM,
): FibreExperiment {
  const points = lengthsKm.map((fibreLengthKm) => {
    const channelTransmission = 10 ** (-(parameters.attenuationDbPerKm * fibreLengthKm) / 10);
    const detectionProbability = 1 - Math.exp(
      -parameters.meanPhotonNumber * channelTransmission * parameters.detectorEfficiency,
    );
    const rawDetectionRate = parameters.sourceRateHz * detectionProbability;
    const siftedRate = rawDetectionRate * 0.5;
    return {
      fibreLengthKm,
      siftedKeyRateBitsPerSecond: siftedRate,
      secureKeyRateBitsPerSecond: null,
      qberPercent: null,
      standardError: null,
      latencyNs: (fibreLengthKm * 1000) / 200_000_000 * 1e9,
    };
  });

  return {
    id: `preview-${Date.now()}`,
    modelVersion: 'analytical-reference-v1',
    sequenceVersion: 'not-run',
    seed: 0,
    repetitions: 1,
    source: 'analytical-preview',
    parameters,
    points,
  };
}

export function parseSequenceCsv(text: string, parameters: FibreParameters = DEFAULT_FIBRE_PARAMETERS): FibreExperiment {
  const rows = text
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')));

  if (rows.length < 2) throw new Error('The SeQUeNCe CSV is empty or has no data rows.');

  const header = rows[0].map((value) => value.toLowerCase());
  const findColumn = (...names: string[]) => {
    const index = names.map((name) => header.indexOf(name)).find((index) => index >= 0);
    return index ?? -1;
  };

  // Accept both the canonical SeQUeNCe runner output used by this project
  // (Distance_m / Throughput_bits_per_second / Error_rate / Latency_ns) and
  // simpler Distance / Throughput / Error_rate / Latency exports.
  const distanceMetersIndex = findColumn('distance_m', 'distance');
  const distanceKmIndex = findColumn('distance_km');
  const throughputIndex = findColumn('throughput_bits_per_second', 'throughput');
  const errorIndex = findColumn('error_rate');
  const latencyIndex = findColumn('latency_ns', 'latency');

  if ((distanceMetersIndex < 0 && distanceKmIndex < 0) || throughputIndex < 0) {
    throw new Error(
      'Expected SeQUeNCe columns: Distance_m (or Distance_km/Distance) and Throughput_bits_per_second (or Throughput).',
    );
  }

  const points = rows.slice(1).flatMap((row) => {
    const distanceMeters =
      distanceMetersIndex >= 0
        ? Number(row[distanceMetersIndex])
        : Number(row[distanceKmIndex]) * 1000;
    const throughput = Number(row[throughputIndex]);
    if (!Number.isFinite(distanceMeters) || !Number.isFinite(throughput)) return [];

    const rawError = errorIndex >= 0 ? Number(row[errorIndex]) : NaN;
    const rawLatency = latencyIndex >= 0 ? Number(row[latencyIndex]) : NaN;

    return [{
      fibreLengthKm: distanceMeters / 1000,
      siftedKeyRateBitsPerSecond: throughput,
      secureKeyRateBitsPerSecond: null,
      qberPercent: Number.isFinite(rawError) ? rawError * 100 : null,
      standardError: null,
      latencyNs: Number.isFinite(rawLatency) ? rawLatency : null,
    }];
  });

  if (!points.length) throw new Error('No valid distance/throughput rows were found.');
  points.sort((a, b) => a.fibreLengthKm - b.fibreLengthKm);

  return {
    id: `sequence-${Date.now()}`,
    modelVersion: 'sequence-distance-bb84-adapter-v2',
    sequenceVersion: 'see generated metadata',
    seed: 0,
    repetitions: 1,
    source: 'sequence-csv',
    parameters,
    points,
  };
}

export function formatRate(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} Mbit/s`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)} kbit/s`;
  return `${value.toFixed(1)} bit/s`;
}

export function formatLatency(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} ms`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)} µs`;
  return `${value.toFixed(0)} ns`;
}

export function safeParameter(value: number, fallback: number, min: number, max: number) {
  return clamp(Number.isFinite(value) ? value : fallback, min, max);
}
