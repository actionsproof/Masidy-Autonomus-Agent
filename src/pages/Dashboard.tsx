import { useState, useEffect } from 'react';
import { 
  Layers, Plus, FolderPlus, Terminal, Trash2, Calendar, Cpu, ArrowRight,
  Search, Eye, Star, Sparkles, Filter, Users, X, Code, CheckCircle, ExternalLink, HelpCircle,
  Download, TrendingUp, BarChart2, RefreshCw
} from 'lucide-react';
import { useAgentStore } from '../stores/agent-store.js';

interface DashboardProps {
  onSelectProject: (id: string) => void;
}

export default function Dashboard({ onSelectProject }: DashboardProps) {
  const { 
    fetchProjects, fetchUser, projects, createProject, deleteProject, user, 
    templates, fetchTemplates, allFeedbacks, fetchAllFeedbacks, testTemplate 
  } = useAgentStore();
  
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom interactive search and template previews
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [previewFileIndex, setPreviewFileIndex] = useState<number>(0);
  const [rightPreviewTab, setRightPreviewTab] = useState<'code' | 'test'>('code');

  // Template automated testing states
  const [isTestingInProgress, setIsTestingInProgress] = useState(false);
  const [testResults, setTestResults] = useState<any | null>(null);
  const [activeTestStep, setActiveTestStep] = useState(0);

  const handleRunTemplateTests = async (templateId: string) => {
    setIsTestingInProgress(true);
    setTestResults(null);
    setActiveTestStep(0);
    
    // Smooth staggering simulation before pulling authentic backend audit logs
    for (let step = 1; step <= 4; step++) {
      await new Promise(resolve => setTimeout(resolve, 380));
      setActiveTestStep(step);
    }

    try {
      const testData = await testTemplate(templateId);
      setTestResults(testData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTestingInProgress(false);
    }
  };

  const filteredTemplates = templates.filter(tpl => {
    const q = searchQuery.toLowerCase();
    return tpl.name.toLowerCase().includes(q) || tpl.description.toLowerCase().includes(q);
  });

  useEffect(() => {
    fetchProjects();
    fetchUser();
    fetchTemplates();
    fetchAllFeedbacks();
  }, [fetchProjects, fetchUser, fetchTemplates, fetchAllFeedbacks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const proj = await createProject(name.trim(), desc.trim(), selectedTemplateId || undefined);
      setName('');
      setDesc('');
      setSelectedTemplateId('');
      setIsAdding(false);
      onSelectProject(proj.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#050506] flex flex-col min-h-screen">
      <div className="max-w-5xl mx-auto w-full px-6 py-12 flex-1">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1f1f23] pb-8 mb-10 select-none">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-[#4f46e5] font-bold mb-1 block">Engineering Lab</span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Autonomous Lab Workspaces</h1>
            <p className="text-xs text-[#a1a1aa] mt-0.5 max-w-xl">Create and watch autonomous developer loops plan, code, test, run shells, and deploy live applications.</p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="mt-4 md:mt-0 flex items-center space-x-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-medium px-4 py-2 rounded text-xs transition-colors shadow-[0_0_15px_rgba(79,70,229,0.35)] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New workspace</span>
          </button>
        </div>

        {/* Create Form Expanded */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-10 bg-[#0e0e11] p-5 rounded-lg border border-[#1f1f23] max-w-2xl">
            <h3 className="text-xs font-bold uppercase font-mono text-[#e4e4e7] mb-4 flex items-center space-x-2">
              <FolderPlus className="w-4 h-4 text-indigo-400" />
              <span>Initiate Lab Workspace</span>
            </h3>

            <div className="space-y-4">
              {/* Project Starter Templates */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <label className="block text-[10px] font-bold font-mono text-[#71717a] uppercase tracking-widest">Optional Project Starter Template</label>
                  <div className="relative max-w-xs w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-[#71717a]">
                      <Search className="w-3 h-3" />
                    </span>
                    <input 
                      type="text"
                      placeholder="Filter starter templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#16161a] border border-[#27272a] hover:border-[#323236] text-[10.5px] pl-7 pr-7 py-1.5 rounded-md text-[#e3e3e3] placeholder-gray-500 focus:outline-[#4f46e5]/40"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#71717a] hover:text-[#a1a1aa] cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Blank Option */}
                  <div
                    onClick={() => {
                      setSelectedTemplateId('');
                      setName('');
                      setDesc('');
                    }}
                    className={`cursor-pointer rounded-lg border p-3.5 flex flex-col justify-between transition-all text-left ${
                      selectedTemplateId === ''
                        ? 'bg-[#151221] border-[#4f46e5]/80 text-white shadow-[0_0_10px_rgba(79,70,229,0.15)]'
                        : 'bg-[#16161a] border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa]'
                    }`}
                  >
                    <div>
                      <h4 className="text-[11px] font-bold font-mono uppercase tracking-wide flex items-center mb-1">
                        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-[#52525b]"></span>
                        Blank Work
                      </h4>
                      <p className="text-[10px] text-[#71717a] leading-tight mt-1.5">Start fresh with a standard default index.html layout.</p>
                    </div>
                  </div>

                  {/* Predefined Templates */}
                  {filteredTemplates.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => {
                          setSelectedTemplateId(tpl.id);
                          setName(tpl.name);
                          setDesc(tpl.description);
                        }}
                        className={`cursor-pointer rounded-lg border p-3.5 flex flex-col justify-between transition-all text-left ${
                          isSelected
                            ? 'bg-[#151221] border-[#4f46e5]/80 text-white shadow-[0_0_10px_rgba(79,70,229,0.15)]'
                            : 'bg-[#16161a] border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa]'
                        }`}
                      >
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-[11px] font-bold font-mono uppercase tracking-wide flex items-center mb-1 truncate" title={tpl.name}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isSelected ? 'bg-indigo-400 animate-pulse' : 'bg-indigo-900'}`}></span>
                              {tpl.name}
                            </h4>
                            <p className="text-[10px] leading-tight text-[#71717a] mt-1.5 line-clamp-3" title={tpl.description}>{tpl.description}</p>
                          </div>

                          {/* Preview trigger */}
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1f1f23]/40">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewTemplateId(tpl.id);
                                setPreviewFileIndex(0);
                              }}
                              className="text-[9.5px] font-mono leading-none tracking-tight font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 py-1 px-2 rounded bg-indigo-950/40 border border-indigo-900/30 transition-all cursor-pointer"
                            >
                              <Eye className="w-2.5 h-2.5 shrink-0" />
                              <span>Preview Code</span>
                            </button>
                            {isSelected && (
                              <span className="text-[9px] font-mono font-bold text-emerald-400 flex items-center bg-emerald-950/20 px-1 py-0.5 rounded border border-emerald-900/20">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredTemplates.length === 0 && (
                  <div className="mt-3 text-center bg-[#16161a] border border-[#27272a] rounded-lg p-6 select-none">
                    <Filter className="w-5 h-5 text-[#52525b] mx-auto mb-1 stroke-[1.5]" />
                    <p className="text-[10px] text-[#71717a] font-mono uppercase">No starter templates found</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono text-[#71717a] uppercase tracking-widest mb-1.5 focus:outline-none">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weather Widget, Expense Tracker"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#16161a] border border-[#27272a] text-xs px-3.5 py-2.5 rounded text-[#e3e3e3] focus:outline-none focus:border-[#4f46e5] font-medium transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono text-[#71717a] uppercase tracking-widest mb-1.5 focus:outline-none">Application Goal / Specifications</label>
                <textarea
                  placeholder="Describe what you want the agent to build by default"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#16161a] border border-[#27272a] text-xs px-3.5 py-2.5 rounded text-[#e3e3e3] focus:outline-none focus:border-[#4f46e5] font-medium transition-colors resize-none"
                />
              </div>

              <div className="flex items-center space-x-2.5 pt-1.5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center space-x-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 h-8 font-medium rounded text-xs uppercase font-mono tracking-wider transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Launch Lab'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="h-8 px-3 text-xs font-medium text-[#71717a] hover:text-white rounded bg-transparent"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Template Preview Panel Modal Overlay */}
        {previewTemplateId && (() => {
          const tpl = templates.find(t => t.id === previewTemplateId);
          if (!tpl) return null;
          const activeFile = tpl.files[previewFileIndex] || tpl.files[0];
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md select-text">
              <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                
                {/* Header */}
                <div className="p-4 border-b border-[#1f1f23] flex items-center justify-between bg-[#0a0a0c]">
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <div className="text-left">
                      <h3 className="text-xs font-bold uppercase font-mono text-white">Starter Anatomy Details</h3>
                      <p className="text-[10px] text-[#71717a] mt-0.5">{tpl.name} preloaded files and settings</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewTemplateId(null)}
                    className="p-1 rounded-md text-[#71717a] hover:text-white hover:bg-[#16161a] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto">
                  {/* Left Specs List */}
                  <div className="w-full md:w-[320px] p-4.5 border-r border-[#1f1f23] space-y-4 text-left">
                    <div>
                      <h4 className="text-[10px] font-bold font-mono text-[#71717a] uppercase tracking-wider mb-1">Description</h4>
                      <p className="text-[11px] text-[#a1a1aa] leading-relaxed">{tpl.description}</p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold font-mono text-[#71717a] uppercase tracking-wider mb-2">Preloaded Files ({tpl.files.length})</h4>
                      <div className="space-y-1.5 font-sans">
                        {tpl.files.map((file, idx) => {
                          const isFileActive = previewFileIndex === idx && rightPreviewTab === 'code';
                          return (
                            <button
                              key={file.path}
                              type="button"
                              onClick={() => {
                                setPreviewFileIndex(idx);
                                setRightPreviewTab('code');
                              }}
                              className={`w-full text-left rounded p-2 text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                                isFileActive
                                  ? 'bg-[#1a162b] border border-[#4f46e5]/40 text-white'
                                  : 'bg-[#16161a] border border-[#1f1f23] text-[#71717a] hover:border-[#27272a] hover:text-white'
                              }`}
                            >
                              <span className="truncate flex items-center space-x-1.5">
                                <Code className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                <span className="truncate">{file.path}</span>
                              </span>
                              <span className="text-[9px] text-[#52525b]">{Math.round(file.content.length / 102.4) / 10} KB</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive Test diagnostics activator block */}
                    <div className="bg-[#121216] p-3 rounded-lg border border-dashed border-[#2c224e]/50 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[9.5px] font-bold font-mono text-indigo-450 uppercase tracking-widest flex items-center">
                          <Cpu className="w-3.5 h-3.5 mr-1 text-indigo-400 animate-pulse" />
                          Diagnostics Suite
                        </h4>
                        {testResults && (
                          <span className={`text-[9px] font-bold font-mono px-1.5 rounded leading-none ${testResults.passed ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30' : 'bg-amber-950/50 text-amber-500 border border-amber-900/30'}`}>
                            {testResults.score}% Score
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#71717a] font-sans leading-normal">Run syntactic audits, linter checks, and rollup estimators on this starter deck.</p>
                      <button
                        type="button"
                        disabled={isTestingInProgress}
                        onClick={async () => {
                          setRightPreviewTab('test');
                          await handleRunTemplateTests(tpl.id);
                        }}
                        className="w-full h-8 flex items-center justify-center space-x-1.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold font-mono tracking-wider text-[9.5px] uppercase rounded transition-all cursor-pointer shadow-[0_0_8px_rgba(79,70,229,0.3)] select-none"
                      >
                        {isTestingInProgress ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                            <span>Auditing... ({activeTestStep}/4)</span>
                          </>
                        ) : (
                          <>
                            <Terminal className="w-3 h-3 text-white" />
                            <span>Verify Starter</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-[#16161a] p-3 rounded border border-[#1f1f23]">
                      <h4 className="text-[9.5px] font-bold font-mono text-indigo-400 uppercase tracking-widest flex items-center mb-1">
                        <ArrowRight className="w-3.5 h-3.5 mr-1" />
                        Kickstart Prompt
                      </h4>
                      <p className="text-[10px] text-[#71717a] italic leading-relaxed">"{tpl.samplePrompt}"</p>
                    </div>
                  </div>

                  {/* Right File Content & Live Test Suite Logs report */}
                  <div className="flex-1 bg-[#050506]/60 flex flex-col min-h-[300px] md:min-h-0 select-text">
                    
                    {/* Header tabs choice */}
                    <div className="bg-[#050506] px-4 border-b border-[#1f1f23] flex items-center justify-between shrink-0 h-9.5 select-none font-mono">
                      <div className="flex space-x-1 h-full pt-1.5">
                        <button
                          type="button"
                          onClick={() => setRightPreviewTab('code')}
                          className={`h-full px-3 text-[10.5px] font-semibold uppercase tracking-tight border-b-2 transition-all cursor-pointer ${rightPreviewTab === 'code' ? 'border-[#4f46e5] text-white bg-[#0e0e11]/45' : 'border-transparent text-[#71717a] hover:text-[#e4e4e7]'}`}
                        >
                          Code Inspector
                        </button>
                        <button
                          type="button"
                          onClick={() => setRightPreviewTab('test')}
                          className={`h-full px-3 text-[10.5px] font-semibold uppercase tracking-tight border-b-2 transition-all cursor-pointer relative flex items-center ${rightPreviewTab === 'test' ? 'border-[#4f46e5] text-white bg-[#0e0e11]/45' : 'border-transparent text-[#71717a] hover:text-[#e4e4e7]'}`}
                        >
                          <span>Automated Tester</span>
                          {testResults && (
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full ml-1.5 animate-pulse"></span>
                          )}
                        </button>
                      </div>
                      
                      <span className="text-[9px] text-[#52525b] uppercase font-bold">
                        {rightPreviewTab === 'code' ? 'Read-Only Source' : 'Linter & Build Sandbox'}
                      </span>
                    </div>

                    {/* Preview render container */}
                    <div className="flex-1 overflow-auto max-h-[420px] p-4 text-left">
                      {rightPreviewTab === 'code' ? (
                        <div>
                          <div className="text-[10px] text-[#52525b] font-mono mb-2 bg-[#0d0d10] p-1.5 rounded border border-[#1f1f23]/55 flex items-center justify-between">
                            <span>path: {activeFile?.path || 'index.html'}</span>
                            <span>size: {Math.round((activeFile?.content || '').length / 102.4) / 10} KB</span>
                          </div>
                          <pre className="text-left font-mono text-[10.5px] text-[#a1a1aa] leading-relaxed whitespace-pre bg-[#050506]/20 p-3 rounded border border-[#1f1f23] overflow-auto">
                            {activeFile?.content || '// No content preloaded'}
                          </pre>
                        </div>
                      ) : (
                        <div className="space-y-4 font-sans">
                          {/* Stepper progress representation */}
                          {isTestingInProgress && (
                            <div className="p-4 rounded-lg bg-[#0e0e11] border border-dashed border-indigo-950/40 text-center space-y-3">
                              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
                              <div>
                                <h5 className="text-xs font-bold font-mono uppercase text-white tracking-widest">Active Test Execution</h5>
                                <p className="text-[10px] text-[#71717a] mt-1">Spinning up transient V8 workspace sandbox and loading preloads...</p>
                              </div>

                              {/* Progression ticks */}
                              <div className="grid grid-cols-4 gap-2 text-[9px] font-mono max-w-md mx-auto pt-2 select-none">
                                <div className={`p-1.5 rounded border ${activeTestStep >= 1 ? 'bg-indigo-950/30 text-indigo-300 border-indigo-900/60' : 'bg-[#16161a] border-[#1f1f23] text-[#52525b]'}`}>
                                  MANIFEST
                                </div>
                                <div className={`p-1.5 rounded border ${activeTestStep >= 2 ? 'bg-indigo-950/30 text-indigo-300 border-indigo-900/60' : 'bg-[#16161a] border-[#1f1f23] text-[#52525b]'}`}>
                                  MARKUP
                                </div>
                                <div className={`p-1.5 rounded border ${activeTestStep >= 3 ? 'bg-indigo-950/30 text-indigo-300 border-indigo-900/60' : 'bg-[#16161a] border-[#1f1f23] text-[#52525b]'}`}>
                                  STYLES
                                </div>
                                <div className={`p-1.5 rounded border ${activeTestStep >= 4 ? 'bg-indigo-950/30 text-indigo-300 border-indigo-900/60' : 'bg-[#16161a] border-[#1f1f23] text-[#52525b]'}`}>
                                  OPTIMIZER
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Finished Diagnostics results */}
                          {testResults && !isTestingInProgress && (
                            <div className="space-y-4">
                              <div className="p-3 bg-emerald-950/15 border border-emerald-900/40 rounded-lg flex items-center justify-between">
                                <div className="flex items-center space-x-2.5">
                                  <div className="w-7 h-7 rounded-sm bg-[#121f1a] border border-emerald-900/50 flex items-center justify-center text-emerald-400">
                                    ✓
                                  </div>
                                  <div>
                                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#e4e4e7] font-mono">Template Verified Successfully</h5>
                                    <p className="text-[10px] text-[#71717a] font-mono">Completed diagnostic suite in {testResults.durationMs}ms at {new Date(testResults.timestamp).toLocaleTimeString()}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-xl font-bold font-mono tracking-tight text-emerald-400">{testResults.score}</span>
                                  <span className="text-[9.5px] font-mono text-[#71717a] block leading-none">SCORE / 100</span>
                                </div>
                              </div>

                              {/* Array of Test details cards */}
                              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                                {testResults.tests?.map((test: any, i: number) => (
                                  <div key={i} className="p-2.5 rounded bg-[#101014] border border-[#1f1f23] hover:border-[#27272a] transition-all">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-1.5 text-[10.5px] font-bold text-gray-200">
                                        <span className={`w-1.5 h-1.5 rounded-full ${test.status === 'pass' ? 'bg-emerald-400' : test.status === 'warn' ? 'bg-amber-450' : 'bg-rose-500'}`} />
                                        <span>{test.name}</span>
                                      </div>
                                      <span className={`text-[8.5px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${test.status === 'pass' ? 'bg-emerald-950/20 text-emerald-400' : test.status === 'warn' ? 'bg-amber-950/20 text-amber-500' : 'bg-rose-950/20 text-rose-450'}`}>
                                        {test.status}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-[#71717a] mt-0.5 font-sans leading-normal">{test.description}</p>
                                    <div className="text-[9px] font-mono mt-1 w-full bg-[#050506] p-1.5 py-1 rounded text-[#a1a1aa] overflow-x-auto whitespace-nowrap">
                                      {test.details}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Default state */}
                          {!isTestingInProgress && !testResults && (
                            <div className="p-8 text-center border border-dashed border-[#1f1f23] rounded-lg select-none">
                              <Cpu className="w-6 h-6 text-[#52525b] mx-auto mb-2" />
                              <h5 className="text-[11px] font-bold uppercase tracking-wider text-white font-mono">Verification Center</h5>
                              <p className="text-[10px] text-[#71717a] max-w-sm mx-auto mt-1 leading-relaxed">
                                Click the "Verify Starter" button on the left to run security sanity configurations, CDN availability validation, and mockup compiler transpile checks.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#1f1f23] bg-[#0a0a0c] flex items-center justify-end space-x-3 select-none">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplateId(null)}
                    className="px-4 py-2 text-xs font-semibold text-[#71717a] hover:text-white transition-colors"
                  >
                    Close Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId(tpl.id);
                      setName(tpl.name);
                      setDesc(tpl.description);
                      setPreviewTemplateId(null);
                    }}
                    className="flex items-center space-x-1 px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded text-xs font-bold transition-all shadow-[0_0_10px_rgba(79,70,229,0.25)] cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Apply Starter Anatomy</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })()}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="border border-dashed border-[#1f1f23] rounded-lg p-12 text-center select-none">
            <Layers className="w-10 h-10 text-[#52525b] mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-xs font-bold text-[#e4e4e7] uppercase font-mono tracking-wider">No Workspaces Found</h3>
            <p className="text-xs text-[#71717a] max-w-xs mx-auto mt-1.5">Initialize your first lab workspace above and unleash the code agent pipeline.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => {
              // Status Badge Mapper
              let badgeColor = 'bg-[#16161a] text-[#71717a] border-[#27272a]';
              if (proj.status === 'running') badgeColor = 'bg-[#4f46e5]/15 text-indigo-400 border-[#4f46e5]/30 shadow-[0_0_8px_rgba(79,70,229,0.3)]';
              else if (proj.status === 'completed') badgeColor = 'bg-[#10b981]/15 text-[#10b981] border-emerald-900/30';
              else if (proj.status === 'failed') badgeColor = 'bg-rose-950/15 text-rose-450 border-rose-900/30';

              return (
                <div
                  key={proj.id}
                  className="group relative border border-[#1f1f23] bg-[#0e0e11]/50 hover:bg-[#0e0e11] hover:border-[#27272a] transition-all rounded-lg flex flex-col justify-between overflow-hidden text-left"
                >
                  <div className="p-4.5 flex-1 cursor-pointer select-none" onClick={() => onSelectProject(proj.id)}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[9px] font-bold font-mono tracking-widest uppercase border rounded px-2.5 py-0.5 ${badgeColor}`}>
                        {proj.status}
                      </span>
                      <span className="text-[9px] text-[#52525b] font-mono tracking-tight flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(proj.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#e4e4e7] group-hover:text-white transition-colors capitalize mt-1 leading-tight line-clamp-1">{proj.name}</h3>
                    <p className="text-xs text-[#71717a] mt-2 line-clamp-2 leading-relaxed">{proj.description}</p>
                  </div>

                  <div className="px-4 py-2.5 border-t border-[#1f1f23] bg-[#0a0a0c]/80 flex items-center justify-between select-none shrink-0">
                    <button
                      onClick={() => onSelectProject(proj.id)}
                      className="text-xs font-bold font-mono uppercase text-[#e4e4e7] hover:text-[#4f46e5] flex items-center tracking-wide transition-colors"
                    >
                      <span>Open Lab</span>
                      <ArrowRight className="w-3 h-3 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this project workspace?')) {
                          deleteProject(proj.id);
                        }
                      }}
                      className="text-[#52525b] hover:text-red-400 transition-colors p-1 rounded"
                      title="Delete project"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Collaborative & Recent Feedback Section */}
        {(() => {
          // --- COMPUTED ANALYTICS AND EXPORT ROUTINES ---
          const totalFeedbacksCount = allFeedbacks.length;
          const averageRating = totalFeedbacksCount > 0 
            ? (allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacksCount)
            : 0;
          const satisfactionIndex = totalFeedbacksCount > 0
            ? (allFeedbacks.filter(f => f.rating >= 4).length / totalFeedbacksCount) * 100
            : 0;
          const strategicDensity = totalFeedbacksCount > 0
            ? (allFeedbacks.filter(f => f.alternativeApproach && f.alternativeApproach.trim().length > 0).length / totalFeedbacksCount) * 100
            : 0;

          // Compute absolute star counts from 1 to 5
          const starCounts = [0, 0, 0, 0, 0];
          allFeedbacks.forEach(f => {
            const rawIdx = Math.max(1, Math.min(5, f.rating)) - 1;
            starCounts[rawIdx]++;
          });

          const handleExportJSON = () => {
            if (allFeedbacks.length === 0) return;
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allFeedbacks, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `autopilot-workspace-feedback-${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          };

          const handleExportCSV = () => {
            if (allFeedbacks.length === 0) return;
            let csvContent = "\uFEFF"; // Byte-Order-Mark for proper Excel cell encoding
            csvContent += "Feedback ID,Project ID,Rating,Review Text,Alternative Suggested Strategy,Timestamp\n";
            allFeedbacks.forEach(fb => {
              const escapedText = (fb.feedbackText || "").replace(/"/g, '""');
              const escapedApproach = (fb.alternativeApproach || "").replace(/"/g, '""');
              csvContent += `"${fb.id}","${fb.projectId}",${fb.rating},"${escapedText}","${escapedApproach}","${fb.createdAt}"\n`;
            });
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", url);
            downloadAnchor.setAttribute("download", `autopilot-workspace-feedback-${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          };

          return (
            <div className="mt-16 border-t border-[#1f1f23]/65 pt-12 text-left">
              
              {/* Header Box */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                  <div className="flex items-center space-x-2 text-indigo-400 mb-1 select-none">
                    <Users className="w-4 h-4" />
                    <span className="text-xs uppercase font-mono tracking-widest font-bold">Autopilot Operations</span>
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight">Agent Performance & Labs Feedback Store</h2>
                  <p className="text-xs text-[#a1a1aa] mt-0.5 max-w-xl">
                    Real-time visual performance parameters, quality control distributions, and alternative strategies harvested from running automation tasks.
                  </p>
                </div>

                {/* Live connection bar */}
                <div className="mt-3 md:mt-0 flex items-center space-x-2 bg-[#0e0e11] border border-[#1f1f23] rounded-full px-3.5 py-1 text-[10px] select-none text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-mono text-[9px] uppercase tracking-wide">Live Metrics Synced</span>
                </div>
              </div>

              {totalFeedbacksCount === 0 ? (
                <div className="bg-[#0e0e11]/30 border border-[#1f1f23] rounded-xl p-8 text-center select-none text-gray-500">
                  <HelpCircle className="w-8 h-8 mx-auto text-[#27272a] mb-2" />
                  <div className="text-xs font-mono font-bold uppercase text-[#71717a]">No Feedback Registered</div>
                  <p className="text-[10px] text-[#52525b] mt-1 max-w-xs mx-auto leading-relaxed">
                    Once you evaluate tasks and submit star reviews within active laboratory channels, this panel will generate statistical quality control performance graphs.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* METRICS BENTO GRID ROW */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Rating KPI */}
                    <div className="bg-[#0e0e11]/60 border border-[#1f1f23] p-4.5 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-mono tracking-wider font-bold text-[#71717a] uppercase block">Average Autopilot Rating</span>
                        <h3 className="text-2xl font-extrabold text-white mt-1.5 tracking-tight font-mono">
                          {averageRating.toFixed(2)}
                          <span className="text-xs text-gray-500 font-normal"> / 5.0</span>
                        </h3>
                      </div>
                      <div className="mt-3.5 flex items-center justify-between text-[10px] text-[#71717a]">
                        <span className="flex items-center text-amber-500 font-mono">
                          {'★'.repeat(Math.round(averageRating))}
                          <span className="text-[#27272a]">{'★'.repeat(5 - Math.round(averageRating))}</span>
                        </span>
                        <span className="font-mono">{totalFeedbacksCount} reviews</span>
                      </div>
                    </div>

                    {/* Satisfaction Quotient */}
                    <div className="bg-[#0e0e11]/60 border border-[#1f1f23] p-4.5 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-mono tracking-wider font-bold text-[#71717a] uppercase block">Trust & Satisfaction Quotient</span>
                        <h3 className="text-2xl font-extrabold text-white mt-1.5 tracking-tight font-mono">
                          {satisfactionIndex.toFixed(1)}%
                        </h3>
                      </div>
                      <div className="mt-3.5 space-y-1">
                        <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${satisfactionIndex}%` }}
                          ></div>
                        </div>
                        <span className="text-[9px] text-[#52525b] font-mono uppercase block text-right">Approval Rate (4-5 ★)</span>
                      </div>
                    </div>

                    {/* Fine-Tuning Suggestion Density */}
                    <div className="bg-[#0e0e11]/60 border border-[#1f1f23] p-4.5 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-mono tracking-wider font-bold text-[#71717a] uppercase block">Iterative Fine-Tuning Density</span>
                        <h3 className="text-2xl font-extrabold text-indigo-400 mt-1.5 tracking-tight font-mono">
                          {strategicDensity.toFixed(1)}%
                        </h3>
                      </div>
                      <div className="mt-3.5 space-y-1">
                        <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${strategicDensity}%` }}
                          ></div>
                        </div>
                        <span className="text-[9px] text-[#52525b] font-mono uppercase block text-right">Wired with Strategies</span>
                      </div>
                    </div>

                    {/* Registered Iteration MilestonesCount */}
                    <div className="bg-[#0e0e11]/60 border border-[#1f1f23] p-4.5 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-mono tracking-wider font-bold text-[#71717a] uppercase block">Active Laboratory Scope</span>
                        <h3 className="text-2xl font-extrabold text-white mt-1.5 tracking-tight font-mono leading-none">
                          {projects.length}
                          <span className="text-[10px] text-gray-500 font-mono font-medium block mt-1 uppercase">Active Workspaces Logged</span>
                        </h3>
                      </div>
                      <div className="mt-3.5 flex items-center justify-between text-[10px] text-[#71717a] font-mono border-t border-[#1f1f23] pt-2">
                        <span>Success Metrics: Healthy</span>
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>
                  </div>

                  {/* DOUBLE COLUMN SPLIT GRAPH & FEED */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* LEFT PANEL: BAR CHART AND DATA EXPORTS */}
                    <div className="space-y-6">
                      
                      {/* Distribution Histogram Card */}
                      <div className="bg-[#0e0e11] border border-[#1f1f23] rounded-xl p-5 text-left">
                        <div className="flex items-center space-x-2 text-white mb-4 select-none">
                          <BarChart2 className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-xs font-bold uppercase font-mono tracking-wide">Rating Distribution Histogram</h4>
                        </div>
                        
                        <div className="space-y-3 font-mono text-[10.5px]">
                          {[5, 4, 3, 2, 1].map((currStar) => {
                            const count = starCounts[currStar - 1];
                            const ratio = totalFeedbacksCount > 0 ? (count / totalFeedbacksCount) * 100 : 0;
                            return (
                              <div key={currStar} className="flex items-center space-x-3 select-none">
                                <span className="w-7 text-gray-500 text-right leading-none shrink-0 font-bold">{currStar} ★</span>
                                <div className="flex-1 bg-[#16161a] h-2.5 rounded border border-[#27272a]/20 overflow-hidden">
                                  <div 
                                    className="bg-indigo-500 h-full rounded transition-all duration-500"
                                    style={{ width: `${ratio}%` }}
                                  ></div>
                                </div>
                                <span className="w-9 text-right text-gray-400 shrink-0">{count} ({ratio.toFixed(0)}%)</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-4.5 pt-3.5 border-t border-[#1f1f23] text-[10px] text-gray-500 leading-normal">
                          Metrics update dynamically with in-app valuations and rating loops.
                        </div>
                      </div>

                      {/* EXPORTS CARD DECK */}
                      <div className="bg-[#0e0e11] border border-[#1f1f23] rounded-xl p-5 text-left select-none">
                        <div className="flex items-center space-x-2 text-white mb-2">
                          <Download className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold uppercase font-mono tracking-wide">Data Laboratory Exports</h4>
                        </div>
                        <p className="text-[11px] text-[#71717a] leading-relaxed mb-4">
                          Export complete audit trails of client-registered ratings, milestone remarks, and strategies as standardized reports.
                        </p>

                        <div className="grid grid-cols-2 gap-3.5">
                          <button
                            type="button"
                            onClick={handleExportCSV}
                            className="bg-[#16161a] border border-[#27272a] hover:border-[#38383e] hover:bg-[#1a1a1f] text-[#e3e3e3] text-xs font-mono font-bold uppercase tracking-wider py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Export CSV</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={handleExportJSON}
                            className="bg-[#16161a] border border-[#27272a] hover:border-[#38383e] hover:bg-[#1a1a1f] text-[#e3e3e3] text-xs font-mono font-bold uppercase tracking-wider py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
                          >
                            <Code className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Export JSON</span>
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* RIGHT PANEL: RAW FEED LIST STREAM */}
                    <div className="lg:col-span-2 space-y-3.5">
                      <div className="flex items-center justify-between px-1 select-none">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#52525b] tracking-wider">Feedbacks Audit Trail</span>
                        <span className="text-[10px] font-mono text-[#71717a] font-bold">Showing {Math.min(8, totalFeedbacksCount)} of {totalFeedbacksCount}</span>
                      </div>

                      <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1.5 scrollbar-thin">
                        {allFeedbacks.slice(-8).reverse().map((fb) => {
                          const targetProject = projects.find(p => p.id === fb.projectId);
                          return (
                            <div 
                              key={fb.id} 
                              className="bg-[#0e0e11]/80 border border-[#1f1f23] rounded-lg p-4 flex flex-col justify-between hover:border-[#27272a] hover:bg-[#0e0e11] transition-all select-text"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2 select-none">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-[9px] uppercase font-mono tracking-wider font-bold bg-indigo-950/40 text-indigo-300 border border-indigo-900/30 px-2.5 py-0.5 rounded">
                                      {targetProject ? targetProject.name : 'Workspace'}
                                    </span>
                                    {fb.stepId && (
                                      <span className="text-[8.5px] font-mono text-gray-500 uppercase border border-[#1f1f23] px-1.5 py-0.2 rounded">Milepost</span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-0.5 text-amber-400 text-xs">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <span key={i} className={i < fb.rating ? 'text-amber-400 font-bold' : 'text-[#27272a] select-none'}>★</span>
                                    ))}
                                  </div>
                                </div>

                                <p className="text-xs text-white leading-relaxed italic font-sans font-medium">"{fb.feedbackText}"</p>

                                {fb.alternativeApproach && (
                                  <div className="mt-2.5 pt-21 border-t border-[#1f1f23]/60 text-[10.5px] text-[#71717a] font-mono flex items-start space-x-1.5">
                                    <span className="text-indigo-400 font-bold shrink-0">Wired Strategy:</span>
                                    <span className="text-[#a1a1aa] leading-normal">{fb.alternativeApproach}</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-3.5 flex items-center justify-between border-t border-[#1f1f23]/40 pt-2 text-[9px] text-[#4b4b52] font-mono select-none">
                                <span>REF: {fb.id}</span>
                                <span>{new Date(fb.createdAt).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })()}

      </div>
    </div>
  );
}
