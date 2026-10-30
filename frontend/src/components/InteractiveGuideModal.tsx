import React, { useState } from 'react';
import { X, BookOpen, Waves, ShieldCheck, Cpu, ArrowRight, Zap, Play, CheckCircle2 } from 'lucide-react';

interface InteractiveGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectDemo: (loc: number, sev: number) => void;
}

export const InteractiveGuideModal: React.FC<InteractiveGuideModalProps> = ({
  isOpen,
  onClose,
  onInjectDemo,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'concept' | 'math' | 'segments' | 'checklist'>('concept');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-ocean-900 border border-cyan-500/40 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="bg-ocean-950 px-5 py-3.5 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-mono text-base font-bold text-white tracking-wide">
                DEEPGUARD: SYSTEM ARCHITECTURE & INTERACTIVE GUIDE
              </h2>
              <div className="text-[11px] font-mono text-slate-400">
                Understand the physics, the NPW formula, and the 5-segment isolation system
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-ocean-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-ocean-950/80 px-4 pt-2 border-b border-slate-800 overflow-x-auto text-xs font-mono">
          {[
            { id: 'concept', label: '1. What is NPW?', icon: Waves },
            { id: 'math', label: '2. The Formula Explained', icon: Cpu },
            { id: 'segments', label: '3. 5 Segments & Virtual ESD', icon: ShieldCheck },
            { id: 'checklist', label: '4. 30-Second Demo Script', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-300 bg-ocean-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {activeTab === 'concept' && (
            <div className="space-y-4">
              <div className="bg-ocean-950/70 p-4 rounded-xl border border-cyan-500/30">
                <h3 className="text-sm font-mono font-bold text-cyan-300 mb-2">
                  HOW DOES NEGATIVE PRESSURE WAVE (NPW) DETECTION WORK?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Imagine an intact subsea pipeline running at <strong>135 bar</strong> pressure. When a crack or fracture occurs, pressurized oil shoots out into the sea. This sudden escape of liquid creates an instantaneous pressure drop—a <strong>negative acoustic pressure shockwave</strong>—that travels inside the fluid in both directions at the speed of sound (<span className="text-cyan-300 font-mono font-semibold">1,150 m/s</span>).
                </p>
              </div>

              {/* Visual Diagram */}
              <div className="bg-ocean-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="text-slate-400 text-[11px] font-semibold">PHYSICAL WAVE SPREAD DIAGRAM:</div>
                <div className="relative py-6 px-4 bg-ocean-900/60 rounded-lg border border-slate-700/60">
                  {/* Pipeline bar */}
                  <div className="h-4 bg-slate-700 rounded-full relative flex items-center">
                    <div className="absolute left-0 w-3 h-6 bg-cyan-400 rounded -translate-y-1 shadow-glow-cyan" title="Inlet Sensor (0 km)" />
                    <div className="absolute right-0 w-3 h-6 bg-amber-400 rounded -translate-y-1" title="Outlet Sensor (10 km)" />
                    <div className="absolute left-[34.5%] -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 animate-ping" />
                    <div className="absolute left-[34.5%] -translate-x-1/2 w-3 h-3 rounded-full bg-red-500" />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 mt-3">
                    <span className="text-cyan-400 font-bold">Inlet Sensor (x=0)</span>
                    <span className="text-red-400 font-bold">Rupture Point (X)</span>
                    <span className="text-amber-400 font-bold">Outlet Sensor (x=L)</span>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-300 mt-2 pt-2 border-t border-slate-800">
                    <span>Wave arrival: <strong className="text-cyan-300">t₁ = X / C</strong></span>
                    <span>Wave arrival: <strong className="text-amber-300">t₂ = (L - X) / C</strong></span>
                  </div>
                </div>

                <div className="text-slate-300 text-xs">
                  By measuring the millisecond difference <span className="text-cyan-300">Δt = t₂ − t₁</span> between the two sensors, we can pinpoint the leak location with sub-meter accuracy!
                </div>
              </div>
            </div>
          )}

          {activeTab === 'math' && (
            <div className="space-y-4">
              <div className="bg-ocean-950/80 p-4 rounded-xl border border-cyan-500/30 text-center">
                <div className="text-xs font-mono text-slate-400 mb-1">PRIMARY GOVERNING EQUATION</div>
                <div className="text-2xl font-mono font-bold text-cyan-350 drop-shadow-[0_0_12px_rgba(56,245,248,0.5)]">
                  X = (L − C × Δt) / 2
                </div>
                <div className="text-xs font-mono text-emerald-400 mt-1 font-semibold">
                  Where: L = 10,000 m • C = 1,150 m/s • Δt = t_outlet − t_inlet
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-ocean-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-cyan-300 font-bold">CASE 1: Leak at Inlet (X = 0m)</div>
                  <div className="text-slate-300">
                    Wave hits inlet immediately: t₁ = 0s<br />
                    Wave hits outlet: t₂ = 10,000 / 1,150 = 8.69s<br />
                    Δt = 8.69s<br />
                    <span className="text-emerald-400 font-bold">X = (10,000 - 1,150×8.69)/2 = 0 m ✓</span>
                  </div>
                </div>

                <div className="bg-ocean-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-cyan-300 font-bold">CASE 2: Midpoint (X = 5,000m)</div>
                  <div className="text-slate-300">
                    Wave hits both ends simultaneously:<br />
                    t₁ = t₂ = 4.35s<br />
                    Δt = 0.0s<br />
                    <span className="text-emerald-400 font-bold">X = (10,000 - 0)/2 = 5,000 m ✓</span>
                  </div>
                </div>

                <div className="bg-ocean-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-cyan-300 font-bold">CASE 3: Demo Target (X = 3,450m)</div>
                  <div className="text-slate-300">
                    t₁ = 3,450 / 1,150 = 3.00s<br />
                    t₂ = (10,000 - 3,450) / 1,150 = 5.70s<br />
                    Δt = 5.70 - 3.00 = +2.70s<br />
                    <span className="text-emerald-400 font-bold">X = (10,000 - 3,105)/2 = 3,450 m ✓</span>
                  </div>
                </div>

                <div className="bg-ocean-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-cyan-300 font-bold">CASE 4: Leak at Outlet (X = 10,000m)</div>
                  <div className="text-slate-300">
                    Wave hits outlet first: t₂ = 0s<br />
                    Wave hits inlet: t₁ = 8.69s<br />
                    Δt = -8.69s<br />
                    <span className="text-emerald-400 font-bold">X = (10,000 - 1,150×(-8.69))/2 = 10,000 m ✓</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'segments' && (
            <div className="space-y-3">
              <div className="bg-ocean-950/80 p-3.5 rounded-xl border border-cyan-500/30 text-xs">
                <h4 className="font-mono font-bold text-cyan-300 mb-1">
                  HOW DOES MULTI-SEGMENT VIRTUAL ESD ISOLATION WORK?
                </h4>
                <p className="text-slate-300 font-sans leading-relaxed">
                  Instead of shutting down an entire 10 km offshore trunkline—which takes hours to restart and bleeds thousands of barrels into the sea—DeepGuard partitions the pipe into <strong>5 sectors of 2 km each</strong> protected by 6 hydraulic Emergency Shutdown (ESD) valves (V0 through V5).
                </p>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {[
                  { id: 1, name: 'Segment 1 (0 to 2 km)', valves: 'V0 & V1', desc: 'Inlet Riser & Shallow Seabed Shelf' },
                  { id: 2, name: 'Segment 2 (2 to 4 km)', valves: 'V1 & V2', desc: 'Continental Shelf Transition Zone' },
                  { id: 3, name: 'Segment 3 (4 to 6 km)', valves: 'V2 & V3', desc: 'Abyssal Deepwater Trench (Midpoint)' },
                  { id: 4, name: 'Segment 4 (6 to 8 km)', valves: 'V3 & V4', desc: 'Seaward Continental Slope' },
                  { id: 5, name: 'Segment 5 (8 to 10 km)', valves: 'V4 & V5', desc: 'Outlet PLEM Receiving Manifold' },
                ].map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg bg-ocean-950 border border-slate-800">
                    <div>
                      <span className="font-bold text-white">SEG {s.id}: {s.name}</span>
                      <div className="text-[11px] text-slate-400 mt-0.5">{s.desc}</div>
                    </div>
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-500/30">
                      Valves: {s.valves}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-3">
              <div className="bg-ocean-950/80 p-3.5 rounded-xl border border-cyan-500/30 text-xs font-mono">
                <div className="font-bold text-cyan-300 mb-1">RECOMMENDED HACKATHON LIVE DEMO CHECKLIST:</div>
                <div className="text-slate-300">Follow these 3 easy steps to show judges the full Detect → Localize → Visualize → Respond cycle:</div>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 rounded-lg bg-ocean-950 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold shrink-0 mt-0.5">1</div>
                  <div className="flex-1">
                    <div className="font-bold text-white">Show Baseline Steady Flow</div>
                    <div className="text-slate-400 mt-0.5">Point out the healthy 135 bar inlet, green indicators, and the AUV patrolling the 3D twin.</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-ocean-950 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold shrink-0 mt-0.5">2</div>
                  <div className="flex-1">
                    <div className="font-bold text-white">Trigger Rupture at 3,450m</div>
                    <div className="text-slate-400 mt-0.5">Click the button below to inject a breach in Segment 2. Watch the NPW wavefront spike on the oscilloscope and the 3D bubble plume erupt!</div>
                    <button
                      onClick={() => {
                        onInjectDemo(3450, 0.25);
                        onClose();
                      }}
                      className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-glow-red"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Try Scenario 2 Now (3,450m)
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-ocean-950 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold shrink-0 mt-0.5">3</div>
                  <div className="flex-1">
                    <div className="font-bold text-white">Demonstrate Isolation & Unisolate</div>
                    <div className="text-slate-400 mt-0.5">Show how valves V1 & V2 auto-close to contain the spill, then click the segment card button to test reopening (un-isolating) the line!</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-ocean-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">DeepGuard Subsea Integrity Platform</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs"
          >
            Got It! Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

