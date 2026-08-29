'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  User,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Sparkles,
  Bot,
} from 'lucide-react';
import SourceCitation from './SourceCitation';
import { useChatStore } from '../store/chatStore';

export default function MessageBubble({ message, isStreaming = false }) {
  const [copied, setCopied] = useState(false);
  const { submitFeedback } = useChatStore();

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type) => {
    if (message._id && !message._id.startsWith('temp_')) {
      submitFeedback(message._id, type);
      if (type === 'up') {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#14b8a6', '#38bdf8', '#5eead4'],
        });
      }
    }
  };

  return (
    <div
      className={`flex gap-3.5 sm:gap-4 my-4 animate-fade-in ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 mt-1">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-campus-600 to-teal-400 p-0.5 shadow-md shadow-campus-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-campus-400" />
            </div>
          </div>
        )}
      </div>

      {/* Message Box */}
      <div className={`flex flex-col max-w-[88%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Name / Role Header */}
        <div className="flex items-center gap-2 mb-1 px-1 text-xs text-slate-400">
          <span className="font-medium text-slate-300">{isUser ? 'You' : 'CampusIQ Assistant'}</span>
          {!isUser && (
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              • {message.llmProvider || 'gemini'} RAG
            </span>
          )}
          <span className="text-[10px] text-slate-400">
            {message.createdAt
              ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Just now'}
          </span>
        </div>

        {/* Content Bubble */}
        <div
          className={`p-4 sm:p-5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-campus-700 to-teal-800 text-white rounded-tr-none shadow-md shadow-campus-900/20'
              : 'glass-panel rounded-tl-none border-slate-800/90 text-slate-100 shadow-xl'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap font-sans">{message.content}</p>
          ) : (
            <div className="prose-custom">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-campus-400 animate-pulse rounded-sm align-middle" />
              )}
            </div>
          )}

          {/* Source Citations */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <SourceCitation sources={message.sources} />
          )}

          {/* Action Toolbar (Copy & Feedback) for Assistant Messages */}
          {!isUser && !isStreaming && message.content && (
            <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-800/60 text-xs text-slate-400">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Helpful?</span>
                <button
                  onClick={() => handleFeedback('up')}
                  className={`p-1.5 rounded transition-colors ${
                    message.feedback === 'up'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'hover:bg-slate-800 hover:text-emerald-400'
                  }`}
                  title="Thumbs up"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleFeedback('down')}
                  className={`p-1.5 rounded transition-colors ${
                    message.feedback === 'down'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'hover:bg-slate-800 hover:text-rose-400'
                  }`}
                  title="Thumbs down"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
