# Project completion checklist

## Selected project

**BB84 key distribution with an eavesdropper**

### Requirement coverage
1. Simulate BB84 without an attacker.
2. Simulate BB84 with an intercept-resend attacker.
3. Measure QBER and compare the two cases.
4. Run repeated trials to show statistical variation around the expected ~25% intercept-resend QBER.
5. Model throughput versus fibre length with SeQUeNCe.
6. Export experiment data for the report.

## What is included

- `src/lib/bb84.ts` — deterministic, testable browser BB84 engine.
- `src/components/` — simulator, protocol diagram, qubit inspection, charts and results UI.
- `src/routes/fibre.tsx` + `src/components/fibre-analysis.tsx` — fibre analysis dashboard.
- `sequence_experiment/sequence_distance_bb84.py` — real SeQUeNCe distance sweep.
- `sequence_experiment/run_quick.bat` — one-command short real SeQUeNCe validation run.
- `sequence_experiment/run_full.bat` — full 12-distance sweep.
- `sequence_experiment/results/` — output location for generated CSV/metadata.
- `docs/` — project/report/demo notes.

## Important fixes in the final package

- The browser CSV importer now accepts the exact column names produced by the Python runner: `Distance_km`, `Distance_m`, `Throughput_bits_per_second`, `Error_rate`, and `Latency_ns`.
- SeQUeNCe latency is converted from seconds to nanoseconds before writing `Latency_ns`, matching the dashboard's units.
- A `--quick` mode was added because the full default simulation is computationally expensive. Quick mode still runs the real SeQUeNCe simulator; it is not a fabricated result.
- `.npmrc` enables `legacy-peer-deps` so Windows users can install the Lovable-generated dependency tree with `npm install` without adding the flag manually.

## Recommended final demonstration

1. Open **BB84 Simulator**.
2. Run 100 qubits with Eve disabled.
3. Enable Eve and run again.
4. Open **Experiments** and run 20 paired trials.
5. Open **Fibre Analysis** and generate the analytical preview if you need the UI demonstration immediately.
6. In `sequence_experiment`, run `run_quick.bat` or `python sequence_distance_bb84.py --quick`.
7. Import `sequence_experiment/results/distance_bb84.csv` into **Fibre Analysis**.
8. Confirm the badge changes from **PREVIEW** to **SEQUENCE DATA** and measured QBER/latency appear.
9. Export the fibre data for the report.

## Full research sweep

When a longer run is actually required, use:

```bat
python sequence_distance_bb84.py
```

The default 12-distance, 6-second-per-distance run is computationally heavy because the SeQUeNCe BB84 implementation models individual photon events. Do not use the full sweep merely to verify installation.

## Scientific wording

Do not say that the displayed raw sifted key is a deployable cryptographic key. The project demonstrates BB84 sifting and disturbance measurement. The SeQUeNCe experiment reports throughput/error-rate behaviour. It does not implement a complete secure-key proof or privacy-amplification pipeline.
