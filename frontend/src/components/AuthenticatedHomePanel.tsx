'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, BarChart2, Clock, Leaf, Microscope, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { getHistory, type PredictionLog } from '@/lib/api';
import { getDiseaseInsight } from '@/lib/diseaseInsights';
import type { Locale } from '@/lib/i18n';

export function AuthenticatedHomePanel({ locale }: { locale: Locale }) {
  const token = useAuthStore((s) => s.token);
  const [items, setItems] = useState<PredictionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getHistory(token, 10)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return null;

  const latest = items[0];
  const latestInsight = latest ? getDiseaseInsight(latest.predicted_class) : null;

  return (
    <motion.section
      id="workspace-section"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="scroll-mt-28 -mt-8 relative z-30 mb-10"
    >
      <div className="rounded-2xl border border-white/10 dark:border-white/10 bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden">
        <div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Signed in — your command center
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Diagnosis dashboard
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 max-w-xl">
                Search, scan leaves, and review AI explainability from one place. History syncs automatically after each upload.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                type="button"
                onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 hover:opacity-95 transition"
              >
                <Microscope className="w-4 h-4" />
                New scan
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <BarChart2 className="w-4 h-4" />
                Full analytics
              </Link>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/50 p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Activity</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{loading ? '—' : items.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Saved predictions</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/50 p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5" />
                Latest insight
              </p>
              {loading ? (
                <p className="text-sm text-slate-500 mt-2">Loading…</p>
              ) : latest && latestInsight ? (
                <>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-2 leading-snug">
                    {latest.predicted_class.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-4">
                    {latestInsight.summary}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                    {(latest.confidence * 100).toFixed(1)}% confidence · {new Date(latest.created_at).toLocaleString(locale === 'hi' ? 'hi-IN' : 'en-US')}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Run your first upload below — results appear here instantly.
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Recent diagnoses
              </p>
              <Link href="/dashboard" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="max-h-[280px] overflow-y-auto">
              {loading ? (
                <p className="p-4 text-sm text-slate-500">Loading history…</p>
              ) : items.length === 0 ? (
                <p className="p-4 text-sm text-slate-600 dark:text-slate-400">
                  No predictions yet. Scroll to <span className="text-emerald-600 dark:text-emerald-400 font-medium">upload a leaf</span> to generate your first report.
                </p>
              ) : (
                <ul className="divide-y divide-slate-200/80 dark:divide-slate-700/80">
                  {items.map((row) => {
                    const insight = getDiseaseInsight(row.predicted_class);
                    return (
                      <li key={row.id} className="px-4 py-3 hover:bg-white/60 dark:hover:bg-slate-800/60 transition">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {row.predicted_class.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{insight.summary}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 shrink-0" />
                              {new Date(row.created_at).toLocaleString(locale === 'hi' ? 'hi-IN' : 'en-US')}
                            </p>
                          </div>
                          <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                            {(row.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
