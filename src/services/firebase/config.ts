import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

import { AppError } from '@/utils/errors';

export const FIREBASE_NOT_CONFIGURED_MESSAGE =
  'DevTrack is not connected to Firebase yet. Add your Firebase keys to .env.local and restart the dev server.';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};

/**
 * `true` when every required Firebase key is present. The UI uses this to show
 * an actionable setup screen instead of failing with a blank page.
 */
export const firebaseConfigured: boolean = Object.values(firebaseConfig).every(
  (value) => typeof value === 'string' && value.length > 0,
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

/** The Firebase app itself. Only the app/auth modules are loaded eagerly. */
export function getFirebaseApp(): FirebaseApp {
  if (!firebaseConfigured) {
    throw new AppError(FIREBASE_NOT_CONFIGURED_MESSAGE, 'app/firebase-not-configured');
  }
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function firebaseAuth(): Auth {
  if (!authInstance) authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

/** Non-null accessor for call sites that already know Firebase is configured. */
export function requireAuth(): Auth {
  return firebaseAuth();
}
