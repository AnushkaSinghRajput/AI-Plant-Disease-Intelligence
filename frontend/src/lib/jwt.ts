/** Client-side JWT expiry check (no signature verification — server remains source of truth). */

export function decodeJwtExpMs(token: string): number | null {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    if (typeof globalThis.atob !== 'function') return null;
    const json = globalThis.atob(padded);
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

const SKEW_MS = 15_000;

export function isJwtExpired(token: string | null | undefined): boolean {
  if (!token?.trim()) return true;
  const exp = decodeJwtExpMs(token);
  if (exp == null) return false;
  return Date.now() >= exp - SKEW_MS;
}

export function isLikelyJwt(token: string): boolean {
  return token.trim().split('.').length === 3;
}
