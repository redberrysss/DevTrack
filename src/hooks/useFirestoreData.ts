import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Project, Task } from '@/types';
import { getFriendlyError } from '@/utils/errors';
import { subscribeToAllUserTasks, subscribeToTasks } from '@/services/projects/tasksService';
import { subscribeToProjects } from '@/services/projects/projectsService';

interface CollectionState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  /** Re-subscribes to the underlying Firestore listener. */
  refresh: () => void;
}

type Unsubscribe = () => void;
type Subscribe<T> = (onData: (items: T[]) => void, onError: (error: unknown) => void) => Unsubscribe;

interface Snapshot<T> {
  /** Identifies the subscription the data belongs to. */
  key: string;
  items: T[];
  error: string | null;
  settled: boolean;
}

const IDLE: Snapshot<never> = { key: '', items: [], error: null, settled: true };

const noop: Unsubscribe = () => undefined;

/**
 * Shared Firestore subscription.
 *
 * The snapshot is stored with the key of the subscription that produced it, so
 * switching user, project or calling `refresh()` immediately reports a loading
 * state during render instead of pushing a state update through an effect.
 * Updates are only ever written from the Firestore listener callbacks.
 */
function useSubscription<T>(key: string | null, subscribe: Subscribe<T>, errorMessage: string): CollectionState<T> {
  const [snapshot, setSnapshot] = useState<Snapshot<T>>(IDLE as Snapshot<T>);

  useEffect(() => {
    if (!key) return;

    let active = true;

    const unsubscribe = subscribe(
      (items) => {
        if (!active) return;
        setSnapshot({ key, items, error: null, settled: true });
      },
      (error) => {
        if (!active) return;
        setSnapshot({
          key,
          items: [],
          error: getFriendlyError(error, errorMessage),
          settled: true,
        });
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [key, subscribe, errorMessage]);

  return useMemo(() => {
    if (!key) return { items: [] as T[], loading: false, error: null, refresh: () => undefined };
    if (snapshot.key !== key) return { items: [] as T[], loading: true, error: null, refresh: () => undefined };
    return {
      items: snapshot.items,
      loading: !snapshot.settled,
      error: snapshot.error,
      refresh: () => undefined,
    };
  }, [key, snapshot]);
}

function useRefresh(): [number, () => void] {
  const [nonce, setNonce] = useState(0);
  const refresh = useCallback(() => setNonce((value) => value + 1), []);
  return [nonce, refresh];
}

export function useProjects(userId: string | null): CollectionState<Project> {
  const [nonce, refresh] = useRefresh();

  const subscribe = useCallback<Subscribe<Project>>(
    (onData, onError) => (userId ? subscribeToProjects(userId, onData, onError) : noop),
    [userId],
  );

  const state = useSubscription<Project>(
    userId ? `projects:${userId}:${nonce}` : null,
    subscribe,
    'We could not load your projects.',
  );

  return useMemo(() => ({ ...state, refresh }), [state, refresh]);
}

export function useTasks(userId: string | null, projectId: string | null): CollectionState<Task> {
  const [nonce, refresh] = useRefresh();

  const subscribe = useCallback<Subscribe<Task>>(
    (onData, onError) =>
      userId && projectId ? subscribeToTasks(userId, projectId, onData, onError) : noop,
    [userId, projectId],
  );

  const state = useSubscription<Task>(
    userId && projectId ? `tasks:${userId}:${projectId}:${nonce}` : null,
    subscribe,
    'We could not load the tasks for this project.',
  );

  return useMemo(() => ({ ...state, refresh }), [state, refresh]);
}

/**
 * All tasks for the signed-in user, across every project, using a single
 * collection-group listener (authorised by the `userId` field in the rules).
 */
export function useAllTasks(userId: string | null): CollectionState<Task> {
  const [nonce, refresh] = useRefresh();

  const subscribe = useCallback<Subscribe<Task>>(
    (onData, onError) => (userId ? subscribeToAllUserTasks(userId, onData, onError) : noop),
    [userId],
  );

  const state = useSubscription<Task>(
    userId ? `all-tasks:${userId}:${nonce}` : null,
    subscribe,
    'We could not load your tasks.',
  );

  return useMemo(() => ({ ...state, refresh }), [state, refresh]);
}
