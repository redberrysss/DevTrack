import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  addDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

import type { Project, ProjectStatus, ProgressMode } from '@/types';
import { STATUS_VALUES } from '@/utils/constants';
import type { ProjectFormValues } from '@/utils/validation';
import { requireFirestore } from '../firebase/firestoreClient';

const MAX_PROJECTS_PER_USER = 500;
const WRITE_BATCH_LIMIT = 500;

export const projectsCollection = (userId: string) =>
  collection(requireFirestore(), 'users', userId, 'projects');

export const projectDocument = (userId: string, projectId: string) =>
  doc(requireFirestore(), 'users', userId, 'projects', projectId);

function isStatus(value: unknown): value is ProjectStatus {
  return typeof value === 'string' && (STATUS_VALUES as string[]).includes(value);
}

function toProgressMode(value: unknown): ProgressMode {
  return value === 'tasks' ? 'tasks' : 'manual';
}

function clampProgress(value: unknown): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

export function mapProjectDoc(snapshot: QueryDocumentSnapshot<DocumentData>): Project {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    userId: typeof data.userId === 'string' ? data.userId : '',
    name: typeof data.name === 'string' ? data.name : 'Untitled project',
    description: typeof data.description === 'string' ? data.description : '',
    category: typeof data.category === 'string' ? data.category : 'Other',
    status: isStatus(data.status) ? data.status : 'planning',
    technologies: Array.isArray(data.technologies)
      ? data.technologies.filter((item: unknown): item is string => typeof item === 'string')
      : [],
    githubUrl: typeof data.githubUrl === 'string' ? data.githubUrl : '',
    liveUrl: typeof data.liveUrl === 'string' ? data.liveUrl : '',
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : '',
    progress: clampProgress(data.progress),
    progressMode: toProgressMode(data.progressMode),
    startDate: typeof data.startDate === 'string' ? data.startDate : '',
    endDate: typeof data.endDate === 'string' ? data.endDate : '',
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

/** Serialises form values into a Firestore-safe payload (no `undefined`). */
export function toProjectPayload(values: ProjectFormValues) {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    category: values.category,
    status: values.status,
    technologies: values.technologies.map((item) => item.trim()).filter(Boolean),
    githubUrl: values.githubUrl.trim(),
    liveUrl: values.liveUrl.trim(),
    imageUrl: values.imageUrl.trim(),
    progress: values.progressMode === 'tasks' ? 0 : clampProgress(values.progress),
    progressMode: values.progressMode,
    startDate: values.startDate,
    endDate: values.endDate,
  };
}

export function subscribeToProjects(
  userId: string,
  onData: (projects: Project[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const projectsQuery = query(
    projectsCollection(userId),
    orderBy('createdAt', 'desc'),
    limit(MAX_PROJECTS_PER_USER),
  );

  return onSnapshot(
    projectsQuery,
    (snapshot) => onData(snapshot.docs.map(mapProjectDoc)),
    (error) => onError(error as Error),
  );
}

export async function createProject(userId: string, values: ProjectFormValues): Promise<string> {
  const reference = await addDoc(projectsCollection(userId), {
    ...toProjectPayload(values),
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return reference.id;
}

export async function updateProject(
  userId: string,
  projectId: string,
  values: ProjectFormValues,
): Promise<void> {
  await updateDoc(projectDocument(userId, projectId), {
    ...toProjectPayload(values),
    updatedAt: serverTimestamp(),
  });
}

/** Deletes a project together with all of its tasks (Firestore has no cascade). */
export async function deleteProject(userId: string, projectId: string): Promise<void> {
  const db = requireFirestore();
  const tasksSnapshot = await getDocs(collection(db, 'users', userId, 'projects', projectId, 'tasks'));

  for (let index = 0; index < tasksSnapshot.docs.length; index += WRITE_BATCH_LIMIT) {
    const chunk = tasksSnapshot.docs.slice(index, index + WRITE_BATCH_LIMIT);
    const batch = writeBatch(db);
    chunk.forEach((taskDoc) => batch.delete(taskDoc.ref));
    await batch.commit();
  }

  await deleteDoc(projectDocument(userId, projectId));
}

export async function setProjectProgress(
  userId: string,
  projectId: string,
  progress: number,
): Promise<void> {
  await updateDoc(projectDocument(userId, projectId), {
    progress: clampProgress(progress),
    updatedAt: serverTimestamp(),
  });
}
