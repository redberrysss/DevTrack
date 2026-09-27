import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

import type { Task } from '@/types';
import { requireFirestore } from '../firebase/firestoreClient';
import { projectDocument } from './projectsService';

const MAX_TASKS_PER_PROJECT = 400;
const ALL_USER_TASKS_LIMIT = 1000;

export const tasksCollection = (userId: string, projectId: string) =>
  collection(requireFirestore(), 'users', userId, 'projects', projectId, 'tasks');

export const taskDocument = (userId: string, projectId: string, taskId: string) =>
  doc(requireFirestore(), 'users', userId, 'projects', projectId, 'tasks', taskId);

export function mapTaskDoc(snapshot: QueryDocumentSnapshot<DocumentData>): Task {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    projectId: typeof data.projectId === 'string' ? data.projectId : '',
    userId: typeof data.userId === 'string' ? data.userId : '',
    title: typeof data.title === 'string' ? data.title : 'Untitled task',
    description: typeof data.description === 'string' ? data.description : '',
    completed: data.completed === true,
    completedAt: data.completedAt ?? null,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

export function subscribeToTasks(
  userId: string,
  projectId: string,
  onData: (tasks: Task[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const tasksQuery = query(tasksCollection(userId, projectId), orderBy('createdAt', 'asc'), limit(MAX_TASKS_PER_PROJECT));

  return onSnapshot(
    tasksQuery,
    (snapshot) => onData(snapshot.docs.map(mapTaskDoc)),
    (error) => onError(error as Error),
  );
}

/**
 * Every task owned by the signed-in user, across all of their projects.
 *
 * Uses a collection-group query filtered on the `userId` field. This is
 * authorised by `firestore.rules` (read access is granted when
 * `resource.data.userId == request.auth.uid`), which keeps the dashboard on a
 * single listener instead of one listener per project.
 */
export function subscribeToAllUserTasks(
  userId: string,
  onData: (tasks: Task[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const tasksQuery = query(
    collectionGroup(requireFirestore(), 'tasks'),
    where('userId', '==', userId),
    limit(ALL_USER_TASKS_LIMIT),
  );

  return onSnapshot(
    tasksQuery,
    (snapshot) => onData(snapshot.docs.map(mapTaskDoc)),
    (error) => onError(error as Error),
  );
}

export async function createTask(
  userId: string,
  projectId: string,
  values: { title: string; description: string },
): Promise<string> {
  const reference = await addDoc(tasksCollection(userId, projectId), {
    projectId,
    userId,
    title: values.title.trim(),
    description: values.description.trim(),
    completed: false,
    completedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return reference.id;
}

export async function updateTaskDetails(
  userId: string,
  projectId: string,
  taskId: string,
  values: { title: string; description: string },
): Promise<void> {
  await updateDoc(taskDocument(userId, projectId, taskId), {
    title: values.title.trim(),
    description: values.description.trim(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTask(userId: string, projectId: string, taskId: string): Promise<void> {
  await deleteDoc(taskDocument(userId, projectId, taskId));
}

/**
 * Toggles completion and — when the project tracks progress from tasks —
 * keeps the project's stored progress in sync using a single atomic batch.
 */
export async function setTaskCompleted(options: {
  userId: string;
  projectId: string;
  taskId: string;
  completed: boolean;
  /** Counts *after* the toggle, used when `progressMode === 'tasks'`. */
  completedCount?: number;
  totalCount?: number;
  deriveProgress?: boolean;
}): Promise<void> {
  const { userId, projectId, taskId, completed, completedCount = 0, totalCount = 0, deriveProgress = false } =
    options;

  const db = requireFirestore();
  const batch = writeBatch(db);

  batch.update(taskDocument(userId, projectId, taskId), {
    completed,
    completedAt: completed ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });

  if (deriveProgress && totalCount > 0) {
    batch.update(projectDocument(userId, projectId), {
      progress: Math.round((completedCount / totalCount) * 100),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}
