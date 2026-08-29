'use client';

import {
  MessageSquare,
  CheckCircle,
  HelpCircle,
  ThumbsUp,
  FileText,
  Clock,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

export default function AnalyticsCharts({ stats, unansweredQueries }) {
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Student Queries',
      value: stats.totalQueries || 0,
      sub: 'All time query volume',
      icon: MessageSquare,
      color: 'text-campus-400',
      bg: 'bg-campus-500/10',
    },
    {
      title: 'RAG Answer Rate',
      value: `${stats.answerRate || 100}%`,
      sub: `${stats.answeredQueries || 0} answered, ${stats.unansweredQueries || 0} ungrounded`,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Student Satisfaction',
      value: `${stats.feedback?.satisfactionRate || 100}%`,
      sub: `👍 ${stats.feedback?.thumbsUp || 0} Upvotes / 👎 ${stats.feedback?.thumbsDown || 0} Downvotes`,
      icon: ThumbsUp,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
    },
    {
      title: 'Active Documents',
      value: stats.totalDocuments || 0,
      sub: `${stats.avgConfidence || 0}% avg retrieval confidence`,
      icon: FileText,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{card.title}</span>
                <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-bold tracking-tight text-white">{card.value}</span>
                <p className="text-[11px] text-slate-500 mt-1">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unanswered Queries Alert Panel (Knowledge Gaps) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Knowledge Gaps (Unanswered Queries)</h2>
              <p className="text-xs text-slate-400">
                Queries where student questions were outside the current knowledge base. Upload documents covering these topics!
              </p>
            </div>
          </div>

          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
            {unansweredQueries?.length || 0} Gaps Logged
          </span>
        </div>

        {(!unansweredQueries || unansweredQueries.length === 0) ? (
          <div className="py-6 text-center text-xs text-slate-500">
            🎉 All student questions have been successfully grounded in the knowledge base!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
            {unansweredQueries.map((q, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-200 font-medium truncate max-w-[450px]">
                  &ldquo;{q.question}&rdquo;
                </span>
                <div className="flex items-center gap-3 text-slate-500 shrink-0 text-[11px]">
                  <span>Dept: {q.department || 'General'}</span>
                  <span>{new Date(q.createdAt || q.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Queries Feed */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-campus-500/10 text-campus-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Live Query Activity Log</h2>
            <p className="text-xs text-slate-400">Recent student interactions and retrieval performance</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Student Question</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(!stats.recentQueries || stats.recentQueries.length === 0) ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-500">
                    No queries logged yet.
                  </td>
                </tr>
              ) : (
                stats.recentQueries.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-slate-200 block truncate max-w-sm">
                        {log.question}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {log.wasAnswered ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Answered
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Not Found
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {Math.round((log.topScore || 0.8) * 100)}%
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {log.latencyMs ? `${log.latencyMs}ms` : '1.2s'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">
                      {new Date(log.createdAt || log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
