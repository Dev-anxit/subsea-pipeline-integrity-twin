import React from 'react';
import { TelemetryPayload } from '../types/telemetry';
import { audioManager } from '../utils/audio';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  BookOpen,
  Lock,
  FileText,
  Compass,
  Radio,
  Building2,
  Palette,
} from 'lucide-react';

export type ThemeColor = 'ocean' | 'emerald' | 'cyber';

interface GovernmentHeaderProps {
  telemetry: TelemetryPayload | null;
  wsConnected: boolean;
  theme: ThemeColor;
  onThemeChange: (theme: ThemeColor) => void;
  onOpenGuide: () => void;
  onOpenIncidentReport: () => void;
  onOpenHydrographicMap: () => void;
  onOpenSensorDiagnostics?: () => void;
  onEmergencyMasterESD: () => void;
}

export const GovernmentHeader: React.FC<GovernmentHeaderProps> = ({
  telemetry,
  wsConnected,
  theme,
  onThemeChange,
  onOpenGuide,
  onOpenIncidentReport,
  onOpenHydrographicMap,
  onOpenSensorDiagnostics,
  onEmergencyMasterESD,
}) => {
  const [isMuted, setIsMuted] = React.useState<boolean>(audioManager.isMuted);

  const toggleMute = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  const handleTheme = (newTheme: ThemeColor) => {
    audioManager.playClickSound();
    onThemeChange(newTheme);
  };

  const isLeak = telemetry?.sim_status?.leak_active || Boolean(telemetry?.npw_localization?.detected);
  const health = telemetry?.analytics?.health_status || 'GREEN';

  // Threat Level logic in plain, easy words
  const getSecurityLevel = () => {
    if (isLeak) return { level: 'LEVEL 1 • MAJOR LEAK', color: 'bg-rose-950 text-rose-200 border-rose-500 animate-pulse' };
    if (health === 'ORANGE') return { level: 'LEVEL 2 • WARNING', color: 'bg-amber-950 text-amber-200 border-amber-500' };
    if (health === 'YELLOW') return { level: 'LEVEL 3 • CAUTION', color: 'bg-amber-950/70 text-amber-200 border-amber-500/60' };
    return { level: 'STATUS • NORMAL & SAFE', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' };
  };

  const security = getSecurityLevel();

  // Dynamic border/header highlight based on active theme
  const themeHeaderStyles = {
    ocean: 'border-cyan-500/30 shadow-[0_4px_25px_-5px_rgba(6,182,212,0.15)]',
    emerald: 'border-emerald-500/30 shadow-[0_4px_25px_-5px_rgba(16,185,129,0.15)]',
    cyber: 'border-purple-500/30 shadow-[0_4px_25px_-5px_rgba(168,85,247,0.15)]',
  }[theme];

  return (
    <header className={`bg-slate-900/90 border-b px-4 py-2.5 sticky top-0 z-40 backdrop-blur-xl transition-all duration-300 ${themeHeaderStyles}`}>
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Authority Brand & Asset Tag */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-800/90 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-sm md:text-base font-bold tracking-wide text-white">
                UNDERWATER PIPELINE LEAK MONITORING SYSTEM
              </h1>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${security.color}`}>
                {security.level}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className={theme === 'emerald' ? 'text-emerald-400' : theme === 'cyber' ? 'text-purple-400' : 'text-cyan-400'}>
                National Offshore Energy
              </span>
              <span>•</span>
              <span>Pipeline: <strong className="text-slate-200 font-mono">10.0 km Line</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></span>
                {wsConnected ? 'Live Connection Active' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Clean, Interactive Action Toolbar with Theme Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Interactive Color Theme Switcher */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/80 shadow-inner">
            <span className="text-[10px] font-mono text-slate-400 px-1 flex items-center gap-1">
              <Palette className="w-3 h-3" />
              Theme:
            </span>
            <button
              onClick={() => handleTheme('ocean')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all flex items-center gap-1 ${
                theme === 'ocean'
                  ? 'bg-cyan-500 text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
              title="Switch to Deep Ocean Blue Theme"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
              Ocean
            </button>
            <button
              onClick={() => handleTheme('emerald')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all flex items-center gap-1 ${
                theme === 'emerald'
                  ? 'bg-emerald-500 text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
              title="Switch to Emerald Green Theme"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              Emerald
            </button>
            <button
              onClick={() => handleTheme('cyber')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all flex items-center gap-1 ${
                theme === 'cyber'
                  ? 'bg-purple-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-purple-300'
              }`}
              title="Switch to Cyber Purple Theme"
            >
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
              Cyber
            </button>
          </div>

          {/* Active Breach Silence Button */}
          {isLeak && (
            <button
              onClick={toggleMute}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all ${
                isMuted
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-200 hover:bg-amber-900'
                  : 'bg-rose-950 border-rose-500 text-rose-200 animate-pulse hover:bg-rose-900'
              }`}
              title={isMuted ? 'Alarm is quiet. Click to hear sound.' : 'Alarm is ringing. Click to turn sound off.'}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isMuted ? 'SOUND MUTED' : 'MUTE ALARM'}</span>
            </button>
          )}

          {/* Audio Mute/Unmute */}
          <button
            onClick={toggleMute}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              isMuted
                ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                : 'bg-slate-800 text-cyan-300 border-slate-700 hover:border-cyan-500/50'
            }`}
            title="Turn alert sound on or off"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isMuted ? 'Muted' : 'Sound'}</span>
          </button>

          {/* Sea Map */}
          <button
            onClick={() => { audioManager.playClickSound(); onOpenHydrographicMap(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-xs font-mono transition-all shadow-sm"
            title="Open map of the sea and pipeline location"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sea Map</span>
          </button>

          {/* Official Report */}
          <button
            onClick={() => { audioManager.playClickSound(); onOpenIncidentReport(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/70 hover:bg-blue-900 text-blue-200 border border-blue-500/30 text-xs font-mono font-medium transition-all shadow-sm"
            title="View or print official leak incident report"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Leak Report</span>
          </button>

          {/* Sensor Health */}
          {onOpenSensorDiagnostics && (
            <button
              onClick={() => { audioManager.playClickSound(); onOpenSensorDiagnostics(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-all shadow-sm"
              title="Check health of underwater pressure and sound sensors"
            >
              <Radio className="w-3.5 h-3.5 text-slate-400" />
              <span>Sensors</span>
            </button>
          )}

          {/* Help Guide */}
          <button
            onClick={() => { audioManager.playClickSound(); onOpenGuide(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-all shadow-sm"
            title="Open simple user guide and emergency steps"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>User Guide</span>
          </button>

          {/* Master Emergency Stop */}
          <button
            onClick={() => { audioManager.playValveActuation(); onEmergencyMasterESD(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-mono text-xs font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)]"
            title="Emergency: Close all pipeline valves immediately"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>EMERGENCY STOP</span>
          </button>
        </div>
      </div>
    </header>
  );
};
