import React from 'react';
import { TelemetryPayload } from '../types/telemetry';
import { Gauge, ArrowDownRight, Droplets, MapPin, AlertOctagon, Activity, ShieldCheck } from 'lucide-react';

interface KpiRibbonProps {
  telemetry: TelemetryPayload | null;
}

export const KpiRibbon: React.FC<KpiRibbonProps> = ({ telemetry }) => {
  const pIn = telemetry?.p_inlet ?? 135.0;
  const pOut = telemetry?.p_outlet ?? 88.0;
  const deltaP = telemetry?.delta_p ?? (pIn - pOut);
  const flowIn = telemetry?.flow_inlet ?? 450.0;
  const flowOut = telemetry?.flow_outlet ?? 450.0;
  const flowDiff = telemetry?.flow_diff ?? (flowIn - flowOut);

  const loc = telemetry?.npw_localization;
  const anomalyScore = telemetry?.analytics?.anomaly_score ?? 0.05;
  const healthStatus = telemetry?.analytics?.health_status ?? 'GREEN';
  const spillM3 = telemetry?.sim_status?.cumulative_spill_m3 ?? 0.0;
  const spillBbl = telemetry?.sim_status?.cumulative_spill_bbl ?? 0.0;

  const healthBadgeConfig = {
    GREEN: { text: 'HEALTHY / NORMAL', bg: 'bg-emerald-950/40', border: 'border-emerald-500/30', textColor: 'text-emerald-400', icon: ShieldCheck },
    YELLOW: { text: 'MINOR FLOW DRIFT', bg: 'bg-amber-950/40', border: 'border-amber-500/30', textColor: 'text-amber-400', icon: Activity },
    ORANGE: { text: 'WARNING: PRESSURE DROP', bg: 'bg-amber-950/60', border: 'border-amber-500/40', textColor: 'text-amber-300', icon: AlertOctagon },
    RED: { text: 'CRITICAL: LEAK ACTIVE', bg: 'bg-rose-950/60', border: 'border-rose-500/50', textColor: 'text-rose-400', icon: AlertOctagon },
  }[healthStatus];

  const StatusIcon = healthBadgeConfig.icon;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
      {/* 1. Inlet Pressure */}
      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>INLET PRESSURE</span>
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-lg font-mono font-bold text-white">{pIn.toFixed(1)}</span>
          <span className="text-[10px] font-mono text-cyan-400">bar</span>
        </div>
        <div className="text-[9px] font-mono text-slate-500 mt-0.5">Normal: 135 bar</div>
      </div>

      {/* 2. Outlet Pressure */}
      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>OUTLET PRESSURE</span>
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-lg font-mono font-bold text-white">{pOut.toFixed(1)}</span>
          <span className="text-[10px] font-mono text-amber-400">bar</span>
        </div>
        <div className="text-[9px] font-mono text-slate-500 mt-0.5">Normal: 88 bar</div>
      </div>

      {/* 3. Differential Pressure ΔP */}
      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>PRESSURE DROP (ΔP)</span>
          <ArrowDownRight className="w-3.5 h-3.5 text-cyan-300" />
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-lg font-mono font-bold text-cyan-300">{deltaP.toFixed(1)}</span>
          <span className="text-[10px] font-mono text-slate-400">bar</span>
        </div>
        <div className="text-[9px] font-mono text-slate-500 mt-0.5">Pipe Friction Drop</div>
      </div>

      {/* 4. Flow Balance */}
      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>FLOW DIFFERENCE</span>
          <Droplets className="w-3.5 h-3.5 text-sky-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className={`text-lg font-mono font-bold ${Math.abs(flowDiff) > 15 ? 'text-rose-400' : 'text-white'}`}>
            {flowDiff > 0 ? `+${flowDiff.toFixed(1)}` : flowDiff.toFixed(1)}
          </span>
          <span className="text-[10px] font-mono text-slate-400">m³/h</span>
        </div>
        <div className="text-[9px] font-mono text-slate-500 mt-0.5">
          In: {flowIn.toFixed(0)} | Out: {flowOut.toFixed(0)}
        </div>
      </div>

      {/* 5. NPW Localized Distance */}
      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>LEAK POSITION</span>
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          {loc?.detected ? (
            <>
              <span className="text-lg font-mono font-bold text-rose-400">{loc.location_km.toFixed(2)}</span>
              <span className="text-[10px] font-mono text-rose-300">km</span>
            </>
          ) : (
            <span className="text-base font-mono font-semibold text-slate-500">SAFE (0)</span>
          )}
        </div>
        <div className="text-[9px] font-mono text-slate-500 mt-0.5 truncate">
          {loc?.detected ? `${loc.segment.name}` : 'No Leaks Detected'}
        </div>
      </div>

      {/* 6. Spill Volume Estimator */}
      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>OIL LEAKED</span>
          <Droplets className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className={`text-lg font-mono font-bold ${spillM3 > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
            {spillM3.toFixed(1)}
          </span>
          <span className="text-[10px] font-mono text-slate-400">m³</span>
        </div>
        <div className="text-[9px] font-mono text-slate-500 mt-0.5">
          ~{spillBbl.toFixed(0)} barrels
        </div>
      </div>

      {/* 7. System Health Status Badge */}
      <div className={`p-2.5 rounded-xl border flex flex-col justify-between shadow-sm ${healthBadgeConfig.bg} ${healthBadgeConfig.border}`}>
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-400">PIPE HEALTH</span>
          <StatusIcon className={`w-3.5 h-3.5 ${healthBadgeConfig.textColor}`} />
        </div>
        <div className={`text-xs font-mono font-bold mt-1 ${healthBadgeConfig.textColor}`}>
          {healthBadgeConfig.text}
        </div>
        <div className="text-[9px] font-mono text-slate-400 mt-0.5">
          Risk: {(anomalyScore * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
};
