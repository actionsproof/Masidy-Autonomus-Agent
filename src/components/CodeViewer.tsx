import { useState, useEffect } from 'react';
import { Save, FileCode, CheckCircle, RefreshCw } from 'lucide-react';
import { useAgentStore } from '../stores/agent-store.js';

export function CodeViewer() {
  const { currentProject, selectedFile, selectedFileContent, saveFileContent } = useAgentStore();
  const [localContent, setLocalContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setLocalContent(selectedFileContent);
  }, [selectedFileContent]);

  const handleSave = async () => {
    if (!currentProject || !selectedFile) return;
    setIsSaving(true);
    await saveFileContent(currentProject.id, selectedFile, localContent);
    setIsSaving(false);
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
    }, 2000);
  };

  if (!selectedFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0e0e11] border border-[#1f1f23] h-full">
        <FileCode className="w-12 h-12 text-[#52525b] mb-4 stroke-[1.5]" />
        <h3 className="text-sm font-semibold text-[#e4e4e7]">No active file</h3>
        <p className="text-xs text-[#71717a] font-mono mt-1 text-center max-w-xs">Select a workspace file in the file hierarchy on the left to start code viewing.</p>
      </div>
    );
  }

  // Pre-calculate line numbers count
  const lines = localContent ? localContent.split('\n') : [''];

  return (
    <div className="flex-1 flex flex-col bg-[#0e0e11] overflow-hidden h-full border-t border-[#1f1f23]">
      {/* Tab controls */}
      <div className="h-9 border-b border-[#1f1f23] bg-[#0a0a0c] flex items-center justify-between px-4 select-none">
        <div className="flex items-center space-x-2">
          <FileCode className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] font-mono font-medium text-[#71717a]">{selectedFile}</span>
          <span className="text-[10px] text-[#52525b] font-mono">({lines.length} lines)</span>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isSaving || localContent === selectedFileContent}
          className={`flex items-center space-x-1 px-3 py-1 rounded text-[11px] font-medium transition-all focus:outline-none ${justSaved ? 'bg-emerald-950/40 text-[#10b981] border border-emerald-900/40' : localContent !== selectedFileContent ? 'bg-[#4f46e5] text-white hover:bg-[#4338ca] shadow-[0_0_15px_rgba(79,70,229,0.4)] cursor-pointer' : 'bg-[#16161a] text-[#52525b] cursor-not-allowed border border-[#27272a]'}`}
        >
          {isSaving ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : justSaved ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <Save className="w-3 h-3" />
          )}
          <span>{justSaved ? 'Saved' : 'Save changes'}</span>
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden font-mono text-[13px] leading-relaxed">
        {/* Line Numbers Sidebar */}
        <div className="w-12 py-4 bg-[#0a0a0c]/60 text-right pr-3 border-r border-[#1f1f23] select-none text-[#3f3f46] font-mono font-medium">
          {lines.map((_, idx) => (
            <div key={idx} className="h-[21px]">{idx + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={localContent}
          onChange={(e) => setLocalContent(e.target.value)}
          spellCheck={false}
          className="flex-1 p-4 bg-transparent text-[#d4d4d8] outline-none resize-none font-mono text-[13px] leading-relaxed whitespace-pre overflow-auto scrollbar-thin overflow-x-auto selection:bg-[#4f46e5]/30 focus:ring-0 focus:outline-none"
        />
      </div>
    </div>
  );
}
