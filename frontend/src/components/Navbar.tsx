'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/auth';
import { t, type Locale } from '@/lib/i18n';
import { Leaf, Sun, Moon, Home, Shield, BarChart2, Cpu } from 'lucide-react';

export function Navbar({ locale = 'en' }: { locale?: Locale }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const handleLogout = () => {
    setToken(null);
    router.push('/');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-slate-700/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Leaf className="w-7 h-7 text-emerald-500" />
          <span className="gradient-text">{t('app.title', locale)}</span>
        </Link>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          {token ? (
            <>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300/50 dark:hover:bg-slate-600/50 transition"
          >
            <BarChart2 className="w-4 h-4" />
            Analytics
          </Link>
          <Link
            href="/models"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300/50 dark:hover:bg-slate-600/50 transition"
          >
            <Cpu className="w-4 h-4" />
            Models
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300/50 dark:hover:bg-slate-600/50 transition"
          >
            <Shield className="w-4 h-4" />
            Admin
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:opacity-90 transition shadow-lg shadow-emerald-500/25"
          >
            {t('auth.logout', locale)}
          </button>
        </>
      ) : (
        <>
          <Link
            href="/models"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300/50 transition"
          >
            <BarChart2 className="w-4 h-4" />
            Models
          </Link>
          <Link
            href="/login"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:opacity-90 transition shadow-lg shadow-emerald-500/25"
        >
          {t('auth.login', locale)}
        </Link>
        </>
      )}
        </div>
      </div>
    </motion.nav>
  );
}
