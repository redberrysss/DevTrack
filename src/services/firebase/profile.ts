import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

import type { EducationEntry, ExperienceEntry, UserProfile, UserProfileData } from '@/types';
import { requireFirestore } from './firestoreClient';

export const userDocument = (userId: string) => doc(requireFirestore(), 'users', userId);

function emptyEducation(): EducationEntry[] {
  return [];
}

function emptyExperience(): ExperienceEntry[] {
  return [];
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function toEducation(value: unknown): EducationEntry[] {
  if (!Array.isArray(value)) return emptyEducation();
  return value
    .filter((item): item is DocumentData => Boolean(item) && typeof item === 'object')
    .map((item, index) => ({
      id: toStringValue(item.id, `education-${index}`),
      institution: toStringValue(item.institution),
      degree: toStringValue(item.degree),
      field: toStringValue(item.field),
      startYear: toStringValue(item.startYear),
      endYear: toStringValue(item.endYear),
      description: toStringValue(item.description),
    }));
}

function toExperience(value: unknown): ExperienceEntry[] {
  if (!Array.isArray(value)) return emptyExperience();
  return value
    .filter((item): item is DocumentData => Boolean(item) && typeof item === 'object')
    .map((item, index) => ({
      id: toStringValue(item.id, `experience-${index}`),
      company: toStringValue(item.company),
      role: toStringValue(item.role),
      startDate: toStringValue(item.startDate),
      endDate: toStringValue(item.endDate),
      current: item.current === true,
      description: toStringValue(item.description),
    }));
}

/** Defensive mapping: unknown Firestore data can never break the UI. */
export function mapProfileDoc(snapshot: QueryDocumentSnapshot<DocumentData>): UserProfile {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: toStringValue(data.name),
    email: toStringValue(data.email),
    avatar: toStringValue(data.avatar),
    bio: toStringValue(data.bio),
    location: toStringValue(data.location),
    githubUsername: toStringValue(data.githubUsername),
    linkedinUrl: toStringValue(data.linkedinUrl),
    portfolioUrl: toStringValue(data.portfolioUrl),
    skills: toStringArray(data.skills),
    education: toEducation(data.education),
    experience: toExperience(data.experience),
    emailVerified: data.emailVerified === true,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

export function subscribeToProfile(
  userId: string,
  onData: (profile: UserProfile | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    userDocument(userId),
    (snapshot) => {
      onData(snapshot.exists() ? mapProfileDoc(snapshot) : null);
    },
    (error) => onError(error as Error),
  );
}

/** Creates the profile document for a brand new account. */
export async function createUserProfile(
  user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null; emailVerified?: boolean },
): Promise<void> {
  const data: UserProfileData = {
    name: user.displayName?.trim() || user.email?.split('@')[0] || 'Developer',
    email: user.email ?? '',
    avatar: user.photoURL ?? '',
    bio: '',
    location: '',
    githubUsername: '',
    linkedinUrl: '',
    portfolioUrl: '',
    skills: [],
    education: [],
    experience: [],
    emailVerified: user.emailVerified ?? false,
  };

  await setDoc(
    userDocument(user.uid),
    { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function updateUserProfile(userId: string, changes: Partial<UserProfileData>): Promise<void> {
  await updateDoc(userDocument(userId), { ...changes, updatedAt: serverTimestamp() });
}
