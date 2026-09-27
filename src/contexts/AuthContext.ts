import { createContext } from 'react';
import type { User } from 'firebase/auth';

import type { UserProfile, UserProfileData } from '@/types';

export type AuthStatus = 'initialising' | 'authenticated' | 'unauthenticated' | 'unconfigured';

export interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  /** True once the Firestore profile document has been resolved. */
  isProfileReady: boolean;
  authError: string | null;
  profileError: string | null;
  clearAuthError: () => void;
  refreshProfile: () => Promise<void>;
  saveProfile: (changes: Partial<UserProfileData>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
