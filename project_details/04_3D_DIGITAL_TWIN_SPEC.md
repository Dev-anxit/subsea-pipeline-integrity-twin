# Module 04: 3D Digital Twin Specification (Three.js WebGL)

## 1. Scene Overview & Underwater Atmosphere
The 3D Digital Twin transforms abstract sensor telemetry into an intuitive, high-fidelity subsea control environment rendered via Three.js and WebGL.

- **Background Color:** Deep ocean abyssal navy (`#020b15`).
- **Volumetric Underwater Fog:** Exponential squared fog (`THREE.FogExp2(0x020b15, 0.012)`) creating authentic deep-water light extinction and atmospheric depth.
- **Lighting Rig:**
  - Ambient Light: Deep sea cyan ambient (`0x0d2b45`, intensity $1.8$).
  - Primary Sun/Surface Light: Top-down directional light (`0x38bdf8`, intensity $1.5$) with soft PCF shadow mapping.
  - Rim Light: Underwater back-cyan directional light (`0x00f2fe`, intensity $1.2$) illuminating pipeline silhouettes.

---

## 2. Spatial Coordinate System & Scaling

The physical 10 km ($10,000\text{ meters}$) subsea pipeline is mapped linearly to 120 Three.js coordinate units along the X-axis:

$$\text{Position}_{3\text{D}}(X_{\text{meters}}) = \left( \frac{X_{\text{meters}}}{10,000} \right) \times 120.0 - 60.0$$

- **Inlet Platform (Wellhead Riser):** $X_{\text{meters}} = 0\text{ m} \implies X_{3\text{D}} = -60.0$
- **Segment 1 Center:** $X_{\text{meters}} = 1,000\text{ m} \implies X_{3\text{D}} = -48.0$
- **Segment 2 Center:** $X_{\text{meters}} = 3,000\text{ m} \implies X_{3\text{D}} = -24.0$
- **Segment 3 Center (Midpoint):** $X_{\text{meters}} = 5,000\text{ m} \implies X_{3\text{D}} = 0.0$
- **Segment 4 Center:** $X_{\text{meters}} = 7,000\text{ m} \implies X_{3\text{D}} = +24.0$
- **Segment 5 Center:** $X_{\text{meters}} = 9,000\text{ m} \implies X_{3\text{D}} = +48.0$
- **Outlet PLEM Manifold:** $X_{\text{meters}} = 10,000\text{ m} \implies X_{3\text{D}} = +60.0$

Each of the 5 segments spans exactly **24.0 Three.js units** ($2.0\text{ km}$).

---

## 3. Subsea Bathymetry & Seabed Terrain

The seabed is procedurally synthesized using a deformed plane geometry (`200` units wide $\times$ `160` units deep, $64 \times 48$ segments):
$$Y(x, z) = 2.2 \sin(0.05 x) + 1.8 \cos(0.06 z) - 4.0 \exp\left(-\left(\frac{x}{25}\right)^2\right) - 4.5$$

- The exponential depression creates a realistic **abyssal trench** underneath Segment 3 ($x \approx 0$).
- Overlaid with a cyan bathymetric grid helper (`THREE.GridHelper`) to visualize depth contours.
- The pipeline is elevated at $Y = 0$, supported by structural concrete pylons anchored into the undulating seabed.

---

## 4. Dynamic Leak Plume Particle Physics

When a breach occurs, the 3D twin dynamically renders an underwater hydrocarbon & bubble plume directly at the localized coordinate:

- **Particle Count:** 280 active particle points with additive blending (`THREE.AdditiveBlending`).
- **Material:** Semi-transparent luminous red-orange (`#f87171`), size $0.75$.
- **Physics Update Loop:**
  - Radial dispersion: $X_i \leftarrow X_i + v_{x,i}$, $Z_i \leftarrow Z_i + v_{z,i}$ with Gaussian random perturbation.
  - Buoyant upward velocity: $Y_i \leftarrow Y_i + (0.05 + 0.15 \cdot \text{rand}())$.
  - Recycled when $Y_i > 18.0\text{ units}$, resetting to the base of the pipeline.
- Automatically repositions whenever NPW localization resolves a new coordinate $X$.

---

## 5. Autonomous Underwater Vehicle (AUV) Patrol System

An inspection AUV cruises continuously along the trunkline to provide dynamic scale and visual fidelity:
- **Body:** Sleek hydrodynamic yellow submarine fuselage (`#facc15`) with nose cone and propeller shroud.
- **Searchlight:** Forward-facing cone spotlight (`THREE.SpotLight`, `#38bdf8`, intensity $4.0$) casting illuminated cones onto the seabed and pipe.
- **Patrol Kinematics:**
  $$X_{\text{auv}}(t) = 52.0 \cdot \sin(0.25 \cdot t)$$
  $$Y_{\text{auv}}(t) = 3.5 + 0.4 \cdot \sin(1.2 \cdot t)$$
  AUV automatically pivots $180^\circ$ at the end of each patrol sweep.

---

## 6. Interactive Camera Presets

The bottom toolbar provides instant camera perspective shifts:
1. **Overview**: Bird's eye isometric perspective ($[0, 42, 85] \to [0, 0, 0]$).
2. **S1 to S5**: Focused close-up inspection on each specific 2 km segment.
3. **Breach Focus**: Automatically pans and zooms directly to the localized breach location ($[X_{3\text{D}}, 8, 18] \to [X_{3\text{D}}, 1, 0]$).
4. **AUV Cam**: Smooth chase camera tracking the moving inspection submarine.

