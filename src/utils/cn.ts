/**
 * Tiny class-name joiner. Keeps component APIs consistent without pulling in a
 * dependency, and de-duplicates repeated classes.
 */
export function cn(...values: Array<string | false | null | undefined>): string {
  const seen = new Set<string>();
  for (const value of values) {
    if (!value) continue;
    for (const token of value.split(/\s+/)) {
      if (token) seen.add(token);
    }
  }
  return Array.from(seen).join(' ');
}
