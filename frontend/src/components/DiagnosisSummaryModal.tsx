'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle2, ClipboardList, Leaf } from 'lucide-react';
import type { PredictionResult } from '@/lib/api';
import type { DiseaseInsight } from '@/lib/diseaseInsights';

function isHealthyPrediction(className: string): boolean {
  return /___healthy$/i.test(className) || /\bhealthy\b/i.test(className);
}

/** Merge API remedies with concise, professional follow-ups when the list is thin. */
function buildActionSteps(result: PredictionResult, insight: DiseaseInsight, healthy: boolean): string[] {
  const remedies = (result.remedies ?? []).map((r) => r.trim()).filter(Boolean);

  if (healthy) {
    return [
      'Keep a weekly scouting routine on new growth and lower canopy leaves where problems often start first.',
      'Avoid drought stress and over-fertilization extremes; both can invite secondary pathogens later in the season.',
      'Photograph any new lesions or discoloration in natural light and re-run analysis to track changes over time.',
    ];
  }

  const steps: string[] = [...remedies];
  if (steps.length < 3) {
    const scout = insight.whatToLookFor.length > 220 ? `${insight.whatToLookFor.slice(0, 217)}…` : insight.whatToLookFor;
    steps.push(`Field verification: ${scout}`);
  }
  if (steps.length < 4) {
    steps.push(`Management priority: ${insight.whyItMatters}`);
  }
  const seen = new Set<string>();
  return steps.filter((s) => {
    if (seen.has(s)) return false;
    seen.add(s);
    return true;
  }).slice(0, 8);
}

export function DiagnosisSummaryModal({
  open,
  onClose,
  result,
  insight,
}: {
  open: boolean;
  onClose: () => void;
  result: PredictionResult;
  insight: DiseaseInsight;
}) {
  const healthy = isHealthyPrediction(result.class_name);
  const displayName = result.class_name.replace(/___/g, ' · ').replace(/_/g, ' ');
  const steps = buildActionSteps(result, insight, healthy);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md"
          role="presentation"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="diagnosis-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[min(85vh,640px)] overflow-y-auto rounded-2xl border border-slate-200/80 dark:border-slate-600/80 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/20 dark:shadow-black/50"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {healthy ? 'Assessment' : 'Diagnosis'}
                </p>
                <h2 id="diagnosis-modal-title" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5 leading-tight">
                  {healthy ? 'No major disease pattern detected' : 'Condition identified from your leaf image'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                aria-label="Close summary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-600/80">
                  <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                  {displayName}
                </span>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Model confidence {(result.confidence * 100).toFixed(1)}%
                </span>
                {result.severity_estimate && !healthy && (
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25 capitalize">
                    Severity: {result.severity_estimate}
                  </span>
                )}
              </div>

              <section className="rounded-xl border border-slate-200/90 dark:border-slate-700/90 bg-slate-50/90 dark:bg-slate-800/40 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  {healthy ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  {healthy ? 'What we observed' : 'The issue'}
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-2">{insight.headline}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{insight.summary}</p>
              </section>

              <section>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">
                  <ClipboardList className="w-4 h-4 text-emerald-500 shrink-0" />
                  {healthy ? 'Recommended upkeep' : 'How to address it — key actions'}
                </div>
                <ol className="space-y-2.5 list-none p-0 m-0">
                  {steps.map((step, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm text-slate-700 dark:text-slate-300 leading-snug"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200/80 dark:border-slate-700/80 pt-4">
                This summary supports agronomic decisions and does not replace local regulations, product labels, or advice from a certified crop advisor. Always follow label directions for any crop protection product.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:opacity-95 transition"
                >
                  Understood — continue
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
