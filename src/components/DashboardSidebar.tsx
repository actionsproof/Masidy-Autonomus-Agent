import { useState } from 'react';
import { 
  Sparkles, Beaker, ChevronDown, ChevronRight, Layers, LayoutGrid, 
  Activity, ArrowUpRight, HelpCircle, Search, Bell, Key, Settings, 
  Terminal, Shield, Power, CreditCard
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'playground' | 'workspaces' | 'gallery' | 'analytics' | 'billing' | 'telemetry' | 'guide';
  setActiveTab: (tab: 'playground' | 'workspaces' | 'gallery' | 'analytics' | 'billing' | 'telemetry' | 'guide') => void;
  projectsCount: number;
  feedbacksCount: number;
  credits: number;
  userTier: string;
  userEmail?: string;
  isCollapsed?: boolean;
}

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  projectsCount,
  feedbacksCount,
  credits,
  userTier,
  userEmail = 'ragabsadek8@gmail.com',
  isCollapsed = false
}: SidebarProps) {
  // Toggle for Build submenu
  const [isBuildOpen, setIsBuildOpen] = useState(true);

  if (isCollapsed) return null;

  return (
    <aside id="masidy-sidebar" className="w-full md:w-66 shrink-0 bg-[#ffffff] dark:bg-[#0b0c10] border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen select-none font-sans transition-all duration-200">
      {/* Brand Header with dropdown down-chevron */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-900 bg-[#ffffff] dark:bg-[#0b0c10]">
        <div className="flex items-center space-x-2.5">
          <div className="w-6.5 h-6.5 rounded-md bg-gradient-to-tr from-indigo-600 via-purple-500 to-indigo-400 flex items-center justify-center shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <div className="text-left">
            <h1 className="text-[13.5px] font-bold text-gray-800 dark:text-gray-100 flex items-center tracking-tight">
              <span>Masidy Agent</span>
              <ChevronDown className="w-3.5 h-3.5 ml-1.5 text-gray-400 dark:text-gray-500 stroke-[2]" />
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation section */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
        
        {/* Main Section */}
        <div className="space-y-1">
          {/* Playground Button */}
          <button
            id="tab-playground"
            type="button"
            onClick={() => setActiveTab('playground')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all cursor-pointer ${
              activeTab === 'playground' 
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900/40'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === 'playground' ? 'text-indigo-600 dark:text-indigo-400 animate-spin-slow' : 'text-gray-400 dark:text-gray-550'}`} />
            <span>Playground</span>
          </button>

          {/* Build Expandable Submenu */}
          <div className="space-y-0.5">
            <button
              id="menu-build"
              type="button"
              onClick={() => setIsBuildOpen(!isBuildOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12.5px] font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900/40 cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Beaker className="w-4 h-4 text-gray-400 dark:text-gray-550" />
                <span>Build</span>
              </div>
              {isBuildOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              )}
            </button>

            {isBuildOpen && (
              <div className="pl-6.5 pr-2 py-0.5 space-y-0.5 border-l border-gray-100 dark:border-gray-905 ml-4.5">
                {/* Workspaces (formerly Apps) */}
                <button
                  id="tab-workspaces"
                  type="button"
                  onClick={() => setActiveTab('workspaces')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-[11.5px] font-medium transition-all cursor-pointer ${
                    activeTab === 'workspaces' 
                      ? 'bg-gradient-to-r from-indigo-50 to-indigo-50/20 dark:from-indigo-950/20 dark:to-transparent text-indigo-600 dark:text-indigo-400 font-bold' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <span>Workspaces</span>
                  <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.1 rounded-full ${
                    activeTab === 'workspaces' ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600' : 'bg-gray-100 dark:bg-gray-900 text-gray-400'
                  }`}>
                    {projectsCount}
                  </span>
                </button>

                {/* Gallery */}
                <button
                  id="tab-gallery"
                  type="button"
                  onClick={() => setActiveTab('gallery')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-[11.5px] font-medium transition-all cursor-pointer ${
                    activeTab === 'gallery' 
                      ? 'bg-gradient-to-r from-indigo-50 to-indigo-50/20 dark:from-indigo-950/20 dark:to-transparent text-indigo-600 dark:text-indigo-400 font-bold' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <span>Gallery</span>
                  <span className="text-[9.5px] text-gray-400 dark:text-gray-550 italic font-mono">Starters</span>
                </button>
              </div>
            )}
          </div>

          {/* Dashboard Tab (Dashboard in AI Studio maps to live performance logs metrics) */}
          <button
            id="tab-analytics"
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all cursor-pointer ${
              activeTab === 'analytics' 
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-900/40'
            }`}
          >
            <div className="flex items-center space-x-2.5 truncate">
              <Activity className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span className="truncate">Dashboard</span>
            </div>
            {feedbacksCount > 0 && (
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
            )}
          </button>

          {/* Documentation Tab (maps to lab guide) */}
          <button
            id="tab-guide"
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all cursor-pointer ${
              activeTab === 'guide' 
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' 
                : 'text-gray-600 dark:text-gray-200 hover:text-gray-950 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-gray-900/40'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <HelpCircle className="w-4 h-4 text-gray-400" />
              <span>Documentation</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </button>
        </div>

        {/* Upgrade / Promo Box exactly like Google AI Studio (rounded design with gradient border) */}
        <div id="sidebar-upgrade-card" className="mx-2 p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 dark:border-gray-900 dark:hover:border-gray-850 bg-white dark:bg-[#10121a]/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col items-start text-left select-none">
          {/* Subtle gradient bar at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500"></div>
          <h4 className="text-[12.2px] font-semibold text-gray-800 dark:text-white tracking-tight">
            Upgrade to unlock more
          </h4>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 leading-normal">
            Access higher limits, Pro models, simulated credit faucet, and custom templates.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className="mt-3.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <span>Upgrade plan now</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Footer / Utility Section containing Faucet credit, Search, What's New, Get API Key, Settings */}
      <div className="px-2 py-2 border-t border-gray-100 dark:border-gray-900 space-y-0.5">
        
        {/* API credit balances */}
        <div className="px-3 py-1.5 mb-2 rounded bg-gray-50 dark:bg-gray-950/50 flex items-center justify-between text-[11px] text-gray-505 dark:text-gray-400 font-mono">
          <span className="flex items-center">
            <CreditCard className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            <span>Balance:</span>
          </span>
          <span className="font-extrabold text-gray-950 dark:text-white">{credits} Credits</span>
        </div>

        {/* Search */}
        <button
          type="button"
          onClick={() => {
            const query = prompt("Search templates and workspaces:");
            if (query) alert(`Feature simulated! Found 0 items matching: "${query}"`);
          }}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-gray-650 dark:text-gray-450 hover:bg-gray-50 dark:hover:bg-gray-900/40 cursor-pointer"
        >
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <span>Search</span>
        </button>

        {/* What's New */}
        <button
          type="button"
          onClick={() => alert("What's New in Masidy: \n\n• Cloned the Pixel-Perfect Google AI Studio Dashboard Layout! \n• Added prompt recommendations pills with dynamic builders. \n• Advanced sandbox diagnostic test suites support.")}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-gray-650 dark:text-gray-450 hover:bg-gray-50 dark:hover:bg-gray-900/40 cursor-pointer"
        >
          <Bell className="w-4 h-4 text-gray-400 shrink-0" />
          <span>What's new</span>
        </button>

        {/* Get API Key (Redirects to Billing Faucet) */}
        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition-all ${
            activeTab === 'billing' 
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-650 dark:text-gray-450 hover:bg-gray-50 dark:hover:bg-gray-900/40'
          }`}
        >
          <Key className="w-4 h-4 text-gray-400 shrink-0" />
          <span>Get API key</span>
        </button>

        {/* Settings (Redirects to Telemetry) */}
        <button
          type="button"
          onClick={() => setActiveTab('telemetry')}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition-all ${
            activeTab === 'telemetry' 
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-650 dark:text-gray-450 hover:bg-gray-50 dark:hover:bg-gray-900/40'
          }`}
        >
          <Settings className="w-4 h-4 text-gray-400 shrink-0" />
          <span>Settings</span>
        </button>

        {/* Profile Card element exactly like image */}
        <div id="sidebar-profile-card" className="p-2 border border-gray-100 dark:border-gray-900 rounded-lg bg-white dark:bg-[#10121a]/30 flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2 min-w-0">
            {/* Avatar circular indicator with user's initial or "R" */}
            <div className="w-7.5 h-7.5 rounded-full bg-red-500 text-white font-extrabold text-[12px] flex items-center justify-center uppercase shrink-0">
              {userEmail.substring(0, 1).toUpperCase()}
            </div>
            <div className="text-left min-w-0">
              <p className="text-[11px] font-medium text-gray-800 dark:text-gray-200 truncate pr-1" title={userEmail}>
                {userEmail}
              </p>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm animate-pulse" title="Platform Cloud Ready"></div>
        </div>
      </div>
    </aside>
  );
}
