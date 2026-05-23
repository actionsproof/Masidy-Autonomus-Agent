import { Terminal, Users, Cpu, Settings, Home, ArrowLeft, RefreshCw, Layers, Sun, Moon } from 'lucide-react';
import { useAgentStore } from '../stores/agent-store.js';

interface TopBarProps {
  onBack?: () => void;
}

export function TopBar({ onBack }: TopBarProps) {
  const { currentProject, user, sseConnected, isAgentRunning, agentThinkingState, theme, toggleTheme } = useAgentStore();

  return (
    <header className="h-12 border-b border-gray-200 dark:border-[#1f1f23] bg-white dark:bg-[#0a0a0c] flex items-center justify-between px-4 shrink-0 select-none transition-colors duration-200">
      {/* Brand Logo & Back Navigator */}
      <div className="flex items-center space-x-3">
        {currentProject && (
          <button 
            onClick={onBack}
            className="flex items-center space-x-1 text-xs text-gray-650 dark:text-[#a1a1aa] hover:text-gray-950 dark:hover:text-white transition-colors bg-[#ffffff] dark:bg-[#16161a] border border-gray-200 dark:border-[#27272a] rounded-md px-2.5 py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] rounded-md flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            <span className="text-[10px] font-bold text-white">M</span>
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-gray-800 dark:text-white flex items-center">
            <span>Masidy Agent</span>
            {currentProject && (
              <>
                <span className="mx-2 text-gray-250 dark:text-[#4b4b4f] font-normal">/</span>
                <span className="text-gray-550 dark:text-[#a1a1aa] font-medium">{currentProject.name}</span>
              </>
            )}
          </h1>
        </div>
      </div>

      {/* Real-time Status and subscription plans */}
      <div className="flex items-center space-x-3 font-sans text-xs">
        {isAgentRunning && (
          <div className="hidden sm:flex items-center bg-gray-50 dark:bg-[#16161a] border border-sky-100 dark:border-sky-900/40 rounded-full py-1 px-3 text-sky-655 dark:text-sky-400 space-x-1.5 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin text-sky-500" />
            <span className="max-w-[150px] truncate text-[10px] uppercase font-mono tracking-wider">{agentThinkingState || 'Running...'}</span>
          </div>
        )}

        {/* Active Indicators */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#16161a] border border-gray-200 dark:border-[#27272a] rounded-full px-3 py-1">
          <div className={`w-2 h-2 rounded-full ${isAgentRunning ? 'bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]' : sseConnected ? 'bg-[#10b981] shadow-[0_0_8px_#10b981]' : 'bg-red-500 animate-pulse'} `}></div>
          <span className="text-[11px] font-medium text-gray-650 dark:text-[#e4e4e7] font-mono tracking-tight uppercase">
            {isAgentRunning ? 'Agent Active' : sseConnected ? 'SSE Live' : 'Disconnected'}
          </span>
        </div>

        {/* Plan status limits */}
        {user && (
          <div className="hidden md:flex items-center space-x-2 bg-gray-50 dark:bg-[#16161a] border border-gray-200 dark:border-[#27272a] rounded-lg px-2.5 py-1 text-xs text-gray-500 dark:text-[#a1a1aa]">
            <span className="text-[10px] font-bold text-[#4f46e5] uppercase font-mono tracking-widest">{user.plan}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-205 dark:bg-gray-750"></span>
            <span className="text-[10px] font-mono">{user.tokensUsedToday.toLocaleString()} tokens</span>
          </div>
        )}

        {/* Light Mode Changer button */}
        <button
          onClick={toggleTheme}
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#16161a] hover:bg-gray-50 dark:hover:bg-[#1c1c21] text-gray-500 dark:text-[#a1a1aa] hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer shadow-sm select-none"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-500 hover:scale-105 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500 hover:scale-105 transition-transform" />
          )}
        </button>

        <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-[#27272a] bg-[url('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')] bg-cover"></div>
      </div>
    </header>
  );
}
