import React, { useEffect, useRef, useState } from 'react';
import { TelemetryPayload } from '../types/telemetry';
import { Activity, BarChart3, TrendingDown, Layers } from 'lucide-react';

interface PressureChartsProps {
  telemetry: TelemetryPayload | null;
}

interface DataPoint {
  time: number;
  pIn: number;
  pOut: number;
  dpInDt: number;
  dpOutDt: number;
}

export const PressureCharts: React.FC<PressureChartsProps> = ({ telemetry }) => {
  const [activeTab, setActiveTab] = useState<'pressure' | 'gradient' | 'profile'>('pressure');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<DataPoint[]>([]);

  // Collect history
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

  // Canvas drawing loop
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

      // Clear dark background
      ctx.fillStyle = '#031122';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = '#0a2540';
      ctx.lineWidth = 1;
      const gridRows = 5;
      for (let r = 0; r <= gridRows; r++) {
        const y = (height / gridRows) * r;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (activeTab === 'pressure') {
        // Tab 1: Inlet vs Outlet Pressure (bar)
        // Scale 50 bar to 150 bar
        const minP = 50;
        const maxP = 150;
        const scaleY = (p: number) => height - ((p - minP) / (maxP - minP)) * height;

        // Draw normal reference baseline dashed line
        ctx.strokeStyle = '#10b98133';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, scaleY(135));
        ctx.lineTo(width, scaleY(135));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, scaleY(88));
        ctx.lineTo(width, scaleY(88));
        ctx.stroke();
        ctx.setLineDash([]);

        if (data.length > 1) {
          const stepX = width / (data.length - 1);

          // Draw Inlet Pressure (Cyan)
          ctx.strokeStyle = '#00f2fe';
          ctx.lineWidth = 2.2;
          ctx.shadowColor = '#00f2fe';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          data.forEach((d, i) => {
            const x = i * stepX;
            const y = scaleY(d.pIn);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();

          // Draw Outlet Pressure (Amber/Orange)
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.2;
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          data.forEach((d, i) => {
            const x = i * stepX;
            const y = scaleY(d.pOut);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Labels
        ctx.fillStyle = '#64748b';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText('150 bar', 6, 14);
        ctx.fillText('100 bar', 6, scaleY(100) - 4);
        ctx.fillText('50 bar', 6, height - 6);

      } else if (activeTab === 'gradient') {
        // Tab 2: Wavefront Gradient dP/dt
        // Scale -4.0 to +4.0 bar/s
        const scaleY = (v: number) => height / 2 - (v / 4.0) * (height / 2);

        // Zero line
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Threshold trigger zone
        ctx.fillStyle = '#ef444415';
        ctx.fillRect(0, scaleY(-0.45), width, height - scaleY(-0.45));

        if (data.length > 1) {
          const stepX = width / (data.length - 1);

          // Inlet gradient
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          data.forEach((d, i) => {
            const x = i * stepX;
            const y = scaleY(Math.max(-4, Math.min(4, d.dpInDt)));
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();

          // Outlet gradient
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 2;
          ctx.beginPath();
          data.forEach((d, i) => {
            const x = i * stepX;
            const y = scaleY(Math.max(-4, Math.min(4, d.dpOutDt)));
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
        }

        ctx.fillStyle = '#ef4444';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText('NPW ONSET THRESHOLD (-0.45 bar/s)', width - 210, scaleY(-0.45) - 4);

      } else {
        // Tab 3: Spatial Pressure Profile (0 to 10 km)
        if (telemetry) {
          const segP = telemetry.segment_pressures || {};
          const profile = [
            { km: 0, p: telemetry.p_inlet },
            { km: 2, p: segP[1] || 125 },
            { km: 4, p: segP[2] || 115 },
            { km: 6, p: segP[3] || 105 },
            { km: 8, p: segP[4] || 95 },
            { km: 10, p: telemetry.p_outlet },
          ];

          const minP = 40;
          const maxP = 150;
          const scaleY = (p: number) => height - ((p - minP) / (maxP - minP)) * height;
          const scaleX = (km: number) => 40 + (km / 10.0) * (width - 70);

          // Draw Gradient line across distance
          ctx.strokeStyle = '#00f2fe';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#00f2fe';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          profile.forEach((pt, i) => {
            const x = scaleX(pt.km);
            const y = scaleY(pt.p);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Draw Segment Data Points
          profile.forEach((pt) => {
            const x = scaleX(pt.km);
            const y = scaleY(pt.p);
            ctx.fillStyle = '#020b15';
            ctx.strokeStyle = '#00f2fe';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#e2e8f0';
            ctx.font = '10px JetBrains Mono';
            ctx.fillText(`${pt.p.toFixed(1)}b`, x - 12, y - 9);
            ctx.fillText(`${pt.km}km`, x - 10, height - 6);
          });
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab, telemetry]);

  return (
    <div className="bg-ocean-900/90 rounded-xl border border-cyan-500/20 p-3 shadow-lg flex flex-col gap-2">
      {/* Chart Header & Tab Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-semibold text-slate-200">
            HIGH-FREQUENCY TELEMETRY OSCILLOSCOPE (20 Hz)
          </span>
        </div>

        <div className="flex items-center gap-1 bg-ocean-950/80 p-0.5 rounded-lg border border-slate-700/50">
          <button
            onClick={() => setActiveTab('pressure')}
            className={`px-2 py-1 text-[11px] font-mono rounded transition-all ${
              activeTab === 'pressure'
                ? 'bg-cyan-500 text-black font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            P(t) Inlet/Outlet
          </button>
          <button
            onClick={() => setActiveTab('gradient')}
            className={`px-2 py-1 text-[11px] font-mono rounded transition-all ${
              activeTab === 'gradient'
                ? 'bg-cyan-500 text-black font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            dP/dt Wavefront
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-2 py-1 text-[11px] font-mono rounded transition-all ${
              activeTab === 'profile'
                ? 'bg-cyan-500 text-black font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Spatial 10km Profile
          </button>
        </div>
      </div>

      {/* Real-time Oscilloscope Canvas */}
      <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-800">
        <canvas ref={canvasRef} width={640} height={176} className="w-full h-full block" />
      </div>

      {/* Legend & Current Readout */}
      <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-800">
        {activeTab === 'pressure' && (
          <>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-glow-cyan"></span>
                Inlet: <strong className="text-white">{telemetry?.p_inlet.toFixed(2) ?? '135.00'} bar</strong>
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                Outlet: <strong className="text-white">{telemetry?.p_outlet.toFixed(2) ?? '88.00'} bar</strong>
              </span>
            </div>
            <span className="text-slate-400">
              ΔP: <strong className="text-cyan-300">{telemetry?.delta_p.toFixed(2) ?? '47.00'} bar</strong>
            </span>
          </>
        )}

        {activeTab === 'gradient' && (
          <>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span>
                dP_in/dt: <strong className="text-white">{telemetry?.analytics?.dp_in_dt.toFixed(3) ?? '0.000'} bar/s</strong>
              </span>
              <span className="flex items-center gap-1.5 text-pink-400">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block"></span>
                dP_out/dt: <strong className="text-white">{telemetry?.analytics?.dp_out_dt.toFixed(3) ?? '0.000'} bar/s</strong>
              </span>
            </div>
            <span className="text-red-400 font-semibold">Edge Trigger: -0.45 bar/s</span>
          </>
        )}

        {activeTab === 'profile' && (
          <div className="w-full flex items-center justify-between text-slate-300">
            <span>Frictional Head Loss: ~4.7 bar/km</span>
            <span>Hydrocarbon Density: 845 kg/m³</span>
            <span className="text-cyan-400">Total Length: 10,000 m</span>
          </div>
        )}
      </div>
    </div>
  );
};

