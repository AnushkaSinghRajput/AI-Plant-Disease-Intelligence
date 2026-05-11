'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Leaf, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { semanticSearch } from '@/lib/api';
import { useInputSeedStore } from '@/store/inputSeed';
import { getDiseaseInsight } from '@/lib/diseaseInsights';
import { isSessionExpiredError } from '@/lib/apiErrors';
import toast from 'react-hot-toast';

interface SearchResult {
  id: string;
  disease_name: string;
  crop: string;
  similarity?: number;
  description?: string;
  treatments?: string[];
}

export function SmartSearch({ onSelect }: { onSelect?: (disease: string, crop: string) => void }) {
  const token = useAuthStore((s) => s.token);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const searchSeedTick = useInputSeedStore((s) => s.searchSeedTick);
  const lastSearchQuery = useInputSeedStore((s) => s.lastSearchQuery);

  const searchWithText = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q) {
        setResults([]);
        return;
      }
      if (!token) {
        toast.error('Sign in to search');
        return;
      }
      setLoading(true);
      try {
        const data = await semanticSearch(token, q, 10);
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch (e) {
        setResults([]);
        if (isSessionExpiredError(e)) {
          toast.error(e.message, { duration: 5000 });
        } else {
          toast.error('Search failed');
        }
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    const { searchSeedHandledUpTo } = useInputSeedStore.getState();
    if (searchSeedTick === 0 || searchSeedTick <= searchSeedHandledUpTo) return;
    useInputSeedStore.setState({ searchSeedHandledUpTo: searchSeedTick });
    setQuery(lastSearchQuery);
    if (token) void searchWithText(lastSearchQuery);
  }, [searchSeedTick, lastSearchQuery, token, searchWithText]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <motion.div
        layout
        className="flex items-center rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-600 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden"
      >
        <div className="flex items-center pl-5 text-slate-400">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void searchWithText(query)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search diseases: e.g. tomato blight, potato leaf spot..."
          className="flex-1 px-4 py-4 bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
        />
        <button
          type="button"
          onClick={() => void searchWithText(query)}
          className="px-5 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition"
        >
          Search
        </button>
      </motion.div>
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-xl z-50 max-h-[min(24rem,70vh)] overflow-y-auto"
          >
            {results.map((r, i) => {
              const insight = getDiseaseInsight(r.disease_name);
              const apiBlurb = r.description?.trim();
              return (
                <motion.button
                  key={r.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => {
                    onSelect?.(r.disease_name, r.crop);
                    setOpen(false);
                  }}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-left transition border-b border-slate-100 dark:border-slate-700/80 last:border-0"
                >
                  <Leaf className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                      {r.disease_name.replace(/___/g, ' · ').replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {r.crop} {r.similarity != null ? `· ${(r.similarity * 100).toFixed(0)}% match` : ''}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                      {apiBlurb || insight.summary}
                    </p>
                    <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 mt-1 font-medium">
                      Tap to jump to diagnosis upload ↓
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
