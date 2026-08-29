import React, { useState } from 'react';
import { Paperclip, Download, Send, X } from 'lucide-react';
import VoiceControls from './VoiceControls';
import ExportChatModal from './ExportChatModal';

export default function ChatControls({ onSendMessage, messages, conversationTitle }) {
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() && attachedFiles.length === 0) return;

    onSendMessage(inputText, attachedFiles);
    setInputText('');
    setAttachedFiles([]);
  };

  return (
    <div className="w-full bg-slate-900/90 border-t border-slate-800 p-4 rounded-b-2xl">
      {/* Ephemeral Attachments Bar */}
      {attachedFiles.length > 0 && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {attachedFiles.map((file, idx) => (
            <span key={idx} className="flex items-center gap-1.5 bg-indigo-600/30 text-indigo-300 text-xs px-3 py-1.5 rounded-full border border-indigo-500/40">
              <Paperclip className="w-3.5 h-3.5" />
              {file.name}
              <button type="button" onClick={() => removeAttachment(idx)} className="hover:text-red-400 ml-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Main Input Controls */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <label className="p-2.5 text-slate-400 hover:text-white cursor-pointer bg-slate-800 hover:bg-slate-700/80 rounded-xl transition">
          <Paperclip className="w-5 h-5" />
          <input type="file" multiple onChange={handleFileUpload} className="hidden" />
        </label>

        <VoiceControls onSpeechResult={(transcript) => setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript))} />

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a campus query or attachment question..."
          className="flex-1 bg-slate-800/90 text-white placeholder-slate-400 text-sm rounded-xl px-4 py-3 outline-none border border-slate-700/60 focus:border-indigo-500 transition"
        />

        <button
          type="button"
          onClick={() => setIsExportOpen(true)}
          className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
          title="Export Chat"
        >
          <Download className="w-5 h-5" />
        </button>

        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-3 rounded-xl flex items-center gap-2 transition">
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

      <ExportChatModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        messages={messages}
        title={conversationTitle}
      />
    </div>
  );
}