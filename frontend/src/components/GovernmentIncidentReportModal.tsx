import React from 'react';
import { TelemetryPayload } from '../types/telemetry';
import { X, Printer, ShieldCheck, AlertTriangle, FileText, Building2, CheckCircle2 } from 'lucide-react';

interface GovernmentIncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryPayload | null;
}

export const GovernmentIncidentReportModal: React.FC<GovernmentIncidentReportModalProps> = ({
  isOpen,
  onClose,
  telemetry,
}) => {
  if (!isOpen) return null;

  const loc = telemetry?.npw_localization;
  const isLeak = telemetry?.sim_status?.leak_active || Boolean(loc?.detected);
  const leakLocM = loc?.location_m ?? telemetry?.sim_status?.leak_location_m ?? 3450;
  const spillM3 = telemetry?.sim_status?.cumulative_spill_m3 ?? 14.8;
  const spillBbl = telemetry?.sim_status?.cumulative_spill_bbl ?? 93.1;
  const isolated = telemetry?.sim_status?.isolated_segments || [];

  const handlePrint = () => {
    window.print();
  };

  const reportId = `DGH-INC-2026-${Math.floor(telemetry?.timestamp || 42).toString().padStart(4, '0')}`;
  const currentDate = new Date().toUTCString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-ocean-950 px-5 py-3.5 border-b border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-mono text-base font-bold text-white tracking-wide">
                MINISTRY OF PETROLEUM & NATURAL GAS • STATUTORY INCIDENT DOSSIER
              </h2>
              <div className="text-[11px] font-mono text-slate-400">
                Form DGH/OPIM-Form-4 • Official Offshore Spill & Integrity Audit Certificate
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

        {/* Printable Official Government Document Body */}
        <div className="p-6 space-y-5 overflow-y-auto bg-slate-950 text-slate-100 font-mono text-xs">
          {/* Official Document Letterhead */}
          <div className="border-b-2 border-slate-700 pb-4 flex flex-col items-center text-center space-y-1">
            <div className="text-[10px] tracking-widest text-amber-400 font-bold uppercase">
              Government of India • Ministry of Petroleum & Natural Gas
            </div>
            <div className="text-sm font-extrabold text-white tracking-wider">
              DIRECTORATE GENERAL OF HYDROCARBONS (DGH)
            </div>
            <div className="text-[10px] text-slate-400">
              National Critical Offshore Infrastructure Protection Division • New Delhi
            </div>
            <div className="text-[10px] px-2 py-0.5 rounded bg-blue-950 border border-blue-500/40 text-blue-300 font-bold mt-1">
              STATUTORY NOTICE OF ACCIDENTAL SUBSEA RELEASE & MITIGATION (ISO 13623 / MARPOL COMPLIANT)
            </div>
          </div>

          {/* Dossier Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400">DOSSIER REGISTRATION:</span>
              <div className="font-bold text-cyan-300">{reportId}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">ASSET IDENTIFIER:</span>
              <div className="font-bold text-white">KG-D6-TRUNKLINE-04</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">FILING TIMESTAMP:</span>
              <div className="font-bold text-white">{currentDate}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">MARITIME REGION:</span>
              <div className="font-bold text-white">Bay of Bengal Sector B</div>
            </div>
          </div>

          {/* Incident Severity Status */}
          <div className="p-3 rounded-lg border border-red-500/60 bg-red-950/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-red-300 font-bold text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                CLASSIFICATION: LEVEL-4 CRITICAL DEEPWATER BREACH
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/80 text-red-200 font-bold">
                MANDATORY REGULATORY AUDIT
              </span>
            </div>
            <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Instantaneous subsea pipeline structural integrity failure detected via high-frequency transient acoustic transducers. Negative Pressure Wave (NPW) arrival confirmed at both inlet and delivery PLEM terminals.
            </div>
          </div>

          {/* Mathematical & Physical Finding */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-cyan-300 border-b border-slate-800 pb-1">
              SECTION A: ACOUSTIC NPW WAVEFRONT MATHEMATICAL RESOLUTION
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span>Governing NPW Equation:</span>
                <span className="text-cyan-400 font-bold font-mono">X = (L − C × Δt) / 2</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1 border-t border-slate-800">
                <div>Total Pipeline Length (L): <strong className="text-white">10,000.0 m (10.0 km)</strong></div>
                <div>Sonic Wave Velocity (C): <strong className="text-white">1,150.0 m/s (Hydrocarbon/Steel)</strong></div>
                <div>Inlet Transducer Wave Arrival (t₁): <strong className="text-cyan-300">{loc ? `${loc.t_inlet.toFixed(3)}s` : '28.000s'}</strong></div>
                <div>Outlet Transducer Wave Arrival (t₂): <strong className="text-amber-300">{loc ? `${loc.t_outlet.toFixed(3)}s` : '30.696s'}</strong></div>
                <div>Measured Acoustic Wave Delta (Δt): <strong className="text-white">{loc ? `${(loc.delta_t * 1000).toFixed(1)} ms` : '2,696.0 ms'}</strong></div>
                <div>Resolved Distance from Wellhead (X): <strong className="text-red-400 font-bold">{leakLocM.toFixed(1)} meters ({(leakLocM / 1000).toFixed(3)} km)</strong></div>
              </div>
              <div className="text-emerald-400 font-bold text-[11px] bg-emerald-950/40 p-2 rounded border border-emerald-500/30">
                Statutory Localization Verification: Sector Attribution → {loc?.segment.name || 'Segment 2 (Shallow Bathymetry)'} • Precision Margin: ±1.2m
              </div>
            </div>
          </div>

          {/* Environmental Impact & Containment Section */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-cyan-300 border-b border-slate-800 pb-1">
              SECTION B: ENVIRONMENTAL SPILL ASSESSMENT & MARPOL ANNEX I STATUS
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px]">TOTAL CRUDE RELEASED:</span>
                <div className="text-sm font-bold text-orange-400">{spillM3.toFixed(2)} m³ ({spillBbl.toFixed(1)} bbls)</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px]">VIRTUAL ESD CONTAINMENT:</span>
                <div className="text-sm font-bold text-emerald-400">
                  {isolated.length > 0 ? `SECTORS ${isolated.join(', ')} ISOLATED` : 'AUTO ESD ACTIVE'}
                </div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px]">DISCHARGE ATTENUATION:</span>
                <div className="text-sm font-bold text-cyan-300">95.4% CHOKED BY VALVES</div>
              </div>
            </div>
          </div>

          {/* Regulatory Attestation & Official Stamp */}
          <div className="border-t border-slate-800 pt-3 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-slate-400 text-[10px]">
              <div>Official Examiner: <strong className="text-white">Chief Inspector of Offshore Pipelines</strong></div>
              <div>Regulatory Authority: <strong className="text-white">Directorate General of Hydrocarbons, New Delhi</strong></div>
              <div className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                VERIFIED & REGISTERED UNDER CRITICAL INFRASTRUCTURE STATUTE
              </div>
            </div>

            <div className="border-2 border-dashed border-cyan-400/40 p-3 rounded-lg text-center bg-cyan-950/20">
              <div className="text-[9px] font-bold text-cyan-300">DGH STATUTORY SEAL</div>
              <div className="text-[8px] text-slate-400">AUTHENTICATED DIGITAL SUBSEA AUDIT</div>
              <div className="text-[10px] font-extrabold text-amber-400 mt-1">APPROVED FOR ARCHIVAL</div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-ocean-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-cyan-300 text-xs font-mono transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Official Government Certificate
          </button>
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

