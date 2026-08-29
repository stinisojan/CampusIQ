'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import ChatWindow from '../../components/ChatWindow';
import { useChatStore } from '../../store/chatStore';
import { Loader2 } from 'lucide-react';

function ChatContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const { fetchConversations, sendMessage } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle URL query pre-fill (e.g. from landing page cards)
  useEffect(() => {
    const initialQuery = searchParams.get('query');
    if (initialQuery) {
      sendMessage(initialQuery);
    }
  }, [searchParams, sendMessage]);

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 lg:hidden"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ChatWindow onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
    </div>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="min-h-[70vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-campus-400 animate-spin" />
          </div>
        }
      >
        <ChatContent />
      </Suspense>
    </ProtectedRoute>
  );
}
