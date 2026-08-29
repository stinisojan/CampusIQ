'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  ArrowRight,
  Loader2,
} from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [role, setRole] = useState('student');
  const [localError, setLocalError] = useState('');

  const { register, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleRegister = async (e) => {
    e?.preventDefault();
    clearError();
    setLocalError('');

    try {
      const res = await register({ name, email, password, role, department });

      if (res && res.success) {
        if (role === 'admin') {
          router.push('/admin/documents');
        } else {
          router.push('/chat');
        }
      } else if (res && !res.success) {
        setLocalError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration exception:', err);
      setLocalError(
        err.response?.data?.message || err.message || 'Network error connecting to backend.'
      );
    }
  };

  const activeError = error || localError;

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
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-400">
            Join the CampusIQ institutional intelligence network
          </p>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {activeError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-campus-500/60 transition-colors"
              />
            </div>
          </div>

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
                placeholder="alex.johnson@campusiq.edu"
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-campus-500/60 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-campus-500/60"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Eng">Electrical Eng</option>
                <option value="Mechanical Eng">Mechanical Eng</option>
                <option value="Business Admin">Business Admin</option>
                <option value="Admissions">Admissions Office</option>
                <option value="Administration">Administration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-campus-500/60"
              >
                <option value="student">Student</option>
                <option value="admin">Administrator</option>
              </select>
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
                <span>Register & Enter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-campus-400 hover:underline font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}