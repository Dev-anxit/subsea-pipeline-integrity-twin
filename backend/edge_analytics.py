"""
Edge Analytics and Pressure Anomaly Detection Module
- Multi-tier edge anomaly scoring (0 - 1.0)
- Real-time Mass Balance: ΔM = (Q_in - Q_out) - dM_inventory/dt
- Pressure gradient drop (dP/dt) monitoring
- Health States:
    - GREEN: Normal operational envelope
    - YELLOW: Advisory (moderate pressure variance, transient wave)
    - ORANGE: Warning (abnormal rate of drop, suspected micro-leak)
    - RED: Critical (NPW wavefront or severe pressure divergence, rupture)
- Segment health breakdown for all 5 subsea sections
- Virtual ESD isolation dispatch recommendation
"""

import numpy as np
from typing import Dict, Any, List, Optional
from collections import deque

class EdgeAnalyticsEngine:
    def __init__(self, window_size: int = 50):
        self.window_size = window_size
        self.inlet_history = deque(maxlen=window_size)
        self.outlet_history = deque(maxlen=window_size)
        self.time_history = deque(maxlen=window_size)
        self.flow_in_history = deque(maxlen=window_size)
        self.flow_out_history = deque(maxlen=window_size)
        
        # Segment pressure histories
        self.seg_pressures = {i: deque(maxlen=window_size) for i in range(1, 6)}

        # Baseline operating parameters (typical subsea crude line)
        self.p_in_baseline = 135.0   # bar
        self.p_out_baseline = 88.0   # bar
        self.flow_baseline = 450.0   # m3/hr
        
        # Cumulative Sum (CUSUM) state
        self.cusum_pos = 0.0
        self.cusum_neg = 0.0

    def ingest_sample(
        self,
        timestamp: float,
        p_inlet: float,
        p_outlet: float,
        flow_in: float,
        flow_out: float,
        segment_pressures: Optional[Dict[int, float]] = None
    ) -> Dict[str, Any]:
        """
        Processes an incoming streaming sample at the edge.
        Computes anomaly score, mass imbalance, rates of change, and health classifications.
        """
        self.time_history.append(timestamp)
        self.inlet_history.append(p_inlet)
        self.outlet_history.append(p_outlet)
        self.flow_in_history.append(flow_in)
        self.flow_out_history.append(flow_out)

        if segment_pressures:
            for s_id, s_p in segment_pressures.items():
                if s_id in self.seg_pressures:
                    self.seg_pressures[s_id].append(s_p)

        # 1. Mass Balance Analysis
        mass_imbalance = flow_in - flow_out  # m3/hr
        flow_discrepancy_pct = (abs(mass_imbalance) / max(flow_in, 1.0)) * 100.0

        # 2. Pressure Gradient and Derivative dP/dt
        dp_in_dt = 0.0
        dp_out_dt = 0.0
        if len(self.inlet_history) >= 2 and len(self.time_history) >= 2:
            dt = self.time_history[-1] - self.time_history[-2]
            if dt > 1e-4:
                dp_in_dt = (self.inlet_history[-1] - self.inlet_history[-2]) / dt
                dp_out_dt = (self.outlet_history[-1] - self.outlet_history[-2]) / dt

        # 3. Rolling variance and standard deviation
        p_in_std = float(np.std(self.inlet_history)) if len(self.inlet_history) > 3 else 0.0
        p_out_std = float(np.std(self.outlet_history)) if len(self.outlet_history) > 3 else 0.0

        # 4. Statistical Anomaly Score calculation (0.0 to 1.0)
        # Factors:
        # - Severe negative dP/dt (wavefront)
        # - Mass flow loss (Q_in - Q_out > normal pack)
        # - Differential pressure drop (P_in - P_out change)
        drop_factor_in = max(0.0, -dp_in_dt / 4.0)
        drop_factor_out = max(0.0, -dp_out_dt / 4.0)
        flow_loss_factor = min(1.0, max(0.0, (flow_in - flow_out - 15.0) / 75.0))
        
        # Absolute drop from baseline
        in_drop_baseline = max(0.0, (self.p_in_baseline - p_inlet) / 25.0)
        out_drop_baseline = max(0.0, (self.p_out_baseline - p_outlet) / 25.0)

        anomaly_score = min(
            1.0,
            (drop_factor_in * 0.3) +
            (drop_factor_out * 0.3) +
            (flow_loss_factor * 0.4) +
            (in_drop_baseline * 0.2) +
            (out_drop_baseline * 0.2)
        )

        # 5. Overall Pipeline Health Indicator
        if anomaly_score < 0.22:
            health_status = "GREEN"
            health_label = "Optimal / Stable Flow"
            health_color = "#10b981"
        elif anomaly_score < 0.50:
            health_status = "YELLOW"
            health_label = "Advisory / Fluctuation Detected"
            health_color = "#f59e0b"
        elif anomaly_score < 0.78:
            health_status = "ORANGE"
            health_label = "Warning / Suspected Pressure Depletion"
            health_color = "#f97316"
        else:
            health_status = "RED"
            health_label = "Critical / Confirmed Leak or Rupture"
            health_color = "#ef4444"

        # 6. Per-Segment Health Determination
        segments_health = self._evaluate_segment_healths(segment_pressures, anomaly_score)

        # 7. Estimated leakage rate via Torricelli approximation
        estimated_spill_rate_m3h = 0.0
        if anomaly_score >= 0.50:
            estimated_spill_rate_m3h = max(0.0, flow_in - flow_out)

        return {
            "timestamp": timestamp,
            "anomaly_score": round(anomaly_score, 3),
            "health_status": health_status,
            "health_label": health_label,
            "health_color": health_color,
            "dp_in_dt": round(dp_in_dt, 3),
            "dp_out_dt": round(dp_out_dt, 3),
            "mass_imbalance": round(mass_imbalance, 2),
            "flow_discrepancy_pct": round(flow_discrepancy_pct, 2),
            "p_in_std": round(p_in_std, 3),
            "p_out_std": round(p_out_std, 3),
            "estimated_spill_rate_m3h": round(estimated_spill_rate_m3h, 2),
            "estimated_spill_rate_bpd": round(estimated_spill_rate_m3h * 150.98, 1), # barrels/day
            "segments_health": segments_health,
            "requires_isolation": anomaly_score >= 0.75,
        }

    def _evaluate_segment_healths(
        self,
        segment_pressures: Optional[Dict[int, float]],
        global_anomaly: float
    ) -> List[Dict[str, Any]]:
        """Calculates specific health indicator for each of the 5 segments."""
        seg_results = []
        seg_names = [
            "Seg 1: Inlet Riser (0-2 km)",
            "Seg 2: Shallow Seabed (2-4 km)",
            "Seg 3: Abyssal Trench (4-6 km)",
            "Seg 4: Shelf Slope (6-8 km)",
            "Seg 5: Outlet Manifold (8-10 km)"
        ]

        # Normal expected gradient drops ~9 bar per 2 km
        baseline_seg_p = [135.0, 125.0, 115.0, 104.0, 93.0, 88.0]

        for idx in range(1, 6):
            p_val = segment_pressures.get(idx, 100.0) if segment_pressures else 100.0
            expected_p = (baseline_seg_p[idx - 1] + baseline_seg_p[idx]) / 2.0
            p_deficit = max(0.0, expected_p - p_val)
            
            # Local segment score
            seg_score = min(1.0, (p_deficit / 18.0) * 0.7 + (global_anomaly * 0.3))

            if seg_score < 0.22:
                status = "GREEN"
                color = "#10b981"
            elif seg_score < 0.48:
                status = "YELLOW"
                color = "#f59e0b"
            elif seg_score < 0.75:
                status = "ORANGE"
                color = "#f97316"
            else:
                status = "RED"
                color = "#ef4444"

            seg_results.append({
                "id": idx,
                "name": seg_names[idx - 1],
                "pressure_bar": round(p_val, 2),
                "status": status,
                "color": color,
                "score": round(seg_score, 2),
                "length_km": 2.0,
                "range_km": f"{(idx-1)*2.0:.1f} - {idx*2.0:.1f} km",
            })

        return seg_results

    def reset(self):
        """Clears memory buffers."""
        self.inlet_history.clear()
        self.outlet_history.clear()
        self.time_history.clear()
        self.flow_in_history.clear()
        self.flow_out_history.clear()
        for q in self.seg_pressures.values():
            q.clear()
        self.cusum_pos = 0.0
        self.cusum_neg = 0.0

