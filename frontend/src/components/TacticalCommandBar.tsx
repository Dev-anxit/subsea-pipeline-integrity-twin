import React, { useState } from 'react';
import { TelemetryPayload } from '../types/telemetry';
import { audioManager } from '../utils/audio';
import {
  ShieldAlert,
  RotateCcw,
  AlertTriangle,
  Flame,
  Sliders,
  Crosshair,
  Play,
  X,
} from 'lucide-react';

interface TacticalCommandBarProps {
  telemetry: TelemetryPayload | null;
  onInjectLeak: (loc: number, sev: number) => void;
  onResetSim: () => void;
  onOpenSimControls: () => void;
}

export const TacticalCommandBar: React.FC<TacticalCommandBarProps> = ({
  telemetry,
  onInjectLeak,
  onResetSim,
  onOpenSimControls,
}) => {
  const [showCustomSlider, setShowCustomSlider] = useState<boolean>(false);
  const [customKm, setCustomKm] = useState<number>(3.5);
  const [customSeverity, setCustomSeverity] = useState<number>(30);

  const isLeak = telemetry?.sim_status?.leak_active || Boolean(telemetry?.npw_localization?.detected);
  const loc = telemetry?.npw_localization;
  const isolated = telemetry?.sim_status?.isolated_segments || [];

  const handleQuickDrill = (locM: number, sev: number) => {
    audioManager.playClickSound();
    onInjectLeak(locM, sev);
  };

  const handleCustomLeak = () => {
    audioManager.playClickSound();
    onInjectLeak(customKm * 1000.0, customSeverity / 100.0);
    setShowCustomSlider(false);
  };

  const handleReset = () => {
    audioManager.playSonarPing();
    onResetSim();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 shadow-md backdrop-blur-md flex flex-wrap items-center justify-between gap-3 transition-all">
        {/* Left: Operational Status Indicator & Live Summary */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isLeak ? (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"></span>
              </span>
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(16,185,129,0.7)]"></span>
            )}
            <span className="text-xs font-mono font-bold tracking-wider text-slate-200">
              {isLeak ? 'LEAK DETECTED!' : 'STATUS: NORMAL & SAFE'}
            </span>
          </div>

          <span className="hidden md:inline-block text-slate-600">|</span>

          {/* Dynamic Context Summary in plain words */}
          <div className="text-xs font-mono text-slate-400 hidden lg:flex items-center gap-2">
            {isLeak && loc ? (
              <span className="text-rose-300 font-semibold flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Leak found at KM {loc.location_km} ({loc.segment.name}) • Delay: {loc.delta_t.toFixed(3)}s
              </span>
            ) : isolated.length > 0 ? (
              <span className="text-amber-300 font-medium">
                Closed Sections: [{isolated.map((s) => `S${s}`).join(', ')}] • Leak stopped
              </span>
            ) : (
              <span>Oil and gas flowing smoothly • 135 bar in / 88 bar out • No leaks</span>
            )}
          </div>
        </div>

        {/* Right: Clean 1-Click Simulation Drills & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline mr-1">Test Leaks:</span>

          {/* Drill 1: Abyssal Fracture */}
          <button
            onClick={() => handleQuickDrill(5200, 0.35)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/70 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/50 text-[11px] font-mono transition-all flex items-center gap-1 shadow-sm active:scale-95"
            title="Test a leak at KM 5.2 (deep water section)"
          >
            <Flame className="w-3 h-3 text-rose-400" />
            <span>Deep Leak (5.2km)</span>
          </button>

          {/* Drill 2: Riser Breach */}
          <button
            onClick={() => handleQuickDrill(1200, 0.45)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-orange-950/70 text-slate-300 hover:text-orange-200 border border-slate-700 hover:border-orange-500/50 text-[11px] font-mono transition-all hidden sm:flex items-center gap-1 shadow-sm active:scale-95"
            title="Test a leak at KM 1.2 (near start platform)"
          >
            <Flame className="w-3 h-3 text-orange-400" />
            <span>Start Leak (1.2km)</span>
          </button>

          {/* Drill 3: Micro Pin-Leak */}
          <button
            onClick={() => handleQuickDrill(7100, 0.12)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-950/70 text-slate-300 hover:text-amber-200 border border-slate-700 hover:border-amber-500/50 text-[11px] font-mono transition-all hidden md:flex items-center gap-1 shadow-sm active:scale-95"
            title="Test a tiny leak at KM 7.1"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Small Leak (7.1km)</span>
          </button>

          {/* Interactive Custom Leak Position Slider Toggle */}
          <button
            onClick={() => { audioManager.playClickSound(); setShowCustomSlider(!showCustomSlider); }}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all flex items-center gap-1 active:scale-95 ${
              showCustomSlider
                ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700 hover:border-cyan-500/40'
            }`}
            title="Choose any exact kilometer along the pipe to test a leak"
          >
            <Crosshair className="w-3 h-3 text-cyan-400" />
            <span>Pick Exact KM 🎯</span>
          </button>

          {/* Reset System Baseline */}
          <button
            onClick={handleReset}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-950/70 text-slate-300 hover:text-emerald-200 border border-slate-700 hover:border-emerald-500/50 text-[11px] font-mono transition-all flex items-center gap-1 shadow-sm active:scale-95"
            title="Reset pipeline back to normal healthy flow"
          >
            <RotateCcw className="w-3 h-3 text-emerald-400" />
            <span>Reset</span>
          </button>

          {/* Advanced Physics Controls */}
          <button
            onClick={() => { audioManager.playClickSound(); onOpenSimControls(); }}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono transition-all flex items-center gap-1 shadow-sm active:scale-95"
            title="Open simulation settings"
          >
            <Sliders className="w-3 h-3 text-cyan-400" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Interactive Custom Leak Position Picker (Drops down smoothly) */}
      {showCustomSlider && (
        <div className="bg-slate-900/95 border border-cyan-500/40 rounded-xl p-3 shadow-xl backdrop-blur-xl animate-in slide-in-from-top duration-150 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="text-xs font-mono font-bold text-white">INTERACTIVE LEAK INJECTOR:</span>
            <span className="text-xs font-mono text-cyan-300">Drag to choose location anywhere on the 10 km pipe</span>
          </div>

          <div className="flex-1 flex items-center gap-4 min-w-[280px]">
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-300">
                <span>Location: <strong className="text-cyan-300 text-sm">{customKm.toFixed(2)} km</strong> ({Math.round(customKm * 1000)}m)</span>
                <span>Severity: <strong className="text-amber-300 text-sm">{customSeverity}%</strong></span>
              </div>
              <input
                type="range"
                min={0.2}
                max={9.8}
                step={0.1}
                value={customKm}
                onChange={(e) => setCustomKm(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <button
              onClick={handleCustomLeak}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.5)] active:scale-95 shrink-0 flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>TEST LEAK AT {customKm.toFixed(1)} KM</span>
            </button>

            <button
              onClick={() => setShowCustomSlider(false)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
