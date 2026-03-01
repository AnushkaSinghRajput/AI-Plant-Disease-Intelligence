'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { getAdminAnalytics, type AnalyticsSummary } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#10b981', '#059669', '#047857', '#34d399', '#6ee7b7'];

export default function AdminPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
      return;
    }
    getAdminAnalytics(token)
      .then(setData)
      .catch(() => {
        toast.error('Access denied or failed to load analytics');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [token, router]);

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
          Admin — Analytics
        </motion.h1>

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : !data ? (
          <p className="text-amber-600">You may not have admin access, or the backend is not connected.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-xl p-6"
              >
                <h2 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Predictions</h2>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{data.total_predictions}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
                className="glass rounded-xl p-6"
              >
                <h2 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Unique Users</h2>
                <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{data.unique_users}</p>
              </motion.div>
            </div>

            {data.top_diseases.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-xl p-6 mb-8 h-80"
              >
                <h2 className="font-semibold mb-4">Top diseases</h2>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={data.top_diseases.map((d, i) => ({ name: d.class.replace(/_/g, ' ').slice(0, 15), value: d.count }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {data.top_diseases.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {data.predictions_by_day.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass rounded-xl p-6 h-64"
              >
                <h2 className="font-semibold mb-4">Predictions by day</h2>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={data.predictions_by_day}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
