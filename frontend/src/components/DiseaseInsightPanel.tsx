'use client';

import { BookOpen, Eye, AlertTriangle } from 'lucide-react';
import type { DiseaseInsight } from '@/lib/diseaseInsights';

export function DiseaseInsightPanel({ insight, className }: { insight: DiseaseInsight; className?: string }) {
  return (
    <div className={`rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 p-4 space-y-3 text-left ${className ?? ''}`}>
      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
        <BookOpen className="w-4 h-4 shrink-0" />
        {insight.headline}
      </p>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{insight.summary}</p>
      <div className="grid gap-2 sm:grid-cols-2 text-xs sm:text-sm">
        <div className="rounded-lg bg-white/60 dark:bg-slate-800/60 p-3 border border-slate-200/80 dark:border-slate-600/50">
          <p className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1">
            <Eye className="w-3.5 h-3.5" />
            What to look for
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-snug">{insight.whatToLookFor}</p>
        </div>
        <div className="rounded-lg bg-white/60 dark:bg-slate-800/60 p-3 border border-slate-200/80 dark:border-slate-600/50">
          <p className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Why it matters
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-snug">{insight.whyItMatters}</p>
        </div>
      </div>
    </div>
  );
}
