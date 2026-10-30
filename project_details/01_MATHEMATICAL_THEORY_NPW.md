# Module 01: Mathematical Theory & NPW Formulation

## 1. Physical Principle of Negative Pressure Waves (NPW)

When an intact, pressurized subsea pipeline suddenly ruptures or develops a leak at location $X$, the rapid loss of local fluid mass creates an instantaneous, localized pressure drop ($\Delta P_{\text{breach}}$). 

This disturbance cannot remain stationary; according to acoustic wave dynamics in compressible fluid media, a **Negative Pressure Wave (NPW)** originates from the rupture point and propagates outwards in both upstream and downstream directions at acoustic wave speed $C$.

```
               <--- Wavefront (C)       Rupture (X)       Wavefront (C) --->
Inlet Transducer |==========================[ * ]==========================| Outlet Transducer
     (x = 0)                                                                   (x = L)
        |<------------------- X ------------------>|<------- (L - X) ------->|
        |<--------------------------------- L ------------------------------>|
```

---

## 2. Derivation of the Localization Governing Formula

Let:
- $L$ = Total pipeline length ($10,000\text{ m}$)
- $C$ = Acoustic wave velocity ($1,150\text{ m/s}$)
- $X$ = Distance from inlet to the leak location ($0 \le X \le L$)
- $t_{\text{rupture}}$ = Physical timestamp when the breach begins
- $t_{\text{inlet}}$ = Timestamp when the negative wavefront reaches the inlet transducer
- $t_{\text{outlet}}$ = Timestamp when the negative wavefront reaches the outlet transducer

The propagation times from the leak origin to the two ends are:
$$t_{\text{inlet}} = t_{\text{rupture}} + \frac{X}{C}$$
$$t_{\text{outlet}} = t_{\text{rupture}} + \frac{L - X}{C}$$

Subtracting $t_{\text{inlet}}$ from $t_{\text{outlet}}$ cancels out the unknown breach timestamp $t_{\text{rupture}}$:
$$\Delta t = t_{\text{outlet}} - t_{\text{inlet}} = \left( t_{\text{rupture}} + \frac{L - X}{C} \right) - \left( t_{\text{rupture}} + \frac{X}{C} \right)$$

$$\Delta t = \frac{L - X - X}{C} = \frac{L - 2X}{C}$$

Multiplying both sides by $C$:
$$C \times \Delta t = L - 2X$$

Rearranging for $2X$:
$$2X = L - C \times \Delta t$$

Dividing by $2$ yields the primary governing equation:
$$\mathbf{X = \frac{L - C \times \Delta t}{2}}$$

---

## 3. Boundary Condition Mathematical Proofs

### Proof 1: Leak directly at the Inlet ($X = 0\text{ m}$)
- Wave reaches inlet immediately: $t_{\text{inlet}} = t_{\text{rupture}}$
- Wave reaches outlet after traveling the full length: $t_{\text{outlet}} = t_{\text{rupture}} + \frac{L}{C}$
- Time difference: $\Delta t = \frac{L}{C}$
- Substituting into formula:
  $$X = \frac{L - C \times \left( \frac{L}{C} \right)}{2} = \frac{L - L}{2} = 0\text{ m} \quad \checkmark$$

### Proof 2: Leak at exact Midpoint ($X = 5,000\text{ m} = L/2$)
- Wave reaches both transducers simultaneously: $t_{\text{inlet}} = t_{\text{outlet}} \implies \Delta t = 0\text{ s}$
- Substituting into formula:
  $$X = \frac{L - C \times (0)}{2} = \frac{L}{2} = 5,000\text{ m} \quad \checkmark$$

### Proof 3: Leak directly at the Outlet ($X = 10,000\text{ m} = L$)
- Wave reaches outlet immediately: $t_{\text{outlet}} = t_{\text{rupture}}$
- Wave reaches inlet after traveling full length: $t_{\text{inlet}} = t_{\text{rupture}} + \frac{L}{C}$
- Time difference: $\Delta t = -\frac{L}{C}$
- Substituting into formula:
  $$X = \frac{L - C \times \left( -\frac{L}{C} \right)}{2} = \frac{L + L}{2} = \frac{2L}{2} = L = 10,000\text{ m} \quad \checkmark$$

### Proof 4: Custom Hackathon Benchmark ($X = 3,450\text{ m}$)
- Time to inlet: $t_1 = 3,450 / 1,150 = 3.000\text{ s}$
- Time to outlet: $t_2 = (10,000 - 3,450) / 1,150 = 6,550 / 1,150 = 5.6957\text{ s}$
- $\Delta t = 5.6957 - 3.0000 = +2.6957\text{ s}$
- Localization:
  $$X = \frac{10,000 - 1,150 \times 2.6957}{2} = \frac{10,000 - 3,100}{2} = 3,450.0\text{ m} \quad \checkmark$$

---

## 4. Acoustic Velocity in Subsea Pipelines ($C$)

The acoustic wave velocity $C$ in a liquid-filled, elastic subsea steel pipe is determined by the Korteweg equation:
$$C = \sqrt{\frac{K / \rho}{1 + c_1 \cdot \left( \frac{K \cdot D}{E \cdot e} \right)}}$$

Where:
- $K$ = Bulk modulus of elasticity of fluid ($\approx 1.5 - 2.2 \times 10^9\text{ Pa}$)
- $\rho$ = Fluid density ($\approx 845\text{ kg/m}^3$ for light crude)
- $D$ = Pipeline internal diameter ($0.508\text{ m} = 20\text{ inches}$)
- $e$ = Pipe wall thickness ($0.0254\text{ m} = 1.0\text{ inch}$)
- $E$ = Young's modulus of carbon steel ($2.06 \times 10^{11}\text{ Pa}$)
- $c_1$ = Constraint factor for anchored subsea pipelines ($\approx 1 - \nu^2$)

For the Barents-Alpha subsea trunkline, this yields an effective propagation velocity of **$C = 1,150\text{ m/s}$**.

---

## 5. Spill Rate & Outflow Estimation (Torricelli Orifice Flow)

When a breach occurs, the instantaneous volumetric leakage rate $Q_{\text{leak}}$ is governed by the Torricelli orifice equation:
$$Q_{\text{leak}} = C_d \cdot A_{\text{orifice}} \cdot \sqrt{\frac{2 \cdot \Delta P}{\rho}}$$

Where:
- $C_d$ = Discharge coefficient ($\approx 0.62$ for sharp-edged fractures)
- $A_{\text{orifice}}$ = Cross-sectional area of breach ($\text{m}^2$)
- $\Delta P = P_{\text{internal}} - P_{\text{hydrostatic}}$
  - $P_{\text{internal}} \approx 100 - 135\text{ bar}$
  - $P_{\text{hydrostatic}} = \rho_{\text{seawater}} \cdot g \cdot h \approx 1,025 \cdot 9.81 \cdot 850\text{ m} \approx 85.5\text{ bar}$
  - Effective differential driving discharge: $\Delta P \approx 20 - 50\text{ bar}$
- Cumulative volume spilled is integrated in real-time by the simulator:
  $$V_{\text{spill}}(t) = \int_{t_{\text{rupture}}}^t Q_{\text{leak}}(\tau) \, d\tau$$

