import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { PageLoader } from '@/components/ui/Loading';
import { SetupRequired } from '@/components/system/SetupRequired';

/**
 * Client-side route protection.
 *
 * The real authorisation boundary is `firestore.rules` — this guard only
 * avoids rendering screens for users that have no session.
 */
export function RequireAuth() {
  const { status, isAuthenticated } = useAuth();
  const location = useLocation();

  if (status === 'unconfigured') return <SetupRequired />;
  if (status === 'initialising') return <PageLoader label="Checking your session…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <Outlet />;
}

/** Keeps signed-in users out of the login/register screens. */
export function PublicOnly() {
  const { status, isAuthenticated } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  if (status === 'unconfigured') return <SetupRequired />;
  if (status === 'initialising') return <PageLoader label="Checking your session…" />;
  if (isAuthenticated) return <Navigate to={from && from !== '/login' ? from : '/dashboard'} replace />;

  return <Outlet />;
}
