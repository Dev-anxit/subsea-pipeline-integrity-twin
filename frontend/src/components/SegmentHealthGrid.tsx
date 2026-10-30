import React from 'react';
import { TelemetryPayload, SegmentHealth } from '../types/telemetry';
import { Shield, ShieldAlert, Lock, Unlock, Gauge } from 'lucide-react';

interface SegmentHealthGridProps {
  telemetry: TelemetryPayload | null;
  onSelectSegment: (segmentId: number) => void;
  selectedSegmentId?: number | null;
  onIsolateSegment: (segmentId: number) => void;
  onUnisolateSegment: (segmentId: number) => void;
}

export const SegmentHealthGrid: React.FC<SegmentHealthGridProps> = ({
  telemetry,
  onSelectSegment,
  selectedSegmentId,
  onIsolateSegment,
  onUnisolateSegment,
}) => {
  const segments: SegmentHealth[] = telemetry?.analytics?.segments_health || [
    { id: 1, name: 'Seg 1: Inlet Riser (0-2 km)', pressure_bar: 125.0, status: 'GREEN', color: '#10b981', score: 0.1, length_km: 2, range_km: '0.0 - 2.0 km' },
    { id: 2, name: 'Seg 2: Shallow Seabed (2-4 km)', pressure_bar: 115.0, status: 'GREEN', color: '#10b981', score: 0.1, length_km: 2, range_km: '2.0 - 4.0 km' },
    { id: 3, name: 'Seg 3: Abyssal Trench (4-6 km)', pressure_bar: 105.0, status: 'GREEN', color: '#10b981', score: 0.1, length_km: 2, range_km: '4.0 - 6.0 km' },
    { id: 4, name: 'Seg 4: Shelf Slope (6-8 km)', pressure_bar: 95.0, status: 'GREEN', color: '#10b981', score: 0.1, length_km: 2, range_km: '6.0 - 8.0 km' },
    { id: 5, name: 'Seg 5: Outlet Manifold (8-10 km)', pressure_bar: 88.0, status: 'GREEN', color: '#10b981', score: 0.1, length_km: 2, range_km: '8.0 - 10.0 km' },
  ];

  const isolatedSlices = telemetry?.sim_status?.isolated_segments || [];

  return (
    <div className="bg-ocean-900/90 rounded-xl border border-cyan-500/20 p-4 shadow-lg flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-slate-100 tracking-wider">
            PIPELINE INTEGRITY SECTORS (5 SEGMENTS × 2.0 KM)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Normal
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> Advisory
          </span>
          <span className="flex items-center gap-1 text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span> Warning
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span> Rupture
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
        {segments.map((seg) => {
          const isSelected = selectedSegmentId === seg.id;
          const isIsolated = isolatedSlices.includes(seg.id);

          const statusStyles: Record<string, { bg: string; border: string; text: string; badgeBg: string }> = {
            GREEN: { bg: 'bg-emerald-950/20', border: 'border-emerald-500/30', text: 'text-emerald-400', badgeBg: 'bg-emerald-900/60' },
            YELLOW: { bg: 'bg-amber-950/30', border: 'border-amber-500/40', text: 'text-amber-400', badgeBg: 'bg-amber-900/70' },
            ORANGE: { bg: 'bg-orange-950/40', border: 'border-orange-500/60', text: 'text-orange-400', badgeBg: 'bg-orange-900/80' },
            RED: { bg: 'bg-red-950/50', border: 'border-red-500/80', text: 'text-red-400', badgeBg: 'bg-red-900/90' },
          };

          const style = statusStyles[seg.status] || statusStyles.GREEN;

          return (
            <div
              key={seg.id}
              onClick={() => onSelectSegment(seg.id)}
              className={`relative rounded-lg p-3 transition-all cursor-pointer border ${style.bg} ${style.border} ${
                isSelected ? 'ring-2 ring-cyan-400 shadow-glow-cyan' : 'hover:border-cyan-400/50'
              } ${isIsolated ? 'opacity-85' : ''}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-slate-200">SEG {seg.id}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${style.badgeBg} ${style.text}`}>
                  {seg.status}
                </span>
              </div>

              {/* Range & Name */}
              <div className="text-[11px] font-mono text-slate-400 truncate mb-2">{seg.range_km}</div>

              {/* Pressure Readout */}
              <div className="flex items-center justify-between bg-ocean-950/70 p-1.5 rounded border border-slate-800 mb-2.5">
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  <span>PRESS:</span>
                </div>
                <span className="text-xs font-mono font-bold text-white">{seg.pressure_bar.toFixed(1)} bar</span>
              </div>

              {/* Valves Indicator */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
                <span>VALVES:</span>
                <span className="text-slate-300 font-semibold">
                  V{seg.id - 1} ↔ V{seg.id}
                </span>
              </div>

              {/* Isolation Action Button / Unisolate Toggle */}
              {isIsolated ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnisolateSegment(seg.id);
                  }}
                  title="Click to reopen isolation valves and restore flow"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-950 hover:bg-emerald-950 border border-red-500/80 hover:border-emerald-400 text-[10px] font-mono text-red-300 hover:text-emerald-300 font-bold transition-all shadow-glow-red hover:shadow-glow-emerald group cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 group-hover:hidden text-red-400" />
                  <Unlock className="w-3.5 h-3.5 hidden group-hover:inline text-emerald-400" />
                  <span className="group-hover:hidden">ISOLATED • UNISOLATE</span>
                  <span className="hidden group-hover:inline">REOPEN VALVES (UNISOLATE)</span>
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onIsolateSegment(seg.id);
                  }}
                  className="w-full flex items-center justify-center gap-1 py-1 rounded bg-ocean-800 hover:bg-red-900/60 border border-slate-700 hover:border-red-500/50 text-[10px] font-mono text-slate-300 hover:text-red-200 transition-colors cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-slate-400" />
                  Isolate Virtual ESD
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

