import { useCallback, useEffect, useMemo, useState } from 'react';

import type { GithubSnapshot } from '@/types';
import { getFriendlyError } from '@/utils/errors';
import { clearGithubCache, fetchGithubSnapshot, normaliseUsername } from '@/services/github/githubService';

export interface UseGithubUserResult {
  data: GithubSnapshot | null;
  loading: boolean;
  error: string | null;
  /** Fetches again, bypassing the in-memory/session cache. */
  refresh: () => void;
}

interface Snapshot {
  /** `username#nonce` identifies the request the data belongs to. */
  key: string;
  data: GithubSnapshot | null;
  error: string | null;
}

const IDLE: Snapshot = { key: '', data: null, error: null };

/**
 * Loads a GitHub profile + repositories whenever `username` changes.
 * Pass `null` to stay idle (e.g. when the user has not connected an account).
 *
 * Results are stored against the request key, so a new username or a manual
 * refresh reports `loading` during render rather than through a state update
 * inside the effect body.
 */
export function useGithubUser(username: string | null): UseGithubUserResult {
  const normalised = username ? normaliseUsername(username) : '';
  const [nonce, setNonce] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot>(IDLE);

  const key = normalised ? `${normalised}#${nonce}` : '';
  const errorMessage = normalised ? `We could not load the GitHub profile “${normalised}”.` : '';

  useEffect(() => {
    if (!normalised) return;

    const controller = new AbortController();
    let active = true;

    fetchGithubSnapshot(normalised, controller.signal)
      .then((result) => {
        if (!active) return;
        setSnapshot({ key, data: result.data, error: null });
      })
      .catch((fetchError: unknown) => {
        if (!active) return;
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
        if (fetchError instanceof Error && fetchError.name === 'AbortError') return;
        setSnapshot({ key, data: null, error: getFriendlyError(fetchError, errorMessage) });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [normalised, key, errorMessage]);

  const refresh = useCallback(() => {
    if (normalised) clearGithubCache(normalised);
    setNonce((value) => value + 1);
  }, [normalised]);

  return useMemo(() => {
    if (!key) return { data: null, loading: false, error: null, refresh };
    if (snapshot.key !== key) return { data: null, loading: true, error: null, refresh };
    return { data: snapshot.data, loading: false, error: snapshot.error, refresh };
  }, [key, snapshot, refresh]);
}
