'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import DocumentUploader from '../../../components/DocumentUploader';
import DocumentTable from '../../../components/DocumentTable';
import api from '../../../services/api';
import { Database, FileCheck, Layers, Sparkles } from 'lucide-react';

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/documents');
      setDocuments(response.data.documents || []);
    } catch (err) {
      console.error('[AdminDocuments] Error loading documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunkCount || 0), 0);
  const indexedCount = documents.filter((d) => d.processingStatus === 'INDEXED').length;

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Admin Control Room
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Knowledge Base & Vector Store Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Upload, re-chunk, and index campus policy PDFs, syllabus files, and regulations.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="glass-panel px-4 py-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-campus-500/10 text-campus-400">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Indexed Docs</span>
                <span className="text-lg font-bold text-white leading-tight">
                  {indexedCount} <span className="text-xs text-slate-500 font-normal">/ {documents.length}</span>
                </span>
              </div>
            </div>

            <div className="glass-panel px-4 py-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Total Chunks</span>
                <span className="text-lg font-bold text-white leading-tight">{totalChunks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Dropzone */}
        <DocumentUploader onUploadComplete={fetchDocuments} />

        {/* Documents Table */}
        <DocumentTable documents={documents} onRefresh={fetchDocuments} isLoading={isLoading} />
      </div>
    </ProtectedRoute>
  );
}
