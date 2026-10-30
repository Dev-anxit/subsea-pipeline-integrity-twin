# Module 05: API Specifications & WebSocket Protocol

## 1. Base URLs
- **REST Endpoints:** `http://localhost:8000/api`
- **Interactive Swagger Documentation:** `http://localhost:8000/docs`
- **WebSocket Telemetry Stream:** `ws://localhost:8000/ws/telemetry`

---

## 2. WebSocket Real-Time Telemetry Specification

### Protocol & Frequency
- Transports unified telemetry payload at **20 Hz** ($50\text{ ms}$ interval).
- Clients connect to `ws://localhost:8000/ws/telemetry`.
- Client heartbeat: `{ "action": "ping" }` $\to$ Server responds `{ "action": "pong" }`.

### Sample Telemetry Message Frame (JSON)
```json
{
  "timestamp": 42.15,
  "p_inlet": 118.42,
  "p_outlet": 71.85,
  "delta_p": 46.57,
  "flow_inlet": 482.10,
  "flow_outlet": 361.40,
  "flow_diff": 120.70,
  "segment_pressures": {
    "1": 112.50,
    "2": 96.20,
    "3": 88.40,
    "4": 80.10,
    "5": 71.85
  },
  "valves": {
    "V0": true,
    "V1": false,
    "V2": false,
    "V3": true,
    "V4": true,
    "V5": true
  },
  "valve_open_fraction": {
    "V0": 1.0,
    "V1": 0.0,
    "V2": 0.0,
    "V3": 1.0,
    "V4": 1.0,
    "V5": 1.0
  },
  "sim_status": {
    "running": true,
    "speed": 1.0,
    "leak_active": true,
    "leak_location_m": 3450.0,
    "leak_severity": 0.25,
    "leak_start_time": 25.0,
    "t_arrival_inlet": 28.0,
    "t_arrival_outlet": 30.696,
    "cumulative_spill_m3": 14.8,
    "cumulative_spill_bbl": 93.1,
    "isolated_segments": [2]
  },
  "environment": {
    "seabed_depth_m": 850.0,
    "water_temp_c": 4.2,
    "cathodic_potential_mv": -985.0,
    "pipeline_length_m": 10000.0,
    "wave_speed_ms": 1150.0
  },
  "analytics": {
    "timestamp": 42.15,
    "anomaly_score": 0.88,
    "health_status": "RED",
    "health_label": "Critical / Confirmed Leak or Rupture",
    "health_color": "#ef4444",
    "dp_in_dt": -0.85,
    "dp_out_dt": -0.92,
    "mass_imbalance": 120.70,
    "flow_discrepancy_pct": 25.04,
    "p_in_std": 0.42,
    "p_out_std": 0.48,
    "estimated_spill_rate_m3h": 120.70,
    "estimated_spill_rate_bpd": 18223.3,
    "requires_isolation": true,
    "segments_health": [
      { "id": 1, "name": "Seg 1: Inlet Riser (0-2 km)", "pressure_bar": 112.5, "status": "YELLOW", "color": "#f59e0b", "score": 0.42, "length_km": 2.0, "range_km": "0.0 - 2.0 km" },
      { "id": 2, "name": "Seg 2: Shallow Seabed (2-4 km)", "pressure_bar": 96.2, "status": "RED", "color": "#ef4444", "score": 0.94, "length_km": 2.0, "range_km": "2.0 - 4.0 km" },
      { "id": 3, "name": "Seg 3: Abyssal Trench (4-6 km)", "pressure_bar": 88.4, "status": "ORANGE", "color": "#f97316", "score": 0.65, "length_km": 2.0, "range_km": "4.0 - 6.0 km" },
      { "id": 4, "name": "Seg 4: Shelf Slope (6-8 km)", "pressure_bar": 80.1, "status": "YELLOW", "color": "#f59e0b", "score": 0.38, "length_km": 2.0, "range_km": "6.0 - 8.0 km" },
      { "id": 5, "name": "Seg 5: Outlet Manifold (8-10 km)", "pressure_bar": 71.85, "status": "YELLOW", "color": "#f59e0b", "score": 0.35, "length_km": 2.0, "range_km": "8.0 - 10.0 km" }
    ]
  },
  "npw_localization": {
    "detected": true,
    "t_inlet": 28.0,
    "t_outlet": 30.696,
    "delta_t": 2.696,
    "location_m": 3450.0,
    "location_km": 3.45,
    "wave_speed": 1150.0,
    "pipeline_length": 10000.0,
    "segment": {
      "id": 2,
      "name": "Segment 2 (Shallow Bathymetry)",
      "start": 2000.0,
      "end": 4000.0,
      "valves": ["V1", "V2"],
      "location_m": 3450.0,
      "location_km": 3.45,
      "percentage_within_segment": 72.5
    },
    "confidence_percent": 97.4,
    "formula_display": "X = (10000.0 - 1150.0 * (2.6960)) / 2 = 3450.0 m"
  },
  "mode": "SIMULATION",
  "dataset_name": null,
  "recent_events": [
    {
      "id": 1,
      "timestamp": 25.0,
      "severity": "CRITICAL",
      "category": "ESD_ISOLATION",
      "message": "Automatic ESD triggered! Segment 2 isolated via valves V1 & V2."
    }
  ]
}
```

---

## 3. REST API Endpoints

### System Information
- `GET /api/status`
  - Returns system state, team info, operating mode, and pipeline metadata.

### Simulation Controls
- `POST /api/simulation/start`
  - Resumes flow physics. Response: `{"message": "Simulation started", "running": true}`
- `POST /api/simulation/pause`
  - Pauses flow physics. Response: `{"message": "Simulation paused", "running": false}`
- `POST /api/simulation/reset`
  - Resets all pipeline states, pressures, and volumes back to clean baseline.
- `POST /api/simulation/speed`
  - Payload: `{"multiplier": 2.0}`
  - Adjusts simulation rate between $0.1\text{x}$ and $10.0\text{x}$.
- `POST /api/simulation/inject_leak`
  - Payload:
    ```json
    {
      "location_m": 3450.0,
      "severity": 0.25
    }
    ```
- `POST /api/simulation/isolate_segment`
  - Payload: `{"segment_id": 2}`
  - Closes upstream valve `V1` and downstream valve `V2`.
- `POST /api/simulation/unisolate_segment`
  - Payload: `{"segment_id": 2}`
  - Safely reopens isolation valves for Segment 2 and restores hydraulic flow.
- `POST /api/simulation/reset_valves`
  - Reopens all isolation valves `V0` through `V5`.

### Datasets & Blind Evaluation
- `GET /api/datasets`
  - Lists available benchmark CSV datasets.
- `POST /api/datasets/load/{filename}`
  - Sets operating mode to `PLAYBACK` and streams rows sequentially.
- `POST /api/datasets/upload_blind`
  - Multipart form upload accepting arbitrary CSV files.
  - Dynamically detects columns, processes time series, and outputs localization report.
- `GET /api/analytics/events`
  - Returns historical chronological audit trail events.

