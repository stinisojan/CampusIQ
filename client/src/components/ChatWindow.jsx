'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import MessageBubble from './MessageBubble';
import {
  Send,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  Loader2,
  Menu,
  FileQuestion,
} from 'lucide-react';

export default function ChatWindow({ onToggleSidebar }) {
  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const {
    messages,
    sendMessage,
    isSending,
    isStreaming,
    streamingContent,
    isLoadingMessages,
    suggestedQuestions,
    selectedDepartment,
    error,
  } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputQuery.trim() || isSending) return;
    const query = inputQuery;
    setInputQuery('');
    sendMessage(query);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedClick = (question) => {
    sendMessage(question);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-950 relative overflow-hidden">
      {/* Chat Header Bar */}
      <div className="h-14 px-4 sm:px-6 border-b border-slate-800/80 glass-panel flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
            title="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-semibold text-slate-200">
              Campus Intelligence Console
            </h1>
            {selectedDepartment !== 'All' && (
              <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-md bg-campus-500/10 text-campus-400 border border-campus-500/20 font-medium">
                Scope: {selectedDepartment}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden md:flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-campus-400" />
            Zero-Hallucination Policy
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {isLoadingMessages ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 text-campus-400 animate-spin" />
            <p className="text-sm">Retrieving conversation history...</p>
          </div>
        ) : messages.length === 0 && !isStreaming ? (
          /* Empty State / Suggested Questions */
          <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 text-center space-y-6 animate-fade-in">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-campus-600/20 to-teal-500/10 border border-campus-500/30 shadow-xl shadow-campus-500/10">
              <GraduationCap className="w-10 h-10 text-campus-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                How can CampusIQ assist you today?
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                Ask anything regarding admissions, scholarship eligibility, hostel rules, course credits, fee schedules, or campus policies.
              </p>
            </div>

            {/* Suggested Question Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedClick(q)}
                  className="p-3.5 rounded-xl glass-card hover:bg-slate-900/90 border-slate-800/80 hover:border-campus-500/40 text-left transition-all hover:scale-[1.01] group flex items-start gap-3"
                >
                  <FileQuestion className="w-4 h-4 text-campus-400 shrink-0 mt-0.5 group-hover:text-campus-300 transition-colors" />
                  <span className="text-xs text-slate-300 group-hover:text-white font-medium leading-snug">
                    {q}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Render Messages */
          <>
            {messages.map((msg, index) => (
              <MessageBubble key={msg._id || index} message={msg} />
            ))}

            {/* In-Progress Streaming Assistant Bubble */}
            {isStreaming && (
              <MessageBubble
                message={{
                  role: 'assistant',
                  content: streamingContent || 'Searching official campus documents & generating grounded response...',
                  llmProvider: 'gemini',
                  sources: [],
                }}
                isStreaming={true}
              />
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-4 py-2 mx-4 sm:mx-6 mb-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      {/* Query Input Box */}
      <div className="p-4 sm:p-6 border-t border-slate-800/80 glass-panel bg-slate-950/90 shrink-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
          <div className="relative rounded-2xl glass-card border border-slate-800 focus-within:border-campus-500/60 focus-within:ring-1 focus-within:ring-campus-500/40 transition-all shadow-xl bg-slate-900/70">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about admissions, hostel, CSE syllabus, scholarships, fees..."
              className="w-full pl-4 pr-14 py-3 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
              disabled={isSending}
            />

            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
              <button
                type="submit"
                disabled={!inputQuery.trim() || isSending}
                className="p-2 rounded-xl bg-gradient-to-r from-campus-500 to-teal-400 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed hover:from-campus-400 hover:to-teal-300 transition-all shadow-md shadow-campus-500/20 active:scale-95"
                title="Send query (Enter)"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Send className="w-4 h-4 text-slate-950 font-bold" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-2">
            <span>Answers strictly grounded in verified university documents.</span>
            <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Enter</kbd> to submit</span>
          </div>
        </form>
      </div>
    </div>
  );
}
