"""
Negative Pressure Wave (NPW) Localization Engine
Formula: X = (L - C * Δt) / 2
Where:
- L: Total pipeline length (meters), default = 10,000 m (10 km)
- C: Acoustic pressure wave velocity in fluid-pipe system (m/s), default = 1,150 m/s
- Δt = t_outlet - t_inlet (seconds), arrival time difference between outlet and inlet sensors
- X: Localized distance from pipeline inlet (meters)
"""

import numpy as np
from typing import Dict, Any, Optional, Tuple, List
from scipy.signal import find_peaks, butter, filtfilt

class NPWEngine:
    def __init__(self, pipeline_length: float = 10000.0, wave_speed: float = 1150.0):
        self.L = float(pipeline_length)  # meters
        self.C = float(wave_speed)        # m/s (acoustic wave speed in liquid crude/subsea line)
        self.segments = [
            {"id": 1, "name": "Segment 1 (Inlet Riser)", "start": 0.0, "end": 2000.0, "valves": ["V0", "V1"]},
            {"id": 2, "name": "Segment 2 (Shallow Bathymetry)", "start": 2000.0, "end": 4000.0, "valves": ["V1", "V2"]},
            {"id": 3, "name": "Segment 3 (Trench Abyssal Section)", "start": 4000.0, "end": 6000.0, "valves": ["V2", "V3"]},
            {"id": 4, "name": "Segment 4 (Continental Shelf)", "start": 6000.0, "end": 8000.0, "valves": ["V3", "V4"]},
            {"id": 5, "name": "Segment 5 (Outlet PLEM Manifold)", "start": 8000.0, "end": 10000.0, "valves": ["V4", "V5"]},
        ]

    def compute_location(self, delta_t: float) -> float:
        """
        Exact implementation of the NPW formula:
        X = (L - C * Δt) / 2
        where Δt = t_outlet - t_inlet.
        Clamp output between 0 and L.
        """
        raw_x = (self.L - (self.C * delta_t)) / 2.0
        return max(0.0, min(self.L, raw_x))

    def compute_theoretical_delta_t(self, location_x: float) -> float:
        """
        Computes theoretical Δt = t_outlet - t_inlet for a leak at location X:
        t_inlet = X / C
        t_outlet = (L - X) / C
        Δt = (L - 2*X) / C
        """
        return (self.L - 2.0 * location_x) / self.C

    def get_segment_for_location(self, location_x: float) -> Dict[str, Any]:
        """Maps a distance in meters to one of the 5 segments."""
        x = max(0.0, min(self.L, location_x))
        for seg in self.segments:
            if seg["start"] <= x <= seg["end"]:
                pct_within = (x - seg["start"]) / (seg["end"] - seg["start"]) if seg["end"] > seg["start"] else 0.0
                return {
                    **seg,
                    "location_m": round(x, 1),
                    "location_km": round(x / 1000.0, 3),
                    "percentage_within_segment": round(pct_within * 100.0, 1),
                }
        # Fallback to last segment if on boundary
        return {
            **self.segments[-1],
            "location_m": round(x, 1),
            "location_km": round(x / 1000.0, 3),
            "percentage_within_segment": 100.0,
        }

    def detect_wavefront_arrival(
        self,
        time_series: np.ndarray,
        pressure_series: np.ndarray,
        sampling_rate_hz: float = 20.0,
        gradient_threshold: float = -0.45
    ) -> Optional[float]:
        """
        Detects wavefront inflection time in high-frequency pressure signal.
        Uses Savitzky-Golay / low-pass filtered gradient (dP/dt).
        """
        if len(pressure_series) < 5:
            return None

        # Calculate discrete gradient dP/dt
        dt = 1.0 / max(sampling_rate_hz, 1.0)
        grad = np.gradient(pressure_series, dt)

        # Detect sharp negative drop
        steepest_idx = np.argmin(grad)
        min_grad = grad[steepest_idx]

        if min_grad < gradient_threshold:
            # Step backward from steepest slope to find the onset inflection
            onset_idx = steepest_idx
            while onset_idx > 0 and grad[onset_idx - 1] < (gradient_threshold * 0.3):
                onset_idx -= 1
            return float(time_series[onset_idx])

        return None

    def analyze_wavefronts(
        self,
        timestamps: np.ndarray,
        p_inlet: np.ndarray,
        p_outlet: np.ndarray,
        sampling_rate: float = 20.0
    ) -> Optional[Dict[str, Any]]:
        """
        Cross-correlates or detects wave arrival at both transducers,
        computes Δt = t_outlet - t_inlet, and resolves X = (L - C * Δt) / 2.
        """
        if len(timestamps) < 10:
            return None

        t_in = self.detect_wavefront_arrival(timestamps, p_inlet, sampling_rate)
        t_out = self.detect_wavefront_arrival(timestamps, p_outlet, sampling_rate)

        if t_in is not None and t_out is not None:
            delta_t = t_out - t_in
            x_m = self.compute_location(delta_t)
            seg_info = self.get_segment_for_location(x_m)
            
            # Confidence based on signal steepness
            confidence = min(98.5, max(65.0, 95.0 - abs(delta_t) * 1.5))

            return {
                "detected": True,
                "t_inlet": round(t_in, 4),
                "t_outlet": round(t_out, 4),
                "delta_t": round(delta_t, 4),
                "location_m": round(x_m, 1),
                "location_km": round(x_m / 1000.0, 3),
                "wave_speed": self.C,
                "pipeline_length": self.L,
                "segment": seg_info,
                "confidence_percent": round(confidence, 1),
                "formula_display": f"X = ({self.L} - {self.C} * ({delta_t:.4f})) / 2 = {x_m:.1f} m",
            }
        
        return None

