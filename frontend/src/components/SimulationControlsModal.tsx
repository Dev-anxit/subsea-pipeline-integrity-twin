import React, { useState } from 'react';
import { TelemetryPayload, DatasetItem } from '../types/telemetry';
import { X, Play, Pause, RotateCcw, AlertTriangle, Zap, CheckCircle2, FastForward } from 'lucide-react';

interface SimulationControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryPayload | null;
  onInjectLeak: (locationM: number, severity: number) => void;
  onStartSim: () => void;
  onPauseSim: () => void;
  onResetSim: () => void;
  onSetSpeed: (speed: number) => void;
  onLoadDataset: (filename: string) => void;
  onResetValves: () => void;
  datasets: DatasetItem[];
}

export const SimulationControlsModal: React.FC<SimulationControlsModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  onInjectLeak,
  onStartSim,
  onPauseSim,
  onResetSim,
  onSetSpeed,
  onLoadDataset,
  onResetValves,
  datasets,
}) => {
  if (!isOpen) return null;

  const [leakLoc, setLeakLoc] = useState<number>(3450);
  const [leakSev, setLeakSev] = useState<number>(0.25);
  const [activeSpeed, setActiveSpeed] = useState<number>(telemetry?.sim_status?.speed || 1.0);

  const isRunning = telemetry?.sim_status?.running ?? true;
  const isLeak = telemetry?.sim_status?.leak_active;

  const handleInject = () => {
    onInjectLeak(leakLoc, leakSev);
  };

  const handleSpeedChange = (spd: number) => {
    setActiveSpeed(spd);
    onSetSpeed(spd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-ocean-900 border border-cyan-500/40 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-ocean-950 px-5 py-3.5 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h2 className="font-mono text-base font-bold text-white tracking-wide">
              SUBSEA SIMULATION & TEST INJECTOR
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-ocean-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* 1. Simulation Runtime Controls */}
          <div className="bg-ocean-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-mono font-semibold text-slate-300">RUNTIME ENGINE CONTROLS</div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isRunning ? (
                  <button
                    onClick={onPauseSim}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-mono text-xs font-bold transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    Pause Flow
                  </button>
                ) : (
                  <button
                    onClick={onStartSim}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-mono text-xs font-bold transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Resume Flow
                  </button>
                )}

                <button
                  onClick={onResetSim}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-slate-200 border border-slate-700 font-mono text-xs transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Baseline
                </button>

                <button
                  onClick={onResetValves}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 font-mono text-xs transition-colors"
                >
                  Reopen All Valves
                </button>
              </div>

              {/* Speed Multiplier */}
              <div className="flex items-center gap-1 bg-ocean-900 p-1 rounded-lg border border-slate-800">
                <FastForward className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
                {[1.0, 2.0, 5.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-2 py-0.5 rounded text-xs font-mono transition-all ${
                      activeSpeed === spd
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Custom Leak Injection Parameters */}
          <div className="bg-ocean-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-300">CUSTOM BREACH INJECTION</span>
              {isLeak && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/50 animate-pulse">
                  ACTIVE LEAK IN PROGRESS
                </span>
              )}
            </div>

            {/* Distance Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Rupture Distance along Trunkline (0 - 10,000 m):</span>
                <span className="text-cyan-300 font-bold font-mono">
                  {leakLoc.toLocaleString()} m ({(leakLoc / 1000).toFixed(2)} km)
                </span>
              </div>
              <input
                type="range"
                min={200}
                max={9800}
                step={50}
                value={leakLoc}
                onChange={(e) => setLeakLoc(Number(e.target.value))}
                className="w-full h-2 bg-ocean-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0m (Seg 1)</span>
                <span>2,000m (Seg 2)</span>
                <span>4,000m (Seg 3)</span>
                <span>6,000m (Seg 4)</span>
                <span>8,000m (Seg 5)</span>
                <span>10,000m</span>
              </div>
            </div>

            {/* Severity Radio Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400">Rupture Orifice Severity:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Micro Leak (5%)', val: 0.05, desc: 'Acoustic onset test' },
                  { label: 'Moderate Rupture (25%)', val: 0.25, desc: 'Standard transient' },
                  { label: 'Catastrophic (60%)', val: 0.6, desc: 'Instant ESD shutdown' },
                ].map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => setLeakSev(s.val)}
                    className={`p-2 rounded-lg text-left border transition-all ${
                      leakSev === s.val
                        ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200'
                        : 'bg-ocean-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-mono font-semibold">{s.label}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleInject}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold tracking-wider transition-all shadow-glow-red"
            >
              <AlertTriangle className="w-4 h-4" />
              INJECT BREACH & TRIGGER NPW WAVEFRONT
            </button>
          </div>

          {/* 3. Pre-Packaged Benchmark Scenarios */}
          <div className="bg-ocean-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-mono font-semibold text-slate-300">
              OFFICIAL HACKATHON BENCHMARK CSV DATASETS
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {datasets.map((d) => (
                <button
                  key={d.name}
                  onClick={() => {
                    onLoadDataset(d.name);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-ocean-900 hover:bg-ocean-800 border border-slate-800 hover:border-cyan-500/40 text-left transition-all"
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-mono font-semibold text-slate-200 truncate">{d.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{d.size_kb} KB • CSV Playback</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
                    Load CSV
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-ocean-950 px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-slate-200 text-xs font-mono"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

