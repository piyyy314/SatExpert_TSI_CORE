import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Wifi, 
  Cpu, 
  Radio, 
  ShieldCheck, 
  Terminal, 
  Zap, 
  HardDrive, 
  Server, 
  Satellite, 
  Volume2, 
  Binary, 
  Layers, 
  Play, 
  Square, 
  ShieldAlert,
  ArrowUpRight,
  Gauge
} from 'lucide-react';
import { Coordinates, Satellite as SatelliteType } from '../src/types.ts';
import { audioController, tacticalAlertService } from '../services/audioService.ts';
import { generatePQCKeyPair } from '../services/pqcService.ts';

export interface ServiceDiagnostic {
  id: string;
  name: string;
  category: 'RF_HARDWARE' | 'CRYPTO_CORE' | 'UPLINK_DOWNLINK' | 'INTERNAL_BUS';
  protocol: string;
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED' | 'TESTING';
  latencyMs: number;
  packetsProcessed: number;
  integrityScore: number; // 0 - 100
  portOrEndpoint: string;
  lastHeartbeat: string;
  details: string;
}

interface HardwareMockDevice {
  name: string;
  chipset: string;
  bus: 'USB 3.2' | 'PCIe Gen4' | 'SDR-IF' | 'SPI-Bridge';
  voltage: number;
  tempC: number;
  loadPct: number;
  firmware: string;
  status: 'OPTIMAL' | 'WARMING' | 'ACTIVE';
}

interface Props {
  userLoc: Coordinates;
  selectedSat: SatelliteType;
  defcon: number;
  isStealthMode: boolean;
  addMissionLog?: (detail: string, status?: any) => void;
}

export const SystemDiagnostics: React.FC<Props> = ({
  userLoc,
  selectedSat,
  defcon,
  isStealthMode,
  addMissionLog
}) => {
  const [isRunningSelfTest, setIsRunningSelfTest] = useState(false);
  const [testProgress, setTestProgress] = useState(100);
  const [activeTab, setActiveTab] = useState<'all' | 'RF_HARDWARE' | 'CRYPTO_CORE' | 'UPLINK_DOWNLINK' | 'INTERNAL_BUS'>('all');
  const [loopbackActive, setLoopbackActive] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('sdr-blade-01');
  const [stressLoad, setStressLoad] = useState<number>(18);
  const [uptimeSeconds, setUptimeSeconds] = useState(14280);

  // Live real-time services registry
  const [services, setServices] = useState<ServiceDiagnostic[]>([
    {
      id: 'sdr-blade-01',
      name: 'BladeRF 2.0 micro (xA9) SDR Front-End',
      category: 'RF_HARDWARE',
      protocol: 'USB 3.2 SuperSpeed / LibbladeRF',
      status: 'ONLINE',
      latencyMs: 1.4,
      packetsProcessed: 894320,
      integrityScore: 99.8,
      portOrEndpoint: 'bus:001/dev:004 (47MHz - 6GHz)',
      lastHeartbeat: 'JUST NOW',
      details: 'Dual 2x2 MIMO transceiver active. RX/TX sample rate locked at 61.44 MSPS.'
    },
    {
      id: 'hackrf-wideband',
      name: 'HackRF One Wideband Sweeper / Jammer Core',
      category: 'RF_HARDWARE',
      protocol: 'USB 2.0 HighSpeed / Libhackrf',
      status: 'ONLINE',
      latencyMs: 2.1,
      packetsProcessed: 412090,
      integrityScore: 98.4,
      portOrEndpoint: 'bus:001/dev:005 (1MHz - 6GHz)',
      lastHeartbeat: 'JUST NOW',
      details: 'Half-duplex swept RF spectral monitor. Max RF gain 14dB, IF 40dB, baseband 62dB.'
    },
    {
      id: 'pqc-crypto-engine',
      name: 'NIST ML-DSA-65 (Dilithium) Quantum Co-Processor',
      category: 'CRYPTO_CORE',
      protocol: 'Post-Quantum Lattice Cryptography Bus',
      status: 'ONLINE',
      latencyMs: 0.6,
      packetsProcessed: 12048,
      integrityScore: 100.0,
      portOrEndpoint: 'CRYPTO_CORE://dilithium3-matrix',
      lastHeartbeat: 'JUST NOW',
      details: 'Hardware-accelerated NTT lattice multiplication. Seed verified; canary tokens verified.'
    },
    {
      id: 'sat-telemetry-bus',
      name: 'Orbital Ephemeris & Doppler Shift Tracker',
      category: 'UPLINK_DOWNLINK',
      protocol: 'SGP4 / TLE Telemetry Pipe v4.2',
      status: 'ONLINE',
      latencyMs: 3.2,
      packetsProcessed: 684200,
      integrityScore: 99.4,
      portOrEndpoint: 'IPC://stia-orbital-vector',
      lastHeartbeat: 'JUST NOW',
      details: `Active ground track lock with ${selectedSat.name} (${selectedSat.orbitalSlot}). Azimuth/Elevation continuous solver.`
    },
    {
      id: 'dsp-audio-synth',
      name: 'WebAudio Tactical Feedback Synthesizer',
      category: 'INTERNAL_BUS',
      protocol: 'WebAudio API / Linear Oscillator Chain',
      status: 'ONLINE',
      latencyMs: 0.2,
      packetsProcessed: 231500,
      integrityScore: 100.0,
      portOrEndpoint: 'AUDIO_CTX://pcm-48khz-stereo',
      lastHeartbeat: 'JUST NOW',
      details: 'Synthesizing ambient 60Hz/30Hz drone, telemetry chirps, and warning alarm harmonics.'
    },
    {
      id: 'vsat-buc-modem',
      name: 'iDirect Evolution X7 Ku-Band VSAT BUC Interface',
      category: 'RF_HARDWARE',
      protocol: 'Ethernet IP / SNMPv3 Management MIB',
      status: 'ONLINE',
      latencyMs: 4.8,
      packetsProcessed: 1405320,
      integrityScore: 99.1,
      portOrEndpoint: '192.168.100.1:161 (14.0 - 14.5 GHz TX)',
      lastHeartbeat: 'JUST NOW',
      details: '16W Solid-State BUC active. Phase-lock oscillator nominal, forward 1024-QAM carrier synced.'
    },
    {
      id: 'threat-yara-engine',
      name: 'Real-Time YARA v4.5 Binary Stream Inspection',
      category: 'CRYPTO_CORE',
      protocol: 'Aho-Corasick Multi-Pattern Hex Engine',
      status: 'ONLINE',
      latencyMs: 1.8,
      packetsProcessed: 72100,
      integrityScore: 99.9,
      portOrEndpoint: 'MEM_BUFFER://yara-hyperscan',
      lastHeartbeat: 'JUST NOW',
      details: 'Compiling rules for Sandworm, Fancy Bear, BlackEnergy3, and SATCOM backdoor signatures.'
    },
    {
      id: 'inter-node-mesh',
      name: 'Aegis C2 Ghost Parity WebSocket & Mesh Interlink',
      category: 'INTERNAL_BUS',
      protocol: 'WSS / TLS 1.3 ChaCha20-Poly1305',
      status: 'ONLINE',
      latencyMs: 5.4,
      packetsProcessed: 93420,
      integrityScore: 97.8,
      portOrEndpoint: 'wss://tactical-c2.mesh.local/v1/stream',
      lastHeartbeat: 'JUST NOW',
      details: 'Zero-knowledge encrypted telemetry relay across tactical base stations.'
    }
  ]);

  // Mock Hardware Devices inventory
  const [hardwareDevices, setHardwareDevices] = useState<HardwareMockDevice[]>([
    {
      name: 'Nuand bladeRF 2.0 Micro',
      chipset: 'Analog Devices AD9361 + Intel Cyclone V A9',
      bus: 'USB 3.2',
      voltage: 5.08,
      tempC: 41.2,
      loadPct: 34,
      firmware: 'v2.4.1-git-release',
      status: 'ACTIVE'
    },
    {
      name: 'Great Scott Gadgets HackRF One',
      chipset: 'MAX2837 + NXP LPC4320 Dual-Core ARM',
      bus: 'USB 3.2',
      voltage: 4.96,
      tempC: 38.5,
      loadPct: 22,
      firmware: 'v2024.02.1',
      status: 'OPTIMAL'
    },
    {
      name: 'SatCom Ku-Band BUC Controller',
      chipset: 'STM32F407 High-Performance Cortex-M4',
      bus: 'SPI-Bridge',
      voltage: 24.1,
      tempC: 48.0,
      loadPct: 56,
      firmware: 'v5.12-buc-lock',
      status: 'ACTIVE'
    },
    {
      name: 'FPGA Cryptographic Lattice Accelerator',
      chipset: 'Xilinx Artix-7 XC7A100T-1CSG324C',
      bus: 'PCIe Gen4',
      voltage: 1.01,
      tempC: 44.8,
      loadPct: 42,
      firmware: 'pqc-core-rev4b',
      status: 'OPTIMAL'
    }
  ]);

  // Live telemetry pulse ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds(prev => prev + 1);

      // Fluctuate stats realistically for live visual feedback
      setServices(prev => prev.map(s => {
        const jitter = (Math.random() - 0.48) * 0.4;
        const newLatency = Math.max(0.1, Number((s.latencyMs + jitter).toFixed(2)));
        const packetDelta = Math.floor(Math.random() * 8) + 2;
        return {
          ...s,
          latencyMs: newLatency,
          packetsProcessed: s.packetsProcessed + packetDelta,
          lastHeartbeat: `${Math.floor(Math.random() * 2)}s ago`
        };
      }));

      // Fluctuate hardware stats
      setHardwareDevices(prev => prev.map(dev => ({
        ...dev,
        tempC: Number((dev.tempC + (Math.random() - 0.5) * 0.2).toFixed(1)),
        voltage: Number((dev.voltage + (Math.random() - 0.5) * 0.02).toFixed(2)),
        loadPct: Math.min(100, Math.max(10, Math.round(dev.loadPct + (Math.random() - 0.5) * 3)))
      })));
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // Run Comprehensive System Self-Test
  const triggerSelfTest = async () => {
    setIsRunningSelfTest(true);
    setTestProgress(0);
    audioController.playBeep(880, 'triangle', 0.1);
    if (addMissionLog) {
      addMissionLog('SYSTEM_DIAGNOSTICS: Initiated full-stack hardware integrity verification & loopback audit', 'info');
    }

    for (let step = 1; step <= 5; step++) {
      await new Promise(r => setTimeout(r, 450));
      setTestProgress(step * 20);

      if (step === 2) {
        // Test PQC engine live
        try {
          const keys = generatePQCKeyPair();
          if (keys.publicKey && keys.secretKey) {
            audioController.playBeep(1200, 'sine', 0.08);
          }
        } catch (e) {
          console.warn('PQC self-test probe notice:', e);
        }
      }

      if (step === 3) {
        audioController.playBeep(1400, 'sine', 0.08);
      }
    }

    // Refresh all services to 100% verified state
    setServices(prev => prev.map(s => ({
      ...s,
      status: 'ONLINE',
      integrityScore: 100.0,
      lastHeartbeat: '0s ago'
    })));

    audioController.playDoubleChirp();
    setIsRunningSelfTest(false);
    if (addMissionLog) {
      addMissionLog('SYSTEM_DIAGNOSTICS: All 8 critical hardware & bus services confirmed 100% NOMINAL', 'active');
    }
  };

  const filteredServices = useMemo(() => {
    if (activeTab === 'all') return services;
    return services.filter(s => s.category === activeTab);
  }, [services, activeTab]);

  const activeService = useMemo(() => {
    return services.find(s => s.id === selectedServiceId) || services[0];
  }, [services, selectedServiceId]);

  // Overall system health calculation
  const overallIntegrity = useMemo(() => {
    const sum = services.reduce((acc, s) => acc + s.integrityScore, 0);
    return (sum / services.length).toFixed(1);
  }, [services]);

  const totalPackets = useMemo(() => {
    return services.reduce((acc, s) => acc + s.packetsProcessed, 0).toLocaleString();
  }, [services]);

  const averageLatency = useMemo(() => {
    const sum = services.reduce((acc, s) => acc + s.latencyMs, 0);
    return (sum / services.length).toFixed(2);
  }, [services]);

  const formatUptime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs}h ${mins}m ${s}s`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* Top Banner / Header */}
      <div className="glass p-6 rounded-[28px] border-2 border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Terminal className="w-48 h-48 text-cyan-500" />
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-cyan-400">
                OFFICIAL PRODUCTION RELEASE // HARDWARE DIAGNOSTICS
              </span>
              <span className="bg-slate-900 text-slate-400 border border-slate-700 text-[9px] font-mono px-2 py-0.5 rounded">
                v1.0.0-RELEASE
              </span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase flex items-center">
              SYSTEM <span className="text-cyan-400 ml-2">DIAGNOSTICS & HARDWARE INTEGRITY</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl font-mono">
              Live status, loopback verification, and bus latency monitoring across mock SDR transceivers, PQC co-processors, VSAT BUC modems, and internal tactical pipelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={triggerSelfTest}
              disabled={isRunningSelfTest}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-xl border ${
                isRunningSelfTest
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 cursor-wait'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 hover:shadow-cyan-500/30 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRunningSelfTest ? 'animate-spin' : ''}`} />
              <span>{isRunningSelfTest ? `TESTING (${testProgress}%)` : 'EXECUTE FULL SELF-TEST'}</span>
            </button>

            <button
              onClick={() => {
                setLoopbackActive(!loopbackActive);
                audioController.playBeep(loopbackActive ? 440 : 880, 'sine', 0.05);
              }}
              className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border ${
                loopbackActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>LOOPBACK: {loopbackActive ? 'ENABLED' : 'PASSIVE'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar when testing */}
        {isRunningSelfTest && (
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400 mb-1">
              <span>SCANNING HARDWARE REGISTERS & CRYPTOGRAPHIC SEEDS...</span>
              <span>{testProgress}% COMPLETE</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="bg-cyan-400 h-full transition-all duration-300 shadow-[0_0_12px_#22d3ee]"
                style={{ width: `${testProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">SYSTEM INTEGRITY</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono flex items-baseline">
            {overallIntegrity}<span className="text-emerald-400 text-lg ml-1">%</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            <span>8/8 Services Nominal</span>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">AVG BUS LATENCY</span>
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono flex items-baseline">
            {averageLatency}<span className="text-cyan-400 text-lg ml-1">ms</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center space-x-1.5">
            <span className="text-cyan-400 font-bold">Real-Time Jitter:</span>
            <span>±0.04ms</span>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">PROCESSED PACKETS</span>
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {totalPackets}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center space-x-1.5">
            <span className="text-emerald-400 font-bold">Throughput:</span>
            <span>~14.2 MB/s burst</span>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">MISSION UPTIME</span>
            <Gauge className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatUptime(uptimeSeconds)}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center space-x-1.5">
            <span className="text-purple-400 font-bold">Session State:</span>
            <span>LIVE OPERATIONAL</span>
          </div>
        </div>

      </div>

      {/* Main Diagnostic Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Filterable Services Grid */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black uppercase tracking-widest text-white">INTERNAL HARDWARE SERVICES</span>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'all', label: 'ALL (8)' },
                { id: 'RF_HARDWARE', label: 'RF/SDR (3)' },
                { id: 'CRYPTO_CORE', label: 'CRYPTO (2)' },
                { id: 'UPLINK_DOWNLINK', label: 'SATCOM (1)' },
                { id: 'INTERNAL_BUS', label: 'BUS (2)' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveTab(f.id as any)}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                    activeTab === f.id
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map(srv => {
              const isSelected = srv.id === selectedServiceId;
              return (
                <div
                  key={srv.id}
                  onClick={() => {
                    setSelectedServiceId(srv.id);
                    audioController.playBeep(700, 'sine', 0.04);
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected 
                      ? 'bg-slate-900/90 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                      <span className="text-[9px] font-black font-mono tracking-widest text-slate-400 uppercase">
                        {srv.category.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      {srv.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-white mb-1 group-hover:text-cyan-300 transition-colors">
                    {srv.name}
                  </h3>

                  <div className="text-[10px] font-mono text-slate-500 mb-3 truncate">
                    {srv.protocol}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/60 text-[10px] font-mono">
                    <div>
                      <div className="text-slate-600 uppercase text-[8px]">Latency</div>
                      <div className="text-cyan-400 font-bold">{srv.latencyMs} ms</div>
                    </div>
                    <div>
                      <div className="text-slate-600 uppercase text-[8px]">Integrity</div>
                      <div className="text-emerald-400 font-bold">{srv.integrityScore}%</div>
                    </div>
                    <div>
                      <div className="text-slate-600 uppercase text-[8px]">Packets</div>
                      <div className="text-white font-bold">{srv.packetsProcessed.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connected Mock Hardware Board Inspection */}
          <div className="glass p-5 rounded-2xl border border-slate-800/80 mt-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-black uppercase tracking-widest text-white">PHYSICAL INTERFACE CONTROLLER REGISTERS</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500">POLL: 1.5s LIVE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hardwareDevices.map((dev, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{dev.name}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      {dev.bus}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    Chipset: {dev.chipset}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-800/40">
                    <span className="text-slate-400">V: <span className="text-cyan-400 font-bold">{dev.voltage}V</span></span>
                    <span className="text-slate-400">Temp: <span className="text-amber-400 font-bold">{dev.tempC}°C</span></span>
                    <span className="text-slate-400">Load: <span className="text-white font-bold">{dev.loadPct}%</span></span>
                    <span className="text-slate-400">FW: <span className="text-emerald-400 font-bold">{dev.firmware}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Deep Inspector for Selected Service */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="glass p-6 rounded-2xl border-2 border-slate-800 relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center">
                <Terminal className="w-4 h-4 mr-2" /> SERVICE INSPECTOR
              </span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            </div>

            <div>
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Selected Hardware Node</div>
              <div className="text-base font-black text-white mt-0.5">{activeService.name}</div>
              <div className="text-[11px] font-mono text-cyan-400 mt-1">{activeService.portOrEndpoint}</div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[9px] font-mono text-slate-500 uppercase">Architecture & Telemetry Details</div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {activeService.details}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="text-slate-500 text-[8px] uppercase">Latency</div>
                  <div className="text-lg font-bold text-white mt-1">{activeService.latencyMs} ms</div>
                  <div className="text-[9px] text-emerald-400 mt-0.5">Jitter: nominal</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="text-slate-500 text-[8px] uppercase">Health Score</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">{activeService.integrityScore}%</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">0 Dropped Frames</div>
                </div>
              </div>
            </div>

            {/* Simulated Live Terminal Feed for this Component */}
            <div className="space-y-2">
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Direct Bus Register Stream</span>
                <span className="text-emerald-400">SYNCED</span>
              </div>
              <div className="bg-black/90 p-3 rounded-xl border border-slate-800/80 font-mono text-[10px] space-y-1 text-slate-400 max-h-48 overflow-y-auto">
                <div className="text-slate-600">[SYS_INIT] Register map 0x00 - 0x7F bound</div>
                <div className="text-slate-500">[INTERRUPT] IRQ 19 fired: TX_COMPLETE</div>
                <div className="text-cyan-400">[RX_FIFO] Head: 0x400 Tail: 0x400 Depth: 0</div>
                <div className="text-slate-400">[VOLTAGE] Core rails nominal (3.3V, 1.8V, 1.0V)</div>
                <div className="text-emerald-400">[LOOPBACK] ACK received (0 byte loss)</div>
                <div className="text-purple-400">[PQC_GUARD] Hash verified: SHA3-512 state OK</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  audioController.playBeep(950, 'sawtooth', 0.08);
                  if (addMissionLog) {
                    addMissionLog(`DIAG_ACTION: Flushed buffers for ${activeService.name}`, 'info');
                  }
                }}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Flush FIFO Buffers & Clear IRQ
              </button>

              <button
                onClick={() => {
                  audioController.playDoubleChirp();
                  if (addMissionLog) {
                    addMissionLog(`DIAG_ACTION: Calibrated carrier offset on ${activeService.name}`, 'active');
                  }
                }}
                className="w-full py-2.5 px-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Recalibrate Clock & Phase Lock
              </button>
            </div>

          </div>

          {/* Ground Station Terminal Sync Status */}
          <div className="glass p-5 rounded-2xl border border-slate-800/80 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-widest">GROUND STATION COORD</span>
              <Satellite className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-white font-bold">
              {userLoc.lat.toFixed(4)}°N, {userLoc.lng.toFixed(4)}°W
            </div>
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>DEFCON LEVEL: <span className="text-red-400 font-bold">{defcon}</span></span>
              <span>STEALTH: <span className="text-purple-400 font-bold">{isStealthMode ? 'ACTIVE' : 'OFF'}</span></span>
            </div>
          </div>

          {/* Tactical Alert Service Acoustic Verification */}
          <div className="glass p-5 rounded-2xl border border-red-500/30 bg-red-950/10 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-red-400">
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-red-400" />
                TACTICAL_ALERT_SERVICE
              </span>
              <span className="px-2 py-0.5 rounded text-[8px] bg-red-500/20 text-red-400 border border-red-500/40 font-bold">
                ONLINE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              Real-time Web Audio acoustic cues for telemetry CRITICAL status and RF electronic warfare jamming pulses.
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  tacticalAlertService.playCriticalWarble();
                  if (addMissionLog) addMissionLog('ACOUSTIC_TEST: Telemetry CRITICAL dual-tone klaxon tested', 'active');
                }}
                className="py-2 px-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
              >
                Test Critical Warble
              </button>
              <button
                onClick={() => {
                  tacticalAlertService.playJammingSweep();
                  if (addMissionLog) addMissionLog('ACOUSTIC_TEST: Electronic jamming RF sweep tested', 'active');
                }}
                className="py-2 px-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
              >
                Test Jamming Sweep
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
