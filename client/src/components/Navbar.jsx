'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import {
  GraduationCap,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  User,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Ask CampusIQ', href: '/chat', icon: MessageSquare, show: isAuthenticated },
    {
      name: 'Knowledge Base',
      href: '/admin/documents',
      icon: FileText,
      show: isAuthenticated && user?.role === 'admin',
      adminOnly: true,
    },
    {
      name: 'Analytics',
      href: '/admin/dashboard',
      icon: BarChart3,
      show: isAuthenticated && user?.role === 'admin',
      adminOnly: true,
    },
    { name: 'Settings', href: '/settings', icon: Settings, show: isAuthenticated },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-campus-600 to-teal-400 p-0.5 shadow-lg shadow-campus-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-campus-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-campus-300 transition-colors">
                Campus<span className="text-campus-400">IQ</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-campus-500/10 text-campus-400 border border-campus-500/20">
                RAG AI
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">Official College Intelligence</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks
            .filter((link) => link.show)
            .map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-campus-500/15 text-campus-300 border border-campus-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-campus-400' : 'text-slate-400'}`} />
                  {link.name}
                  {link.adminOnly && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ADMIN
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800">
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-campus-300 border border-campus-500/20">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate">{user?.name}</span>
                  <span className="text-[10px] text-slate-400 capitalize">{user?.role} • {user?.department || 'Student'}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-slate-950 bg-gradient-to-r from-campus-400 to-teal-300 hover:from-campus-300 hover:to-teal-200 rounded-lg shadow-md shadow-campus-500/20 transition-all font-semibold"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
