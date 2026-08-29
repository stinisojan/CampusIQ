'use client';

import { useState } from 'react';
import {
  FileText,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Search,
  Eye,
} from 'lucide-react';
import api from '../services/api';

export default function DocumentTable({ documents = [], onRefresh, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [reindexingId, setReindexingId] = useState(null);

  const filteredDocs = (documents || []).filter((doc) =>
    (doc.originalName || doc.filename || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (id) => {
    const token = localStorage.getItem('campusiq_token') || localStorage.getItem('token');
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.open(`${backendUrl}/api/documents/${id}/view?token=${token}`, '_blank');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document and remove its vector embeddings?')) {
      return;
    }
    setDeletingId(id);
    try {
      await api.delete(`/documents/${id}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReindex = async (id) => {
    setReindexingId(id);
    try {
      await api.post(`/documents/${id}/reindex`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reindex document.');
    } finally {
      setReindexingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'INDEXED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Indexed
          </span>
        );
      case 'CHUNKING':
      case 'EMBEDDING':
      case 'UPLOADED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <Clock className="w-3 h-3" /> {status}
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Indexed Knowledge Base Records</h2>
          <p className="text-xs text-slate-400">
            Manage vector store document sources powering AI responses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-campus-500/50"
            />
          </div>

          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Document Title</th>
              <th className="py-3 px-4">Department / Category</th>
              <th className="py-3 px-4">Chunks</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Uploaded</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">
                  {searchTerm ? 'No documents match search criteria.' : 'No documents in knowledge base yet.'}
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-campus-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-slate-200 block truncate max-w-[200px] sm:max-w-[280px]">
                          {doc.originalName || doc.filename}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {doc.fileSize ? (doc.fileSize / 1024 / 1024).toFixed(2) : '0.00'} MB
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-slate-300">{doc.department || 'General'}</span>
                      <span className="text-[10px] text-slate-500">{doc.category || 'General'}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                      <Layers className="w-3 h-3 text-campus-400" />
                      {doc.chunkCount || 0}
                    </span>
                  </td>

                  <td className="py-3 px-4">{getStatusBadge(doc.processingStatus)}</td>

                  <td className="py-3 px-4 text-slate-400">
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleView(doc._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-campus-400 hover:bg-slate-800 transition-colors"
                        title="View Raw Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleReindex(doc._id)}
                        disabled={reindexingId === doc._id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-campus-400 hover:bg-slate-800 transition-colors"
                        title="Reindex Document"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${reindexingId === doc._id ? 'animate-spin text-campus-400' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleDelete(doc._id)}
                        disabled={deletingId === doc._id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Document & Vectors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}