import { describe, expect, it } from 'vitest';

/**
 * Guards against a build that silently compiles stale output.
 *
 * A `tsc` run that emits next to the sources creates `src/**\/*.js` files, and
 * Vite resolves `.js` before `.ts`/`.tsx` — so the app would be built from an
 * outdated copy of every module while the type-checker and the test run happily
 * read the real sources. The symptom is a bundle that no longer contains the
 * code you just wrote, with no error anywhere.
 */
const emitted = [
  ...Object.keys(import.meta.glob('/src/**/*.{js,jsx,js.map}')),
  ...Object.keys(import.meta.glob('/src/**/*.d.ts')),
];

const viteConfigs = Object.keys(import.meta.glob('/vite.config.*'));
const envFiles = Object.keys(import.meta.glob('/.env*')).filter(
  (file) => !file.endsWith('.env.example') && !file.endsWith('.example'),
);

describe('repository hygiene', () => {
  it('has no compiler output shadowing the TypeScript sources', () => {
    expect(emitted).toEqual([]);
  });

  it('has exactly one Vite config, so the one we type-check is the one Vite uses', () => {
    expect(viteConfigs).toEqual(['/vite.config.ts']);
  });

  it('has no committed environment file', () => {
    expect(envFiles).toEqual([]);
  });
});
