export class SessionExpiredError extends Error {
  readonly status = 401;

  constructor(message = 'Your session has expired. Please sign in again.') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

export function isSessionExpiredError(e: unknown): e is SessionExpiredError {
  return e instanceof SessionExpiredError;
}

export function normalizeApiDetail(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((x) => (typeof x === 'object' && x !== null && 'msg' in x ? String((x as { msg: string }).msg) : String(x)))
      .filter(Boolean)
      .join(' ');
  }
  if (detail && typeof detail === 'object' && 'message' in detail) return String((detail as { message: string }).message);
  return 'Request failed';
}
