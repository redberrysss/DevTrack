import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { resendVerificationEmail, signOut } from '@/services/firebase/auth';
import { getFriendlyError } from '@/utils/errors';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

/**
 * Authenticated application shell.
 *
 * Every page renders inside the same container (`max-w-6xl`) and the same page
 * header component, which is what keeps the product visually consistent.
 */
export function AppLayout() {
  const { user } = useAuth();
  const toast = useToast();
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast.success('Signed out', 'You have been logged out of DevTrack.');
    } catch (error) {
      toast.error('Could not sign out', getFriendlyError(error, 'Please try again.'));
    } finally {
      setSigningOut(false);
    }
  }, [toast]);

  const handleEmailVerification = useCallback(async () => {
    if (!user) return;
    try {
      await resendVerificationEmail(user);
      toast.success('Verification email sent', `Check ${user.email ?? 'your inbox'} for the link.`);
    } catch (error) {
      toast.error('Could not send the email', getFriendlyError(error, 'Please try again later.'));
    }
  }, [user, toast]);

  return (
    <div className="min-h-dvh bg-canvas">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Sidebar onLogout={handleLogout} onEmailVerification={handleEmailVerification} signingOut={signingOut} />

      <div className="lg:pl-64">
        <Topbar />
        <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
