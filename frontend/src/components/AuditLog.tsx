import React from 'react';
import { AuditEvent } from '../types/telemetry';
import { ListFilter, ShieldAlert, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface AuditLogProps {
  events: AuditEvent[];
}

export const AuditLog: React.FC<AuditLogProps> = ({ events }) => {
  const getIcon = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />;
    }
  };

  const getBadgeStyle = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-950/70 border-rose-500/40';
      case 'WARNING':
        return 'text-amber-400 bg-amber-950/70 border-amber-500/40';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-slate-100 tracking-wider">
            RECENT ACTIVITY & EVENTS
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {events.length} events recorded
        </span>
      </div>

      <div className="space-y-1.5 flex-1 max-h-56 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="text-center py-6 text-xs font-mono text-slate-500">
            Pipeline is safe. No alerts recorded.
          </div>
        ) : (
          [...events].reverse().map((ev) => (
            <div
              key={ev.id}
              className="flex items-start gap-2 bg-slate-950/70 p-2 rounded-lg border border-slate-800 text-[11px] font-mono transition-all hover:border-slate-700"
            >
              {getIcon(ev.severity)}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${getBadgeStyle(ev.severity)}`}>
                    {ev.severity === 'CRITICAL' ? 'LEAK ALERT' : ev.severity === 'WARNING' ? 'WARNING' : 'INFO'}
                  </span>
                  <span className="text-[9px] text-slate-500">T+{ev.timestamp.toFixed(1)}s</span>
                </div>
                <div className="text-slate-300 text-[11px] mt-1 leading-snug">{ev.message}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
