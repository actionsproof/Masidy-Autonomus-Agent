import { useState, useEffect } from 'react';
import { Globe, RotateCw, ArrowLeft, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAgentStore } from '../stores/agent-store.js';

export function BrowserPreview() {
  const { browserHtml, browserUrl } = useAgentStore();
  const [address, setAddress] = useState(browserUrl);
  const [iframeSrcDoc, setIframeSrcDoc] = useState('');

  useEffect(() => {
    setAddress(browserUrl);
  }, [browserUrl]);

  useEffect(() => {
    setIframeSrcDoc(browserHtml);
  }, [browserHtml]);

  const handleRefresh = () => {
    // Re-trigger document rendering refresh
    const current = iframeSrcDoc;
    setIframeSrcDoc('');
    setTimeout(() => {
      setIframeSrcDoc(current);
    }, 100);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#050506] overflow-hidden h-full border-t border-gray-200 dark:border-[#1f1f23]">
      {/* Browser Bar */}
      <div className="h-8 border-b border-gray-200 dark:border-[#1f1f23] px-3 bg-gray-100 dark:bg-[#0a0a0c] flex items-center space-x-2.5 select-none animate-fade-in">
        {/* Navigation Dots */}
        <div className="flex items-center space-x-1 shrink-0">
          <div className="w-2 h-2 rounded-full bg-red-500/30"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500/30"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-500/30"></div>
        </div>

        {/* Back and Forward helpers */}
        <div className="flex items-center space-x-0.5 border-r border-gray-200 dark:border-[#1f1f23] pr-2 shrink-0">
          <button className="p-0.5 rounded text-gray-400 dark:text-[#52525b] hover:text-gray-600 dark:hover:text-[#a1a1aa] font-bold">
            <ArrowLeft className="w-3 h-3" />
          </button>
          <button className="p-0.5 rounded text-gray-400 dark:text-[#52525b] hover:text-[#a1a1aa]">
            <ArrowRight className="w-3 h-3" />
          </button>
          <button 
            onClick={handleRefresh}
            className="p-1 rounded text-gray-500 dark:text-[#a1a1aa] hover:text-gray-805 dark:hover:text-[#e4e4e7] hover:bg-gray-200 dark:hover:bg-[#16161a] transition-all active:scale-95 ml-1"
          >
            <RotateCw className="w-3" />
          </button>
        </div>

        {/* Location Bar */}
        <div className="flex-1 bg-white dark:bg-[#16161a] border border-gray-250 dark:border-[#27272a] rounded h-5.5 px-2 flex items-center space-x-1.55">
          <ShieldCheck className="w-3 h-3 text-[#10b981] shrink-0" />
          <input
            type="text"
            readOnly
            value={address}
            className="flex-1 bg-transparent text-[10px] font-mono text-gray-600 dark:text-[#a1a1aa] focus:outline-none focus:ring-0 leading-none"
          />
          <Globe className="w-3 h-3 text-gray-400 dark:text-[#52525b] shrink-0" />
        </div>
      </div>

      {/* Render Frame */}
      <div className="flex-1 bg-white relative">
        {iframeSrcDoc ? (
          <iframe
            title="Sandbox Dev Browser"
            srcDoc={iframeSrcDoc}
            className="w-full h-full border-0 absolute top-0 left-0 bg-[#fbfbfd] dark:bg-[#0e0e11]"
            sandbox="allow-scripts allow-modals"
          />
        ) : (
          <div className="w-full h-full bg-[#fbfbfd] dark:bg-[#0e0e11] flex flex-col items-center justify-center p-8 text-center text-gray-400 dark:text-[#52525b]">
            <Globe className="w-8 h-8 opacity-45 mb-2" />
            <p className="text-[10px] font-mono uppercase tracking-widest font-bold">Awaiting sandbox viewport...</p>
          </div>
        )}
      </div>
    </div>
  );
}
