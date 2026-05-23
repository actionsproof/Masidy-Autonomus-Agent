import ReactMarkdown from 'react-markdown';
import { Bot, User, Shield, Info } from 'lucide-react';
import { Message } from '../../shared/types.js';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAgent = message.role === 'agent' || message.role === 'assistant';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex items-center space-x-2 bg-[#16161a] border border-[#27272a] rounded p-2.5 text-[11px] text-[#a1a1aa] font-mono my-2 select-none">
        <Info className="w-3.5 h-3.5 text-indigo-405 shrink-0" />
        <span className="flex-1 truncate">{message.content}</span>
      </div>
    );
  }

  return (
    <div className={`p-4 border-b border-[#1f1f23] transition-colors ${isAgent ? 'bg-[#0e0e11]/35' : 'bg-[#050506]/40'}`}>
      <div className="max-w-3xl mx-auto flex items-start space-x-3">
        {/* Avatar */}
        <div className={`w-6 h-6 rounded shrink-0 flex items-center justify-center border ${isAgent ? 'bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] border-transparent text-white shadow-[0_0_8px_rgba(79,70,229,0.3)]' : 'bg-[#16161a] border-[#27272a] text-[#a1a1aa]'}`}>
          {isAgent ? (
            <Bot className="w-3.5 h-3.5" />
          ) : (
            <User className="w-3.5 h-3.5" />
          )}
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center space-x-2 select-none">
            <span className="text-[10px] font-bold text-[#e4e4e7] uppercase font-mono tracking-wider leading-none">
              {isAgent ? 'Masidy Agent' : 'User'}
            </span>
            <span className="text-[9px] text-[#52525b] font-mono leading-none">
              {new Date(message.createdAt).toLocaleTimeString()}
            </span>
          </div>

          {/* Message Core Body */}
          <div className="markdown-body mt-2 text-[12px] text-[#d4d4d8] leading-relaxed font-sans prose prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
