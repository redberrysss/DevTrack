import { getStorage, type FirebaseStorage } from 'firebase/storage';

import { getFirebaseApp } from './config';

let storageInstance: FirebaseStorage | null = null;

/**
 * Storage client, isolated for the same reason as the Firestore client: avatar
 * uploads are the only feature that needs it, so the SDK is not part of the
 * initial bundle.
 */
export function firebaseStorage(): FirebaseStorage {
  if (!storageInstance) storageInstance = getStorage(getFirebaseApp());
  return storageInstance;
}
