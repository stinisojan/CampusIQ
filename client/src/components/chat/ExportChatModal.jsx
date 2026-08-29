import React from 'react';
import { Download, X, FileText, Code } from 'lucide-react';

export default function ExportChatModal({ isOpen, onClose, messages, title }) {
  if (!isOpen) return null;

  const handleExport = (format) => {
    if (!messages || messages.length === 0) return;

    let content = '';
    const fileTitle = title || 'CampusIQ_Conversation';

    if (format === 'markdown') {
      content = `# ${fileTitle}\n*Exported on ${new Date().toLocaleString()}*\n\n` +
        messages.map((m) => `### ${m.role === 'user' ? 'Student' : 'CampusIQ Assistant'}\n${m.content}\n`).join('\n---\n');
    } else {
      content = JSON.stringify(messages, null, 2);
    }

    const blob = new Blob([content], { type: format === 'markdown' ? 'text/markdown' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileTitle.replace(/[^a-zA-Z0-9]/g, '_')}.${format === 'markdown' ? 'md' : 'json'}`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-white mb-2">Export Conversation</h3>
        <p className="text-sm text-slate-400 mb-6">Download your complete Q&A thread for future offline reference.</p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleExport('markdown')}
            className="flex flex-col items-center gap-2 p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-white transition"
          >
            <FileText className="w-6 h-6 text-indigo-400" />
            <span className="text-sm font-medium">Markdown (.md)</span>
          </button>

          <button
            onClick={() => handleExport('json')}
            className="flex flex-col items-center gap-2 p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-white transition"
          >
            <Code className="w-6 h-6 text-emerald-400" />
            <span className="text-sm font-medium">JSON (.json)</span>
          </button>
        </div>
      </div>
    </div>
  );
}