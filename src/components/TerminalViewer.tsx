import { useEffect, useRef } from 'react';
import { Terminal, Trash2, ArrowDown } from 'lucide-react';
import { useAgentStore } from '../stores/agent-store.js';

export function TerminalViewer() {
  const { terminalOutput, clearTerminal } = useAgentStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalOutput]);

  const outputLines = terminalOutput ? terminalOutput.split('\n') : [];

  return (
    <div className="flex-1 flex flex-col bg-[#050506] font-mono text-[11px] overflow-hidden h-full border-t border-[#1f1f23]">
      {/* Terminal Bar header */}
      <div className="h-8 border-b border-[#1f1f23] px-4 bg-[#0a0a0c] flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] font-bold text-[#52525b] uppercase tracking-wider">SANDBOX TERMINAL</span>
        </div>

        {/* Clear Button */}
        <button
          onClick={clearTerminal}
          className="p-1 rounded text-[#71717a] hover:text-red-400 hover:bg-[#16161a] transition-all select-none"
          title="Clear terminal contents"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Terminal Screen rows */}
      <div className="flex-1 p-4 overflow-y-auto selection:bg-[#10b981]/20 text-[#a1a1aa] font-mono tracking-wide leading-relaxed scrollbar-thin">
        {outputLines.length === 0 ? (
          <div className="text-[#52525b] h-full flex flex-col items-center justify-center space-y-1">
            <Terminal className="w-6 h-6 opacity-40 text-[#52525b]" />
            <p className="text-[9px] uppercase tracking-widest font-bold">Terminal Shell Ready</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {outputLines.map((line, idx) => {
              // Highlight commands and outputs
              const isCommand = line.startsWith('$') || line.startsWith('>');
              const isError = line.toLowerCase().includes('error') || line.toLowerCase().includes('failed');
              const isSuccess = line.includes('success') || line.includes('succeed');
              
              let textColor = 'text-[#a1a1aa]';
              if (isCommand) textColor = 'text-sky-450 font-bold';
              else if (isError) textColor = 'text-rose-400';
              else if (isSuccess) textColor = 'text-[#10b981]';

              return (
                <div key={idx} className={`${textColor} break-all whitespace-pre-wrap`}>
                  {line}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
