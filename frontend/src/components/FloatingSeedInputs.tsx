'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, X, Search, ImageIcon, ChevronUp } from 'lucide-react';
import { useInputSeedStore, DEFAULT_SEED_SEARCH_QUERY } from '@/store/inputSeed';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

/** Only rendered in layout when authenticated — demo credential fill stays on the login form. */
export function FloatingSeedInputs() {
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const seedSmartSearch = useInputSeedStore((s) => s.seedSmartSearch);
  const seedSampleUpload = useInputSeedStore((s) => s.seedSampleUpload);
  const [open, setOpen] = useState(false);

  if (!token) return null;

  const onHome = pathname === '/';

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 max-w-[calc(100vw-3rem)]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="glass rounded-2xl border border-slate-200/80 dark:border-slate-600/60 shadow-2xl shadow-emerald-900/10 dark:shadow-black/40 w-[min(100%,20rem)] overflow-hidden"
          >
            <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-2 border-b border-slate-200/60 dark:border-slate-600/40">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-500 shrink-0" />
                  Seed your inputs
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Quick-fill the smart search bar or run a synthetic leaf scan on the home hub.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 space-y-2">
              <button
                type="button"
                onClick={() => {
                  seedSmartSearch();
                  toast.success('Sample query applied — search updates on the home page');
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-slate-700 dark:text-slate-200 bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 border border-emerald-500/20 transition"
              >
                <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="min-w-0">
                  <span className="block">Smart search</span>
                  <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 truncate" title={DEFAULT_SEED_SEARCH_QUERY}>
                    “{DEFAULT_SEED_SEARCH_QUERY.slice(0, 42)}…”
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  seedSampleUpload();
                  if (onHome) toast.success('Running sample diagnosis…');
                  else toast.success('Open the home page to run the sample in the uploader');
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-slate-700 dark:text-slate-200 bg-teal-500/10 hover:bg-teal-500/20 dark:bg-teal-500/15 dark:hover:bg-teal-500/25 border border-teal-500/20 transition"
              >
                <ImageIcon className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>
                  <span className="block">Sample diagnosis</span>
                  <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
                    Synthetic leaf image → predict
                  </span>
                </span>
              </button>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 px-1 pt-1">
                {onHome
                  ? 'You are on the home hub — the sample runs immediately in the uploader.'
                  : 'Open the home page so the uploader can receive the sample image.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        layout
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/35 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        aria-expanded={open}
        aria-label={open ? 'Close seed inputs' : 'Open seed inputs'}
      >
        <Sprout className="w-5 h-5" />
        <span className="hidden sm:inline">Seed inputs</span>
        <ChevronUp className={`w-4 h-4 transition-transform sm:hidden ${open ? 'rotate-180' : ''}`} />
      </motion.button>
    </div>
  );
}
