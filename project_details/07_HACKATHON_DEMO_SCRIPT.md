# Module 07: Hackathon Presentation Pitch & Demo Script
**Team Mind Spark | Project: DeepGuard Subsea Digital Twin**

---

## 1. The 30-Second Elevator Pitch
> *"Good morning judges. Subsea pipeline ruptures cost oil & gas operators \$50M per incident in environmental fines and lost production, largely because existing SCADA systems take hours to detect leaks and cannot tell you where along 10 kilometers the pipe broke.*  
> *We are **Team Mind Spark**, and we built **DeepGuard**: an autonomous subsea digital twin that detects, localizes, visualizes, and isolates pipeline breaches in under 3 seconds using edge analytics and Negative Pressure Wave acoustics.*  
> *Let us show you how DeepGuard pinpoints a subsea rupture to the exact meter without human guesswork."*

---

## 2. 3-Minute Live Demonstration Walkthrough

### Minute 1: The Baseline State (Detect & Monitor)
1. **Show Dashboard Overview:** Point out the dark industrial control room aesthetic (`#020b15` palette, glowing cyan telemetry, live 20 Hz WebSocket link).
2. **Review Normal Operations:**
   - Inlet Pressure: $\approx 135\text{ bar}$
   - Outlet Pressure: $\approx 88\text{ bar}$
   - Normal Darcy frictional drop $\Delta P \approx 47\text{ bar}$
   - Mass Flow Balance $\Delta Q \approx 0\text{ m}^3\text{/h}$
   - All 5 Segments displaying **GREEN (Integrity Optimal)**.
3. **Show 3D Digital Twin:** Use mouse to rotate around the 10 km pipeline, pointing out the bathymetric seabed trench, support pylons, and the yellow autonomous inspection AUV patrolling the line with searchlights.

---

### Minute 2: Injecting a Rupture (Localize & Visualize)
1. Click **Simulation Controls** in the header.
2. Select a custom distance—for example, **`3,450 meters`** (located in Segment 2) and select **Moderate Rupture (25%)**.
3. Click **Inject Breach & Trigger NPW Wavefront**:
   - The acoustic wave propagates outward at $C = 1,150\text{ m/s}$.
   - The wave reaches the inlet sensor at $t_1 = 3.00\text{s}$, and the outlet sensor at $t_2 = 5.70\text{s}$.
   - Watch the real-time oscilloscope show the sudden negative inflection ($dP/dt < -0.45\text{ bar/s}$).
4. Point to the **NPW Diagnostics Card**:
   - Prominently showcase the governing formula:
     $$\mathbf{X = \frac{L - C \times \Delta t}{2}}$$
   - $\Delta t = 2.696\text{s} \implies X = 3,450.0\text{ meters}$ with **$97.4\%$ confidence**.
5. Look at the **3D Digital Twin**:
   - The breach plume particle system erupts with bubbling red-orange oil at the exact 3D coordinates of Segment 2!
   - Click the **Breach Focus** camera preset—the camera smoothly pans and zooms directly into the underwater rupture point.

---

### Minute 3: Autonomous Response & Blind Validation (Respond & Verify)
1. **Show Automatic Virtual ESD Isolation:**
   - As the anomaly score reaches RED ($\mathcal{S} \ge 0.78$), the system dispatches automatic isolation.
   - Valves `V1` ($2.0\text{ km}$) and `V2` ($4.0\text{ km}$) close dynamically.
   - Leak discharge drops by $95\%$, arresting the spill volume.
2. **Prove Zero Hardcoding via Blind Testing Lab:**
   - Click **Blind Dataset Lab**.
   - Drop the blind evaluation CSV (`benchmark_blind_test.csv`) into the uploader.
   - Click **Execute Blind NPW Localization**.
   - Show the judges how the dynamic parser calculates $t_1$, $t_2$, $\Delta t$, and pinpoints the unknown leak location in Segment 4 on-the-fly without any hardcoded scenario flags!
3. **Closing Line:** *"DeepGuard transforms subsea pipeline safety from reactive cleanup to proactive, autonomous containment."*

---

## 3. Anticipated Judge Questions & Technical Answers

### Q1: *"How does the system distinguish real leaks from routine pump throttle oscillations or wave action?"*
> **Answer:** *"Routine operational transients cause gradual or symmetric pressure variations across the line where $dP/dt$ remains above our $-0.45\text{ bar/s}$ threshold. In contrast, a physical breach generates a steep, negative acoustic wavefront with a signature time delay between transducers and an accompanying persistent mass imbalance ($\Delta M = Q_{\text{in}} - Q_{\text{out}}$). Our multi-factor anomaly scoring combines derivative slope, mass balance, and rolling variance to reject false alarms."*

### Q2: *"Why is the formula $X = (L - C \cdot \Delta t)/2$ instead of $X = (L + C \cdot \Delta t)/2$?"*
> **Answer:** *"It depends on how $\Delta t$ is defined. In our system, $\Delta t = t_{\text{outlet}} - t_{\text{inlet}}$. Since wave travel times are $t_{\text{inlet}} = X/C$ and $t_{\text{outlet}} = (L - X)/C$, the difference is $\Delta t = (L - 2X)/C$. Multiplying by $C$ gives $C \cdot \Delta t = L - 2X$. Rearranging gives $2X = L - C \cdot \Delta t$, which yields $X = (L - C \cdot \Delta t)/2$. As a sanity check, if a leak occurs at the inlet ($X = 0$), the wave reaches the inlet immediately ($t_{\text{inlet}}=0$) and the outlet at $L/C$, so $\Delta t = L/C$, which gives $X = (L - L)/2 = 0\text{ m}$."*

### Q3: *"How does the system scale to different pipe lengths or fluid types?"*
> **Answer:** *"The pipeline length $L$ and wave propagation speed $C$ are parameterized inputs. For example, if crude oil is replaced with refined product or natural gas, $C$ adjusts from $1,150\text{ m/s}$ down to $380\text{ m/s}$ using the Korteweg bulk modulus equation, without requiring any structural changes to the localization engine."*

