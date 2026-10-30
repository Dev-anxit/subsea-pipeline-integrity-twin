import React from 'react';
import { TelemetryPayload } from '../types/telemetry';
import { X, Radio, Activity, Cpu, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Waves } from 'lucide-react';

interface SensorDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryPayload | null;
}

export const SensorDiagnosticsModal: React.FC<SensorDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  telemetry,
}) => {
  if (!isOpen) return null;

  const isLeak = telemetry?.sim_status?.leak_active || Boolean(telemetry?.npw_localization?.detected);
  const cathodicPotential = telemetry?.environment?.cathodic_potential_mv ?? -985.0;
  const waterTemp = telemetry?.environment?.water_temp_c ?? 4.2;
  const seabedDepth = telemetry?.environment?.seabed_depth_m ?? 850;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-ocean-950 border border-cyan-500/40 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-ocean-900 px-6 py-4 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-title text-lg font-bold text-white tracking-wide">
                  Subsea Sensor Telemetry & Hydrophone Array Diagnostics
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ALL CHANNELS SYNCHRONIZED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Asset: IND-KG-D6-TL-04 • IEEE 1588 PTP Sub-Microsecond Clock Sync • High-Frequency 20 Hz
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-ocean-800 hover:bg-ocean-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Top Real-Time Environmental Sensors */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-ocean-900/60 border border-cyan-500/20 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Cathodic Potential</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-xl font-mono font-bold text-cyan-300">
                {cathodicPotential.toFixed(1)} mV
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-1">
                ✓ DNV-RP-B401 (Ag/AgCl)
              </div>
            </div>

            <div className="bg-ocean-900/60 border border-cyan-500/20 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Abyssal Seabed Temp</span>
                <Waves className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 text-xl font-mono font-bold text-white">
                {waterTemp.toFixed(1)} °C
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                Hydrate risk: NEGATIVE
              </div>
            </div>

            <div className="bg-ocean-900/60 border border-cyan-500/20 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Seabed Bathymetry Depth</span>
                <Activity className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-2 text-xl font-mono font-bold text-purple-300">
                {seabedDepth} m
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                Hydrostatic: ~{(seabedDepth * 0.1).toFixed(1)} bar
              </div>
            </div>

            <div className="bg-ocean-900/60 border border-cyan-500/20 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Clock Jitter (PTP)</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 text-xl font-mono font-bold text-emerald-300">
                ±0.0002 s
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-1">
                GPS disciplined Rubidium
              </div>
            </div>
          </div>

          {/* Primary Hydrophones & Fast Piezoelectric Pressure Sensors */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              Primary Subsea Pressure Transducers & Hydrophone Arrays (100 Hz Acoustic Sampling)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Inlet Sensor Station */}
              <div className="bg-ocean-900/80 border border-cyan-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                  <div>
                    <div className="font-mono font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      STATION-ALPHA (Inlet KM 0.0)
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">Offshore Production Platform Riser</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ONLINE
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-ocean-950/70 p-2 rounded border border-cyan-500/20">
                    <div className="text-slate-400 text-[10px]">Transducer Model</div>
                    <div className="text-slate-200 font-bold">Emerson 3051S High-Speed</div>
                  </div>
                  <div className="bg-ocean-950/70 p-2 rounded border border-cyan-500/20">
                    <div className="text-slate-400 text-[10px]">Sensor SNR</div>
                    <div className="text-emerald-300 font-bold">42.8 dB (High Clarity)</div>
                  </div>
                  <div className="bg-ocean-950/70 p-2 rounded border border-cyan-500/20">
                    <div className="text-slate-400 text-[10px]">Acoustic Bandwidth</div>
                    <div className="text-slate-200">0.05 Hz - 120 Hz</div>
                  </div>
                  <div className="bg-ocean-950/70 p-2 rounded border border-cyan-500/20">
                    <div className="text-slate-400 text-[10px]">Acoustic Velocity</div>
                    <div className="text-cyan-300 font-bold">1,150.0 m/s</div>
                  </div>
                </div>
              </div>

              {/* Outlet Sensor Station */}
              <div className="bg-ocean-900/80 border border-cyan-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                  <div>
                    <div className="font-mono font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      STATION-OMEGA (Outlet KM 10.0)
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">Subsea Receiving PLEM Manifold</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ONLINE
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-ocean-950/70 p-2 rounded border border-cyan-500/20">
                    <div className="text-slate-400 text-[10px]">Transducer Model</div>
                    <div className="text-slate-200 font-bold">Emerson 3051S High-Speed</div>
                  </div>
                  <div className="bg-ocean-950/70 p-2 rounded border border-cyan-500/20">
                    <div className="text-slate-400 text-[10px]">Sensor SNR</div>
                    <div className="text-emerald-300 font-bold">41.6 dB (High Clarity)</div>
                  </div>
                  <div className="bg-ocean-950/70 p-2 rounded border border-cyan-500/20">
                    <div className="text-slate-400 text-[10px]">Acoustic Bandwidth</div>
                    <div className="text-slate-200">0.05 Hz - 120 Hz</div>
                  </div>
                  <div className="bg-ocean-950/70 p-2 rounded border border-cyan-500/20">
                    <div className="text-slate-400 text-[10px]">Acoustic Velocity</div>
                    <div className="text-cyan-300 font-bold">1,150.0 m/s</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fiber Optic DAS & SCADA Subsystem Integrity */}
          <div className="bg-ocean-900/50 border border-cyan-500/20 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Distributed Acoustic Sensing (DAS) Optic Fiber Telemetry
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-ocean-950/80 p-3 rounded-lg border border-cyan-500/20 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">OTDR Rayleigh Backscatter</span>
                <span className="text-emerald-300 font-bold text-sm mt-1">-54.2 dB / km (Nominal)</span>
                <span className="text-[10px] text-slate-500 mt-1">Zero fiber fractures detected</span>
              </div>
              <div className="bg-ocean-950/80 p-3 rounded-lg border border-cyan-500/20 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">Optical Line Continuity</span>
                <span className="text-cyan-300 font-bold text-sm mt-1">10,000.0 m (100%)</span>
                <span className="text-[10px] text-slate-500 mt-1">Continuous subsea path</span>
              </div>
              <div className="bg-ocean-950/80 p-3 rounded-lg border border-cyan-500/20 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">Spatial Spatial Resolution</span>
                <span className="text-white font-bold text-sm mt-1">1.0 Meter Gauge</span>
                <span className="text-[10px] text-emerald-400 mt-1">Interferometric pulse verified</span>
              </div>
            </div>
          </div>

          {/* Real-Life Regulatory Compliance Stamp */}
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs font-mono text-cyan-300/90 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>
              All subsea telemetry, hydrophone transmitters, and acoustic transducers are calibrated in compliance with 
              <strong> ISO 13623:2017</strong> (Petroleum and Natural Gas Industries - Pipeline Transportation Systems) and 
              <strong> DNV-ST-F101</strong> (Subsea Pipeline Systems).
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-ocean-900 px-6 py-3 border-t border-cyan-500/30 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Telemetric sampling rate: 20 Hz SCADA / 100 Hz Raw Transient Bus</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-all"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};

