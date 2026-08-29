'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (requireAdmin && user?.role !== 'admin') {
        router.push('/chat');
      }
    }
  }, [isLoading, isAuthenticated, user, requireAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-campus-400 animate-spin" />
        <p className="text-sm text-slate-400">Authenticating session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Administrator Access Required</h2>
        <p className="text-slate-400 max-w-md text-sm mb-6">
          This area is restricted to college administrators. You are currently logged in with a Student account.
        </p>
        <button
          onClick={() => router.push('/chat')}
          className="px-4 py-2 bg-campus-500 hover:bg-campus-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors"
        >
          Return to Chat
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
