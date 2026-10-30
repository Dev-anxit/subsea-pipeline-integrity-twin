import React, { useState } from 'react';
import { TelemetryPayload } from '../types/telemetry';
import { Crosshair, Cpu, CheckCircle2, AlertTriangle, ArrowRight, HelpCircle, ChevronDown, ChevronUp, Waves } from 'lucide-react';

interface NpwDiagnosticsCardProps {
  telemetry: TelemetryPayload | null;
}

export const NpwDiagnosticsCard: React.FC<NpwDiagnosticsCardProps> = ({ telemetry }) => {
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const loc = telemetry?.npw_localization;
  const isDetected = Boolean(loc?.detected);

  return (
    <div className="bg-ocean-900/90 rounded-xl border border-cyan-500/20 p-4 shadow-lg flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-slate-100 tracking-wider">
            NPW ACOUSTIC LOCALIZATION ENGINE
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ocean-950 text-cyan-300 border border-cyan-500/30">
            C = 1,150 m/s
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ocean-950 text-cyan-300 border border-cyan-500/30">
            L = 10,000 m
          </span>
        </div>
      </div>

      {/* Primary Mathematical Formula Callout */}
      <div className="bg-ocean-950/80 rounded-lg p-3 border border-cyan-500/30 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">ACOUSTIC NPW WAVEFRONT GOVERNING EQUATION:</span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
            Δt = t_outlet − t_inlet
          </span>
        </div>
        <div className="flex items-center justify-center py-1">
          <div className="font-mono text-xl md:text-2xl font-bold tracking-wider text-cyan-350 drop-shadow-[0_0_12px_rgba(56,245,248,0.4)]">
            X = <span className="text-white">(L − C × Δt)</span> / 2
          </div>
        </div>
        {isDetected && loc ? (
          <div className="text-center font-mono text-xs text-emerald-400 font-semibold bg-emerald-950/40 py-1.5 rounded border border-emerald-500/30">
            {loc.formula_display}
          </div>
        ) : (
          <div className="text-center font-mono text-xs text-slate-500">
            Awaiting pressure transient inflection wavefront...
          </div>
        )}
      </div>

      {/* Visual Step-by-Step Acoustic Timeline Bar */}
      <div className="bg-ocean-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1 text-cyan-300 font-semibold">
            <Waves className="w-3 h-3" /> 4-STEP ACOUSTIC WAVEFRONT PIPELINE:
          </span>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <span>{showExplanation ? 'Hide Explanation' : 'Why this works?'}</span>
            {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* 4 Step Visual Badges */}
        <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center">
          <div className={`p-1.5 rounded border ${isDetected ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200' : 'bg-ocean-900 border-slate-800 text-slate-500'}`}>
            <div className="font-bold">1. Breach</div>
            <div className="text-[9px] text-slate-400">Shock Origin</div>
          </div>
          <div className={`p-1.5 rounded border ${isDetected ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200' : 'bg-ocean-900 border-slate-800 text-slate-500'}`}>
            <div className="font-bold">2. Travel</div>
            <div className="text-[9px] text-slate-400">C = 1150 m/s</div>
          </div>
          <div className={`p-1.5 rounded border ${isDetected ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200' : 'bg-ocean-900 border-slate-800 text-slate-500'}`}>
            <div className="font-bold">3. Arrival</div>
            <div className="text-[9px] text-slate-400">Δt measured</div>
          </div>
          <div className={`p-1.5 rounded border ${isDetected ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200' : 'bg-ocean-900 border-slate-800 text-slate-500'}`}>
            <div className="font-bold">4. Pinpoint</div>
            <div className="text-[9px] text-slate-400">X meters</div>
          </div>
        </div>

        {/* Expandable Explanation */}
        {showExplanation && (
          <div className="p-2.5 rounded bg-ocean-900/90 border border-cyan-500/30 text-[11px] font-mono text-slate-300 space-y-1.5 animate-in fade-in">
            <div className="text-cyan-300 font-bold">Physical Intuition:</div>
            <div className="leading-relaxed">
              When a rupture happens at distance <strong>X</strong>, the sound wave reaches the inlet at <span className="text-white">t₁ = X / C</span> and outlet at <span className="text-white">t₂ = (L - X) / C</span>.
            </div>
            <div className="leading-relaxed">
              Subtracting gives: <span className="text-amber-300 font-bold">Δt = (L - 2X) / C</span>.
              Rearranging: <span className="text-cyan-300 font-bold">C × Δt = L - 2X</span> → <span className="text-emerald-400 font-bold">X = (L - C × Δt) / 2</span>.
            </div>
          </div>
        )}
      </div>

      {/* Detection Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-ocean-950/60 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400">INLET ARRIVAL (t₁)</div>
          <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">
            {isDetected && loc ? `${loc.t_inlet.toFixed(3)} s` : '--'}
          </div>
        </div>

        <div className="bg-ocean-950/60 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400">OUTLET ARRIVAL (t₂)</div>
          <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">
            {isDetected && loc ? `${loc.t_outlet.toFixed(3)} s` : '--'}
          </div>
        </div>

        <div className="bg-ocean-950/60 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400">TIME DELTA (Δt)</div>
          <div className="text-sm font-mono font-bold text-cyan-300 mt-0.5">
            {isDetected && loc ? `${(loc.delta_t * 1000).toFixed(1)} ms` : '--'}
          </div>
        </div>

        <div className="bg-ocean-950/60 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400">LOCALIZATION CONFIDENCE</div>
          <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
            {isDetected && loc ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {loc.confidence_percent.toFixed(1)}%
              </>
            ) : (
              'STANDBY'
            )}
          </div>
        </div>
      </div>

      {/* Localized Rupture Pinpoint Result Banner */}
      {isDetected && loc ? (
        <div className="bg-gradient-to-r from-red-950/70 via-ocean-950 to-red-950/70 rounded-lg p-3 border border-red-500/50 flex flex-col md:flex-row items-center justify-between gap-3 shadow-glow-red animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/30 flex items-center justify-center text-red-400 border border-red-500 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-red-200">
                CRITICAL BREACH PINPOINTED: {loc.location_m.toFixed(1)} METERS ({loc.location_km.toFixed(3)} KM)
              </div>
              <div className="text-[11px] font-mono text-slate-300">
                Sector Attribution: <span className="text-red-400 font-semibold">{loc.segment.name}</span> • Valves [
                {loc.segment.valves.join(' & ')}]
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-red-900/60 text-red-200 border border-red-500/40 whitespace-nowrap">
              DISPATCH ESD AUTO-ISOLATION
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-ocean-950/40 rounded-lg p-2.5 border border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>NPW Wavefront Sensor Pipeline Monitoring Active</span>
          </div>
          <span className="text-emerald-400 font-semibold">ZERO DETECTED ANOMALIES</span>
        </div>
      )}
    </div>
  );
};
