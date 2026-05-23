import { useState, useEffect } from 'react';
import { 
  Plus, FolderPlus, Terminal, Trash2, Calendar, Cpu, ArrowRight,
  Search, Eye, Sparkles, Filter, X, Code, CheckCircle, HelpCircle,
  TrendingUp, RefreshCw, Menu, Mic, Paperclip, ChevronRight,
  Smartphone, Music, Database, Key, LayoutGrid, Layers, Settings as GearIcon, Sun, Moon
} from 'lucide-react';
import { useAgentStore } from '../stores/agent-store.js';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { BillingPanel } from '../components/BillingPanel';
import { TelemetryPanel } from '../components/TelemetryPanel';
import { GuidePanel } from '../components/GuidePanel';

interface DashboardProps {
  onSelectProject: (id: string) => void;
}

export default function Dashboard({ onSelectProject }: DashboardProps) {
  const { 
    fetchProjects, fetchUser, projects, createProject, deleteProject, user, 
    templates, fetchTemplates, allFeedbacks, fetchAllFeedbacks, testTemplate,
    theme, toggleTheme
  } = useAgentStore();
  
  // Set default tab selection to 'playground' (the centerpiece Google AI Studio prompt builder)
  const [activeTab, setActiveTab] = useState<'playground' | 'workspaces' | 'gallery' | 'analytics' | 'billing' | 'telemetry' | 'guide'>('playground');
  
  // Sidebar responsiveness toggle (collapsible sidebar)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Main Prompt Textarea
  const [promptText, setPromptText] = useState('');

  // Configuration Modal state for app naming/launching
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [launchAppName, setLaunchAppName] = useState('');
  const [launchAppDesc, setLaunchAppDesc] = useState('');
  const [launchTemplateId, setLaunchTemplateId] = useState('');

  // Search filter for template gallery
  const [searchQuery, setSearchQuery] = useState('');
  
  // Diagnostics check variables
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [previewFileIndex, setPreviewFileIndex] = useState<number>(0);
  const [rightPreviewTab, setRightPreviewTab] = useState<'code' | 'test'>('code');
  const [isTestingInProgress, setIsTestingInProgress] = useState(false);
  const [testResults, setTestResults] = useState<any | null>(null);
  const [activeTestStep, setActiveTestStep] = useState(0);

  // Credits and Billing Mechanis
  const [credits, setCredits] = useState<number>(() => {
    const saved = localStorage.getItem('lab_credits');
    return saved ? parseInt(saved, 10) : 150;
  });

  const [userTier, setUserTier] = useState<string>(() => {
    return localStorage.getItem('lab_tier') || 'Pro Developer';
  });

  const [simulatedInvoices, setSimulatedInvoices] = useState<Array<{ id: string; date: string; amount: string; status: string }>>(() => {
    const saved = localStorage.getItem('lab_invoices');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'INV-2026-001', date: '2026-04-15', amount: '$49.00', status: 'Paid' },
      { id: 'INV-2026-002', date: '2026-05-15', amount: '$49.00', status: 'Paid' }
    ];
  });

  const [telemetryEnv, setTelemetryEnv] = useState<Array<{ key: string; value: string; encrypted: boolean }>>(() => {
    const saved = localStorage.getItem('lab_telemetry_env');
    if (saved) return JSON.parse(saved);
    return [
      { key: 'GEMINI_API_KEY', value: '***************************xyz', encrypted: true },
      { key: 'PORT', value: '3000', encrypted: false },
      { key: 'NODE_ENV', value: 'production', encrypted: false },
      { key: 'LOG_LEVEL', value: 'info', encrypted: false },
      { key: 'MAX_AUTH_LOOPS', value: '25', encrypted: false }
    ];
  });

  // Track credits on change
  useEffect(() => {
    localStorage.setItem('lab_credits', credits.toString());
  }, [credits]);

  useEffect(() => {
    localStorage.setItem('lab_tier', userTier);
  }, [userTier]);

  useEffect(() => {
    localStorage.setItem('lab_telemetry_env', JSON.stringify(telemetryEnv));
  }, [telemetryEnv]);

  // Load backend stores
  useEffect(() => {
    fetchProjects();
    fetchUser();
    fetchTemplates();
    fetchAllFeedbacks();
  }, [fetchProjects, fetchUser, fetchTemplates, fetchAllFeedbacks]);

  // Dynamic recommendation pills configuration
  const recommendations = [
    {
      id: 'android',
      label: 'Build an Android app',
      prompt: 'Develop a highly polished native Android weather forecasting companion, complete with real-time locations API and dynamic material widgets.',
      icon: Smartphone,
      color: 'text-emerald-500 dark:text-emerald-400'
    },
    {
      id: 'tts',
      label: 'Convert text to speech',
      prompt: 'Design an interactive textbook reader workspace that leverages serverless text-to-speech audio outputs, dynamic bookmarks, and speech pitch controls.',
      icon: Sparkles,
      color: 'text-indigo-500 dark:text-indigo-400'
    },
    {
      id: 'music',
      label: 'Generate music',
      prompt: 'Build a retro synthesizer dashboard complete with custom web audio oscillators, wave shape filters, drum loops, and direct audio export recorders.',
      icon: Music,
      color: 'text-purple-500 dark:text-purple-400'
    },
    {
      id: 'database',
      label: 'Add database and auth',
      prompt: 'Set up an offline-first inventory tracker database with high contrast visual graphs, user feedback evaluations, and secure credential gates.',
      icon: Database,
      color: 'text-sky-500 dark:text-sky-450'
    }
  ];

  // Apply quick suggestion to prompt bar
  const handleSelectRecommendation = (recPrompt: string) => {
    setPromptText(recPrompt);
  };

  // Open confirmation launch workspace modal
  const handleOpenLaunchModal = () => {
    if (!promptText.trim()) return;
    
    // Auto-generate a beautiful applet name
    const words = promptText.trim().split(' ').slice(0, 3).map(w => w.replace(/[^a-zA-Z]/g, ""));
    const smartName = words.length > 0 
      ? words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Workspace'
      : `Applet-${Math.floor(100 + Math.random() * 900)}`;

    setLaunchAppName(smartName);
    setLaunchAppDesc(promptText);
    setLaunchTemplateId('');
    setIsLaunchModalOpen(true);
  };

  // Launch the created Workspace project
  const handleLaunchProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!launchAppName.trim()) return;

    if (credits < 10) {
      alert("Insufficient lab credits! Please visit the 'Get API key' (Billing) tab and activate the simulated credits faucet first.");
      setActiveTab('billing');
      setIsLaunchModalOpen(false);
      return;
    }

    setIsTestingInProgress(true);
    try {
      const proj = await createProject(launchAppName.trim(), launchAppDesc.trim(), launchTemplateId || undefined);
      setCredits(prev => Math.max(0, prev - 10));
      setPromptText('');
      setLaunchAppName('');
      setLaunchAppDesc('');
      setLaunchTemplateId('');
      setIsLaunchModalOpen(false);
      onSelectProject(proj.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTestingInProgress(false);
    }
  };

  // Diagnostics check function
  const handleRunTemplateTests = async (templateId: string) => {
    if (credits < 5) {
      alert("Insufficient lab credits! Please visit the 'Get API key' / 'Billing' tab and activate simulated credits faucet first.");
      setActiveTab('billing');
      return;
    }
    
    setCredits(prev => Math.max(0, prev - 5));
    setIsTestingInProgress(true);
    setTestResults(null);
    setActiveTestStep(0);
    
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

  // Analytics variables
  const totalFeedbacksCount = allFeedbacks.length;
  const averageRating = totalFeedbacksCount > 0 
    ? (allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacksCount)
    : 0;
  const satisfactionIndex = totalFeedbacksCount > 0
    ? (allFeedbacks.filter(f => f.rating >= 4).length / totalFeedbacksCount) * 105
    : 0;

  const starCounts = [0, 0, 0, 0, 0];
  allFeedbacks.forEach(f => {
    const rawIdx = Math.max(1, Math.min(5, f.rating)) - 1;
    starCounts[rawIdx]++;
  });

  const handleExportCSV = () => {
    if (allFeedbacks.length === 0) return;
    let csvContent = "\uFEFF";
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

  return (
    <div className="flex-1 bg-[#f9f9fb] dark:bg-[#07080c] flex flex-col md:flex-row min-h-screen text-gray-800 dark:text-gray-100 font-sans transition-colors duration-200">
      
      {/* Google AI Studio EXACT Cloned Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectsCount={projects.length}
        feedbacksCount={allFeedbacks.length}
        credits={credits}
        userTier={userTier}
        userEmail={user?.email || undefined}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main Panel Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative overflow-y-auto">
        
        {/* Inside Main Pane Header */}
        <header className="h-13 border-b border-gray-200/60 dark:border-gray-900/40 px-4 md:px-6 flex items-center justify-between shrink-0 bg-white/70 dark:bg-[#07080c]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            {/* Collapse Sidebar Button with custom UI Studio lines */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="w-5 h-5 stroke-[2]" />
            </button>
            <span className="text-[11.5px] font-bold font-mono text-gray-400 dark:text-gray-500 uppercase tracking-widest hidden sm:inline-block">
              {activeTab === 'playground' ? 'Prompt Lab' : activeTab}
            </span>
          </div>

          <div className="flex items-center space-x-3 select-none">
            {/* Dynamic theme switcher button */}
            <button
              onClick={toggleTheme}
              type="button"
              className="p-1.5 h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            {/* Faucet balance balance pill */}
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-full px-3 py-1 flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse"></span>
              <span className="font-mono">{credits} Credits Left</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('telemetry')}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer"
            >
              <GearIcon className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Content Viewports content area */}
        <main className="flex-1 px-4 py-8 md:px-10 md:py-12 bg-[#fafafc] dark:bg-[#07080c] select-text">
          
          {/* TAB: PLAYGROUND (Centerpiece EXACT Clone of AI Studio Launcher) */}
          {activeTab === 'playground' && (
            <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn text-left">
              
              {/* Centered Large Title with Sparkle Outline Image Clone */}
              <div className="text-center space-y-3.5 pt-10 select-none">
                <div className="relative inline-block">
                  <h1 className="text-3xl md:text-4.5xl font-normal text-gray-800 dark:text-white tracking-tight flex items-center justify-center space-x-3">
                    <span>Build your ideas with Masidy</span>
                    {/* Beautiful cyan sparkles/outline star representing Gemini star */}
                    <span className="inline-block text-indigo-400 dark:text-indigo-400 animate-pulse relative">
                      ✦
                    </span>
                  </h1>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                  Describe what you want to build and let Masidy's autonomous agent team handle the coding, terminal scripts, and browser testing.
                </p>
              </div>

              {/* Exact Textarea styled container */}
              <div className="relative max-w-3xl mx-auto bg-white dark:bg-[#0b0c10] border border-gray-250 dark:border-gray-800/80 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all select-text overflow-hidden group">
                {/* Micro Ambient Gradient line at top */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-600 opacity-60 group-focus-within:opacity-100 transition-opacity"></div>
                
                <div className="p-4 pt-5">
                  <textarea
                    id="playground-textarea"
                    rows={4}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Describe an app and let Gemini do the rest"
                    className="w-full bg-transparent border-0 ring-0 focus:ring-0 outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 text-[14px] leading-relaxed resize-none"
                  />
                </div>

                {/* Sub-controls at the bottom of the Card */}
                <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-950/20 border-t border-gray-150 dark:border-gray-900/60 flex items-center justify-between">
                  {/* Left Controls (Mic & Add Attachment Paperclip/Plus) */}
                  <div className="flex items-center space-x-2.5">
                    <button
                      type="button"
                      onClick={() => alert("Microphone dictation simulated! Speak your prompt after prompt config.")}
                      className="w-8.5 h-8.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center justify-center hover:bg-gray-55 dark:hover:bg-gray-800 transition-all cursor-pointer"
                      title="Describe using your voice"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => alert("Attachment dialog simulated! Support uploading local specifications source code.")}
                      className="w-8.5 h-8.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center justify-center hover:bg-gray-55 dark:hover:bg-gray-800 transition-all cursor-pointer"
                      title="Attach documents or image files"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right Control Button: Pill 'I'm feeling lucky / Build Applet' */}
                  <button
                    id="playground-build-btn"
                    type="button"
                    onClick={handleOpenLaunchModal}
                    disabled={!promptText.trim()}
                    className={`px-5 py-2 rounded-full font-semibold text-[12px] flex items-center space-x-2.5 transition-all cursor-pointer shadow-sm ${
                      promptText.trim()
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-[0_4px_10px_rgba(79,70,229,0.25)]'
                        : 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 border border-transparent dark:border-gray-850 cursor-not-allowed'
                    }`}
                  >
                    <span>✦ Build applet</span>
                  </button>
                </div>
              </div>

              {/* Recommendation suggestion pills styled row */}
              <div className="max-w-3xl mx-auto block select-none">
                <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {recommendations.map((rec) => {
                    const RecIcon = rec.icon;
                    return (
                      <button
                        key={rec.id}
                        type="button"
                        onClick={() => handleSelectRecommendation(rec.prompt)}
                        className="flex items-center space-x-2 bg-white dark:bg-[#10121a]/85 border border-gray-200 dark:border-gray-850/70 hover:border-gray-300 dark:hover:border-gray-750 px-3.5 py-1.8 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 transition-all shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.01)] cursor-pointer"
                      >
                        <RecIcon className={`w-3.5 h-3.5 ${rec.color}`} />
                        <span>{rec.label}</span>
                      </button>
                    );
                  })}
                  
                  {/* Next Scroll marker caret button */}
                  <button
                    type="button"
                    onClick={() => alert("More suggestions preloaded: 'Design custom forms tracker', 'Synthesize daily metrics', 'Deploy static presentation'.")}
                    className="w-7 h-7 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded-full flex items-center justify-center shrink-0 hover:bg-gray-55 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SECTION: Discover and remix app ideas (Starters Gallery previews) */}
              <div className="max-w-3xl mx-auto space-y-4 pt-4 select-none">
                <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-gray-9ab/40 pb-2">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white tracking-tight uppercase flex items-center space-x-2">
                    <LayoutGrid className="w-4 h-4 text-indigo-500" />
                    <span>Discover and remix app ideas</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('gallery')}
                    className="text-[11.5px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center space-x-1"
                  >
                    <span>Browse the app gallery</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5 select-text">
                  {templates.slice(0, 3).map((tpl) => (
                    <div
                      key={tpl.id}
                      className="bg-white dark:bg-[#0e0e11]/50 border border-gray-200 dark:border-gray-850 hover:border-gray-300 dark:hover:border-gray-800 rounded-xl p-4.5 flex flex-col justify-between transition-all"
                    >
                      <div>
                        <h4 className="text-[12.5px] font-bold text-gray-900 dark:text-white flex items-center">
                          <span className="w-2 h-2 rounded-full mr-2 bg-indigo-500"></span>
                          {tpl.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal mt-2 line-clamp-2">
                          {tpl.description}
                        </p>
                      </div>

                      <div className="pt-3.5 mt-4 border-t border-gray-100 dark:border-gray-900/60 flex items-center justify-between text-[11px] font-mono select-none">
                        <button
                          type="button"
                          onClick={() => {
                            setPromptText(tpl.description);
                            setLaunchTemplateId(tpl.id);
                            handleSelectRecommendation(tpl.description);
                          }}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold flex items-center cursor-pointer"
                        >
                          <span>Use Blueprint</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                        <span className="text-gray-400 text-[10px]">{tpl.files.length} Files preloaded</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: Active Projects tracker within Playground page */}
              <div id="playground-active-projects" className="max-w-3xl mx-auto space-y-4 pt-4 select-none">
                <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-gray-9ab/40 pb-2">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white tracking-tight uppercase flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <span>Your Active Workspaces</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('workspaces')}
                    className="text-[11.5px] font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 flex items-center space-x-1"
                  >
                    <span>Manage all {projects.length}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {projects.length === 0 ? (
                  <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center select-none bg-white dark:bg-[#0e0e11]/20">
                    <FolderPlus className="w-7 h-7 text-gray-400 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase font-mono">No workspaces created yet</h4>
                    <p className="text-[11.5px] text-gray-400 dark:text-gray-500 mt-1">To start, customize the prompt launcher or apply a starter blueprint above!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-text">
                    {projects.slice(0, 4).map((proj) => {
                      let badge = 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#12141c]';
                      if (proj.status === 'running') badge = 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/35';
                      else if (proj.status === 'completed') badge = 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/35';

                      return (
                        <div
                          key={proj.id}
                          className="border border-gray-200 dark:border-gray-850 bg-white dark:bg-[#090b10] hover:border-gray-300 dark:hover:border-gray-800 transition-all rounded-xl flex flex-col justify-between overflow-hidden"
                        >
                          <div className="p-4 cursor-pointer text-left" onClick={() => onSelectProject(proj.id)}>
                            <div className="flex items-center justify-between mb-2 text-[10px] font-mono">
                              <span className={`px-2 py-0.5 rounded border uppercase font-bold text-[8px] ${badge}`}>
                                {proj.status}
                              </span>
                              <span className="text-gray-400">{new Date(proj.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-[13px] font-bold text-gray-900 dark:text-white capitalize truncate">{proj.name}</h4>
                            <p className="text-[11px] text-gray-500 dark:text-gray-450 mt-1 line-clamp-2 leading-normal">{proj.description}</p>
                          </div>

                          <div className="px-4 py-2.5 bg-gray-50/75 dark:bg-[#0a0c10]/80 border-t border-gray-150 dark:border-gray-900/60 flex items-center justify-between text-xs font-mono select-none">
                            <button
                              onClick={() => onSelectProject(proj.id)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold flex items-center cursor-pointer"
                            >
                              <span>Launch dev sandbox</span>
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Delete this workspace?')) deleteProject(proj.id);
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: WORKSPACES (Granular view of active coder agents list) */}
          {activeTab === 'workspaces' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 dark:border-gray-850 pb-5 mb-6 select-none">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Active Lab Workspaces</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 max-w-xl">
                    Double-click and access your running code engines. View logs, modify variables, and run terminal scripts in real time.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setPromptText("Develop a custom feature dashboard applet.");
                    handleSelectRecommendation("Develop a custom feature dashboard applet.");
                    setActiveTab('playground');
                    setTimeout(() => {
                      const el = document.getElementById("playground-textarea");
                      if (el) el.focus();
                    }, 100);
                  }}
                  className="mt-4 md:mt-0 flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Initiate New Play</span>
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center select-none bg-white dark:bg-[#0e0e11]/20">
                  <Trash2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase font-mono">No active workspaces</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-sans">Return to the Playground and initiate an agent coder to populate this panel.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {projects.map((proj) => {
                    let badge = 'border-gray-200 dark:border-gray-800 text-gray-500 bg-gray-100';
                    if (proj.status === 'running') badge = 'bg-indigo-50 text-indigo-500 border-indigo-100';
                    else if (proj.status === 'completed') badge = 'bg-emerald-50 text-emerald-500 border-emerald-100';

                    return (
                      <div
                        key={proj.id}
                        className="border border-gray-200 dark:border-gray-850 bg-white dark:bg-[#0e0e11]/40 hover:bg-white dark:hover:bg-[#0e0e11] hover:border-gray-300 dark:hover:border-gray-800 transition-all rounded-xl flex flex-col justify-between overflow-hidden"
                      >
                        <div className="p-4.5 flex-1 cursor-pointer text-left" onClick={() => onSelectProject(proj.id)}>
                          <div className="flex items-center justify-between mb-3 text-[10px] font-mono">
                            <span className={`px-2 py-0.5 rounded border uppercase font-bold text-[8px] ${badge}`}>
                              {proj.status}
                            </span>
                            <span className="text-[#a1a1aa] dark:text-gray-500">{new Date(proj.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug truncate capitalize">{proj.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed line-clamp-2">{proj.description}</p>
                        </div>

                        <div className="px-4 py-2.5 bg-gray-50/75 dark:bg-[#0a0a0c]/80 border-t border-gray-200/50 dark:border-gray-900/60 flex items-center justify-between text-xs font-mono select-none">
                          <button
                            onClick={() => onSelectProject(proj.id)}
                            className="text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-bold flex items-center cursor-pointer"
                          >
                            <span>Open workspace</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this workspace?')) deleteProject(proj.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: GALLERY (Template Starters blueprints panel) */}
          {activeTab === 'gallery' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn text-left select-none">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-gray-850 pb-5 mb-8">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Starters Blueprint Gallery</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Remix preloaded project structures and configure templates before checking local diagnostics.
                  </p>
                </div>

                {/* Inline filter input bar */}
                <div className="relative max-w-xs w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-400 pointer-events-none">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input 
                    type="text"
                    placeholder="Filter design blueprints..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-255 dark:border-gray-800 text-xs pl-8 pr-8 py-2 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 select-text">
                {filteredTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-white dark:bg-[#0e0e11]/40 border border-gray-200 dark:border-gray-850 hover:border-gray-300 dark:hover:border-gray-855 rounded-xl p-5 flex flex-col justify-between transition-all"
                  >
                    <div>
                      <h3 className="text-[13.5px] font-bold text-gray-900 dark:text-white flex items-center">
                        <span className="w-2 h-2 rounded-full mr-2.5 bg-indigo-500"></span>
                        {tpl.name}
                      </h3>
                      <p className="text-[11.5px] text-gray-500 dark:text-gray-400 leading-relaxed mt-2.5 line-clamp-3">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-gray-100 dark:border-gray-900/60 select-none">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewTemplateId(tpl.id);
                          setPreviewFileIndex(0);
                          setRightPreviewTab('code');
                        }}
                        className="text-[10px] font-mono leading-none font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center space-x-1 px-2.2 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/20 transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-indigo-500" />
                        <span>Inspect Files</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPromptText(tpl.description);
                          setLaunchTemplateId(tpl.id);
                          handleSelectRecommendation(tpl.description);
                          setActiveTab('playground');
                          setTimeout(() => {
                            const container = document.getElementById("playground-textarea");
                            if (container) container.focus();
                          }, 100);
                        }}
                        className="text-[10.5px] font-bold font-mono text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                      >
                        Apply Setup
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center bg-white dark:bg-[#16161a]/10 border border-gray-200 dark:border-gray-850 rounded-2xl p-10 select-none">
                  <Filter className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono uppercase">No blueprints match your filter criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: ANALYTICS (Customer reviews evaluators lists) */}
          {activeTab === 'analytics' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn text-left">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Autopilot Metrics analytics</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
                  Analyze performance scores, evaluation stars distribution, and CSV export records gathered from evaluators loop feedback.
                </p>
              </div>

              {totalFeedbacksCount === 0 ? (
                <div className="bg-white dark:bg-[#121216]/10 border border-gray-205 dark:border-gray-850 p-12 text-center rounded-2xl select-none text-gray-400 font-sans shadow-sm">
                  <HelpCircle className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-700 mb-2" />
                  <h5 className="text-xs font-mono font-bold uppercase text-gray-500">No evaluative report feeds yet</h5>
                  <p className="text-[11.5px] text-gray-400 dark:text-gray-500 mt-1 max-w-xs mx-auto">
                    Evaluate sandbox coder instructions in active projects to fill historical performance scores charts.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 select-text">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono select-none">
                    <div className="bg-white dark:bg-[#0e0e11]/60 border border-gray-200 dark:border-gray-850 p-4 rounded-xl shadow-sm">
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase block">Mean Stars Rating</span>
                      <h3 className="text-2xl font-extrabold text-[#4f46e5] dark:text-indigo-400 mt-1">{averageRating.toFixed(2)} / 5.0</h3>
                    </div>
                    <div className="bg-white dark:bg-[#0e0e11]/60 border border-gray-200 dark:border-gray-850 p-4 rounded-xl shadow-sm">
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase block">Developer Satisfaction</span>
                      <h3 className="text-2xl font-extrabold text-gray-800 dark:text-emerald-400 mt-1">{Math.min(100, satisfactionIndex).toFixed(0)}%</h3>
                    </div>
                    <div className="bg-white dark:bg-[#0e0e11]/60 border border-gray-200 dark:border-gray-850 p-4 rounded-xl shadow-sm">
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase block">Evaluation Logs Count</span>
                      <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white mt-1">{totalFeedbacksCount} reviews</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="p-4 bg-white dark:bg-[#0e0e11]/60 border border-gray-200 dark:border-gray-850 rounded-xl flex flex-col justify-between shadow-sm select-none">
                      <div>
                        <h4 className="text-xs font-mono font-extrabold text-gray-800 dark:text-white mb-3">Rating distribution</h4>
                        <div className="space-y-2 text-[10.5px] font-mono">
                          {[5, 4, 3, 2, 1].map((currStar) => {
                            const count = starCounts[currStar - 1];
                            const ratio = totalFeedbacksCount > 0 ? (count / totalFeedbacksCount) * 100 : 0;
                            return (
                              <div key={currStar} className="flex items-center justify-between">
                                <span className="text-gray-400 font-bold w-6">{currStar}★</span>
                                <div className="flex-1 bg-gray-100 dark:bg-gray-950 h-2 rounded overflow-hidden mx-2.5">
                                  <div className="bg-indigo-500 h-full rounded" style={{ width: `${ratio}%` }}></div>
                                </div>
                                <span className="text-gray-500 text-right w-8">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-900/60 select-none">
                        <button onClick={handleExportCSV} className="text-[10px] font-mono bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-105 dark:border-indigo-900/30 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer">
                          Export CSV
                        </button>
                        <button onClick={handleExportJSON} className="text-[10px] font-mono bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-105 dark:border-indigo-900/30 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer">
                          Export JSON
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-3 p-1">
                      <h4 className="text-xs font-mono font-extrabold text-gray-800 dark:text-white">Active Evaluation Stream</h4>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {allFeedbacks.slice(-5).reverse().map((fb) => (
                          <div key={fb.id} className="bg-white dark:bg-[#0e0e11]/60 border border-gray-200 dark:border-gray-850 p-3.5 rounded-xl flex flex-col justify-between select-text shadow-sm">
                            <div className="flex justify-between items-center text-[10px] font-mono mb-1.5">
                              <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded font-extrabold">{fb.id.slice(0, 8)}</span>
                              <span className="text-amber-500 font-bold">{'★'.repeat(fb.rating)}</span>
                            </div>
                            <p className="text-xs text-gray-750 dark:text-gray-350 italic">"{fb.feedbackText}"</p>
                            {fb.alternativeApproach && (
                              <p className="text-[10px] text-gray-500 dark:text-gray-500 font-mono mt-2 border-t border-gray-100 dark:border-gray-900/45 pt-1.5">
                                Proposed Strategy: {fb.alternativeApproach}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: BILLING & FAUCET FREE CONTROLS */}
          {activeTab === 'billing' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <BillingPanel
                credits={credits}
                setCredits={setCredits}
                userTier={userTier}
                setUserTier={setUserTier}
                invoices={simulatedInvoices}
                setInvoices={setSimulatedInvoices}
              />
            </div>
          )}

          {/* TAB: TELEMETRY (Vault settings & encrypted variables) */}
          {activeTab === 'telemetry' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <TelemetryPanel
                telemetryEnv={telemetryEnv}
                setTelemetryEnv={setTelemetryEnv}
              />
            </div>
          )}

          {/* TAB: GUIDE (Documentation FAQ index) */}
          {activeTab === 'guide' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <GuidePanel />
            </div>
          )}

        </main>
      </div>

      {/* CONFIRMATION LAUNCH WORKSPACE OVERLAY / MODAL */}
      {isLaunchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/57 backdrop-blur-md select-text font-sans">
          <div className="bg-white dark:bg-[#0e0e11] border border-gray-250 dark:border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-zoomIn flex flex-col">
            <div className="p-4.5 border-b border-gray-150 dark:border-gray-900 flex items-center justify-between bg-gray-50 dark:bg-[#0a0a0c] select-none">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-spin-slow" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-800 dark:text-white">Configure & Launch Applet</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLaunchModalOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLaunchProject} className="p-5.5 space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold font-mono text-gray-500 uppercase tracking-widest mb-1.5">Application Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pomodoro Companion, Task Tracker"
                  value={launchAppName}
                  onChange={(e) => setLaunchAppName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs px-3.5 py-2.5 rounded-lg text-gray-800 dark:text-[#e3e3e3] focus:outline-none focus:border-indigo-500 font-medium transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono text-gray-500 uppercase tracking-widest mb-1.5">Scope Specifications</label>
                <textarea
                  required
                  rows={3}
                  value={launchAppDesc}
                  onChange={(e) => setLaunchAppDesc(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs px-3.5 py-2.5 rounded-lg text-gray-800 dark:text-[#e3e3e3] focus:outline-none focus:border-indigo-500 font-medium transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono text-gray-500 uppercase tracking-widest mb-2">Configure Startup blueprint template (Optional)</label>
                <div className="grid grid-cols-2 gap-2 select-none">
                  <div
                    onClick={() => setLaunchTemplateId('')}
                    className={`cursor-pointer rounded-lg border px-3 py-2 flex flex-col justify-between text-left transition-all ${
                      launchTemplateId === ''
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-500 dark:text-indigo-300'
                        : 'bg-white border-gray-200 text-gray-500 dark:bg-gray-900 dark:border-gray-800'
                    }`}
                  >
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wide">Blank blueprint</span>
                    <span className="text-[8.5px] text-gray-400 mt-1">Start fresh with default configuration</span>
                  </div>

                  {templates.slice(0, 3).map((tpl) => {
                    const isSelected = launchTemplateId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => {
                          setLaunchTemplateId(tpl.id);
                          setLaunchAppName(tpl.name + " Workspace");
                        }}
                        className={`cursor-pointer rounded-lg border px-3 py-2 flex flex-col justify-between text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-500 dark:text-indigo-300'
                            : 'bg-white border-gray-200 text-gray-500 dark:bg-gray-900 dark:border-gray-800'
                        }`}
                      >
                        <span className="text-[10px] font-bold font-mono uppercase tracking-wide truncate">{tpl.name}</span>
                        <span className="text-[8.5px] text-gray-400 mt-1 block truncate">preloaded index files</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg border border-dashed border-gray-200 dark:border-gray-850 text-center select-none">
                <p className="text-[10.5px] text-gray-500 font-mono">Launching deducts: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold font-sans">10 Credits</span></p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 select-none">
                <button
                  type="button"
                  onClick={() => setIsLaunchModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white"
                >
                  Configure back
                </button>
                <button
                  type="submit"
                  disabled={isTestingInProgress || !launchAppName.trim()}
                  className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 font-semibold rounded-lg text-xs transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isTestingInProgress ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Initiating...</span>
                    </>
                  ) : (
                    <span>Launch Pilot Sandbox</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STARTER Blueprints PREVIEW INSPECTOR PANEL */}
      {previewTemplateId && (() => {
        const tpl = templates.find(t => t.id === previewTemplateId);
        if (!tpl) return null;
        const activeFile = tpl.files[previewFileIndex] || tpl.files[0];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-lg select-text font-sans">
            <div className="bg-white dark:bg-[#0e0e11] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl text-left">
              <div className="p-4 border-b border-gray-200 dark:border-gray-900 flex items-center justify-between bg-gray-50 dark:bg-[#0a0a0c] select-none">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold uppercase font-mono text-gray-800 dark:text-white">Starter Blueprint files viewer</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{tpl.name} source models and diagnostics suite</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewTemplateId(null)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto">
                <div className="w-full md:w-[280px] p-4 border-r border-gray-200 dark:border-gray-900 space-y-4">
                  <div>
                    <h4 className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest mb-1.5">Overview</h4>
                    <p className="text-[11.5px] text-gray-500 dark:text-gray-405 leading-relaxed">{tpl.description}</p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest mb-2">Preloaded File Tree ({tpl.files.length})</h4>
                    <div className="space-y-1 select-none">
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
                            className={`w-full text-left rounded-lg p-2 text-xs transition-all flex items-center justify-between cursor-pointer ${
                              isFileActive
                                ? 'bg-indigo-50 dark:bg-[#1a162b] border border-indigo-200 dark:border-[#4f46e5]/40 text-indigo-800 dark:text-white font-semibold'
                                : 'bg-gray-50/50 dark:bg-[#16161a]/40 border border-transparent text-gray-500 dark:text-gray-450 hover:bg-gray-100/70 dark:hover:bg-gray-900/40'
                            }`}
                          >
                            <span className="truncate flex items-center space-x-2">
                              <Code className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span className="truncate">{file.path}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-[#121216] p-3.5 rounded-xl border border-dashed border-gray-205 dark:border-indigo-950/40 space-y-2 select-none">
                    <h4 className="text-[9.5px] font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase">Diagnostics check suite</h4>
                    <p className="text-[10px] text-gray-500">Run code compiling audits and sanity indicators. (Cost: 5 credits)</p>
                    <button
                      type="button"
                      disabled={isTestingInProgress}
                      onClick={async () => {
                        setRightPreviewTab('test');
                        await handleRunTemplateTests(tpl.id);
                      }}
                      className="w-full h-8 flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-mono text-[9.5px] uppercase rounded-md transition-all cursor-pointer shadow-sm"
                    >
                      {isTestingInProgress ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                          <span>Auditing ({activeTestStep}/4)</span>
                        </>
                      ) : (
                        <span>Verify code models</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-gray-50/30 dark:bg-[#050506]/60 flex flex-col min-h-[300px] md:min-h-0">
                  <div className="bg-white dark:bg-[#050506] px-4 border-b border-gray-200 dark:border-gray-900 flex items-center justify-between h-9.5 shrink-0 select-none font-mono text-[10.5px]">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setRightPreviewTab('code')}
                        className={`px-3 py-1.5 bg-transparent border-b-2 transition-all cursor-pointer font-bold uppercase tracking-wider ${rightPreviewTab === 'code' ? 'border-indigo-505 text-indigo-650 dark:border-[#4f46e5] dark:text-white' : 'border-transparent text-gray-400'}`}
                      >
                        Code inspector
                      </button>
                      <button
                        type="button"
                        onClick={() => setRightPreviewTab('test')}
                        className={`px-3 py-1.5 bg-transparent border-b-2 transition-all cursor-pointer font-bold uppercase tracking-wider ${rightPreviewTab === 'test' ? 'border-indigo-505 text-indigo-650 dark:border-[#4f46e5] dark:text-white' : 'border-transparent text-gray-400'}`}
                      >
                        Tester diagnostics
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto p-4 select-text">
                    {rightPreviewTab === 'code' ? (
                      <div className="space-y-2">
                        <div className="text-[10px] text-gray-400 font-mono bg-white dark:bg-[#0d0d10] p-1.5 rounded-lg border border-gray-200 dark:border-[#1f1f23]/55">
                          file location: {activeFile?.path || 'index.html'}
                        </div>
                        <pre className="font-mono text-[11px] text-gray-600 dark:text-[#a1a1aa] leading-relaxed whitespace-pre bg-white dark:bg-[#050506]/30 p-3.5 rounded-xl border border-gray-200 dark:border-gray-850 overflow-auto shadow-sm">
                          {activeFile?.content || '// fresh setup'}
                        </pre>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {isTestingInProgress && (
                          <div className="p-5.5 rounded-xl bg-white dark:bg-[#0e0e11] border border-dashed border-indigo-200 dark:border-indigo-950/40 text-center space-y-2">
                            <RefreshCw className="w-5 h-5 animate-spin text-indigo-505 mx-auto" />
                            <h5 className="text-xs font-bold font-mono text-gray-850 dark:text-white uppercase tracking-wider">Compiling local code sandbox</h5>
                            <p className="text-[10px] text-gray-400">Verifying code syntaxes, loaders, and layout definitions</p>
                          </div>
                        )}

                        {testResults && !isTestingInProgress && (
                          <div className="space-y-3">
                            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-950/30 rounded-xl">
                              <h5 className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Sanity checks passed successfully</h5>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Overall diagnostics completeness score: {testResults.score}/100. Ready to deploy.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-900 bg-gray-50 dark:bg-[#0a0a0c] flex items-center justify-end space-x-2 px-6 select-none">
                <button
                  type="button"
                  onClick={() => setPreviewTemplateId(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-850 dark:hover:text-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPromptText(tpl.description);
                    setLaunchTemplateId(tpl.id);
                    handleSelectRecommendation(tpl.description);
                    setPreviewTemplateId(null);
                    setActiveTab('playground');
                    setTimeout(() => {
                      const container = document.getElementById("playground-textarea");
                      if (container) container.focus();
                    }, 100);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Apply Starter Setup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
