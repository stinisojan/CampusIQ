'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  ShieldCheck,
  User,
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e) => {
    e?.preventDefault();
    clearError();
    const res = await login(email, password);
    if (res.success) {
      if (res.user?.role === 'admin') {
        router.push('/admin/documents');
      } else {
        router.push('/chat');
      }
    }
  };

  const handleDemoLogin = (role) => {
    if (role === 'admin') {
      setEmail('admin@campusiq.edu');
      setPassword('adminpassword123');
      login('admin@campusiq.edu', 'adminpassword123').then((res) => {
        if (res.success) router.push('/admin/documents');
      });
    } else {
      setEmail('student@campusiq.edu');
      setPassword('studentpassword123');
      login('student@campusiq.edu', 'studentpassword123').then((res) => {
        if (res.success) router.push('/chat');
      });
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,rgba(20,184,166,0.1),transparent)] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-campus-600 to-teal-400 p-0.5 shadow-lg shadow-campus-500/20 mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-campus-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sign In to CampusIQ</h1>
          <p className="text-xs text-slate-400">
            Access intelligent RAG queries and college document resources
          </p>
        </div>

        {/* Quick Demo Login Presets */}
        <div className="space-y-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block text-center uppercase tracking-wider">
            Quick 1-Click Demo Logins
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-campus-400" />
              <span>Student Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campusiq.edu"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-campus-500/60 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-campus-500/60 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-campus-500 to-teal-400 hover:from-campus-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-md shadow-campus-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-campus-400 hover:underline font-semibold">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
