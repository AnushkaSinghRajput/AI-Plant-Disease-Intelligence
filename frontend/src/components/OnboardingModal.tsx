'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Search, BarChart3, ChevronRight } from 'lucide-react';

const STEPS = [
  { title: 'Upload a leaf image', desc: 'Drag & drop or tap to upload. Supports JPG, PNG.', icon: Camera },
  { title: 'Search diseases', desc: 'Use natural language: "tomato blight" or "potato leaf spot".', icon: Search },
  { title: 'View insights', desc: 'Grad-CAM heatmaps, confidence, and regional analytics.', icon: BarChart3 },
];

export function OnboardingModal({
  open,
  onClose,
  onGetStarted,
}: {
  open: boolean;
  onClose: () => void;
  onGetStarted?: () => void;
}) {
  const [step, setStep] = useState(0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-8 pb-12">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">AI-Guided Onboarding</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Get started in 3 quick steps</p>
              <div className="mt-8 space-y-6">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const isActive = step === i;
                  return (
                    <motion.div
                      key={i}
                      layout
                      className={`flex items-start gap-4 p-4 rounded-xl transition ${
                        isActive ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-50 dark:bg-slate-700/30'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{s.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{s.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(Math.max(0, step - 1))}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Back
                </button>
                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="flex items-center gap-2 text-emerald-600 font-medium"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onGetStarted?.();
                      onClose();
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
