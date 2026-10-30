"""
Subsea Pipeline Physics Simulator
- Models 10 km pipeline across 5 segments:
    - Seg 1: 0 - 2,000m (Valves V0, V1)
    - Seg 2: 2,000 - 4,000m (Valves V1, V2)
    - Seg 3: 4,000 - 6,000m (Valves V2, V3)
    - Seg 4: 6,000 - 8,000m (Valves V3, V4)
    - Seg 5: 8,000 - 10,000m (Valves V4, V5)
- Physics:
    - Darcy-Weisbach frictional head loss under steady state.
    - Negative Pressure Wave (NPW) propagation when leak initiates at X:
        Wave reaches inlet at t = t_leak + X / C
        Wave reaches outlet at t = t_leak + (L - X) / C
    - Emergency Shutdown (ESD) isolation valves:
        When closed, isolates hydraulic flow to the affected segment,
        stopping spill escalation.
"""

import time
import math
import random
import numpy as np
from typing import Dict, Any, List, Optional

class SubseaPipelineSimulator:
    def __init__(
        self,
        length_m: float = 10000.0,
        wave_speed_ms: float = 1150.0,
        diameter_m: float = 0.508,  # 20-inch pipeline
        nominal_inlet_p: float = 135.0, # bar
        nominal_outlet_p: float = 88.0, # bar
        nominal_flow_m3h: float = 450.0 # m3/hr
    ):
        self.L = length_m
        self.C = wave_speed_ms
        self.D = diameter_m
        self.base_p_in = nominal_inlet_p
        self.base_p_out = nominal_outlet_p
        self.base_flow = nominal_flow_m3h

        # Simulation clock
        self.sim_time = 0.0
        self.dt = 0.05  # 20 Hz simulation step
        self.is_running = True
        self.speed_multiplier = 1.0

        # Leak State
        self.leak_active = False
        self.leak_location_m = 3450.0 # Default demo location (in Segment 2)
        self.leak_severity = 0.0      # 0.0 to 1.0
        self.leak_start_time = -1.0
        self.leak_arrival_inlet = -1.0
        self.leak_arrival_outlet = -1.0
        self.cumulative_spilled_m3 = 0.0

        # Valve states (True = OPEN, False = CLOSED)
        # V0: Inlet manifold, V1: 2km, V2: 4km, V3: 6km, V4: 8km, V5: Outlet PLEM
        self.valves = {f"V{i}": True for i in range(6)}
        self.valve_transition_time = 2.5 # seconds to fully close
        self.valve_open_fraction = {f"V{i}": 1.0 for i in range(6)}

        # Active isolation segments
        self.isolated_segments = set()

        # Telemetry state
        self.current_p_in = self.base_p_in
        self.current_p_out = self.base_p_out
        self.current_flow_in = self.base_flow
        self.current_flow_out = self.base_flow
        self.current_seg_pressures = {i: 135.0 - (i * 9.4) for i in range(1, 6)}

    def inject_leak(self, location_m: float, severity: float = 0.25):
        """
        Injects a leak at a given distance along the 10 km subsea pipe.
        Computes the theoretical physical wave arrival times at both ends.
        """
        self.leak_location_m = max(100.0, min(self.L - 100.0, float(location_m)))
        self.leak_severity = max(0.01, min(1.0, float(severity)))
        self.leak_active = True
        self.leak_start_time = self.sim_time

        # NPW physics: Arrival at inlet sensor (X / C) and outlet sensor ((L - X) / C)
        time_to_inlet = self.leak_location_m / self.C
        time_to_outlet = (self.L - self.leak_location_m) / self.C

        self.leak_arrival_inlet = self.sim_time + time_to_inlet
        self.leak_arrival_outlet = self.sim_time + time_to_outlet

    def isolate_segment(self, segment_id: int):
        """
        Virtual Emergency Pipeline Isolation:
        Closes upstream and downstream isolation valves for the specified segment.
        e.g., Segment 2 (2km-4km) -> closes V1 and V2.
        """
        if 1 <= segment_id <= 5:
            upstream_v = f"V{segment_id - 1}"
            downstream_v = f"V{segment_id}"
            self.valves[upstream_v] = False
            self.valves[downstream_v] = False
            self.isolated_segments.add(segment_id)

    def unisolate_segment(self, segment_id: int):
        """
        Reopens isolation valves for the specified segment.
        Safely checks if adjacent segments still require shared valves to remain closed.
        """
        if segment_id in self.isolated_segments:
            self.isolated_segments.remove(segment_id)

        upstream_v = f"V{segment_id - 1}"
        downstream_v = f"V{segment_id}"

        # upstream_v is shared between (segment_id - 1) and segment_id
        # downstream_v is shared between segment_id and (segment_id + 1)
        still_needed_upstream = (segment_id - 1) in self.isolated_segments
        still_needed_downstream = (segment_id + 1) in self.isolated_segments

        if not still_needed_upstream:
            self.valves[upstream_v] = True
        if not still_needed_downstream:
            self.valves[downstream_v] = True

    def reset_valves(self):
        """Re-opens all isolation valves and clears isolated segments."""
        for v in self.valves:
            self.valves[v] = True
            self.valve_open_fraction[v] = 1.0
        self.isolated_segments.clear()

    def reset_simulation(self):
        """Resets all simulation parameters back to clean baseline."""
        self.sim_time = 0.0
        self.leak_active = False
        self.leak_severity = 0.0
        self.leak_start_time = -1.0
        self.leak_arrival_inlet = -1.0
        self.leak_arrival_outlet = -1.0
        self.cumulative_spilled_m3 = 0.0
        self.reset_valves()
        self.current_p_in = self.base_p_in
        self.current_p_out = self.base_p_out
        self.current_flow_in = self.base_flow
        self.current_flow_out = self.base_flow
        self.current_seg_pressures = {i: 135.0 - (i * 9.4) for i in range(1, 6)}

    def step(self) -> Dict[str, Any]:
        """
        Advances the pipeline physics by one discrete time step dt.
        Returns high-fidelity telemetry payload.
        """
        if not self.is_running:
            return self._build_telemetry_payload()

        self.sim_time += self.dt * self.speed_multiplier

        # 1. Update Valve open fractions (valve stroke dynamics)
        for v_name, is_open in self.valves.items():
            target = 1.0 if is_open else 0.0
            current = self.valve_open_fraction[v_name]
            rate = self.dt * self.speed_multiplier / self.valve_transition_time
            if current < target:
                self.valve_open_fraction[v_name] = min(target, current + rate)
            elif current > target:
                self.valve_open_fraction[v_name] = max(target, current - rate)

        # 2. Base noise (smooth ocean current and pump pulsation, calm and steady)
        noise_in = math.sin(self.sim_time * 0.6) * 0.04
        noise_out = math.sin(self.sim_time * 0.6 - 0.3) * 0.04

        # 3. Wave propagation dynamics
        leak_drop_in = 0.0
        leak_drop_out = 0.0
        leak_flow_loss = 0.0

        if self.leak_active:
            # Check if negative wave reached inlet
            if self.sim_time >= self.leak_arrival_inlet:
                time_since_arr = self.sim_time - self.leak_arrival_inlet
                # Sharp wavefront rise followed by asymptotic steady drop
                wave_profile = min(1.0, time_since_arr / 0.45)
                max_drop = 16.0 * self.leak_severity
                leak_drop_in = max_drop * wave_profile

            # Check if negative wave reached outlet
            if self.sim_time >= self.leak_arrival_outlet:
                time_since_arr = self.sim_time - self.leak_arrival_outlet
                wave_profile = min(1.0, time_since_arr / 0.45)
                max_drop = 18.0 * self.leak_severity
                leak_drop_out = max_drop * wave_profile

            # Outflow leak discharge rate
            if self.sim_time >= min(self.leak_arrival_inlet, self.leak_arrival_outlet):
                leak_flow_loss = 120.0 * self.leak_severity

        # 4. Impact of Valve Isolation
        # If any valve is shutting, flow drops through the line
        min_valve_open = min(self.valve_open_fraction.values())
        
        # When isolation occurs, leak is choked if adjacent valves are closed
        leak_segment_idx = int(self.leak_location_m // 2000.0) + 1
        leak_segment_idx = min(5, max(1, leak_segment_idx))
        
        is_leak_segment_isolated = (
            self.valve_open_fraction[f"V{leak_segment_idx - 1}"] < 0.1 and
            self.valve_open_fraction[f"V{leak_segment_idx}"] < 0.1
        )

        if is_leak_segment_isolated:
            # Leak discharge decays to zero as trapped pressure bleeds out
            leak_flow_loss *= 0.05
            leak_drop_in *= 0.2
            leak_drop_out *= 0.2

        # 5. Calculate pressures and flows
        p_in = (self.base_p_in - leak_drop_in + noise_in)
        p_out = (self.base_p_out - leak_drop_out + noise_out) * min_valve_open

        flow_noise = math.sin(self.sim_time * 0.4) * 0.2
        flow_in = (self.base_flow + (leak_flow_loss * 0.4)) * min_valve_open + flow_noise
        flow_out = max(0.0, (self.base_flow - (leak_flow_loss * 0.6)) * min_valve_open + flow_noise)

        # Segment intermediate pressures (at 2km, 4km, 6km, 8km, 10km)
        seg_pressures = {}
        for s in range(1, 6):
            s_center_x = (s - 0.5) * 2000.0
            # Distance from leak
            dist_to_leak = abs(s_center_x - self.leak_location_m) if self.leak_active else 99999.0
            leak_proximity_drop = max(0.0, (20.0 * self.leak_severity) / (1.0 + (dist_to_leak / 1200.0))) if self.leak_active else 0.0
            
            # Baseline linear gradient across segments
            nominal_seg_p = self.base_p_in - (s * 9.4)
            seg_p = (nominal_seg_p - leak_proximity_drop + math.sin(self.sim_time * 0.5 + s) * 0.03) * min_valve_open
            seg_pressures[s] = max(1.0, seg_p)

        # Accumulate spilled volume
        if self.leak_active and not is_leak_segment_isolated:
            spill_rate_m3_s = leak_flow_loss / 3600.0
            self.cumulative_spilled_m3 += spill_rate_m3_s * self.dt * self.speed_multiplier

        self.current_p_in = max(1.0, p_in)
        self.current_p_out = max(1.0, p_out)
        self.current_flow_in = max(0.0, flow_in)
        self.current_flow_out = max(0.0, flow_out)
        self.current_seg_pressures = seg_pressures

        return self._build_telemetry_payload()

    def _build_telemetry_payload(self) -> Dict[str, Any]:
        """Constructs unified telemetry message."""
        dp = self.current_p_in - self.current_p_out
        return {
            "timestamp": round(self.sim_time, 2),
            "p_inlet": round(self.current_p_in, 2),
            "p_outlet": round(self.current_p_out, 2),
            "delta_p": round(dp, 2),
            "flow_inlet": round(self.current_flow_in, 2),
            "flow_outlet": round(self.current_flow_out, 2),
            "flow_diff": round(self.current_flow_in - self.current_flow_out, 2),
            "segment_pressures": {k: round(v, 2) for k, v in self.current_seg_pressures.items()},
            "valves": self.valves,
            "valve_open_fraction": {k: round(v, 3) for k, v in self.valve_open_fraction.items()},
            "sim_status": {
                "running": self.is_running,
                "speed": self.speed_multiplier,
                "leak_active": self.leak_active,
                "leak_location_m": self.leak_location_m,
                "leak_severity": self.leak_severity,
                "leak_start_time": self.leak_start_time,
                "t_arrival_inlet": round(self.leak_arrival_inlet, 3),
                "t_arrival_outlet": round(self.leak_arrival_outlet, 3),
                "cumulative_spill_m3": round(self.cumulative_spilled_m3, 2),
                "cumulative_spill_bbl": round(self.cumulative_spilled_m3 * 6.2898, 1),
                "isolated_segments": list(self.isolated_segments),
            },
            "environment": {
                "seabed_depth_m": 850.0,
                "water_temp_c": 4.2,
                "cathodic_potential_mv": -985.0,
                "pipeline_length_m": self.L,
                "wave_speed_ms": self.C,
            }
        }

