'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AnalyticsCharts from '../../../components/AnalyticsCharts';
import api from '../../../services/api';
import { BarChart3, Loader2, RefreshCw } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [unanswered, setUnanswered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, unansweredRes] = await Promise.all([
        api.get('/admin/analytics/overview'),
        api.get('/admin/analytics/unanswered'),
      ]);

      setStats(overviewRes.data.stats || {});
      setUnanswered(unansweredRes.data.queries || []);
    } catch (err) {
      console.error('[AdminDashboard] Error loading analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Performance Telemetry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Campus Intelligence Analytics & Insights
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Analyze query volumes, user satisfaction ratios, and identify missing knowledge gaps.
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>

        {isLoading && !stats ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 text-campus-400 animate-spin" />
            <p className="text-sm">Aggregating telemetry and query logs...</p>
          </div>
        ) : (
          <AnalyticsCharts stats={stats} unansweredQueries={unanswered} />
        )}
      </div>
    </ProtectedRoute>
  );
}
