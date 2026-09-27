import { useEffect } from 'react';

import type { PageMeta } from '@/utils/seo';
import { applyPageMeta } from '@/utils/seo';

/** Keeps `document.title` and the meta description in sync with the route. */
export function usePageMeta({ title, description }: PageMeta): void {
  useEffect(() => {
    if (!title) return;
    return applyPageMeta({ title, description });
  }, [title, description]);
}
