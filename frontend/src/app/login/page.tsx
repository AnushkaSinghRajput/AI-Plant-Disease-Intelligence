'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, isFirebaseConfigured, getFirebaseAuth } from '@/lib/firebase';
import { getToken, demoLogin } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'demo1234';

export default function LoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    setAuthReady(typeof window !== 'undefined');
  }, []);

  const firebaseReady = authReady && isFirebaseConfigured();
  const getAuthInstance = () => getFirebaseAuth() ?? auth;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password required');
      return;
    }
    if (password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    setLoading(true);
    try {
      if (firebaseReady) {
        const authInstance = getAuthInstance();
        if (authInstance) {
          const cred = await signInWithEmailAndPassword(authInstance, email, password);
          const idToken = await cred.user.getIdToken();
          const { access_token } = await getToken(idToken);
          setToken(access_token);
        } else {
          const { access_token } = await demoLogin(email, password);
          setToken(access_token);
        }
      } else {
        const { access_token } = await demoLogin(email, password);
        setToken(access_token);
      }
      toast.success('Signed in');
      router.push('/');
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    toast.success('Demo credentials filled');
  };

  const handleGoogleLogin = async () => {
    if (!firebaseReady) {
      toast.error('Google sign-in requires Firebase. Use email/password for demo.');
      return;
    }
    const authInstance = getAuthInstance();
    if (!authInstance) {
      toast.error('Firebase not configured. Use email/password for demo.');
      return;
    }
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(authInstance, provider);
      const idToken = await cred.user.getIdToken();
      const { access_token } = await getToken(idToken);
      setToken(access_token);
      toast.success('Signed in with Google');
      router.push('/');
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Google sign-in failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 w-full max-w-md shadow-xl"
      >
        <h1 className="text-2xl font-bold gradient-text text-center mb-6">Sign in</h1>
        {!firebaseReady && (
          <p className="text-emerald-600 dark:text-emerald-400 text-sm mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            Demo mode — Sign in with any email and password (min 4 chars). Add Firebase config for Google sign-in.
          </p>
        )}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white/60 dark:bg-slate-800/50 p-5 shadow-inner">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-4">
              Sign-in credentials
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {!firebaseReady && (
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="w-full py-2.5 rounded-lg text-sm font-medium border border-dashed border-emerald-400/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition"
                >
                  Use sample credentials ({DEMO_EMAIL})
                </button>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in with Email'}
          </button>
        </form>
        <div className="relative my-6">
          <span className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-600" />
          </span>
          <span className="relative flex justify-center text-sm text-slate-500">Or</span>
        </div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || !firebaseReady}
          className="w-full py-3 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium"
        >
          Sign in with Google
        </button>
      </motion.div>
    </div>
  );
}
