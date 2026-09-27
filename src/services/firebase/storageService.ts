import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { AppError } from '@/utils/errors';
import { requireAuth } from './config';
import { firebaseStorage } from './storageClient';

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Choose a JPG, PNG, WebP, GIF or AVIF image.';
  if (file.size > MAX_AVATAR_BYTES) return 'Images must be 2 MB or smaller.';
  return null;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const error = validateAvatarFile(file);
  if (error) throw new AppError(error, 'storage/invalid-argument');

  const user = requireAuth().currentUser;
  if (!user || user.uid !== userId) {
    throw new AppError('You must be signed in to upload an avatar.', 'storage/unauthorized');
  }

  const extension = EXTENSION_BY_TYPE[file.type] ?? 'png';
  const path = `users/${userId}/avatar-${Date.now()}.${extension}`;
  const reference = ref(firebaseStorage(), path);

  await uploadBytes(reference, file, { contentType: file.type });
  return getDownloadURL(reference);
}

/** Best-effort cleanup — a failed delete must never block the UI. */
export async function deleteStoredFile(url: string): Promise<void> {
  try {
    const base = firebaseStorage().toString().replace(/\/+$/, '');
    if (!url.startsWith(base)) return;
    await deleteObject(ref(firebaseStorage(), url.slice(base.length + 1)));
  } catch {
    // Ignore — the file may already be gone.
  }
}
