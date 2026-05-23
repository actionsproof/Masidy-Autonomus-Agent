import { useState, CSSProperties } from 'react';
import { File, Plus, Folder, Loader2, Code2, Database } from 'lucide-react';
import { useAgentStore } from '../stores/agent-store.js';

interface FileTreeProps {
  width?: number;
  style?: CSSProperties;
}

export function FileTree({ width, style }: FileTreeProps) {
  const { currentProject, fields, selectedFile, selectFile, saveFileContent } = useAgentStore();
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName || !currentProject) return;

    try {
      // Create empty file under workspace
      await saveFileContent(currentProject.id, newFileName.trim(), `// Workspace: ${newFileName.trim()}\n`);
      setNewFileName('');
      setIsCreating(false);
      // Select the file
      await selectFile(currentProject.id, newFileName.trim());
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div 
      style={{ width, ...style }} 
      className="border-r border-gray-200 dark:border-[#1f1f23] bg-[#f5f5f7] dark:bg-[#08080a] flex flex-col h-full shrink-0 select-none overflow-hidden"
    >
      <div className="p-3 border-b border-gray-200 dark:border-[#1f1f23] flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#52525b]">EXPLORER</span>
        
        {currentProject && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="p-1 rounded bg-white dark:bg-[#16161a] border border-gray-200 dark:border-[#27272a] text-gray-500 dark:text-[#a1a1aa] hover:text-gray-800 dark:hover:text-white transition-colors"
            title="Create new file"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {/* Create Input Pane */}
        {isCreating && (
          <form onSubmit={handleCreateFile} className="mb-3 p-2 bg-white dark:bg-[#16161a] rounded border border-gray-200 dark:border-[#27272a]">
            <input
              type="text"
              required
              placeholder="e.g. index.css, app.js"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#0e0e11] text-[11px] px-2 py-1.5 border border-gray-200 dark:border-[#1f1f23] rounded text-gray-800 dark:text-[#e4e4e7] focus:outline-none focus:border-[#4f46e5] font-mono mb-2"
              autoFocus
            />
            <div className="flex items-center space-x-2 text-[9px] uppercase font-mono tracking-wider">
              <button
                type="submit"
                className="flex-1 py-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded text-center transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-1 bg-gray-100 dark:bg-[#27272a] text-gray-650 dark:text-[#a1a1aa] hover:text-gray-900 dark:hover:text-white rounded text-center"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Directory Structure Row */}
        <div className="flex items-center space-x-1.5 px-1.5 py-1 text-[11px] text-gray-500 dark:text-[#71717a] font-medium mb-2">
          <Folder className="w-3.5 h-3.5 text-sky-500 fill-sky-950/20" />
          <span className="truncate">workspaces/{currentProject?.id || 'sandbox'}</span>
        </div>

        {/* Files Stream */}
        {fields.length === 0 ? (
          <div className="p-4 text-center">
            <Folder className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-[10px] text-gray-500 font-mono">No files created.</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {fields.map((f) => {
              const isActive = selectedFile === f.path;
              // Detect file icon format extensions
              const isTs = f.path.endsWith('.ts') || f.path.endsWith('.tsx');
              const isCss = f.path.endsWith('.css');
              const isHtml = f.path.endsWith('.html');
              
              let extLabel = 'JS';
              let extColor = 'text-[#3b82f6]';
              if (isTs) {
                extLabel = 'TS';
                extColor = 'text-[#3b82f6]';
              } else if (isCss) {
                extLabel = 'CSS';
                extColor = 'text-teal-400';
              } else if (isHtml) {
                extLabel = 'HTML';
                extColor = 'text-[#f59e0b]';
              }

              return (
                <button
                  key={f.id}
                  onClick={() => selectFile(currentProject!.id, f.path)}
                  className={`w-full text-left flex items-center space-x-2 p-1.5 rounded cursor-pointer text-[12px] transition-all ${isActive ? 'bg-indigo-50/60 dark:bg-[#1e1e24] border-l-2 border-[#4f46e5] text-indigo-600 dark:text-[#e4e4e7] rounded-r' : 'text-gray-600 dark:text-[#a1a1aa] hover:bg-gray-100 dark:hover:bg-[#18181b] rounded'}`}
                >
                  <span className={`text-[9px] font-bold ${extColor} w-6 text-center select-none font-mono`}>{extLabel}</span>
                  <span className="truncate flex-1 font-sans">{f.path}</span>
                  <span className="text-[9px] font-mono text-gray-400 dark:text-[#52525b] pr-1">{(f.size / 1024).toFixed(1)}k</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
