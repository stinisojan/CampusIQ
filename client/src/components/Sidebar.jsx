'use client';

import { useState } from 'react';
import { useChatStore } from '../store/chatStore';
import {
  Plus,
  MessageSquare,
  Trash2,
  Search,
  ChevronRight,
  Filter,
  Sparkles,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    conversations,
    activeConversationId,
    selectConversation,
    createConversation,
    deleteConversation,
    selectedDepartment,
    setSelectedDepartment,
  } = useChatStore();

  const filteredConversations = conversations.filter((c) =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const departments = ['All', 'Admissions', 'Computer Science', 'Student Affairs', 'General'];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-72 lg:static lg:w-80 glass-panel border-r border-slate-800/80 bg-slate-950/90 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Sidebar Header & New Chat CTA */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        <button
          onClick={() => {
            createConversation();
            if (onClose) onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-campus-500 to-teal-500 hover:from-campus-400 hover:to-teal-400 text-slate-950 font-semibold text-sm shadow-md shadow-campus-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Campus Query</span>
        </button>

        {/* Search & Filter */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search past conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-campus-500/50"
          />
        </div>

        {/* Department Filter Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
          <Filter className="w-3 h-3 text-slate-400 shrink-0 mr-1" />
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                selectedDepartment === dept
                  ? 'bg-campus-500/20 text-campus-300 border border-campus-500/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Recent Queries
        </div>

        {filteredConversations.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {searchTerm ? 'No conversations matching search.' : 'No conversations yet. Ask your first question!'}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = activeConversationId === conv._id;
            return (
              <div
                key={conv._id}
                onClick={() => {
                  selectConversation(conv._id);
                  if (onClose) onClose();
                }}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-campus-950/60 text-white border border-campus-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-900/70 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-6">
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-campus-400' : 'text-slate-400 group-hover:text-slate-300'}`}
                  />
                  <div className="flex flex-col truncate">
                    <span className="truncate font-medium">{conv.title || 'Campus Query'}</span>
                    <span className="text-[10px] text-slate-400">
                      {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this conversation?')) {
                      deleteConversation(conv._id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all absolute right-2"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-campus-400" />
          RAG-Grounding v1.0
        </span>
        <span className="text-[10px] text-slate-400 font-mono">Status: Connected</span>
      </div>
    </aside>
  );
}
