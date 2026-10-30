# National Critical Infrastructure Command & Disaster Management System
**Directorate General of Hydrocarbons (DGH) / Ministry of Petroleum & Natural Gas**  
**Classification:** RESTRICTED // CRITICAL ENERGY INFRASTRUCTURE  
**Asset Identification:** IND-KG-D6-TL-04 (10.0 km Deepwater Subsea Trunkline)

---

## 1. Real-World Problem & Strategic Mandate
Subsea hydrocarbon pipelines transport massive volumes of high-pressure energy resources across extreme oceanic environments (depths exceeding 1,000 meters, high hydrostatic pressure, abrasive seabed currents, seismic faults, and maritime traffic anchor drags).

A failure or rupture in such pipelines presents severe national threats:
1. **Ecological Disaster**: High-volume crude oil spills devastating marine sanctuaries and fisheries (MARPOL Annex I violations).
2. **National Energy Security Crisis**: Interruption of critical crude or natural gas feedstocks to mainland refineries and power grids.
3. **Statutory Penalties & Sovereign Liability**: Failure to comply with ISO 13623, DNV-ST-F101, and OISD-STD-141 offshore standards.

This platform transforms theoretical pipeline integrity into an **authoritative, real-time national command system** that gives government controllers, coast guard command, and refinery operators instantaneous visibility and automated mitigation controls.

---

## 2. Government Command Components & Real-World Features

### 🏛️ 1. National Authority Header (`GovernmentHeader.tsx`)
- **Visual Classification**: RESTRICTED // CRITICAL ENERGY INFRASTRUCTURE with national crest and DGH insignia.
- **DEFCON & ICS Status Indicator**:
  - **DEFCON 4 (Green)**: Nominal baseline flow, zero acoustic transients.
  - **DEFCON 3 (Yellow)**: Advisory flow discrepancy (potential valve hunting / minor metering drift).
  - **DEFCON 2 (Orange)**: High anomaly escalation, rate of pressure drop exceeding thresholds.
  - **DEFCON 1 (Red / Pulsing)**: Active pipeline breach / acute rupture detected. Immediate emergency protocol active.
- **Interactive Quick-Launch Controls**:
  - **DGH Form-4 Dossier**: Opens printable statutory accident & pollution report.
  - **Hydrographic GIS Bathymetry Map**: Launches 2D nautical chart with coordinates and EEZ boundaries.
  - **SOP Drill Manual**: Standard operating procedures.
  - **Master ESD Virtual Actuator**: 1-click simultaneous isolation of all 5 subsea sectors.
  - **Audio Siren Toggle**: Instant silencer for rhythmic acoustic breach alarm.

---

### 🚨 2. National Incident Command System (ICS) Status Banner (`DisasterProtocolBanner.tsx`)
- **Live Official Communique**: Context-aware tactical briefings (e.g. notifying operators of active breaches, coordinates in latitude/longitude, estimated spill rate in $m^3/h$, and sector valve closures).
- **1-Click Government Disaster Drills**:
  - **Drill 1: Abyssal Fracture (Sector 3 - 5.20 km)**: Injects 35% rupture in deep ocean trench.
  - **Drill 2: Continental Riser Breach (Sector 1 - 1.20 km)**: Injects severe 45% blowout near platform riser.
  - **Drill 3: Micro-Pin-Leak (Sector 4 - 7.10 km)**: Injects insidious 12% pin-leak to demonstrate high-sensitivity edge anomaly scoring.
  - **Green Reset**: Restores national asset to baseline nominal state.

---

### 📄 3. Statutory Regulatory Incident Report Dossier (`GovernmentIncidentReportModal.tsx`)
- **Official Designation**: Form DGH/OPIM-Form-4 (Offshore Pipeline Integrity Incident Notification).
- **Statutory Compliance**: DNV-ST-F101, ISO 13623, and MARPOL Annex I Tier-3 reporting.
- **Accurate Mathematical Audit Trail**:
  - Exact wave arrival timestamps ($t_{\text{inlet}}$ and $t_{\text{outlet}}$).
  - Wave differential ($\Delta t$) calculated to 4 decimal places.
  - Negative Pressure Wave equation: $X = \frac{L - C \cdot \Delta t}{2}$ with acoustic velocity $C = 1,150.0 \text{ m/s}$.
  - Cumulative ecological spill metrics ($m^3$ and barrels of crude oil).
- **Print & Export**: Built-in 1-click formatted document printing (`window.print()`) complete with verification seals and signature block for the Controller of Subsea Infrastructure.

---

### 🗺️ 4. Nautical Bathymetry & Hydrographic GIS Map (`HydrographicMapModal.tsx`)
- **Coordinate System**: Bay of Bengal KG-D6 Deepwater Basin ($16^\circ 30' \text{N}, 82^\circ 20' \text{E}$).
- **Seabed Bathymetry**: Depth contours (-300m, -600m, -850m, -1,200m).
- **Maritime Operational Assets**:
  - Coast Guard Patrol Cutter (**ICGS Samarth**) live positioning.
  - 5 Nautical Mile Maritime Safety Exclusion Zone.
  - Live animated leak epicenter beacon with real-time radial coordinates.
  - Interactive sector boundaries linked directly to the Asset Inspector.

---

### 🔬 5. Deep Engineering Asset Inspector (`AssetInspectorModal.tsx`)
- **Interactive Deep-Dive**: Clicking any segment in the 3D Digital Twin, 2D Synoptic Schematic, or Grid instantly opens its full engineering specification:
  - **Metallurgy**: API 5L Grade X70 Subsea High-Strength Carbon Steel.
  - **Wall Thickness & OD**: 25.4 mm (1.0 inch) nominal wall, 24-inch outer diameter.
  - **Internal Lining**: 0.4 mm Fusion Bonded Epoxy (FBE).
  - **External Protection**: High-Density Concrete Weight Coating (CWC) with sacrificial Zinc-Aluminum anodes.
  - **Cathodic Protection**: Measured potential (-985 mV vs Ag/AgCl reference electrode, compliant with DNV-RP-B401).
  - **Inline Inspection (ILI)**: Intelligent PIG magnetic flux leakage (MFL) and ultrasonic inspection logs.
  - **Two-Way Virtual Valves**: Inline controls to Isolate or Unisolate hydraulic actuators with instant audio feedback.

