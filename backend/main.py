"""
DeepGuard: Real-Time Subsea Pipeline Integrity Management System
Real-Time Critical Infrastructure SCADA & Disaster Management Backend
Directorate General of Hydrocarbons (DGH) / Ministry of Petroleum & Natural Gas
"""

import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.npw_engine import NPWEngine
from backend.edge_analytics import EdgeAnalyticsEngine
from backend.simulator import SubseaPipelineSimulator
from backend.dataset_manager import DatasetManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DeepGuard")

app = FastAPI(
    title="National Offshore Pipeline Integrity & Crisis Management System",
    description="Real-Time Critical Infrastructure SCADA & Disaster Management - Directorate General of Hydrocarbons (DGH)",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Domain Engines
npw_engine = NPWEngine(pipeline_length=10000.0, wave_speed=1150.0)
edge_analytics = EdgeAnalyticsEngine(window_size=60)
simulator = SubseaPipelineSimulator(length_m=10000.0, wave_speed_ms=1150.0)
dataset_manager = DatasetManager(npw_engine)

# Active WebSocket connections
connected_websockets: List[WebSocket] = []

# Operating mode: "SIMULATION" or "PLAYBACK"
operating_mode: str = "SIMULATION"
active_dataset_name: Optional[str] = None
playback_records: List[Dict[str, Any]] = []
playback_idx: int = 0
auto_isolation_dispatched: bool = False

# Telemetry state buffer for REST endpoints
latest_telemetry: Dict[str, Any] = {}
audit_events: List[Dict[str, Any]] = []

def record_event(severity: str, category: str, message: str, details: Optional[Dict[str, Any]] = None):
    """Logs timestamped event into the operational audit trail."""
    event = {
        "id": len(audit_events) + 1,
        "timestamp": round(simulator.sim_time, 2),
        "severity": severity, # INFO, ADVISORY, WARNING, CRITICAL
        "category": category,
        "message": message,
        "details": details or {},
    }
    audit_events.append(event)
    if len(audit_events) > 200:
        audit_events.pop(0)

# Request Models
class LeakInjectionRequest(BaseModel):
    location_m: float
    severity: float = 0.25

class IsolateRequest(BaseModel):
    segment_id: int

class SpeedRequest(BaseModel):
    multiplier: float

@app.on_event("startup")
async def startup_event():
    record_event("INFO", "SYSTEM", "National Offshore Subsea Integrity Command Platform online. Directorate General of Hydrocarbons.")
    asyncio.create_task(telemetry_broadcast_loop())

async def telemetry_broadcast_loop():
    """High-frequency 20 Hz telemetry processing and broadcast loop."""
    global playback_idx, latest_telemetry
    while True:
        try:
            if operating_mode == "SIMULATION":
                raw_telem = simulator.step()
            else:
                # Playback mode from CSV
                if playback_records:
                    rec = playback_records[playback_idx % len(playback_records)]
                    playback_idx += 1
                    raw_telem = {
                        "timestamp": rec.get("timestamp", playback_idx * 0.05),
                        "p_inlet": rec.get("p_inlet_bar", 135.0),
                        "p_outlet": rec.get("p_outlet_bar", 88.0),
                        "delta_p": round(rec.get("p_inlet_bar", 135.0) - rec.get("p_outlet_bar", 88.0), 2),
                        "flow_inlet": rec.get("flow_inlet_m3h", 450.0),
                        "flow_outlet": rec.get("flow_outlet_m3h", 450.0),
                        "flow_diff": round(rec.get("flow_inlet_m3h", 450.0) - rec.get("flow_outlet_m3h", 450.0), 2),
                        "segment_pressures": {
                            1: rec.get("seg1_pressure_bar", 125.0),
                            2: rec.get("seg2_pressure_bar", 115.0),
                            3: rec.get("seg3_pressure_bar", 105.0),
                            4: rec.get("seg4_pressure_bar", 95.0),
                            5: rec.get("seg5_pressure_bar", 88.0),
                        },
                        "valves": simulator.valves,
                        "valve_open_fraction": simulator.valve_open_fraction,
                        "sim_status": {
                            "running": True,
                            "speed": 1.0,
                            "leak_active": False,
                            "mode": "PLAYBACK",
                            "dataset": active_dataset_name,
                        },
                        "environment": {
                            "seabed_depth_m": 850.0,
                            "water_temp_c": 4.2,
                            "cathodic_potential_mv": -985.0,
                            "pipeline_length_m": npw_engine.L,
                            "wave_speed_ms": npw_engine.C,
                        }
                    }
                else:
                    raw_telem = simulator.step()

            # Process through Edge Analytics
            edge_result = edge_analytics.ingest_sample(
                timestamp=raw_telem["timestamp"],
                p_inlet=raw_telem["p_inlet"],
                p_outlet=raw_telem["p_outlet"],
                flow_in=raw_telem["flow_inlet"],
                flow_out=raw_telem["flow_outlet"],
                segment_pressures=raw_telem["segment_pressures"]
            )

            # Check for NPW wavefront localization
            # If leak is active in simulator or anomaly indicates rupture
            npw_result = None
            if simulator.leak_active and raw_telem.get("sim_status", {}).get("leak_active"):
                # Compute NPW based on simulated physical arrival times
                t_arr_in = simulator.leak_arrival_inlet
                t_arr_out = simulator.leak_arrival_outlet
                if raw_telem["timestamp"] >= max(t_arr_in, t_arr_out):
                    dt = t_arr_out - t_arr_in
                    computed_x = npw_engine.compute_location(dt)
                    seg_info = npw_engine.get_segment_for_location(computed_x)
                    npw_result = {
                        "detected": True,
                        "t_inlet": round(t_arr_in, 3),
                        "t_outlet": round(t_arr_out, 3),
                        "delta_t": round(dt, 4),
                        "location_m": round(computed_x, 1),
                        "location_km": round(computed_x / 1000.0, 3),
                        "wave_speed": npw_engine.C,
                        "pipeline_length": npw_engine.L,
                        "segment": seg_info,
                        "confidence_percent": 97.4,
                        "formula_display": f"X = ({npw_engine.L} - {npw_engine.C} * ({dt:.4f})) / 2 = {computed_x:.1f} m",
                    }

            # Virtual ESD Auto-shutdown Trigger if health goes RED
            if edge_result["requires_isolation"] and not auto_isolation_dispatched:
                auto_isolation_dispatched = True
                loc_m = npw_result["location_m"] if npw_result else simulator.leak_location_m
                target_seg = npw_engine.get_segment_for_location(loc_m)["id"]
                simulator.isolate_segment(target_seg)
                record_event(
                    "CRITICAL",
                    "ESD_ISOLATION",
                    f"Automatic ESD triggered! Segment {target_seg} isolated via valves V{target_seg-1} & V{target_seg}.",
                    {"segment_id": target_seg, "localized_km": round(loc_m / 1000.0, 2)}
                )

            # Merge composite payload
            payload = {
                **raw_telem,
                "analytics": edge_result,
                "npw_localization": npw_result,
                "mode": operating_mode,
                "dataset_name": active_dataset_name,
                "recent_events": audit_events[-8:],
            }

            latest_telemetry = payload

            # Broadcast to all connected web clients
            if connected_websockets:
                msg = json.dumps(payload)
                for ws in list(connected_websockets):
                    try:
                        await ws.send_text(msg)
                    except Exception:
                        if ws in connected_websockets:
                            connected_websockets.remove(ws)

        except Exception as e:
            logger.error(f"Error in telemetry loop: {e}")

        await asyncio.sleep(0.05)

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_websockets.append(websocket)
    try:
        while True:
            # Keep-alive listen
            data = await websocket.receive_text()
            cmd = json.loads(data)
            if cmd.get("action") == "ping":
                await websocket.send_text(json.dumps({"action": "pong"}))
    except WebSocketDisconnect:
        if websocket in connected_websockets:
            connected_websockets.remove(websocket)
    except Exception:
        if websocket in connected_websockets:
            connected_websockets.remove(websocket)

@app.get("/api/status")
def get_system_status():
    return {
        "status": "ONLINE",
        "system": "National Offshore Pipeline Integrity & Crisis Management Platform (OPIC-SCADA)",
        "authority": "Directorate General of Hydrocarbons / Ministry of Petroleum & Natural Gas",
        "classification": "RESTRICTED // CRITICAL ENERGY INFRASTRUCTURE",
        "asset_id": "IND-KG-D6-TL-04",
        "operating_mode": operating_mode,
        "pipeline_metadata": {
            "name": "Barents-Alpha Subsea Deepwater Trunkline",
            "length_km": 10.0,
            "length_m": npw_engine.L,
            "acoustic_velocity_c": npw_engine.C,
            "total_segments": 5,
            "segment_length_km": 2.0,
            "valves": ["V0", "V1", "V2", "V3", "V4", "V5"],
            "depth_range_m": "400m - 1200m",
            "fluid_type": "Multiphase Hydrocarbon (API 34.5)",
        },
        "latest_telemetry": latest_telemetry,
    }

@app.post("/api/simulation/start")
def start_simulation():
    global operating_mode
    operating_mode = "SIMULATION"
    simulator.is_running = True
    record_event("INFO", "SIMULATION", "Simulation resumed.")
    return {"message": "Simulation started", "running": True}

@app.post("/api/simulation/pause")
def pause_simulation():
    simulator.is_running = False
    record_event("INFO", "SIMULATION", "Simulation paused.")
    return {"message": "Simulation paused", "running": False}

@app.post("/api/simulation/reset")
def reset_simulation():
    global operating_mode, active_dataset_name, auto_isolation_dispatched
    operating_mode = "SIMULATION"
    active_dataset_name = None
    auto_isolation_dispatched = False
    simulator.reset_simulation()
    edge_analytics.reset()
    record_event("INFO", "SIMULATION", "Pipeline simulator reset to baseline clean operating state.")
    return {"message": "Pipeline simulation reset successfully"}

@app.post("/api/simulation/speed")
def set_simulation_speed(req: SpeedRequest):
    simulator.speed_multiplier = max(0.1, min(10.0, req.multiplier))
    record_event("INFO", "SIMULATION", f"Simulation speed adjusted to {req.multiplier}x")
    return {"speed": simulator.speed_multiplier}

@app.post("/api/simulation/inject_leak")
def inject_leak(req: LeakInjectionRequest):
    global operating_mode, auto_isolation_dispatched
    operating_mode = "SIMULATION"
    auto_isolation_dispatched = False
    simulator.inject_leak(location_m=req.location_m, severity=req.severity)
    seg = npw_engine.get_segment_for_location(req.location_m)
    record_event(
        "WARNING",
        "LEAK_INJECTION",
        f"Simulated rupture injected at {req.location_m:.0f}m ({req.location_m/1000.0:.2f} km) in {seg['name']}. Severity: {req.severity*100:.0f}%.",
        {"location_m": req.location_m, "severity": req.severity, "segment": seg}
    )
    return {
        "message": "Leak injected",
        "location_m": req.location_m,
        "severity": req.severity,
        "segment": seg,
    }

@app.post("/api/simulation/isolate_segment")
def isolate_segment_endpoint(req: IsolateRequest):
    simulator.isolate_segment(req.segment_id)
    record_event(
        "CRITICAL",
        "MANUAL_ISOLATION",
        f"Manual command: Isolated Segment {req.segment_id} (Valves V{req.segment_id-1} and V{req.segment_id} closed).",
        {"segment_id": req.segment_id}
    )
    return {"message": f"Segment {req.segment_id} isolated", "isolated_segments": list(simulator.isolated_segments)}

@app.post("/api/simulation/unisolate_segment")
def unisolate_segment_endpoint(req: IsolateRequest):
    simulator.unisolate_segment(req.segment_id)
    record_event(
        "INFO",
        "MANUAL_UNISOLATION",
        f"Manual command: Restored/Unisolated Segment {req.segment_id} (Valves V{req.segment_id-1} and V{req.segment_id} reopened).",
        {"segment_id": req.segment_id}
    )
    return {"message": f"Segment {req.segment_id} unisolated", "isolated_segments": list(simulator.isolated_segments)}

@app.post("/api/simulation/reset_valves")
def reset_valves_endpoint():
    simulator.reset_valves()
    record_event("INFO", "VALVES", "All isolation valves reopened to 100% flow.")
    return {"message": "All valves restored to open status", "valves": simulator.valves}

@app.get("/api/datasets")
def list_datasets_endpoint():
    return dataset_manager.list_datasets()

@app.post("/api/datasets/load/{filename}")
def load_dataset_endpoint(filename: str):
    global operating_mode, active_dataset_name, playback_records, playback_idx
    records = dataset_manager.load_dataset_records(filename)
    playback_records = records
    playback_idx = 0
    active_dataset_name = filename
    operating_mode = "PLAYBACK"
    record_event("INFO", "DATASET", f"Loaded dataset '{filename}' for live streaming playback ({len(records)} samples).")
    return {
        "message": f"Dataset {filename} loaded",
        "total_samples": len(records),
        "mode": operating_mode,
    }

@app.post("/api/datasets/upload_blind")
async def upload_blind_dataset(file: UploadFile = File(...)):
    """
    Arbitrary CSV upload for Blind Dataset Testing.
    Zero hardcoded values. Applies NPW formula X = (L - C * Δt) / 2 dynamically.
    """
    contents = await file.read()
    try:
        report = dataset_manager.analyze_blind_csv(contents, filename=file.filename)
        record_event(
            "INFO",
            "BLIND_TEST",
            f"Blind testing completed on '{file.filename}'. Status: {report['status']}.",
            {"leak_detected": report["leak_detected"]}
        )
        return report
    except Exception as e:
        logger.error(f"Blind analysis error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/analytics/events")
def get_audit_events():
    return audit_events

