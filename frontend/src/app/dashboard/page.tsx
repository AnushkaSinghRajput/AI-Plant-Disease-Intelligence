'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { getHistory, type PredictionLog } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { t } from '@/lib/i18n';
import { getDiseaseInsight } from '@/lib/diseaseInsights';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const [history, setHistory] = useState<PredictionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
      return;
    }
    getHistory(token)
      .then(setHistory)
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, [token, router]);

  const handleLogout = () => {
    setToken(null);
    router.push('/');
  };

  const chartData = history.slice(0, 14).reverse().map((h) => ({
    name: h.predicted_class.replace(/_/g, ' ').slice(0, 12),
    count: 1,
    full: h.predicted_class,
  })).reduce((acc: { name: string; count: number }[], cur) => {
    const existing = acc.find((x) => x.name === cur.name);
    if (existing) existing.count += 1;
    else acc.push({ name: cur.name, count: cur.count });
    return acc;
  }, []);

  const downloadPdf = (item: PredictionLog) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Plant Disease Diagnosis Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Prediction: ${item.predicted_class.replace(/_/g, ' ')}`, 20, 35);
    doc.text(`Confidence: ${(item.confidence * 100).toFixed(1)}%`, 20, 42);
    doc.text(`Date: ${new Date(item.created_at).toLocaleString()}`, 20, 49);
    doc.save(`diagnosis-${item.id}.pdf`);
    toast.success('PDF downloaded');
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold gradient-text mb-6"
        >
          {t('dashboard.history', 'en')}
        </motion.h1>

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : history.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-500"
          >
            {t('dashboard.noHistory', 'en')}. Upload an image from the home page.
          </motion.p>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6 mb-8 h-64"
            >
              <h2 className="font-semibold mb-4">Predictions by class</h2>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <div className="space-y-4">
              {history.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-xl overflow-hidden"
                >
                  <div className="p-4 flex flex-wrap items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="text-left flex items-start gap-2 min-w-0 flex-1"
                    >
                      {expandedId === item.id ? (
                        <ChevronDown className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium">{item.predicted_class.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-slate-500">
                          {(item.confidence * 100).toFixed(1)}% · {new Date(item.created_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                          {getDiseaseInsight(item.predicted_class).summary}
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadPdf(item)}
                      className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 transition text-sm font-medium shrink-0"
                    >
                      {t('dashboard.downloadReport', 'en')}
                    </button>
                  </div>
                  {expandedId === item.id && (
                    <div className="px-4 pb-4 pt-0 border-t border-slate-200/50 dark:border-slate-600/50">
                      <div className="mt-3 rounded-lg bg-emerald-500/5 dark:bg-emerald-950/20 p-3 text-sm text-slate-600 dark:text-slate-300 space-y-2">
                        <p className="font-medium text-emerald-800 dark:text-emerald-200">{getDiseaseInsight(item.predicted_class).headline}</p>
                        <p>{getDiseaseInsight(item.predicted_class).whatToLookFor}</p>
                        <p>{getDiseaseInsight(item.predicted_class).whyItMatters}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
