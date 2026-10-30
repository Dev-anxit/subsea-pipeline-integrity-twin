# OPIC-SCADA: National Offshore Pipeline Integrity & Crisis Management Platform
## Master Documentation & Critical Infrastructure Knowledge Base
**Authority:** Directorate General of Hydrocarbons (DGH) / Ministry of Petroleum & Natural Gas  
**Platform:** Real-Time Critical Infrastructure SCADA & Disaster Management System  
**Target Asset:** 10.0 km Deepwater Subsea Trunkline (`IND-KG-D6-TL-04`)

---

## 📚 Table of Contents

| Document | Topic | Description |
|---|---|---|
| [00_PROJECT_OVERVIEW.md](file:///Users/ankityadav/Desktop/Zin/project_details/00_PROJECT_OVERVIEW.md) | **Executive Overview** | Problem statement, national infrastructure goals, value proposition, and key deliverables. |
| [01_MATHEMATICAL_THEORY_NPW.md](file:///Users/ankityadav/Desktop/Zin/project_details/01_MATHEMATICAL_THEORY_NPW.md) | **Mathematical NPW Theory** | Rigorous derivation of the NPW equation $X = (L - C \cdot \Delta t)/2$, boundary proofs, fluid acoustic velocity physics, and hydraulic losses. |
| [02_EDGE_ANALYTICS_ALGORITHMS.md](file:///Users/ankityadav/Desktop/Zin/project_details/02_EDGE_ANALYTICS_ALGORITHMS.md) | **Edge Analytics & Detection** | Signal processing, $dP/dt$ gradient inflection algorithms, mass balance calculations, CUSUM charts, and 4-tier health state machine. |
| [03_SYSTEM_ARCHITECTURE.md](file:///Users/ankityadav/Desktop/Zin/project_details/03_SYSTEM_ARCHITECTURE.md) | **System Architecture** | Backend FastAPI architecture, 20 Hz WebSocket pipeline, frontend React/TypeScript structure, and component data flow diagrams. |
| [04_3D_DIGITAL_TWIN_SPEC.md](file:///Users/ankityadav/Desktop/Zin/project_details/04_3D_DIGITAL_TWIN_SPEC.md) | **3D Digital Twin Specs** | Three.js WebGL scene, bathymetry terrain generation, coordinate mapping, dynamic bubble plume particles, and AUV inspection sub. |
| [05_API_AND_WEBSOCKET_SPECS.md](file:///Users/ankityadav/Desktop/Zin/project_details/05_API_AND_WEBSOCKET_SPECS.md) | **API & WebSocket Specs** | Detailed REST endpoints, JSON payloads, WebSocket schemas, and telemetry message dictionaries. |
| [06_DATASET_AND_BLIND_TESTING_GUIDE.md](file:///Users/ankityadav/Desktop/Zin/project_details/06_DATASET_AND_BLIND_TESTING_GUIDE.md) | **Datasets & Blind Testing** | Structure of benchmark CSVs, zero-hardcoding verification, heuristic column detection, and judge evaluation instructions. |
| [07_HACKATHON_DEMO_SCRIPT.md](file:///Users/ankityadav/Desktop/Zin/project_details/07_HACKATHON_DEMO_SCRIPT.md) | **Demo Pitch & Judge Q&A** | 3-minute & 5-minute live demonstration walk-through, winning pitch structure, and anticipated technical questions & answers. |
| [08_GOVERNMENT_INFRASTRUCTURE_COMMAND.md](file:///Users/ankityadav/Desktop/Zin/project_details/08_GOVERNMENT_INFRASTRUCTURE_COMMAND.md) | **Government Infrastructure Command** | National incident command structure, DEFCON classifications, statutory compliance, Form-4 incident reporting, and hydrographic GIS bathymetry mapping. |

---

## ⚡ Quick System Verification

```bash
# Verify all automated unit & integration tests
source venv/bin/activate
PYTHONPATH=. pytest backend/test_pipeline.py -v

# Run the complete full-stack environment
./start.sh
```

