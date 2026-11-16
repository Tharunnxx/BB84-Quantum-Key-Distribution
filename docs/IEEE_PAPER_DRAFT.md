# BB84 Quantum Key Distribution with Intercept-Resend Eavesdropping and Fibre-Length Analysis

## Abstract
This project presents an educational BB84 quantum key-distribution laboratory that combines an interactive browser simulation with a SeQUeNCe-based fibre-distance experiment. The browser model compares ideal BB84 transmission with a full intercept-resend attack and computes the quantum bit error rate (QBER) from the sifted positions. Repeated trials demonstrate the statistical convergence of the attack-induced QBER toward the theoretical 25% expectation. A separate SeQUeNCe experiment sweeps optical fibre length and records BB84 throughput, error rate and latency. The resulting measurements are exported to CSV and visualized in the dashboard. The project intentionally distinguishes raw sifted keys and measured throughput from a cryptographically secure final key because full parameter estimation, error correction, authentication and privacy amplification are not implemented.

## 1. Introduction
Quantum key distribution allows two parties to establish correlated key material while making interception observable. BB84 uses incompatible measurement bases so that an eavesdropper who does not know the sender's basis can introduce errors.

## 2. Methodology
### 2.1 Browser BB84 model
For each qubit, Alice randomly chooses a bit and Z/X basis. Bob independently chooses a basis. When Eve is enabled, she chooses a random basis, measures the qubit, and prepares a replacement state. Alice and Bob reveal only their bases and keep matching positions. QBER is calculated as errors divided by sifted positions.

### 2.2 Repeated trials
Twenty independent paired experiments are run for the same qubit count. The no-Eve and Eve QBER values are plotted to show random variation rather than presenting one hard-coded result.

### 2.3 SeQUeNCe fibre experiment
The Python runner uses SeQUeNCe's QKDNode/BB84 protocol and optical quantum channels. Fibre distance is varied while attenuation, source frequency, detector efficiency, detector dark counts, polarization fidelity, seed and simulation duration are recorded. Throughput, error rate and latency are exported for analysis.

## 3. Results
Insert the exported QBER comparison, 20-trial graph and SeQUeNCe throughput-vs-distance graph here. Report the exact values produced by your run rather than hard-coded example numbers.

## 4. Discussion
The intercept-resend experiment should show a substantial QBER increase compared with the ideal channel. The expected asymptotic error rate for a full intercept-resend attack is 25% on the sifted key, while finite experiments fluctuate around that value. The fibre experiment should show decreasing throughput with increasing distance because channel transmission decreases with optical attenuation.

## 5. Limitations
The browser model uses an idealized channel. The project does not implement a complete secure-key post-processing stack. The SeQUeNCe output is treated as simulator throughput/error-rate data rather than as proof of a final secure key rate.

## 6. Conclusion
The project demonstrates the central BB84 security mechanism and connects it to a network-level fibre-distance study. The combined dashboard makes the protocol, attacker behaviour, statistical evidence and physical-channel trend easy to inspect and explain.

## References
1. C. H. Bennett and G. Brassard, “Quantum cryptography: Public key distribution and coin tossing,” 1984.
2. X. Wu et al., “SeQUeNCe: A Customizable Discrete-Event Simulator of Quantum Networks,” Quantum Science and Technology, 2021.
3. SeQUeNCe project documentation and examples, including the distance-BB84 example.
