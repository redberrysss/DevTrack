export interface PageMeta {
  title: string;
  description?: string;
}

const MANAGED_ATTR = 'data-devtrack-seo';

function upsertMeta(selector: string, attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    element.setAttribute(MANAGED_ATTR, 'true');
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function readMeta(selector: string): string | null {
  return document.head.querySelector<HTMLMetaElement>(selector)?.getAttribute('content') ?? null;
}

/**
 * Applies document title + description tags for the current route.
 * Returns a cleanup function that restores the previous values on unmount.
 */
export function applyPageMeta({ title, description }: PageMeta): () => void {
  const previousTitle = document.title;
  const previousDescription = readMeta('meta[name="description"]');
  const previousOgTitle = readMeta('meta[property="og:title"]');
  const previousOgDescription = readMeta('meta[property="og:description"]');

  document.title = title;
  if (description) {
    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
  }

  return () => {
    document.title = previousTitle;
    if (previousDescription !== null) {
      upsertMeta('meta[name="description"]', 'name', 'description', previousDescription);
    }
    if (previousOgTitle !== null) upsertMeta('meta[property="og:title"]', 'property', 'og:title', previousOgTitle);
    if (previousOgDescription !== null)
      upsertMeta('meta[property="og:description"]', 'property', 'og:description', previousOgDescription);
  };
}
