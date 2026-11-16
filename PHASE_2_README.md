# Phase 2: SeQUeNCe fibre-length analysis

Phase 1 is a browser-only, ideal-channel BB84 teaching model with full intercept-resend attacks. Results are session-only and reset when the page reloads. No SeQUeNCe results, fibre-loss calculations, or key-rate numbers are fabricated.

## Connection points

- `src/lib/bb84.ts`: pure BB84 simulation and scientific metrics. Keep this ideal model separate from the physical channel model.
- `src/components/lab-context.tsx`: shared session experiment state. Add a separate typed fibre experiment state; do not replace the existing BB84 results.
- `src/routes/experiments.tsx`: the fourth experiment is explicitly unavailable. Connect it to a new fibre experiment page once the actual model is ready.
- `src/routes/results.tsx`: add real fibre length versus key rate charts and export controls alongside existing results.
- `src/lib/csv-export.ts`: add fibre-result row builders using the existing quoting and download functions.

## Future execution model

SeQUeNCe is Python software and cannot run directly in the current browser-only application. Provision an independently hosted Python service or use an offline Python runner producing versioned JSON/CSV results. Enable Lovable Cloud before adding app-side server integration. Use authenticated TanStack Start server functions for application requests, not Supabase Edge Functions. Never bundle Python or Node-only code into the Cloudflare Worker runtime.

## Suggested data contract

```ts
interface FibreExperiment {
  id: string;
  modelVersion: string;
  sequenceVersion: string;
  seed: number;
  repetitions: number;
  parameters: {
    attenuationDbPerKm: number;
    detectorEfficiency: number;
    darkCountRateHz: number;
    sourceRateHz: number;
    simulationDurationSeconds: number;
  };
  points: {
    fibreLengthKm: number;
    siftedKeyRateBitsPerSecond: number;
    secureKeyRateBitsPerSecond: number | null;
    qberPercent: number | null;
    standardError: number | null;
  }[];
}
```

## Pipeline

Fibre Length → SeQUeNCe Channel Model → Measurements → Sifting → Key Rate.

Specify attenuation, timing, detector parameters, run duration, seeds, and repetitions explicitly. Report uncertainty and units. Calculate a secure final key rate only after implementing and documenting error correction, parameter estimation, and privacy amplification. Phase 1 keys are raw sifted strings, not cryptographically secure final keys. Its QBER uses all sifted positions for educational inspection; a real implementation reveals only a sampled subset and discards revealed bits.

## Validation before release

Check zero-length behaviour, attenuation trends, reproducible seeded runs, unit conversions, edge cases with no detections, and statistical uncertainty. Keep the existing ideal-channel BB84 tests. Add Python tests for the real SeQUeNCe model and browser tests for loading results, charts, and exports.