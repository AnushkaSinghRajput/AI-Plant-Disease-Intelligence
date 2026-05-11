'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import {
  getModelComparison,
  getModelRecommendation,
  getTrainingLogs,
  type ModelComparison,
} from '@/lib/api';
import {
  ChevronDown,
  ChevronRight,
  Cpu,
  Zap,
  HardDrive,
  Smartphone,
  Target,
  Loader2,
  Database,
  RefreshCw,
  Layers,
  BarChart2,
  Rocket,
  ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const PIPELINE_STEPS = [
  { id: 'preprocess', label: 'Data Preprocessing', icon: Database, color: 'from-blue-500 to-cyan-500' },
  { id: 'augment', label: 'Augmentation', icon: RefreshCw, color: 'from-cyan-500 to-teal-500' },
  { id: 'finetune', label: 'Fine-tuning', icon: Layers, color: 'from-teal-500 to-emerald-500' },
  { id: 'evaluate', label: 'Evaluation', icon: BarChart2, color: 'from-emerald-500 to-green-500' },
  { id: 'deploy', label: 'Deployment', icon: Rocket, color: 'from-green-500 to-lime-500' },
];

export default function ModelsPage() {
  const [models, setModels] = useState<ModelComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<{
    recommended: ModelComparison | null;
    alternatives: ModelComparison[];
    reason: string;
  } | null>(null);
  const [trainingLogs, setTrainingLogs] = useState<{ logs: Array<{ epoch: number; loss: number; accuracy: number }>; model: string } | null>(null);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [prioritize, setPrioritize] = useState<'accuracy' | 'speed' | 'size' | 'mobile'>('accuracy');
  const [constraints, setConstraints] = useState({ maxSizeMb: 100, maxInferenceMs: 100, minAccuracy: 0.9 });

  useEffect(() => {
    getModelComparison()
      .then(setModels)
      .catch(() => toast.error('Failed to load models'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getModelRecommendation({
      prioritize,
      max_size_mb: constraints.maxSizeMb,
      max_inference_ms: constraints.maxInferenceMs,
      min_accuracy: constraints.minAccuracy,
    })
      .then(setRecommendation)
      .catch(() => toast.error('Failed to get recommendation'));
  }, [prioritize, constraints]);

  useEffect(() => {
    getTrainingLogs()
      .then((data) => setTrainingLogs(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPipelineStep((s) => (s + 1) % PIPELINE_STEPS.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 antialiased">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
            Model Comparison & Implementation Insights
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Compare pre-trained architectures with real performance metrics
          </p>
        </motion.header>

        {/* Pipeline Workflow */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-12 overflow-hidden"
        >
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-500" />
            Transfer Learning Pipeline
          </h2>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {PIPELINE_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === pipelineStep;
              return (
                <motion.div
                  key={step.id}
                  animate={{ scale: isActive ? 1.05 : 1, opacity: isActive ? 1 : 0.8 }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r ${step.color} text-white text-sm font-medium transition`}
                >
                  <Icon className="w-4 h-4" />
                  {step.label}
                  {i < PIPELINE_STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 ml-1 opacity-70" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Smart Model Recommendation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6 mb-12"
        >
          <h2 className="font-semibold text-lg mb-4">Smart Model Recommendation</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            {(['accuracy', 'speed', 'size', 'mobile'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrioritize(p)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  prioritize === p
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {p === 'accuracy' && <Target className="w-4 h-4" />}
                {p === 'speed' && <Zap className="w-4 h-4" />}
                {p === 'size' && <HardDrive className="w-4 h-4" />}
                {p === 'mobile' && <Smartphone className="w-4 h-4" />}
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-500">Max size (MB)</span>
              <input
                type="number"
                value={constraints.maxSizeMb}
                onChange={(e) => setConstraints((c) => ({ ...c, maxSizeMb: Number(e.target.value) || 100 }))}
                className="px-3 py-2 rounded-lg border dark:bg-slate-800"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-500">Max inference (ms)</span>
              <input
                type="number"
                value={constraints.maxInferenceMs}
                onChange={(e) => setConstraints((c) => ({ ...c, maxInferenceMs: Number(e.target.value) || 100 }))}
                className="px-3 py-2 rounded-lg border dark:bg-slate-800"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-500">Min accuracy</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={constraints.minAccuracy}
                onChange={(e) => setConstraints((c) => ({ ...c, minAccuracy: Number(e.target.value) || 0.9 }))}
                className="px-3 py-2 rounded-lg border dark:bg-slate-800"
              />
            </label>
          </div>
          {recommendation?.recommended && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
            >
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                Recommended: {recommendation.recommended.name}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{recommendation.reason}</p>
              <p className="text-xs text-slate-500 mt-2">
                {((recommendation.recommended.accuracy || 0) * 100).toFixed(1)}% acc ·{' '}
                {recommendation.recommended.model_size_mb} MB ·{' '}
                {recommendation.recommended.inference_ms} ms
              </p>
            </motion.div>
          )}
        </motion.section>

        {/* Comparison Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl overflow-hidden mb-12"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50">
                  <th className="text-left p-4 font-medium">Model</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-right p-4 font-medium">Accuracy</th>
                  <th className="text-right p-4 font-medium">Size (MB)</th>
                  <th className="text-right p-4 font-medium">Inference (ms)</th>
                  <th className="text-right p-4 font-medium">FLOPs (G)</th>
                  <th className="w-10 p-2" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                    </td>
                  </tr>
                ) : (
                  models.map((m, i) => (
                    <React.Fragment key={m.id}>
                      <motion.tr
                        key={m.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition"
                      >
                        <td className="p-4 font-medium">{m.name}</td>
                        <td className="p-4 text-slate-500">{m.type}</td>
                        <td className="p-4 text-right font-mono">
                          {((m.accuracy || 0) * 100).toFixed(1)}%
                        </td>
                        <td className="p-4 text-right font-mono">{m.model_size_mb}</td>
                        <td className="p-4 text-right font-mono">{m.inference_ms}</td>
                        <td className="p-4 text-right font-mono">{m.flops_g}</td>
                        <td className="p-2">
                          {expandedId === m.id ? (
                            <ChevronDown className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          )}
                        </td>
                      </motion.tr>
                      <AnimatePresence>
                        {expandedId === m.id && (
                          <motion.tr
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-b border-slate-100 dark:border-slate-800"
                          >
                            <td colSpan={7} className="p-4 bg-slate-50 dark:bg-slate-800/50">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium mb-2">Technical Insights</h4>
                                  <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                    {(m.technical_insights || []).map((t, j) => (
                                      <li key={j}>{t}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Pros & Cons</h4>
                                  <div className="flex gap-4 text-sm">
                                    <div>
                                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Pros:</span>
                                      <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                                        {(m.pros || []).map((p, j) => (
                                          <li key={j}>{p}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <span className="text-amber-600 dark:text-amber-400 font-medium">Cons:</span>
                                      <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                                        {(m.cons || []).map((c, j) => (
                                          <li key={j}>{c}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                  <p className="mt-2 text-sm">
                                    <span className="font-medium">Best for:</span>{' '}
                                    {(m.best_for || []).join(', ')}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-4 p-3 rounded-lg bg-slate-200/50 dark:bg-slate-700/50 text-center">
                                <ImageIcon className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                                <p className="text-xs text-slate-500 mb-2">
                                  Grad-CAM explainability — sign in, upload a leaf on the home page, then open the heatmap action.
                                </p>
                                <Link
                                  href="/#upload-section"
                                  className="inline-flex text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                                >
                                  Go to uploader →
                                </Link>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Training Logs */}
        {trainingLogs && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-500" />
              Training Logs ({trainingLogs.model})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-slate-700">
                    <th className="text-left py-2">Epoch</th>
                    <th className="text-right py-2">Loss</th>
                    <th className="text-right py-2">Accuracy</th>
                    <th className="text-right py-2">Val Loss</th>
                    <th className="text-right py-2">Val Acc</th>
                  </tr>
                </thead>
                <tbody>
                  {(trainingLogs.logs || []).map((l: { epoch: number; loss: number; accuracy: number; val_loss?: number; val_accuracy?: number }) => (
                    <tr key={l.epoch} className="border-b dark:border-slate-800">
                      <td className="py-2">{l.epoch}</td>
                      <td className="text-right font-mono py-2">{l.loss.toFixed(3)}</td>
                      <td className="text-right font-mono py-2">{(l.accuracy * 100).toFixed(1)}%</td>
                      <td className="text-right font-mono py-2">
                        {(l as { val_loss?: number }).val_loss?.toFixed(3) ?? '-'}
                      </td>
                      <td className="text-right font-mono py-2">
                        {(((l as { val_accuracy?: number }).val_accuracy ?? 0) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
