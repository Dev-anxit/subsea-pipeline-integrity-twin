import React, { useEffect, useRef, useState } from 'react';
import { TelemetryPayload } from '../types/telemetry';
import { Crosshair, Activity, TrendingDown, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TelemetryAnalyticsCardProps {
  telemetry: TelemetryPayload | null;
}

interface DataPoint {
  time: number;
  pIn: number;
  pOut: number;
  dpInDt: number;
  dpOutDt: number;
}

export const TelemetryAnalyticsCard: React.FC<TelemetryAnalyticsCardProps> = ({ telemetry }) => {
  const [activeTab, setActiveTab] = useState<'pressure' | 'gradient' | 'profile'>('pressure');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<DataPoint[]>([]);

  const loc = telemetry?.npw_localization;
  const isDetected = Boolean(loc?.detected);
  const healthStatus = telemetry?.analytics?.health_status || 'GREEN';

  // Push incoming 20 Hz points to history buffer
  useEffect(() => {
    if (!telemetry) return;

    const pt: DataPoint = {
      time: telemetry.timestamp,
      pIn: telemetry.p_inlet,
      pOut: telemetry.p_outlet,
      dpInDt: telemetry.analytics?.dp_in_dt || 0,
      dpOutDt: telemetry.analytics?.dp_out_dt || 0,
    };

    historyRef.current.push(pt);
    if (historyRef.current.length > 80) {
      historyRef.current.shift();
    }
  }, [telemetry]);

  // High-performance canvas chart renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const data = historyRef.current;

      // Dark background
      ctx.fillStyle = '#020813';
      ctx.fillRect(0, 0, width, height);

      // Subtle horizontal gridlines
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      for (let y = 0.2; y < 1.0; y += 0.2) {
        ctx.beginPath();
        ctx.moveTo(35, y * height);
        ctx.lineTo(width, y * height);
        ctx.stroke();
      }

      if (data.length < 2) {
        ctx.fillStyle = '#64748b';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillText('Awaiting high-frequency 20 Hz SCADA stream...', width / 2 - 130, height / 2);
        return;
      }

      const paddingLeft = 35;
      const paddingBottom = 20;
      const drawW = width - paddingLeft - 10;
      const drawH = height - paddingBottom - 10;

      if (activeTab === 'pressure') {
        // Tab 1: Live Pressure Waves (Inlet: Cyan, Outlet: Amber)
        const minP = 70;
        const maxP = 150;
        const scaleY = (p: number) => 10 + (1 - (p - minP) / (maxP - minP)) * drawH;
        const scaleX = (idx: number) => paddingLeft + (idx / (data.length - 1)) * drawW;

        // Y-axis labels
        ctx.fillStyle = '#475569';
        ctx.font = '9px monospace';
        [80, 100, 120, 140].forEach((pVal) => {
          ctx.fillText(`${pVal}`, 5, scaleY(pVal) + 3);
        });

        // Outlet wave line
        ctx.beginPath();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        data.forEach((d, i) => {
          const x = scaleX(i);
          const y = scaleY(d.pOut);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Inlet wave line
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        data.forEach((d, i) => {
          const x = scaleX(i);
          const y = scaleY(d.pIn);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // High frequency glow on latest point
        const last = data[data.length - 1];
        const lastX = scaleX(data.length - 1);
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(lastX, scaleY(last.pIn), 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(lastX, scaleY(last.pOut), 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (activeTab === 'gradient') {
        // Tab 2: Rate of Drop dP/dt
        const scaleX = (idx: number) => paddingLeft + (idx / (data.length - 1)) * drawW;
        const zeroY = 10 + drawH / 2;

        // Zero baseline
        ctx.strokeStyle = '#334155';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(paddingLeft, zeroY);
        ctx.lineTo(width, zeroY);
        ctx.stroke();
        ctx.setLineDash([]);

        // dP_in/dt line
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        data.forEach((d, i) => {
          const x = scaleX(i);
          const y = zeroY - d.dpInDt * 10;
          if (i === 0) ctx.moveTo(x, Math.max(10, Math.min(height - 10, y)));
          else ctx.lineTo(x, Math.max(10, Math.min(height - 10, y)));
        });
        ctx.stroke();

        // Threshold boundary (-2.5 bar/s)
        const threshY = zeroY - (-2.5) * 10;
        ctx.strokeStyle = '#f43f5e';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(paddingLeft, threshY);
        ctx.lineTo(width, threshY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#f43f5e';
        ctx.font = '9px monospace';
        ctx.fillText('Breach Threshold (-2.5 bar/s)', width - 165, threshY - 4);
      } else {
        // Tab 3: Steady-State Hydraulic Profile along 10km
        const segPressures = telemetry?.segment_pressures || { '1': 125, '2': 116, '3': 106, '4': 97, '5': 88 };
        const pts = [
          { km: 0, p: telemetry?.p_inlet ?? 135 },
          { km: 2, p: segPressures['1'] ?? 125 },
          { km: 4, p: segPressures['2'] ?? 116 },
          { km: 6, p: segPressures['3'] ?? 106 },
          { km: 8, p: segPressures['4'] ?? 97 },
          { km: 10, p: telemetry?.p_outlet ?? 88 },
        ];

        const scaleX = (km: number) => paddingLeft + (km / 10.0) * drawW;
        const scaleY = (p: number) => 10 + (1 - (p - 70) / (150 - 70)) * drawH;

        ctx.beginPath();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        pts.forEach((pt, i) => {
          const x = scaleX(pt.km);
          const y = scaleY(pt.p);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Segment node dots
        pts.forEach((pt) => {
          const x = scaleX(pt.km);
          const y = scaleY(pt.p);
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    };

    render();
  }, [telemetry, activeTab]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col justify-between h-full min-h-[480px]">
      {/* 1. Header: Mathematical NPW Status Callout in simple words */}
      <div className="border-b border-slate-800 pb-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-slate-100 tracking-wider">
              LEAK CALCULATOR & LIVE PRESSURE CHARTS
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
              Sound Speed = 1,150 m/s
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
              Pipe = 10 km
            </span>
          </div>
        </div>

        {/* Compact Formula & Detection Pill */}
        <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400">LEAK POSITION FORMULA (NPW)</div>
            <div className="font-mono text-sm font-bold text-cyan-300">
              X = (L − C × Δt) / 2
            </div>
          </div>

          {isDetected && loc ? (
            <div className="text-right">
              <span className="text-[9px] font-mono text-rose-400 font-semibold bg-rose-950/50 px-2 py-0.5 rounded border border-rose-500/30 inline-block mb-0.5">
                LEAK FOUND: KM {loc.location_km}
              </span>
              <div className="text-[10px] font-mono text-slate-300">
                Time Delay: {loc.delta_t.toFixed(3)}s ({loc.segment.name})
              </div>
            </div>
          ) : (
            <div className="text-right text-[10px] font-mono text-slate-500">
              <span>Sensors Listening for Leaks</span>
              <div className="text-[9px] text-emerald-500">Normal Safe Flow</div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Oscilloscope Tab Controls */}
      <div className="flex items-center justify-between mt-2 mb-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('pressure')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
              activeTab === 'pressure'
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Pressure
          </button>
          <button
            onClick={() => setActiveTab('gradient')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
              activeTab === 'gradient'
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Drop Rate
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
              activeTab === 'profile'
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pipe Profile
          </button>
        </div>

        {/* Legend */}
        {activeTab === 'pressure' && (
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-0.5 bg-cyan-400 inline-block"></span> Start Pipe
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-0.5 bg-amber-400 inline-block"></span> End Pipe
            </span>
          </div>
        )}
      </div>

      {/* 3. Live Canvas Waveform Display */}
      <div className="flex-1 w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 relative min-h-[220px]">
        <canvas
          ref={canvasRef}
          width={480}
          height={240}
          className="w-full h-full block"
        />
      </div>

      {/* 4. Bottom Edge Analytics Telemetry Ribbon in simple words */}
      <div className="mt-2.5 pt-2 border-t border-slate-800 grid grid-cols-3 gap-2 text-[10px] font-mono">
        <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
          <span className="text-slate-400 block">Drop Speed</span>
          <span
            className={`font-bold text-xs ${
              (telemetry?.analytics?.dp_in_dt || 0) < -2.0 ? 'text-rose-400' : 'text-slate-200'
            }`}
          >
            {(telemetry?.analytics?.dp_in_dt || 0).toFixed(1)} bar/s
          </span>
        </div>

        <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
          <span className="text-slate-400 block">Flow Difference</span>
          <span
            className={`font-bold text-xs ${
              Math.abs(telemetry?.analytics?.mass_imbalance || 0) > 10 ? 'text-amber-400' : 'text-slate-200'
            }`}
          >
            {(telemetry?.analytics?.mass_imbalance || 0).toFixed(1)} m³/h
          </span>
        </div>

        <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
          <span className="text-slate-400 block">Leak Risk</span>
          <span
            className={`font-bold text-xs ${
              (telemetry?.analytics?.anomaly_score || 0) > 0.5 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {((telemetry?.analytics?.anomaly_score || 0) * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
};
