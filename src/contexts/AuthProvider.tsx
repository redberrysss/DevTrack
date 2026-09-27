import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import type { Unsubscribe } from 'firebase/firestore';

import { AuthContext, type AuthContextValue, type AuthStatus } from './AuthContext';
import { firebaseAuth, firebaseConfigured } from '@/services/firebase/config';
import type { UserProfile, UserProfileData } from '@/types';
import { getFriendlyError } from '@/utils/errors';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    firebaseConfigured ? 'initialising' : 'unconfigured',
  );
  const [isProfileReady, setIsProfileReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const bootstrapped = useRef(false);
  /** Guards the async profile-module import against sign-out in between. */
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!firebaseConfigured) return;

    let profileUnsubscribe: Unsubscribe | null = null;
    let active = true;

    const authUnsubscribe = onAuthStateChanged(
      firebaseAuth(),
      (nextUser) => {
        if (!active) return;
        profileUnsubscribe?.();
        profileUnsubscribe = null;
        currentUserId.current = nextUser?.uid ?? null;
        setUser(nextUser);
        setProfile(null);
        setAuthError(null);
        bootstrapped.current = false;
        setIsProfileReady(false);

        if (!nextUser) {
          setStatus('unauthenticated');
          return;
        }

        setStatus('authenticated');

        // The profile module pulls in the Firestore SDK, so it is imported on
        // demand: a signed-out visitor never downloads it.
        void import('@/services/firebase/profile')
          .then(({ createUserProfile, subscribeToProfile }) => {
            // The import resolves asynchronously, so the session may have ended
            // (or changed user) in the meantime.
            if (!active || currentUserId.current !== nextUser.uid) return;
            const unsubscribe = subscribeToProfile(
              nextUser.uid,
              (nextProfile) => {
                if (!active) return;
                setProfile(nextProfile);
                setProfileError(null);
                setIsProfileReady(true);

                // Accounts created outside the app (e.g. Firebase console) get a
                // profile document the first time they sign in.
                if (!nextProfile && !bootstrapped.current) {
                  bootstrapped.current = true;
                  void createUserProfile(nextUser).catch((error: unknown) => {
                    if (!active) return;
                    setProfileError(getFriendlyError(error, 'We could not load your profile.'));
                  });
                }
              },
              (error) => {
                if (!active) return;
                setIsProfileReady(true);
                setProfileError(getFriendlyError(error, 'We could not load your profile.'));
              },
            );
            if (currentUserId.current === nextUser.uid) profileUnsubscribe = unsubscribe;
            else unsubscribe();
          })
          .catch((error: unknown) => {
            if (!active || currentUserId.current !== nextUser.uid) return;
            setIsProfileReady(true);
            setProfileError(getFriendlyError(error, 'We could not load your profile.'));
          });
      },
      (error) => {
        if (!active) return;
        setAuthError(getFriendlyError(error, 'We could not verify your session.'));
        setStatus('unauthenticated');
      },
    );

    return () => {
      active = false;
      authUnsubscribe();
      profileUnsubscribe?.();
    };
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const refreshProfile = useCallback(async () => {
    const currentUser = firebaseAuth().currentUser;
    if (!currentUser) return;
    setIsProfileReady(false);
    setProfileError(null);
    const { subscribeToProfile } = await import('@/services/firebase/profile');
    const unsubscribe = subscribeToProfile(
      currentUser.uid,
      (nextProfile) => {
        setProfile(nextProfile);
        setIsProfileReady(true);
        unsubscribe();
      },
      (error) => {
        setProfileError(getFriendlyError(error, 'We could not refresh your profile.'));
        setIsProfileReady(true);
        unsubscribe();
      },
    );
  }, []);

  const saveProfile = useCallback(async (changes: Partial<UserProfileData>) => {
    const currentUser = firebaseAuth().currentUser;
    if (!currentUser) throw new Error('You must be signed in to save your profile.');
    const { updateUserProfile } = await import('@/services/firebase/profile');
    await updateUserProfile(currentUser.uid, changes);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      status,
      isAuthenticated: status === 'authenticated' && user !== null,
      isProfileReady,
      authError,
      profileError,
      clearAuthError,
      refreshProfile,
      saveProfile,
    }),
    [user, profile, status, isProfileReady, authError, profileError, clearAuthError, refreshProfile, saveProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
