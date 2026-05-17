import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Download, CheckCircle2, Settings, Activity, Database, Network, ShieldAlert } from 'lucide-react';

export const DaemonManager = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'options' | 'metrics'>('console');
  const [logs, setLogs] = useState<string[]>(['[SYS] Module initialized.', '[SYS] Establishing secure handshake...']);
  const [options, setOptions] = useState({ aggressive: false, stealth: true, threads: 4 });
  const [metrics, setMetrics] = useState({ ping: 42, load: 12, connections: 3 });

  useEffect(() => {
    if (activeTab === 'console') {
      const interval = setInterval(() => {
        setLogs(prev => {
          const newLogs = [...prev, `[${"DaemonManager".toUpperCase().substring(0,3)}] Action processed ${Math.random().toString(36).substring(7)}...`];
          return newLogs.slice(-10);
        });
      }, 2500);
      return () => clearInterval(interval);
    }
    if (activeTab === 'metrics') {
      const interval = setInterval(() => {
        setMetrics({
          ping: Math.floor(Math.random() * 100) + 10,
          load: Math.floor(Math.random() * 100),
          connections: Math.floor(Math.random() * 15) + 1
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }, 1500);
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl h-full flex flex-col relative overflow-hidden group">
        <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
           <div className="flex items-center gap-3">
             <Terminal className="text-cyan-400 w-6 h-6" />
             <h2 className="text-xl font-mono text-slate-200 tracking-wider uppercase">DaemonManager</h2>
           </div>
           <button 
             onClick={handleDownload}
             disabled={downloading || downloaded}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors border ${
                downloaded 
                ? 'bg-emerald-900/50 text-emerald-400 border-emerald-500/50' 
                : downloading
                ? 'bg-slate-800 text-cyan-400 border-cyan-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border-slate-700 hover:border-cyan-500/30'
             }`}
           >
             {downloaded ? (
               <><CheckCircle2 className="w-4 h-4" /> SECURED</>
             ) : downloading ? (
               <><Cpu className="w-4 h-4 animate-spin" /> DOWNLOADING...</>
             ) : (
               <><Download className="w-4 h-4" /> CAPTURE DATA</>
             )}
           </button>
        </div>

        <div className="flex gap-2 mb-4 relative z-10">
          <button onClick={() => setActiveTab('console')} className={`px-4 py-2 rounded font-mono text-xs ${activeTab === 'console' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50' : 'bg-slate-800 text-slate-400'}`}>CONSOLE</button>
          <button onClick={() => setActiveTab('options')} className={`px-4 py-2 rounded font-mono text-xs ${activeTab === 'options' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50' : 'bg-slate-800 text-slate-400'}`}>OPTIONS</button>
          <button onClick={() => setActiveTab('metrics')} className={`px-4 py-2 rounded font-mono text-xs ${activeTab === 'metrics' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50' : 'bg-slate-800 text-slate-400'}`}>METRICS</button>
        </div>

        <div className="flex-1 overflow-auto relative z-10 bg-black/40 rounded-xl border border-slate-800 p-4">
            {activeTab === 'console' && (
              <div className="font-mono text-xs space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="text-emerald-400/80 flex gap-2">
                    <span className="text-slate-500">[{new Date().toISOString().split('T')[1].substring(0,8)}]</span>
                    <span>{log}</span>
                  </div>
                ))}
                <div className="text-cyan-400 animate-pulse">_</div>
              </div>
            )}
            
            {activeTab === 'options' && (
               <div className="space-y-4 font-mono text-sm text-slate-300">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700">
                    <div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-rose-400" /> Aggressive Mode</div>
                    <button onClick={() => setOptions(o => ({...o, aggressive: !o.aggressive}))} className={`px-3 py-1 rounded ${options.aggressive ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-400'}`}>{options.aggressive ? 'ON' : 'OFF'}</button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700">
                    <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Stealth Ops</div>
                    <button onClick={() => setOptions(o => ({...o, stealth: !o.stealth}))} className={`px-3 py-1 rounded ${options.stealth ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>{options.stealth ? 'ON' : 'OFF'}</button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700">
                    <div className="flex items-center gap-2"><Cpu className="w-4 h-4 text-cyan-400" /> Processing Threads</div>
                    <div className="flex gap-2">
                      {[2, 4, 8, 16].map(t => (
                        <button key={t} onClick={() => setOptions(o => ({...o, threads: t}))} className={`px-2 py-1 rounded ${options.threads === t ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
               </div>
            )}

            {activeTab === 'metrics' && (
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-800/50 rounded border border-slate-700 flex flex-col items-center justify-center">
                    <Network className="w-8 h-8 text-cyan-400 mb-2" />
                    <div className="font-mono text-2xl text-slate-200">{metrics.ping}ms</div>
                    <div className="font-mono text-xs text-slate-500 mt-1">LATENCY</div>
                 </div>
                 <div className="p-4 bg-slate-800/50 rounded border border-slate-700 flex flex-col items-center justify-center">
                    <Cpu className="w-8 h-8 text-purple-400 mb-2" />
                    <div className="font-mono text-2xl text-slate-200">{metrics.load}%</div>
                    <div className="font-mono text-xs text-slate-500 mt-1">SYS LOAD</div>
                 </div>
                 <div className="p-4 bg-slate-800/50 rounded border border-slate-700 flex flex-col items-center justify-center col-span-2">
                    <Database className="w-8 h-8 text-emerald-400 mb-2" />
                    <div className="font-mono text-2xl text-slate-200">{metrics.connections}</div>
                    <div className="font-mono text-xs text-slate-500 mt-1">ACTIVE LINKS</div>
                 </div>
              </div>
            )}
        </div>
    </div>
  );
};
