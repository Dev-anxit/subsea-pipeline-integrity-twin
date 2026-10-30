import React from 'react';
import { TelemetryPayload } from '../types/telemetry';
import { audioManager } from '../utils/audio';
import { Sparkles, ShieldAlert, CheckCircle2, Sliders, Volume2, RotateCcw } from 'lucide-react';

interface QuickScenarioBarProps {
  telemetry: TelemetryPayload | null;
  onInjectLeak: (loc: number, sev: number) => void;
  onResetSim: () => void;
  onOpenSimControls: () => void;
}

export const QuickScenarioBar: React.FC<QuickScenarioBarProps> = ({
  telemetry,
  onInjectLeak,
  onResetSim,
  onOpenSimControls,
}) => {
  const isLeak = telemetry?.sim_status?.leak_active || Boolean(telemetry?.npw_localization?.detected);
  const loc = telemetry?.npw_localization;
  const isolated = telemetry?.sim_status?.isolated_segments || [];

  // Construct engaging human-friendly situational sentence
  let situationText = '🟢 ALL SYSTEMS STABLE: Trunkline operating in normal envelope (~135 bar inlet, ~88 bar outlet). Edge analytics active. Zero acoustic transients detected.';
  let situationBg = 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300';

  if (isLeak) {
    const locKm = loc ? loc.location_km : ((telemetry?.sim_status?.leak_location_m || 3450) / 1000).toFixed(2);
    const segName = loc ? loc.segment.name : 'Segment 2';
    if (isolated.length > 0) {
      situationText = `🛡️ BREACH CONTAINED: Rupture at ${locKm} km in ${segName} isolated via valves. Spill discharge choked to safety. Click 'Unisolate' to reopen sector.`;
      situationBg = 'bg-blue-950/60 border-blue-500/50 text-blue-200';
    } else {
      situationText = `🔴 CRITICAL RUPTURE IDENTIFIED: Acoustic wave detected at ${locKm} km (${segName}). Negative pressure wave delta Δt = ${loc ? (loc.delta_t * 1000).toFixed(1) : '2696'} ms. ESD isolation commanded.`;
      situationBg = 'bg-red-950/70 border-red-500/70 text-red-200 animate-pulse';
    }
  }

  const testAlertSound = () => {
    audioManager.playBreachAlert();
  };

  return (
    <div className="flex flex-col gap-2 bg-ocean-900/80 backdrop-blur-md p-3 rounded-xl border border-cyan-500/20 shadow-lg">
      {/* Quick Interactive Scenarios Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold">QUICK TEST PRESETS:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={onResetSim}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-ocean-800 hover:bg-emerald-950/80 text-slate-200 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/50 text-xs font-mono transition-all"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Normal Flow</span>
          </button>

          <button
            onClick={() => onInjectLeak(3450, 0.25)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-ocean-800 hover:bg-red-950 text-slate-200 hover:text-red-300 border border-slate-700 hover:border-red-500/60 text-xs font-mono transition-all"
          >
            <ShieldAlert className="w-3 h-3 text-red-400" />
            <span>Rupture (3.4 km)</span>
          </button>

          <button
            onClick={() => onInjectLeak(5200, 0.35)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-ocean-800 hover:bg-orange-950 text-slate-200 hover:text-orange-300 border border-slate-700 hover:border-orange-500/60 text-xs font-mono transition-all"
          >
            <ShieldAlert className="w-3 h-3 text-orange-400" />
            <span>Trench Breach (5.2 km)</span>
          </button>

          <button
            onClick={onOpenSimControls}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-ocean-800 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-xs font-mono transition-all"
          >
            <Sliders className="w-3 h-3 text-cyan-400" />
            <span>Custom Slider...</span>
          </button>

          <button
            onClick={onResetSim}
            title="Reset to baseline"
            className="p-1.5 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Test Sound Button */}
          <button
            onClick={testAlertSound}
            title="Play alert chime sound preview"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-slate-400 hover:text-cyan-300 border border-slate-700 text-xs font-mono transition-colors"
          >
            <Volume2 className="w-3 h-3 text-cyan-400" />
            <span>Test Sound</span>
          </button>
        </div>
      </div>

      {/* Human-Friendly Situational Briefing */}
      <div className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${situationBg}`}>
        <div className="flex items-center justify-between gap-2">
          <span>{situationText}</span>
          <span className="text-[10px] text-slate-400 font-mono shrink-0">
            SIM TIME: {telemetry?.timestamp.toFixed(1) ?? '0.0'}s
          </span>
        </div>
      </div>
    </div>
  );
};
