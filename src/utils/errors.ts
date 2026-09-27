/**
 * User-facing error handling.
 *
 * Firebase and GitHub both return technical codes (`auth/wrong-password`,
 * 403, `permission-denied`, ...). Those are never rendered directly — every
 * error that reaches the UI passes through `getFriendlyError` so the user sees
 * an understandable, actionable message instead of an internal string.
 */

export class AppError extends Error {
  readonly code: string;

  constructor(message: string, code = 'app/unknown') {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

const AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'That email and password combination does not match an account.',
  'auth/invalid-email': 'That email address does not look right.',
  'auth/missing-password': 'Enter your password.',
  'auth/user-not-found': 'That email and password combination does not match an account.',
  'auth/wrong-password': 'That email and password combination does not match an account.',
  'auth/user-disabled': 'This account has been disabled. Contact support to restore access.',
  'auth/email-already-in-use': 'An account already exists with that email. Try signing in instead.',
  'auth/weak-password': 'Choose a stronger password: at least 8 characters with a letter and a number.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/network-request-failed': 'We could not reach the network. Check your connection and try again.',
  'auth/requires-recent-login': 'For security, sign in again before making this change.',
  'auth/operation-not-allowed': 'Email and password sign-in is not enabled for this project.',
  'auth/popup-closed-by-user': 'The sign-in window was closed before finishing.',
  'auth/too-many-requests-quota-exceeded': 'Too many requests from this browser. Try again later.',
  'auth/email-already-verified': 'This email address is already verified.',
};

const FIRESTORE_MESSAGES: Record<string, string> = {
  'permission-denied': 'You do not have permission to perform that action.',
  unauthenticated: 'Your session expired. Sign in again to continue.',
  unavailable: 'The database is temporarily unreachable. Try again in a moment.',
  'deadline-exceeded': 'That took too long. Check your connection and try again.',
  'not-found': 'We could not find that item. It may have been deleted.',
  'failed-precondition': 'The database is not ready yet. Check your Firebase configuration.',
  'resource-exhausted': 'The database quota has been reached. Try again later.',
  'aborted': 'Another change was saved first. Refresh and try again.',
  'cancelled': 'The request was cancelled.',
  'storage/canceled': 'The upload was cancelled.',
  'storage/unauthorized': 'You do not have permission to upload this file.',
  'storage/retry-limit-exceeded': 'The upload took too long. Try a smaller image.',
  'storage/quota-exceeded': 'Storage quota reached. Try a smaller image.',
  'storage/invalid-argument': 'That file could not be uploaded. Use an image under 2 MB.',
};

function extractCode(error: unknown): string | null {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === 'string' && code.length > 0) return code;
  }
  return null;
}

/** Converts any thrown value into a message that is safe to show a user. */
export function getFriendlyError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error === null || error === undefined) return fallback;

  if (error instanceof AppError) return error.message;

  if (typeof error === 'string' && error.trim()) {
    // Never echo raw internal strings; only trust our own AppError messages.
    return fallback;
  }

  const code = extractCode(error);
  if (code) {
    if (AUTH_MESSAGES[code]) return AUTH_MESSAGES[code]!;
    if (FIRESTORE_MESSAGES[code]) return FIRESTORE_MESSAGES[code]!;
    if (code.startsWith('auth/')) return fallback;
    return fallback;
  }

  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' && !navigator.onLine) {
    return 'You appear to be offline. Reconnect and try again.';
  }

  return fallback;
}
