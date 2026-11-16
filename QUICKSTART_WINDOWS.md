# QuantumLab BB84 — Windows Quick Start

## 1. Start the web dashboard

Open Command Prompt in the project root:

```bat
npm install --legacy-peer-deps
npm run dev
```

Open the URL shown by Vite (normally `http://localhost:8080/`).

## 2. Verify BB84 without Eve

Open **BB84 Simulator** → choose **100 qubits** → keep Eve disabled → run.

Expected behaviour: QBER should be 0% for the ideal no-Eve model.

## 3. Verify BB84 with Eve

Enable **Intercept-Resend Eve** and run again.

Expected behaviour: QBER should rise and vary statistically around the theoretical 25% level over many trials.

## 4. Run real SeQUeNCe

Open a second Command Prompt:

```bat
cd sequence_experiment
python -m pip install -r requirements.txt
python sequence_distance_bb84.py --quick
```

This is a real short SeQUeNCe run. It generates:

```text
sequence_experiment\\results\\distance_bb84.csv
sequence_experiment\\results\\distance_bb84_metadata.json
```

## 5. Import the measured results

Back in the web app → **Fibre Analysis** → **Import SeQUeNCe CSV** → select `results\\distance_bb84.csv`.

The page should change from **PREVIEW** to **SEQUENCE DATA** and show measured throughput/QBER values.

## 6. Generate the full research sweep only when needed

```bat
python sequence_distance_bb84.py
```

The full 12-distance, 6-second-per-distance run is computationally heavy. It is not required just to demonstrate that the project works.
