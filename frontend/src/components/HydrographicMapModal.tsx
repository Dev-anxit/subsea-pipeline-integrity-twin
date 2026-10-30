import React, { useState } from 'react';
import { TelemetryPayload } from '../types/telemetry';
import { X, Compass, Anchor, Navigation, ShieldAlert, Waves, MapPin, Radio } from 'lucide-react';

interface HydrographicMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryPayload | null;
  onSelectSegment?: (id: number) => void;
}

export const HydrographicMapModal: React.FC<HydrographicMapModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  onSelectSegment,
}) => {
  if (!isOpen) return null;

  const loc = telemetry?.npw_localization;
  const isLeak = telemetry?.sim_status?.leak_active || Boolean(loc?.detected);
  const leakLocM = loc?.location_m ?? telemetry?.sim_status?.leak_location_m ?? 3450;
  const leakPercent = (leakLocM / 10000.0) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-ocean-950 border border-cyan-500/50 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-ocean-900 px-5 py-3.5 border-b border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400 animate-spin" />
            <div>
              <h2 className="font-mono text-base font-bold text-white tracking-wide">
                NATIONAL HYDROGRAPHIC GIS CHART • SECTOR 04-ALPHA
              </h2>
              <div className="text-[11px] font-mono text-slate-400">
                Bathymetry Survey • Maritime Exclusion Zones • Naval Patrol Asset Tracking
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

        {/* Tactical Nautical Chart Body */}
        <div className="p-5 space-y-4 overflow-y-auto font-mono text-xs">
          {/* Top Maritime Telemetry Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-ocean-900/80 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400">NAUTICAL POSITION:</span>
              <div className="font-bold text-cyan-300">18°52'14" N • 72°40'30" E</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">EXCLUSIVE ECONOMIC ZONE:</span>
              <div className="font-bold text-white">Zone IV (Indian EEZ)</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">BATHYMETRIC DEPTH:</span>
              <div className="font-bold text-white">400m → 1,200m Abyssal</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">COAST GUARD ASSET:</span>
              <div className="font-bold text-emerald-400 flex items-center gap-1">
                <Anchor className="w-3.5 h-3.5" />
                ICGS SAMARTH (On Patrol)
              </div>
            </div>
          </div>

          {/* Interactive Tactical Radar / Nautical Chart Area */}
          <div className="relative w-full h-80 rounded-xl bg-[#031526] border border-cyan-500/40 overflow-hidden shadow-inner flex flex-col justify-between p-4">
            {/* Grid & Depth Contour Rings */}
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="nauticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00f2fe" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#nauticalGrid)" />
                <path d="M 0 100 Q 300 140 800 80" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="5,5" />
                <path d="M 0 180 Q 400 240 800 160" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="5,5" />
                <path d="M 0 250 Q 500 290 800 240" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="5,5" />
              </svg>
            </div>

            {/* Depth Contour Text Labels */}
            <div className="absolute top-4 left-6 text-[10px] text-cyan-400/60 pointer-events-none">
              CONTOUR -300M (CONTINENTAL SHELF)
            </div>
            <div className="absolute top-28 left-6 text-[10px] text-cyan-400/60 pointer-events-none">
              CONTOUR -850M (ABYSSAL BASIN)
            </div>
            <div className="absolute bottom-6 left-6 text-[10px] text-cyan-400/60 pointer-events-none">
              CONTOUR -1200M (DEEP SEA TRENCH)
            </div>

            {/* Coast Guard Vessel Position */}
            <div className="absolute top-12 right-24 flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/60 px-2.5 py-1 rounded-lg text-emerald-300 shadow-glow-emerald">
              <Anchor className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <div className="font-bold text-[10px]">ICGS SAMARTH (PATROL)</div>
                <div className="text-[9px] text-slate-400">Dist to Pipe: 3.2 NM • Speed: 14 kts</div>
              </div>
            </div>

            {/* Subsea Pipeline Route (0 km to 10 km) */}
            <div className="relative my-auto z-10 py-6">
              <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-2">
                <span className="flex items-center gap-1 text-cyan-300">
                  <Navigation className="w-3.5 h-3.5" />
                  WELLHEAD PLATFORM (KP 0.0)
                </span>
                <span className="text-slate-400">10.0 KM SUBSEA CORRIDOR (API 5L X70)</span>
                <span className="text-amber-300">RECEIVING PLEM TERMINAL (KP 10.0)</span>
              </div>

              {/* Pipeline Line Bar */}
              <div className="h-4 bg-ocean-900 border-2 border-cyan-400/70 rounded-full relative flex items-center shadow-glow-cyan">
                {/* 5 Segment Tick Marks & Valve Stations */}
                {[0, 20, 40, 60, 80, 100].map((pct, idx) => (
                  <div
                    key={pct}
                    className="absolute -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${pct}%` }}
                  >
                    <div className="w-3 h-6 bg-cyan-300 rounded-sm border border-black shadow" />
                    <span className="text-[9px] text-cyan-200 mt-1 font-bold">V{idx}</span>
                  </div>
                ))}

                {/* Leak Breach Beacon & Exclusion Zone */}
                {isLeak && (
                  <div
                    className="absolute -translate-x-1/2 flex flex-col items-center z-30 transition-all duration-300 pointer-events-none"
                    style={{ left: `${leakPercent}%` }}
                  >
                    {/* Pulsing Maritime Exclusion Zone Ring (5 NM) */}
                    <div className="absolute -top-16 w-36 h-36 rounded-full bg-red-600/15 border border-red-500 animate-ping pointer-events-none" />
                    <div className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-glow-red flex items-center gap-1 animate-bounce">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      BREACH: {(leakLocM / 1000).toFixed(2)} KM
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 mt-6">
                <span>SECTOR 1 (0-2 km)</span>
                <span>SECTOR 2 (2-4 km)</span>
                <span>SECTOR 3 (4-6 km)</span>
                <span>SECTOR 4 (6-8 km)</span>
                <span>SECTOR 5 (8-10 km)</span>
              </div>
            </div>

            {/* Bottom Scale & Disclaimer */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 z-10 border-t border-slate-800/80 pt-2">
              <span>SCALE: 1:50,000 • WGS-84 GEODETIC DATUM</span>
              <span className="text-cyan-400">AUTHORIZED GOVERNMENT DEFENSE RECONNAISSANCE</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-ocean-900 px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs cursor-pointer"
          >
            Close Hydrographic Chart
          </button>
        </div>
      </div>
    </div>
  );
};

