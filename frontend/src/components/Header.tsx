import React, { useState } from 'react';
import { TelemetryPayload } from '../types/telemetry';
import { audioManager } from '../utils/audio';
import {
  Volume2,
  VolumeX,
  FileSpreadsheet,
  BookOpen,
  Radio,
  Lock,
  ShieldAlert,
} from 'lucide-react';

interface HeaderProps {
  telemetry: TelemetryPayload | null;
  wsConnected: boolean;
  onOpenBlindTest: () => void;
  onOpenGuide: () => void;
  onEmergencyMasterESD: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  telemetry,
  wsConnected,
  onOpenBlindTest,
  onOpenGuide,
  onEmergencyMasterESD,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(audioManager.isMuted);

  const toggleMute = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  const isLeak = telemetry?.sim_status?.leak_active || Boolean(telemetry?.npw_localization?.detected);
  const health = telemetry?.analytics?.health_status || 'GREEN';

  return (
    <header className="bg-ocean-950/95 backdrop-blur-md border-b border-cyan-500/20 px-4 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-40">
      {/* Branding & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 flex items-center justify-center shadow-glow-cyan">
          <div className="w-full h-full bg-ocean-950 rounded-[6px] flex items-center justify-center">
            <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-base font-bold tracking-wider text-white">
              DEEPGUARD <span className="text-cyan-400 font-normal">| SUBSEA DIGITAL TWIN</span>
            </h1>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            10 km Multiphase Subsea Pipeline (5 Segments • NPW Edge Analytics)
          </div>
        </div>
      </div>

      {/* Header Actions (Clean & Uncluttered) */}
      <div className="flex items-center gap-2.5">
        {/* Continuous Breach Alarm Indicator & Silence Toggle */}
        {isLeak && !isMuted && (
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950 border border-red-500/80 text-xs font-mono font-bold text-red-200 animate-pulse shadow-glow-red hover:bg-red-900 transition-all cursor-pointer"
            title="Breach alarm ringing continuously. Click to silence alarm"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-bounce" />
            <span>ALARM RINGING (Silence)</span>
          </button>
        )}

        {isLeak && isMuted && (
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/60 text-xs font-mono text-amber-300 hover:bg-amber-900 transition-all cursor-pointer"
            title="Alarm is currently silenced. Click to unmute"
          >
            <VolumeX className="w-3.5 h-3.5 text-amber-400" />
            <span>ALARM MUTED (Unmute)</span>
          </button>
        )}

        {/* Status Badge */}
        <div className="flex items-center gap-1.5 bg-ocean-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              wsConnected
                ? isLeak
                  ? 'bg-red-500 animate-ping'
                  : 'bg-emerald-400 shadow-glow-emerald'
                : 'bg-red-500'
            }`}
          />
          <span className="text-slate-300">{wsConnected ? (isLeak ? 'BREACH ACTIVE' : '20Hz LIVE') : 'OFFLINE'}</span>
        </div>

        {/* Sound Toggle Button */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Sound muted (Click to enable audio alerts)' : 'Sound active (Click to mute)'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
            isMuted
              ? 'bg-ocean-900 text-slate-500 border-slate-800 hover:text-slate-300'
              : 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/70 shadow-glow-cyan'
          }`}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{isMuted ? 'Muted' : 'Audio On'}</span>
        </button>

        {/* Blind Testing Lab */}
        <button
          onClick={onOpenBlindTest}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ocean-900 hover:bg-cyan-950 text-cyan-200 border border-cyan-500/40 text-xs font-mono font-medium transition-all"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
          <span>Blind CSV Lab</span>
        </button>

        {/* Guide */}
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ocean-900 hover:bg-ocean-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-all"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Guide</span>
        </button>

        {/* Master Emergency ESD Shutdown */}
        <button
          onClick={onEmergencyMasterESD}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white font-mono text-xs font-bold tracking-wider transition-all shadow-glow-red"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>MASTER ESD</span>
        </button>
      </div>
    </header>
  );
};
