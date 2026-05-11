'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { isJwtExpired, isLikelyJwt } from '@/lib/jwt';

/** Clears persisted auth if the JWT is already expired (e.g. new server secret or idle past `exp`). */
export function AuthValidator() {
  const token = useAuthStore((s) => s.token);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    const t = useAuthStore.getState().token;
    if (t && isLikelyJwt(t) && isJwtExpired(t)) {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    if (token && isLikelyJwt(token) && isJwtExpired(token)) {
      clearSession();
    }
  }, [token, clearSession]);

  return null;
}
