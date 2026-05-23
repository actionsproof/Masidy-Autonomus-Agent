import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Globe, Code2, Layers, Cpu, Map, MessageSquare, ListTodo, ShieldAlert,
  Sliders, Wrench, Sparkles, Play, RefreshCw, Plus, Maximize2, Minimize2
} from 'lucide-react';
import { useAgentStore } from '../stores/agent-store.js';
import { FileTree } from '../components/FileTree.js';
import { CodeViewer } from '../components/CodeViewer.js';
import { BrowserPreview } from '../components/BrowserPreview.js';
import { TerminalViewer } from '../components/TerminalViewer.js';
import { StepCard } from '../components/StepCard.js';
import { ChatMessage } from '../components/ChatMessage.js';
import { ChatInput } from '../components/ChatInput.js';
import { Task } from '../../shared/types.js';

interface TaskFeedbackWidgetProps {
  projectId: string;
  tasks: Task[];
}

export function TaskFeedbackWidget({ projectId, tasks }: TaskFeedbackWidgetProps) {
  const { feedbacks, submitFeedback } = useAgentStore();
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [alternative, setAlternative] = useState('');
  const [showWidget, setShowWidget] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Filter completed or failed tasks so users can rate execution outcomes
  const rateableTasks = tasks.filter(t => t.status === 'completed' || t.status === 'failed');

  useEffect(() => {
    if (rateableTasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(rateableTasks[rateableTasks.length - 1].id);
    }
  }, [rateableTasks, selectedTaskId]);

  if (rateableTasks.length === 0) return null;

  const existingFeedback = feedbacks.find(f => f.taskId === selectedTaskId && !f.stepId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || !selectedTaskId) return;
    await submitFeedback({
      projectId,
      rating,
      feedbackText: feedbackText.trim(),
      alternativeApproach: alternative.trim() || undefined,
      taskId: selectedTaskId
    });
    setFeedbackText('');
    setAlternative('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="p-3 border-b border-[#1f1f23] select-none text-left">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold uppercase text-[#52525b] tracking-wider">Evaluation & Feedback</div>
        <button 
          onClick={() => setShowWidget(!showWidget)}
          className="text-[9.5px] font-mono uppercase font-bold text-indigo-400 hover:text-indigo-300 px-1.5 py-0.5 rounded bg-[#16161a] hover:bg-[#1f1f23] border border-[#27272a] transition-all cursor-pointer"
        >
          {showWidget ? '[Hide]' : '[Evaluate Task]'}
        </button>
      </div>

      {showWidget && (
        <div className="p-3 bg-[#0e0e11] border border-[#1f1f23] rounded-lg space-y-3">
          {/* Select Task Dropdown */}
          <div>
            <label className="block text-[9px] font-bold font-mono text-[#71717a] uppercase mb-1">Select Task Outcome</label>
            <select
              value={selectedTaskId}
              onChange={(e) => {
                setSelectedTaskId(e.target.value);
                setIsSuccess(false);
              }}
              className="w-full bg-[#16161a] border border-[#27272a] text-[10.5px] px-2.5 py-1.5 rounded text-[#e3e3e3] focus:outline-none focus:border-[#4f46e5]/45 font-medium"
            >
              {rateableTasks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.prompt.substring(0, 32)}{t.prompt.length > 32 ? '...' : ''} ({t.status})
                </option>
              ))}
            </select>
          </div>

          {existingFeedback ? (
            <div className="text-[10px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded leading-relaxed select-text">
              <div className="flex items-center space-x-1.5 font-bold mb-1">
                <span>✓ Task Rated</span>
                <span className="text-amber-400">{'★'.repeat(existingFeedback.rating)}</span>
              </div>
              <div className="text-[#a1a1aa] italic">"{existingFeedback.feedbackText}"</div>
              {existingFeedback.alternativeApproach && (
                <div className="text-[9.5px] text-[#71717a] font-mono mt-1.5 pt-1 border-t border-[#1f1f23]/45">
                  <span className="text-indigo-400 font-bold">Alternative:</span> {existingFeedback.alternativeApproach}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {isSuccess && (
                <div className="text-[10px] font-medium text-emerald-400 bg-emerald-950/20 border border-emerald-900/10 p-1.5 rounded text-center">
                  Feedback registered successfully!
                </div>
              )}
              {/* Stars Selector */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold font-mono text-[#71717a] uppercase">Rating</span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className={`text-sm tracking-tighter hover:scale-115 transition-transform cursor-pointer ${num <= rating ? 'text-amber-400' : 'text-[#27272a]'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  placeholder="Tell us what worked or list suggestions for future loops..."
                  required
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full bg-[#16161a] border border-[#27272a] focus:border-[#4f46e5]/30 text-[10px] p-2 rounded text-[#e3e3e3] placeholder-gray-600 focus:outline-none resize-none leading-relaxed"
                  rows={2}
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Suggested alternative approach (optional)..."
                  value={alternative}
                  onChange={(e) => setAlternative(e.target.value)}
                  className="w-full bg-[#16161a] border border-[#27272a] focus:border-[#4f46e5]/30 text-[10px] px-2.5 py-1.5 rounded text-[#e3e3e3] placeholder-gray-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold h-7.5 rounded text-[10px] uppercase tracking-wider font-mono shadow-[0_0_8px_rgba(79,70,229,0.2)] cursor-pointer"
              >
                Submit Feedback
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default function Workspace() {
  const { 
    currentProject, selectProject, messages, steps, activeTab, setActiveTab, 
    activeTask, sseConnected, tasks, createCustomStep, updateStepDetails, startAutomationTask
  } = useAgentStore();
  
  const [rightActiveSidebarTab, setRightActiveSidebarTab] = useState<'chat' | 'steps'>('steps');

  // Layout states for resizability and visibilities
  const [fileTreeWidth, setFileTreeWidth] = useState(224);
  const [fileTreeVisible, setFileTreeVisible] = useState(true);
  const [agentChatWidth, setAgentChatWidth] = useState(320);
  const [agentChatVisible, setAgentChatVisible] = useState(true);

  const startResizingFileTree = (e: React.MouseEvent) => {
    e.preventDefault();
    const startWidth = fileTreeWidth;
    const startX = e.clientX;

    const doDrag = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      setFileTreeWidth(Math.max(140, Math.min(500, startWidth + delta)));
    };

    const stopDrag = () => {
      window.removeEventListener('mousemove', doDrag);
      window.removeEventListener('mouseup', stopDrag);
    };

    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);
  };

  const startResizingAgentChat = (e: React.MouseEvent) => {
    e.preventDefault();
    const startWidth = agentChatWidth;
    const startX = e.clientX;

    const doDrag = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX; // dragging left expands the right side panel
      setAgentChatWidth(Math.max(200, Math.min(700, startWidth + delta)));
    };

    const stopDrag = () => {
      window.removeEventListener('mousemove', doDrag);
      window.removeEventListener('mouseup', stopDrag);
    };

    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);
  };

  const toggleFullScreenCenter = () => {
    if (fileTreeVisible || agentChatVisible) {
      setFileTreeVisible(false);
      setAgentChatVisible(false);
    } else {
      setFileTreeVisible(true);
      setAgentChatVisible(true);
    }
  };

  // Interactive step automation console states
  const [showConsole, setShowConsole] = useState(false);
  const [isSimulatingLoop, setIsSimulatingLoop] = useState(false);
  const [customStepTitle, setCustomStepTitle] = useState('');
  const [customStepType, setCustomStepType] = useState<string>('think');
  const [customStepLogs, setCustomStepLogs] = useState('');
  const [isSuccessMsg, setIsSuccessMsg] = useState(false);

  const runAutoSimulation = async () => {
    let tId = activeTask?.id;
    if (!tId) {
      if (tasks.length > 0) {
        tId = tasks[0].id;
      } else {
        // Create simulation task
        try {
          const mockPrompt = "Interactive system diagnostic verification sandbox";
          setRightActiveSidebarTab('chat');
          await startAutomationTask(currentProject!.id, mockPrompt);
          await new Promise(resolve => setTimeout(resolve, 820));
          const latestTasks = useAgentStore.getState().tasks;
          const targetT = latestTasks.find(t => t.prompt === mockPrompt);
          if (targetT) {
            tId = targetT.id;
          } else if (latestTasks.length > 0) {
            tId = latestTasks[0].id;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (!tId) {
      alert("Please enter a custom feature prompt first in the dialog or chat below to initiate an active pipeline task!");
      return;
    }

    setRightActiveSidebarTab('steps');
    setIsSimulatingLoop(true);
    
    const mockSteps = [
      { type: 'think', title: 'Pondering layout architecture constraints', logs: 'Evaluating viewport variables...\nConfigured responsive container styles and validated bootstrap breakpoint grids.' },
      { type: 'write_file', title: 'Writing index.html dashboard framework', logs: 'Generated complete index.html including real-time charts framework integrations.' },
      { type: 'run_command', title: 'Executing node typescript linter checks', logs: 'npm run lint\n✓ Compilation check successful. 0 errors, 0 warnings found.' },
      { type: 'deploy', title: 'Deploying static resources to local sandbox', logs: 'Optimizing resources assets...\nProject successfully compiled and bound on http://0.0.0.0:3000\nScreenshot capture sequence active.' }
    ];

    for (const s of mockSteps) {
      await createCustomStep(tId, {
        type: s.type as any,
        title: s.title,
        status: 'completed',
        logs: s.logs
      });
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    setIsSimulatingLoop(false);
  };

  const handleInjectCustomStep = async (e: React.FormEvent) => {
    e.preventDefault();
    let tId = activeTask?.id;
    if (!tId) {
      if (tasks.length > 0) {
        tId = tasks[0].id;
      }
    }

    if (!tId) {
      try {
        const p = "Interactive Automation Task Console";
        await startAutomationTask(currentProject!.id, p);
        await new Promise(resolve => setTimeout(resolve, 820));
        const latestTasks = useAgentStore.getState().tasks;
        const targetT = latestTasks.find(t => t.prompt === p);
        if (targetT) tId = targetT.id;
      } catch (err) {
        console.error(err);
      }
    }

    if (!tId) return;

    await createCustomStep(tId, {
      type: customStepType as any,
      title: customStepTitle || `Manual ${customStepType} trace step`,
      status: 'completed',
      logs: customStepLogs || 'Interactive step diagnostic tracer launched manually.'
    });

    setCustomStepTitle('');
    setCustomStepLogs('');
    setIsSuccessMsg(true);
    setTimeout(() => setIsSuccessMsg(false), 2500);
  };

  // Trigger loading project parameters when mounting projects
  useEffect(() => {
    if (currentProject) {
      selectProject(currentProject.id);
    }
  }, []);

  if (!currentProject) {
    return (
      <div className="flex-1 bg-[#050506] flex flex-col items-center justify-center p-8 select-none h-[calc(100vh-3rem)]">
        <Layers className="w-10 h-10 text-[#52525b] mb-4 stroke-[1.5]" />
        <h3 className="text-xs font-semibold text-[#a1a1aa]">Loading project context...</h3>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#050506] flex h-[calc(100vh-3rem)] overflow-hidden">
      
      {/* 1. Left Sidebar File Explorer */}
      {fileTreeVisible && (
        <FileTree width={fileTreeWidth} />
      )}

      {/* Resizable Divider Left */}
      {fileTreeVisible && (
        <div
          onMouseDown={startResizingFileTree}
          onDoubleClick={() => setFileTreeWidth(224)}
          className="w-[3px] bg-[#1a1a20] hover:bg-[#4f46e5]/60 active:bg-[#4f46e5] cursor-col-resize transition-all select-none self-stretch shrink-0 relative z-25 group"
          title="Drag to resize explorer. Double-click to reset size."
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-1 bg-[#4f46e5] rounded-full" />
            <div className="w-1 h-1 bg-[#4f46e5] rounded-full" />
            <div className="w-1 h-1 bg-[#4f46e5] rounded-full" />
          </div>
        </div>
      )}

      {/* Collapsed rail explorer button */}
      {!fileTreeVisible && (
        <button
          onClick={() => setFileTreeVisible(true)}
          className="w-6 h-full border-r border-[#1f1f23] bg-[#08080a] hover:bg-[#121217] transition-all duration-150 flex flex-col items-center justify-center space-y-4 cursor-pointer select-none shrink-0 group border-b border-[#1f1f23]"
          title="Expand Explorer Sidebar"
        >
          <div className="text-[9px] font-bold font-mono tracking-widest text-[#52525b] group-hover:text-indigo-400 uppercase [writing-mode:vertical-lr] flex items-center gap-1.5 transition-colors">
            <span>EXPLORER</span>
            <span className="text-indigo-500 font-extrabold translate-y-0.5 font-sans">❯</span>
          </div>
        </button>
      )}

      {/* 2. Middle Workspaces Output Tabs (Code / Browser Preview / Faux Shell Terminal) */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#1f1f23] h-full">
        {/* Workspace Central Toggle controls */}
        <div className="h-9 border-b border-[#1f1f23] px-3 flex items-center justify-between bg-[#0a0a0c] space-x-1 shrink-0 select-none">
          <div className="flex items-center space-x-1 h-full">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-1.5 px-3.5 h-full text-[11px] font-semibold font-mono border-b-2 transition-all ${activeTab === 'code' ? 'border-[#4f46e5] text-white bg-[#0e0e11]/40' : 'border-transparent text-[#71717a] hover:text-[#e4e4e7]'}`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code Editor</span>
            </button>

            <button
              onClick={() => setActiveTab('browser')}
              className={`flex items-center space-x-1.5 px-3.5 h-full text-[11px] font-semibold font-mono border-b-2 transition-all ${activeTab === 'browser' ? 'border-[#4f46e5] text-white bg-[#0e0e11]/40' : 'border-transparent text-[#71717a] hover:text-[#e4e4e7]'}`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>App Sandbox Preview</span>
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center space-x-1.5 px-3.5 h-full text-[11px] font-semibold font-mono border-b-2 transition-all ${activeTab === 'terminal' ? 'border-[#4f46e5] text-white bg-[#0e0e11]/40' : 'border-transparent text-[#71717a] hover:text-[#e4e4e7]'}`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Command Shell</span>
            </button>
          </div>

          <div className="flex items-center space-x-1.5 h-full py-0.5">
            <button
              type="button"
              onClick={() => setFileTreeVisible(!fileTreeVisible)}
              className={`h-6 px-2.5 rounded text-[10px] font-mono font-bold tracking-tight border flex items-center space-x-1.5 transition-all cursor-pointer ${
                fileTreeVisible
                  ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/60 hover:bg-indigo-950/65'
                  : 'bg-[#16161a] border-[#27272a] text-[#71717a] hover:text-white hover:border-[#3f3f46]'
              }`}
              title="Toggle File Explorer sidebar"
            >
              <span>EXPLORER:</span>
              <span className="font-extrabold uppercase text-[9px]">
                {fileTreeVisible ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAgentChatVisible(!agentChatVisible)}
              className={`h-6 px-2.5 rounded text-[10px] font-mono font-bold tracking-tight border flex items-center space-x-1.5 transition-all cursor-pointer ${
                agentChatVisible
                  ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/60 hover:bg-indigo-950/65'
                  : 'bg-[#16161a] border-[#27272a] text-[#71717a] hover:text-white hover:border-[#3f3f46]'
              }`}
              title="Toggle Agent Chat & logs sidebar"
            >
              <span>LOGS:</span>
              <span className="font-extrabold uppercase text-[9px]">
                {agentChatVisible ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleFullScreenCenter}
              className={`h-6 px-2.5 rounded text-[10px] font-mono font-bold tracking-tight border flex items-center space-x-1.5 transition-all cursor-pointer ${
                (!fileTreeVisible && !agentChatVisible)
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60 hover:bg-emerald-950/65 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                  : 'bg-[#16161a] border-[#27272a] text-yellow-500/85 hover:text-yellow-400 hover:border-yellow-900/50'
              }`}
              title="Toggle Full Focus View (maximize code/terminal/preview)"
            >
              {!(fileTreeVisible || agentChatVisible) ? (
                <>
                  <Minimize2 className="w-3 h-3" />
                  <span>RESTORE</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3" />
                  <span>MAXIMIZE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Central Display Render panel */}
        <div className="flex-1 min-w-0 min-h-0 bg-[#0e0e11] relative">
          {activeTab === 'code' && <CodeViewer />}
          {activeTab === 'browser' && <BrowserPreview />}
          {activeTab === 'terminal' && <TerminalViewer />}
        </div>
      </div>

      {/* Resizable Divider Right */}
      {agentChatVisible && (
        <div
          onMouseDown={startResizingAgentChat}
          onDoubleClick={() => setAgentChatWidth(320)}
          className="w-[3px] bg-[#1a1a20] hover:bg-[#4f46e5]/60 active:bg-[#4f46e5] cursor-col-resize transition-all select-none self-stretch shrink-0 relative z-25 group"
          title="Drag to resize agent panel. Double-click to reset size."
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-1 bg-[#4f46e5] rounded-full" />
            <div className="w-1 h-1 bg-[#4f46e5] rounded-full" />
            <div className="w-1 h-1 bg-[#4f46e5] rounded-full" />
          </div>
        </div>
      )}

      {/* Collapsed rail agent chat button */}
      {!agentChatVisible && (
        <button
          onClick={() => setAgentChatVisible(true)}
          className="w-6 h-full border-l border-[#1f1f23] bg-[#0a0a0c] hover:bg-[#121217] transition-all duration-150 flex flex-col items-center justify-center space-y-4 cursor-pointer select-none shrink-0 group border-b border-[#1f1f23]"
          title="Expand Chat & Logs Sidebar"
        >
          <div className="text-[9px] font-bold font-mono tracking-widest text-[#52525b] group-hover:text-indigo-400 uppercase [writing-mode:vertical-lr] flex items-center gap-1.5 transition-colors">
            <span className="text-indigo-500 font-extrabold -translate-y-0.5 font-sans">❮</span>
            <span>CHAT & LOGS</span>
          </div>
        </button>
      )}

      {/* 3. Right Sidebar Logs Panel (Tasks, Step Milestones, Chat Log Console) */}
      {agentChatVisible && (
        <div 
          style={{ width: agentChatWidth }}
          className="border-l border-[#1f1f23] bg-[#0a0a0c] flex flex-col h-full shrink-0 overflow-hidden"
        >
        
        {/* Active Session Context Box */}
        <div className="p-3 border-b border-[#1f1f23]">
          <div className="text-[10px] font-bold uppercase text-[#52525b] mb-2 select-none text-left">Current Session</div>
          <div className="p-3 bg-[#16161a] border border-[#27272a] rounded-lg text-left">
            <div className="text-xs font-semibold text-white mb-0.5 truncate uppercase font-mono tracking-tight text-left">
              {activeTask ? 'Active Autopilot Task' : 'Awaiting Prompter'}
            </div>
            <p className="text-[11px] text-[#71717a] leading-tight break-words text-left">
              {activeTask ? activeTask.prompt : 'Type a feature prompt below to start the autonomous generation cycle.'}
            </p>
          </div>
        </div>

        {/* Evaluation & Feedback Block */}
        <TaskFeedbackWidget projectId={currentProject.id} tasks={tasks} />

        {/* Right sub-tabs navigator */}
        <div className="h-9 border-b border-[#1f1f23] bg-[#0a0a0c] flex select-none shrink-0">
          <button
            onClick={() => setRightActiveSidebarTab('steps')}
            className={`flex-1 flex items-center justify-center space-x-1.5 text-[10px] font-bold font-mono tracking-wider uppercase border-b-2 transition-colors ${rightActiveSidebarTab === 'steps' ? 'border-[#4f46e5] text-white bg-[#16161a]/20' : 'border-transparent text-[#71717a] hover:text-[#e4e4e7] bg-transparent'}`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Milestones Logs</span>
          </button>

          <button
            onClick={() => setRightActiveSidebarTab('chat')}
            className={`flex-1 flex items-center justify-center space-x-1.5 text-[10px] font-bold font-mono tracking-wider uppercase border-b-2 transition-colors ${rightActiveSidebarTab === 'chat' ? 'border-[#4f46e5] text-white bg-[#16161a]/20' : 'border-transparent text-[#71717a] hover:text-[#e4e4e7] bg-transparent'}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Agent Dialogue</span>
          </button>
        </div>

        {/* Side content render panel */}
        <div className="flex-1 overflow-y-auto bg-[#0a0a0c]">
          {rightActiveSidebarTab === 'steps' ? (
            <div className="p-3.5 space-y-3 font-sans">
              
              {/* Task Pipeline Header and Controller switches */}
              <div className="flex items-center justify-between border-b border-[#1f1f23] pb-2 select-none">
                <span className="text-[9.5px] font-bold font-mono tracking-widest uppercase text-[#52525b]">Task Pipeline</span>
                <button
                  type="button"
                  onClick={() => setShowConsole(!showConsole)}
                  className={`text-[9.5px] font-mono uppercase font-bold px-2 py-0.5 rounded border transition-all cursor-pointer flex items-center space-x-1 ${showConsole ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/60' : 'bg-[#16161a] text-[#71717a] border-[#27272a] hover:text-white'}`}
                >
                  <Sliders className="w-2.5 h-2.5 mr-0.5" />
                  <span>{showConsole ? 'Hide Console' : 'Step Simulator'}</span>
                </button>
              </div>

              {/* Expandable Step Simulator Control Panel */}
              {showConsole && (
                <div className="p-3 bg-[#0d0d10] border border-[#1f1f23] rounded-lg space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-mono font-bold uppercase text-indigo-400 tracking-wider">Interactive Studio Automation</span>
                    <span className="text-[8px] font-mono text-[#52525b]">SIMULATOR v1.1</span>
                  </div>

                  {/* Simulator Trigger */}
                  <div className="space-y-1.5 pb-2.5 border-b border-[#1f1f23]/60">
                    <p className="text-[10px] text-[#71717a] leading-tight">Run automated developer cycles with real database tracking and SSE synchronization.</p>
                    <button
                      type="button"
                      disabled={isSimulatingLoop}
                      onClick={runAutoSimulation}
                      className="w-full h-8 flex items-center justify-center space-x-1.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold font-mono text-[10px] uppercase tracking-wider rounded select-none shadow-[0_0_8px_rgba(79,70,229,0.25)] cursor-pointer"
                    >
                      {isSimulatingLoop ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                          <span>Streaming Cycles...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current mr-1" />
                          <span>Simulate Auto-Solve Pipeline</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Custom manual step injector form */}
                  <form onSubmit={handleInjectCustomStep} className="space-y-2">
                    <span className="block text-[9px] font-mono font-bold text-[#71717a] uppercase">Manual log injection</span>
                    
                    {isSuccessMsg && (
                      <div className="text-[9px] font-medium text-emerald-400 bg-emerald-950/20 border border-emerald-900/10 p-1 rounded text-center">
                        Step trace injected successfully!
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="block text-[8px] font-bold font-mono text-[#52525b] uppercase mb-0.5">Tool Type</label>
                        <select
                          value={customStepType}
                          onChange={(e) => setCustomStepType(e.target.value)}
                          className="w-full bg-[#16161a] border border-[#27272a] text-[10px] p-1.5 rounded text-white focus:outline-none"
                        >
                          <option value="think">think</option>
                          <option value="plan">plan</option>
                          <option value="write_file">write_file</option>
                          <option value="run_command">run_command</option>
                          <option value="deploy">deploy</option>
                          <option value="ask_user">ask_user</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[8px] font-bold font-mono text-[#52525b] uppercase mb-0.5">Core Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Run tests"
                          value={customStepTitle}
                          onChange={(e) => setCustomStepTitle(e.target.value)}
                          className="w-full bg-[#16161a] border border-[#27272a] text-[10px] p-1 px-1.5 rounded text-white focus:outline-none placeholder-gray-650 h-7"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-bold font-mono text-[#52525b] uppercase mb-0.5">Detailed Logs Report</label>
                      <textarea
                        rows={2}
                        placeholder="Emitted terminal log traces (optional)..."
                        value={customStepLogs}
                        onChange={(e) => setCustomStepLogs(e.target.value)}
                        className="w-full bg-[#16161a] border border-[#27272a] text-[9.5px] p-1.5 rounded text-white focus:outline-none placeholder-gray-650 font-mono resize-none leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full h-7 bg-[#16161a] hover:bg-[#1c1c21] text-[#e4e4e7] hover:text-white border border-[#27272a] hover:border-[#3f3f46] uppercase font-mono text-[9px] font-bold rounded transition-all cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-3 h-3 mr-0.5" />
                      <span>Inject Trace Step</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Status information when empty */}
              <div className="flex items-center justify-between text-[9px] font-mono text-[#52525b] select-none">
                <span>Logged Traces: {steps.length}</span>
                <span>Active project schema</span>
              </div>

              {steps.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-[#1f1f23] rounded-lg select-none my-2.5 bg-[#0a0a0c]">
                  <ListTodo className="w-6 h-6 text-[#52525b] mx-auto mb-1.5 stroke-[1.5]" />
                  <p className="text-[11px] text-[#a1a1aa] font-medium">No cycles yet</p>
                  <p className="text-[10px] text-[#71717a] font-mono mt-0.5 max-w-[200px] mx-auto leading-normal">
                    Enter a prompt in the prompter below, or turn on the <span className="text-indigo-400 font-semibold cursor-pointer" onClick={() => setShowConsole(true)}>Step Simulator</span> to stream layout cycles!
                  </p>
                </div>
              ) : (
                <motion.div className="space-y-3" layout>
                  <AnimatePresence initial={false}>
                    {steps.map((st) => (
                      <motion.div
                        key={st.id}
                        initial={{ opacity: 0, y: 15, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 320, damping: 22 }}
                        layout
                      >
                        <StepCard step={st} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-[#52525b] select-none">
                    <MessageSquare className="w-6 h-6 mx-auto opacity-30 mb-1.5" />
                    <span className="text-[9px] uppercase tracking-wider font-mono">Dialogue empty</span>
                  </div>
                ) : (
                  messages.map((m) => (
                    <ChatMessage key={m.id} message={m} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic chat inputs and answers controllers */}
        <ChatInput />
      </div>
      )}

    </div>
  );
}
