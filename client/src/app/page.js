'use client';

import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Zap,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  FileText,
  Search,
  Database,
  Lock,
} from 'lucide-react';

export default function LandingPage() {
  const exampleQuestions = [
    {
      category: 'Scholarships & Grants',
      question: 'What are the GPA criteria to maintain the Presidential Merit Scholarship?',
      tag: '100% Tuition Waiver',
    },
    {
      category: 'Residential Life',
      question: 'What are the hostel curfew hours and procedure for overnight night passes?',
      tag: 'Hostel Code of Conduct',
    },
    {
      category: 'Computer Science',
      question: 'What is the minimum attendance required to appear for CSE semester exams?',
      tag: 'Academic Regulations',
    },
    {
      category: 'Admissions & Fees',
      question: 'What is the refund policy if a student withdraws within 2 weeks of classes?',
      tag: 'Fee Schedule 2026',
    },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: 'Zero-Hallucination RAG',
      desc: 'Answers strictly grounded in verified institutional documents. If context is missing, the AI explicitly reports not found rather than making up answers.',
      color: 'text-campus-400',
    },
    {
      icon: BookOpen,
      title: 'Traceable Source Citations',
      desc: 'Every answer provides direct references to the exact PDF document, page number, and similarity score for full verification.',
      color: 'text-teal-400',
    },
    {
      icon: Zap,
      title: 'Real-Time Token Streaming',
      desc: 'Experience instant low-latency token streaming over WebSockets as the LLM synthesizes responses.',
      color: 'text-amber-400',
    },
    {
      icon: Database,
      title: 'Pluggable AI & Vector Stores',
      desc: 'Built to run seamlessly on Google Gemini or OpenAI with local high-performance vector store or Pinecone.',
      color: 'text-sky-400',
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,184,166,0.15),rgba(255,255,255,0))]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-campus-500/10 border border-campus-500/20 text-campus-400 text-xs font-semibold shadow-sm animate-pulse-slow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen RAG College Intelligence Platform</span>
          </div>

          {/* Heading */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Instant, Grounded Answers for Your Entire{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-campus-400 via-teal-300 to-sky-400">
                Campus Community
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Ask natural-language questions about admissions, fees, hostel regulations, course catalogs, exams, and scholarships. Grounded in real university PDFs with verified citations.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/chat"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-campus-500 to-teal-400 hover:from-campus-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-campus-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <span>Launch CampusIQ Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl glass-panel hover:bg-slate-800/80 text-slate-200 text-sm font-semibold border border-slate-700/80 transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In / Demo Login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Example Interactive Queries */}
      <section className="py-16 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Explore Common Campus Questions
            </h2>
            <p className="text-sm text-slate-400">
              Click any sample prompt to start querying the knowledge base
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {exampleQuestions.map((item, idx) => (
              <Link
                key={idx}
                href={`/chat?query=${encodeURIComponent(item.question)}`}
                className="glass-panel p-5 rounded-2xl border border-slate-800/90 hover:border-campus-500/50 hover:bg-slate-900/80 transition-all group relative block text-left"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-campus-400">{item.category}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {item.tag}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                  &ldquo;{item.question}&rdquo;
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 group-hover:text-campus-400 transition-colors">
                  <span>Ask CampusIQ</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Built on Modern RAG Principles
            </h2>
            <p className="text-sm text-slate-400">
              Architected for enterprise accuracy, provenance, and low-latency retrieval
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 relative group hover:border-slate-700 transition-all"
                >
                  <div className={`p-2.5 rounded-xl bg-slate-900 w-fit border border-slate-800 ${feat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-white">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-500 space-y-2">
        <p>© 2026 CampusIQ. Official RAG-Based College Information Assistant.</p>
        <p className="font-mono text-[11px] text-slate-600">
          Architecture: Next.js App Router • Node/Express • Vector Store • Gemini & OpenAI RAG
        </p>
      </footer>
    </div>
  );
}
