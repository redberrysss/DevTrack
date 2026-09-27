import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { AppRoutes } from '@/routes/AppRoutes';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { ToastProvider } from '@/contexts/ToastProvider';
import { AuthProvider } from '@/contexts/AuthProvider';

/**
 * Firebase is configured, but nobody is signed in. This exercises the real
 * route guards and the real auth screens with only the network layer stubbed.
 */
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, next: (user: unknown) => void) => {
    next(null);
    return () => undefined;
  },
}));

vi.mock('@/services/firebase/config', () => ({
  firebaseConfigured: true,
  FIREBASE_NOT_CONFIGURED_MESSAGE: 'not configured',
  firebaseAuth: () => ({}),
  requireAuth: () => ({}),
  firestore: () => ({}),
  requireFirestore: () => ({}),
  firebaseStorage: () => ({}),
}));

const authCalls = vi.hoisted(() => ({
  signIn: vi.fn(async () => ({ user: { uid: 'u1' } })),
  register: vi.fn(async () => ({ user: { uid: 'u1' } })),
  reset: vi.fn(async () => undefined),
}));

vi.mock('@/services/firebase/auth', () => ({
  signInWithEmail: authCalls.signIn,
  registerWithEmail: authCalls.register,
  requestPasswordReset: authCalls.reset,
  signOut: vi.fn(async () => undefined),
  resendVerificationEmail: vi.fn(async () => undefined),
  changePassword: vi.fn(async () => undefined),
  updateDisplayName: vi.fn(async () => undefined),
}));

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe('authentication screens', () => {
  it('redirects an anonymous visitor from the dashboard to the login screen', async () => {
    renderApp('/dashboard');
    expect(await screen.findByRole('heading', { name: /sign in to devtrack/i })).toBeInTheDocument();
  });

  it('validates the sign-in form before calling Firebase', async () => {
    const user = userEvent.setup();
    renderApp('/login');

    await user.click(await screen.findByRole('button', { name: /^sign in$/i }));

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(authCalls.signIn).not.toHaveBeenCalled();
  });

  it('signs in with valid credentials', async () => {
    const user = userEvent.setup();
    renderApp('/login');

    await user.type(await screen.findByLabelText(/email/i), 'sam@example.com');
    await user.type(await screen.findByLabelText(/password/i), 'hunter22');
    await user.click(await screen.findByRole('button', { name: /^sign in$/i }));

    expect(authCalls.signIn).toHaveBeenCalledWith('sam@example.com', 'hunter22');
  });

  it('shows a friendly message when Firebase rejects the credentials', async () => {
    const user = userEvent.setup();
    authCalls.signIn.mockRejectedValueOnce({ code: 'auth/wrong-password' });
    renderApp('/login');

    await user.type(await screen.findByLabelText(/email/i), 'sam@example.com');
    await user.type(await screen.findByLabelText(/password/i), 'hunter22');
    await user.click(await screen.findByRole('button', { name: /^sign in$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/does not match an account/i);
  });

  it('requires matching passwords on the registration screen', async () => {
    const user = userEvent.setup();
    renderApp('/register');

    await user.type(await screen.findByLabelText(/^name/i), 'Sam');
    await user.type(await screen.findByLabelText(/email/i), 'sam@example.com');
    await user.type(await screen.findByLabelText(/^password/i), 'hunter22');
    await user.type(await screen.findByLabelText(/confirm password/i), 'hunter23');
    await user.click(await screen.findByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(authCalls.register).not.toHaveBeenCalled();
  });

  it('rejects a weak password with an explanation', async () => {
    const user = userEvent.setup();
    renderApp('/register');

    await user.type(await screen.findByLabelText(/^name/i), 'Sam');
    await user.type(await screen.findByLabelText(/email/i), 'sam@example.com');
    await user.type(await screen.findByLabelText(/^password/i), 'short1');
    await user.type(await screen.findByLabelText(/confirm password/i), 'short1');
    await user.click(await screen.findByRole('button', { name: /create account/i }));

    expect(await screen.findAllByText(/at least 8 characters/i)).toHaveLength(2);
    expect(authCalls.register).not.toHaveBeenCalled();
  });

  it('sends a password reset email', async () => {
    const user = userEvent.setup();
    renderApp('/forgot-password');

    await user.type(await screen.findByLabelText(/email/i), 'sam@example.com');
    await user.click(await screen.findByRole('button', { name: /send reset link/i }));

    expect(authCalls.reset).toHaveBeenCalledWith('sam@example.com');
  });
});
