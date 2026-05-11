'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

export function ParallaxHero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, 200]);
  const y2 = useTransform(scrollY, [0, 400], [0, 80]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.95]);

  return (
    <section className="relative h-[85vh] min-h-[500px] overflow-hidden flex items-center justify-center">
      {/* Background layers with parallax */}
      <motion.div
        style={{ y: y1 }}
        className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-slate-900/60 to-teal-900/40 dark:from-emerald-950/50 dark:via-slate-950 dark:to-teal-950/50"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(16,185,129,0.15)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_at_30%_20%,rgba(16,185,129,0.1)_0%,transparent_50%)]"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(20,184,166,0.1)_0%,transparent_50%)]"
      />
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      {/* Content */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
            AI Plant Disease
          </span>
          <br />
          <span className="text-slate-800 dark:text-white">Intelligence Platform</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
        >
          Semantic search • Grad-CAM explainability • Regional heatmaps • Treatment recommendations
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <div className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-700 dark:bg-slate-800/90 dark:border dark:border-slate-700/60 dark:text-emerald-400 text-sm font-medium">
            CNN + Vision Transformer
          </div>
          <div className="px-4 py-2 rounded-full bg-teal-500/20 text-teal-700 dark:bg-slate-800/90 dark:border dark:border-slate-700/60 dark:text-teal-400 text-sm font-medium">
            Real-time inference
          </div>
          <div className="px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-700 dark:bg-slate-800/90 dark:border dark:border-slate-700/60 dark:text-cyan-300 text-sm font-medium">
            Research-grade analytics
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <button
            type="button"
            onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25 hover:opacity-95 transition"
          >
            Start leaf diagnosis
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-medium hover:bg-white dark:hover:bg-slate-800 transition"
          >
            Search diseases
          </button>
          <Link
            href="/models"
            className="px-6 py-3 rounded-xl border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-500/10 transition inline-flex items-center"
          >
            Model lab
          </Link>
        </motion.div>
      </motion.div>
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-slate-500/50 flex justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-slate-500/80" />
        </motion.div>
      </motion.div>
    </section>
  );
}
