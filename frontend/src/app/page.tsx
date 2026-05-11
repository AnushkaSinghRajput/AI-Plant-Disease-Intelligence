'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { ParallaxHero } from '@/components/ParallaxHero';
import { SmartSearch } from '@/components/SmartSearch';
import { UploadZone } from '@/components/UploadZone';
import { InsightCard } from '@/components/InsightCard';
import { OnboardingModal } from '@/components/OnboardingModal';
import { AuthenticatedHomePanel } from '@/components/AuthenticatedHomePanel';
import { useAuthStore } from '@/store/auth';
import { t, type Locale } from '@/lib/i18n';
import Link from 'next/link';
import { Leaf, BarChart3, Search, Sparkles, Lightbulb } from 'lucide-react';

export default function Home() {
  const token = useAuthStore((s) => s.token);
  const [locale, setLocale] = useState<Locale>('en');
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    const seen = typeof localStorage !== 'undefined' && localStorage.getItem('onboarding_seen');
    if (!seen) setOnboardingOpen(true);
  }, []);

  const closeOnboarding = () => {
    setOnboardingOpen(false);
    if (typeof localStorage !== 'undefined') localStorage.setItem('onboarding_seen', '1');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] antialiased">
      <OnboardingModal
        open={onboardingOpen}
        onClose={closeOnboarding}
        onGetStarted={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      />
      <Navbar locale={locale} />
      <ParallaxHero />
      <main className="relative -mt-20 z-20 px-4 pb-24">
        <div className="max-w-5xl mx-auto space-y-16">
          <AuthenticatedHomePanel locale={locale} />

          {/* Smart search */}
          <motion.section
            id="search-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center scroll-mt-24"
          >
            {token && (
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">
                Semantic search
              </p>
            )}
            <SmartSearch
              onSelect={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            />
            <button
              type="button"
              onClick={() => setOnboardingOpen(true)}
              className="mt-4 text-sm text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              New here? Take the tour
            </button>
          </motion.section>

          {/* Upload zone */}
          <motion.section
            id="upload-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="scroll-mt-24"
          >
            <h2 className="text-center text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
              {token ? 'Leaf image diagnosis' : 'Or upload a leaf image for instant diagnosis'}
            </h2>
            {token ? (
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Signed-in scans are saved to your history. Enable AI remedies and Grad-CAM after results appear.
              </p>
            ) : (
              <div className="mb-6" aria-hidden />
            )}
            <UploadZone locale={locale} />
          </motion.section>

          {/* Modular insight cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InsightCard
              title="CNN + ViT Hybrid"
              subtitle="State-of-the-art classification — run a scan below"
              icon={<Leaf className="w-6 h-6" />}
              delay={0}
              onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            />
            <InsightCard
              title="Semantic Search"
              subtitle="Natural-language disease lookup"
              icon={<Search className="w-6 h-6" />}
              delay={0.1}
              onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            />
            <InsightCard
              title="Grad-CAM"
              subtitle="Explainable heatmaps after sign-in"
              icon={<Lightbulb className="w-6 h-6" />}
              delay={0.2}
              onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            />
            <Link href="/models">
              <InsightCard
                title="Model Comparison"
                subtitle="ResNet50, ViT, EfficientNet & more"
                icon={<BarChart3 className="w-6 h-6" />}
                delay={0.3}
              />
            </Link>
            <Link href="/dashboard">
              <InsightCard
                title="Analytics"
                subtitle="Your prediction history & charts"
                icon={<BarChart3 className="w-6 h-6" />}
                delay={0.35}
              />
            </Link>
          </section>

          {/* Locale toggle */}
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${locale === 'en' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLocale('hi')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${locale === 'hi' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              हिंदी
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
