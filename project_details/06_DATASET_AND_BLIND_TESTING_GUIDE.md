# Module 06: Datasets & Blind Testing Guide

## 1. Zero Hardcoding Philosophy
A core requirement for hackathon credibility is ensuring that leak detection and localization results are **genuinely computed from physics and data**, rather than hardcoded or predetermined by scenario flags.

DeepGuard fulfills this by exposing a **Blind Testing Laboratory**:
1. Accepts completely unknown, arbitrary CSV files uploaded by judges or operators.
2. Dynamically scans the header row to infer column roles.
3. Calculates discrete numerical gradients ($dP/dt$) to identify physical inflection points.
4. Executes the mathematical formula:
   $$X = \frac{L - C \times \Delta t}{2}$$
5. Verifies accuracy dynamically with no hardcoded assumptions.

---

## 2. Dynamic Column Header Heuristics

The upload analyzer auto-normalizes and searches column names using regex/string candidate lists:

| Measurement | Candidate Column Names in CSV | Fallback Heuristic |
|---|---|---|
| **Timestamp ($t$)** | `timestamp`, `time`, `t`, `seconds`, `sec` | Synthesizes $t_k = k \times 0.05\text{s}$ ($20\text{ Hz}$) if missing. |
| **Inlet Pressure ($P_{\text{in}}$)** | `p_inlet_bar`, `p_inlet`, `inlet_pressure`, `pin`, `p_in` | First numeric column found after timestamp. |
| **Outlet Pressure ($P_{\text{out}}$)** | `p_outlet_bar`, `p_outlet`, `outlet_pressure`, `pout`, `p_out` | Second numeric column found after timestamp. |

---

## 3. Pre-Packaged Benchmark Datasets

Located in `backend/datasets/`:

| Dataset Filename | Simulated Scenario | Leak Coordinate ($X$) | Affected Segment | Purpose |
|---|---|---|---|---|
| `benchmark_normal.csv` | Normal Steady State Operations | None ($0\text{ m}$) | None | Baseline noise & false alarm rejection test |
| `benchmark_seg2_leak_3400m.csv` | Moderate Rupture at 3,400 m | $3,400.0\text{ m}$ ($3.40\text{ km}$) | Segment 2 | Tests shallow seabed localization |
| `benchmark_seg3_leak_5200m.csv` | High-Pressure Fracture at 5,200 m | $5,200.0\text{ m}$ ($5.20\text{ km}$) | Segment 3 | Tests abyssal trench localization near midpoint |
| `benchmark_seg4_leak_7600m.csv` | Critical Rupture at 7,600 m | $7,600.0\text{ m}$ ($7.60\text{ km}$) | Segment 4 | Tests continental slope localization near outlet |
| `benchmark_blind_test.csv` | **Official Blind Evaluation Target** | $6,150.0\text{ m}$ ($6.15\text{ km}$) | Segment 4 | Evaluates dynamic algorithm on unknown data |

---

## 4. How Judges Can Test an Arbitrary Custom CSV

Judges can create any custom test CSV file to challenge the algorithm.

### Minimal Valid CSV Format:
```csv
timestamp,p_inlet_bar,p_outlet_bar
0.00,135.05,88.10
0.05,134.98,88.02
...
20.00,135.02,88.05
20.15,122.30,88.04   <-- Wave hits inlet at t1 = 20.15s
...
22.45,121.90,73.10   <-- Wave hits outlet at t2 = 22.45s (Δt = 2.30s)
...
```

### Steps to Evaluate in UI:
1. Open the dashboard at `http://localhost:5173`.
2. Click **Blind Dataset Lab** in the top navigation bar.
3. Drag and drop the CSV file into the drop zone.
4. Click **Execute Blind NPW Localization**.
5. Inspect the generated **Audit Report**:
   - Total sample count & computed sampling frequency ($Hz$).
   - Detected onset times ($t_1$ and $t_2$).
   - Calculated $\Delta t$.
   - Computed position $X$ and mapped operational segment.
   - Exact mathematical formula verification display.

