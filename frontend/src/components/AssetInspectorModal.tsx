import React from 'react';
import { TelemetryPayload, SegmentHealth } from '../types/telemetry';
import { X, Shield, Lock, Unlock, Gauge, Layers, Wrench, FileCheck, CheckCircle2 } from 'lucide-react';

interface AssetInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentId: number | null;
  telemetry: TelemetryPayload | null;
  onIsolateSegment: (id: number) => void;
  onUnisolateSegment: (id: number) => void;
}

export const AssetInspectorModal: React.FC<AssetInspectorModalProps> = ({
  isOpen,
  onClose,
  segmentId,
  telemetry,
  onIsolateSegment,
  onUnisolateSegment,
}) => {
  if (!isOpen || segmentId === null) return null;

  const segHealth: SegmentHealth | undefined = telemetry?.analytics?.segments_health?.find((s) => s.id === segmentId);
  const isIsolated = telemetry?.sim_status?.isolated_segments?.includes(segmentId) ?? false;
  const valves = [`V${segmentId - 1}`, `V${segmentId}`];

  const sectorSpecs: Record<number, { name: string; depth: string; seabed: string; iliDate: string }> = {
    1: { name: 'Sector 1: Inlet Riser Shelf', depth: '420m - 550m', seabed: 'Sandy Silt Continental Riser', iliDate: '12 Jan 2026' },
    2: { name: 'Sector 2: Shallow Seabed Shelf', depth: '550m - 720m', seabed: 'Consolidated Clay Shelf Slope', iliDate: '18 Mar 2026' },
    3: { name: 'Sector 3: Abyssal Deepwater Trench', depth: '720m - 1,180m', seabed: 'Subsea Fracture Trench Basin', iliDate: '04 Feb 2026' },
    4: { name: 'Sector 4: Seaward Continental Slope', depth: '1,180m - 950m', seabed: 'Undulating Silt & Canyon Slope', iliDate: '22 Feb 2026' },
    5: { name: 'Sector 5: Receiving PLEM Terminal', depth: '950m - 850m', seabed: 'Stable Deepwater Receiving Bed', iliDate: '01 Apr 2026' },
  };

  const spec = sectorSpecs[segmentId] || sectorSpecs[2];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-ocean-950 border border-cyan-500/50 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-ocean-900 px-5 py-3.5 border-b border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-mono text-base font-bold text-white tracking-wide">
                GOVERNMENT ASSET DOSSIER: SECTOR {segmentId} (KP {(segmentId - 1) * 2.0} – {segmentId * 2.0} KM)
              </h2>
              <div className="text-[11px] font-mono text-slate-400">
                Statutory Engineering & Cathodic Protection Log • ID: IND-KG-D6-SEC-0{segmentId}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-ocean-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dossier Body */}
        <div className="p-5 space-y-4 font-mono text-xs overflow-y-auto max-h-[80vh]">
          {/* Status Badge Line */}
          <div className="flex items-center justify-between bg-ocean-900/80 p-3 rounded-lg border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400">SECTOR LOCATION:</div>
              <div className="font-bold text-white text-sm">{spec.name}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400">HEALTH CLASSIFICATION:</div>
              <span
                className={`font-bold px-2 py-0.5 rounded text-xs ${
                  segHealth?.status === 'RED'
                    ? 'bg-red-950 text-red-300 border border-red-500'
                    : segHealth?.status === 'YELLOW'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                }`}
              >
                {segHealth?.status || 'GREEN'}
              </span>
            </div>
          </div>

          {/* Metallurgical & Physical Specs Grid */}
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div className="bg-ocean-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px]">STEEL METALLURGY:</span>
              <div className="font-bold text-white mt-0.5">API 5L X70 Deepwater High-Yield</div>
            </div>
            <div className="bg-ocean-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px]">WALL THICKNESS (WT):</span>
              <div className="font-bold text-white mt-0.5">25.4 mm (Nominal) • 24.8mm Actual</div>
            </div>
            <div className="bg-ocean-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px]">BATHYMETRIC DEPTH:</span>
              <div className="font-bold text-cyan-300 mt-0.5">{spec.depth}</div>
            </div>
            <div className="bg-ocean-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px]">CATHODIC POTENTIAL:</span>
              <div className="font-bold text-emerald-400 mt-0.5">-985 mV (Al-Zn-In Anodes)</div>
            </div>
            <div className="bg-ocean-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px]">LAST INTELLIGENT PIG (ILI):</span>
              <div className="font-bold text-white mt-0.5">{spec.iliDate} (Passed 100%)</div>
            </div>
            <div className="bg-ocean-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px]">OPERATING PRESSURE:</span>
              <div className="font-bold text-white mt-0.5">{segHealth?.pressure_bar.toFixed(1) ?? '115.0'} bar</div>
            </div>
          </div>

          {/* Isolation Valves Status & Control */}
          <div className="bg-ocean-900/80 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold text-xs">BOUNDING EMERGENCY VALVES:</span>
              <span className="text-cyan-300 font-bold">V{segmentId - 1} ↔ V{segmentId}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Hydraulic Actuator Stroke Time: <strong>2.5 seconds</strong> • Powered by Subsea Accumulator Bottles (N2 Charge 210 bar).
            </div>

            {isIsolated ? (
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <div className="p-2 rounded bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-bold text-center">
                  SECTOR CURRENTLY ISOLATED • VALVES V{segmentId - 1} & V{segmentId} SHUT
                </div>
                <button
                  onClick={() => {
                    onUnisolateSegment(segmentId);
                    onClose();
                  }}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold flex items-center justify-center gap-1.5 shadow-glow-emerald cursor-pointer transition-all"
                >
                  <Unlock className="w-4 h-4" />
                  REOPEN VALVES & UNISOLATE SECTOR {segmentId}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onIsolateSegment(segmentId);
                  onClose();
                }}
                className="w-full py-2 rounded-lg bg-ocean-800 hover:bg-red-950 text-slate-200 hover:text-red-200 border border-slate-700 hover:border-red-500/60 flex items-center justify-center gap-1.5 cursor-pointer transition-all font-bold"
              >
                <Lock className="w-4 h-4 text-red-400" />
                COMMAND EMERGENCY VIRTUAL ESD ISOLATION
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-ocean-900 px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
