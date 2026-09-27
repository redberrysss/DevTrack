import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  updateProfile as updateAuthProfile,
  createUserWithEmailAndPassword,
  type User,
  type UserCredential,
} from 'firebase/auth';

import { requireAuth } from './config';

export async function registerWithEmail({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(requireAuth(), email.trim(), password);
  const displayName = name.trim();
  if (displayName) {
    await updateAuthProfile(credential.user, { displayName });
    // Keep the auth user object in sync so the UI updates immediately.
    try {
      await credential.user.reload();
    } catch {
      // A failed profile refresh must not break registration.
    }
  }
  return credential;
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(requireAuth(), email.trim(), password);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(requireAuth());
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(requireAuth(), email.trim());
}

export async function resendVerificationEmail(user: User): Promise<void> {
  await sendEmailVerification(user);
}

export async function changePassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const user = requireAuth().currentUser;
  if (!user) throw new Error('no-user');
  const credential = EmailAuthProvider.credential(user.email ?? '', currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export async function updateDisplayName(displayName: string): Promise<void> {
  const user = requireAuth().currentUser;
  if (!user) throw new Error('no-user');
  await updateAuthProfile(user, { displayName });
}
