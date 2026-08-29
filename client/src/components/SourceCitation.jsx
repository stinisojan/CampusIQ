'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, FileText, Sparkles, ExternalLink } from 'lucide-react';

export default function SourceCitation({ sources }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

  if (!sources || sources.length === 0) return null;

  const handleOpenDocument = (docId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem('campusiq_token') || localStorage.getItem('token');
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.open(`${backendUrl}/api/documents/${docId}/view?token=${token}`, '_blank');
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-800/80">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-semibold text-campus-400 hover:text-campus-300 transition-colors py-1 group"
        >
          <BookOpen className="w-3.5 h-3.5 text-campus-400 group-hover:scale-110 transition-transform" />
          <span>Grounded in {sources.length} Verified College Source{sources.length > 1 ? 's' : ''}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-amber-400" /> RAG Grounded
        </span>
      </div>

      {isExpanded && (
        <div className="mt-2.5 space-y-2 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sources.map((src, idx) => {
              const scorePercent = src.score ? Math.round(src.score * 100) : 85;
              const isSelected = selectedSource === idx;
              const docId = src.documentId || src.docId || src._id;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedSource(isSelected ? null : idx)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-campus-950/40 border-campus-500/50 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-campus-400 shrink-0" />
                      <span className="text-xs font-medium text-slate-200 truncate" title={src.filename || src.title}>
                        {src.filename || src.title || 'Campus Document'}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 font-mono ${
                        scorePercent >= 75
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                      }`}
                      title={`Semantic similarity score: ${(src.score || 0.85).toFixed(3)}`}
                    >
                      {scorePercent}% match
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <div className="flex items-center gap-2 truncate">
                      <span>Page {src.page || src.pageNumber || '1'}</span>
                      <span>•</span>
                      <span className="truncate">{src.section || 'General'}</span>
                    </div>

                    {docId && (
                      <button
                        type="button"
                        onClick={(e) => handleOpenDocument(docId, e)}
                        className="text-[10px] font-semibold text-campus-400 hover:text-campus-300 hover:underline flex items-center gap-1 shrink-0 ml-2"
                        title="Open raw document"
                      >
                        <span>View</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 bg-slate-950/50 p-1.5 rounded border border-slate-800/40 italic font-sans">
                    &ldquo;{src.snippet}&rdquo;
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}