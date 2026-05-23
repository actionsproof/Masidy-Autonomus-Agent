import { useState } from 'react';
import { Send, Play, AlertCircle, RefreshCw, StopCircle } from 'lucide-react';
import { useAgentStore } from '../stores/agent-store.js';

export function ChatInput() {
  const { currentProject, activeTask, isAgentRunning, startAutomationTask, cancelActiveTask, resumeActiveTask } = useAgentStore();
  const [promptValue, setPromptValue] = useState('');
  const [answerValue, setAnswerValue] = useState('');

  const isPaused = activeTask?.status === 'paused';

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptValue.trim() || !currentProject || isAgentRunning) return;

    try {
      await startAutomationTask(currentProject.id, promptValue.trim());
      setPromptValue('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerValue.trim() || !activeTask) return;

    try {
      await resumeActiveTask(activeTask.id, answerValue.trim());
      setAnswerValue('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = async () => {
    if (activeTask) {
      await cancelActiveTask(activeTask.id);
    }
  };

  if (!currentProject) return null;

  return (
    <div className="border-t border-gray-200 dark:border-[#1f1f23] p-3.5 bg-white dark:bg-[#08080a] shrink-0 select-none transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        
        {/* Blocker State Trigger - Paused Query Answer Form */}
        {isPaused ? (
          <form onSubmit={handleSendAnswer} className="p-3 rounded border border-rose-200 bg-rose-50 dark:border-rose-900/30 dark:bg-rose-950/10 mb-2.5 transition-colors duration-200">
            <div className="flex items-start space-x-2.5 text-[11px] mb-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono tracking-wider uppercase text-[10px]">Decision Needed</span>
                <p className="text-gray-700 dark:text-[#a1a1aa] mt-0.5">
                  Agent asks: <span className="font-semibold text-gray-900 dark:text-white italic">"{activeTask.prompt || 'Please provide clarification'}"</span>
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                required
                placeholder="Type your decision..."
                value={answerValue}
                onChange={(e) => setAnswerValue(e.target.value)}
                className="flex-1 bg-white dark:bg-[#050506] border border-gray-200 dark:border-[#1f1f23] rounded px-3 py-2 text-[11px] text-gray-900 dark:text-[#e4e4e7] focus:outline-none focus:border-rose-500 font-sans transition-colors duration-200"
              />
              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 rounded font-bold text-[10px] font-mono tracking-wider uppercase transition-all"
              >
                Send
              </button>
            </div>
          </form>
        ) : null}

        {/* Input Prompter Controls */}
        {!isPaused && (
          <div className="flex items-center space-x-3">
            {isAgentRunning ? (
              <div className="flex-1 bg-gray-100 dark:bg-[#16161a] border border-gray-200 dark:border-[#27272a] rounded-lg h-10 px-3.5 flex items-center justify-between transition-colors duration-200">
                <div className="flex items-center space-x-2.5 text-xs text-sky-600 dark:text-sky-450">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600 dark:text-sky-450 shrink-0" />
                  <span className="font-bold font-mono tracking-widest uppercase animate-pulse text-[10px]">Running Agent loop...</span>
                </div>
                
                {/* Abort task button */}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center space-x-1.5 bg-rose-600 text-white border border-rose-700 rounded hover:bg-rose-500 px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider uppercase transition-all"
                >
                  <StopCircle className="w-3 h-3" />
                  <span>Abort</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendPrompt} className="flex-1 flex bg-white dark:bg-[#16161a] border border-gray-200 dark:border-[#27272a] rounded-lg h-10 p-1 focus-within:border-[#4f46e5]/45 transition-all duration-200">
                <input
                  type="text"
                  placeholder="Message the agent (e.g., 'Build clock widget'...)"
                  value={promptValue}
                  onChange={(e) => setPromptValue(e.target.value)}
                  className="flex-1 bg-transparent border-0 outline-none text-[12px] text-gray-900 dark:text-[#e4e4e7] px-2.5 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-[#6b7280] transition-colors duration-200"
                />
                <button
                  type="submit"
                  disabled={!promptValue.trim()}
                  className={`px-3.5 rounded flex items-center justify-center font-bold text-[11px] uppercase font-mono tracking-wider transition-all select-none ${promptValue.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200 dark:bg-[#16161a] dark:text-[#52525b] dark:border-[#27272a]'}`}
                >
                  <Play className="w-3 h-3 mr-1 fill-current" />
                  Code
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
