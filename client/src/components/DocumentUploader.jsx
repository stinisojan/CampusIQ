'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, X, Files } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';

export default function DocumentUploader({ onUploadComplete }) {
  const [files, setFiles] = useState([]); // Store array of files
  const [department, setDepartment] = useState('General');
  const [category, setCategory] = useState('General');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [liveStatus, setLiveStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleDocStatus = (data) => {
      setLiveStatus({
        status: data.status,
        message: data.message,
        chunkCount: data.chunkCount,
        error: data.errorMessage,
      });

      if (data.status === 'INDEXED' || data.status === 'FAILED') {
        setIsUploading(false);
        if (onUploadComplete) onUploadComplete();
      }
    };

    socket.on('document:status', handleDocStatus);

    return () => {
      socket.off('document:status', handleDocStatus);
    };
  }, [onUploadComplete]);

  // Handle Drag & Drop for Multiple Files
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
      setErrorMsg('');
    }
  };

  // Handle Selection for Multiple Files
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
      setErrorMsg('');
    }
  };

  // Remove individual file from staged list
  const handleRemoveFile = (index, e) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all staged files
  const handleClearAll = (e) => {
    e.stopPropagation();
    setFiles([]);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setErrorMsg('Please select at least one document to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setErrorMsg('');
    setLiveStatus({ status: 'UPLOADED', message: `Uploading ${files.length} document(s)...` });

    const formData = new FormData();
    // Append all selected files under the key 'files'
    files.forEach((f) => {
      formData.append('files', f);
    });
    formData.append('department', department);
    formData.append('category', category);

    try {
      await api.post('/documents/batch', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('[DocumentUploader] Batch upload error:', err);
      setIsUploading(false);
      setErrorMsg(err.response?.data?.message || 'Failed to upload documents.');
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Ingest New Campus Knowledge</h2>
          <p className="text-xs text-slate-400">
            Upload institutional PDFs, curriculum DOCX files, or policy TXT guides in bulk.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-campus-500/10 text-campus-400 border border-campus-500/20 text-xs font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-campus-400" /> Bulk RAG Ingestion
        </span>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          files.length > 0
            ? 'border-campus-500/60 bg-campus-950/20'
            : 'border-slate-800 hover:border-campus-500/40 hover:bg-slate-900/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple // Enables selecting multiple files in native dialog
          accept=".pdf,.docx,.txt,.md"
          onChange={handleFileChange}
          className="hidden"
        />

        {files.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Files className="w-4 h-4 text-campus-400" />
                {files.length} file(s) selected
              </span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] text-rose-400 hover:underline"
              >
                Clear all
              </button>
            </div>

            {/* List of Selected Files */}
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-left">
              {files.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-campus-400 shrink-0" />
                    <span className="truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({(item.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveFile(idx, e)}
                    className="text-slate-500 hover:text-rose-400 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500">Click or drop more files to add</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 text-slate-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm text-slate-300 font-medium">
              Drag & drop documents here, or <span className="text-campus-400 underline">browse</span>
            </p>
            <p className="text-xs text-slate-500">Supports PDF, DOCX, TXT (Max 25MB per file)</p>
          </div>
        )}
      </div>

      {/* Metadata Configuration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Department Scope
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-campus-500/50"
          >
            <option value="General">General / All Campus</option>
            <option value="Admissions">Admissions Office</option>
            <option value="Computer Science">Computer Science & Engineering</option>
            <option value="Student Affairs">Student Affairs & Residential Life</option>
            <option value="Examinations">Examinations & Records</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-campus-500/50"
          >
            <option value="General">General Policy</option>
            <option value="Admissions">Admissions & Eligibility</option>
            <option value="Academics">Academics & Syllabus</option>
            <option value="Hostel">Hostel & Dining Rules</option>
            <option value="Scholarships">Scholarships & Grants</option>
            <option value="Placements">Placements & Career</option>
          </select>
        </div>
      </div>

      {/* Live Pipeline Status Progress */}
      {liveStatus && (
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              {liveStatus.status === 'INDEXED' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : liveStatus.status === 'FAILED' ? (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <Loader2 className="w-4 h-4 text-campus-400 animate-spin" />
              )}
              Status: <span className="font-mono text-campus-400">{liveStatus.status}</span>
            </span>
            {liveStatus.chunkCount > 0 && (
              <span className="text-[11px] text-slate-400 font-mono">
                {liveStatus.chunkCount} Chunks Indexed
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">{liveStatus.message || liveStatus.error}</p>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          {errorMsg}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={files.length === 0 || isUploading}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-campus-500 to-teal-400 text-slate-950 font-semibold text-sm hover:from-campus-400 hover:to-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-campus-500/20 flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            <span>Processing Ingestion Pipeline...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 text-slate-950 font-bold" />
            <span>
              Upload & Index {files.length > 0 ? `${files.length} Document(s)` : 'Documents'}
            </span>
          </>
        )}
      </button>
    </div>
  );
}