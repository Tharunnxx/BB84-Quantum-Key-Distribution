# QuantumLab — BB84 Quantum Key Distribution

University Quantum Computing project for **BB84 key distribution with an intercept-resend eavesdropper**, extended with a fibre-length throughput experiment using **SeQUeNCe**.

## What the project demonstrates

- BB84 transmission with and without Eve.
- Intercept-resend eavesdropping and QBER measurement.
- 20 repeated paired trials for statistical evidence.
- Qubit-by-qubit walkthrough and raw sifted-key inspection.
- CSV exports for experiment data.
- Fibre-length analysis dashboard.
- A reproducible Python/SeQUeNCe distance sweep that exports CSV results.
- Import of the real SeQUeNCe CSV into the dashboard.

## Run the web dashboard

```bash
npm install
npm run dev
```

## Run the SeQUeNCe experiment

See `sequence_experiment/README.md`.

The current SeQUeNCe project requires Python 3.12+ and can be installed with `pip install sequence`. The included runner follows the structure of SeQUeNCe's distance-BB84 example while making the distance sweep configurable.

```bash
cd sequence_experiment
python -m venv .venv
.venv\\Scripts\\activate
python -m pip install -r requirements.txt
python sequence_distance_bb84.py
```

Then open the dashboard's **Fibre Analysis** page and import:

`sequence_experiment/results/distance_bb84.csv`

## Important scientific scope

The browser's **analytical preview** is not presented as a SeQUeNCe measurement. To report simulator results, run the Python experiment and import its CSV. The project also does not claim a cryptographically secure final key rate; secure final-key generation requires complete post-processing such as parameter estimation, error correction, authentication and privacy amplification.

## Documentation

- `docs/PROJECT_COMPLETION.md` — completion checklist and demo flow.
- `docs/DEMO_SCRIPT.md` — short viva/demo script.
- `docs/PPT_OUTLINE.md` — presentation structure.
- `docs/IEEE_PAPER_DRAFT.md` — paper draft structure to populate with your actual measured values.
