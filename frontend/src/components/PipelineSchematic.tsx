import React from 'react';
import { TelemetryPayload } from '../types/telemetry';
import { MapPin, Lock, Unlock, ArrowRight, Activity, Waves } from 'lucide-react';

interface PipelineSchematicProps {
  telemetry: TelemetryPayload | null;
  onSelectSegment: (id: number) => void;
  selectedSegmentId: number | null;
  onIsolateSegment: (id: number) => void;
  onUnisolateSegment: (id: number) => void;
}

export const PipelineSchematic: React.FC<PipelineSchematicProps> = ({
  telemetry,
  onSelectSegment,
  selectedSegmentId,
  onIsolateSegment,
  onUnisolateSegment,
}) => {
  const L = 10000; // 10 km
  const loc = telemetry?.npw_localization;
  const isLeak = telemetry?.sim_status?.leak_active || Boolean(loc?.detected);
  const leakLocM = loc?.location_m ?? telemetry?.sim_status?.leak_location_m ?? 3450;
  const leakPercent = Math.max(0, Math.min(100, (leakLocM / L) * 100));

  const isolatedSegments = telemetry?.sim_status?.isolated_segments || [];
  const valves = telemetry?.valves || { V0: true, V1: true, V2: true, V3: true, V4: true, V5: true };

  const segments = [
    { id: 1, name: 'S1: Inlet Riser', range: '0-2 km', startKm: 0, endKm: 2, valves: ['V0', 'V1'] },
    { id: 2, name: 'S2: Shallow Seabed', range: '2-4 km', startKm: 2, endKm: 4, valves: ['V1', 'V2'] },
    { id: 3, name: 'S3: Abyssal Trench', range: '4-6 km', startKm: 4, endKm: 6, valves: ['V2', 'V3'] },
    { id: 4, name: 'S4: Shelf Slope', range: '6-8 km', startKm: 6, endKm: 8, valves: ['V3', 'V4'] },
    { id: 5, name: 'S5: Outlet PLEM', range: '8-10 km', startKm: 8, endKm: 10, valves: ['V4', 'V5'] },
  ];

  return (
    <div className="bg-ocean-900/90 rounded-xl border border-cyan-500/20 p-4 shadow-lg flex flex-col gap-3">
      {/* Schematic Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-slate-100 tracking-wider">
            INTERACTIVE SYNOPTIC SCHEMATIC (10 KM SUBSEA PROFILE)
          </h3>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
            Fluid Flow Direction (L → R)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-ping"></span>
            Localized Breach
          </span>
          <span className="text-slate-400">Click any segment to inspect or isolate</span>
        </div>
      </div>

      {/* Main 10km Visual Synoptic Bar */}
      <div className="relative pt-6 pb-4 px-2">
        {/* Kilometer Rulers (0km to 10km) */}
        <div className="absolute top-0 left-2 right-2 flex justify-between text-[10px] font-mono text-slate-400">
          <span>0 km (Inlet)</span>
          <span>2 km</span>
          <span>4 km</span>
          <span>6 km</span>
          <span>8 km</span>
          <span>10 km (Outlet)</span>
        </div>

        {/* 5 Segment Container Track */}
        <div className="grid grid-cols-5 gap-1.5 relative z-10">
          {segments.map((seg) => {
            const isIsolated = isolatedSegments.includes(seg.id);
            const isSelected = selectedSegmentId === seg.id;
            const segHealth = telemetry?.analytics?.segments_health?.find((s) => s.id === seg.id);
            const status = segHealth?.status || 'GREEN';

            const statusColors = {
              GREEN: 'from-emerald-950/80 to-emerald-900/40 border-emerald-500/40 text-emerald-400',
              YELLOW: 'from-amber-950/80 to-amber-900/40 border-amber-500/50 text-amber-400',
              ORANGE: 'from-orange-950/80 to-orange-900/40 border-orange-500/60 text-orange-400',
              RED: 'from-red-950/90 to-red-900/50 border-red-500/80 text-red-400',
            }[status];

            return (
              <div
                key={seg.id}
                onClick={() => onSelectSegment(seg.id)}
                className={`relative h-20 rounded-lg border p-2 cursor-pointer transition-all flex flex-col justify-between bg-gradient-to-b ${statusColors} ${
                  isSelected ? 'ring-2 ring-cyan-400 shadow-glow-cyan' : 'hover:brightness-125'
                } ${isIsolated ? 'opacity-85 repeating-linear-stripes' : ''}`}
              >
                {/* Segment Top Details */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-white">SEG {seg.id}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-ocean-950/80 text-slate-300 border border-slate-700/60">
                    {seg.range}
                  </span>
                </div>

                {/* Simulated Fluid Flow Vector Particles */}
                {!isIsolated && (
                  <div className="flex items-center justify-around overflow-hidden py-1 opacity-70">
                    <ArrowRight className="w-3 h-3 text-cyan-300 animate-pulse" />
                    <ArrowRight className="w-3 h-3 text-cyan-300 animate-pulse delay-75" />
                    <ArrowRight className="w-3 h-3 text-cyan-300 animate-pulse delay-150" />
                  </div>
                )}

                {/* Pressure & Isolation Action */}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[11px] font-mono font-semibold text-white">
                    {segHealth?.pressure_bar.toFixed(1) ?? '100.0'} bar
                  </span>

                  {isIsolated ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnisolateSegment(seg.id);
                      }}
                      className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-black flex items-center gap-1 shadow-glow-emerald transition-all"
                    >
                      <Unlock className="w-2.5 h-2.5" />
                      Unisolate
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onIsolateSegment(seg.id);
                      }}
                      className="px-2 py-0.5 rounded text-[9px] font-mono bg-ocean-950/80 hover:bg-red-950 hover:text-red-300 text-slate-300 border border-slate-700 hover:border-red-500/50 flex items-center gap-1 transition-all"
                    >
                      <Lock className="w-2.5 h-2.5" />
                      Isolate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Localized Breach Pointer Flag (When Leak is Present) */}
        {isLeak && (
          <div
            className="absolute top-1 z-30 transition-all duration-300 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${leakPercent}%` }}
          >
            <div className="bg-red-600 text-white font-mono text-[10px] font-extrabold px-2 py-0.5 rounded shadow-glow-red flex items-center gap-1 animate-bounce">
              <MapPin className="w-3 h-3" />
              BREACH: {(leakLocM / 1000).toFixed(2)} km ({leakLocM.toFixed(0)}m)
            </div>
            <div className="w-0.5 h-16 bg-red-500 shadow-glow-red mt-0.5 animate-pulse" />
          </div>
        )}
      </div>

      {/* Valve Status Rail below Segments */}
      <div className="flex items-center justify-between px-3 py-2 bg-ocean-950/70 rounded-lg border border-slate-800 text-[11px] font-mono">
        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          ESD VALVE LINEUP (V0 → V5):
        </span>
        <div className="flex items-center gap-3">
          {[0, 1, 2, 3, 4, 5].map((vIdx) => {
            const vKey = `V${vIdx}`;
            const isOpen = valves[vKey] ?? true;
            return (
              <div
                key={vKey}
                className={`flex items-center gap-1 px-2 py-0.5 rounded border ${
                  isOpen
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/80 border-red-500 text-red-300 animate-pulse font-bold'
                }`}
              >
                <span>{vKey}:</span>
                <span>{isOpen ? 'OPEN' : 'CLOSED (ESD)'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

