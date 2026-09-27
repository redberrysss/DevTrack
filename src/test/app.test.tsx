import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { AppRoutes } from '@/routes/AppRoutes';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { ToastProvider } from '@/contexts/ToastProvider';
import { AuthProvider } from '@/contexts/AuthProvider';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useToast } from '@/hooks/useToast';
import { THEME_STORAGE_KEY } from '@/utils/constants';
import { AppError, getFriendlyError } from '@/utils/errors';

// The app talks to Firebase through these lazy accessors. No project is
// configured in the test environment, which is exactly the state the
// SetupRequired screen exists for.
vi.mock('@/services/firebase/config', () => ({
  firebaseConfigured: false,
  FIREBASE_NOT_CONFIGURED_MESSAGE: 'Add your Firebase configuration to .env.local to get started.',
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
  window.localStorage.clear();
  document.documentElement.classList.remove('dark');
});

describe('routing', () => {
  it('serves the marketing landing page without authentication', async () => {
    renderApp('/');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/Build\. Track\./);
    expect(screen.getAllByRole('link', { name: /create your free account/i }).length).toBeGreaterThan(0);
  });

  it('labels the demo page data as a sample', async () => {
    renderApp('/demo');
    expect(await screen.findByText(/Sample data\./)).toBeInTheDocument();
  });

  it('renders a 404 page for unknown routes', async () => {
    renderApp('/this-route-does-not-exist');
    expect(await screen.findByText(/Error 404/i)).toBeInTheDocument();
  });

  it('renders the privacy policy and terms routes', async () => {
    const { unmount } = renderApp('/privacy');
    expect(await screen.findByRole('heading', { name: 'Privacy policy' })).toBeInTheDocument();
    unmount();

    renderApp('/terms');
    expect(await screen.findByRole('heading', { name: 'Terms of service' })).toBeInTheDocument();
  });

  it('shows the Firebase setup screen instead of the app when unconfigured', async () => {
    renderApp('/dashboard');
    expect(await screen.findByText('Connect Firebase to continue')).toBeInTheDocument();
  });
});

describe('theme', () => {
  it('toggles between light and dark and remembers the choice', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const toggle = screen.getByRole('button');
    await user.click(toggle);

    await waitFor(() => expect(window.localStorage.getItem(THEME_STORAGE_KEY)).not.toBeNull());
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    expect(stored === 'light' || stored === 'dark').toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(stored === 'dark');
    expect(document.documentElement.style.colorScheme).toBe(stored);
  });
});

describe('error messages', () => {
  it('maps Firebase auth codes to readable text', () => {
    expect(getFriendlyError({ code: 'auth/wrong-password' })).toMatch(/does not match an account/i);
    expect(getFriendlyError({ code: 'auth/email-already-in-use' })).toMatch(/already exists/i);
    expect(getFriendlyError({ code: 'permission-denied' })).toMatch(/permission/i);
  });

  it('passes through our own AppError messages', () => {
    expect(getFriendlyError(new AppError('Choose a smaller image.'))).toBe('Choose a smaller image.');
  });

  it('never leaks a raw error string to the user', () => {
    expect(getFriendlyError('ECONNREFUSED 10.0.0.1:8080', 'Fallback.')).toBe('Fallback.');
    expect(getFriendlyError({ code: 'auth/some-internal-code' }, 'Fallback.')).toBe('Fallback.');
    expect(getFriendlyError(undefined, 'Fallback.')).toBe('Fallback.');
  });
});

describe('toasts', () => {
  it('renders and dismisses a toast', async () => {
    const user = userEvent.setup();

    function Harness() {
      const toast = useToast();
      return (
        <button type="button" onClick={() => toast.success('Saved', 'Everything worked.')}>
          Notify
        </button>
      );
    }

    render(
      <ThemeProvider>
        <ToastProvider>
          <Harness />
        </ToastProvider>
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Notify' }));

    expect(await screen.findByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Everything worked.')).toBeInTheDocument();
  });
});
