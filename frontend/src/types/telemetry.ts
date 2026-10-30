export type HealthStatus = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export interface SegmentInfo {
  id: number;
  name: string;
  start: number;
  end: number;
  valves: string[];
  location_m?: number;
  location_km?: number;
  percentage_within_segment?: number;
}

export interface NPWLocalization {
  detected: boolean;
  t_inlet: number;
  t_outlet: number;
  delta_t: number;
  location_m: number;
  location_km: number;
  wave_speed: number;
  pipeline_length: number;
  segment: SegmentInfo;
  confidence_percent: number;
  formula_display: string;
}

export interface SegmentHealth {
  id: number;
  name: string;
  pressure_bar: number;
  status: HealthStatus;
  color: string;
  score: number;
  length_km: number;
  range_km: string;
}

export interface AnalyticsData {
  timestamp: number;
  anomaly_score: number;
  health_status: HealthStatus;
  health_label: string;
  health_color: string;
  dp_in_dt: number;
  dp_out_dt: number;
  mass_imbalance: number;
  flow_discrepancy_pct: number;
  p_in_std: number;
  p_out_std: number;
  estimated_spill_rate_m3h: number;
  estimated_spill_rate_bpd: number;
  segments_health: SegmentHealth[];
  requires_isolation: boolean;
}

export interface SimulationStatus {
  running: boolean;
  speed: number;
  leak_active: boolean;
  leak_location_m: number;
  leak_severity: number;
  leak_start_time: number;
  t_arrival_inlet: number;
  t_arrival_outlet: number;
  cumulative_spill_m3: number;
  cumulative_spill_bbl: number;
  isolated_segments: number[];
  mode?: string;
  dataset?: string;
}

export interface AuditEvent {
  id: number;
  timestamp: number;
  severity: 'INFO' | 'ADVISORY' | 'WARNING' | 'CRITICAL';
  category: string;
  message: string;
  details: Record<string, any>;
}

export interface TelemetryPayload {
  timestamp: number;
  p_inlet: number;
  p_outlet: number;
  delta_p: number;
  flow_inlet: number;
  flow_outlet: number;
  flow_diff: number;
  segment_pressures: Record<number, number>;
  valves: Record<string, boolean>;
  valve_open_fraction: Record<string, number>;
  sim_status: SimulationStatus;
  environment: {
    seabed_depth_m: number;
    water_temp_c: number;
    cathodic_potential_mv: number;
    pipeline_length_m: number;
    wave_speed_ms: number;
  };
  analytics: AnalyticsData;
  npw_localization: NPWLocalization | null;
  mode: 'SIMULATION' | 'PLAYBACK';
  dataset_name: string | null;
  recent_events: AuditEvent[];
}

export interface BlindTestReport {
  filename: string;
  total_samples: number;
  duration_seconds: number;
  sampling_frequency_hz: number;
  columns_mapped: {
    timestamp: string;
    inlet_pressure: string;
    outlet_pressure: string;
  };
  leak_detected: boolean;
  localization: NPWLocalization | null;
  pressure_metrics: {
    baseline_p_in: number;
    min_p_in: number;
    max_p_in_drop: number;
    baseline_p_out: number;
    min_p_out: number;
    max_p_out_drop: number;
    min_grad_in_bar_s: number;
    min_grad_out_bar_s: number;
  };
  status: string;
  message: string;
}

export interface DatasetItem {
  name: string;
  path: string;
  size_kb: number;
  is_blind: boolean;
}

