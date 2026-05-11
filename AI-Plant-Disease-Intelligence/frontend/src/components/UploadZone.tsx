'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { uploadAndPredict, demoPredict, type PredictionResult } from '@/lib/api';
import { t, type Locale } from '@/lib/i18n';
import toast from 'react-hot-toast';

export function UploadZone({ locale = 'en' }: { locale?: Locale }) {
  const token = useAuthStore((s) => s.token);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const runPrediction = async (f: File) => {
    setLoading(true);
    setFile(f);
    setResult(null);
    try {
      const res = token
        ? await uploadAndPredict(f, token, { language: locale })
        : await demoPredict(f, { language: locale });
      setResult(res);
      toast.success('Analysis complete');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-8 max-w-xl mx-auto"
    >
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
          onChange={handleFile}
        />
        {loading ? (
          <Loader2 className="w-14 h-14 mx-auto text-emerald-500 animate-spin" />
        ) : (
          <Upload className="w-14 h-14 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
        )}
        <p className="text-slate-600 dark:text-slate-400">
          {loading ? t('predict.analyzing', locale) : (file ? file.name : t('predict.upload', locale))}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Drag & drop or click to upload</p>
        {!token && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Demo mode — Sign in to save history</p>}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50"
          >
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              {t('predict.result', locale)}
            </h3>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {result.class_name.replace(/_/g, ' ')}
            </p>
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
