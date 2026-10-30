import React, { useState, useEffect, useRef } from 'react';
import { TelemetryPayload, DatasetItem } from './types/telemetry';
import { audioManager } from './utils/audio';
import { GovernmentHeader, ThemeColor } from './components/GovernmentHeader';
import { TacticalCommandBar } from './components/TacticalCommandBar';
import { KpiRibbon } from './components/KpiRibbon';
import { DigitalTwin3D } from './components/DigitalTwin3D';
import { TelemetryAnalyticsCard } from './components/TelemetryAnalyticsCard';
import { UnifiedPipelineSectorBar } from './components/UnifiedPipelineSectorBar';
import { AuditLog } from './components/AuditLog';
import { SimulationControlsModal } from './components/SimulationControlsModal';
import { InteractiveGuideModal } from './components/InteractiveGuideModal';
import { GovernmentIncidentReportModal } from './components/GovernmentIncidentReportModal';
import { HydrographicMapModal } from './components/HydrographicMapModal';
import { AssetInspectorModal } from './components/AssetInspectorModal';
import { SensorDiagnosticsModal } from './components/SensorDiagnosticsModal';

const API_BASE = 'http://localhost:8000';
const WS_BASE = 'ws://localhost:8000/ws/telemetry';

export const App: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryPayload | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(null);
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [theme, setTheme] = useState<ThemeColor>('ocean');

  // Modals state
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [isSensorDiagnosticsOpen, setIsSensorDiagnosticsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isIncidentReportOpen, setIsIncidentReportOpen] = useState<boolean>(false);
  const [isHydrographicMapOpen, setIsHydrographicMapOpen] = useState<boolean>(false);
  const [isAssetInspectorOpen, setIsAssetInspectorOpen] = useState<boolean>(false);

  // Sound alert tracking
  const prevHealthRef = useRef<string>('GREEN');
  const prevLeakRef = useRef<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // 1. Fetch available datasets
  const fetchDatasets = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/datasets`);
      if (res.ok) {
        const data = await res.json();
        setDatasets(data);
      }
    } catch (err) {
      console.warn('Failed to fetch datasets:', err);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  // 2. WebSocket Telemetry Streaming
  useEffect(() => {
    let reconnectTimeout: any;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(WS_BASE);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data: TelemetryPayload = JSON.parse(event.data);
            setTelemetry(data);

            // Continuous Alert Sound Loop whenever a breach or critical anomaly is active
            const isLeakNow = Boolean(data.sim_status?.leak_active) || Boolean(data.npw_localization?.detected);
            const curHealth = data.analytics?.health_status;

            if (isLeakNow || curHealth === 'RED') {
              audioManager.startContinuousBreachAlert();
            } else {
              audioManager.stopContinuousBreachAlert();
            }
            prevLeakRef.current = isLeakNow;
            prevHealthRef.current = curHealth || 'GREEN';
          } catch (e) {
            console.error('Failed to parse telemetry message:', e);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectWebSocket, 2000);
        };

        ws.onerror = () => {
          setWsConnected(false);
          ws.close();
        };
      } catch (err) {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 2000);
      }
    };

    connectWebSocket();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // API Actions
  const handleStartSim = async () => {
    await fetch(`${API_BASE}/api/simulation/start`, { method: 'POST' });
  };

  const handlePauseSim = async () => {
    await fetch(`${API_BASE}/api/simulation/pause`, { method: 'POST' });
  };

  const handleResetSim = async () => {
    audioManager.stopContinuousBreachAlert();
    await fetch(`${API_BASE}/api/simulation/reset`, { method: 'POST' });
    audioManager.playSonarPing();
  };

  const handleSetSpeed = async (multiplier: number) => {
    await fetch(`${API_BASE}/api/simulation/speed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ multiplier }),
    });
  };

  const handleInjectLeak = async (locationM: number, severity: number) => {
    await fetch(`${API_BASE}/api/simulation/inject_leak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location_m: locationM, severity }),
    });
    audioManager.startContinuousBreachAlert();
    setIsSimModalOpen(false);
  };

  const handleIsolateSegment = async (segmentId: number) => {
    await fetch(`${API_BASE}/api/simulation/isolate_segment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segment_id: segmentId }),
    });
    audioManager.playValveActuation();
  };

  const handleUnisolateSegment = async (segmentId: number) => {
    await fetch(`${API_BASE}/api/simulation/unisolate_segment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segment_id: segmentId }),
    });
    audioManager.playValveActuation();
  };

  const handleResetValves = async () => {
    await fetch(`${API_BASE}/api/simulation/reset_valves`, { method: 'POST' });
  };

  const handleLoadDataset = async (filename: string) => {
    await fetch(`${API_BASE}/api/datasets/load/${filename}`, { method: 'POST' });
  };

  const handleEmergencyMasterESD = async () => {
    // Isolate all 5 segments simultaneously
    for (let s = 1; s <= 5; s++) {
      await handleIsolateSegment(s);
    }
  };

  const handleSelectSegmentWithInspector = (id: number) => {
    setSelectedSegmentId(id);
    setIsAssetInspectorOpen(true);
  };

  const themeContainerClass = {
    ocean: 'ambient-glow-ocean bg-[#040914] selection:bg-cyan-500 selection:text-black',
    emerald: 'ambient-glow-emerald bg-[#020b08] selection:bg-emerald-500 selection:text-black',
    cyber: 'ambient-glow-cyber bg-[#070312] selection:bg-purple-500 selection:text-white',
  }[theme];

  return (
    <div className={`min-h-screen text-slate-100 flex flex-col font-sans transition-colors duration-500 ${themeContainerClass}`}>
      {/* 1. National Authority Government Header with Theme Switcher */}
      <GovernmentHeader
        telemetry={telemetry}
        wsConnected={wsConnected}
        theme={theme}
        onThemeChange={setTheme}
        onOpenSensorDiagnostics={() => setIsSensorDiagnosticsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenIncidentReport={() => setIsIncidentReportOpen(true)}
        onOpenHydrographicMap={() => setIsHydrographicMapOpen(true)}
        onEmergencyMasterESD={handleEmergencyMasterESD}
      />

      {/* Main Control Room Canvas */}
      <main className="flex-1 p-3 md:p-4 max-w-[1920px] w-full mx-auto flex flex-col gap-3">
        {/* Sleek Incident Command Status & Disaster Drills Strip */}
        <TacticalCommandBar
          telemetry={telemetry}
          onInjectLeak={handleInjectLeak}
          onResetSim={handleResetSim}
          onOpenSimControls={() => setIsSimModalOpen(true)}
        />

        {/* 2. Precision Top KPI Ribbon */}
        <KpiRibbon telemetry={telemetry} />

        {/* 3. Middle Viewport: 3D Digital Twin (Hero) + Precision Telemetry Oscilloscope */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[480px]">
          {/* Left: 3D Underwater Twin (7 cols) */}
          <div className="lg:col-span-7 flex flex-col min-h-[480px]">
            <DigitalTwin3D
              telemetry={telemetry}
              onSelectSegment={handleSelectSegmentWithInspector}
              selectedSegmentId={selectedSegmentId}
            />
          </div>

          {/* Right: Unified Precision Oscilloscope & NPW Mathematical Engine (5 cols) */}
          <div className="lg:col-span-5 flex flex-col min-h-[480px]">
            <TelemetryAnalyticsCard telemetry={telemetry} />
          </div>
        </div>

        {/* 4. Bottom Row: Master 10 KM Synoptic Pipeline Sectors + Operational Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Unified Pipeline Synoptic Track & 5 Sector Controls (8 cols) */}
          <div className="lg:col-span-8 flex flex-col">
            <UnifiedPipelineSectorBar
              telemetry={telemetry}
              onSelectSegment={handleSelectSegmentWithInspector}
              selectedSegmentId={selectedSegmentId}
              onIsolateSegment={handleIsolateSegment}
              onUnisolateSegment={handleUnisolateSegment}
              onInjectLeak={handleInjectLeak}
            />
          </div>

          {/* Live Operational SCADA Audit Trail (4 cols) */}
          <div className="lg:col-span-4 flex flex-col">
            <AuditLog events={telemetry?.recent_events || []} />
          </div>
        </div>
      </main>

      {/* Official Government Incident Report Dossier Modal */}
      <GovernmentIncidentReportModal
        isOpen={isIncidentReportOpen}
        onClose={() => setIsIncidentReportOpen(false)}
        telemetry={telemetry}
      />

      {/* Hydrographic Bathymetry & Maritime Chart Modal */}
      <HydrographicMapModal
        isOpen={isHydrographicMapOpen}
        onClose={() => setIsHydrographicMapOpen(false)}
        telemetry={telemetry}
        onSelectSegment={handleSelectSegmentWithInspector}
      />

      {/* Deep Engineering Asset Inspector Modal */}
      <AssetInspectorModal
        isOpen={isAssetInspectorOpen}
        onClose={() => setIsAssetInspectorOpen(false)}
        segmentId={selectedSegmentId}
        telemetry={telemetry}
        onIsolateSegment={handleIsolateSegment}
        onUnisolateSegment={handleUnisolateSegment}
      />

      {/* Standard SOP Guide Modal */}
      <InteractiveGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onInjectDemo={handleInjectLeak}
      />

      {/* Telemetry & Physics Injection Modal */}
      <SimulationControlsModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        telemetry={telemetry}
        onInjectLeak={handleInjectLeak}
        onStartSim={handleStartSim}
        onPauseSim={handlePauseSim}
        onResetSim={handleResetSim}
        onSetSpeed={handleSetSpeed}
        onLoadDataset={handleLoadDataset}
        onResetValves={handleResetValves}
        datasets={datasets}
      />

      {/* Subsea Sensor Telemetry & Diagnostics Modal */}
      <SensorDiagnosticsModal
        isOpen={isSensorDiagnosticsOpen}
        onClose={() => setIsSensorDiagnosticsOpen(false)}
        telemetry={telemetry}
      />
    </div>
  );
};

export default App;

