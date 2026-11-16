"""SeQUeNCe distance sweep for the BB84 university project.

This script follows the structure of the official SeQUeNCe distance_bb84 example,
while exposing the experiment as a reproducible command-line sweep and writing a
CSV that the QuantumLab browser dashboard can import.

The output reports BB84 throughput, error rate and one-way latency. It does NOT
claim a cryptographically secure final-key rate because this experiment uses the
BB84 protocol layer without a complete post-processing/security proof pipeline.
"""

from __future__ import annotations

import argparse
import math
from pathlib import Path

import pandas as pd
from numpy import mean

from sequence.components.optical_channel import ClassicalChannel, QuantumChannel
from sequence.kernel.event import Event
from sequence.kernel.process import Process
from sequence.kernel.timeline import Timeline
from sequence.qkd.BB84 import pair_bb84_protocols
from sequence.topology.node import QKDNode

DEFAULT_DISTANCES_KM = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

QUICK_DISTANCES_KM = [1, 10, 50, 100]

# 5 ms gives the 100 km simulation enough time to complete
# the BB84 communication and key-generation process.
QUICK_DURATION_SECONDS = 0.02


def parse_distances(raw: str) -> list[float]:
    values = [float(item.strip()) for item in raw.split(",") if item.strip()]

    if not values or any(value <= 0 for value in values):
        raise argparse.ArgumentTypeError(
            "Distances must be positive comma-separated kilometres."
        )

    return values


def run_distance(
    distance_km: float,
    *,
    duration_seconds: float,
    seed: int,
    attenuation_db_per_m: float,
    polarization_fidelity: float,
    source_rate_hz: float,
    mean_photon_num: float,
    detector_efficiency: float,
    dark_count: float,
) -> dict[str, float]:

    distance_m = distance_km * 1000.0

    # SeQUeNCe timeline uses picoseconds.
    runtime_ps = duration_seconds * 1e12

    timeline = Timeline(runtime_ps)
    timeline.show_progress = False

    qc_forward = QuantumChannel(
        "qc_forward",
        timeline,
        distance=distance_m,
        polarization_fidelity=polarization_fidelity,
        attenuation=attenuation_db_per_m,
    )

    qc_reverse = QuantumChannel(
        "qc_reverse",
        timeline,
        distance=distance_m,
        polarization_fidelity=polarization_fidelity,
        attenuation=attenuation_db_per_m,
    )

    cc_forward = ClassicalChannel(
        "cc_forward",
        timeline,
        distance=distance_m,
    )

    cc_reverse = ClassicalChannel(
        "cc_reverse",
        timeline,
        distance=distance_m,
    )

    # Add 10 ns processing/communication overhead.
    # Timeline units are picoseconds, so:
    # 10 ns = 10,000 ps = 1e4 ps.
    cc_forward.delay += 10e3
    cc_reverse.delay += 10e3

    alice = QKDNode(
        "alice",
        timeline,
        stack_size=1,
    )

    bob = QKDNode(
        "bob",
        timeline,
        stack_size=1,
    )

    alice.set_seed(seed)
    bob.set_seed(seed + 1)

    alice.update_lightsource_params(
        "frequency",
        source_rate_hz,
    )

    alice.update_lightsource_params(
        "mean_photon_num",
        mean_photon_num,
    )

    detector_params = [
        {
            "efficiency": detector_efficiency,
            "dark_count": dark_count,
            "time_resolution": 10,
            "count_rate": 50e6,
        },
        {
            "efficiency": detector_efficiency,
            "dark_count": dark_count,
            "time_resolution": 10,
            "count_rate": 50e6,
        },
    ]

    for detector_id, params in enumerate(detector_params):
        for name, value in params.items():
            bob.update_detector_params(
                detector_id,
                name,
                value,
            )

    qc_forward.set_ends(
        alice,
        bob.name,
    )

    qc_reverse.set_ends(
        bob,
        alice.name,
    )

    cc_forward.set_ends(
        alice,
        bob.name,
    )

    cc_reverse.set_ends(
        bob,
        alice.name,
    )

    pair_bb84_protocols(
        alice.protocol_stack[0],
        bob.protocol_stack[0],
    )

    # Start BB84 key generation.
    #
    # 256 = requested key length.
    # math.inf = continue generating keys until the simulation window ends.
    # runtime_ps = maximum allowed simulation time.
    process = Process(
        alice.protocol_stack[0],
        "push",
        [256, math.inf, runtime_ps],
    )

    timeline.schedule(
        Event(
            0,
            process,
        )
    )

    timeline.init()
    timeline.run()

    protocol = alice.protocol_stack[0]

    throughputs = list(
        getattr(
            protocol,
            "throughputs",
            [],
        )
    )

    error_rates = list(
        getattr(
            protocol,
            "error_rates",
            [],
        )
    )

    latency = float(
        getattr(
            protocol,
            "latency",
            float("nan"),
        )
    )

    return {
        "Distance_km": distance_km,
        "Distance_m": distance_m,

        "Throughput_bits_per_second": (
            float(mean(throughputs))
            if throughputs
            else float("nan")
        ),

        "Error_rate": (
            float(mean(error_rates))
            if error_rates
            else float("nan")
        ),

        # SeQUeNCe latency is stored in seconds.
        # Convert seconds -> nanoseconds for the dashboard.
        "Latency_ns": (
            latency * 1e9
            if math.isfinite(latency)
            else float("nan")
        ),
    }


def main() -> None:

    parser = argparse.ArgumentParser(
        description="Run a SeQUeNCe BB84 fibre-distance sweep."
    )

    parser.add_argument(
        "--distances",
        type=parse_distances,
        default=DEFAULT_DISTANCES_KM,
        help="Comma-separated fibre lengths in km.",
    )

    parser.add_argument(
        "--duration",
        type=float,
        default=6.0,
        help=(
            "Simulation duration per distance in seconds. "
            "Use a small value for a quick validation run."
        ),
    )

    parser.add_argument(
        "--quick",
        action="store_true",
        help=(
            "Run a fast real SeQUeNCe validation sweep "
            "at 1, 10, 50 and 100 km."
        ),
    )

    parser.add_argument(
        "--seed",
        type=int,
        default=2026,
        help="Base random seed.",
    )

    parser.add_argument(
        "--attenuation",
        type=float,
        default=0.0002,
        help=(
            "Fibre attenuation in dB/m "
            "(0.0002 = 0.2 dB/km)."
        ),
    )

    parser.add_argument(
        "--fidelity",
        type=float,
        default=0.97,
        help="Polarization fidelity.",
    )

    parser.add_argument(
        "--source-rate",
        type=float,
        default=80e6,
        help="Photon source frequency in Hz.",
    )

    parser.add_argument(
        "--mean-photon-num",
        type=float,
        default=0.1,
        help="Mean photon number.",
    )

    parser.add_argument(
        "--detector-efficiency",
        type=float,
        default=0.8,
        help="Detector efficiency.",
    )

    parser.add_argument(
        "--dark-count",
        type=float,
        default=10,
        help=(
            "Detector dark count parameter "
            "used by SeQUeNCe."
        ),
    )

    parser.add_argument(
        "--output",
        type=Path,
        default=Path(
            "results/distance_bb84.csv"
        ),
        help="CSV output path.",
    )

    args = parser.parse_args()

    if args.duration <= 0:
        parser.error(
            "--duration must be positive"
        )

    distances = (
        QUICK_DISTANCES_KM
        if args.quick
        else args.distances
    )

    duration = (
        QUICK_DURATION_SECONDS
        if args.quick
        else args.duration
    )

    if args.quick:
        print(
            "Quick mode: real SeQUeNCe run "
            "with a short simulation window."
        )

        print(
            f"Distances: {distances} km | "
            f"duration per distance: {duration:g} s"
        )

    results = []

    for index, distance_km in enumerate(distances):

        print(
            f"Running SeQUeNCe BB84 "
            f"at {distance_km:g} km..."
        )

        results.append(
            run_distance(
                distance_km,

                duration_seconds=duration,

                seed=args.seed + index * 2,

                attenuation_db_per_m=(
                    args.attenuation
                ),

                polarization_fidelity=(
                    args.fidelity
                ),

                source_rate_hz=(
                    args.source_rate
                ),

                mean_photon_num=(
                    args.mean_photon_num
                ),

                detector_efficiency=(
                    args.detector_efficiency
                ),

                dark_count=(
                    args.dark_count
                ),
            )
        )

    output = args.output

    output.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    df = pd.DataFrame(results)

    df.to_csv(
        output,
        index=False,
    )

    metadata = output.with_name(
        "distance_bb84_metadata.json"
    )

    metadata.write_text(
        pd.Series(
            {
                "project": (
                    "BB84 Quantum Key Distribution "
                    "with Intercept-Resend Eavesdropping"
                ),

                "experiment": (
                    "SeQUeNCe fibre-length "
                    "throughput sweep"
                ),

                "seed": args.seed,

                "duration_seconds_per_distance": (
                    duration
                ),

                "attenuation_db_per_m": (
                    args.attenuation
                ),

                "attenuation_db_per_km": (
                    args.attenuation * 1000
                ),

                "polarization_fidelity": (
                    args.fidelity
                ),

                "source_rate_hz": (
                    args.source_rate
                ),

                "mean_photon_num": (
                    args.mean_photon_num
                ),

                "detector_efficiency": (
                    args.detector_efficiency
                ),

                "dark_count": (
                    args.dark_count
                ),

                "distances_km": distances,
            }
        ).to_json(
            indent=2
        )
    )

    print(
        f"\nSaved {len(df)} distance points "
        f"to {output}"
    )

    print(
        f"Saved experiment metadata "
        f"to {metadata}"
    )


if __name__ == "__main__":
    main()