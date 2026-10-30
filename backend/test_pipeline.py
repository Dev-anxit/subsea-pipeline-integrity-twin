"""
Automated Unit and Integration Tests for Subsea Pipeline Integrity Management
"""

import pytest
import numpy as np
from backend.npw_engine import NPWEngine
from backend.edge_analytics import EdgeAnalyticsEngine
from backend.simulator import SubseaPipelineSimulator
from backend.dataset_manager import DatasetManager

def test_npw_mathematical_derivation():
    """Verify NPW equation X = (L - C * Δt) / 2 under all boundary conditions."""
    L = 10000.0
    C = 1150.0
    engine = NPWEngine(pipeline_length=L, wave_speed=C)

    # 1. Midpoint test: X = 5,000m -> t_in = t_out -> Δt = 0
    x_mid = engine.compute_location(delta_t=0.0)
    assert pytest.approx(x_mid, 0.1) == 5000.0
    assert engine.get_segment_for_location(x_mid)["id"] == 3

    # 2. Inlet test: X = 0m -> t_in = 0, t_out = L/C -> Δt = L/C
    dt_inlet = L / C
    x_inlet = engine.compute_location(delta_t=dt_inlet)
    assert pytest.approx(x_inlet, 0.1) == 0.0
    assert engine.get_segment_for_location(x_inlet)["id"] == 1

    # 3. Outlet test: X = 10,000m -> t_in = L/C, t_out = 0 -> Δt = -L/C
    dt_outlet = -L / C
    x_outlet = engine.compute_location(delta_t=dt_outlet)
    assert pytest.approx(x_outlet, 0.1) == 10000.0
    assert engine.get_segment_for_location(x_outlet)["id"] == 5

    # 4. Arbitrary coordinate: X = 3,400m
    expected_x = 3400.0
    dt_3400 = engine.compute_theoretical_delta_t(expected_x)
    assert pytest.approx(dt_3400, 1e-4) == (10000.0 - 2 * 3400.0) / 1150.0
    calc_x = engine.compute_location(delta_t=dt_3400)
    assert pytest.approx(calc_x, 0.1) == expected_x
    assert engine.get_segment_for_location(calc_x)["id"] == 2

def test_edge_analytics_health_states():
    """Verify dynamic health state assignment (GREEN, YELLOW, ORANGE, RED)."""
    analytics = EdgeAnalyticsEngine(window_size=30)

    # Steady state ingest -> GREEN
    for t in range(10):
        res = analytics.ingest_sample(
            timestamp=float(t),
            p_inlet=135.0,
            p_outlet=88.0,
            flow_in=450.0,
            flow_out=450.0,
            segment_pressures={1: 125.0, 2: 115.0, 3: 105.0, 4: 95.0, 5: 88.0}
        )
    assert res["health_status"] == "GREEN"
    assert res["anomaly_score"] < 0.25

    # Sudden severe drop simulating rupture -> RED
    res_rupture = analytics.ingest_sample(
        timestamp=11.0,
        p_inlet=112.0,  # 23 bar drop
        p_outlet=65.0,  # 23 bar drop
        flow_in=520.0,
        flow_out=380.0,
        segment_pressures={1: 102.0, 2: 85.0, 3: 75.0, 4: 70.0, 5: 65.0}
    )
    assert res_rupture["health_status"] in ["ORANGE", "RED"]
    assert res_rupture["requires_isolation"] is True

def test_simulator_and_isolation():
    """Verify simulator physics and virtual ESD isolation mechanism."""
    sim = SubseaPipelineSimulator(length_m=10000.0, wave_speed_ms=1150.0)
    sim.dt = 0.1

    # Run for 2 seconds normal
    for _ in range(20):
        telem = sim.step()
    assert telem["p_inlet"] > 130.0
    assert telem["p_outlet"] > 80.0
    assert not sim.leak_active

    # Inject leak at 4,500m
    sim.inject_leak(location_m=4500.0, severity=0.3)
    assert sim.leak_active
    assert sim.leak_location_m == 4500.0

    # Step past arrival times
    for _ in range(100):
        telem = sim.step()

    # Isolate segment 3 (valves V2 and V3)
    sim.isolate_segment(3)
    assert 3 in sim.isolated_segments
    assert sim.valves["V2"] is False
    assert sim.valves["V3"] is False

    # Step further and verify valves close and flow drops
    for _ in range(50):
        telem = sim.step()
    assert sim.valve_open_fraction["V2"] < 0.1

    # Unisolate segment 3 (reopens valves V2 and V3)
    sim.unisolate_segment(3)
    assert 3 not in sim.isolated_segments
    assert sim.valves["V2"] is True
    assert sim.valves["V3"] is True

    # Step and verify valves reopen
    for _ in range(50):
        telem = sim.step()
    assert sim.valve_open_fraction["V2"] > 0.9

def test_blind_csv_evaluation():
    """Verify arbitrary CSV upload blind detection without hardcoding."""
    engine = NPWEngine(pipeline_length=10000.0, wave_speed=1150.0)
    mgr = DatasetManager(engine)

    # Load pre-packaged blind benchmark
    datasets = mgr.list_datasets()
    assert len(datasets) >= 4

    blind_file = [d for d in datasets if "blind" in d["name"]][0]
    with open(blind_file["path"], "rb") as f:
        file_bytes = f.read()

    report = mgr.analyze_blind_csv(file_bytes, filename=blind_file["name"])
    assert report["leak_detected"] is True
    assert report["localization"] is not None
    # Blind leak was placed around 6150m (Segment 4)
    detected_km = report["localization"]["location_km"]
    assert 5.5 <= detected_km <= 6.8
    assert report["status"] == "LEAK_IDENTIFIED"

