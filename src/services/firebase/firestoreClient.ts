import { getFirestore, type Firestore } from 'firebase/firestore';

import { getFirebaseApp } from './config';

let firestoreInstance: Firestore | null = null;

/**
 * Firestore client.
 *
 * Kept in its own module (instead of `config.ts`) so that importing the app or
 * the auth client does not pull the Firestore SDK into the initial bundle: only
 * the signed-in data pages ever load it.
 */
export function requireFirestore(): Firestore {
  if (!firestoreInstance) firestoreInstance = getFirestore(getFirebaseApp());
  return firestoreInstance;
}
