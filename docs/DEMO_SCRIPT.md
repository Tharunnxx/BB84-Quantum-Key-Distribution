# 3–5 minute demo script

### 1. Problem
“Our project studies BB84 quantum key distribution and shows how an intercept-resend eavesdropper creates detectable errors. We also study how fibre distance affects BB84 throughput.”

### 2. Without Eve
“Here Alice chooses a random bit and one of two bases. Bob independently chooses a basis. After basis reconciliation, matching positions are kept. In an ideal channel the QBER should be 0%.”

### 3. With Eve
“Now Eve intercepts every qubit, measures using a random basis, and resends a state based on her result. When Eve chooses the wrong basis, her measurement can disturb the state. The observed QBER approaches 25% over many trials.”

### 4. Statistics
“The 20-trial chart is important because a single run is random. Repeated trials show the distribution settling around the theoretical intercept-resend expectation.”

### 5. Fibre experiment
“The second part uses SeQUeNCe, a discrete-event quantum-network simulator. We sweep fibre distance and record BB84 throughput, error rate and latency. Optical attenuation causes the usable detection rate to fall as distance increases.”

### 6. Conclusion
“The project demonstrates both the security principle of BB84 and a practical network-level effect: longer optical links reduce key throughput. The raw sifted key is not claimed to be a final secure key because complete error correction and privacy amplification are outside our implemented scope.”
