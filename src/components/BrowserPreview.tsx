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
    <div className="flex-1 flex flex-col bg-[#050506] overflow-hidden h-full border-t border-[#1f1f23]">
      {/* Browser Bar */}
      <div className="h-8 border-b border-[#1f1f23] px-3 bg-[#0a0a0c] flex items-center space-x-2.5 select-none">
        {/* Navigation Dots */}
        <div className="flex items-center space-x-1 shrink-0">
          <div className="w-2 h-2 rounded-full bg-red-500/30"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500/30"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-500/30"></div>
        </div>

        {/* Back and Forward helpers */}
        <div className="flex items-center space-x-0.5 border-r border-[#1f1f23] pr-2 shrink-0">
          <button className="p-0.5 rounded text-[#52525b] hover:text-[#a1a1aa] font-bold">
            <ArrowLeft className="w-3 h-3" />
          </button>
          <button className="p-0.5 rounded text-[#52525b] hover:text-[#a1a1aa]">
            <ArrowRight className="w-3 h-3" />
          </button>
          <button 
            onClick={handleRefresh}
            className="p-1 rounded text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#16161a] transition-all active:scale-95 ml-1"
          >
            <RotateCw className="w-3" />
          </button>
        </div>

        {/* Location Bar */}
        <div className="flex-1 bg-[#16161a] border border-[#27272a] rounded h-5.5 px-2 flex items-center space-x-1.55">
          <ShieldCheck className="w-3 h-3 text-[#10b981] shrink-0" />
          <input
            type="text"
            readOnly
            value={address}
            className="flex-1 bg-transparent text-[10px] font-mono text-[#a1a1aa] focus:outline-none focus:ring-0 leading-none"
          />
          <Globe className="w-3 h-3 text-[#52525b] shrink-0" />
        </div>
      </div>

      {/* Render Frame */}
      <div className="flex-1 bg-white relative">
        {iframeSrcDoc ? (
          <iframe
            title="Sandbox Dev Browser"
            srcDoc={iframeSrcDoc}
            className="w-full h-full border-0 absolute top-0 left-0 bg-[#0e0e11]"
            sandbox="allow-scripts allow-modals"
          />
        ) : (
          <div className="w-full h-full bg-[#0e0e11] flex flex-col items-center justify-center p-8 text-center text-[#52525b]">
            <Globe className="w-8 h-8 opacity-45 mb-2" />
            <p className="text-[10px] font-mono uppercase tracking-widest font-bold">Awaiting sandbox viewport...</p>
          </div>
        )}
      </div>
    </div>
  );
}
