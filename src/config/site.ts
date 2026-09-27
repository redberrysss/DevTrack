import { APP_NAME } from '@/utils/constants';

function readUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Public, non-secret deployment configuration.
 *
 * Social URLs come from environment variables so the project never ships
 * placeholder or dead external links. Anything left empty is simply not
 * rendered by the UI.
 */
export const siteConfig = {
  name: APP_NAME,
  tagline: 'Build. Track. Showcase.',
  description:
    'Manage your developer projects, track your progress, and showcase your GitHub development journey with DevTrack.',
  githubUrl: readUrl(import.meta.env.VITE_SITE_GITHUB_URL),
  linkedinUrl: readUrl(import.meta.env.VITE_SITE_LINKEDIN_URL),
  xUrl: readUrl(import.meta.env.VITE_SITE_X_URL),
  defaultGithubUsername: import.meta.env.VITE_GITHUB_USERNAME?.trim() || '',
  githubProxyUrl: import.meta.env.VITE_GITHUB_PROXY_URL?.trim() || '',
} as const;

export const productLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'GitHub', href: '/#github' },
  { label: 'Projects', href: '/#projects' },
  { label: 'About', href: '/#about' },
  { label: 'Live demo', href: '/demo' },
] as const;

export const legalLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
] as const;
