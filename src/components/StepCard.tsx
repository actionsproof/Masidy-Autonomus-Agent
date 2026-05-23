import { useState } from 'react';
import { 
  Play, CheckCircle, XCircle, ChevronDown, ChevronRight, 
  Map, FileCode, Search, Terminal, Globe, CloudLightning, MessageCircle, Eye, ShieldAlert, Cpu
} from 'lucide-react';
import { Step, ToolName } from '../../shared/types.js';
import { useAgentStore } from '../stores/agent-store.js';

interface StepCardProps {
  step: Step;
}

export function StepFeedbackForm({ step, projectId }: { step: Step; projectId: string }) {
  const { feedbacks, submitFeedback } = useAgentStore();
  const [rating, setRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [alternative, setAlternative] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Check if there is already active feedback saved for this step
  const existingFeedback = feedbacks.find(f => f.stepId === step.id);

  if (existingFeedback) {
    return (
      <div className="mt-3 pt-3 border-t border-[#1f1f23] text-[10px] text-emerald-400 flex flex-col space-y-1 bg-[#121216] p-2.5 rounded border border-emerald-950/40 select-text">
        <div className="flex items-center space-x-1.5 font-semibold">
          <span className="text-[9px] uppercase font-mono tracking-wider font-bold bg-emerald-950/50 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900/30">Action Rated</span>
          <span className="text-amber-400">{'★'.repeat(existingFeedback.rating)}</span>
        </div>
        <div className="text-[#a1a1aa] italic font-sans leading-snug mt-1">"{existingFeedback.feedbackText}"</div>
        {existingFeedback.alternativeApproach && (
          <div className="text-[9.5px] text-[#71717a] font-mono leading-tight mt-1 pt-1 border-t border-[#1f1f23]/40">
            <span className="text-indigo-400 font-bold">Alternative:</span> {existingFeedback.alternativeApproach}
          </div>
        )}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    await submitFeedback({
      projectId,
      rating,
      feedbackText: feedbackText.trim(),
      alternativeApproach: alternative.trim() || undefined,
      taskId: step.taskId,
      stepId: step.id
    });
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <div className="mt-2 text-right select-none">
        <button
          onClick={() => setShowForm(true)}
          className="text-[9.5px] font-mono uppercase font-bold text-[#71717a] hover:text-indigo-400 bg-[#0e0e11] hover:bg-[#16161a] border border-[#1f1f23] hover:border-[#27272a] py-1 px-2.5 rounded transition-all cursor-pointer"
        >
          Rate Action
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-[#1f1f23] text-[11px] select-none text-left bg-[#0e0e11] p-3 rounded border border-indigo-900/30">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[9px] font-bold font-mono text-gray-400 uppercase tracking-widest">Provide Action Rating</div>
        {/* Stars Selector */}
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

      <div className="space-y-2">
        <div>
          <textarea
            placeholder="What could the agent have improved in this action?"
            required
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full bg-[#16161a] border border-[#27272a] focus:border-[#4f46e5]/50 text-[10px] p-2 rounded text-[#e3e3e3] placeholder-gray-600 focus:outline-none leading-relaxed resize-none"
            rows={2}
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Suggest alternative tool/approach (optional)..."
            value={alternative}
            onChange={(e) => setAlternative(e.target.value)}
            className="w-full bg-[#16161a] border border-[#27272a] focus:border-[#4f46e5]/50 text-[10px] px-2 py-1.5 rounded text-[#e3e3e3] placeholder-gray-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end space-x-2 pt-1">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="text-[9.5px] font-mono uppercase text-[#71717a] hover:text-white px-2 py-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold px-3 py-1 rounded text-[9.5px] uppercase tracking-wider font-mono shadow-[0_0_8px_rgba(79,70,229,0.2)] cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
}

export function StepCard({ step }: StepCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentProject } = useAgentStore();

  const getToolMeta = (type: ToolName) => {
    switch (type) {
      case 'plan':
        return { icon: Map, color: 'text-amber-400 bg-amber-950/30 border-amber-900/40', label: 'PLAN' };
      case 'write_file':
        return { icon: FileCode, color: 'text-sky-400 bg-sky-950/30 border-sky-900/40', label: 'WRITE' };
      case 'read_file':
        return { icon: FileCode, color: 'text-sky-400 bg-sky-950/30 border-sky-900/40', label: 'READ' };
      case 'list_files':
        return { icon: Eye, color: 'text-purple-400 bg-purple-950/30 border-purple-900/40', label: 'LS' };
      case 'run_command':
        return { icon: Terminal, color: 'text-teal-400 bg-teal-950/30 border-teal-900/40', label: 'CMD' };
      case 'search_web':
        return { icon: Search, color: 'text-indigo-400 bg-indigo-950/30 border-indigo-900/40', label: 'SEARCH' };
      case 'browse':
        return { icon: Globe, color: 'text-blue-400 bg-blue-950/30 border-blue-900/40', label: 'BROWSE' };
      case 'deploy':
        return { icon: CloudLightning, color: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40', label: 'DEPLOY' };
      case 'ask_user':
        return { icon: MessageCircle, color: 'text-rose-400 bg-rose-950/30 border-rose-900/40', label: 'QUERY' };
      case 'think':
        return { icon: Cpu, color: 'text-gray-400 bg-gray-900 border-gray-800', label: 'THINK' };
      default:
        return { icon: Cpu, color: 'text-gray-400 bg-gray-900 border-gray-800', label: 'TOOL' };
    }
  };

  const meta = getToolMeta(step.type);
  const ToolIcon = meta.icon;

  return (
    <div className={`border rounded-lg transition-all font-sans text-xs ${step.status === 'running' ? 'border-[#4f46e5] bg-[#16161a] shadow-[0_0_12px_rgba(79,70,229,0.35)]' : step.status === 'failed' ? 'border-rose-950 bg-rose-950/5' : 'border-[#1f1f23] bg-[#16161a] hover:border-[#27272a]'}`}>
      
      {/* Step Header Block */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 flex items-center justify-between cursor-pointer select-none space-x-2.5"
      >
        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#71717a] shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#71717a] shrink-0" />
          )}

          <div className={`w-7 h-7 rounded flex items-center justify-center border shrink-0 ${meta.color} bg-[#050506]/45`}>
            <ToolIcon className="w-3.5 h-3.5" />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center space-x-1.5">
              <span className="text-[9px] font-bold font-mono tracking-widest leading-none text-[#71717a]">{meta.label}</span>
              <span className="text-[9px] text-[#52525b] font-mono leading-none border-l border-[#1f1f23] pl-1.5">
                {new Date(step.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <h4 className="text-xs font-semibold text-white mt-1 truncate leading-none capitalize">{step.title}</h4>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="shrink-0">
          {step.status === 'running' && (
            <div className="flex items-center space-x-1 bg-[#4f46e5]/10 text-[#4f46e5] text-[9px] font-mono font-bold tracking-tight uppercase border border-[#4f46e5]/40 rounded-full px-2 py-0.5">
              <span className="w-1 h-1 bg-[#4f46e5] rounded-full animate-ping"></span>
              <span>Thinking</span>
            </div>
          )}
          {step.status === 'completed' && (
            <CheckCircle className="w-4 h-4 text-[#10b981]" />
          )}
          {step.status === 'failed' && (
            <XCircle className="w-4 h-4 text-rose-500" />
          )}
          {step.status === 'pending' && (
            <div className="w-2 h-2 rounded-full bg-[#27272a] border border-[#1f1f23]"></div>
          )}
        </div>
      </div>

      {/* Expandable step trace/logs output block */}
      {isOpen && (
        <div className="border-t border-[#1f1f23] bg-[#050506] p-3 rounded-b-lg select-text">
          <p className="text-[9px] text-[#71717a] uppercase font-mono tracking-wider mb-2 font-bold select-none text-left">Execution Console logs</p>
          {step.logs ? (
            <pre className="text-[#a1a1aa] font-mono text-[10px] bg-[#050506] p-2.5 rounded border border-[#1f1f23] max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed tracking-wide scrollbar-thin select-text text-left">
              {step.logs}
            </pre>
          ) : (
            <p className="text-[9px] font-mono text-[#52525b] italic uppercase text-left">No details or logs emitted for this step.</p>
          )}

          {/* Action rating & feedback forms */}
          {(step.status === 'completed' || step.status === 'failed') && currentProject && (
            <StepFeedbackForm step={step} projectId={currentProject.id} />
          )}
        </div>
      )}
    </div>
  );
}
