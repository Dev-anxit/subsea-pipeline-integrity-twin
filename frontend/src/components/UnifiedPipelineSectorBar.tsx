import React, { useState, useRef } from 'react';
import { TelemetryPayload, SegmentHealth } from '../types/telemetry';
import { audioManager } from '../utils/audio';
import { Shield, Lock, Unlock, ArrowRight, Layers, Crosshair, Flame, Info } from 'lucide-react';

interface UnifiedPipelineSectorBarProps {
  telemetry: TelemetryPayload | null;
  onSelectSegment: (id: number) => void;
  selectedSegmentId: number | null;
  onIsolateSegment: (id: number) => void;
  onUnisolateSegment: (id: number) => void;
  onInjectLeak?: (locationM: number, severity: number) => void;
}

export const UnifiedPipelineSectorBar: React.FC<UnifiedPipelineSectorBarProps> = ({
  telemetry,
  onSelectSegment,
  selectedSegmentId,
  onIsolateSegment,
  onUnisolateSegment,
  onInjectLeak,
}) => {
  const L = 10000; // 10 km
  const loc = telemetry?.npw_localization;
  const isLeak = telemetry?.sim_status?.leak_active || Boolean(loc?.detected);
  const leakLocM = loc?.location_m ?? telemetry?.sim_status?.leak_location_m ?? 3450;
  const leakPercent = Math.max(0, Math.min(100, (leakLocM / L) * 100));

  const isolatedSegments = telemetry?.sim_status?.isolated_segments || [];
  const valves = telemetry?.valves || { V0: true, V1: true, V2: true, V3: true, V4: true, V5: true };

  // Interactive Track Click & Hover
  const [hoverKm, setHoverKm] = useState<number | null>(null);
  const [hoverXPercent, setHoverXPercent] = useState<number>(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const segments = [
    { id: 1, name: 'Section 1: Start Riser', range: '0.0 - 2.0 km', depth: '420m deep', valves: ['V0', 'V1'], startKm: 0, endKm: 2 },
    { id: 2, name: 'Section 2: Shallow Sea', range: '2.0 - 4.0 km', depth: '650m deep', valves: ['V1', 'V2'], startKm: 2, endKm: 4 },
    { id: 3, name: 'Section 3: Deep Trench', range: '4.0 - 6.0 km', depth: '1180m deep', valves: ['V2', 'V3'], startKm: 4, endKm: 6 },
    { id: 4, name: 'Section 4: Sea Slope', range: '6.0 - 8.0 km', depth: '950m deep', valves: ['V3', 'V4'], startKm: 6, endKm: 8 },
    { id: 5, name: 'Section 5: End Terminal', range: '8.0 - 10.0 km', depth: '850m deep', valves: ['V4', 'V5'], startKm: 8, endKm: 10 },
  ];

  const segHealthMap: Record<number, SegmentHealth | undefined> = {};
  telemetry?.analytics?.segments_health?.forEach((s) => {
    segHealthMap[s.id] = s;
  });

  // Track mouse move for interactive leak tester
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const pct = (x / rect.width) * 100;
    const km = (pct / 100) * 10.0;
    setHoverXPercent(pct);
    setHoverKm(km);
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverKm !== null && onInjectLeak) {
      audioManager.playClickSound();
      onInjectLeak(hoverKm * 1000.0, 0.3);
    }
  };

  const handleValveClick = (vName: string, idx: number) => {
    audioManager.playValveActuation();
    // Toggle corresponding segment isolation
    const targetSegment = Math.min(5, Math.max(1, idx === 0 ? 1 : idx));
    if (isolatedSegments.includes(targetSegment)) {
      onUnisolateSegment(targetSegment);
    } else {
      onIsolateSegment(targetSegment);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-md backdrop-blur-md flex flex-col gap-3 transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-slate-100 tracking-wider">
            INTERACTIVE PIPELINE TRACK & EMERGENCY VALVES (10.0 KM)
          </h3>
          <span className="text-[10px] font-mono text-cyan-400 hidden sm:inline bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
            💡 Click anywhere on track to test a leak!
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span> Safe
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shadow-[0_0_6px_rgba(245,158,11,0.8)]"></span> Warning
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block shadow-[0_0_6px_rgba(244,63,94,0.8)] animate-ping"></span> Leak
          </span>
          <span className="flex items-center gap-1 text-slate-400 border-l border-slate-700 pl-3 hidden md:flex">
            <Lock className="w-3 h-3 text-rose-400" /> Valve Closed
          </span>
        </div>
      </div>

      {/* Interactive 10 KM Continuous Synoptic Track */}
      <div className="relative bg-slate-950/90 rounded-xl p-3 border border-slate-800/90 shadow-inner">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5 px-1">
          <span className="font-semibold text-slate-300">Start Platform (0.0 km)</span>
          <span className="flex items-center gap-1 text-cyan-400 font-semibold">
            Oil & Gas Flow <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
          </span>
          <span className="font-semibold text-slate-300">Receiving Terminal (10.0 km)</span>
        </div>

        {/* Continuous Interactive Pipeline Synoptic Track */}
        <div
          ref={trackRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverKm(null)}
          onClick={handleTrackClick}
          className="relative h-8 bg-slate-850 rounded-lg overflow-hidden flex items-stretch cursor-crosshair group select-none shadow-md border border-slate-700/80"
          title="Click anywhere to inject a simulated leak!"
        >
          {segments.map((seg) => {
            const isIsolated = isolatedSegments.includes(seg.id);
            const health = segHealthMap[seg.id]?.status || 'GREEN';
            const isSelected = selectedSegmentId === seg.id;

            let bgColor = 'bg-emerald-500/20 text-emerald-300';
            if (isIsolated) {
              bgColor = 'bg-rose-950/80 text-rose-300';
            } else if (health === 'RED') {
              bgColor = 'bg-rose-600/40 text-rose-100 animate-pulse';
            } else if (health === 'ORANGE') {
              bgColor = 'bg-amber-500/25 text-amber-200';
            }

            return (
              <div
                key={seg.id}
                onClick={(e) => {
                  e.stopPropagation();
                  audioManager.playClickSound();
                  onSelectSegment(seg.id);
                }}
                className={`flex-1 relative border-r border-slate-900/90 last:border-r-0 flex items-center justify-between px-2 text-[10px] font-mono transition-all hover:brightness-125 ${bgColor} ${
                  isSelected ? 'ring-2 ring-cyan-400 ring-inset z-10 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : ''
                }`}
                title={`Section ${seg.id} (${seg.range}) - Click to inspect`}
              >
                {/* Animated Flow Stripes (Visible when flowing) */}
                {!isIsolated && (
                  <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="2" className="animate-flow" />
                    </svg>
                  </div>
                )}

                <span className="font-bold truncate z-10">{seg.name.split(':')[0]}</span>
                <span className="text-[9px] opacity-75 hidden sm:inline z-10">{seg.depth}</span>
              </div>
            );
          })}

          {/* Interactive Mouse Hover Marker */}
          {hoverKm !== null && (
            <div
              className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center -translate-x-1/2"
              style={{ left: `${hoverXPercent}%` }}
            >
              <div className="w-0.5 h-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]"></div>
              <div className="absolute -top-7 bg-cyan-500 text-black font-mono font-bold text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                🎯 Click: Test Leak at {hoverKm.toFixed(2)} km
              </div>
            </div>
          )}

          {/* Animated Leak Epicenter Pin on Synoptic Bar */}
          {isLeak && (
            <div
              className="absolute top-0 bottom-0 z-20 flex flex-col items-center pointer-events-none transition-all duration-300 -translate-x-1/2"
              style={{ left: `${leakPercent}%` }}
            >
              <div className="w-1.5 h-full bg-rose-500 animate-pulse shadow-[0_0_15px_rgba(244,63,94,1)]"></div>
              <div className="absolute -top-2 w-4 h-4 rounded-full bg-rose-500 ring-2 ring-white animate-ping"></div>
              <div className="absolute -top-7 bg-rose-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap animate-bounce">
                LEAK AT {loc ? loc.location_km : (leakLocM / 1000).toFixed(2)} KM
              </div>
            </div>
          )}
        </div>

        {/* Interactive Valve Nodes Line (V0 to V5) */}
        <div className="flex items-center justify-between px-1 mt-2 text-[9px] font-mono text-slate-400">
          {['V0', 'V1', 'V2', 'V3', 'V4', 'V5'].map((vName, idx) => {
            const isOpen = valves[vName as keyof typeof valves] !== false;
            return (
              <button
                key={vName}
                onClick={() => handleValveClick(vName, idx)}
                className="flex flex-col items-center group cursor-pointer p-1 rounded hover:bg-slate-800 transition-all active:scale-90"
                title={`Valve ${vName} is ${isOpen ? 'OPEN' : 'CLOSED'}. Click to toggle!`}
              >
                <span
                  className={`w-3 h-3 rounded-full transition-all flex items-center justify-center ${
                    isOpen
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] group-hover:scale-125'
                      : 'bg-rose-500 ring-2 ring-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-pulse'
                  }`}
                >
                  {isOpen ? null : <Lock className="w-2 h-2 text-white" />}
                </span>
                <span className={`mt-1 font-bold ${isOpen ? 'text-slate-400 group-hover:text-emerald-400' : 'text-rose-400 font-extrabold'}`}>
                  {vName}
                </span>
                <span className="text-[8px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isOpen ? 'Close' : 'Open'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5 Sector Interactive Control Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {segments.map((seg) => {
          const isSelected = selectedSegmentId === seg.id;
          const isIsolated = isolatedSegments.includes(seg.id);
          const healthData = segHealthMap[seg.id];
          const health = healthData?.status || 'GREEN';
          const pressure = healthData?.pressure_bar ?? 100.0;

          // Vibrant styling
          let cardBorder = 'border-slate-800 hover:border-slate-700 bg-slate-950/70 hover:shadow-lg';
          let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

          if (isIsolated) {
            cardBorder = 'border-rose-500/50 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]';
            badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
          } else if (health === 'RED') {
            cardBorder = 'border-rose-500/60 bg-rose-950/30 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.25)]';
            badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
          } else if (health === 'ORANGE') {
            cardBorder = 'border-amber-500/40 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
            badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
          } else if (isSelected) {
            cardBorder = 'border-cyan-500/60 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]';
          }

          return (
            <div
              key={seg.id}
              className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all duration-200 ${cardBorder} ${
                isSelected ? 'ring-1 ring-cyan-500' : ''
              }`}
            >
              {/* Sector Title & Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <div
                    onClick={() => { audioManager.playClickSound(); onSelectSegment(seg.id); }}
                    className="font-mono text-xs font-bold text-white cursor-pointer hover:text-cyan-300 transition-colors"
                  >
                    {seg.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">{seg.range}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold border ${badgeBg}`}>
                  {isIsolated ? 'CLOSED' : health === 'GREEN' ? 'SAFE' : health === 'RED' ? 'LEAK' : 'CHECK'}
                </span>
              </div>

              {/* Pressure & Valves Summary */}
              <div className="my-2.5 flex items-baseline justify-between font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-[9px] text-slate-400 block font-semibold">PRESSURE</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-slate-100">{pressure.toFixed(1)}</span>
                    <span className="text-[10px] text-slate-400">bar</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 block font-semibold">VALVES</span>
                  <span className="text-xs font-medium text-cyan-300">
                    {seg.valves[0]} ↔ {seg.valves[1]}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Details & Close/Open Valve with Tactile Audio */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                <button
                  onClick={() => { audioManager.playClickSound(); onSelectSegment(seg.id); }}
                  className="flex-1 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono transition-all text-center active:scale-95 shadow-sm"
                  title="View detailed section info"
                >
                  Details
                </button>

                {isIsolated ? (
                  <button
                    onClick={() => { audioManager.playValveActuation(); onUnisolateSegment(seg.id); }}
                    className="flex-1 py-1 rounded bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-semibold transition-all flex items-center justify-center gap-1 active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    title={`Reopen valves ${seg.valves[0]} and ${seg.valves[1]}`}
                  >
                    <Unlock className="w-3 h-3 text-emerald-400" />
                    <span>Open</span>
                  </button>
                ) : (
                  <button
                    onClick={() => { audioManager.playValveActuation(); onIsolateSegment(seg.id); }}
                    className="flex-1 py-1 rounded bg-slate-800/90 hover:bg-rose-950 text-slate-300 hover:text-rose-200 hover:border-rose-500/40 border border-transparent text-[10px] font-mono transition-all flex items-center justify-center gap-1 active:scale-95"
                    title={`Emergency close valves ${seg.valves[0]} and ${seg.valves[1]} to stop leak`}
                  >
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Close</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
