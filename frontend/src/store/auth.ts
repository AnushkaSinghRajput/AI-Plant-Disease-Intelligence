import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { decodeJwtExpMs, isJwtExpired, isLikelyJwt } from '@/lib/jwt';

type AuthState = {
  token: string | null;
  setToken: (t: string | null) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (raw) => {
        if (raw == null || raw === '') {
          set({ token: null });
          return;
        }
        const t = String(raw).trim();
        if (!isLikelyJwt(t)) {
          set({ token: null });
          return;
        }
        const exp = decodeJwtExpMs(t);
        if (exp != null && Date.now() >= exp - 15_000) {
          set({ token: null });
          return;
        }
        set({ token: t });
      },
      clearSession: () => set({ token: null }),
    }),
    { name: 'plant-disease-auth' }
  )
);

type ThemeState = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'light' ? 'dark' : 'light';
          if (typeof document !== 'undefined') document.documentElement.classList.toggle('dark', next === 'dark');
          return { theme: next };
        }),
    }),
    { name: 'plant-disease-theme' }
  )
);
