'use client';

import { motion } from 'framer-motion';

interface InsightCardProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  delay?: number;
  gradient?: string;
  onClick?: () => void;
}

export function InsightCard({ title, subtitle, value, trend, icon, delay = 0, gradient = 'from-emerald-500/20 to-teal-500/20', onClick }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} border border-white/10 dark:border-slate-600/30 p-6 backdrop-blur-sm cursor-pointer hover:scale-[1.02] transition-transform`}
    >
      <div className="absolute inset-0 bg-white/5 dark:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
          {value != null && (
            <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
          )}
          {trend && (
            <span
              className={`inline-flex items-center mt-2 text-xs font-medium ${
                trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-500'
              }`}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
          )}
        </div>
        {icon && <div className="text-emerald-500/80 dark:text-emerald-400/80">{icon}</div>}
      </div>
    </motion.div>
  );
}
