'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuthStore } from '../../store/authStore';
import {
  User,
  Shield,
  Building,
  Mail,
  Cpu,
  Database,
  Sliders,
  CheckCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute>
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-5">
          <h1 className="text-2xl font-bold text-white tracking-tight">System & Account Settings</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your credentials, departmental affiliation, and review active RAG configurations.
          </p>
        </div>

        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-campus-600 to-teal-400 p-0.5 shadow-lg shadow-campus-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl font-bold text-campus-400">
                {user?.name?.[0] || 'U'}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">{user?.name}</h2>
              <span className="text-xs text-slate-400 font-mono">{user?.email}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Assigned Role</span>
              <span className="text-sm font-semibold text-slate-200 capitalize flex items-center gap-1.5 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-campus-400" />
                {user?.role}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Department</span>
              <span className="text-sm font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
                <Building className="w-3.5 h-3.5 text-teal-400" />
                {user?.department || 'General'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Access Status</span>
              <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Active Session
              </span>
            </div>
          </div>
        </div>

        {/* AI & Retrieval Parameters (SDD Section 2 & 14) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-campus-400" />
            <h2 className="text-base font-semibold text-white">CampusIQ RAG Engine Parameters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Embedding Architecture</span>
              <p className="font-mono text-campus-300">Google text-embedding-004 (768 dim) / OpenAI</p>
              <span className="text-[10px] text-slate-500 block">Pluggable via EMBEDDING_PROVIDER</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Answer Generation Model</span>
              <p className="font-mono text-teal-300">Gemini 1.5 Flash / GPT-4o Mini</p>
              <span className="text-[10px] text-slate-500 block">Streaming responses with strict grounding</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Vector Store Index</span>
              <p className="font-mono text-sky-300">High-Performance Memory & Mongo / Pinecone</p>
              <span className="text-[10px] text-slate-500 block">Cosine Similarity Search</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Similarity Threshold Cutoff</span>
              <p className="font-mono text-amber-300">0.45 Minimum Cosine Score</p>
              <span className="text-[10px] text-slate-500 block">Guarantees zero-hallucination fallback</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
