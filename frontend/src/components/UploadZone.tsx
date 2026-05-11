'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, CheckCircle, Sparkles, Scan, Brain, BarChart2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useInputSeedStore } from '@/store/inputSeed';
import {
  uploadAndPredict,
  demoPredict,
  getGradCam,
  getRecommendations,
  getFeatureImportance,
  type PredictionResult,
} from '@/lib/api';
import { t, type Locale } from '@/lib/i18n';
import { getDiseaseInsight, parseCropAndLabel } from '@/lib/diseaseInsights';
import { DiseaseInsightPanel } from '@/components/DiseaseInsightPanel';
import { DiagnosisSummaryModal } from '@/components/DiagnosisSummaryModal';
import toast from 'react-hot-toast';

async function createSampleLeafFile(): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unsupported');
  const g = ctx.createLinearGradient(0, 0, 224, 224);
  g.addColorStop(0, '#15803d');
  g.addColorStop(0.45, '#4ade80');
  g.addColorStop(1, '#14532d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 224, 224);
  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.ellipse(112, 118, 88, 52, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#14532d';
  ctx.lineWidth = 2;
  ctx.stroke();
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No blob'))), 'image/png');
  });
  return new File([blob], 'sample-leaf.png', { type: 'image/png' });
}

type RecPayload = {
  treatments?: string[];
  best_practices?: string[];
  linked_research?: string[] | { title?: string; url?: string }[];
};

export function UploadZone({ locale = 'en' }: { locale?: Locale }) {
  const token = useAuthStore((s) => s.token);
  const uploadSeedTick = useInputSeedStore((s) => s.uploadSeedTick);
  const [file, setFile] = useState<File | null>(null);
  const lastFileRef = useRef<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [useAiRemedies, setUseAiRemedies] = useState(false);
  const [heatmap, setHeatmap] = useState<string | null>(null);
  const [gradLoading, setGradLoading] = useState(false);
  const [recs, setRecs] = useState<RecPayload | null>(null);
  const [recPending, setRecPending] = useState<'rule' | 'llm' | null>(null);
  const [recUsedLlm, setRecUsedLlm] = useState(false);
  const [featImp, setFeatImp] = useState<Record<string, number> | null>(null);
  const [featLoading, setFeatLoading] = useState(false);
  const [diagnosisModalOpen, setDiagnosisModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const runPrediction = useCallback(
    async (f: File) => {
      setLoading(true);
      setFile(f);
      lastFileRef.current = f;
      setResult(null);
      setDiagnosisModalOpen(false);
      setHeatmap(null);
      setRecs(null);
      setFeatImp(null);
      try {
        const res = token
          ? await uploadAndPredict(f, token, { language: locale, useAiRemedies })
          : await demoPredict(f, { language: locale, useAiRemedies });
        setResult(res);
        setDiagnosisModalOpen(true);
        toast.success('Analysis complete');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Prediction failed');
      } finally {
        setLoading(false);
      }
    },
    [token, locale, useAiRemedies]
  );

  useEffect(() => {
    const { uploadSeedHandledUpTo } = useInputSeedStore.getState();
    if (uploadSeedTick === 0 || uploadSeedTick <= uploadSeedHandledUpTo) return;
    useInputSeedStore.setState({ uploadSeedHandledUpTo: uploadSeedTick });
    (async () => {
      try {
        const f = await createSampleLeafFile();
        await runPrediction(f);
      } catch {
        toast.error('Could not create sample image');
      }
    })();
  }, [uploadSeedTick, runPrediction]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG)');
      return;
    }
    await runPrediction(f);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (!f || !f.type.startsWith('image/')) {
      toast.error('Please drop an image file (JPG, PNG)');
      return;
    }
    await runPrediction(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const loadGradCam = async () => {
    const f = lastFileRef.current;
    if (!token || !f) {
      toast.error('Sign in and run a scan first');
      return;
    }
    setGradLoading(true);
    setHeatmap(null);
    try {
      const b64 = await getGradCam(f, token);
      setHeatmap(b64);
      toast.success('Heatmap ready — red highlights show where the model focused');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Grad-CAM failed');
    } finally {
      setGradLoading(false);
    }
  };

  const loadRecommendations = async (useLlm: boolean) => {
    if (!token || !result) {
      toast.error('Sign in and run a scan first');
      return;
    }
    const { crop } = parseCropAndLabel(result.class_name);
    setRecPending(useLlm ? 'llm' : 'rule');
    try {
      const data = (await getRecommendations(token, result.class_name, crop, useLlm, locale)) as RecPayload;
      setRecs(data);
      setRecUsedLlm(useLlm);
      toast.success(useLlm ? 'AI-enriched care plan loaded' : 'Care plan loaded');
    } catch {
      toast.error('Could not load recommendations');
    } finally {
      setRecPending(null);
    }
  };

  const loadFeatureImportance = async () => {
    if (!token || !result) {
      toast.error('Sign in and run a scan first');
      return;
    }
    setFeatLoading(true);
    try {
      const data = await getFeatureImportance(token, result.class_name, 5);
      setFeatImp(data);
    } catch {
      toast.error('Could not load model snapshot');
    } finally {
      setFeatLoading(false);
    }
  };

  const insight = result ? getDiseaseInsight(result.class_name) : null;

  return (
    <>
    {result && insight && (
      <DiagnosisSummaryModal
        open={diagnosisModalOpen}
        onClose={() => setDiagnosisModalOpen(false)}
        result={result}
        insight={insight}
      />
    )}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-8 max-w-xl mx-auto"
    >
      <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={useAiRemedies}
          onChange={(e) => setUseAiRemedies(e.target.checked)}
          className="rounded border-slate-400 text-emerald-600 focus:ring-emerald-500"
        />
        <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          AI-enriched remedy text when available (uses server AI; falls back to rules)
        </span>
      </label>

      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
          isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500/50 hover:bg-emerald-500/5'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          title="Upload leaf image"
          aria-label="Upload leaf image"
          onChange={handleFile}
        />
        {loading ? (
          <Loader2 className="w-14 h-14 mx-auto text-emerald-500 animate-spin" />
        ) : (
          <Upload className="w-14 h-14 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
        )}
        <p className="text-slate-600 dark:text-slate-400">
          {loading ? t('predict.analyzing', locale) : file ? file.name : t('predict.upload', locale)}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Drag & drop or click to upload</p>
        {!token && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Demo mode — Sign in for history, Grad-CAM, and care plans</p>
        )}
      </div>

      <AnimatePresence>
        {result && insight && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-4"
          >
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  {t('predict.result', locale)}
                </h3>
                <button
                  type="button"
                  onClick={() => setDiagnosisModalOpen(true)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Open summary popup
                </button>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200">{result.class_name.replace(/_/g, ' ')}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {t('predict.confidence', locale)}: {(result.confidence * 100).toFixed(1)}%
              </p>
              {result.severity_estimate && (
                <p className="text-sm mt-1">
                  {t('predict.severity', locale)}: {result.severity_estimate}
                </p>
              )}
              {result.remedies && result.remedies.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-1">{t('predict.remedies', locale)}</p>
                  <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-0.5">
                    {result.remedies.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <DiseaseInsightPanel insight={insight} />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!token || gradLoading}
                onClick={() => void loadGradCam()}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/30 text-sm font-medium hover:bg-violet-500/25 disabled:opacity-50"
              >
                {gradLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                Grad-CAM heatmap
              </button>
              <button
                type="button"
                disabled={!token || recPending !== null}
                onClick={() => void loadRecommendations(false)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/25 text-sm font-medium hover:bg-emerald-500/25 disabled:opacity-50"
              >
                {recPending === 'rule' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                Care plan
              </button>
              <button
                type="button"
                disabled={!token || recPending !== null}
                onClick={() => void loadRecommendations(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30 text-sm font-medium hover:bg-amber-500/25 disabled:opacity-50"
              >
                {recPending === 'llm' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                AI care brief
              </button>
              <button
                type="button"
                disabled={!token || featLoading}
                onClick={() => void loadFeatureImportance()}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-500/15 text-slate-700 dark:text-slate-200 border border-slate-500/25 text-sm font-medium hover:bg-slate-500/25 disabled:opacity-50"
              >
                {featLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
                Model snapshot
              </button>
            </div>
            {!token && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sign in to unlock explainability (Grad-CAM), structured care plans, and the model snapshot for this image.
              </p>
            )}

            {heatmap && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-900/5">
                <p className="text-xs text-slate-500 px-3 py-2 bg-slate-100/80 dark:bg-slate-800/80">
                  Overlay blends your leaf with model attention—use alongside agronomic scouting, not as sole proof.
                </p>
                <img src={`data:image/png;base64,${heatmap}`} alt="Grad-CAM attention overlay" className="w-full h-auto" />
              </div>
            )}

            {recs && (
              <div className="rounded-xl border border-emerald-500/20 bg-white/50 dark:bg-slate-800/40 p-4 space-y-3 text-sm">
                <p className="font-medium text-emerald-800 dark:text-emerald-200">
                  Integrated care plan {recUsedLlm ? '(AI-assisted)' : ''}
                </p>
                {recs.treatments && recs.treatments.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Treatments & actions</p>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-0.5">
                      {recs.treatments.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.best_practices && recs.best_practices.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Best practices</p>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-0.5">
                      {recs.best_practices.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.linked_research && recs.linked_research.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Research links</p>
                    <ul className="space-y-1">
                      {recs.linked_research.map((item, i) => {
                        const url = typeof item === 'string' ? item : item?.url;
                        const title = typeof item === 'string' ? item : item?.title || item?.url;
                        if (!url) return null;
                        return (
                          <li key={i}>
                            <a href={url} className="text-emerald-600 dark:text-emerald-400 hover:underline break-all" target="_blank" rel="noopener noreferrer">
                              {title}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {featImp && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-600 p-4 text-sm">
                <p className="font-medium text-slate-700 dark:text-slate-200 mb-2">Model feature snapshot</p>
                <p className="text-xs text-slate-500 mb-3">Relative emphasis the explainability layer attributes to coarse input regions (illustrative).</p>
                <div className="space-y-2">
                  {Object.entries(featImp).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                        <span>{k}</span>
                        <span>{(v * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${Math.min(100, v * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
}
