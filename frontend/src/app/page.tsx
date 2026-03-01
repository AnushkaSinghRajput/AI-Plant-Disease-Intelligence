'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { ParallaxHero } from '@/components/ParallaxHero';
import { SmartSearch } from '@/components/SmartSearch';
import { UploadZone } from '@/components/UploadZone';
import { InsightCard } from '@/components/InsightCard';
import { OnboardingModal } from '@/components/OnboardingModal';
import { useThemeStore } from '@/store/auth';
import { t, type Locale } from '@/lib/i18n';
import Link from 'next/link';
import { Leaf, BarChart3, Search, Sparkles, Lightbulb } from 'lucide-react';

export default function Home() {
  const theme = useThemeStore((s) => s.theme);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 antialiased">
      <OnboardingModal open={onboardingOpen} onClose={closeOnboarding} />
      <Navbar locale={locale} />
      <ParallaxHero />
      <main className="relative -mt-20 z-20 px-4 pb-24">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Smart search */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <SmartSearch />
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-center text-lg font-semibold text-slate-700 dark:text-slate-300 mb-6">
              Or upload a leaf image for instant diagnosis
            </h2>
            <UploadZone locale={locale} />
          </motion.section>

          {/* Modular insight cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InsightCard
              title="CNN + ViT Hybrid"
              subtitle="State-of-the-art classification"
              icon={<Leaf className="w-6 h-6" />}
              delay={0}
            />
            <InsightCard
              title="Semantic Search"
              subtitle="Natural-language queries"
              icon={<Search className="w-6 h-6" />}
              delay={0.1}
            />
            <InsightCard
              title="Grad-CAM"
              subtitle="Explainable heatmaps"
              icon={<Lightbulb className="w-6 h-6" />}
              delay={0.2}
            />
            <Link href="/models">
              <InsightCard
                title="Model Comparison"
                subtitle="ResNet50, ViT, EfficientNet & more"
                icon={<BarChart3 className="w-6 h-6" />}
                delay={0.3}
              />
            </Link>
            <InsightCard
              title="Analytics"
              subtitle="Regional trends & heatmaps"
              icon={<BarChart3 className="w-6 h-6" />}
              delay={0.35}
            />
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
