import React from 'react';
import { TelemetryPayload } from '../types/telemetry';
import { audioManager } from '../utils/audio';
import {
  ShieldAlert,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Volume2,
  AlertTriangle,
  Radio,
  FileText,
  Anchor,
  Activity,
  Flame,
} from 'lucide-react';

interface DisasterProtocolBannerProps {
  telemetry: TelemetryPayload | null;
  onInjectLeak: (loc: number, sev: number) => void;
  onResetSim: () => void;
  onOpenSimControls: () => void;
  onOpenIncidentReport: () => void;
}

export const DisasterProtocolBanner: React.FC<DisasterProtocolBannerProps> = ({
  telemetry,
  onInjectLeak,
  onResetSim,
  onOpenSimControls,
  onOpenIncidentReport,
}) => {
  const isLeak = telemetry?.sim_status?.leak_active || Boolean(telemetry?.npw_localization?.detected);
  const loc = telemetry?.npw_localization;
  const isolated = telemetry?.sim_status?.isolated_segments || [];
  const health = telemetry?.analytics?.health_status || 'GREEN';

  // Construct official government briefing communique
  let communique = '🟢 NATIONAL ASSET STATUS: NOMINAL. Steady multiphase crude transport at 135.0 bar inlet / 88.0 bar receiving terminal. All 5 subsea sectors operating within DNV-ST-F101 regulatory safety limits. Zero acoustic transients.';
  let communiqueStyle = 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300';
  let icsPhase = 'PHASE 1: CONTINUOUS MARITIME SURVEILLANCE & EDGE TELEMETRY';

  if (isLeak) {
    const locKm = loc ? loc.location_km : ((telemetry?.sim_status?.leak_location_m || 3450) / 1000).toFixed(2);
    const segName = loc ? loc.segment.name : 'Sector 2 (Shallow Bathymetry)';

    if (isolated.length > 0) {
      icsPhase = 'PHASE 4: VIRTUAL ESD SECTOR ISOLATED • SPILL CONTAINED';
      communique = `🛡️ GOVERNMENT INCIDENT UPDATE: Rupture at KP ${locKm} (${segName}) successfully isolated via automated ESD valves. Hydrocarbon discharge arrested by 95%. Maritime Coast Guard notification active. Click 'Unisolate' to restore line pressure.`;
      communiqueStyle = 'bg-blue-950/70 border-blue-500/60 text-blue-200';
    } else {
      icsPhase = 'PHASE 2: CRITICAL BREACH LOCALIZED • EXECUTING AUTO-ISOLATION';
      communique = `🚨 NATIONAL INCIDENT LEVEL 4: Subsea trunkline rupture identified at KP ${locKm} (${segName}). Negative pressure wave delta Δt = ${loc ? (loc.delta_t * 1000).toFixed(1) : '2696'} ms. Emergency shutdown valves V1 & V2 commanded to close under MARPOL Annex I protocol.`;
      communiqueStyle = 'bg-red-950/80 border-red-500 text-red-100 animate-pulse';
    }
  }

  return (
    <div className="flex flex-col gap-2.5 bg-ocean-900/90 backdrop-blur-md p-3.5 rounded-xl border border-cyan-500/30 shadow-2xl">
      {/* Government Disaster Response Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Anchor className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-slate-100 tracking-wider">
            CRITICAL DISASTER DRILLS & LIVE INCIDENT INJECTION:
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ocean-950 text-cyan-300 border border-cyan-500/30">
            {icsPhase}
          </span>
        </div>

        {/* 1-Click Operational Scenarios */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={onResetSim}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-ocean-800 hover:bg-emerald-950/80 text-slate-200 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/50 text-xs font-mono transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nominal State</span>
          </button>

          <button
            onClick={() => onInjectLeak(3450, 0.25)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-ocean-800 hover:bg-red-950 text-slate-200 hover:text-red-300 border border-slate-700 hover:border-red-500/60 text-xs font-mono transition-all cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Sector 2 Rupture (3.45 km)</span>
          </button>

          <button
            onClick={() => onInjectLeak(5200, 0.35)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-ocean-800 hover:bg-orange-950 text-slate-200 hover:text-orange-300 border border-slate-700 hover:border-orange-500/60 text-xs font-mono transition-all cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            <span>Abyssal Fracture (5.20 km)</span>
          </button>

          <button
            onClick={() => onInjectLeak(7600, 0.30)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-ocean-800 hover:bg-amber-950 text-slate-200 hover:text-amber-300 border border-slate-700 hover:border-amber-500/60 text-xs font-mono transition-all cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Slope Rupture (7.60 km)</span>
          </button>

          <button
            onClick={onOpenSimControls}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/40 text-xs font-mono transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Custom Orifice Parameter...</span>
          </button>

          <button
            onClick={() => audioManager.playBreachAlert()}
            title="Preview National Maritime Disaster Klaxon"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-slate-300 hover:text-cyan-300 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Siren Audio</span>
          </button>
        </div>
      </div>

      {/* Official Government Incident Communique */}
      <div className={`p-3 rounded-lg border text-xs font-mono transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 ${communiqueStyle}`}>
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
          <span className="leading-relaxed">{communique}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          {isLeak && (
            <button
              onClick={onOpenIncidentReport}
              className="px-2.5 py-1 rounded bg-blue-900/90 hover:bg-blue-800 text-blue-200 border border-blue-400/50 text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <FileText className="w-3 h-3 text-cyan-300" />
              Download Official Ministry Report
            </button>
          )}
          <span className="text-[10px] text-slate-400 font-mono">
            SYS CLOCK: {telemetry?.timestamp.toFixed(1) ?? '0.0'}s
          </span>
        </div>
      </div>
    </div>
  );
};

