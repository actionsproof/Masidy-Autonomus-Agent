import { useState } from 'react';
import { Terminal, Activity, Plus } from 'lucide-react';

interface EnvVar {
  key: string;
  value: string;
  encrypted: boolean;
}

interface TelemetryPanelProps {
  telemetryEnv: EnvVar[];
  setTelemetryEnv: (variables: EnvVar[] | ((prev: EnvVar[]) => EnvVar[])) => void;
}

export function TelemetryPanel({
  telemetryEnv,
  setTelemetryEnv
}: TelemetryPanelProps) {
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvVal, setNewEnvVal] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const [logsList] = useState([
    { time: '09:00:21', text: 'Container init complete on port 3000.', type: 'info' },
    { time: '09:01:04', text: 'Vite server launched, reverse proxy routing active.', type: 'success' },
    { time: '09:03:15', text: 'Static assets preburned in /dist.', type: 'info' },
    { time: '09:04:12', text: 'Event stream listening loop established.', type: 'success' },
    { time: '09:09:55', text: 'Nginx process polling active diagnostics.', type: 'info' },
    { time: '09:12:00', text: 'Persistent client cache validated.', type: 'success' }
  ]);

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvKey.trim() || !newEnvVal.trim()) return;
    const formattedKey = newEnvKey.trim().toUpperCase().replace(/\s+/g, '_');
    
    // Check duplication
    if (telemetryEnv.some(v => v.key === formattedKey)) {
      alert("Variable already exists! Please delete it first before re-committing.");
      return;
    }

    const updated = [...telemetryEnv, { key: formattedKey, value: newEnvVal.trim(), encrypted: false }];
    setTelemetryEnv(updated);
    localStorage.setItem('lab_telemetry_env', JSON.stringify(updated));
    setNewEnvKey('');
    setNewEnvVal('');
  };

  const handleDeleteKey = (key: string) => {
    if (key === 'GEMINI_API_KEY' || key === 'PORT') {
      alert("Core platform indexes cannot be deleted.");
      return;
    }
    const updated = telemetryEnv.filter(v => v.key !== key);
    setTelemetryEnv(updated);
    localStorage.setItem('lab_telemetry_env', JSON.stringify(updated));
  };

  const toggleVisibility = (key: string) => {
    setVisibleKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 text-left font-sans">
      <div>
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-1 select-none">
          <Terminal className="w-4 h-4" />
          <span className="text-xs uppercase font-mono tracking-widest font-bold">Container Status System</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Operator Telemetry & Secure Vault</h2>
        <p className="text-xs text-gray-550 dark:text-[#a1a1aa] mt-0.5 max-w-xl">
          Inspect local running process memory, review microservices event streams, and configure secure key declarations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Telemetry diagnostics stats column */}
        <div className="lg:col-span-1 space-y-4 font-sans">
          <div className="bg-white dark:bg-[#0e0e11] border border-gray-200 dark:border-[#1f1f23] p-5 rounded-xl space-y-4 shadow-sm dark:shadow-none select-none">
            <h4 className="text-xs font-bold uppercase font-mono text-gray-800 dark:text-white flex items-center border-b border-gray-150 dark:border-[#1f1f23] pb-2.5">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2 animate-pulse" />
              Resource Monitors
            </h4>

            {/* CPU pool gauge */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-gray-500 dark:text-gray-400">
                <span>Thread Core Pool</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">3 / 8 Active</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-[#1c1c22] h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full w-[37.5%]"></div>
              </div>
            </div>

            {/* RAM gauge */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-gray-500 dark:text-gray-400">
                <span>V8 RAM Allocation</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">512 MB / 2 GB</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-[#1c1c22] h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full w-[25%]"></div>
              </div>
            </div>

            {/* Network Ingress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-gray-500 dark:text-gray-400">
                <span>Ingress Response Stream</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">&lt; 18ms</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-[#1c1c22] h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[94%]"></div>
              </div>
            </div>

            {/* Connection coordinates */}
            <div className="pt-2 border-t border-gray-150 dark:border-[#1f1f23]/60 text-[10px] space-y-1 text-gray-500 dark:text-gray-400 font-mono">
              <div className="flex justify-between">
                <span>PROXY PORT:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">3000 (nginx)</span>
              </div>
              <div className="flex justify-between">
                <span>SOCKET STATE:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">CONNECTED</span>
              </div>
            </div>
          </div>

          {/* Secure vault variables form */}
          <form onSubmit={handleAddKey} className="bg-white dark:bg-[#0e0e11] border border-gray-200 dark:border-[#1f1f23] p-5 rounded-xl space-y-3 shadow-sm dark:shadow-none">
            <h4 className="text-xs font-bold uppercase font-mono text-gray-800 dark:text-white flex items-center">
              <Plus className="w-4 h-4 text-indigo-650 dark:text-indigo-400 mr-1.5" />
              Append Environment Key
            </h4>
            <p className="text-[10px] text-gray-500 dark:text-[#71717a] leading-relaxed">
              Declare credentials, keys, or endpoints that the developer agent should retrieve inside the sandbox.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                required
                placeholder="KEY_NAME (e.g. STRIPE_KEY)"
                value={newEnvKey}
                onChange={(e) => setNewEnvKey(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                className="w-full bg-gray-50 dark:bg-[#16161a] border border-gray-250 dark:border-[#27272a] text-[10px] font-mono px-3 py-1.5 rounded text-gray-800 dark:text-[#e3e3e3] focus:outline-none focus:border-indigo-500 dark:focus:border-[#4f46e5]/45"
              />
              <input
                type="text"
                required
                placeholder="Value"
                value={newEnvVal}
                onChange={(e) => setNewEnvVal(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#16161a] border border-gray-250 dark:border-[#27272a] text-[10px] font-mono px-3 py-1.5 rounded text-gray-800 dark:text-[#e3e3e3] focus:outline-none focus:border-indigo-500 dark:focus:border-[#4f46e5]/45"
              />
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 dark:bg-[#4f46e5] text-white font-mono uppercase tracking-wider text-[10px] font-bold rounded hover:bg-indigo-700 dark:hover:bg-[#4338ca] transition-all cursor-pointer shadow-sm"
              >
                Commit Key in Vault
              </button>
            </div>
          </form>
        </div>

        {/* Secure Vault list viewport & Real-time Live log table */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Active Key lists */}
          <div className="bg-white dark:bg-[#0e0e11] border border-gray-200 dark:border-[#1f1f23] p-5 rounded-xl text-left shadow-sm dark:shadow-none">
            <h4 className="text-xs font-bold uppercase font-mono text-gray-800 dark:text-[#e4e4e7] mb-3">
              Active Sandbox Variable Vault (.env)
            </h4>
            
            <div className="space-y-2.5">
              {telemetryEnv.map((env) => {
                const isMasked = !visibleKeys[env.key] && env.key !== 'PORT' && env.key !== 'NODE_ENV';
                const maskText = '*'.repeat(16);
                
                return (
                  <div key={env.key} className="flex items-center justify-between bg-gray-50/50 dark:bg-[#050506]/55 border border-gray-150 dark:border-[#27272a]/45 rounded-md px-3 py-2 text-xs font-mono">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">{env.key}</span>
                      <span className="text-gray-400 dark:text-gray-550 shrink-0">=</span>
                      <span className="text-gray-700 dark:text-[#a1a1aa] truncate max-w-[150px] sm:max-w-[280px]">
                        {isMasked ? maskText : env.value}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 select-none shrink-0">
                      {env.key !== 'PORT' && env.key !== 'NODE_ENV' && (
                        <button
                          type="button"
                          onClick={() => toggleVisibility(env.key)}
                          className="text-gray-400 hover:text-gray-700 dark:text-[#71717a] dark:hover:text-white transition-all text-[9.5px] font-mono cursor-pointer"
                        >
                          {visibleKeys[env.key] ? 'Hide' : 'Reveal'}
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => handleDeleteKey(env.key)}
                        className="text-gray-400 hover:text-rose-600 dark:text-[#52525b] dark:hover:text-rose-400 transition-all text-[9.5px] font-mono cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subsystem shell logs block */}
          <div className="bg-white dark:bg-[#0e0e11] border border-gray-200 dark:border-[#1f1f23] p-5 rounded-xl text-left shadow-sm dark:shadow-none font-mono text-[10.5px]">
            <h4 className="text-xs font-bold uppercase text-gray-800 dark:text-[#e4e4e7] mb-3 font-mono">
              Event Stream Logs
            </h4>
            <div className="bg-gray-50 dark:bg-[#050506] border border-gray-150 dark:border-[#1f1f23] rounded-md p-3 max-h-[160px] overflow-y-auto space-y-2 text-left">
              {logsList.map((log, i) => (
                <div key={i} className="flex items-start space-x-2 leading-relaxed text-gray-500 dark:text-gray-400">
                  <span className="text-gray-400 dark:text-[#52525b] shrink-0 font-bold">[{log.time}]</span>
                  <span className={`px-1 rounded shrink-0 select-none text-[9.5px] uppercase font-bold ${
                    log.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{log.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
